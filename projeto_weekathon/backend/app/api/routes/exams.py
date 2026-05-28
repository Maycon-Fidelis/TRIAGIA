import uuid
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, case, text

from app.database import get_db
from app.models.exam import Exam
from app.models.patient import Patient
from app.models.ai_result import AIResult
from app.schemas.exam import ExamResponse, ExamQueueItem
from app.services import storage_service, dicom_service
from app.tasks.celery_tasks import analyze_exam

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/exams", tags=["Exames"])

ALLOWED_EXTENSIONS = {".dcm", ".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"}
MAX_FILE_SIZE_MB = 50


@router.post("/", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
async def upload_exam(
    patient_id: str = Form(...),
    tipo_exame: str = Form(...),
    solicitante: Optional[str] = Form(None),
    observacoes: Optional[str] = Form(None),
    municipio_origem: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Faz upload de um exame radiológico (DICOM ou imagem).
    Inicia análise assíncrona de IA automaticamente após o upload.
    """
    # Valida paciente
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")

    # Valida extensão do arquivo
    suffix = f".{file.filename.rsplit('.', 1)[-1].lower()}" if "." in file.filename else ""
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato não suportado. Use: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Lê conteúdo do arquivo
    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=413, detail=f"Arquivo muito grande (máx {MAX_FILE_SIZE_MB}MB)")

    # Salva arquivo original
    abs_path, original_url = storage_service.save_original(file_bytes, file.filename)

    # Extrai metadados DICOM se aplicável
    dicom_meta = {}
    modalidade = None
    if dicom_service.is_dicom(abs_path):
        dicom_meta = dicom_service.extract_dicom_metadata(abs_path)
        modalidade = dicom_meta.get("modality")
        # Infere tipo de exame a partir do DICOM se não informado explicitamente
        if tipo_exame == "OUTRO" and dicom_meta:
            inferred = dicom_service.guess_exam_type_from_dicom(dicom_meta)
            if inferred:
                tipo_exame = inferred

    # Persiste exame no banco
    exam = Exam(
        patient_id=patient_id,
        tipo_exame=tipo_exame,
        modalidade=modalidade,
        arquivo_original_url=original_url,
        arquivo_url=original_url if suffix in {".jpg", ".jpeg", ".png"} else None,
        arquivo_nome=file.filename,
        status="AGUARDANDO",
        urgencia="ELETIVO",
        solicitante=solicitante,
        observacoes=observacoes,
        municipio_origem=municipio_origem,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    # Dispara análise assíncrona (não bloqueia a resposta)
    task = analyze_exam.apply_async(args=[str(exam.id)], queue="ai_analysis")
    exam.task_id = task.id
    db.commit()

    logger.info(f"Exame {exam.id} criado — task Celery: {task.id}")

    exam_with_relations = (
        db.query(Exam)
        .options(joinedload(Exam.patient), joinedload(Exam.ai_results))
        .filter(Exam.id == exam.id)
        .first()
    )
    return exam_with_relations


@router.get("/queue", response_model=list[ExamQueueItem])
def get_queue(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Retorna a fila de exames ordenada por urgência (CRÍTICO → PRIORITÁRIO → ELETIVO)
    e depois por data (mais antigos primeiro dentro do mesmo nível).
    """
    urgency_order = case(
        (Exam.urgencia == "CRITICO", 1),
        (Exam.urgencia == "PRIORITARIO", 2),
        else_=3,
    )

    query = (
        db.query(Exam)
        .options(joinedload(Exam.patient), joinedload(Exam.ai_results))
        .filter(Exam.status != "LAUDADO")
    )

    if status_filter:
        query = query.filter(Exam.status == status_filter.upper())

    exams = query.order_by(urgency_order, Exam.data_realizacao.asc()).all()

    result = []
    for exam in exams:
        latest_ai = exam.ai_results[-1] if exam.ai_results else None
        result.append(
            ExamQueueItem(
                id=exam.id,
                paciente_nome=exam.patient.nome if exam.patient else "—",
                paciente_municipio=exam.patient.municipio if exam.patient else None,
                tipo_exame=exam.tipo_exame,
                status=exam.status,
                urgencia=exam.urgencia,
                data_realizacao=exam.data_realizacao,
                arquivo_url=exam.arquivo_url,
                ia_confianca=latest_ai.confianca if latest_ai else None,
                ia_urgencia=latest_ai.urgencia_sugerida if latest_ai else None,
                ia_achados=latest_ai.achados if latest_ai else None,
            )
        )
    return result


@router.get("/{exam_id}", response_model=ExamResponse)
def get_exam(exam_id: uuid.UUID, db: Session = Depends(get_db)):
    """Retorna detalhes completos de um exame com resultado da IA."""
    exam = (
        db.query(Exam)
        .options(joinedload(Exam.patient), joinedload(Exam.ai_results), joinedload(Exam.reports))
        .filter(Exam.id == exam_id)
        .first()
    )
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    return exam


@router.get("/", response_model=list[ExamResponse])
def list_exams(
    patient_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    urgencia: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Lista exames com filtros opcionais."""
    query = db.query(Exam).options(joinedload(Exam.patient), joinedload(Exam.ai_results))

    if patient_id:
        query = query.filter(Exam.patient_id == patient_id)
    if status_filter:
        query = query.filter(Exam.status == status_filter.upper())
    if urgencia:
        query = query.filter(Exam.urgencia == urgencia.upper())

    urgency_order = case(
        (Exam.urgencia == "CRITICO", 1),
        (Exam.urgencia == "PRIORITARIO", 2),
        else_=3,
    )
    return query.order_by(urgency_order, desc(Exam.data_realizacao)).offset(skip).limit(limit).all()


@router.get("/{exam_id}/status")
def get_exam_status(exam_id: uuid.UUID, db: Session = Depends(get_db)):
    """Endpoint de polling para verificar status da análise de IA."""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    return {"status": exam.status, "urgencia": exam.urgencia}

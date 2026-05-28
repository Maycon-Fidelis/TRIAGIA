import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.report import Report
from app.models.exam import Exam
from app.schemas.report import ReportCreate, ReportResponse

router = APIRouter(prefix="/reports", tags=["Laudos"])


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(data: ReportCreate, db: Session = Depends(get_db)):
    """Salva laudo do radiologista e finaliza o exame."""
    exam = db.query(Exam).filter(Exam.id == data.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado")

    report = Report(**data.model_dump())
    db.add(report)

    # Atualiza urgência final e status do exame
    exam.urgencia = data.urgencia_final
    exam.status = "LAUDADO"
    db.commit()
    db.refresh(report)
    return report


@router.get("/exam/{exam_id}", response_model=list[ReportResponse])
def get_reports_for_exam(exam_id: uuid.UUID, db: Session = Depends(get_db)):
    """Retorna todos os laudos de um exame."""
    return db.query(Report).filter(Report.exam_id == exam_id).order_by(Report.created_at.desc()).all()


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: uuid.UUID, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Laudo não encontrado")
    return report

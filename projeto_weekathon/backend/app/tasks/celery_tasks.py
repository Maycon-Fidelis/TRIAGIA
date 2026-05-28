"""
Tasks Celery para processamento assíncrono de exames.
A UI envia o exame → API persiste → dispara task → worker analisa → atualiza DB.
"""

import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.tasks.celery_app import celery_app
from app.database import SessionLocal
from app.models.exam import Exam
from app.models.ai_result import AIResult
from app.services import ai_service, storage_service, dicom_service

logger = logging.getLogger(__name__)


@celery_app.task(
    bind=True,
    name="app.tasks.celery_tasks.analyze_exam",
    max_retries=2,
    default_retry_delay=30,
)
def analyze_exam(self, exam_id: str):
    """
    Pipeline completo de análise de um exame:
    1. Carrega exame do banco
    2. Converte DICOM → PNG (se necessário)
    3. Executa inferência de IA
    4. Persiste resultado no banco
    5. Atualiza urgência do exame
    """
    logger.info(f"[{exam_id}] Iniciando análise de exame")
    db: Session = SessionLocal()

    try:
        # 1. Busca exame
        exam: Exam = db.query(Exam).filter(Exam.id == exam_id).first()
        if not exam:
            logger.error(f"[{exam_id}] Exame não encontrado")
            return {"error": "Exame não encontrado"}

        # 2. Marca como processando
        exam.status = "PROCESSANDO"
        db.commit()

        # 3. Resolve caminho do arquivo
        image_path = None
        if exam.arquivo_original_url:
            abs_path = storage_service.get_absolute_path(exam.arquivo_original_url)

            # Se for DICOM, converte para PNG primeiro
            if dicom_service.is_dicom(abs_path):
                logger.info(f"[{exam_id}] Convertendo DICOM → PNG")
                png_path = abs_path.replace("/originals/", "/processed/").rsplit(".", 1)[0] + ".png"
                dicom_service.dicom_to_png(abs_path, png_path)
                image_path = png_path

                # Atualiza URL da imagem convertida
                rel_url = png_path.replace(storage_service.settings.storage_path, "/storage")
                exam.arquivo_url = rel_url
                db.commit()
            else:
                image_path = abs_path

        if not image_path:
            raise ValueError("Arquivo de imagem não encontrado")

        # 4. Executa IA
        logger.info(f"[{exam_id}] Executando análise de IA (modo: {ai_service.settings.ai_mode})")
        result = ai_service.analyze_image(image_path, exam.tipo_exame)
        logger.info(f"[{exam_id}] Resultado: {result['urgencia']} (confiança: {result['confianca']:.2%})")

        # 5. Persiste resultado da IA
        ai_record = AIResult(
            exam_id=exam.id,
            modelo_ia=result["modelo"],
            versao_modelo=result["versao"],
            urgencia_sugerida=result["urgencia"],
            confianca=result["confianca"],
            achados=result["achados"],
            score_bruto=result["score_bruto"],
            tempo_processamento_ms=result["tempo_ms"],
        )
        db.add(ai_record)

        # 6. Atualiza urgência e status do exame
        exam.urgencia = result["urgencia"]
        exam.status = "ANALISADO"
        exam.data_analise_ia = datetime.now(timezone.utc)

        db.commit()
        logger.info(f"[{exam_id}] Análise concluída com sucesso")
        return {"exam_id": exam_id, "urgencia": result["urgencia"]}

    except Exception as exc:
        logger.error(f"[{exam_id}] Erro na análise: {exc}", exc_info=True)
        db.rollback()

        # Marca exame como ERRO no banco
        try:
            exam = db.query(Exam).filter(Exam.id == exam_id).first()
            if exam:
                exam.status = "ERRO"
                db.commit()
        except Exception:
            pass

        raise self.retry(exc=exc)

    finally:
        db.close()

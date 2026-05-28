from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.database import get_db
from app.models.exam import Exam
from app.models.ai_result import AIResult

router = APIRouter(prefix="/stats", tags=["Estatísticas"])


@router.get("/dashboard")
def dashboard_stats(db: Session = Depends(get_db)):
    """Retorna estatísticas para os cards do dashboard."""
    total = db.query(func.count(Exam.id)).scalar()
    criticos = db.query(func.count(Exam.id)).filter(Exam.urgencia == "CRITICO", Exam.status != "LAUDADO").scalar()
    prioritarios = db.query(func.count(Exam.id)).filter(Exam.urgencia == "PRIORITARIO", Exam.status != "LAUDADO").scalar()
    eletivos = db.query(func.count(Exam.id)).filter(Exam.urgencia == "ELETIVO", Exam.status != "LAUDADO").scalar()
    aguardando = db.query(func.count(Exam.id)).filter(Exam.status == "AGUARDANDO").scalar()
    processando = db.query(func.count(Exam.id)).filter(Exam.status == "PROCESSANDO").scalar()
    laudados = db.query(func.count(Exam.id)).filter(Exam.status == "LAUDADO").scalar()

    # Taxa de concordância IA x radiologista
    from app.models.report import Report
    total_reports = db.query(func.count(Report.id)).scalar()
    concordam = db.query(func.count(Report.id)).filter(Report.confirma_ia == True).scalar()
    taxa_concordancia = round(concordam / total_reports * 100, 1) if total_reports > 0 else None

    # Tempo médio de análise (ms)
    avg_time = db.query(func.avg(AIResult.tempo_processamento_ms)).scalar()

    return {
        "total_exames": total,
        "fila": {
            "criticos": criticos,
            "prioritarios": prioritarios,
            "eletivos": eletivos,
        },
        "status": {
            "aguardando": aguardando,
            "processando": processando,
            "laudados": laudados,
        },
        "ia": {
            "taxa_concordancia_pct": taxa_concordancia,
            "tempo_medio_analise_ms": round(avg_time) if avg_time else None,
        },
    }

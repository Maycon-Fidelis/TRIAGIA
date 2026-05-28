from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid
from app.schemas.patient import PatientResponse
from app.schemas.ai_result import AIResultResponse


class ExamCreate(BaseModel):
    patient_id: uuid.UUID
    tipo_exame: str
    solicitante: Optional[str] = None
    observacoes: Optional[str] = None
    municipio_origem: Optional[str] = None


class ExamResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    patient: Optional[PatientResponse] = None
    tipo_exame: str
    modalidade: Optional[str] = None
    arquivo_url: Optional[str] = None
    status: str
    urgencia: str
    data_realizacao: datetime
    data_analise_ia: Optional[datetime] = None
    solicitante: Optional[str] = None
    observacoes: Optional[str] = None
    municipio_origem: Optional[str] = None
    ai_results: list[AIResultResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ExamQueueItem(BaseModel):
    id: uuid.UUID
    paciente_nome: str
    paciente_municipio: Optional[str] = None
    tipo_exame: str
    status: str
    urgencia: str
    data_realizacao: datetime
    arquivo_url: Optional[str] = None
    ia_confianca: Optional[float] = None
    ia_urgencia: Optional[str] = None
    ia_achados: Optional[list] = None

    model_config = {"from_attributes": True}

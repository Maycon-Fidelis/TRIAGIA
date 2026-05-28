from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any
import uuid


class Finding(BaseModel):
    descricao: str
    confianca: float
    regiao: str
    severidade: str  # "alta", "media", "baixa"


class AIResultResponse(BaseModel):
    id: uuid.UUID
    exam_id: uuid.UUID
    modelo_ia: str
    versao_modelo: Optional[str] = None
    urgencia_sugerida: str
    confianca: float
    achados: list[dict]
    score_bruto: Optional[float] = None
    tempo_processamento_ms: Optional[int] = None
    imagem_processada_url: Optional[str] = None
    metadata_dicom: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}

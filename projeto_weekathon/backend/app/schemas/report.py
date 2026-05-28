from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid


class ReportCreate(BaseModel):
    exam_id: uuid.UUID
    radiologist_name: str
    crm: Optional[str] = None
    laudo: str
    urgencia_final: str
    confirma_ia: Optional[bool] = None


class ReportResponse(BaseModel):
    id: uuid.UUID
    exam_id: uuid.UUID
    radiologist_name: str
    crm: Optional[str] = None
    laudo: str
    urgencia_final: str
    confirma_ia: Optional[bool] = None
    data_laudo: datetime
    created_at: datetime

    model_config = {"from_attributes": True}

from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional
import uuid


class PatientCreate(BaseModel):
    nome: str
    cpf: Optional[str] = None
    data_nascimento: Optional[date] = None
    sexo: Optional[str] = None
    telefone: Optional[str] = None
    municipio: Optional[str] = None

    @field_validator("cpf")
    @classmethod
    def validar_cpf(cls, v):
        if v and len(v.replace(".", "").replace("-", "")) != 11:
            raise ValueError("CPF deve ter 11 dígitos")
        return v.replace(".", "").replace("-", "") if v else None

    @field_validator("sexo")
    @classmethod
    def validar_sexo(cls, v):
        if v and v.upper() not in ("M", "F"):
            raise ValueError("Sexo deve ser M ou F")
        return v.upper() if v else None


class PatientResponse(BaseModel):
    id: uuid.UUID
    nome: str
    cpf: Optional[str] = None
    data_nascimento: Optional[date] = None
    sexo: Optional[str] = None
    telefone: Optional[str] = None
    municipio: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

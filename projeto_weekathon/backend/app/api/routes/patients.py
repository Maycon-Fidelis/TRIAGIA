from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import uuid

from app.database import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientResponse

router = APIRouter(prefix="/patients", tags=["Pacientes"])


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(data: PatientCreate, db: Session = Depends(get_db)):
    """Cadastra um novo paciente."""
    if data.cpf:
        existing = db.query(Patient).filter(Patient.cpf == data.cpf).first()
        if existing:
            raise HTTPException(status_code=409, detail="CPF já cadastrado")

    patient = Patient(**data.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/", response_model=list[PatientResponse])
def list_patients(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Lista pacientes com busca opcional por nome ou CPF."""
    query = db.query(Patient)
    if search:
        query = query.filter(
            Patient.nome.ilike(f"%{search}%") | Patient.cpf.like(f"%{search}%")
        )
    return query.order_by(Patient.nome).offset(skip).limit(limit).all()


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    """Retorna dados de um paciente."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return patient

from sqlalchemy import Column, String, Date, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(255), nullable=False)
    cpf = Column(String(11), unique=True, nullable=True)
    data_nascimento = Column(Date, nullable=True)
    sexo = Column(String(1), nullable=True)
    telefone = Column(String(20), nullable=True)
    municipio = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    exams = relationship("Exam", back_populates="patient", cascade="all, delete-orphan")

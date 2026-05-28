from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

urgencia_enum = ENUM("CRITICO", "PRIORITARIO", "ELETIVO", name="urgencia_level", create_type=False)
status_enum = ENUM("AGUARDANDO", "PROCESSANDO", "ANALISADO", "LAUDADO", "ERRO", name="exam_status", create_type=False)
tipo_enum = ENUM(
    "RX_TORAX", "RX_COLUNA", "RX_MEMBROS", "RX_ABDOME", "RX_CRANIO",
    "TC_CRANIO", "TC_TORAX", "TC_ABDOME", "TC_COLUNA",
    "RM_CRANIO", "RM_COLUNA", "RM_JOELHO", "OUTRO",
    name="exam_type", create_type=False,
)


class Exam(Base):
    __tablename__ = "exams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)

    tipo_exame = Column(tipo_enum, nullable=False)
    modalidade = Column(String(10), nullable=True)

    arquivo_url = Column(Text, nullable=True)           # imagem convertida (PNG)
    arquivo_original_url = Column(Text, nullable=True)  # arquivo original
    arquivo_nome = Column(String(255), nullable=True)

    status = Column(status_enum, default="AGUARDANDO")
    urgencia = Column(urgencia_enum, default="ELETIVO")

    data_realizacao = Column(DateTime(timezone=True), server_default=func.now())
    data_analise_ia = Column(DateTime(timezone=True), nullable=True)

    solicitante = Column(String(255), nullable=True)
    observacoes = Column(Text, nullable=True)
    municipio_origem = Column(String(100), nullable=True)
    task_id = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="exams")
    ai_results = relationship("AIResult", back_populates="exam", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="exam", cascade="all, delete-orphan")

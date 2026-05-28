from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

urgencia_enum = ENUM("CRITICO", "PRIORITARIO", "ELETIVO", name="urgencia_level", create_type=False)


class AIResult(Base):
    __tablename__ = "ai_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)

    modelo_ia = Column(String(100), nullable=False)
    versao_modelo = Column(String(20), nullable=True)

    urgencia_sugerida = Column(urgencia_enum, nullable=False)
    confianca = Column(Float, nullable=False)
    achados = Column(JSONB, default=list)
    score_bruto = Column(Float, nullable=True)
    tempo_processamento_ms = Column(Integer, nullable=True)

    imagem_processada_url = Column(Text, nullable=True)
    metadata_dicom = Column(JSONB, default=dict)
    metadata_modelo = Column(JSONB, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    exam = relationship("Exam", back_populates="ai_results")

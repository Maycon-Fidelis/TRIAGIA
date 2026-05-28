from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

urgencia_enum = ENUM("CRITICO", "PRIORITARIO", "ELETIVO", name="urgencia_level", create_type=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)

    radiologist_name = Column(String(255), nullable=False)
    crm = Column(String(30), nullable=True)
    laudo = Column(Text, nullable=False)
    urgencia_final = Column(urgencia_enum, nullable=False)
    confirma_ia = Column(Boolean, nullable=True)
    data_laudo = Column(DateTime(timezone=True), server_default=func.now())

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    exam = relationship("Exam", back_populates="reports")

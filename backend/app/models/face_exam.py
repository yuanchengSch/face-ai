from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class FaceExam(Base):
    __tablename__ = "face_exams"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.id"))
    
    image_url = Column(String)
    thumbnail_url = Column(String, nullable=True)
    
    # 图片元信息
    image_hash = Column(String, nullable=True)  # MD5 hash
    image_width = Column(Integer, nullable=True)
    image_height = Column(Integer, nullable=True)
    
    # 处理状态: processing, done, failed
    status = Column(String, default="done")
    
    # Structured Analysis Results
    # JSON structure: { "skin_age": 26, "inflammation": 45, "hydration": 70, ... }
    metrics = Column(JSON) 
    
    # AI generated advice
    advice_summary = Column(Text)
    detailed_advice = Column(Text)  # 分区建议（护理/作息/饮食/风险提示）
    
    # Provider info (e.g., "MockAI", "DeepSeek-V3")
    ai_provider = Column(String, default="MockAI")
    
    # 医生确认流程
    doctor_confirmed = Column(Boolean, default=False)
    doctor_notes = Column(Text, nullable=True)  # 医生补充建议
    doctor_confirmed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", back_populates="exams")


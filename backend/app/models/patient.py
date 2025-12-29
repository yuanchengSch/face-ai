from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="consultant") # doctor, consultant

class Patient(Base):
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    gender = Column(String)
    phone = Column(String, index=True)
    age = Column(Integer)
    avatar = Column(String, nullable=True)
    
    # VIP / CRM info
    level = Column(String, default="Standard") # Standard, Silver, Gold, Platinum
    total_consumption = Column(Float, default=0.0)
    last_visit_at = Column(DateTime, nullable=True)
    
    # Medical info
    notes = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    exams = relationship("FaceExam", back_populates="patient")
    plans = relationship("Plan", back_populates="patient")
    surveys = relationship("Survey", back_populates="patient")
    timeline_events = relationship("TimelineEvent", back_populates="patient")

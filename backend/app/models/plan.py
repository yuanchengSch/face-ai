from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class Plan(Base):
    __tablename__ = "plans"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.id"))
    
    # Context
    generated_at_jieqi = Column(String) # e.g., "Dongzhi"
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    goal = Column(String) # e.g. "Stabilize and Hydrate"
    
    # Structure: [ { "phase": "Week 1-2", "actions": {...} }, ... ]
    phases = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", back_populates="plans")

class Survey(Base):
    __tablename__ = "surveys"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.id"))
    
    survey_type = Column(String) # "Health" or "Satisfaction"
    
    # JSON content of answers
    answers = Column(JSON)
    
    # Calculated Score
    score = Column(Integer)
    summary_advice = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", back_populates="surveys")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.id"))
    
    event_type = Column(String) # "Exam", "Plan", "Survey", "Visit", "Purchase"
    title = Column(String)
    description = Column(String, nullable=True)
    related_id = Column(Integer, nullable=True) # ID of the related Exam/Plan/Survey
    
    occurred_at = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", back_populates="timeline_events")

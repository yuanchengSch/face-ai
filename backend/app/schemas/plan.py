from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime

# Plan Schemas
class PlanBase(BaseModel):
    goal: str
    start_date: datetime
    end_date: datetime

class PlanCreate(PlanBase):
    patient_id: int
    generated_at_jieqi: str
    phases: List[Dict[str, Any]]

class Plan(PlanBase):
    id: int
    patient_id: int
    generated_at_jieqi: str
    phases: List[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        orm_mode = True

# Survey Schemas
class SurveyBase(BaseModel):
    survey_type: str # "Health", "Satisfaction"
    answers: Dict[str, Any]

class SurveyCreate(SurveyBase):
    patient_id: int

class Survey(SurveyBase):
    id: int
    patient_id: int
    score: Optional[int]
    summary_advice: Optional[str]
    created_at: datetime
    
    class Config:
        orm_mode = True

# Timeline Event Schema
class TimelineEventBase(BaseModel):
    event_type: str
    title: str
    description: Optional[str] = None
    related_id: Optional[int] = None

class TimelineEvent(TimelineEventBase):
    id: int
    patient_id: int
    occurred_at: datetime
    
    class Config:
        orm_mode = True

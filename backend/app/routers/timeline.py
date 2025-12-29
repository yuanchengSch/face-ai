from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.plan import TimelineEvent
from app.services.timeline_service import TimelineService

router = APIRouter()

@router.get("/", response_model=List[TimelineEvent])
def get_timeline(patient_id: int, db: Session = Depends(get_db)):
    """
    获取患者的全生命周期时间轴
    """
    return TimelineService.get_events(db, patient_id)

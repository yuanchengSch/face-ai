from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.plan import Plan, Survey, SurveyCreate
from app.services.plan_service import PlanService
from app.services.survey_service import SurveyService

router = APIRouter()

# --- Plan Router ---
@router.post("/plans", response_model=Plan)
def generate_plan(patient_id: int, db: Session = Depends(get_db)):
    """
    为指定患者生成新的个性化方案 (触发 AI + 节气逻辑)
    """
    service = PlanService()
    return service.generate_plan_for_patient(db, patient_id)

@router.get("/plans/latest", response_model=Plan)
def get_latest_plan(patient_id: int, db: Session = Depends(get_db)):
    """
    获取患者最新的方案
    """
    service = PlanService()
    plan = service.get_latest_plan(db, patient_id)
    if not plan:
        raise HTTPException(status_code=404, detail="No plan found")
    return plan

# --- Survey Router ---
@router.post("/surveys", response_model=Survey)
def submit_survey(survey: SurveyCreate, db: Session = Depends(get_db)):
    """
    提交问卷
    """
    return SurveyService.submit_survey(db, survey)

@router.get("/surveys", response_model=List[Survey])
def get_patient_surveys(patient_id: int, db: Session = Depends(get_db)):
    """
    获取患者问卷历史
    """
    return SurveyService.get_surveys(db, patient_id)

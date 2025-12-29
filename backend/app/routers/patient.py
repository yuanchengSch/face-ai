from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.patient import Patient, PatientCreate
from app.services.patient_service import PatientService

router = APIRouter()

@router.post("/", response_model=Patient)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    """
    创建新患者
    """
    return PatientService.create_patient(db=db, patient_in=patient)

@router.get("/", response_model=List[Patient])
def read_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="搜索姓名或手机号"),
    gender: Optional[str] = Query(None, description="性别筛选"),
    level: Optional[str] = Query(None, description="会员等级筛选"),
    db: Session = Depends(get_db)
):
    """
    获取患者列表，支持搜索和筛选
    """
    return PatientService.get_patients(
        db, skip=skip, limit=limit, search=search, gender=gender, level=level
    )

@router.get("/{patient_id}", response_model=Patient)
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    """
    获取特定患者详情
    """
    db_patient = PatientService.get_patient(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pydantic import BaseModel

from app.core.database import get_db
from app.models.patient import Patient
from app.models.face_exam import FaceExam
from app.utils.jieqi import JieqiUtils

router = APIRouter()

class DashboardStats(BaseModel):
    total_patients: int
    today_appointments: int
    new_patients_this_month: int
    conversion_rate: float

class PendingItem(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    type: str
    title: str
    due_date: str | None
    priority: str

class JieqiReminder(BaseModel):
    current_jieqi: str
    jieqi_date_range: str
    risk_tips: List[str]
    care_suggestions: List[str]
    patients_to_adjust: List[Dict[str, Any]]

class RiskAlert(BaseModel):
    patient_id: int
    patient_name: str
    risk_type: str
    change_value: float
    period: str

class DashboardResponse(BaseModel):
    stats: DashboardStats
    pending_items: List[PendingItem]
    jieqi_reminder: JieqiReminder
    risk_alerts: List[RiskAlert]


@router.get("/", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """获取工作台数据"""
    
    # 1. 统计数据
    total_patients = db.query(Patient).count()
    today_appointments = 8  # 模拟
    
    first_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0)
    new_patients_this_month = db.query(Patient).filter(
        Patient.created_at >= first_of_month
    ).count()
    
    stats = DashboardStats(
        total_patients=total_patients,
        today_appointments=today_appointments,
        new_patients_this_month=new_patients_this_month,
        conversion_rate=35.2
    )
    
    # 2. 待处理事项
    pending_items = []
    
    # 待随访
    seven_days_ago = datetime.now() - timedelta(days=7)
    patients_need_followup = db.query(Patient).filter(
        Patient.last_visit_at < seven_days_ago
    ).limit(3).all()
    
    for p in patients_need_followup:
        pending_items.append(PendingItem(
            id=p.id,
            patient_id=p.id,
            patient_name=p.full_name,
            type="follow_up",
            title=f"{p.full_name} 已超过7天未随访",
            due_date=(datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
            priority="medium"
        ))
    
    # 待确认的 AI 建议
    unconfirmed_exams = db.query(FaceExam).filter(
        FaceExam.doctor_confirmed == False
    ).limit(3).all()
    
    for exam in unconfirmed_exams:
        patient = db.query(Patient).filter(Patient.id == exam.patient_id).first()
        if patient:
            pending_items.append(PendingItem(
                id=exam.id,
                patient_id=exam.patient_id,
                patient_name=patient.full_name,
                type="confirm_ai",
                title=f"{patient.full_name} 的面诊结果待确认",
                due_date=None,
                priority="high"
            ))
    
    # 3. 节气提醒
    current_jieqi = JieqiUtils.get_current_jieqi()
    jieqi_advice = JieqiUtils.get_advice_for_jieqi(current_jieqi)
    
    patients_to_adjust = []
    active_patients = db.query(Patient).limit(2).all()
    for p in active_patients:
        patients_to_adjust.append({
            "id": p.id,
            "name": p.full_name,
            "reason": f"进入{current_jieqi}，建议调整护理强度"
        })
    
    jieqi_reminder = JieqiReminder(
        current_jieqi=current_jieqi,
        jieqi_date_range=jieqi_advice.get("date_range", ""),
        risk_tips=jieqi_advice.get("risks", []),
        care_suggestions=jieqi_advice.get("suggestions", []),
        patients_to_adjust=patients_to_adjust
    )
    
    # 4. 风险警报
    risk_alerts = []
    if total_patients > 0:
        first_patient = db.query(Patient).first()
        if first_patient:
            risk_alerts.append(RiskAlert(
                patient_id=first_patient.id,
                patient_name=first_patient.full_name,
                risk_type="inflammation_up",
                change_value=15.5,
                period="7d"
            ))
    
    return DashboardResponse(
        stats=stats,
        pending_items=pending_items,
        jieqi_reminder=jieqi_reminder,
        risk_alerts=risk_alerts
    )

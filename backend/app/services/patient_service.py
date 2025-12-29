from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.schemas.patient import PatientCreate
from app.services.timeline_service import TimelineService

class PatientService:
    @staticmethod
    def create_patient(db: Session, patient_in: PatientCreate):
        """
        创建新患者档案
        """
        db_patient = Patient(
            full_name=patient_in.full_name,
            gender=patient_in.gender,
            phone=patient_in.phone,
            age=patient_in.age,
            avatar=patient_in.avatar,
            level=patient_in.level or "Standard",
            notes=patient_in.notes
        )
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        
        # 记录创建事件
        TimelineService.add_event(
            db=db,
            patient_id=db_patient.id,
            event_type="System",
            title="建立客患档案",
            description="新用户注册建档"
        )
        
        return db_patient

    @staticmethod
    def get_patient(db: Session, patient_id: int):
        return db.query(Patient).filter(Patient.id == patient_id).first()

    @staticmethod
    def get_patients(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: str | None = None,
        gender: str | None = None,
        level: str | None = None
    ):
        query = db.query(Patient)
        
        # 搜索：姓名或手机号模糊匹配
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Patient.full_name.ilike(search_pattern)) |
                (Patient.phone.ilike(search_pattern))
            )
        
        # 性别筛选
        if gender:
            query = query.filter(Patient.gender == gender)
        
        # 会员等级筛选
        if level:
            query = query.filter(Patient.level == level)
        
        return query.offset(skip).limit(limit).all()

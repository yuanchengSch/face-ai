from sqlalchemy.orm import Session
from datetime import datetime
from app.models.face_exam import FaceExam
from app.ai.base import BaseAIProvider
from app.ai.mock_provider import MockAIProvider
from app.services.timeline_service import TimelineService
from typing import Optional, Dict, Any

class FaceExamService:
    def __init__(self, ai_provider: BaseAIProvider = None):
        # 默认使用 MockProvider，后续可注入 DeepSeekProvider
        self.ai_provider = ai_provider or MockAIProvider()

    def create_exam(
        self, 
        db: Session, 
        patient_id: int, 
        image_url: str,
        image_metadata: Optional[Dict[str, Any]] = None
    ):
        """
        创建新的面容诊断：
        1. 获取上一次诊断记录（用于保持Mock数据连续性）
        2. 调用 AI Provider 分析图片
        3. 保存诊断结果到数据库
        4. 添加 Timeline 事件
        """
        # 1. 获取上下文 (上一次的指标)
        last_exam = db.query(FaceExam).filter(FaceExam.patient_id == patient_id)\
            .order_by(FaceExam.created_at.desc()).first()
        
        context = {}
        if last_exam and last_exam.metrics:
            context["last_metrics"] = last_exam.metrics
            
        # 2. AI 分析
        analysis_result = self.ai_provider.analyze_face(image_url, context)
        
        # 3. 保存结果（包括图片元信息）
        db_exam = FaceExam(
            patient_id=patient_id,
            image_url=image_url,
            image_hash=image_metadata.get("hash") if image_metadata else None,
            image_width=image_metadata.get("width") if image_metadata else None,
            image_height=image_metadata.get("height") if image_metadata else None,
            metrics=analysis_result["metrics"],
            advice_summary=analysis_result["advice_summary"],
            detailed_advice=analysis_result["detailed_advice"],
            ai_provider=analysis_result.get("ai_provider", "Unknown")
        )
        db.add(db_exam)
        db.commit()
        db.refresh(db_exam)
        
        # 4. 记录到时间轴
        TimelineService.add_event(
            db=db, 
            patient_id=patient_id, 
            event_type="FaceExam",
            title="完成面容智能诊断",
            description=f"AI 分析完成，肤质年龄评估为 {analysis_result['metrics'].get('skin_age')} 岁",
            related_id=db_exam.id
        )
        
        return db_exam

    def confirm_exam(
        self, 
        db: Session, 
        exam_id: int, 
        doctor_notes: Optional[str] = None
    ) -> Optional[FaceExam]:
        """
        医生确认诊断结果
        """
        exam = db.query(FaceExam).filter(FaceExam.id == exam_id).first()
        if not exam:
            return None
        
        exam.doctor_confirmed = True
        exam.doctor_confirmed_at = datetime.now()
        if doctor_notes:
            exam.doctor_notes = doctor_notes
        
        db.commit()
        db.refresh(exam)
        
        # 记录到时间轴
        TimelineService.add_event(
            db=db,
            patient_id=exam.patient_id,
            event_type="DoctorConfirm",
            title="医生确认诊断结果",
            description=f"医生已确认面诊结果" + (f"，备注：{doctor_notes}" if doctor_notes else ""),
            related_id=exam.id
        )
        
        return exam

    def get_latest(self, db: Session, patient_id: int):
        return db.query(FaceExam).filter(FaceExam.patient_id == patient_id)\
            .order_by(FaceExam.created_at.desc()).first()

    def get_history(self, db: Session, patient_id: int):
        return db.query(FaceExam).filter(FaceExam.patient_id == patient_id)\
            .order_by(FaceExam.created_at.desc()).all()

from sqlalchemy.orm import Session
from app.models.plan import TimelineEvent
from app.schemas.plan import TimelineEventBase

class TimelineService:
    @staticmethod
    def add_event(db: Session, patient_id: int, event_type: str, title: str, description: str = None, related_id: int = None):
        """
        添加时间轴事件
        """
        event = TimelineEvent(
            patient_id=patient_id,
            event_type=event_type,
            title=title,
            description=description,
            related_id=related_id
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def get_events(db: Session, patient_id: int, limit: int = 20):
        """
        获取患者的时间轴
        """
        return db.query(TimelineEvent).filter(TimelineEvent.patient_id == patient_id)\
            .order_by(TimelineEvent.occurred_at.desc()).limit(limit).all()

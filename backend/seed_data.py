"""
演示数据种子脚本
运行: python seed_data.py
"""
import sys
sys.path.insert(0, '.')

from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine
from app.models.base import Base
from app.models.patient import Patient, User
from app.models.face_exam import FaceExam
from app.models.plan import Plan, Survey, TimelineEvent
import json

# 创建所有表
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    try:
        # 检查是否已有数据
        existing = db.query(Patient).first()
        if existing:
            print("数据库已有数据，跳过种子数据创建")
            return
        
        # 创建演示患者
        patients_data = [
            {
                "full_name": "李安娜",
                "gender": "女",
                "phone": "13800138001",
                "age": 28,
                "level": "Platinum",
                "total_consumption": 58000.0,
                "notes": "VIP客户，对痛感敏感，偏好温和型护理产品",
                "last_visit_at": datetime.now() - timedelta(days=3)
            },
            {
                "full_name": "王小雨",
                "gender": "女",
                "phone": "13912345678",
                "age": 24,
                "level": "Standard",
                "total_consumption": 1200.0,
                "notes": "新客户，皮肤偏油，有轻微痘痘问题",
                "last_visit_at": datetime.now() - timedelta(days=7)
            },
            {
                "full_name": "张敏",
                "gender": "女",
                "phone": "13700000000",
                "age": 35,
                "level": "Gold",
                "total_consumption": 25000.0,
                "notes": "长期客户，关注抗衰老项目",
                "last_visit_at": datetime.now() - timedelta(days=1)
            },
            {
                "full_name": "陈思思",
                "gender": "女",
                "phone": "13600001111",
                "age": 32,
                "level": "Silver",
                "total_consumption": 8500.0,
                "notes": "敏感肌，需要特别注意产品选择",
                "last_visit_at": datetime.now() - timedelta(days=14)
            },
            {
                "full_name": "刘婷婷",
                "gender": "女",
                "phone": "13900002222",
                "age": 26,
                "level": "Standard",
                "total_consumption": 3200.0,
                "notes": "干性皮肤，需要加强保湿",
                "last_visit_at": datetime.now() - timedelta(days=5)
            }
        ]
        
        patients = []
        for p_data in patients_data:
            patient = Patient(**p_data)
            db.add(patient)
            patients.append(patient)
        
        db.commit()
        
        # 为第一个患者添加面容诊断记录
        exam1 = FaceExam(
            patient_id=patients[0].id,
            image_url="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
            metrics=json.dumps({
                "skin_age": 26,
                "hydration": 72,
                "inflammation": 18,
                "pigmentation": 25,
                "wrinkles": 12,
                "elasticity": 85
            }),
            advice_summary="整体肤质良好，水润度适中，建议加强抗氧化护理",
            detailed_advice="1. 每日使用含透明质酸的保湿精华\n2. 每周进行2次深层清洁面膜\n3. 注意防晒，避免色素沉着加重\n4. 可考虑光子嫩肤项目维持肤质"
        )
        db.add(exam1)
        
        # 添加时间轴事件
        events = [
            TimelineEvent(
                patient_id=patients[0].id,
                event_type="face_exam",
                title="完成面容诊断",
                description="AI 分析显示肤质良好，炎症风险较低",
                occurred_at=datetime.now() - timedelta(days=3)
            ),
            TimelineEvent(
                patient_id=patients[0].id,
                event_type="plan",
                title="生成冬至节气方案",
                description="根据冬至节气特点定制护理方案",
                occurred_at=datetime.now() - timedelta(days=2)
            ),
            TimelineEvent(
                patient_id=patients[0].id,
                event_type="purchase",
                title="购买舒缓修复套餐",
                description="含积雪草精华、修复面膜等产品",
                occurred_at=datetime.now() - timedelta(days=1)
            )
        ]
        for event in events:
            db.add(event)
        
        db.commit()
        print(f"✅ 成功创建 {len(patients)} 个演示患者")
        print(f"✅ 成功创建 1 条面容诊断记录")
        print(f"✅ 成功创建 {len(events)} 条时间轴事件")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()

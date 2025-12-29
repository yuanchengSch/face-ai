from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.core.database import engine
from app.models.base import Base

# 导入所有模型以确保它们被注册到 Base.metadata
from app.models.patient import Patient, User
from app.models.face_exam import FaceExam
from app.models.plan import Plan, Survey, TimelineEvent

from app.routers import patient, face_exam, plan, timeline, dashboard, auth, ai

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 确保上传目录存在
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Face AI SaaS API for Aesthetic Management",
    version="1.0.0",
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务 - 提供上传图片访问
app.mount("/static/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.get("/")
def root():
    return {"message": "Welcome to Face AI SaaS API", "status": "running"}

# 路由注册
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(patient.router, prefix=f"{settings.API_V1_STR}/patients", tags=["patients"])
app.include_router(face_exam.router, prefix=f"{settings.API_V1_STR}/face-exams", tags=["face-exams"])
app.include_router(plan.router, prefix=f"{settings.API_V1_STR}", tags=["plans & surveys"])
app.include_router(timeline.router, prefix=f"{settings.API_V1_STR}/timeline", tags=["timeline"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])




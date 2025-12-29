from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.patient import FaceExam, FaceExamCreate
from app.services.face_exam_service import FaceExamService
from app.services.image_upload_service import ImageUploadService

router = APIRouter()

# 依赖注入 Service
def get_face_exam_service():
    return FaceExamService()

def get_image_upload_service():
    return ImageUploadService()

@router.post("/", response_model=FaceExam)
async def create_face_exam(
    patient_id: int = Form(...),
    image_file: UploadFile = File(None),
    image_url: str = Form(None),
    db: Session = Depends(get_db),
    service: FaceExamService = Depends(get_face_exam_service),
    upload_service: ImageUploadService = Depends(get_image_upload_service)
):
    """
    上传图片并进行 AI 面容诊断
    
    支持两种方式：
    1. 上传图片文件 (image_file)
    2. 直接提供图片 URL (image_url)
    """
    final_image_url = image_url
    image_metadata = None
    
    # 如果上传了文件，保存并获取 URL
    if image_file and image_file.filename:
        try:
            image_metadata = await upload_service.save_image(image_file)
            final_image_url = image_metadata["file_url"]
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    if not final_image_url:
        final_image_url = "https://via.placeholder.com/400x500.png?text=Face+Image"
    
    # 创建诊断记录
    exam = service.create_exam(
        db=db, 
        patient_id=patient_id, 
        image_url=final_image_url,
        image_metadata=image_metadata
    )
    
    return exam

@router.post("/upload", summary="仅上传图片")
async def upload_image(
    image_file: UploadFile = File(...),
    upload_service: ImageUploadService = Depends(get_image_upload_service)
):
    """
    仅上传图片，返回图片信息，不进行 AI 分析
    用于预览或分步操作
    """
    try:
        result = await upload_service.save_image(image_file)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/patient/{patient_id}", response_model=List[FaceExam])
def read_patient_exams(patient_id: int, db: Session = Depends(get_db)):
    """
    获取某患者的所有诊断记录
    """
    service = FaceExamService()
    exams = service.get_history(db, patient_id)
    return exams

@router.put("/{exam_id}/confirm", response_model=FaceExam)
def confirm_exam(
    exam_id: int, 
    doctor_notes: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    医生确认诊断结果
    """
    service = FaceExamService()
    exam = service.confirm_exam(db, exam_id, doctor_notes)
    if not exam:
        raise HTTPException(status_code=404, detail="诊断记录不存在")
    return exam

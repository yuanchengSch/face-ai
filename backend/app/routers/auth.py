from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.services.auth_service import AuthService, get_current_user
from app.models.patient import User

router = APIRouter()


class Token(BaseModel):
    access_token: str
    token_type: str


class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: Optional[str] = "consultant"


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        orm_mode = True


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    用户登录，获取访问令牌
    """
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = AuthService.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    用户注册
    """
    # 检查用户名是否已存在
    existing_user = AuthService.get_user_by_username(db, user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    user = AuthService.create_user(
        db,
        username=user_data.username,
        password=user_data.password,
        full_name=user_data.full_name,
        role=user_data.role
    )
    return user


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    获取当前登录用户信息
    """
    return current_user


@router.post("/init-admin")
def init_admin(db: Session = Depends(get_db)):
    """
    初始化管理员账号（仅首次使用）
    """
    # 检查是否已有管理员
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="管理员账号已存在"
        )
    
    # 创建默认管理员
    user = AuthService.create_user(
        db,
        username="admin",
        password="admin123",
        full_name="系统管理员",
        role="admin"
    )
    
    return {"message": "管理员账号创建成功", "username": user.username}


@router.post("/init-demo")
def init_demo(db: Session = Depends(get_db)):
    """
    初始化演示数据（样例患者）
    """
    from app.models.patient import Patient
    from datetime import datetime, timedelta
    import random
    
    # 检查是否已有患者数据
    existing = db.query(Patient).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="演示数据已存在"
        )
    
    # 样例患者数据
    sample_patients = [
        {
            "full_name": "李婷婷",
            "gender": "女",
            "phone": "13812345678",
            "age": 28,
            "level": "Gold",
            "total_consumption": 15800.0,
            "notes": "对玻尿酸过敏，注意使用替代方案"
        },
        {
            "full_name": "王晓明",
            "gender": "男",
            "phone": "13987654321",
            "age": 35,
            "level": "Platinum",
            "total_consumption": 48500.0,
            "notes": "长期客户，偏好微创项目"
        },
        {
            "full_name": "张美丽",
            "gender": "女",
            "phone": "13611112222",
            "age": 42,
            "level": "Silver",
            "total_consumption": 8200.0,
            "notes": "首次尝试抗衰项目"
        },
        {
            "full_name": "陈静怡",
            "gender": "女",
            "phone": "13722223333",
            "age": 31,
            "level": "Standard",
            "total_consumption": 3500.0,
            "notes": "皮肤敏感，需要温和方案"
        },
        {
            "full_name": "刘芳华",
            "gender": "女",
            "phone": "13833334444",
            "age": 26,
            "level": "Gold",
            "total_consumption": 12000.0,
            "notes": "关注面部轮廓优化"
        }
    ]
    
    created_count = 0
    for patient_data in sample_patients:
        patient = Patient(
            **patient_data,
            last_visit_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
        )
        db.add(patient)
        created_count += 1
    
    db.commit()
    
    return {"message": f"演示数据创建成功", "patients_created": created_count}

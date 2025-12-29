import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Face AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_this_to_a_secure_random_key_in_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # AI Provider - 魔搭社区 DeepSeek
    MODELSCOPE_API_KEY: str = os.getenv("MODELSCOPE_API_KEY", "")
    MODELSCOPE_MODEL: str = os.getenv("MODELSCOPE_MODEL", "deepseek-ai/DeepSeek-V3.2")
    MODELSCOPE_BASE_URL: str = os.getenv("MODELSCOPE_BASE_URL", "https://api-inference.modelscope.cn/v1")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")  # mock or modelscope
    
    # CORS - 默认允许本地开发和常见部署场景
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()



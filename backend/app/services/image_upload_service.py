import os
import uuid
import hashlib
from datetime import datetime
from pathlib import Path
from fastapi import UploadFile
from PIL import Image
import io

class ImageUploadService:
    """图片上传服务 - 处理本地存储和元信息提取"""
    
    UPLOAD_DIR = Path("uploads")
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    def __init__(self):
        # 确保上传目录存在
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    async def save_image(self, file: UploadFile) -> dict:
        """
        保存上传的图片文件
        
        Returns:
            dict: {
                "file_path": str,  # 相对路径
                "file_url": str,   # 访问 URL
                "hash": str,       # 文件 MD5 hash
                "width": int,      # 图片宽度
                "height": int,     # 图片高度
                "size_bytes": int, # 文件大小
                "original_name": str,
                "uploaded_at": str
            }
        """
        # 验证文件扩展名
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in self.ALLOWED_EXTENSIONS:
            raise ValueError(f"不支持的文件格式: {file_ext}")
        
        # 读取文件内容
        content = await file.read()
        
        # 验证文件大小
        if len(content) > self.MAX_FILE_SIZE:
            raise ValueError(f"文件过大，最大支持 {self.MAX_FILE_SIZE // 1024 // 1024}MB")
        
        # 计算文件 hash
        file_hash = hashlib.md5(content).hexdigest()
        
        # 生成唯一文件名
        unique_name = f"{uuid.uuid4().hex}{file_ext}"
        
        # 按日期分目录存储
        date_folder = datetime.now().strftime("%Y%m%d")
        save_dir = self.UPLOAD_DIR / date_folder
        save_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = save_dir / unique_name
        
        # 提取图片元信息
        width, height = 0, 0
        try:
            img = Image.open(io.BytesIO(content))
            width, height = img.size
        except Exception:
            pass  # 如果无法解析图片尺寸，继续保存
        
        # 保存文件
        with open(file_path, "wb") as f:
            f.write(content)
        
        # 构建返回信息
        relative_path = f"{date_folder}/{unique_name}"
        
        return {
            "file_path": relative_path,
            "file_url": f"/static/uploads/{relative_path}",
            "hash": file_hash,
            "width": width,
            "height": height,
            "size_bytes": len(content),
            "original_name": file.filename,
            "uploaded_at": datetime.now().isoformat()
        }
    
    def get_full_path(self, relative_path: str) -> Path:
        """获取文件的完整路径"""
        return self.UPLOAD_DIR / relative_path
    
    def delete_image(self, relative_path: str) -> bool:
        """删除图片文件"""
        full_path = self.get_full_path(relative_path)
        if full_path.exists():
            full_path.unlink()
            return True
        return False

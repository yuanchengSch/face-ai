from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseAIProvider(ABC):
    @abstractmethod
    def analyze_face(self, image_path: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        分析人脸图片并返回指标和建议。
        context 可以包含上一次的指标以保证数据连续性。
        """
        pass
    
    @abstractmethod
    def generate_plan(self, patient_data: Dict[str, Any], jieqi: str) -> Dict[str, Any]:
        """
        根据患者数据和节气生成长期方案。
        """
        pass

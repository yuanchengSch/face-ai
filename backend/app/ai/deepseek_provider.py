import os
import json
from typing import Dict, Any, Optional
from openai import OpenAI
from app.ai.base import BaseAIProvider
from app.core.config import settings

class DeepSeekProvider(BaseAIProvider):
    """
    魔搭社区 DeepSeek API 集成
    """
    
    DEFAULT_BASE_URL = "https://api-inference.modelscope.cn/v1"
    DEFAULT_MODEL = "deepseek-ai/DeepSeek-V3.2"
    
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.MODELSCOPE_API_KEY
        self.model = model or settings.MODELSCOPE_MODEL
        self.base_url = settings.MODELSCOPE_BASE_URL
        
        self.client = None
        if self.api_key:
            self.client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key
            )
        else:
            print("Warning: MODELSCOPE_API_KEY not set, will fall back to mock data")
    
    def _call_api(self, messages: list, temperature: float = 0.7, max_tokens: int = 1000) -> str:
        """调用魔搭 DeepSeek API"""
        if not self.client:
            return ""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=False,
                timeout=90  # 90秒超时
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"ModelScope DeepSeek API error: {e}")
            return ""
    
    def analyze_face(self, image_path: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        分析人脸图片并返回指标和建议
        """
        last_metrics = context.get("last_metrics", {}) if context else {}
        
        prompt = f"""你是一位专业的医美皮肤分析师。请根据描述分析患者的皮肤状况。

患者历史数据：
{json.dumps(last_metrics, ensure_ascii=False) if last_metrics else "无历史数据（首次诊断）"}

请分析并输出以下JSON格式的结果（只输出JSON，不要其他文字）：
{{
    "metrics": {{
        "skin_age": <整数，推测肌龄>,
        "hydration": <0-100，水润度评分>,
        "inflammation": <0-100，炎症风险评分>,
        "elasticity": <0-100，弹性评分>,
        "pigmentation": <0-100，色沉评分>,
        "wrinkles": <0-100，皱纹评分>
    }},
    "advice_summary": "<一句话总结>",
    "detailed_advice": "<详细建议，包含护理/作息/饮食/风险提示>"
}}

注意：
1. 如果有历史数据，评分变化应该合理（通常在±10%内波动）
2. 给出具体可操作的建议
"""
        
        messages = [
            {"role": "system", "content": "你是专业的医美皮肤分析AI助手，擅长分析皮肤状况并给出个性化建议。请只输出JSON格式的结果。"},
            {"role": "user", "content": prompt}
        ]
        
        response = self._call_api(messages)
        
        if response:
            try:
                # 尝试提取 JSON（可能包含 markdown 代码块）
                json_str = response
                if "```json" in response:
                    json_str = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    json_str = response.split("```")[1].split("```")[0]
                
                result = json.loads(json_str.strip())
                result["ai_provider"] = f"ModelScope-{self.model.split('/')[-1]}"
                return result
            except (json.JSONDecodeError, IndexError) as e:
                print(f"JSON parse error: {e}, response: {response[:200]}")
        
        # 如果 API 调用失败，返回模拟数据
        return self._get_mock_analysis(last_metrics)
    
    def generate_plan(self, patient_data: Dict[str, Any], jieqi: str) -> Dict[str, Any]:
        """
        根据患者数据和节气生成长期方案
        """
        metrics = patient_data.get("metrics", {})
        jieqi_advice = patient_data.get("jieqi_advice", {})
        
        prompt = f"""你是一位专业的医美个性化方案规划师。请根据以下信息生成14天护理方案。

当前节气：{jieqi}
节气护理重点：{jieqi_advice.get("focus", "")}
节气建议：{json.dumps(jieqi_advice.get("suggestions", []), ensure_ascii=False)}

患者肤质指标：
{json.dumps(metrics, ensure_ascii=False) if metrics else "暂无诊断数据"}

请输出以下JSON格式的方案（只输出JSON，不要其他文字）：
{{
    "goal": "<一句话概括方案目标>",
    "phases": [
        {{
            "phase": "第1-3天：调理期",
            "actions": {{
                "护理": ["具体护理建议1", "建议2"],
                "作息": ["作息建议1"],
                "饮食": ["饮食建议1", "建议2"]
            }}
        }},
        {{
            "phase": "第4-10天：强化期",
            "actions": {{...}}
        }},
        {{
            "phase": "第11-14天：巩固期",
            "actions": {{...}}
        }}
    ]
}}
"""
        
        messages = [
            {"role": "system", "content": "你是专业的医美护理方案规划AI，擅长根据节气和肤质制定个性化方案。请只输出JSON格式的结果。"},
            {"role": "user", "content": prompt}
        ]
        
        response = self._call_api(messages)
        
        if response:
            try:
                json_str = response
                if "```json" in response:
                    json_str = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    json_str = response.split("```")[1].split("```")[0]
                
                result = json.loads(json_str.strip())
                return result
            except (json.JSONDecodeError, IndexError) as e:
                print(f"JSON parse error: {e}")
        
        return self._get_mock_plan(jieqi)
    
    def _get_mock_analysis(self, last_metrics: dict) -> Dict[str, Any]:
        """生成模拟分析数据"""
        import random
        
        def fluctuate(base, range_val=10):
            return max(0, min(100, base + random.randint(-range_val, range_val)))
        
        if last_metrics:
            metrics = {
                "skin_age": last_metrics.get("skin_age", 28) + random.choice([-1, 0, 0, 1]),
                "hydration": fluctuate(last_metrics.get("hydration", 65)),
                "inflammation": fluctuate(last_metrics.get("inflammation", 35)),
                "elasticity": fluctuate(last_metrics.get("elasticity", 70)),
                "pigmentation": fluctuate(last_metrics.get("pigmentation", 40)),
                "wrinkles": fluctuate(last_metrics.get("wrinkles", 25)),
            }
        else:
            metrics = {
                "skin_age": random.randint(25, 35),
                "hydration": random.randint(55, 80),
                "inflammation": random.randint(20, 50),
                "elasticity": random.randint(60, 85),
                "pigmentation": random.randint(25, 55),
                "wrinkles": random.randint(15, 40),
            }
        
        return {
            "metrics": metrics,
            "advice_summary": "建议加强日常保湿护理，注意防晒和规律作息。",
            "detailed_advice": "【护理】建议使用高保湿精华，每周2次补水面膜。\n【作息】保持规律睡眠，晚11点前入睡。\n【饮食】多喝水，减少辛辣刺激。\n【注意】如有红肿情况请及时就医。",
            "ai_provider": "MockAI"
        }
    
    def chat(self, history: list, prompt: str) -> str:
        """
        与 AI 进行对话 (支持上下文)
        """
        # 构建系统提示词 - 中医美容专家人设
        system_prompt = """你是一位资深的中医美容专家，拥有30年中医临床经验。
你精通中医基础理论（阴阳五行、脏腑经络）、面诊、舌诊以及中医美容疗法（食疗、药膳、穴位按摩、中药面膜、刮痧等）。

你的职责是：
1. 根据用户的描述（症状、皮肤问题），运用中医理论进行辩证分析（如：肺热、脾虚、肝郁化火等）。
2. 给出针对性的中医调理建议，包括：
   - 【内调】：食疗建议、养生茶饮、作息调整。
   - 【外养】：适合的中草药护肤成分、穴位按摩手法。
3. 语气专业、亲切、耐心，解释中医术语时要通俗易懂。
4. 始终保持“医美+中医”的结合视角。

请直接回答用户的问题，不要过多的客套话。如果信息不足，可以尝试追问用户（问诊）。
"""
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # 添加历史记录
        if history:
            for msg in history:
                role = "user" if msg.get("sender") == "patient" or msg.get("role") == "user" else "assistant"
                messages.append({"role": role, "content": msg.get("content", "")})
        
        # 添加当前问题
        messages.append({"role": "user", "content": prompt})
        
        return self._call_api(messages)

    def _get_mock_plan(self, jieqi: str) -> Dict[str, Any]:
        """生成模拟方案"""
        return {
            "goal": f"适应{jieqi}节气，改善肌肤状态",
            "phases": [
                {
                    "phase": "第1-3天：基础调理期",
                    "actions": {
                        "护理": ["温和清洁", "基础保湿"],
                        "作息": ["规律睡眠"],
                        "饮食": ["多喝水"]
                    }
                },
                {
                    "phase": "第4-10天：强化改善期",
                    "actions": {
                        "护理": ["密集补水", "每周面膜"],
                        "作息": ["适量运动"],
                        "饮食": ["均衡营养"]
                    }
                },
                {
                    "phase": "第11-14天：巩固维护期",
                    "actions": {
                        "护理": ["维持护理"],
                        "作息": ["保持良好习惯"],
                        "饮食": ["健康饮食"]
                    }
                }
            ]
        }

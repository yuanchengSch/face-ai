from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.ai.deepseek_provider import DeepSeekProvider

router = APIRouter()

class ConsultRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

class ConsultResponse(BaseModel):
    reply: str
    provider: str

# 单例模式，避免每次请求都实例化
_provider_instance = None

def get_provider():
    global _provider_instance
    if _provider_instance is None:
        _provider_instance = DeepSeekProvider()
    return _provider_instance

@router.post("/tcm-consult", response_model=ConsultResponse)
async def tcm_consult(request: ConsultRequest):
    """
    中医美容 AI 问诊接口
    
    - 支持上下文对话
    - 自动降级到 Mock 响应
    """
    provider = get_provider()
    
    try:
        reply = provider.chat(request.history, request.message)
        
        if reply:
            return ConsultResponse(reply=reply, provider="DeepSeek-V3")
        
        # API 返回空，降级到 Mock
        mock_reply = _get_mock_tcm_response(request.message)
        return ConsultResponse(reply=mock_reply, provider="MockAI")
        
    except Exception as e:
        print(f"[AI Consult Error] {type(e).__name__}: {str(e)}")
        # 出错时返回 Mock 响应而非 500
        mock_reply = _get_mock_tcm_response(request.message)
        return ConsultResponse(reply=mock_reply, provider="MockAI-Fallback")


def _get_mock_tcm_response(message: str) -> str:
    """当 AI 服务不可用时的模拟响应"""
    if "失眠" in message or "睡眠" in message:
        return """根据您描述的失眠症状，中医认为可能与**心脾两虚**或**肝郁化火**有关。

【辩证分析】
- 若伴有面色萎黄、食欲不振 → 脾虚血亏，心神失养
- 若伴有烦躁易怒、口苦口干 → 肝火上扰心神

【内调建议】
1. 食疗：睡前可饮用酸枣仁汤（酸枣仁15g、茯苓10g、知母6g）
2. 穴位按摩：睡前按揉安眠穴（耳后凹陷处）、神门穴（手腕横纹尺侧端）各3分钟

【外养建议】
- 晚间护肤可选用含薰衣草精油的产品，舒缓神经
- 避免睡前使用电子产品

建议您来院详细问诊，我们可以结合舌诊脉诊给出更精准的调理方案。"""
    elif "痘" in message or "痤疮" in message or "粉刺" in message:
        return """从中医角度分析，反复长痘多与**肺胃热盛**或**湿热蕴结**相关。

【辩证分析】
- 额头 → 心火旺盛
- 下巴 → 肾阴不足、冲任失调
- 两颊 → 肝胆湿热

【内调建议】
1. 食疗：绿豆薏米粥（清热利湿）、金银花茶（清热解毒）
2. 忌口：辛辣油腻、甜食奶制品

【外养建议】
- 可使用含金银花、黄芩提取物的护肤品
- 穴位按摩：合谷穴、曲池穴（清热解表）

如果症状严重，建议进行面诊配合中药内服外敷综合治疗。"""
    else:
        return """感谢您的咨询。根据您的描述，我初步分析如下：

【中医视角】
皮肤问题往往与脏腑功能失调相关，常见的有：
- 脾虚湿盛 → 面色萎黄、浮肿
- 肝郁气滞 → 黄褐斑、情绪性皮肤问题
- 肾虚 → 皮肤松弛、黑眼圈

【建议】
1. 来院进行详细的望闻问切
2. 根据体质辨证给出个性化调理方案
3. 中医美容强调内外兼修，建议配合药膳食疗

如需进一步了解，可以描述更多症状细节，我会给出更有针对性的建议。"""

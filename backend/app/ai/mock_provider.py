import random
from app.ai.base import BaseAIProvider
from typing import Dict, Any, Optional

class MockAIProvider(BaseAIProvider):
    def analyze_face(self, image_path: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        # Context: last_metrics (dict) 上一次的指标
        last_metrics = context.get("last_metrics", {}) if context else {}
        
        # 基础值 (如果没有历史记录，则随机生成)
        base_inflammation = last_metrics.get("inflammation", random.randint(30, 60))
        base_hydration = last_metrics.get("hydration", random.randint(40, 70))
        base_wrinkles = last_metrics.get("wrinkles", random.randint(10, 40))
        
        # 随机游走 (微小变化)
        # 水分波动较大 (-10 到 +10)
        # 皱纹相对稳定 (-2 到 +2)
        inflammation = max(0, min(100, base_inflammation + random.randint(-5, 5)))
        hydration = max(0, min(100, base_hydration + random.randint(-10, 10)))
        wrinkles = max(0, min(100, base_wrinkles + random.randint(-2, 2)))
        
        skin_age = max(18, 25 + (wrinkles // 5) + random.randint(-2, 2))
        
        metrics = {
            "inflammation": inflammation,
            "hydration": hydration,
            "wrinkles": wrinkles,
            "pigmentation": max(0, min(100, last_metrics.get("pigmentation", 30) + random.randint(-3, 3))),
            "elasticity": max(0, min(100, last_metrics.get("elasticity", 60) + random.randint(-3, 3))),
            "skin_age": int(skin_age)
        }
        
        # 根据最差指标生成建议
        if metrics["inflammation"] > 60:
            advice = "检测到面部炎症反应明显，建议暂停高功效产品，使用积雪草苷等成分舒缓。注意饮食清淡，避免熬夜。"
        elif metrics["hydration"] < 40:
            advice = "皮肤水分含量较低，屏障功能可能受损。建议加强保湿，使用含有神经酰胺或透明质酸的产品。"
        else:
            advice = "整体肤况稳定，请继续保持当前的护肤节奏，同时注意防晒。"
            
        return {
            "metrics": metrics,
            "advice_summary": advice,
            "detailed_advice": advice + "\n\n建议疗程：\n1. 舒缓导入 (每周1次)\n2. 强效补水面膜 (每周2-3次)",
            "ai_provider": "MockAI-v1"
        }

    def generate_plan(self, patient_data: Dict[str, Any], jieqi: str) -> Dict[str, Any]:
        # 生成一个为期2周的方案
        goal = f"针对{jieqi}节气的皮肤调理"
        
        phases = [
            {
                "phase": "第1周：适应期",
                "actions": {
                    "晨间": ["温和洁面", "抗氧精华", "防晒"],
                    "晚间": ["卸妆油", "舒缓水", "修复霜"],
                    "医美": ["无"]
                }
            },
            {
                "phase": "第2周：强化期",
                "actions": {
                    "晨间": ["温和洁面", "VC精华", "防晒"],
                    "晚间": ["洁面", "A醇(低浓度)", "保湿霜"],
                    "医美": ["光子嫩肤 (如皮肤稳定)"]
                }
            }
        ]
        
        return {
            "goal": goal,
            "phases": phases,
            "sys_advice": f"结合患者历史数据与{jieqi}气候特点，建议采取稳进式护肤策略。"
        }

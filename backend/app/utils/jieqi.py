from datetime import datetime
import bisect

class JieqiUtils:
    JIEQI_NAMES = [
        "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨",
        "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑",
        "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"
    ]

    # 节气对应的养护建议
    JIEQI_ADVICE = {
        "小寒": {
            "date_range": "1月5日-1月19日",
            "risks": ["极寒干燥", "皮肤屏障脆弱", "血液循环减慢"],
            "suggestions": ["使用高保湿面霜", "减少清洁次数", "避免过热水洗脸"],
            "focus": "防冻抗燥",
            "skin": "强效补水"
        },
        "大寒": {
            "date_range": "1月20日-2月3日",
            "risks": ["寒冷达峰", "皮脂分泌最少"],
            "suggestions": ["密集修护", "使用封闭性保湿剂", "减少刷酸频率"],
            "focus": "深层滋养",
            "skin": "修护屏障"
        },
        "立春": {
            "date_range": "2月4日-2月18日",
            "risks": ["换季敏感", "风邪侵袭"],
            "suggestions": ["逐步减轻保湿力度", "增加抗氧化", "注意防风"],
            "focus": "换季过渡",
            "skin": "舒缓抗敏"
        },
        "雨水": {
            "date_range": "2月19日-3月4日",
            "risks": ["湿气增加", "痘痘风险上升"],
            "suggestions": ["控油保湿平衡", "清洁毛孔", "减少厚重产品"],
            "focus": "祛湿养肤",
            "skin": "清爽控油"
        },
        "春分": {
            "date_range": "3月20日-4月4日",
            "risks": ["昼夜温差", "花粉过敏"],
            "suggestions": ["抗敏修复", "温和清洁", "加强防晒"],
            "focus": "阴阳平衡",
            "skin": "抗敏修复"
        },
        "清明": {
            "date_range": "4月5日-4月19日",
            "risks": ["紫外线增强", "油脂分泌增加"],
            "suggestions": ["每日防晒", "轻薄保湿", "定期清洁面膜"],
            "focus": "防晒护肤",
            "skin": "控油防晒"
        },
        "夏至": {
            "date_range": "6月21日-7月6日",
            "risks": ["强烈紫外线", "出油严重", "毛孔粗大"],
            "suggestions": ["高倍防晒", "清爽护肤", "收缩毛孔护理"],
            "focus": "清热防晒",
            "skin": "控油收毛孔"
        },
        "小暑": {
            "date_range": "7月7日-7月22日",
            "risks": ["高温出汗", "炎症风险高"],
            "suggestions": ["勤补防晒", "舒缓镇静", "避免浓妆"],
            "focus": "清热降火",
            "skin": "舒缓镇静"
        },
        "立秋": {
            "date_range": "8月7日-8月22日",
            "risks": ["干燥来袭", "换季敏感"],
            "suggestions": ["逐步增加保湿", "修复夏季损伤", "减少刺激"],
            "focus": "润燥养阴",
            "skin": "保湿修复"
        },
        "秋分": {
            "date_range": "9月23日-10月7日",
            "risks": ["干燥加剧", "皱纹风险"],
            "suggestions": ["深层保湿", "抗氧化", "眼周护理"],
            "focus": "滋阴润燥",
            "skin": "深层滋养"
        },
        "冬至": {
            "date_range": "12月21日-1月4日",
            "risks": ["阴寒至极", "皮肤代谢最慢"],
            "suggestions": ["高营养修护", "减少过度清洁", "温和去角质"],
            "focus": "防寒保暖",
            "skin": "滋润保湿"
        }
    }

    @staticmethod
    def get_current_jieqi(date: datetime = None) -> str:
        if date is None:
            date = datetime.now()
        
        day_of_year = date.timetuple().tm_yday
        
        # 大致的节气起始天数
        term_days = [
            5, 20, 34, 49, 64, 79, 94, 109, 
            125, 140, 156, 172, 187, 203, 219, 235, 
            250, 266, 281, 296, 312, 327, 341, 356
        ]
        
        idx = bisect.bisect_right(term_days, day_of_year)
        if idx >= 24:
            return JieqiUtils.JIEQI_NAMES[0]
        
        return JieqiUtils.JIEQI_NAMES[idx]

    @staticmethod
    def get_advice_for_jieqi(jieqi: str) -> dict:
        """获取节气对应的养护建议"""
        default_advice = {
            "date_range": "",
            "risks": [f"{jieqi}时节注意皮肤状态变化"],
            "suggestions": ["根据天气调整护肤力度", "保持规律作息", "均衡饮食"],
            "focus": "顺应节气",
            "skin": "平衡水油"
        }
        return JieqiUtils.JIEQI_ADVICE.get(jieqi, default_advice)

    @staticmethod
    def get_jieqi_advice(jieqi: str) -> dict:
        """旧版兼容接口"""
        advice = JieqiUtils.get_advice_for_jieqi(jieqi)
        return {
            "focus": advice.get("focus", ""),
            "skin": advice.get("skin", ""),
            "desc": f"当前节气为{jieqi}。" + "；".join(advice.get("suggestions", []))
        }

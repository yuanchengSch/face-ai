from sqlalchemy.orm import Session
from app.models.plan import Survey
from app.schemas.plan import SurveyCreate
from app.services.timeline_service import TimelineService
from app.ai.deepseek_provider import DeepSeekProvider
from typing import Dict, Any, List

class SurveyService:
    _ai_provider = None
    
    @classmethod
    def get_ai_provider(cls):
        if cls._ai_provider is None:
            cls._ai_provider = DeepSeekProvider()
        return cls._ai_provider
    
    @staticmethod
    def submit_survey(db: Session, survey_in: SurveyCreate):
        """
        提交问卷并进行智能评分分析
        """
        # 计算总分
        score = 0
        answer_details = {}
        
        if isinstance(survey_in.answers, dict):
            for k, v in survey_in.answers.items():
                if isinstance(v, (int, float)):
                    score += int(v)
                    answer_details[k] = int(v)
        
        # AI 智能分析建议
        advice = SurveyService._generate_ai_advice(
            survey_in.survey_type, 
            score, 
            answer_details
        )

        db_survey = Survey(
            patient_id=survey_in.patient_id,
            survey_type=survey_in.survey_type,
            answers=survey_in.answers,
            score=score,
            summary_advice=advice
        )
        db.add(db_survey)
        db.commit()
        db.refresh(db_survey)
        
        # 记录时间轴
        TimelineService.add_event(
            db=db,
            patient_id=survey_in.patient_id,
            event_type="Survey",
            title=f"完成{survey_in.survey_type}",
            description=f"评分: {score}分。{advice[:50]}...",
            related_id=db_survey.id
        )
        
        return db_survey

    @staticmethod
    def _generate_ai_advice(survey_type: str, score: int, answers: Dict[str, Any]) -> str:
        """
        使用 AI 根据问卷类型和答案生成智能建议
        """
        try:
            provider = SurveyService.get_ai_provider()
            
            # 构建问卷分析提示
            prompt = f"""请分析以下问卷结果并给出专业建议：

问卷类型：{survey_type}
总评分：{score}分
各项答案：
{SurveyService._format_answers(answers)}

请从中医美容的角度，给出50-100字的专业建议，包括：
1. 当前状态评估
2. 关键问题点（若有）
3. 具体改善建议

直接输出建议内容，不要有开头寒暄。"""

            result = provider.chat([], prompt)
            if result:
                return result.strip()[:500]  # 限制长度
        except Exception as e:
            print(f"[Survey AI Error] {e}")
        
        # 降级到本地规则
        if "满意度" in survey_type:
            return SurveyService._analyze_satisfaction(score, answers)
        elif "健康" in survey_type:
            return SurveyService._analyze_health(score, answers)
        else:
            return SurveyService._analyze_general(score)
    
    @staticmethod
    def _format_answers(answers: Dict[str, Any]) -> str:
        """格式化答案为可读文本"""
        labels = {
            "sleep": "睡眠质量",
            "stress": "压力程度",
            "skin": "皮肤状态",
            "diet": "饮食规律",
            "service": "服务质量",
            "effect": "效果满意度",
            "environment": "环境舒适度",
            "communication": "沟通体验"
        }
        lines = []
        for k, v in answers.items():
            label = labels.get(k, k)
            lines.append(f"- {label}: {v}/5")
        return "\n".join(lines) if lines else "无详细数据"

    @staticmethod
    def _analyze_satisfaction(score: int, answers: Dict[str, Any]) -> str:
        """满意度问卷分析"""
        total_questions = len(answers) if answers else 3
        avg_score = score / total_questions if total_questions > 0 else 0
        
        if avg_score >= 4.5:
            return "患者满意度非常高！服务质量优秀，建议继续保持现有服务标准，并可以邀请患者分享体验。"
        elif avg_score >= 4:
            return "患者满意度良好。整体服务质量得到认可，可以进一步了解患者的具体需求，持续优化服务细节。"
        elif avg_score >= 3:
            return "患者满意度一般。建议主动回访了解具体不满意的环节，针对性改进服务流程和沟通方式。"
        elif avg_score >= 2:
            return "患者满意度较低。请尽快安排回访了解具体问题，制定改进方案，并考虑提供补偿性服务。"
        else:
            return "患者满意度很低，需要高度关注！建议立即安排资深顾问回访，深入了解问题并制定解决方案。"

    @staticmethod
    def _analyze_health(score: int, answers: Dict[str, Any]) -> str:
        """健康反馈问卷分析"""
        issues = []
        suggestions = []
        
        # 分析各项指标
        sleep = answers.get("sleep", 5)
        stress = answers.get("stress", 5)
        skin = answers.get("skin", 5)
        diet = answers.get("diet", 5)
        
        if sleep <= 2:
            issues.append("睡眠质量差")
            suggestions.append("建议晚10点后减少使用电子设备，可尝试睡前冥想或热水泡脚")
        elif sleep <= 3:
            suggestions.append("注意改善睡眠质量")
            
        if stress <= 2:
            issues.append("压力较大")
            suggestions.append("建议适当运动放松，必要时可寻求心理咨询支持")
        elif stress <= 3:
            suggestions.append("注意调节压力水平")
            
        if skin <= 2:
            issues.append("皮肤状态不佳")
            suggestions.append("建议加强基础护理，可预约面诊评估当前肤质状况")
        elif skin <= 3:
            suggestions.append("可以考虑调整护肤方案")
            
        if diet <= 2:
            issues.append("饮食不规律")
            suggestions.append("建议定时定量进餐，多摄入蔬果和优质蛋白")
        
        if issues:
            return f"需关注问题：{', '.join(issues)}。" + " ".join(suggestions[:3])
        elif score >= 18:
            return "健康状况良好！各项指标稳定，建议保持当前的生活习惯，继续规律护理。"
        else:
            return "整体健康状况一般。" + " ".join(suggestions[:2]) if suggestions else "建议保持规律作息和均衡饮食。"

    @staticmethod
    def _analyze_general(score: int) -> str:
        """通用问卷分析"""
        if score >= 20:
            return "整体反馈非常积极，各项指标表现优秀，建议继续保持。"
        elif score >= 15:
            return "整体情况良好，部分方面可以进一步优化提升。"
        elif score >= 10:
            return "存在一定改善空间，建议关注得分较低的项目，针对性优化。"
        else:
            return "需要重点关注，建议安排回访深入了解情况并制定改进方案。"

    @staticmethod
    def get_surveys(db: Session, patient_id: int):
        return db.query(Survey).filter(Survey.patient_id == patient_id)\
            .order_by(Survey.created_at.desc()).all()
            
    @staticmethod
    def get_survey_stats(db: Session, patient_id: int) -> Dict[str, Any]:
        """获取问卷统计数据"""
        surveys = db.query(Survey).filter(Survey.patient_id == patient_id).all()
        
        if not surveys:
            return {"total": 0, "avg_score": 0, "latest_date": None}
        
        total_score = sum(s.score for s in surveys)
        avg_score = total_score / len(surveys) if surveys else 0
        latest = max(surveys, key=lambda s: s.created_at)
        
        return {
            "total": len(surveys),
            "avg_score": round(avg_score, 1),
            "latest_date": latest.created_at.isoformat() if latest else None
        }

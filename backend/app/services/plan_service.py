from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
from app.models.plan import Plan, Survey
from app.models.face_exam import FaceExam
from app.services.timeline_service import TimelineService
from app.utils.jieqi import JieqiUtils
from app.ai.deepseek_provider import DeepSeekProvider

def _parse_json_field(value):
    """将 JSON 字段解析为字典（处理 SQLite 返回字符串的情况）"""
    if value is None:
        return {}
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except:
            return {}
    return {}

class PlanService:
    _ai_provider = None
    
    @classmethod
    def get_ai_provider(cls):
        if cls._ai_provider is None:
            cls._ai_provider = DeepSeekProvider()
        return cls._ai_provider

    def generate_plan_for_patient(self, db: Session, patient_id: int):
        """
        为患者生成基于节气、面诊和问卷的个性化方案
        """
        # 1. 获取当前节气
        current_jieqi = JieqiUtils.get_current_jieqi()
        jieqi_advice = JieqiUtils.get_advice_for_jieqi(current_jieqi)
        
        # 2. 获取最新面诊结果
        latest_exam = db.query(FaceExam).filter(
            FaceExam.patient_id == patient_id
        ).order_by(FaceExam.created_at.desc()).first()
        
        # 3. 获取最近问卷数据
        recent_surveys = db.query(Survey).filter(
            Survey.patient_id == patient_id
        ).order_by(Survey.created_at.desc()).limit(3).all()
        
        # 4. 构建综合上下文
        context = {
            "jieqi": current_jieqi,
            "jieqi_advice": jieqi_advice,
        }
        
        if latest_exam and latest_exam.metrics:
            context["metrics"] = _parse_json_field(latest_exam.metrics)
            context["exam_advice"] = latest_exam.detailed_advice
        
        if recent_surveys:
            context["surveys"] = [
                {"type": s.survey_type, "score": s.score, "answers": s.answers}
                for s in recent_surveys
            ]
        
        # 5. 调用 AI 生成个性化方案
        plan_data = self._generate_ai_plan(context, current_jieqi)
        
        # 5. 根据面诊结果增强方案
        enhanced_phases = self._enhance_phases_with_exam(
            plan_data.get("phases", []), 
            latest_exam, 
            jieqi_advice
        )
        
        # 6. 保存方案
        db_plan = Plan(
            patient_id=patient_id,
            generated_at_jieqi=current_jieqi,
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=14),
            goal=self._generate_goal(latest_exam, jieqi_advice),
            phases=enhanced_phases
        )
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        
        # 7. 记录时间轴
        TimelineService.add_event(
            db=db,
            patient_id=patient_id,
            event_type="Plan",
            title=f"生成{current_jieqi}节气定制方案",
            description=f"目标：{db_plan.goal}",
            related_id=db_plan.id
        )
        
        return db_plan

    def _generate_goal(self, exam: FaceExam, jieqi_advice: dict) -> str:
        """根据面诊结果和节气生成目标"""
        goals = []
        
        if exam and exam.metrics:
            metrics = _parse_json_field(exam.metrics)
            if metrics.get("hydration", 100) < 60:
                goals.append("提升水润度")
            if metrics.get("inflammation", 0) > 40:
                goals.append("降低炎症风险")
            if metrics.get("elasticity", 100) < 60:
                goals.append("增强皮肤弹性")
            if metrics.get("pigmentation", 0) > 50:
                goals.append("改善色沉问题")
        
        if jieqi_advice and isinstance(jieqi_advice, dict):
            goals.append(jieqi_advice.get("focus", ""))
        
        if not goals:
            goals = ["维持肌肤健康状态"]
            
        return "、".join(filter(None, goals[:3]))
    
    def _generate_ai_plan(self, context: dict, jieqi: str) -> dict:
        """使用 AI 生成个性化方案，带快速降级"""
        import json
        
        try:
            provider = PlanService.get_ai_provider()
            
            # 简化的提示词（减少 token，加快响应）
            prompt = f"""根据以下信息生成14天护理方案，直接输出JSON：
节气：{jieqi}
面诊指标：{json.dumps(context.get('metrics', {}), ensure_ascii=False) if context.get('metrics') else '无'}

输出格式（只输出JSON）：
{{"goal": "目标", "phases": [{{"phase": "第1-3天", "actions": {{"护理": ["建议1"], "饮食": ["建议1"]}}}}, {{"phase": "第4-10天", "actions": {{}}}}, {{"phase": "第11-14天", "actions": {{}}}}]}}"""

            result = provider.chat([], prompt)
            
            if result:
                json_str = result
                if "```json" in result:
                    json_str = result.split("```json")[1].split("```")[0]
                elif "```" in result:
                    json_str = result.split("```")[1].split("```")[0]
                
                return json.loads(json_str.strip())
                
        except Exception as e:
            print(f"[Plan AI Error] {e}")
        
        # 降级到默认方案
        return self._get_default_plan(context.get('jieqi_advice', {}))
    
    def _format_survey_context(self, surveys: list) -> str:
        """格式化问卷数据为上下文"""
        if not surveys:
            return "暂无问卷记录"
        
        lines = []
        for s in surveys:
            lines.append(f"- {s.get('type')}: {s.get('score')}分")
            if s.get('answers'):
                for k, v in s.get('answers', {}).items():
                    lines.append(f"  - {k}: {v}/5")
        return "\n".join(lines)
    
    def _get_default_plan(self, jieqi_advice: dict) -> dict:
        """默认方案"""
        return {
            "goal": jieqi_advice.get("focus", "维持肌肤健康"),
            "phases": self._generate_default_phases(jieqi_advice)
        }

    def _enhance_phases_with_exam(self, base_phases: list, exam: FaceExam, jieqi_advice: dict) -> list:
        """根据面诊结果增强方案阶段"""
        if not base_phases:
            # 如果没有基础方案，生成默认方案
            base_phases = self._generate_default_phases(jieqi_advice)
        
        # 根据面诊结果添加针对性建议
        if exam and exam.metrics:
            metrics = _parse_json_field(exam.metrics)
            
            for phase in base_phases:
                actions = phase.get("actions", {})
                
                # 添加护理建议
                care = actions.get("护理", [])
                if metrics.get("hydration", 100) < 60:
                    care.append("使用高保湿精华")
                if metrics.get("inflammation", 0) > 40:
                    care.append("使用舒缓修复面膜")
                actions["护理"] = care[:4]  # 限制数量
                
                # 添加饮食建议
                diet = actions.get("饮食", [])
                if metrics.get("inflammation", 0) > 40:
                    diet.append("减少辛辣刺激食物")
                actions["饮食"] = diet[:4]
                
                phase["actions"] = actions
        
        return base_phases

    def _generate_default_phases(self, jieqi_advice: dict) -> list:
        """生成默认方案阶段"""
        suggestions = jieqi_advice.get("suggestions", [])
        skin_focus = jieqi_advice.get("skin", "平衡水油")
        
        return [
            {
                "phase": "第1-3天：基础调理期",
                "actions": {
                    "护理": [skin_focus, "温和清洁"] + suggestions[:1],
                    "作息": ["保持规律睡眠", "晚11点前入睡"],
                    "饮食": ["多喝温水", "减少生冷食物"]
                }
            },
            {
                "phase": "第4-10天：强化改善期",
                "actions": {
                    "护理": suggestions[:2] + ["每周2次面膜"],
                    "作息": ["适量运动", "保持心情舒畅"],
                    "饮食": ["增加蛋白质摄入", "多食用蔬果"]
                }
            },
            {
                "phase": "第11-14天：巩固维护期",
                "actions": {
                    "护理": ["维持护理强度", "定期评估效果"],
                    "作息": ["保持良好习惯"],
                    "饮食": ["均衡饮食", "适量补充维生素"]
                }
            }
        ]

    @staticmethod
    def get_latest_plan(db: Session, patient_id: int):
        return db.query(Plan).filter(Plan.patient_id == patient_id)\
            .order_by(Plan.created_at.desc()).first()

    @staticmethod
    def get_all_plans(db: Session, patient_id: int):
        return db.query(Plan).filter(Plan.patient_id == patient_id)\
            .order_by(Plan.created_at.desc()).all()

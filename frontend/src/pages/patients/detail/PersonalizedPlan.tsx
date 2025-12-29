import React, { useState, useEffect } from 'react';
import { Card, Button, Steps, Tag, Typography, Space, Message, Spin, Empty, Collapse, Divider } from '@arco-design/web-react';
import { IconRefresh, IconRobot, IconCalendar, IconClockCircle } from '@arco-design/web-react/icon';
import request from '../../../utils/request';

const Step = Steps.Step;
const CollapseItem = Collapse.Item;

interface Phase {
    phase: string;
    actions: {
        [key: string]: string[];
    };
}

interface Plan {
    id: number;
    patient_id: number;
    generated_at_jieqi: string;
    start_date: string;
    end_date: string;
    goal: string;
    phases: Phase[];
    created_at: string;
}

interface PersonalizedPlanProps {
    patientId: number;
}

// 获取最新方案
const getLatestPlan = (patientId: number) => {
    return request<any, Plan>({
        url: '/plans/latest',
        method: 'GET',
        params: { patient_id: patientId }
    });
};

// 生成新方案
const generatePlan = (patientId: number) => {
    return request<any, Plan>({
        url: '/plans',
        method: 'POST',
        params: { patient_id: patientId }
    });
};

const PersonalizedPlan: React.FC<PersonalizedPlanProps> = ({ patientId }) => {
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadPlan();
    }, [patientId]);

    const loadPlan = async () => {
        setLoading(true);
        try {
            const data = await getLatestPlan(patientId);
            setPlan(data);
        } catch (e: any) {
            if (e?.response?.status !== 404) {
                console.error(e);
            }
            setPlan(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const data = await generatePlan(patientId);
            setPlan(data);
            Message.success('个性化方案生成成功！');
        } catch (e) {
            console.error(e);
            Message.error('方案生成失败，请重试');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <Card title="个性化方案" style={{ height: '100%' }}>
                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            </Card>
        );
    }

    return (
        <Card
            title={
                <Space>
                    <IconRobot style={{ color: '#00B42A' }} />
                    个性化方案
                </Space>
            }
            extra={
                <Button
                    type="primary"
                    size="small"
                    icon={<IconRefresh />}
                    loading={generating}
                    onClick={handleGenerate}
                >
                    {plan ? '重新生成' : '生成方案'}
                </Button>
            }
            style={{ height: '100%' }}
            bodyStyle={{ padding: '12px 16px', height: 'calc(100% - 50px)', overflowY: 'auto' }}
        >
            {!plan ? (
                <Empty
                    description="暂无个性化方案"
                    style={{ marginTop: 40 }}
                >
                    <Button type="primary" onClick={handleGenerate} loading={generating}>
                        立即生成 AI 方案
                    </Button>
                </Empty>
            ) : (
                <>
                    {/* 方案头部信息 */}
                    <div style={{
                        background: 'linear-gradient(135deg, #E8FFEA 0%, #F0F5FF 100%)',
                        padding: '12px 16px',
                        borderRadius: 8,
                        marginBottom: 16
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography.Title heading={6} style={{ margin: 0 }}>
                                🎯 {plan.goal}
                            </Typography.Title>
                            <Tag color="green" size="small">
                                <IconCalendar style={{ marginRight: 4 }} />
                                {plan.generated_at_jieqi}
                            </Tag>
                        </div>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(plan.start_date).toLocaleDateString('zh-CN')} - {new Date(plan.end_date).toLocaleDateString('zh-CN')}
                        </Typography.Text>
                    </div>

                    {/* 方案阶段 */}
                    <Steps direction="vertical" current={0} style={{ marginTop: 8 }}>
                        {plan.phases.map((phase, idx) => (
                            <Step
                                key={idx}
                                title={<Typography.Text bold style={{ fontSize: 13 }}>{phase.phase}</Typography.Text>}
                                icon={idx === 0 ? <IconClockCircle /> : undefined}
                                description={
                                    <div style={{ marginTop: 8, marginBottom: 12 }}>
                                        {Object.entries(phase.actions).map(([category, items]) => (
                                            <div key={category} style={{ marginBottom: 8 }}>
                                                <Tag
                                                    size="small"
                                                    color={category === '护理' ? 'blue' : category === '饮食' ? 'orange' : 'gray'}
                                                    style={{ marginBottom: 4 }}
                                                >
                                                    {category}
                                                </Tag>
                                                <div style={{ fontSize: 12, color: '#4E5969', lineHeight: 1.6, paddingLeft: 4 }}>
                                                    {(items as string[]).map((item, i) => (
                                                        <div key={i}>• {item}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                }
                            />
                        ))}
                    </Steps>
                </>
            )}
        </Card>
    );
};

export default PersonalizedPlan;

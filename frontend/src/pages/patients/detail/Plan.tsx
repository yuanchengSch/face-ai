import React, { useEffect, useState } from 'react';
import { Card, Steps, Button, Typography, Tag, Empty, Result } from '@arco-design/web-react';
import { IconCheck, IconRight } from '@arco-design/web-react/icon';
import { generatePlan, getLatestPlan, Plan as PlanType } from '../../../api/plan';

const Step = Steps.Step;

const Plan = ({ patientId }: { patientId: number }) => {
    const [plan, setPlan] = useState<PlanType | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPlan();
    }, [patientId]);

    const fetchPlan = async () => {
        try {
            const res = await getLatestPlan(patientId);
            setPlan(res);
        } catch (e) {
            // Ignore 404
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await generatePlan(patientId);
            setPlan(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!plan) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <Empty description="暂无长期方案" />
                <Button type="primary" onClick={handleGenerate} loading={loading} style={{ marginTop: 20 }}>
                    立即根据当前节气生成方案
                </Button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Typography.Title heading={6} style={{ margin: 0 }}>
                    当前方案：{plan.generated_at_jieqi}节气定制 ({plan.goal})
                </Typography.Title>
                <Button onClick={handleGenerate} loading={loading}>更新方案</Button>
            </div>

            <Steps direction="vertical" current={1} style={{ maxWidth: 800 }}>
                {plan.phases && plan.phases.map((phase: any, index: number) => (
                    <Step
                        key={index}
                        title={phase.phase}
                        description={
                            <Card style={{ marginTop: 10, background: '#f7f8fa' }} bordered={false}>
                                <div style={{ display: 'flex', gap: 20 }}>
                                    {Object.entries(phase.actions).map(([key, actions]: [string, any]) => (
                                        <div key={key}>
                                            <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{key}</div>
                                            <div>
                                                {Array.isArray(actions) && actions.map((act: string, i) => (
                                                    <Tag key={i} style={{ marginRight: 5, marginBottom: 5 }}>{act}</Tag>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        }
                    />
                ))}
            </Steps>
        </div>
    );
};

export default Plan;

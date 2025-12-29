import React, { useEffect, useState } from 'react';
import { Descriptions, Card, Timeline, Typography, Tag, Space, Spin, Empty } from '@arco-design/web-react';
import { IconCheck, IconCamera, IconFile, IconCalendar } from '@arco-design/web-react/icon';
import { Patient } from '../../../api/patient';
import { getTimeline, TimelineEvent } from '../../../api/plan';
import { getPatientExams, FaceExam } from '../../../api/faceExam';

const Overview = ({ patient }: { patient: Patient }) => {
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [latestExam, setLatestExam] = useState<FaceExam | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [patient.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [timelineRes, examsRes] = await Promise.all([
                getTimeline(patient.id).catch(() => []),
                getPatientExams(patient.id).catch(() => [])
            ]);
            setTimeline(timelineRes);
            if (examsRes.length > 0) {
                setLatestExam(examsRes[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case 'FaceExam': return <IconCamera />;
            case 'Plan': return <IconCalendar />;
            case 'Survey': return <IconFile />;
            case 'DoctorConfirm': return <IconCheck />;
            default: return undefined;
        }
    };

    const getEventColor = (eventType: string) => {
        switch (eventType) {
            case 'FaceExam': return '#165DFF';
            case 'Plan': return '#722ED1';
            case 'Survey': return '#00B42A';
            case 'DoctorConfirm': return '#14C9C9';
            default: return '#86909C';
        }
    };

    const getHealthSummary = () => {
        if (!latestExam || !latestExam.metrics) {
            return "暂无诊断数据，请先进行面容诊断。";
        }

        const metrics = latestExam.metrics;
        const issues = [];

        if (metrics.inflammation > 50) issues.push("炎症风险较高");
        if (metrics.hydration < 60) issues.push("水润度不足");
        if (metrics.elasticity < 60) issues.push("弹性有待改善");

        if (issues.length === 0) {
            return "患者肤质状态良好，各项指标正常。建议继续保持当前护理方案。";
        }

        return `根据最新诊断，${issues.join("、")}。建议加强针对性护理。`;
    };

    const getStabilityLevel = () => {
        if (!latestExam || !latestExam.metrics) return { label: "未知", color: "gray" };
        const metrics = latestExam.metrics;
        const avgScore = (metrics.hydration + metrics.elasticity + (100 - metrics.inflammation)) / 3;

        if (avgScore >= 70) return { label: "稳定", color: "green" };
        if (avgScore >= 50) return { label: "中等", color: "orange" };
        return { label: "需关注", color: "red" };
    };

    const stability = getStabilityLevel();

    return (
        <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
                {/* 基础信息 */}
                <Card title="基础档案" style={{ marginBottom: 16 }}>
                    <Descriptions
                        column={2}
                        data={[
                            { label: '姓名', value: patient.full_name },
                            { label: '性别', value: patient.gender },
                            { label: '年龄', value: `${patient.age} 岁` },
                            { label: '手机', value: patient.phone },
                            { label: '等级', value: <Tag color="gold">{patient.level}</Tag> },
                            { label: '累计消费', value: `¥ ${patient.total_consumption?.toLocaleString()}` },
                            { label: '备注', value: patient.notes || '-' },
                        ]}
                    />
                </Card>

                <Card title="最近活动">
                    {loading ? (
                        <Spin style={{ display: 'block', margin: '20px auto' }} />
                    ) : timeline.length === 0 ? (
                        <Empty description="暂无活动记录" />
                    ) : (
                        <Timeline>
                            {timeline.slice(0, 10).map((event) => (
                                <Timeline.Item
                                    key={event.id}
                                    label={new Date(event.occurred_at).toLocaleDateString()}
                                    dot={getEventIcon(event.event_type)}
                                    dotColor={getEventColor(event.event_type)}
                                >
                                    <div>
                                        <strong>{event.title}</strong>
                                        {event.description && (
                                            <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                                                {event.description}
                                            </Typography.Text>
                                        )}
                                    </div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    )}
                </Card>
            </div>

            <div style={{ width: 350 }}>
                <Card title="健康摘要">
                    <Typography.Paragraph>
                        {getHealthSummary()}
                    </Typography.Paragraph>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>肤质稳定性</span>
                            <Tag color={stability.color}>{stability.label}</Tag>
                        </div>
                        {latestExam && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>最近诊断</span>
                                    <Tag color="blue">{new Date(latestExam.created_at).toLocaleDateString()}</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>肌龄</span>
                                    <Tag color="arcoblue">{latestExam.metrics?.skin_age || '-'} 岁</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>医生确认</span>
                                    <Tag color={latestExam.doctor_confirmed ? "green" : "orange"}>
                                        {latestExam.doctor_confirmed ? "已确认" : "待确认"}
                                    </Tag>
                                </div>
                            </>
                        )}
                    </Space>
                </Card>
            </div>
        </div>
    );
};

export default Overview;

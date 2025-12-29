import React, { useEffect, useState } from 'react';
import { Grid, Card, Statistic, Typography, List, Tag, Button, Space, Spin, Empty, Alert, Message } from '@arco-design/web-react';
import {
    IconUser, IconArrowRise, IconUserGroup, IconSchedule,
    IconPlus, IconCamera, IconFile, IconExclamationCircle,
    IconClockCircle, IconSun
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { getDashboard, DashboardData, PendingItem, RiskAlert } from '../../api/dashboard';

const { Row, Col } = Grid;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await getDashboard();
            setData(res);
        } catch (e) {
            console.error('Failed to fetch dashboard:', e);
            Message.error('加载工作台数据失败');
        } finally {
            setLoading(false);
        }
    };

    const getOption = () => {
        return {
            title: {
                text: '近期就诊趋势',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
            },
            xAxis: {
                type: 'category',
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    data: [12, 18, 15, 25, 30, 45, 38],
                    type: 'line',
                    smooth: true,
                    areaStyle: {
                        color: 'rgba(22,93,255, 0.2)'
                    },
                    color: '#165DFF'
                },
            ],
        };
    };

    // 待处理事项类型映射
    const pendingTypeConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
        follow_up: { color: 'orange', icon: <IconClockCircle />, label: '待随访' },
        survey: { color: 'blue', icon: <IconFile />, label: '待问卷' },
        confirm_ai: { color: 'red', icon: <IconExclamationCircle />, label: '待确认AI' },
    };

    // 风险类型映射
    const riskTypeConfig: Record<string, { color: string; label: string }> = {
        inflammation_up: { color: '#F53F3F', label: '炎症上升' },
        satisfaction_down: { color: '#FF7D00', label: '满意度下降' },
    };

    const handlePendingClick = (item: PendingItem) => {
        navigate(`/patients/${item.patient_id}`);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Spin size={40} />
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: 20 }}>
            {/* 顶部欢迎区 */}
            <div style={{ marginBottom: 24 }}>
                <Typography.Title heading={4} style={{ margin: 0, fontWeight: 600 }}>
                    <span className="gradient-text">工作台概览</span>
                </Typography.Title>
                <Typography.Text type="secondary">
                    欢迎回来，Admin。今日有 3 位患者需要跟进。
                </Typography.Text>
            </div>

            {/* 核心指标卡片 */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card bordered={false} hoverable>
                        <Statistic
                            title="今日预约"
                            value={data?.stats.today_appointments ?? 0}
                            prefix={<IconSchedule style={{ color: '#165DFF' }} />}
                            styleValue={{ fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} hoverable>
                        <Statistic
                            title="本月新患者"
                            value={data?.stats.new_patients_this_month ?? 0}
                            prefix={<IconUser style={{ color: '#722ED1' }} />}
                            groupSeparator
                            styleValue={{ fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} hoverable>
                        <Statistic
                            title="患者总数"
                            value={data?.stats.total_patients ?? 0}
                            prefix={<IconUserGroup style={{ color: '#00B42A' }} />}
                            styleValue={{ fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} hoverable>
                        <div style={{ color: '#0fc6c2' }}>
                            <Statistic
                                title="转化率"
                                value={data?.stats.conversion_rate ?? 0}
                                precision={1}
                                suffix="%"
                                prefix={<IconArrowRise />}
                                styleValue={{ fontWeight: 600 }}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 快捷入口 */}
            <Card bordered={false} style={{ marginBottom: 24, borderRadius: 8 }} bodyStyle={{ padding: '16px 24px' }}>
                <Space size="large">
                    <Button
                        type="primary"
                        icon={<IconPlus />}
                        onClick={() => navigate('/patients')}
                        style={{ borderRadius: 4 }}
                    >
                        新建患者
                    </Button>
                    <Button
                        type="outline"
                        icon={<IconCamera />}
                        onClick={() => Message.info('请先选择患者后开始面诊')}
                    >
                        开始面诊
                    </Button>
                    <Button
                        type="outline"
                        icon={<IconFile />}
                        onClick={() => Message.info('请先选择患者后发起问卷')}
                    >
                        发起问卷
                    </Button>
                </Space>
            </Card>

            {/* 待处理区域 + 节气提醒 */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card title="待处理事项" style={{ height: 380, borderRadius: 8 }} bordered={false}>
                        {data?.pending_items && data.pending_items.length > 0 ? (
                            <List
                                bordered={false}
                                dataSource={data.pending_items}
                                render={(item: PendingItem) => {
                                    const config = pendingTypeConfig[item.type] || { color: 'gray', icon: null, label: item.type };
                                    return (
                                        <List.Item
                                            key={`${item.type}-${item.id}`}
                                            style={{ cursor: 'pointer', padding: '12px 0' }}
                                            onClick={() => handlePendingClick(item)}
                                            actionLayout="vertical"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <Space>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: '50%',
                                                        background: '#f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {config.icon}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{item.title}</div>
                                                        <div style={{ fontSize: 12, color: '#86909C' }}>
                                                            <Space split="|">
                                                                <span>{config.label}</span>
                                                                {item.due_date && <span>截止: {item.due_date}</span>}
                                                            </Space>
                                                        </div>
                                                    </div>
                                                </Space>
                                                {item.priority === 'high' && (
                                                    <Tag color="red" size="small">高优先</Tag>
                                                )}
                                            </div>
                                        </List.Item>
                                    );
                                }}
                            />
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Empty description="暂无待处理事项" />
                            </div>
                        )}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card
                        title={
                            <Space>
                                <IconSun style={{ color: '#FF7D00' }} />
                                节气提醒
                            </Space>
                        }
                        style={{ height: 380, borderRadius: 8 }}
                        bordered={false}
                    >
                        {data?.jieqi_reminder && (
                            <div>
                                <div style={{
                                    background: 'linear-gradient(90deg, #FFF7E6 0%, #FFF 100%)',
                                    padding: 16, borderRadius: 8, marginBottom: 16,
                                    borderLeft: '4px solid #FF7D00'
                                }}>
                                    <Space direction="vertical" size={4}>
                                        <Typography.Text bold style={{ fontSize: 16 }}>
                                            当前节气：{data.jieqi_reminder.current_jieqi}
                                        </Typography.Text>
                                        {data.jieqi_reminder.jieqi_date_range && (
                                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                                {data.jieqi_reminder.jieqi_date_range}
                                            </Typography.Text>
                                        )}
                                    </Space>
                                </div>

                                {data.jieqi_reminder.care_suggestions.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <Typography.Text bold style={{ marginBottom: 8, display: 'block' }}>护理重点</Typography.Text>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            {data.jieqi_reminder.care_suggestions.slice(0, 3).map((s, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'start' }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF7D00', marginTop: 8, marginRight: 8 }} />
                                                    <span style={{ color: '#4E5969' }}>{s}</span>
                                                </div>
                                            ))}
                                        </Space>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* 风险警报 + 图表 */}
            <Row gutter={24}>
                <Col span={8}>
                    <Card title="风险警报" style={{ height: 400, borderRadius: 8 }} bordered={false}>
                        {data?.risk_alerts && data.risk_alerts.length > 0 ? (
                            <List
                                bordered={false}
                                dataSource={data.risk_alerts}
                                render={(item: RiskAlert) => {
                                    const config = riskTypeConfig[item.risk_type] || { color: '#86909C', label: item.risk_type };
                                    return (
                                        <List.Item
                                            key={`${item.patient_id}-${item.risk_type}`}
                                            style={{ cursor: 'pointer', padding: '12px 0' }}
                                            onClick={() => navigate(`/patients/${item.patient_id}`)}
                                        >
                                            <Space align="start">
                                                <IconExclamationCircle style={{ color: config.color, marginTop: 4 }} />
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{item.patient_name}</div>
                                                    <div style={{ fontSize: 12, color: '#86909C', marginTop: 4 }}>
                                                        <Tag color="red" size="small" style={{ marginRight: 8 }}>{config.label}</Tag>
                                                        {item.change_value > 0 ? '+' : ''}{item.change_value}% ({item.period})
                                                    </div>
                                                </div>
                                            </Space>
                                        </List.Item>
                                    );
                                }}
                            />
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Empty description="暂无风险警报" />
                            </div>
                        )}
                    </Card>
                </Col>
                <Col span={16}>
                    <Card title="就诊趋势" style={{ height: 400, borderRadius: 8 }} bordered={false}>
                        <ReactECharts option={getOption()} style={{ height: 320 }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;

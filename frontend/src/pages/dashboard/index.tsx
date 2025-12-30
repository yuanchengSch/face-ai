import React, { useEffect, useState } from 'react';
import { Grid, Card, Statistic, Typography, List, Tag, Button, Space, Spin, Empty, Message, Divider } from '@arco-design/web-react';
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
            {/* 核心指标卡片 */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card bordered={false} className="glass-card card-hover" bodyStyle={{ padding: '20px 24px' }}>
                        <Statistic
                            title={<span style={{ color: '#4E5969', fontSize: 14 }}>今日预约</span>}
                            value={data?.stats.today_appointments ?? 0}
                            prefix={<div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(22,93,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><IconSchedule style={{ color: '#165DFF', fontSize: 20 }} /></div>}
                            styleValue={{ fontWeight: 700, fontSize: 28 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="glass-card card-hover" bodyStyle={{ padding: '20px 24px' }}>
                        <Statistic
                            title={<span style={{ color: '#4E5969', fontSize: 14 }}>本月新患者</span>}
                            value={data?.stats.new_patients_this_month ?? 0}
                            prefix={<div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(114,46,209,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><IconUser style={{ color: '#722ED1', fontSize: 20 }} /></div>}
                            groupSeparator
                            styleValue={{ fontWeight: 700, fontSize: 28 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="glass-card card-hover" bodyStyle={{ padding: '20px 24px' }}>
                        <Statistic
                            title={<span style={{ color: '#4E5969', fontSize: 14 }}>患者总数</span>}
                            value={data?.stats.total_patients ?? 0}
                            prefix={<div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,180,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><IconUserGroup style={{ color: '#00B42A', fontSize: 20 }} /></div>}
                            styleValue={{ fontWeight: 700, fontSize: 28 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="glass-card card-hover" bodyStyle={{ padding: '20px 24px' }}>
                        <div style={{ color: '#0fc6c2' }}>
                            <Statistic
                                title={<span style={{ color: '#4E5969', fontSize: 14 }}>转化率</span>}
                                value={data?.stats.conversion_rate ?? 0}
                                precision={1}
                                suffix="%"
                                prefix={<div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(15,198,194,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><IconArrowRise style={{ color: '#0fc6c2', fontSize: 20 }} /></div>}
                                styleValue={{ fontWeight: 700, fontSize: 28, color: '#1d2129' }}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 快捷入口 */}
            <Card bordered={false} className="glass-card" style={{ marginBottom: 24 }} bodyStyle={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography.Text bold style={{ fontSize: 16 }}>快捷操作</Typography.Text>
                    <Space size="large">
                        <Button
                            type="primary"
                            icon={<IconPlus />}
                            onClick={() => navigate('/patients')}
                            style={{ borderRadius: 8, padding: '0 24px', height: 36 }}
                        >
                            新建患者
                        </Button>
                        <Button
                            type="secondary"
                            icon={<IconCamera />}
                            onClick={() => Message.info('请先选择患者后开始面诊')}
                            style={{ borderRadius: 8, height: 36, background: 'white', border: '1px solid #e5e6eb' }}
                        >
                            开始面诊
                        </Button>
                        <Button
                            type="secondary"
                            icon={<IconFile />}
                            onClick={() => Message.info('请先选择患者后发起问卷')}
                            style={{ borderRadius: 8, height: 36, background: 'white', border: '1px solid #e5e6eb' }}
                        >
                            发起问卷
                        </Button>
                    </Space>
                </div>
            </Card>

            {/* 待处理区域 + 节气提醒 */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card title="待处理事项" className="glass-card" style={{ height: 400 }} bordered={false} headerStyle={{ border: 'none', padding: '20px 24px 0' }}>
                        {data?.pending_items && data.pending_items.length > 0 ? (
                            <List
                                bordered={false}
                                split={false}
                                dataSource={data.pending_items}
                                render={(item: PendingItem) => {
                                    const config = pendingTypeConfig[item.type] || { color: 'gray', icon: null, label: item.type };
                                    return (
                                        <List.Item
                                            key={`${item.type}-${item.id}`}
                                            style={{ cursor: 'pointer', padding: '12px 16px', margin: '8px 0', borderRadius: 8 }}
                                            className="card-hover"
                                            onClick={() => handlePendingClick(item)}
                                            actionLayout="vertical"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <Space>
                                                    <div style={{
                                                        width: 40, height: 40, borderRadius: '50%',
                                                        background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: '1px solid #f2f3f5'
                                                    }}>
                                                        <span style={{ color: item.priority === 'high' ? '#F53F3F' : '#4E5969' }}>{config.icon}</span>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500, fontSize: 15 }}>{item.title}</div>
                                                        <div style={{ fontSize: 12, color: '#86909C', marginTop: 2 }}>
                                                            <Space split={<Divider type="vertical" />}>
                                                                <Tag color={item.type === 'confirm_ai' ? 'red' : 'arcoblue'} size="small" style={{ marginRight: 0 }}>{config.label}</Tag>
                                                                {item.due_date && <span>截止: {item.due_date}</span>}
                                                            </Space>
                                                        </div>
                                                    </div>
                                                </Space>
                                                {item.priority === 'high' && (
                                                    <Tag color="red" bordered>高优先</Tag>
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
                        className="glass-card"
                        style={{ height: 400 }}
                        bordered={false}
                        headerStyle={{ border: 'none', padding: '20px 24px 0' }}
                    >
                        {data?.jieqi_reminder && (
                            <div style={{ padding: '0 8px' }}>
                                <div style={{
                                    background: 'linear-gradient(90deg, #FFF7E6 0%, rgba(255,255,255,0) 100%)',
                                    padding: 20, borderRadius: 12, marginBottom: 20,
                                    borderLeft: '4px solid #FF7D00'
                                }}>
                                    <Space direction="vertical" size={6}>
                                        <Typography.Text bold style={{ fontSize: 18, color: '#1d2129' }}>
                                            当前节气：{data.jieqi_reminder.current_jieqi}
                                        </Typography.Text>
                                        {data.jieqi_reminder.jieqi_date_range && (
                                            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                                                {data.jieqi_reminder.jieqi_date_range}
                                            </Typography.Text>
                                        )}
                                    </Space>
                                </div>

                                {data.jieqi_reminder.care_suggestions.length > 0 && (
                                    <div>
                                        <Typography.Text bold style={{ marginBottom: 12, display: 'block', paddingLeft: 8 }}>护理建议</Typography.Text>
                                        <div style={{ display: 'grid', gap: 12 }}>
                                            {data.jieqi_reminder.care_suggestions.slice(0, 3).map((s, i) => (
                                                <div key={i} style={{
                                                    display: 'flex',
                                                    alignItems: 'start',
                                                    background: 'rgba(255,255,255,0.5)',
                                                    padding: '8px 12px',
                                                    borderRadius: 6
                                                }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF7D00', marginTop: 8, marginRight: 10, flexShrink: 0 }} />
                                                    <span style={{ color: '#4E5969', fontSize: 13, lineHeight: 1.6 }}>{s}</span>
                                                </div>
                                            ))}
                                        </div>
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
                    <Card title="风险警报" className="glass-card" style={{ height: 420 }} bordered={false} headerStyle={{ border: 'none', padding: '20px 24px 0' }}>
                        {data?.risk_alerts && data.risk_alerts.length > 0 ? (
                            <List
                                bordered={false}
                                split={false}
                                dataSource={data.risk_alerts}
                                render={(item: RiskAlert) => {
                                    const config = riskTypeConfig[item.risk_type] || { color: '#86909C', label: item.risk_type };
                                    return (
                                        <List.Item
                                            key={`${item.patient_id}-${item.risk_type}`}
                                            style={{ cursor: 'pointer', padding: '12px 16px', margin: '8px 0', borderRadius: 8, background: '#fff0f0' }}
                                            className="card-hover"
                                            onClick={() => navigate(`/patients/${item.patient_id}`)}
                                        >
                                            <Space align="start">
                                                <div style={{ marginTop: 2 }}>
                                                    <IconExclamationCircle style={{ color: config.color, fontSize: 16 }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#1d2129' }}>{item.patient_name}</div>
                                                    <div style={{ fontSize: 12, color: '#4E5969', marginTop: 4 }}>
                                                        <span style={{ color: config.color, marginRight: 8, fontWeight: 500 }}>{config.label}</span>
                                                        <span style={{ color: '#86909c' }}>
                                                            {item.change_value > 0 ? '+' : ''}{item.change_value}% ({item.period})
                                                        </span>
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
                    <Card title="近期就诊趋势" className="glass-card" style={{ height: 420 }} bordered={false} headerStyle={{ border: 'none', padding: '20px 24px 0' }}>
                        <ReactECharts option={getOption()} style={{ height: 340, marginTop: 10 }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;

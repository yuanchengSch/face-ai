import React, { useState, useEffect } from 'react';
import { Card, Grid, Typography, Tag, Space, List, Spin, Empty } from '@arco-design/web-react';
import { IconCamera, IconArrowUp, IconArrowDown } from '@arco-design/web-react/icon';
import request from '../../../utils/request';

const { Row, Col } = Grid;

interface FaceExam {
    id: number;
    patient_id: number;
    image_url: string;
    metrics: {
        skin_age?: number;
        hydration?: number;
        inflammation?: number;
        elasticity?: number;
        pigmentation?: number;
        wrinkles?: number;
    };
    advice_summary: string;
    ai_provider: string;
    created_at: string;
}

interface ExamTrendProps {
    patientId: number;
}

// 获取面诊历史
const getPatientExams = (patientId: number) => {
    return request<any, FaceExam[]>({
        url: `/face-exams/patient/${patientId}`,
        method: 'GET'
    });
};

// 指标标签映射
const metricLabels: Record<string, string> = {
    skin_age: '肌龄',
    hydration: '水润度',
    inflammation: '炎症风险',
    elasticity: '弹性',
    pigmentation: '色沉',
    wrinkles: '皱纹'
};

// 指标颜色（越高越好的指标）
const goodHighMetrics = ['hydration', 'elasticity'];

const ExamTrend: React.FC<ExamTrendProps> = ({ patientId }) => {
    const [exams, setExams] = useState<FaceExam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExams();
    }, [patientId]);

    const loadExams = async () => {
        setLoading(true);
        try {
            const data = await getPatientExams(patientId);
            setExams(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const renderTrendIndicator = (current: number, previous: number, metric: string) => {
        const diff = current - previous;
        const isGoodHigh = goodHighMetrics.includes(metric);
        const isImproved = isGoodHigh ? diff > 0 : diff < 0;

        if (Math.abs(diff) < 3) return <Tag size="small" color="gray">持平</Tag>;

        return (
            <Tag size="small" color={isImproved ? 'green' : 'red'}>
                {isImproved ? <IconArrowUp /> : <IconArrowDown />}
                {isImproved ? ' 改善' : ' 需关注'}
            </Tag>
        );
    };

    const renderMetricsComparison = () => {
        if (exams.length < 2) return null;

        const latest = exams[0];
        const previous = exams[1];

        if (!latest.metrics || !previous.metrics) return null;

        return (
            <div style={{ marginBottom: 16 }}>
                <Typography.Text bold style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                    📊 指标对比（本次 vs 上次）
                </Typography.Text>
                <Row gutter={8}>
                    {Object.keys(metricLabels).map(key => {
                        const current = latest.metrics[key as keyof typeof latest.metrics];
                        const prev = previous.metrics[key as keyof typeof previous.metrics];

                        if (current === undefined) return null;

                        return (
                            <Col span={12} key={key} style={{ marginBottom: 8 }}>
                                <div style={{
                                    background: '#F7F8FA',
                                    padding: '8px 12px',
                                    borderRadius: 4,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                            {metricLabels[key]}
                                        </Typography.Text>
                                        <div style={{ fontSize: 16, fontWeight: 600, color: '#1D2129' }}>
                                            {key === 'skin_age' ? `${current}岁` : current}
                                        </div>
                                    </div>
                                    {prev !== undefined && renderTrendIndicator(current as number, prev as number, key)}
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        );
    };

    if (loading) {
        return (
            <Card title="面诊历史" style={{ height: '100%' }}>
                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            </Card>
        );
    }

    return (
        <Card
            title={
                <Space>
                    <IconCamera style={{ color: '#165DFF' }} />
                    面诊历史
                </Space>
            }
            extra={<Tag color="arcoblue" size="small">{exams.length} 次诊断</Tag>}
            style={{ height: '100%' }}
            bodyStyle={{ padding: '12px 16px', height: 'calc(100% - 50px)', overflowY: 'auto' }}
        >
            {exams.length === 0 ? (
                <Empty description="暂无面诊记录" style={{ marginTop: 40 }} />
            ) : (
                <>
                    {/* 指标对比 */}
                    {renderMetricsComparison()}

                    {/* 历史列表 */}
                    <Typography.Text bold style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                        📅 诊断记录
                    </Typography.Text>
                    <List
                        dataSource={exams.slice(0, 5)}
                        render={(item: FaceExam, index: number) => (
                            <List.Item
                                key={item.id}
                                style={{
                                    padding: '10px 0',
                                    borderBottom: index < exams.length - 1 ? '1px solid #F2F3F5' : 'none'
                                }}
                            >
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Space size={4}>
                                            <Typography.Text style={{ fontSize: 12, fontWeight: 500 }}>
                                                {new Date(item.created_at).toLocaleDateString('zh-CN')}
                                            </Typography.Text>
                                            <Tag size="small" color={item.ai_provider.includes('Mock') ? 'gray' : 'green'}>
                                                {item.ai_provider}
                                            </Tag>
                                        </Space>
                                        {item.metrics?.skin_age && (
                                            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                                肌龄 {item.metrics.skin_age} 岁
                                            </Typography.Text>
                                        )}
                                    </div>
                                    <Typography.Text
                                        type="secondary"
                                        style={{ fontSize: 11, display: 'block' }}
                                        ellipsis={{ rows: 2 }}
                                    >
                                        {item.advice_summary || '暂无建议'}
                                    </Typography.Text>
                                </div>
                            </List.Item>
                        )}
                    />
                </>
            )}
        </Card>
    );
};

export default ExamTrend;

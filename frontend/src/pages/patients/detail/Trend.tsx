import React, { useEffect, useState } from 'react';
import { Card, Grid, Typography, Empty, Spin, Select, Space } from '@arco-design/web-react';
import ReactECharts from 'echarts-for-react';
import { getPatientExams, FaceExam } from '../../../api/faceExam';

const { Row, Col } = Grid;

interface TrendProps {
    patientId: number;
}

const Trend = ({ patientId }: TrendProps) => {
    const [exams, setExams] = useState<FaceExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<string>('all');

    useEffect(() => {
        fetchData();
    }, [patientId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getPatientExams(patientId);
            // 按时间正序排列
            setExams([...res].reverse());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 指标配置
    const metricConfig = {
        skin_age: { name: '肌龄', color: '#165DFF', unit: '岁' },
        hydration: { name: '水润度', color: '#00B42A', unit: '' },
        inflammation: { name: '炎症风险', color: '#F53F3F', unit: '%' },
        elasticity: { name: '弹性', color: '#722ED1', unit: '' },
        pigmentation: { name: '色沉', color: '#FF7D00', unit: '' },
        wrinkles: { name: '皱纹', color: '#86909C', unit: '' },
    };

    // 生成图表配置
    const getLineChartOption = () => {
        if (exams.length === 0) return {};

        const dates = exams.map(e => {
            const date = new Date(e.created_at);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        const series: any[] = [];
        const metrics = selectedMetric === 'all'
            ? Object.keys(metricConfig)
            : [selectedMetric];

        metrics.forEach(key => {
            const config = metricConfig[key as keyof typeof metricConfig];
            if (config) {
                series.push({
                    name: config.name,
                    type: 'line',
                    smooth: true,
                    data: exams.map(e => e.metrics?.[key] ?? null),
                    itemStyle: { color: config.color },
                    emphasis: { focus: 'series' },
                });
            }
        });

        return {
            title: {
                text: '肤质指标趋势',
                left: 'center',
            },
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data: series.map(s => s.name),
                bottom: 0,
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates,
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
            },
            series,
        };
    };

    // 生成雷达图对比（最新 vs 首次）
    const getRadarCompareOption = () => {
        if (exams.length < 2) return null;

        const first = exams[0];
        const latest = exams[exams.length - 1];

        return {
            title: {
                text: '首次 vs 最新对比',
                left: 'center',
            },
            legend: {
                data: ['首次诊断', '最新诊断'],
                bottom: 0,
            },
            radar: {
                indicator: [
                    { name: '水润度', max: 100 },
                    { name: '弹性', max: 100 },
                    { name: '色沉', max: 100 },
                    { name: '皱纹', max: 100 },
                    { name: '炎症', max: 100 },
                ],
                center: ['50%', '55%'],
                radius: '60%',
            },
            series: [{
                type: 'radar',
                data: [
                    {
                        value: [
                            first.metrics?.hydration || 0,
                            first.metrics?.elasticity || 0,
                            first.metrics?.pigmentation || 0,
                            first.metrics?.wrinkles || 0,
                            first.metrics?.inflammation || 0,
                        ],
                        name: '首次诊断',
                        areaStyle: { color: 'rgba(134, 144, 156, 0.3)' },
                        lineStyle: { color: '#86909C' },
                    },
                    {
                        value: [
                            latest.metrics?.hydration || 0,
                            latest.metrics?.elasticity || 0,
                            latest.metrics?.pigmentation || 0,
                            latest.metrics?.wrinkles || 0,
                            latest.metrics?.inflammation || 0,
                        ],
                        name: '最新诊断',
                        areaStyle: { color: 'rgba(22, 93, 255, 0.3)' },
                        lineStyle: { color: '#165DFF' },
                    },
                ],
            }],
        };
    };

    if (loading) {
        return <Spin style={{ display: 'block', margin: '50px auto' }} />;
    }

    if (exams.length === 0) {
        return <Empty description="暂无诊断记录，无法生成趋势分析" />;
    }

    const radarOption = getRadarCompareOption();

    return (
        <div>
            <Typography.Title heading={6} style={{ marginBottom: 16 }}>
                肤质趋势分析
            </Typography.Title>

            {/* 筛选器 */}
            <Space style={{ marginBottom: 16 }}>
                <span>选择指标：</span>
                <Select
                    value={selectedMetric}
                    onChange={setSelectedMetric}
                    style={{ width: 150 }}
                >
                    <Select.Option value="all">全部指标</Select.Option>
                    {Object.entries(metricConfig).map(([key, config]) => (
                        <Select.Option key={key} value={key}>{config.name}</Select.Option>
                    ))}
                </Select>
            </Space>

            <Row gutter={16}>
                <Col span={radarOption ? 14 : 24}>
                    <Card title="趋势曲线">
                        <ReactECharts option={getLineChartOption()} style={{ height: 350 }} />
                    </Card>
                </Col>
                {radarOption && (
                    <Col span={10}>
                        <Card title="改善对比">
                            <ReactECharts option={radarOption} style={{ height: 350 }} />
                        </Card>
                    </Col>
                )}
            </Row>

            {/* 统计卡片 */}
            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={6}>
                    <Card>
                        <Typography.Text type="secondary">诊断次数</Typography.Text>
                        <Typography.Title heading={4} style={{ margin: '8px 0 0' }}>
                            {exams.length} 次
                        </Typography.Title>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Typography.Text type="secondary">首次诊断</Typography.Text>
                        <Typography.Title heading={4} style={{ margin: '8px 0 0' }}>
                            {new Date(exams[0]?.created_at).toLocaleDateString()}
                        </Typography.Title>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Typography.Text type="secondary">最近诊断</Typography.Text>
                        <Typography.Title heading={4} style={{ margin: '8px 0 0' }}>
                            {new Date(exams[exams.length - 1]?.created_at).toLocaleDateString()}
                        </Typography.Title>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Typography.Text type="secondary">水润度变化</Typography.Text>
                        <Typography.Title
                            heading={4}
                            style={{
                                margin: '8px 0 0',
                                color: (exams[exams.length - 1]?.metrics?.hydration || 0) > (exams[0]?.metrics?.hydration || 0)
                                    ? '#00B42A' : '#F53F3F'
                            }}
                        >
                            {((exams[exams.length - 1]?.metrics?.hydration || 0) - (exams[0]?.metrics?.hydration || 0)).toFixed(0)}
                        </Typography.Title>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Trend;

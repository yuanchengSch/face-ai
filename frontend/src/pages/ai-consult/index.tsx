import React, { useState } from 'react';
import { Card, Grid, Upload, Button, Message, Typography, Tag, Divider, Spin, Statistic, Space, Alert, Result } from '@arco-design/web-react';
import { IconCamera, IconRefresh } from '@arco-design/web-react/icon';
import ReactECharts from 'echarts-for-react';

const { Row, Col } = Grid;

// 模拟 AI 分析结果
const mockAnalyze = () => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            const metrics = {
                skin_age: Math.floor(Math.random() * 10) + 25,
                hydration: Math.floor(Math.random() * 30) + 55,
                inflammation: Math.floor(Math.random() * 40) + 20,
                elasticity: Math.floor(Math.random() * 25) + 60,
                pigmentation: Math.floor(Math.random() * 35) + 25,
                wrinkles: Math.floor(Math.random() * 30) + 15,
            };
            resolve({
                metrics,
                advice_summary: "根据AI分析，您的肌肤整体状态良好，建议加强日常保湿护理。",
                detailed_advice: "【护理建议】\n1. 每日使用高保湿精华，重点关注T区和眼周\n2. 每周敷补水面膜2-3次\n3. 注意防晒，使用SPF30以上防晒霜\n\n【作息建议】\n1. 保持规律睡眠，建议晚11点前入睡\n2. 适量运动，促进血液循环\n\n【饮食建议】\n1. 多喝水，每日至少1500ml\n2. 减少辛辣刺激食物\n3. 多摄入富含维C的水果蔬菜",
                ai_provider: "ModelScope-DeepSeek-V3.2"
            });
        }, 2000);
    });
};

const AiConsult = () => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleUpload = async (file: File) => {
        // 创建本地预览
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        setResult(null);
        return false;
    };

    const handleAnalyze = async () => {
        if (!imageUrl) {
            Message.warning('请先上传照片');
            return;
        }

        setAnalyzing(true);
        try {
            const res = await mockAnalyze();
            setResult(res);
            Message.success('AI 分析完成');
        } catch (error) {
            Message.error('分析失败，请重试');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleReset = () => {
        setImageUrl('');
        setResult(null);
    };

    // 雷达图配置
    const getRadarOption = (metrics: any) => {
        if (!metrics) return {};
        return {
            radar: {
                indicator: [
                    { name: '水润度', max: 100 },
                    { name: '弹性', max: 100 },
                    { name: '平滑度', max: 100 },
                    { name: '均匀度', max: 100 },
                    { name: '紧致度', max: 100 },
                ],
                center: ['50%', '55%'],
                radius: '65%'
            },
            series: [{
                type: 'radar',
                data: [{
                    value: [
                        metrics.hydration || 60,
                        metrics.elasticity || 70,
                        100 - (metrics.wrinkles || 20),
                        100 - (metrics.pigmentation || 30),
                        metrics.elasticity || 65
                    ],
                    name: '肤质评分',
                    areaStyle: { color: 'rgba(22,93,255, 0.4)' },
                    itemStyle: { color: '#165DFF' }
                }]
            }]
        };
    };

    return (
        <div>
            <Typography.Title heading={4} style={{ marginBottom: 24 }}>
                AI 面容智能诊断
            </Typography.Title>

            <Alert
                type="info"
                content="上传面部照片，AI 将自动分析您的肤质状况并给出个性化建议。本演示使用模拟数据，实际使用请在患者详情页进行诊断。"
                style={{ marginBottom: 24 }}
            />

            <Row gutter={24}>
                {/* 左侧：图片上传 */}
                <Col span={8}>
                    <Card title="上传照片" style={{ height: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            {imageUrl ? (
                                <div style={{ marginBottom: 16 }}>
                                    <img
                                        src={imageUrl}
                                        alt="Face"
                                        style={{
                                            width: '100%',
                                            maxHeight: 300,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                            border: '2px solid #165DFF'
                                        }}
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    height: 250,
                                    background: '#f2f3f5',
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 16
                                }}>
                                    <IconCamera style={{ fontSize: 48, color: '#c9cdd4' }} />
                                </div>
                            )}

                            <Upload
                                accept="image/*"
                                fileList={[]}
                                beforeUpload={(file) => handleUpload(file)}
                            >
                                <Button type="outline" icon={<IconCamera />}>
                                    选择照片
                                </Button>
                            </Upload>
                        </div>

                        <Divider />

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                long
                                size="large"
                                loading={analyzing}
                                onClick={handleAnalyze}
                                disabled={!imageUrl}
                            >
                                {analyzing ? 'AI 分析中...' : '开始 AI 分析'}
                            </Button>

                            {(imageUrl || result) && (
                                <Button
                                    long
                                    icon={<IconRefresh />}
                                    onClick={handleReset}
                                >
                                    重新开始
                                </Button>
                            )}
                        </Space>
                    </Card>
                </Col>

                {/* 右侧：分析结果 */}
                <Col span={16}>
                    {analyzing ? (
                        <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Spin tip="AI 正在分析您的肤质，请稍候..." size={40} />
                        </Card>
                    ) : result ? (
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            {/* 核心指标卡片 */}
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Card bordered={false} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                        <div style={{ color: '#fff' }}>
                                            <Statistic
                                                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>推测肌龄</span>}
                                                value={result.metrics?.skin_age}
                                                suffix="岁"
                                            />
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card bordered={false} style={{ background: '#f7f8fa' }}>
                                        <div style={{ color: result.metrics?.inflammation > 50 ? '#f53f3f' : '#00b42a' }}>
                                            <Statistic title="炎症风险" value={result.metrics?.inflammation} suffix="%" />
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card bordered={false} style={{ background: '#f7f8fa' }}>
                                        <Statistic title="水润度" value={result.metrics?.hydration} suffix="/100" />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card bordered={false} style={{ background: '#f7f8fa' }}>
                                        <Statistic title="弹性" value={result.metrics?.elasticity} suffix="/100" />
                                    </Card>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={10}>
                                    <Card title="综合评分">
                                        <ReactECharts option={getRadarOption(result.metrics)} style={{ height: 280 }} />
                                    </Card>
                                </Col>
                                <Col span={14}>
                                    <Card title="AI 诊断建议">
                                        <Tag color="arcoblue" style={{ marginBottom: 12 }}>
                                            {result.ai_provider}
                                        </Tag>

                                        <Typography.Paragraph style={{ fontWeight: 'bold', color: '#165DFF' }}>
                                            {result.advice_summary}
                                        </Typography.Paragraph>

                                        <Divider />

                                        <Typography.Paragraph style={{ whiteSpace: 'pre-line', color: '#4e5969' }}>
                                            {result.detailed_advice}
                                        </Typography.Paragraph>
                                    </Card>
                                </Col>
                            </Row>
                        </Space>
                    ) : (
                        <Card style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Result
                                icon={<IconCamera style={{ fontSize: 64, color: '#c9cdd4' }} />}
                                title="请上传照片"
                                subTitle="上传面部照片后点击「开始 AI 分析」按钮"
                            />
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default AiConsult;

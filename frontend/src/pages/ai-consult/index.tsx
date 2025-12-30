import React, { useState, useRef, useEffect } from 'react';
import { Card, Grid, Upload, Button, Message, Typography, Tag, Divider, Spin, Statistic, Space, Alert, Result, Tabs, Input } from '@arco-design/web-react';
import { IconCamera, IconRefresh, IconRobot, IconSend } from '@arco-design/web-react/icon';
import ReactECharts from 'echarts-for-react';
import { tcmConsult, ChatMessage } from '../../api/ai';

const { Row, Col } = Grid;
const { TabPane } = Tabs;

// ======================== 面容诊断模块 ========================

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
                ai_provider: "ModelScope-DeepSeek-V3"
            });
        }, 2000);
    });
};

// 面容诊断组件
const FaceDiagnosis = () => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleUpload = async (file: File) => {
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
        <Row gutter={24}>
            {/* 左侧：图片上传 */}
            <Col span={8}>
                <Card title="上传照片" className="glass-card" style={{ height: '100%' }} bordered={false}>
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
                                        borderRadius: 12,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{
                                height: 250,
                                background: 'rgba(242, 243, 245, 0.5)',
                                borderRadius: 12,
                                border: '1px dashed #c9cdd4',
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
                            <Button type="outline" icon={<IconCamera />} style={{ borderRadius: 8 }}>
                                选择照片
                            </Button>
                        </Upload>
                    </div>

                    <Divider style={{ margin: '24px 0' }} />

                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button
                            type="primary"
                            long
                            size="large"
                            loading={analyzing}
                            onClick={handleAnalyze}
                            disabled={!imageUrl}
                            style={{ borderRadius: 8, boxShadow: '0 4px 10px rgba(22,93,255,0.3)' }}
                        >
                            {analyzing ? 'AI 分析中...' : '开始 AI 分析'}
                        </Button>

                        {(imageUrl || result) && (
                            <Button
                                long
                                icon={<IconRefresh />}
                                onClick={handleReset}
                                style={{ borderRadius: 8 }}
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
                    <Card className="glass-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} bordered={false}>
                        <Spin tip="AI 正在分析您的肤质，请稍候..." size={40} />
                    </Card>
                ) : result ? (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Card bordered={false} className="glass-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 12 }}>
                                    <div style={{ color: '#fff' }}>
                                        <Statistic
                                            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>推测肌龄</span>}
                                            value={result.metrics?.skin_age}
                                            suffix="岁"
                                            styleValue={{ color: '#fff', fontWeight: 600 }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card bordered={false} className="glass-card">
                                    <div style={{ color: result.metrics?.inflammation > 50 ? '#f53f3f' : '#00b42a' }}>
                                        <Statistic title="炎症风险" value={result.metrics?.inflammation} suffix="%" styleValue={{ fontWeight: 600 }} />
                                    </div>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card bordered={false} className="glass-card">
                                    <Statistic title="水润度" value={result.metrics?.hydration} suffix="/100" styleValue={{ fontWeight: 600 }} />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card bordered={false} className="glass-card">
                                    <Statistic title="弹性" value={result.metrics?.elasticity} suffix="/100" styleValue={{ fontWeight: 600 }} />
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={10}>
                                <Card title="综合评分" className="glass-card" bordered={false}>
                                    <ReactECharts option={getRadarOption(result.metrics)} style={{ height: 280 }} />
                                </Card>
                            </Col>
                            <Col span={14}>
                                <Card title="AI 诊断建议" className="glass-card" bordered={false}>
                                    <Tag color="arcoblue" style={{ marginBottom: 12 }}>
                                        {result.ai_provider}
                                    </Tag>
                                    <Typography.Paragraph style={{ fontWeight: 'bold', color: '#165DFF', fontSize: 16 }}>
                                        {result.advice_summary}
                                    </Typography.Paragraph>
                                    <Divider />
                                    <Typography.Paragraph style={{ whiteSpace: 'pre-line', color: '#4e5969', lineHeight: 1.8 }}>
                                        {result.detailed_advice}
                                    </Typography.Paragraph>
                                </Card>
                            </Col>
                        </Row>
                    </Space>
                ) : (
                    <Card className="glass-card" style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} bordered={false}>
                        <Result
                            icon={<IconCamera style={{ fontSize: 64, color: '#c9cdd4' }} />}
                            title="请上传照片"
                            subTitle="上传面部照片后点击「开始 AI 分析」按钮"
                        />
                    </Card>
                )}
            </Col>
        </Row>
    );
};

// ======================== 中医问诊模块 ========================

interface TCMMessage {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    time: string;
}

const TCMConsultation = () => {
    const [messages, setMessages] = useState<TCMMessage[]>([
        {
            id: '1',
            sender: 'ai',
            content: '您好！我是中医美容智能助手。请描述您的症状或咨询问题，例如：\n\n• 皮肤问题（痘痘、色斑、干燥等）\n• 身体状况（睡眠、压力、饮食等）\n• 美容养生建议\n\n我将根据中医理论为您分析并给出调理建议。',
            time: new Date().toLocaleString('zh-CN', { hour12: false })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userContent = inputValue.trim();
        const newUserMsg: TCMMessage = {
            id: Date.now().toString(),
            sender: 'user',
            content: userContent,
            time: new Date().toLocaleString('zh-CN', { hour12: false })
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setLoading(true);

        try {
            // 构建历史消息
            const history: ChatMessage[] = messages.slice(-6).map(m => ({
                sender: m.sender === 'user' ? 'patient' : 'doctor',
                content: m.content
            }));

            const res = await tcmConsult(userContent, history);

            const newAiMsg: TCMMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                content: res.reply || '抱歉，暂时无法获取 AI 建议，请稍后重试。',
                time: new Date().toLocaleString('zh-CN', { hour12: false })
            };
            setMessages(prev => [...prev, newAiMsg]);

        } catch (error: any) {
            console.error('AI Consult Error:', error);
            const errorMsg = error?.response?.data?.detail || error?.message || '网络错误';
            Message.error(`AI 响应失败: ${errorMsg}`);

            // 降级到 mock 响应
            const mockReply = getMockTCMResponse(userContent);
            const newAiMsg: TCMMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                content: mockReply,
                time: new Date().toLocaleString('zh-CN', { hour12: false })
            };
            setMessages(prev => [...prev, newAiMsg]);
        } finally {
            setLoading(false);
        }
    };

    // Mock 响应备用
    const getMockTCMResponse = (message: string): string => {
        if (message.includes('失眠') || message.includes('睡眠')) {
            return `根据您描述的失眠症状，中医认为可能与**心脾两虚**或**肝郁化火**有关。

【辩证分析】
• 若伴有面色萎黄、食欲不振 → 脾虚血亏，心神失养
• 若伴有烦躁易怒、口苦口干 → 肝火上扰心神

【内调建议】
1. 食疗：睡前可饮用酸枣仁汤（酸枣仁15g、茯苓10g、知母6g）
2. 穴位按摩：睡前按揉安眠穴、神门穴各3分钟

【外养建议】
• 晚间护肤可选用含薰衣草精油的产品
• 避免睡前使用电子产品

建议您来院详细问诊，结合舌诊脉诊给出更精准的调理方案。`;
        } else if (message.includes('痘') || message.includes('痤疮') || message.includes('粉刺')) {
            return `从中医角度分析，反复长痘多与**肺胃热盛**或**湿热蕴结**相关。

【辩证分析】
• 额头 → 心火旺盛
• 下巴 → 肾阴不足、冲任失调
• 两颊 → 肝胆湿热

【内调建议】
1. 食疗：绿豆薏米粥（清热利湿）、金银花茶（清热解毒）
2. 忌口：辛辣油腻、甜食奶制品

【外养建议】
• 可使用含金银花、黄芩提取物的护肤品
• 穴位按摩：合谷穴、曲池穴（清热解表）

如果症状严重，建议进行面诊配合中药内服外敷综合治疗。`;
        } else if (message.includes('干燥') || message.includes('干') || message.includes('保湿')) {
            return `皮肤干燥从中医角度看，多与**阴虚血燥**或**肺气不足**有关。

【辩证分析】
• 全身干燥 → 阴虚内热，津液亏损
• 局部干燥 → 气血运行不畅

【内调建议】
1. 食疗：银耳雪梨羹、蜂蜜水、芝麻核桃糊
2. 多喝温水，每日1500-2000ml
3. 少食辛辣燥热之品

【外养建议】
• 使用含透明质酸、神经酰胺的保湿产品
• 每周敷补水面膜2-3次
• 按揉三阴交、足三里穴位

秋冬季节尤其需要注意滋阴润燥，内外兼修。`;
        } else {
            return `感谢您的咨询。根据您的描述，我初步分析如下：

【中医视角】
皮肤问题往往与脏腑功能失调相关，常见的有：
• 脾虚湿盛 → 面色萎黄、浮肿
• 肝郁气滞 → 黄褐斑、情绪性皮肤问题
• 肾虚 → 皮肤松弛、黑眼圈

【建议】
1. 详细描述您的症状，以便我给出更针对性的建议
2. 可以说明症状持续时间、加重因素等
3. 中医美容强调内外兼修，建议配合药膳食疗

如需进一步了解，请描述更多症状细节。`;
        }
    };

    const handleClear = () => {
        setMessages([{
            id: '1',
            sender: 'ai',
            content: '对话已清空。请继续描述您的症状或咨询问题。',
            time: new Date().toLocaleString('zh-CN', { hour12: false })
        }]);
    };

    return (
        <Row gutter={24}>
            <Col span={24}>
                <Card
                    title={
                        <Space>
                            <IconRobot style={{ color: '#00B42A' }} />
                            中医美容智能问诊
                        </Space>
                    }
                    extra={
                        <Button size="small" onClick={handleClear} type="text">
                            清空对话
                        </Button>
                    }
                    className="glass-card"
                    style={{ height: 650 }}
                    bordered={false}
                    bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', display: 'flex', flexDirection: 'column' }}
                >
                    {/* 消息列表 */}
                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: 24,
                            background: '#fafafa'
                        }}
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    marginBottom: 20,
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{ maxWidth: '80%' }}>
                                    <div style={{
                                        fontSize: 12,
                                        color: '#86909C',
                                        marginBottom: 6,
                                        textAlign: msg.sender === 'user' ? 'right' : 'left'
                                    }}>
                                        {msg.sender === 'ai' && <IconRobot style={{ marginRight: 4, color: '#00B42A' }} />}
                                        {msg.sender === 'user' ? '我' : '中医 AI 助手'} · {msg.time}
                                    </div>
                                    <div style={{
                                        background: msg.sender === 'user' ? 'linear-gradient(135deg, #165DFF 0%, #00B42A 100%)' : '#fff',
                                        color: msg.sender === 'user' ? '#fff' : '#1D2129',
                                        padding: '12px 16px',
                                        borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.6,
                                        fontSize: 14,
                                        border: msg.sender === 'user' ? 'none' : '1px solid #f2f3f5'
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <Spin dot />
                                <div style={{ fontSize: 12, color: '#86909C', marginTop: 8 }}>
                                    AI 正在思考辩证中...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 输入区域 */}
                    <div style={{
                        padding: 16,
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        background: '#fff'
                    }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Input.TextArea
                                style={{ flex: 1, borderRadius: 8, border: '1px solid #e5e6eb' }}
                                placeholder="请描述您的症状（如：最近失眠多梦、皮肤干燥、长痘等）..."
                                autoSize={{ minRows: 2, maxRows: 4 }}
                                value={inputValue}
                                onChange={(val) => setInputValue(val)}
                                onPressEnter={(e) => {
                                    if (!e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <Button
                                type="primary"
                                style={{ height: 'auto', minWidth: 80, borderRadius: 8, background: '#165DFF', boxShadow: '0 4px 10px rgba(22,93,255,0.2)' }}
                                onClick={handleSend}
                                loading={loading}
                                icon={<IconSend />}
                            >
                                发送
                            </Button>
                        </div>
                        <div style={{ fontSize: 12, color: '#86909C', marginTop: 8, paddingLeft: 4 }}>
                            提示：按 Enter 发送，Shift + Enter 换行。本功能基于 AI 提供参考建议，具体诊疗请咨询专业医师。
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

// ======================== 主组件 ========================

const AiConsult = () => {
    const [activeTab, setActiveTab] = useState('face');

    return (
        <div>
            <Typography.Title heading={5} style={{ marginBottom: 8, marginTop: 0 }}>
                <span className="gradient-text">AI 智能诊断中心</span>
            </Typography.Title>

            <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                type="card-gutter"
                style={{ marginBottom: 24 }}
            >
                <TabPane
                    key="face"
                    title={
                        <Space>
                            <IconCamera />
                            面容诊断
                        </Space>
                    }
                >
                    <Alert
                        type="info"
                        content="上传面部照片，AI 将自动分析您的肤质状况并给出个性化护理建议。本演示使用模拟数据，实际使用请在患者详情页进行诊断。"
                        style={{ marginBottom: 24, borderRadius: 8 }}
                    />
                    <FaceDiagnosis />
                </TabPane>

                <TabPane
                    key="tcm"
                    title={
                        <Space>
                            <IconRobot />
                            中医问诊
                        </Space>
                    }
                >
                    <Alert
                        type="success"
                        content="基于中医理论的 AI 问诊助手，可以分析您的症状并提供辩证施治建议。请详细描述症状以获取更准确的分析。"
                        style={{ marginBottom: 24, borderRadius: 8 }}
                    />
                    <TCMConsultation />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default AiConsult;

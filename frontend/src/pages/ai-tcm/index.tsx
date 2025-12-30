import React, { useState, useRef, useEffect } from 'react';
import {
    Card, Input, Button, Space, Tag, Typography, Spin,
    Grid, Avatar, Divider
} from '@arco-design/web-react';
import {
    IconSend, IconDelete, IconRobot, IconUser,
    IconSun, IconMoon, IconThunderbolt
} from '@arco-design/web-react/icon';
import request from '../../utils/request';

const { Row, Col } = Grid;
const { TextArea } = Input;

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// 快捷问题列表
const quickQuestions = [
    { label: '皮肤干燥', question: '我最近皮肤很干燥，脱皮，用什么护肤品都没用，从中医角度应该怎么调理？' },
    { label: '面部暗沉', question: '我脸色发黄发暗，没有光泽，中医怎么解释？该怎么改善？' },
    { label: '痘痘问题', question: '我经常长痘痘，尤其在下巴和额头，中医认为是什么原因？怎么调理？' },
    { label: '敏感泛红', question: '我的皮肤很敏感，容易泛红发热，中医有什么好的办法吗？' },
    { label: '眼袋黑眼圈', question: '我眼袋很重，黑眼圈也深，从中医角度看是什么问题？' },
    { label: '抗衰老', question: '我想抗衰老，中医有什么养颜的方法推荐吗？' },
];

// 节气信息（示例）
const jieqiInfo = {
    name: '小寒',
    date: '2024年1月6日',
    description: '小寒是二十四节气中的第23个节气，标志着一年中最寒冷的日子即将到来。',
    skinCare: '此时皮肤易干燥缺水，应注重保湿滋润，避免过度清洁。',
    diet: ['羊肉', '核桃', '红枣', '桂圆', '黑芝麻'],
    avoid: ['生冷食物', '寒凉水果', '过度进补'],
};

const AiTcmConsult: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            role: 'assistant',
            content: '您好！我是您的 AI 中医美容顾问。\n\n我精通中医基础理论，包括阴阳五行、脏腑经络、面诊舌诊等，可以为您提供专业的中医美容养生建议。\n\n请描述您的皮肤问题或健康困扰，我会从中医角度为您分析和建议。',
            timestamp: new Date(),
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingIndexRef = useRef(0);

    // 滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, displayText]);

    // 打字机效果
    const typeWriter = (text: string, callback?: () => void) => {
        setIsTyping(true);
        setDisplayText('');
        typingIndexRef.current = 0;

        const type = () => {
            if (typingIndexRef.current < text.length) {
                setDisplayText(text.slice(0, typingIndexRef.current + 1));
                typingIndexRef.current++;
                setTimeout(type, 20); // 打字速度
            } else {
                setIsTyping(false);
                callback?.();
            }
        };
        type();
    };

    // 发送消息
    const handleSend = async (question?: string) => {
        const text = question || inputValue.trim();
        if (!text || loading) return;

        // 添加用户消息
        const userMsg: Message = {
            id: Date.now(),
            role: 'user',
            content: text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setLoading(true);

        try {
            // 调用 AI 接口
            const response = await request<any, { reply: string }>({
                url: '/ai/chat',
                method: 'POST',
                data: {
                    message: text,
                    history: messages.slice(-6).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }
            });

            // 打字机效果显示回复
            if (response?.reply) {
                typeWriter(response.reply, () => {
                    const aiMsg: Message = {
                        id: Date.now() + 1,
                        role: 'assistant',
                        content: response.reply,
                        timestamp: new Date(),
                    };
                    setMessages(prev => [...prev, aiMsg]);
                    setDisplayText('');
                });
            }
        } catch (e) {
            console.error(e);
            const errorMsg: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: '抱歉，AI 服务暂时不可用，请稍后再试。',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    // 清空对话
    const handleClear = () => {
        setMessages([{
            id: 0,
            role: 'assistant',
            content: '对话已清空。请问有什么可以帮助您的？',
            timestamp: new Date(),
        }]);
    };

    return (
        <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            {/* 页面标题 */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography.Title heading={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #8B4513 0%, #D4AF37 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 700
                        }}>
                            🏥 AI 中医问诊
                        </span>
                    </Typography.Title>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        融合传统中医智慧与现代 AI 技术，为您提供专业的美容养生建议
                    </Typography.Text>
                </div>
                <Button icon={<IconDelete />} onClick={handleClear}>清空对话</Button>
            </div>

            {/* 主内容区 */}
            <Row gutter={16} style={{ flex: 1, minHeight: 0 }}>
                {/* 左侧：快捷问题 */}
                <Col span={5}>
                    <Card
                        title="✨ 常见问题"
                        size="small"
                        style={{ height: '100%' }}
                        bodyStyle={{ padding: 12 }}
                    >
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            {quickQuestions.map((q, idx) => (
                                <Tag
                                    key={idx}
                                    color="arcoblue"
                                    style={{
                                        cursor: 'pointer',
                                        padding: '6px 12px',
                                        width: '100%',
                                        textAlign: 'center',
                                        borderRadius: 16
                                    }}
                                    onClick={() => handleSend(q.question)}
                                >
                                    {q.label}
                                </Tag>
                            ))}
                        </Space>

                        <Divider style={{ margin: '16px 0' }} />

                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                            💡 提示：点击上方标签快速提问，或在下方输入您的具体问题
                        </Typography.Text>
                    </Card>
                </Col>

                {/* 中间：对话区 */}
                <Col span={13}>
                    <Card
                        style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'linear-gradient(180deg, #FFFBF0 0%, #FFF 100%)'
                        }}
                        bodyStyle={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 0,
                            minHeight: 0
                        }}
                    >
                        {/* 消息列表 */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: 16,
                            minHeight: 0
                        }}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        marginBottom: 16,
                                    }}
                                >
                                    {msg.role === 'assistant' && (
                                        <Avatar
                                            size={36}
                                            style={{
                                                backgroundColor: '#8B4513',
                                                marginRight: 8,
                                                flexShrink: 0
                                            }}
                                        >
                                            <IconRobot />
                                        </Avatar>
                                    )}
                                    <div
                                        style={{
                                            maxWidth: '75%',
                                            padding: '10px 14px',
                                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                            background: msg.role === 'user'
                                                ? 'linear-gradient(135deg, #165DFF 0%, #0E42D2 100%)'
                                                : '#F7F8FA',
                                            color: msg.role === 'user' ? '#fff' : '#1D2129',
                                            fontSize: 14,
                                            lineHeight: 1.6,
                                            whiteSpace: 'pre-wrap',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                        }}
                                    >
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <Avatar
                                            size={36}
                                            style={{
                                                backgroundColor: '#165DFF',
                                                marginLeft: 8,
                                                flexShrink: 0
                                            }}
                                        >
                                            <IconUser />
                                        </Avatar>
                                    )}
                                </div>
                            ))}

                            {/* 正在输入的消息（打字机效果） */}
                            {isTyping && displayText && (
                                <div style={{ display: 'flex', marginBottom: 16 }}>
                                    <Avatar
                                        size={36}
                                        style={{ backgroundColor: '#8B4513', marginRight: 8 }}
                                    >
                                        <IconRobot />
                                    </Avatar>
                                    <div
                                        style={{
                                            maxWidth: '75%',
                                            padding: '10px 14px',
                                            borderRadius: '16px 16px 16px 4px',
                                            background: '#F7F8FA',
                                            fontSize: 14,
                                            lineHeight: 1.6,
                                            whiteSpace: 'pre-wrap',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                        }}
                                    >
                                        {displayText}
                                        <span style={{
                                            display: 'inline-block',
                                            width: 6,
                                            height: 16,
                                            background: '#8B4513',
                                            marginLeft: 2,
                                            animation: 'blink 1s infinite'
                                        }} />
                                    </div>
                                </div>
                            )}

                            {/* 加载中 */}
                            {loading && !isTyping && (
                                <div style={{ display: 'flex', marginBottom: 16 }}>
                                    <Avatar
                                        size={36}
                                        style={{ backgroundColor: '#8B4513', marginRight: 8 }}
                                    >
                                        <IconRobot />
                                    </Avatar>
                                    <div style={{
                                        padding: '10px 14px',
                                        background: '#F7F8FA',
                                        borderRadius: '16px 16px 16px 4px'
                                    }}>
                                        <Spin size={16} /> <span style={{ marginLeft: 8, color: '#86909C' }}>思考中...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* 输入区 */}
                        <div style={{
                            padding: 16,
                            borderTop: '1px solid #E5E6EB',
                            background: '#fff'
                        }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <TextArea
                                    value={inputValue}
                                    onChange={setInputValue}
                                    placeholder="请描述您的皮肤问题或健康困扰..."
                                    autoSize={{ minRows: 1, maxRows: 3 }}
                                    style={{ flex: 1 }}
                                    onPressEnter={(e) => {
                                        if (!e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <Button
                                    type="primary"
                                    icon={<IconSend />}
                                    loading={loading}
                                    onClick={() => handleSend()}
                                    style={{
                                        background: 'linear-gradient(135deg, #8B4513 0%, #D4AF37 100%)',
                                        border: 'none'
                                    }}
                                >
                                    发送
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* 右侧：节气信息 */}
                <Col span={6}>
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        {/* 节气卡片 */}
                        <Card
                            size="small"
                            style={{
                                background: 'linear-gradient(135deg, #E8F5E9 0%, #FFF9C4 100%)',
                                border: 'none'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: 12 }}>
                                <IconSun style={{ fontSize: 32, color: '#FF9800' }} />
                                <Typography.Title heading={5} style={{ margin: '8px 0 4px' }}>
                                    {jieqiInfo.name}
                                </Typography.Title>
                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                    {jieqiInfo.date}
                                </Typography.Text>
                            </div>
                            <Typography.Paragraph style={{ fontSize: 12, marginBottom: 0 }}>
                                {jieqiInfo.description}
                            </Typography.Paragraph>
                        </Card>

                        {/* 护肤建议 */}
                        <Card title="🧴 护肤重点" size="small">
                            <Typography.Text style={{ fontSize: 12 }}>
                                {jieqiInfo.skinCare}
                            </Typography.Text>
                        </Card>

                        {/* 饮食建议 */}
                        <Card title="🍲 宜吃食物" size="small">
                            <Space wrap size={4}>
                                {jieqiInfo.diet.map((food, idx) => (
                                    <Tag key={idx} color="green" size="small">{food}</Tag>
                                ))}
                            </Space>
                        </Card>

                        {/* 忌口 */}
                        <Card title="⚠️ 注意事项" size="small">
                            <Space wrap size={4}>
                                {jieqiInfo.avoid.map((item, idx) => (
                                    <Tag key={idx} color="orange" size="small">{item}</Tag>
                                ))}
                            </Space>
                        </Card>
                    </Space>
                </Col>
            </Row>

            {/* 打字机光标动画样式 */}
            <style>{`
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default AiTcmConsult;

import React, { useState, useRef, useEffect } from 'react';
import { Card, Avatar, Typography, Space, Tag, Input, Button, Spin, Message as ArcoMessage } from '@arco-design/web-react';
import { IconUser, IconSend, IconRobot } from '@arco-design/web-react/icon';
import { tcmConsult, ChatMessage } from '../../../api/ai';

interface Message {
    id: string;
    sender: 'doctor' | 'patient' | 'ai';
    name: string;
    content: string;
    time: string;
}

const ConsultationChat = ({ patientName }: { patientName: string }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'patient',
            name: patientName,
            content: '医生您好，我最近半年脸部痘痘长得特别厉害，主要集中在额头和下巴，反复复发的，有的还会红肿疼。自己用了不少祛痘产品都没效果，想问问您这边有没有专业的解决办法？',
            time: '2025-12-02 08:56'
        },
        {
            id: '2',
            sender: 'doctor',
            name: '美容医生 (张医生)',
            content: '您好李女士，先别着急，我先了解下情况。这些痘痘是一直持续长，还是呈周期性前后会加重呀？除了红肿疼，有没有化脓、留痘印的情况？',
            time: '2025-12-02 08:59'
        },
        {
            id: '3',
            sender: 'patient',
            name: patientName,
            content: '经期前后会明显变多，红肿的痘痘按压会痛，有的破了之后会留深色的印子，好久都消不掉，特别影响美观。',
            time: '2025-12-02 09:08'
        },
        {
            id: '4',
            sender: 'doctor',
            name: '美容医生 (张医生)',
            content: '和激素有很大关系，但不全是的。油性皮肤皮脂分泌旺盛，容易堵塞毛孔，再加上经期激素波动，就容易诱发炎性痤疮。另外，平时作息、饮食习惯也有影响。',
            time: '2025-12-02 09:12'
        },
    ]);

    const [isAiMode, setIsAiMode] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isAiMode]);

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userContent = inputValue.trim();
        const newUserMsg: Message = {
            id: Date.now().toString(),
            sender: 'patient',
            name: '患者问诊',
            content: userContent,
            time: new Date().toLocaleString('zh-CN', { hour12: false })
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setLoading(true);

        try {
            // Convert to history format expected by API (only include recent relevant messages)
            const recentMessages = messages.slice(-6); // Keep last 6 messages for context
            const history: ChatMessage[] = recentMessages.map(m => ({
                sender: m.sender === 'patient' ? 'patient' : 'doctor',
                content: m.content
            }));

            const res = await tcmConsult(userContent, history);

            const newAiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                name: '中医美容专家 (AI)',
                content: res.reply || '抱歉，暂时无法获取 AI 建议，请稍后重试。',
                time: new Date().toLocaleString('zh-CN', { hour12: false })
            };
            setMessages(prev => [...prev, newAiMsg]);

        } catch (error: any) {
            console.error('AI Consult Error:', error);
            const errorMsg = error?.response?.data?.detail || error?.message || '网络错误';
            ArcoMessage.error(`AI 响应失败: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>咨询记录</span>
                    <Space>
                        <Tag color={isAiMode ? "green" : "gray"} onClick={() => setIsAiMode(!isAiMode)} style={{ cursor: 'pointer' }}>
                            {isAiMode ? "AI 模式已开启" : "AI 辅助已关闭"}
                        </Tag>
                    </Space>
                </div>
            }
            style={{ marginTop: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}
        >
            {/* 消息列表区域 */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0 16px' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Typography.Text style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: msg.sender === 'doctor' ? '#165DFF' : msg.sender === 'ai' ? '#00B42A' : '#1D2129'
                            }}>
                                {msg.sender === 'ai' && <IconRobot style={{ marginRight: 4 }} />}
                                {msg.name}
                            </Typography.Text>
                            <Typography.Text style={{ fontSize: 12, color: '#86909C' }}>
                                {msg.time}
                            </Typography.Text>
                        </div>
                        <div style={{
                            background: msg.sender === 'doctor' ? '#F0F5FF' : msg.sender === 'ai' ? '#E8FFEA' : '#F7F8FA',
                            padding: '12px',
                            borderRadius: 8,
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: '#4E5969',
                            border: msg.sender === 'ai' ? '1px solid #C6F4D0' : 'none',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <Spin dot />
                        <div style={{ fontSize: 12, color: '#86909C', marginTop: 8 }}>AI 专家正在思考辩证...</div>
                    </div>
                )}
            </div>

            {/* 底部输入框区域 */}
            {isAiMode ? (
                <div style={{ padding: 16, borderTop: '1px solid #F2F3F5', background: '#fff' }}>
                    <div style={{ display: 'flex' }}>
                        <Input.TextArea
                            style={{ flex: 1, marginRight: 12, background: '#F7F8FA', border: 'none' }}
                            placeholder="输入患者症状（如：最近失眠多梦，舌苔黄腻...）"
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
                        <Button type="primary" status="success" style={{ height: 'auto' }} onClick={handleSend} loading={loading}>
                            <IconSend />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => setIsAiMode(true)}
                    style={{
                        margin: 16,
                        background: '#F2F3F5',
                        color: '#4E5969',
                        padding: '12px',
                        borderRadius: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontSize: 13,
                        transition: 'all 0.3s'
                    }}
                >
                    <IconRobot style={{ marginRight: 8 }} /> 点击开启 AI 中医问诊模式
                </div>
            )}
        </Card>
    );
};

export default ConsultationChat;

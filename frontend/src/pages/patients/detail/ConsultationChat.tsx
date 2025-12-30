import React from 'react';
import { Card, Typography, Space, Tag, Button, Empty } from '@arco-design/web-react';
import { IconRobot, IconMessage } from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    sender: 'doctor' | 'patient';
    name: string;
    content: string;
    time: string;
}

// 模拟咨询记录数据
const mockMessages: Message[] = [
    {
        id: '1',
        sender: 'patient',
        name: '患者',
        content: '医生您好，我最近半年脸部痘痘长得特别厉害，主要集中在额头和下巴，反复复发的，有的还会红肿疼。',
        time: '2025-12-02 08:56'
    },
    {
        id: '2',
        sender: 'doctor',
        name: '张医生',
        content: '您好，先别着急。这些痘痘是一直持续长，还是呈周期性会加重呀？除了红肿疼，有没有化脓、留痘印的情况？',
        time: '2025-12-02 08:59'
    },
    {
        id: '3',
        sender: 'patient',
        name: '患者',
        content: '经期前后会明显变多，红肿的痘痘按压会痛，有的破了之后会留深色的印子，好久都消不掉。',
        time: '2025-12-02 09:08'
    },
    {
        id: '4',
        sender: 'doctor',
        name: '张医生',
        content: '和激素有很大关系。油性皮肤皮脂分泌旺盛，容易堵塞毛孔，再加上经期激素波动，就容易诱发炎性痤疮。建议配合中医调理。',
        time: '2025-12-02 09:12'
    },
];

const ConsultationChat = ({ patientName }: { patientName: string }) => {
    const navigate = useNavigate();

    // 使用患者名替换模拟数据中的"患者"
    const messages = mockMessages.map(m => ({
        ...m,
        name: m.sender === 'patient' ? patientName : m.name
    }));

    return (
        <Card
            title={
                <Space>
                    <IconMessage style={{ color: '#165DFF' }} />
                    咨询记录
                </Space>
            }
            extra={
                <Tag color="arcoblue" size="small">{messages.length} 条记录</Tag>
            }
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}
        >
            {/* 消息列表区域 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div key={msg.id} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Typography.Text style={{
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: msg.sender === 'doctor' ? '#165DFF' : '#1D2129'
                                }}>
                                    {msg.name}
                                </Typography.Text>
                                <Typography.Text style={{ fontSize: 11, color: '#86909C' }}>
                                    {msg.time}
                                </Typography.Text>
                            </div>
                            <div style={{
                                background: msg.sender === 'doctor' ? '#F0F5FF' : '#F7F8FA',
                                padding: '10px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                lineHeight: 1.6,
                                color: '#4E5969',
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    ))
                ) : (
                    <Empty description="暂无咨询记录" style={{ marginTop: 40 }} />
                )}
            </div>

            {/* 底部操作区 */}
            <div style={{
                padding: 12,
                borderTop: '1px solid #F2F3F5',
                background: 'linear-gradient(135deg, #E8FFEA 0%, #F0F5FF 100%)'
            }}>
                <Button
                    type="primary"
                    status="success"
                    long
                    icon={<IconRobot />}
                    onClick={() => navigate('/ai-consult')}
                >
                    前往 AI 诊断中心
                </Button>
                <div style={{ fontSize: 11, color: '#86909C', marginTop: 6, textAlign: 'center' }}>
                    进行中医问诊或面容诊断
                </div>
            </div>
        </Card>
    );
};

export default ConsultationChat;

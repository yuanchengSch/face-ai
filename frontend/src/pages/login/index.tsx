import React, { useState } from 'react';
import { Form, Input, Button, Message, Typography } from '@arco-design/web-react';
import { IconUser, IconLock } from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { login, setToken } from '../../api/auth';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const values = await form.validate();
            setLoading(true);

            const res = await login(values.username, values.password);
            setToken(res.access_token);

            Message.success('登录成功');
            navigate('/');
        } catch (error: any) {
            Message.error(error?.response?.data?.detail || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    const imageStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 全屏背景图 */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'url(https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80) center/cover no-repeat',
                zIndex: 0
            }} />

            {/* 全屏渐变遮罩 - 统一色调 */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(64, 128, 255, 0.85) 0%, rgba(64, 128, 255, 0.3) 100%)',
                zIndex: 1
            }} />

            {/* 左侧展示区 - 透明 */}
            <div style={{
                flex: 1,
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    color: '#fff',
                    textAlign: 'left',
                    padding: '0 80px',
                    maxWidth: 700
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 32
                    }}>
                        <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: 1.5, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>FACE AI</span>
                    </div>

                    <div style={{
                        fontSize: 64,
                        fontWeight: 700,
                        marginBottom: 24,
                        lineHeight: 1.1,
                        textShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.8) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        智面诊<br />
                        中医美容管理平台
                    </div>
                    <div style={{
                        fontSize: 20,
                        fontWeight: 400,
                        lineHeight: 1.6,
                        color: 'rgba(255,255,255,0.9)',
                        maxWidth: 540,
                        paddingLeft: 24,
                        borderLeft: '4px solid rgba(255,255,255,0.4)'
                    }}>
                        结合传统中医理论与现代 AI 视觉技术，<br />为每一位患者提供精准的面部诊断与个性化调理方案。
                    </div>
                </div>
            </div>

            {/* 右侧登录区 - 玻璃拟态 */}
            <div style={{
                width: 600,
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.85)', // 半透明白色
                backdropFilter: 'blur(25px)', // 强磨砂效果
                borderLeft: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.05)'
            }}>
                <div style={{ width: '100%', maxWidth: 420, padding: '0 40px' }}>
                    <div style={{ marginBottom: 48 }}>
                        <Typography.Title heading={2} style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#1d2129' }}>
                            欢迎回来
                        </Typography.Title>
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: 24, height: 4, background: '#4080FF', borderRadius: 2, marginRight: 12 }}></div>
                            <Typography.Text type="secondary" style={{ fontSize: 16, color: '#4E5969' }}>
                                登录您的账号以开始工作
                            </Typography.Text>
                        </div>
                    </div>

                    <Form form={form} layout="vertical" onSubmit={handleSubmit} size="large">
                        <Form.Item
                            field="username"
                            label={<span style={{ fontSize: 15, fontWeight: 500 }}>账号</span>}
                            rules={[{ required: true, message: '请输入用户名' }]}
                            style={{ marginBottom: 28 }}
                        >
                            <Input
                                prefix={<IconUser style={{ color: '#4080FF', fontSize: 18 }} />}
                                placeholder="请输入用户名"
                                style={{
                                    borderRadius: 12,
                                    height: 54,
                                    background: 'rgba(255,255,255,0.8)',
                                    border: '1px solid #E5E6EB',
                                    transition: 'all 0.3s',
                                    fontSize: 16
                                }}
                                className="login-input"
                            />
                        </Form.Item>

                        <Form.Item
                            field="password"
                            label={<span style={{ fontSize: 15, fontWeight: 500 }}>密码</span>}
                            rules={[{ required: true, message: '请输入密码' }]}
                            style={{ marginBottom: 40 }}
                        >
                            <Input.Password
                                prefix={<IconLock style={{ color: '#4080FF', fontSize: 18 }} />}
                                placeholder="请输入密码"
                                style={{
                                    borderRadius: 12,
                                    height: 54,
                                    background: 'rgba(255,255,255,0.8)',
                                    border: '1px solid #E5E6EB',
                                    transition: 'all 0.3s',
                                    fontSize: 16
                                }}
                                className="login-input"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                long
                                size="large"
                                loading={loading}
                                style={{
                                    height: 56,
                                    borderRadius: 12,
                                    fontSize: 18,
                                    fontWeight: 600,
                                    background: '#4080FF',
                                    boxShadow: '0 8px 16px rgba(64, 128, 255, 0.2)',
                                    border: 'none',
                                    transition: 'all 0.3s',
                                    letterSpacing: 2
                                }}
                            >
                                登 录
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ marginTop: 60, display: 'flex', justifyContent: 'center' }}>
                        <Typography.Text type="secondary" style={{
                            fontSize: 13,
                            background: 'rgba(64,128,255,0.05)',
                            padding: '8px 20px',
                            borderRadius: 20,
                            color: '#4080FF',
                            fontWeight: 500
                        }}>
                            演示账号：admin / admin123
                        </Typography.Text>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

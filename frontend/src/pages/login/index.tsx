import React, { useState } from 'react';
import { Form, Input, Button, Card, Message, Typography, Space, Carousel } from '@arco-design/web-react';
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
            background: '#f0f2f5'
        }}>
            {/* 左侧展示区 */}
            <div style={{
                flex: 1,
                background: '#165DFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, #165DFF 0%, #722ED1 100%)',
                    opacity: 0.9,
                    zIndex: 1
                }} />

                {/* 装饰性背景图 */}
                <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="bg"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />

                <div style={{
                    zIndex: 2,
                    color: '#fff',
                    textAlign: 'left',
                    padding: '0 80px',
                    maxWidth: 600
                }}>
                    <div style={{
                        fontSize: 48,
                        fontWeight: 800,
                        marginBottom: 24,
                        letterSpacing: 2
                    }}>
                        Face AI Pro
                    </div>
                    <div style={{
                        fontSize: 24,
                        opacity: 0.9,
                        fontWeight: 300,
                        lineHeight: 1.6
                    }}>
                        新一代医美智能工作台，<br />
                        AI 驱动的面部诊断与个性化方案生成。
                    </div>
                </div>
            </div>

            {/* 右侧登录区 */}
            <div style={{
                width: 500,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40
            }}>
                <div style={{ width: '100%', maxWidth: 360 }}>
                    <div style={{ marginBottom: 40 }}>
                        <Typography.Title heading={3}>
                            欢迎登录
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            请输入您的账号密码以继续
                        </Typography.Text>
                    </div>

                    <Form form={form} layout="vertical" onSubmit={handleSubmit} size="large">
                        <Form.Item
                            field="username"
                            rules={[{ required: true, message: '请输入用户名' }]}
                        >
                            <Input
                                prefix={<IconUser style={{ color: '#C9CDD4' }} />}
                                placeholder="用户名"
                                style={{ borderRadius: 8, height: 48 }}
                            />
                        </Form.Item>

                        <Form.Item
                            field="password"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input.Password
                                prefix={<IconLock style={{ color: '#C9CDD4' }} />}
                                placeholder="密码"
                                style={{ borderRadius: 8, height: 48 }}
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
                                    height: 48,
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontWeight: 500,
                                    boxShadow: '0 4px 10px rgba(22,93,255, 0.2)'
                                }}
                            >
                                立即登录
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Typography.Text type="secondary" style={{ fontSize: 13, background: '#f7f8fa', padding: '8px 16px', borderRadius: 4 }}>
                            测试账号：admin / admin123
                        </Typography.Text>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

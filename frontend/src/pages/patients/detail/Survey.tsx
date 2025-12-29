import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Typography, Button, Modal, Form, Radio, Input, Message, Space, Empty, Spin, Alert } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { getSurveys, submitSurvey, Survey as SurveyType } from '../../../api/plan';

// 问卷模板配置
const surveyTemplates = {
    satisfaction: {
        name: '满意度问卷',
        questions: [
            {
                id: 'q1', text: '您对本次服务的整体满意度如何？', options: [
                    { value: 5, label: '非常满意' },
                    { value: 4, label: '比较满意' },
                    { value: 3, label: '一般' },
                    { value: 2, label: '不太满意' },
                    { value: 1, label: '非常不满意' },
                ]
            },
            {
                id: 'q2', text: '您对医生/顾问的专业程度满意吗？', options: [
                    { value: 5, label: '非常满意' },
                    { value: 4, label: '比较满意' },
                    { value: 3, label: '一般' },
                    { value: 2, label: '不太满意' },
                    { value: 1, label: '非常不满意' },
                ]
            },
            {
                id: 'q3', text: '您会向朋友推荐我们的服务吗？', options: [
                    { value: 5, label: '一定会' },
                    { value: 4, label: '可能会' },
                    { value: 3, label: '不确定' },
                    { value: 2, label: '可能不会' },
                    { value: 1, label: '一定不会' },
                ]
            },
        ]
    },
    health: {
        name: '健康反馈问卷',
        questions: [
            {
                id: 'sleep', text: '近一周您的睡眠质量如何？', options: [
                    { value: 5, label: '很好，精力充沛' },
                    { value: 4, label: '还可以' },
                    { value: 3, label: '一般' },
                    { value: 2, label: '不太好' },
                    { value: 1, label: '很差，经常失眠' },
                ]
            },
            {
                id: 'stress', text: '近一周您的压力水平如何？', options: [
                    { value: 5, label: '没有压力' },
                    { value: 4, label: '压力较小' },
                    { value: 3, label: '压力适中' },
                    { value: 2, label: '压力较大' },
                    { value: 1, label: '压力很大' },
                ]
            },
            {
                id: 'skin', text: '您对目前皮肤状况的自我评价？', options: [
                    { value: 5, label: '非常好' },
                    { value: 4, label: '比较好' },
                    { value: 3, label: '一般' },
                    { value: 2, label: '不太好' },
                    { value: 1, label: '很差' },
                ]
            },
            {
                id: 'diet', text: '近一周您的饮食规律吗？', options: [
                    { value: 5, label: '非常规律' },
                    { value: 4, label: '比较规律' },
                    { value: 3, label: '一般' },
                    { value: 2, label: '不太规律' },
                    { value: 1, label: '很不规律' },
                ]
            },
        ]
    }
};

const Survey = ({ patientId }: { patientId: number }) => {
    const [surveys, setSurveys] = useState<SurveyType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<'satisfaction' | 'health' | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchSurveys();
    }, [patientId]);

    const fetchSurveys = async () => {
        setLoading(true);
        try {
            const res = await getSurveys(patientId);
            setSurveys(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartSurvey = (type: 'satisfaction' | 'health') => {
        setSelectedTemplate(type);
        setModalVisible(true);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validate();
            setSubmitting(true);

            const template = selectedTemplate === 'satisfaction' ? surveyTemplates.satisfaction : surveyTemplates.health;

            await submitSurvey({
                patient_id: patientId,
                survey_type: template.name,
                answers: values,
            });

            Message.success('问卷提交成功');
            setModalVisible(false);
            fetchSurveys();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 20) return 'green';
        if (score >= 15) return 'blue';
        if (score >= 10) return 'orange';
        return 'red';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 20) return '优秀';
        if (score >= 15) return '良好';
        if (score >= 10) return '一般';
        return '需关注';
    };

    if (loading) {
        return <Spin style={{ display: 'block', margin: '50px auto' }} />;
    }

    const template = selectedTemplate ? surveyTemplates[selectedTemplate] : null;

    return (
        <div>
            {/* 发送问卷按钮 */}
            <Card style={{ marginBottom: 16 }}>
                <Space size="large">
                    <Button
                        type="primary"
                        icon={<IconPlus />}
                        onClick={() => handleStartSurvey('satisfaction')}
                    >
                        发送满意度问卷
                    </Button>
                    <Button
                        type="outline"
                        icon={<IconPlus />}
                        onClick={() => handleStartSurvey('health')}
                    >
                        发送健康反馈问卷
                    </Button>
                </Space>
            </Card>

            {/* 问卷历史 */}
            <Card title="问卷记录">
                {surveys.length === 0 ? (
                    <Empty description="暂无问卷记录" />
                ) : (
                    <List
                        dataSource={surveys}
                        render={(item) => (
                            <List.Item
                                key={item.id}
                                extra={
                                    <Tag color={getScoreColor(item.score)} size="large">
                                        {getScoreLabel(item.score)} ({item.score}分)
                                    </Tag>
                                }
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <span>{item.survey_type}</span>
                                            <Typography.Text type="secondary">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </Typography.Text>
                                        </Space>
                                    }
                                    description={
                                        <Alert
                                            type="info"
                                            content={item.summary_advice}
                                            style={{ marginTop: 8 }}
                                        />
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>

            {/* 问卷填写弹窗 */}
            <Modal
                title={template?.name || '填写问卷'}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                confirmLoading={submitting}
                style={{ width: 600 }}
                okText="提交问卷"
            >
                {template && (
                    <Form form={form} layout="vertical">
                        {template.questions.map((q, index) => (
                            <Form.Item
                                key={q.id}
                                label={`${index + 1}. ${q.text}`}
                                field={q.id}
                                rules={[{ required: true, message: '请选择一个选项' }]}
                            >
                                <Radio.Group direction="vertical">
                                    {q.options.map(opt => (
                                        <Radio key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            </Form.Item>
                        ))}
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default Survey;

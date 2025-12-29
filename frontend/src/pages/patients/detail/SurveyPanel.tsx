import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Slider, Button, Space, List, Tag, Typography, Message, Spin, Empty } from '@arco-design/web-react';
import { IconCheck, IconHistory, IconRobot } from '@arco-design/web-react/icon';
import { submitSurvey, getPatientSurveys, Survey, SurveyAnswer } from '../../../api/survey';

const { TabPane } = Tabs;
const FormItem = Form.Item;

interface SurveyPanelProps {
    patientId: number;
}

// 健康问卷题目
const healthQuestions = [
    { key: 'sleep', label: '睡眠质量', desc: '1=很差 5=很好' },
    { key: 'stress', label: '压力程度', desc: '1=压力大 5=轻松' },
    { key: 'skin', label: '皮肤状态', desc: '1=很差 5=很好' },
    { key: 'diet', label: '饮食规律', desc: '1=不规律 5=很规律' },
];

// 满意度问卷题目
const satisfactionQuestions = [
    { key: 'service', label: '服务质量', desc: '1=不满意 5=非常满意' },
    { key: 'effect', label: '效果满意度', desc: '1=无效果 5=效果很好' },
    { key: 'environment', label: '环境舒适度', desc: '1=不舒适 5=非常舒适' },
    { key: 'communication', label: '沟通体验', desc: '1=沟通差 5=沟通顺畅' },
];

const SurveyPanel: React.FC<SurveyPanelProps> = ({ patientId }) => {
    const [activeTab, setActiveTab] = useState('health');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [healthForm] = Form.useForm();
    const [satisfactionForm] = Form.useForm();

    useEffect(() => {
        loadSurveys();
    }, [patientId]);

    const loadSurveys = async () => {
        setLoading(true);
        try {
            const data = await getPatientSurveys(patientId);
            setSurveys(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (type: 'health' | 'satisfaction') => {
        const form = type === 'health' ? healthForm : satisfactionForm;
        const surveyType = type === 'health' ? '健康反馈问卷' : '服务满意度问卷';

        try {
            const values = await form.validate();
            setSubmitting(true);

            const result = await submitSurvey({
                patient_id: patientId,
                survey_type: surveyType,
                answers: values as SurveyAnswer
            });

            Message.success('问卷提交成功！');
            form.resetFields();
            setSurveys(prev => [result, ...prev]);
            setActiveTab('history');
        } catch (e: any) {
            if (e?.errors) {
                Message.error('请完成所有问题');
            } else {
                Message.error('提交失败，请重试');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const renderForm = (questions: typeof healthQuestions, form: any, type: 'health' | 'satisfaction') => (
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            {questions.map(q => (
                <FormItem
                    key={q.key}
                    field={q.key}
                    label={<span>{q.label} <Typography.Text type="secondary" style={{ fontSize: 12 }}>({q.desc})</Typography.Text></span>}
                    rules={[{ required: true, message: '请评分' }]}
                    initialValue={3}
                >
                    <Slider
                        min={1}
                        max={5}
                        step={1}
                        marks={{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }}
                        style={{ width: '85%', marginLeft: '5%' }}
                    />
                </FormItem>
            ))}
            <FormItem>
                <Button
                    type="primary"
                    long
                    loading={submitting}
                    icon={<IconCheck />}
                    onClick={() => handleSubmit(type)}
                >
                    提交问卷
                </Button>
            </FormItem>
        </Form>
    );

    const renderHistory = () => {
        if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;
        if (!surveys.length) return <Empty description="暂无问卷记录" />;

        return (
            <List
                dataSource={surveys}
                render={(item: Survey) => (
                    <List.Item
                        key={item.id}
                        style={{ padding: '12px 0', borderBottom: '1px solid #F2F3F5' }}
                    >
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Space>
                                    <Tag color={item.survey_type.includes('健康') ? 'blue' : 'green'} size="small">
                                        {item.survey_type}
                                    </Tag>
                                    <Typography.Text bold>{item.score} 分</Typography.Text>
                                </Space>
                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                    {new Date(item.created_at).toLocaleDateString('zh-CN')}
                                </Typography.Text>
                            </div>
                            <div style={{
                                background: '#F7F8FA',
                                padding: '8px 12px',
                                borderRadius: 4,
                                fontSize: 12,
                                color: '#4E5969',
                                lineHeight: 1.6
                            }}>
                                <IconRobot style={{ marginRight: 4, color: '#00B42A' }} />
                                {item.summary_advice}
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        );
    };

    return (
        <Card
            title="定期问卷"
            style={{ height: '100%' }}
            bodyStyle={{ padding: '0 16px 16px', height: 'calc(100% - 50px)', overflowY: 'auto' }}
        >
            <Tabs activeTab={activeTab} onChange={setActiveTab} type="text" size="small">
                <TabPane key="health" title="健康反馈">
                    {renderForm(healthQuestions, healthForm, 'health')}
                </TabPane>
                <TabPane key="satisfaction" title="满意度调查">
                    {renderForm(satisfactionQuestions, satisfactionForm, 'satisfaction')}
                </TabPane>
                <TabPane key="history" title={<><IconHistory /> 历史</>}>
                    {renderHistory()}
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default SurveyPanel;

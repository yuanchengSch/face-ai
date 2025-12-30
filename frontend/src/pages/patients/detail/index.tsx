import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Grid, Avatar, Typography, Tag, Space, Divider, Modal } from '@arco-design/web-react';
import { IconArrowLeft, IconStarFill, IconFile } from '@arco-design/web-react/icon';
import ConsultationChat from './ConsultationChat';
import SurveyPanel from './SurveyPanel';
import PersonalizedPlan from './PersonalizedPlan';
import ExamTrend from './ExamTrend';
import { getPatient, Patient } from '../../../api/patient';

const { Row, Col } = Grid;

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(false);
    const [surveyModalVisible, setSurveyModalVisible] = useState(false);

    useEffect(() => {
        if (id) fetchPatient(Number(id));
    }, [id]);

    const fetchPatient = async (pid: number) => {
        setLoading(true);
        try {
            const res = await getPatient(pid);
            setPatient(res);
        } catch {
            setPatient({
                id: pid,
                full_name: '李安娜',
                gender: '女',
                age: 28,
                phone: '13800138000',
                level: 'Platinum',
                total_consumption: 58000,
                notes: 'VIP客户，对痛感敏感',
                last_visit_at: '2023-10-15'
            } as Patient);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !patient) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin dot />
        </div>
    );

    return (
        <div style={{ padding: 0 }}>
            {/* 顶部返回栏 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        type="text"
                        icon={<IconArrowLeft />}
                        style={{ fontSize: 16, color: '#4E5969', marginRight: 8 }}
                        onClick={() => navigate('/patients')}
                    />
                    <Space size={4}>
                        <Typography.Text style={{ fontSize: 14, color: '#86909C', cursor: 'pointer' }} onClick={() => navigate('/patients')}>患者列表</Typography.Text>
                        <Typography.Text style={{ fontSize: 14, color: '#C9CDD4' }}> / </Typography.Text>
                        <Typography.Text style={{ fontSize: 14, color: '#1d2129', fontWeight: 500 }}>患者详情</Typography.Text>
                    </Space>
                </div>
                <Space>
                    <Button type="outline" icon={<IconFile />} onClick={() => setSurveyModalVisible(true)} style={{ background: '#fff' }}>
                        定期问卷
                    </Button>
                    <Button type="primary" style={{ boxShadow: '0 4px 10px rgba(22,93,255, 0.2)' }}>保存更改</Button>
                </Space>
            </div>

            {/* 主布局 */}
            <Row gutter={20}>
                {/* 左侧：基础信息 + AI 咨询 */}
                <Col span={6}>
                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                        {/* 基础信息 */}
                        <Card className="glass-card card-hover" bordered={false} bodyStyle={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                                <Avatar size={56} style={{ backgroundColor: '#165DFF', marginRight: 16, boxShadow: '0 4px 10px rgba(22,93,255,0.3)' }}>
                                    {patient.full_name[0]}
                                </Avatar>
                                <div>
                                    <Typography.Title heading={5} style={{ margin: 0, marginBottom: 4 }}>{patient.full_name}</Typography.Title>
                                    <Space size={4}>
                                        <Tag size="small" color="arcoblue" bordered>{patient.gender}</Tag>
                                        <Tag size="small" color="gold" bordered><IconStarFill /> {patient.level}</Tag>
                                    </Space>
                                </div>
                            </div>
                            <Divider style={{ margin: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }} />
                            <div style={{ fontSize: 13, color: '#4E5969', lineHeight: 2 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>手机号码</span>
                                    <span style={{ color: '#1d2129', fontWeight: 500 }}>{patient.phone}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>累计消费</span>
                                    <span style={{ color: '#1d2129', fontWeight: 500 }}>¥{patient.total_consumption.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>最近到访</span>
                                    <span style={{ color: '#1d2129', fontWeight: 500 }}>{patient.last_visit_at || '-'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* AI 咨询 */}
                        <div style={{ height: 550, borderRadius: 12, overflow: 'hidden' }} className="glass-card">
                            <ConsultationChat patientName={patient.full_name} />
                        </div>
                    </Space>
                </Col>

                {/* 中间：个性化方案 */}
                <Col span={12}>
                    <div className="glass-card" style={{ height: '100%', minHeight: 700, borderRadius: 12, padding: 0 }}>
                        <PersonalizedPlan patientId={patient.id} />
                    </div>
                </Col>

                {/* 右侧：面诊趋势 */}
                <Col span={6}>
                    <div className="glass-card" style={{ height: '100%', minHeight: 700, borderRadius: 12, padding: 0 }}>
                        <ExamTrend patientId={patient.id} />
                    </div>
                </Col>
            </Row>

            {/* 问卷模态框 */}
            <Modal
                title="定期问卷"
                visible={surveyModalVisible}
                onCancel={() => setSurveyModalVisible(false)}
                footer={null}
                style={{ width: 700, borderRadius: 12 }}
            >
                <SurveyPanel patientId={patient.id} />
            </Modal>
        </div>
    );
};

export default PatientDetail;

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
                    <Typography.Text style={{ fontSize: 14, color: '#86909C' }}>返回列表 / 患者详情</Typography.Text>
                </div>
                <Space>
                    <Button type="outline" icon={<IconFile />} onClick={() => setSurveyModalVisible(true)}>
                        定期问卷
                    </Button>
                    <Button type="primary">保存更改</Button>
                </Space>
            </div>

            {/* 主布局 */}
            <Row gutter={12}>
                {/* 左侧：基础信息 + AI 咨询 */}
                <Col span={6}>
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        {/* 基础信息 */}
                        <Card size="small">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar size={48} style={{ backgroundColor: '#165DFF', marginRight: 12 }}>
                                    {patient.full_name[0]}
                                </Avatar>
                                <div>
                                    <Typography.Title heading={6} style={{ margin: 0 }}>{patient.full_name}</Typography.Title>
                                    <Space size={4} style={{ marginTop: 2 }}>
                                        <Tag size="small" color="arcoblue">{patient.gender}</Tag>
                                        <Tag size="small" color="gold"><IconStarFill /> {patient.level}</Tag>
                                    </Space>
                                </div>
                            </div>
                            <Divider style={{ margin: '12px 0' }} />
                            <div style={{ fontSize: 12, color: '#4E5969', lineHeight: 1.8 }}>
                                <div>📱 {patient.phone}</div>
                                <div>💰 ¥{patient.total_consumption.toLocaleString()}</div>
                                <div>📅 {patient.last_visit_at || '-'}</div>
                            </div>
                        </Card>

                        {/* AI 咨询 */}
                        <div style={{ height: 500 }}>
                            <ConsultationChat patientName={patient.full_name} />
                        </div>
                    </Space>
                </Col>

                {/* 中间：个性化方案 */}
                <Col span={12}>
                    <PersonalizedPlan patientId={patient.id} />
                </Col>

                {/* 右侧：面诊趋势 */}
                <Col span={6}>
                    <ExamTrend patientId={patient.id} />
                </Col>
            </Row>

            {/* 问卷模态框 */}
            <Modal
                title="定期问卷"
                visible={surveyModalVisible}
                onCancel={() => setSurveyModalVisible(false)}
                footer={null}
                style={{ width: 600 }}
            >
                <SurveyPanel patientId={patient.id} />
            </Modal>
        </div>
    );
};

export default PatientDetail;

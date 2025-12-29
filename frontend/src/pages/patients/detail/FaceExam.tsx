import React, { useState, useEffect } from 'react';
import { Grid, Card, Upload, Button, Message, Space, Typography, Tag, Divider, Spin, Statistic, Modal, Input, Alert } from '@arco-design/web-react';
import { IconExclamationCircle, IconCheck, IconEdit } from '@arco-design/web-react/icon';
import ReactECharts from 'echarts-for-react';
import { createFaceExam, getPatientExams, confirmExam, FaceExam as FaceExamType } from '../../../api/faceExam';

const { Row, Col } = Grid;

const FaceExam = ({ patientId }: { patientId: number }) => {
    const [exams, setExams] = useState<FaceExamType[]>([]);
    const [currentExam, setCurrentExam] = useState<FaceExamType | null>(null);
    const [uploading, setUploading] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [doctorNotes, setDoctorNotes] = useState('');
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, [patientId]);

    const fetchHistory = async () => {
        try {
            const res = await getPatientExams(patientId);
            if (res && res.length > 0) {
                setExams(res);
                setCurrentExam(res[0]); // 默认展示最新的
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const res = await createFaceExam(patientId, undefined, file);
            Message.success('AI 诊断完成');
            setExams([res, ...exams]);
            setCurrentExam(res);
        } catch (error) {
            Message.error('诊断失败，请重试');
        } finally {
            setUploading(false);
        }
        return false; // 阻止默认上传行为
    };

    const handleConfirm = async () => {
        if (!currentExam) return;
        setConfirming(true);
        try {
            const res = await confirmExam(currentExam.id, doctorNotes);
            Message.success('确认成功');
            setCurrentExam(res);
            // 更新列表中的记录
            setExams(exams.map(e => e.id === res.id ? res : e));
            setConfirmModalVisible(false);
            setDoctorNotes('');
        } catch (error) {
            Message.error('确认失败');
        } finally {
            setConfirming(false);
        }
    };

    // 雷达图配置
    const getRadarOption = (metrics: Record<string, number>) => {
        if (!metrics) return {};
        return {
            title: { text: '肤质六维图' },
            radar: {
                indicator: [
                    { name: '水润度', max: 100 },
                    { name: '油分', max: 100 },
                    { name: '平滑度', max: 100 },
                    { name: '色沉', max: 100 },
                    { name: '弹性', max: 100 },
                    { name: '敏感度', max: 100 },
                ],
                center: ['50%', '55%'],
                radius: '70%'
            },
            series: [
                {
                    type: 'radar',
                    data: [
                        {
                            value: [
                                metrics.hydration || 60,
                                metrics.inflammation || 40,
                                100 - (metrics.wrinkles || 20),
                                metrics.pigmentation || 30,
                                metrics.elasticity || 70,
                                metrics.inflammation || 20
                            ],
                            name: '当前状态',
                            areaStyle: {
                                color: 'rgba(22,93,255, 0.4)'
                            },
                            itemStyle: {
                                color: '#165DFF'
                            }
                        }
                    ]
                }
            ]
        };
    };

    return (
        <div style={{ minHeight: 600 }}>
            <Row gutter={24}>
                {/* 左侧：图片展示与上传 */}
                <Col span={8}>
                    <Card title="面部影像" style={{ height: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            {currentExam ? (
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={currentExam.image_url}
                                        alt="Face"
                                        style={{ width: '100%', borderRadius: 8, border: '2px solid #165DFF' }}
                                    />
                                    <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                                        {currentExam.doctor_confirmed ? (
                                            <Tag color="green" icon={<IconCheck />}>已确认</Tag>
                                        ) : (
                                            <Tag color="orange">待确认</Tag>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ height: 300, background: '#f2f3f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86909c' }}>
                                    暂无影像数据
                                </div>
                            )}
                        </div>

                        <Upload
                            drag
                            accept="image/*"
                            fileList={[]}
                            beforeUpload={(file) => handleUpload(file)}
                            tip="点击或拖拽上传人脸照片，AI 将自动分析"
                        />
                        {uploading && <Spin style={{ display: 'block', marginTop: 10 }} tip="AI正在分析中..." />}
                    </Card>
                </Col>

                {/* 右侧：诊断结果 */}
                <Col span={16}>
                    {currentExam ? (
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            {/* 医生确认状态提示 */}
                            {!currentExam.doctor_confirmed && (
                                <Alert
                                    type="warning"
                                    content="此诊断结果尚未经医生确认，请审核后点击确认按钮"
                                />
                            )}

                            {/* 核心指标卡片 */}
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Card bordered={false} style={{ background: '#f7f8fa' }}>
                                        <div style={{ color: '#165DFF' }}>
                                            <Statistic title="肌龄" value={currentExam.metrics?.skin_age} suffix="岁" />
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card bordered={false} style={{ background: '#f7f8fa' }}>
                                        <div style={{ color: (currentExam.metrics?.inflammation ?? 0) > 50 ? '#f53f3f' : '#00b42a' }}>
                                            <Statistic title="炎症风险" value={currentExam.metrics?.inflammation} suffix="%" />
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card bordered={false} style={{ background: '#f7f8fa' }}>
                                        <Statistic title="水润度" value={currentExam.metrics?.hydration} suffix="/100" />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card bordered={false} style={{ background: '#f7f8fa' }}>
                                        <Statistic title="色沉" value={currentExam.metrics?.pigmentation} suffix="/100" />
                                    </Card>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Card title="综合图谱">
                                        <ReactECharts option={getRadarOption(currentExam.metrics)} style={{ height: 300 }} />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card
                                        title="智能诊断建议"
                                        headerStyle={{ borderBottom: 'none' }}
                                        extra={
                                            currentExam.doctor_confirmed && currentExam.doctor_notes && (
                                                <Tag color="blue" icon={<IconEdit />}>已补充</Tag>
                                            )
                                        }
                                    >
                                        <Typography.Paragraph>
                                            <IconExclamationCircle style={{ color: '#f53f3f', marginRight: 8 }} />
                                            {currentExam.advice_summary}
                                        </Typography.Paragraph>
                                        <Divider />
                                        <Typography.Paragraph>
                                            <div><strong>详细建议：</strong></div>
                                            <div style={{ whiteSpace: 'pre-line', marginTop: 8, color: '#4e5969' }}>
                                                {currentExam.detailed_advice}
                                            </div>
                                        </Typography.Paragraph>

                                        {/* 医生补充建议 */}
                                        {currentExam.doctor_notes && (
                                            <>
                                                <Divider />
                                                <Typography.Paragraph>
                                                    <div><strong>医生补充建议：</strong></div>
                                                    <div style={{ whiteSpace: 'pre-line', marginTop: 8, color: '#165DFF' }}>
                                                        {currentExam.doctor_notes}
                                                    </div>
                                                </Typography.Paragraph>
                                            </>
                                        )}

                                        <Space style={{ marginTop: 20 }}>
                                            {!currentExam.doctor_confirmed ? (
                                                <Button
                                                    type="primary"
                                                    icon={<IconCheck />}
                                                    onClick={() => setConfirmModalVisible(true)}
                                                >
                                                    确认诊断结果
                                                </Button>
                                            ) : (
                                                <Button type="primary" long>生成本期护理方案</Button>
                                            )}
                                        </Space>
                                    </Card>
                                </Col>
                            </Row>
                        </Space>
                    ) : (
                        <div style={{ padding: 50, textAlign: 'center', color: '#86909c' }}>
                            请先上传照片以开始诊断
                        </div>
                    )}
                </Col>
            </Row>

            {/* 确认弹窗 */}
            <Modal
                title="确认诊断结果"
                visible={confirmModalVisible}
                onCancel={() => setConfirmModalVisible(false)}
                onOk={handleConfirm}
                confirmLoading={confirming}
                okText="确认"
            >
                <Typography.Paragraph>
                    确认后此诊断结果将被标记为"已确认"，并记录到患者时间轴。
                </Typography.Paragraph>
                <Input.TextArea
                    placeholder="可选：添加医生补充建议..."
                    value={doctorNotes}
                    onChange={setDoctorNotes}
                    rows={4}
                />
            </Modal>
        </div>
    );
};

export default FaceExam;

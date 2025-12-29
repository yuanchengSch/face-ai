import React from 'react';
import { Card, Grid, Typography, Tag, Space, Steps, List, Badge, Tabs } from '@arco-design/web-react';
import { IconClockCircle, IconCheckCircle, IconExclamationCircle } from '@arco-design/web-react/icon';
import faceModel from '../../../assets/face_model.jpg';

const { Row, Col } = Grid;
const Step = Steps.Step;

interface MedicalInfoProps {
    patientId?: number;
}

const MedicalInfoPanel = ({ patientId }: MedicalInfoProps) => {
    return (
        <Card title="患病信息" style={{ height: 'calc(100vh - 280px)', minHeight: 400 }} className="medical-info-card">
            <Row gutter={24} style={{ height: '100%' }}>
                {/* 左侧：AI面部模型 */}
                <Col span={10} style={{ borderRight: '1px solid #F2F3F5', height: '100%', position: 'relative' }}>
                    <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {/* 模拟面部轮廓图 */}
                        <div style={{ position: 'relative', width: '100%', height: 320, marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                            <img
                                src={faceModel}
                                alt="Face Model"
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            />

                            {/* 标注点：油性头发 */}
                            <div style={{ position: 'absolute', top: '25%', right: '15%', display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: 8, height: 8, background: '#165DFF', borderRadius: '50%', marginRight: 8 }} />
                                <div style={{ background: '#fff', padding: '4px 8px', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12, border: '1px solid #E5E6EB' }}>
                                    油性头发
                                </div>
                            </div>
                            {/* 标注点：暗疮痘痘 */}
                            <div style={{ position: 'absolute', top: '38%', right: '12%', display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: 8, height: 8, background: '#FF7D00', borderRadius: '50%', marginRight: 8 }} />
                                <div style={{ background: '#fff', padding: '4px 8px', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12, border: '1px solid #E5E6EB' }}>
                                    暗疮痘痘
                                </div>
                            </div>
                            {/* 标注点：面部皮肤感染 */}
                            <div style={{ position: 'absolute', bottom: '30%', right: '20%', display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: 8, height: 8, background: '#F53F3F', borderRadius: '50%', marginRight: 8 }} />
                                <div style={{ background: '#fff', padding: '4px 8px', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12, border: '1px solid #E5E6EB' }}>
                                    面部皮肤感染
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

                {/* 右侧：治疗方案 */}
                <Col span={14} style={{ paddingLeft: 24, height: '100%', overflowY: 'auto' }}>
                    <Typography.Title heading={6} style={{ marginTop: 0, marginBottom: 16 }}>治疗方案</Typography.Title>

                    <Steps direction="vertical" current={2} style={{ width: '100%' }}>
                        <Step
                            title="2025-12-02"
                            description={
                                <div style={{ fontSize: 13, color: '#4E5969', marginTop: 4, marginBottom: 12 }}>
                                    <Tag color="red" size="small" style={{ marginBottom: 4 }}>急性期</Tag>
                                    <div>停用含磨砂颗粒、维A酸类、水杨酸类的护肤品，避免皮肤屏障受损。</div>
                                </div>
                            }
                        />
                        <Step
                            title="2025-12-03"
                            description={
                                <div style={{ fontSize: 13, color: '#4E5969', marginTop: 4, marginBottom: 12 }}>
                                    <Tag color="orange" size="small" style={{ marginBottom: 4 }}>日常护理</Tag>
                                    <div>严格防晒（涂抹 SPF30+ 以上物理防晒霜，避免暴晒、紫外线照射）。</div>
                                </div>
                            }
                        />
                        <Step
                            title="2025-12-04"
                            description={
                                <div style={{ fontSize: 13, color: '#4E5969', marginTop: 4, marginBottom: 12 }}>
                                    <Tag color="arcoblue" size="small" style={{ marginBottom: 4 }}>用药指导</Tag>
                                    <div>若正在服用口服药物（如抗生素、激素类药物），需提前告知医生。</div>
                                </div>
                            }
                        />
                        <Step
                            title="2025-12-04 (待执行)"
                            icon={<IconClockCircle />}
                            description={
                                <div style={{ fontSize: 13, color: '#4E5969', marginTop: 4, marginBottom: 12 }}>
                                    <Tag color="green" size="small" style={{ marginBottom: 4 }}>医美治疗</Tag>
                                    <div>避免辛辣、甜食及酒精摄入，减少皮肤炎症诱发因素。果酸换肤（温和型，浓度 20%-30%）。</div>
                                </div>
                            }
                        />
                    </Steps>
                </Col>
            </Row>
        </Card>
    );
};

export default MedicalInfoPanel;

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Card, Space, Tag, Avatar, TableColumnProps, Input, Select, Grid, Message, Modal, Form, Popconfirm } from '@arco-design/web-react';
import { IconPlus, IconEye, IconRefresh, IconDelete, IconSend } from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { getPatients, createPatient, Patient, PatientFilter } from '../../api/patient';

const { Row, Col } = Grid;

const PatientList = () => {
    const [data, setData] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<PatientFilter>({});
    const [searchValue, setSearchValue] = useState('');
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getPatients(filter);
            if (Array.isArray(res)) {
                setData(res);
            } else {
                setData([]);
            }
        } catch (e) {
            console.error(e);
            Message.error('加载患者列表失败');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // 防抖搜索
    const handleSearch = useCallback(() => {
        setFilter(prev => ({ ...prev, search: searchValue || undefined }));
    }, [searchValue]);

    const handleGenderChange = (value: string) => {
        setFilter(prev => ({ ...prev, gender: value || undefined }));
    };

    const handleLevelChange = (value: string) => {
        setFilter(prev => ({ ...prev, level: value || undefined }));
    };

    const handleReset = () => {
        setSearchValue('');
        setFilter({});
    };

    const handleCreatePatient = async () => {
        try {
            const values = await form.validate();
            setCreateLoading(true);
            await createPatient(values);
            Message.success('患者创建成功');
            setCreateModalVisible(false);
            form.resetFields();
            fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setCreateLoading(false);
        }
    };

    // 批量操作
    const handleBatchSendSurvey = () => {
        if (selectedRowKeys.length === 0) {
            Message.warning('请先选择患者');
            return;
        }
        Message.success(`已向 ${selectedRowKeys.length} 位患者发送问卷`);
        setSelectedRowKeys([]);
    };

    const handleBatchDelete = () => {
        if (selectedRowKeys.length === 0) {
            Message.warning('请先选择患者');
            return;
        }
        // 实际应用中应调用删除 API
        Message.success(`已删除 ${selectedRowKeys.length} 位患者`);
        setSelectedRowKeys([]);
    };

    const columns: TableColumnProps<Patient>[] = [
        {
            title: '姓名',
            dataIndex: 'full_name',
            render: (col: string) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#165DFF' }}>{col?.[0]}</Avatar>
                    {col}
                </Space>
            )
        },
        {
            title: '会员等级',
            dataIndex: 'level',
            render: (col: string) => {
                const colors: Record<string, string> = { Platinum: '#165DFF', Gold: '#FFB400', Silver: '#86909C', Standard: '#94BFFF' };
                return <Tag color={colors[col] || 'gray'}>{col}</Tag>;
            }
        },
        {
            title: '性别/年龄',
            render: (_: unknown, item: Patient) => `${item.gender} / ${item.age}岁`
        },
        {
            title: '手机号',
            dataIndex: 'phone',
        },
        {
            title: '累计消费',
            dataIndex: 'total_consumption',
            render: (col: number) => `¥ ${col?.toLocaleString()}`
        },
        {
            title: '操作',
            render: (_: unknown, item: Patient) => (
                <Button
                    type="text"
                    icon={<IconEye />}
                    onClick={() => navigate(`/patients/${item.id}`)}
                >
                    详情
                </Button>
            ),
        },
    ];

    return (
        <Card
            title="患者管理"
            extra={
                <Button
                    type="primary"
                    icon={<IconPlus />}
                    onClick={() => setCreateModalVisible(true)}
                >
                    新增患者
                </Button>
            }
        >
            {/* 筛选区 */}
            <div style={{ marginBottom: 16 }}>
                <Row gutter={16} align="center">
                    <Col span={8}>
                        <Input.Search
                            placeholder="搜索姓名或手机号"
                            value={searchValue}
                            onChange={setSearchValue}
                            onSearch={handleSearch}
                            onPressEnter={handleSearch}
                            allowClear
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="性别筛选"
                            allowClear
                            style={{ width: '100%' }}
                            value={filter.gender}
                            onChange={handleGenderChange}
                        >
                            <Select.Option value="男">男</Select.Option>
                            <Select.Option value="女">女</Select.Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="会员等级"
                            allowClear
                            style={{ width: '100%' }}
                            value={filter.level}
                            onChange={handleLevelChange}
                        >
                            <Select.Option value="Platinum">白金会员</Select.Option>
                            <Select.Option value="Gold">黄金会员</Select.Option>
                            <Select.Option value="Silver">白银会员</Select.Option>
                            <Select.Option value="Standard">普通会员</Select.Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button icon={<IconRefresh />} onClick={handleReset}>
                            重置
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* 批量操作栏 */}
            {selectedRowKeys.length > 0 && (
                <div style={{ marginBottom: 16, padding: '10px 16px', background: '#e8f3ff', borderRadius: 4 }}>
                    <Space>
                        <span>已选择 <strong>{selectedRowKeys.length}</strong> 项</span>
                        <Button
                            type="outline"
                            size="small"
                            icon={<IconSend />}
                            onClick={handleBatchSendSurvey}
                        >
                            批量发送问卷
                        </Button>
                        <Popconfirm
                            title="确定删除选中的患者吗？"
                            onOk={handleBatchDelete}
                        >
                            <Button
                                type="outline"
                                status="danger"
                                size="small"
                                icon={<IconDelete />}
                            >
                                批量删除
                            </Button>
                        </Popconfirm>
                        <Button
                            type="text"
                            size="small"
                            onClick={() => setSelectedRowKeys([])}
                        >
                            取消选择
                        </Button>
                    </Space>
                </div>
            )}

            <Table
                columns={columns}
                data={data}
                loading={loading}
                rowKey="id"
                rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys),
                    checkAll: true,
                }}
            />

            {/* 新建患者弹窗 */}
            <Modal
                title="新增患者"
                visible={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                onOk={handleCreatePatient}
                confirmLoading={createLoading}
                style={{ width: 600 }}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="姓名"
                                field="full_name"
                                rules={[{ required: true, message: '请输入姓名' }]}
                            >
                                <Input placeholder="请输入患者姓名" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="手机号"
                                field="phone"
                                rules={[{ required: true, message: '请输入手机号' }]}
                            >
                                <Input placeholder="请输入手机号" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="性别" field="gender" initialValue="女">
                                <Select>
                                    <Select.Option value="女">女</Select.Option>
                                    <Select.Option value="男">男</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="年龄"
                                field="age"
                                rules={[{ required: true, message: '请输入年龄' }]}
                            >
                                <Input type="number" placeholder="年龄" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="会员等级" field="level" initialValue="Standard">
                                <Select>
                                    <Select.Option value="Platinum">白金会员</Select.Option>
                                    <Select.Option value="Gold">黄金会员</Select.Option>
                                    <Select.Option value="Silver">白银会员</Select.Option>
                                    <Select.Option value="Standard">普通会员</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="备注" field="notes">
                        <Input.TextArea placeholder="患者备注信息（过敏史、禁忌等）" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default PatientList;

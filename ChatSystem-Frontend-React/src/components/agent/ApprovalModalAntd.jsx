/**
 * ApprovalModal (Ant Design 版本)
 * 审批弹窗组件 - 显示待审批的工具调用
 */

import { useState } from 'react';
import {
    Modal,
    Button,
    Space,
    Typography,
    Tag,
    Alert,
    Collapse,
    Spin,
    Divider,
} from 'antd';
import {
    CodeOutlined,
    ExclamationCircleOutlined,
    CheckOutlined,
    CloseOutlined,
    InfoCircleOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useAgent } from '../../contexts/AgentContext';

const { Text, Paragraph, Title } = Typography;

// 工具信息配置
const TOOL_CONFIG = {
    python_execute: {
        name: 'Python 代码执行',
        description: '将在隔离的 Docker 容器中执行 Python 代码',
        icon: <CodeOutlined style={{ color: '#fa8c16' }} />,
        riskLevel: 'medium',
        tips: [
            '代码在隔离环境中执行，有资源限制',
            '执行时间限制 60 秒',
            '内存限制 512MB',
            '无法访问本地文件系统',
        ],
    },
    default: {
        name: '工具调用',
        description: '此操作需要您的批准',
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        riskLevel: 'low',
        tips: [],
    },
};

// 风险等级配置
const RISK_LEVELS = {
    low: { label: '低风险', color: 'success' },
    medium: { label: '中等风险', color: 'warning' },
    high: { label: '高风险', color: 'error' },
};

// 单个审批卡片
function ApprovalCard({ approval, onApprove, onReject, processing }) {
    const toolConfig = TOOL_CONFIG[approval.tool_name] || TOOL_CONFIG.default;
    const riskLevel = RISK_LEVELS[toolConfig.riskLevel] || RISK_LEVELS.low;

    // 格式化代码显示
    const formatCode = () => {
        if (approval.tool_name === 'python_execute' && approval.tool_args?.code) {
            return (
                <pre style={{
                    background: '#f6f8fa',
                    padding: 12,
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: 'Monaco, Menlo, Consolas, monospace',
                    overflow: 'auto',
                    maxHeight: 200,
                    margin: 0,
                }}>
                    <code>{approval.tool_args.code}</code>
                </pre>
            );
        }
        return (
            <pre style={{
                background: '#f6f8fa',
                padding: 12,
                borderRadius: 6,
                fontSize: 12,
                overflow: 'auto',
                maxHeight: 150,
                margin: 0,
            }}>
                {JSON.stringify(approval.tool_args, null, 2)}
            </pre>
        );
    };

    return (
        <div style={{
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            background: '#fff',
        }}>
            {/* 头部 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Space>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: toolConfig.riskLevel === 'medium' ? '#fff7e6' : '#f6ffed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {toolConfig.icon}
                    </div>
                    <div>
                        <Text strong>{toolConfig.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{toolConfig.description}</Text>
                    </div>
                </Space>
                <Tag color={riskLevel.color}>{riskLevel.label}</Tag>
            </div>

            {/* 原因说明 */}
            {approval.reason && (
                <Alert
                    message="审批原因"
                    description={approval.reason}
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    style={{ marginBottom: 12 }}
                />
            )}

            {/* 参数详情 */}
            <Collapse
                ghost
                defaultActiveKey={['params']}
                items={[{
                    key: 'params',
                    label: <Text strong style={{ fontSize: 13 }}>参数详情</Text>,
                    children: formatCode(),
                }]}
                style={{ marginBottom: 12 }}
            />

            {/* 安全提示 */}
            {toolConfig.tips.length > 0 && (
                <div style={{
                    background: '#f6f8fa',
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 16,
                }}>
                    <Space style={{ marginBottom: 8 }}>
                        <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
                        <Text strong style={{ fontSize: 13 }}>安全提示</Text>
                    </Space>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {toolConfig.tips.map((tip, index) => (
                            <li key={index} style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: 12 }}>
                <Button
                    block
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => onReject(approval.id)}
                    loading={processing === approval.id}
                    disabled={processing && processing !== approval.id}
                >
                    拒绝
                </Button>
                <Button
                    block
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => onApprove(approval.id)}
                    loading={processing === approval.id}
                    disabled={processing && processing !== approval.id}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                    批准执行
                </Button>
            </div>
        </div>
    );
}

export default function ApprovalModalAntd({ taskId }) {
    const { tasks, approveApproval, rejectApproval } = useAgent();
    const [processing, setProcessing] = useState(null);

    const task = tasks[taskId];
    const approvals = task?.pendingApprovals || [];

    const handleApprove = async (approvalId) => {
        setProcessing(approvalId);
        try {
            await approveApproval(taskId, approvalId);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (approvalId) => {
        setProcessing(approvalId);
        try {
            await rejectApproval(taskId, approvalId);
        } finally {
            setProcessing(null);
        }
    };

    const handleApproveAll = async () => {
        for (const approval of approvals) {
            await handleApprove(approval.id);
        }
    };

    const handleRejectAll = async () => {
        for (const approval of approvals) {
            await handleReject(approval.id);
        }
    };

    if (approvals.length === 0) return null;

    return (
        <Modal
            open={approvals.length > 0}
            title={
                <Space>
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                    <span>需要您的批准</span>
                    {approvals.length > 1 && (
                        <Tag color="blue">{approvals.length} 项</Tag>
                    )}
                </Space>
            }
            footer={approvals.length > 1 ? (
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button
                        block
                        danger
                        onClick={handleRejectAll}
                        disabled={processing !== null}
                    >
                        全部拒绝
                    </Button>
                    <Button
                        block
                        type="primary"
                        onClick={handleApproveAll}
                        disabled={processing !== null}
                        style={{ background: '#52c41a', borderColor: '#52c41a' }}
                    >
                        全部批准
                    </Button>
                </div>
            ) : null}
            closable={false}
            maskClosable={false}
            width={520}
        >
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                AI 助手请求执行以下操作，请审核后决定是否允许。
            </Paragraph>

            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {approvals.map((approval) => (
                    <ApprovalCard
                        key={approval.id}
                        approval={approval}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        processing={processing}
                    />
                ))}
            </div>
        </Modal>
    );
}

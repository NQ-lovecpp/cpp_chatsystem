/**
 * ExecutionStreamAgent - 思维链执行流展示
 * 参考 shipmentPlanning/frontend ExecutionStream 风格：
 * - 列表式展示 assistant / tool_call / tool_response / error / status
 * - 自动滚动到底部
 */

import { useEffect, useRef, useCallback } from 'react';
import {
    BulbOutlined,
    ToolOutlined,
    ThunderboltOutlined,
    ExclamationCircleOutlined,
    LoadingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Empty, Spin } from 'antd';

// 节点类型 → 图标与样式
const NODE_CONFIG = {
    reasoning: {
        icon: <BulbOutlined style={{ color: '#faad14' }} />,
        iconRunning: <LoadingOutlined spin style={{ color: '#1890ff' }} />,
        label: '思考',
    },
    tool_call: {
        icon: <ToolOutlined style={{ color: '#1890ff' }} />,
        iconRunning: <LoadingOutlined spin style={{ color: '#1890ff' }} />,
        label: '工具调用',
    },
    tool_output: {
        icon: <ThunderboltOutlined style={{ color: '#722ed1' }} />,
        label: '执行结果',
    },
    result: {
        icon: <ThunderboltOutlined style={{ color: '#722ed1' }} />,
        label: '执行结果',
    },
    error: {
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        label: '错误',
    },
};

function parseJsonSafe(str) {
    if (!str || typeof str !== 'string') return str;
    try {
        return JSON.parse(str);
    } catch {
        return str;
    }
}

function ExecutionStreamItem({ node }) {
    const cfg = NODE_CONFIG[node.node_type] || { icon: <UserOutlined />, label: '步骤' };
    const isRunning = node.status === 'running';
    const icon = isRunning && cfg.iconRunning ? cfg.iconRunning : cfg.icon;

    let content = null;

    if (node.node_type === 'reasoning') {
        content = (
            <div className="text-sm text-[var(--color-text)] whitespace-pre-wrap break-words">
                {(node.content || node.description || '').trim() || (isRunning ? '正在思考...' : '')}
            </div>
        );
    } else if (node.node_type === 'tool_call' || node.node_type === 'tool_output') {
        const toolName = node.title?.replace('调用工具: ', '')?.replace('任务管理: ', '') || '工具';
        const rawContent = (node.content || node.description || '').trim();
        const parsed = rawContent ? parseJsonSafe(rawContent) : null;
        content = (
            <div className="text-sm space-y-1">
                <div className="font-medium text-[var(--color-text)]">{toolName}</div>
                {rawContent && (
                    <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded px-2 py-1.5 overflow-x-auto max-h-32 overflow-y-auto">
                        {parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (
                            <ul className="list-disc list-inside space-y-0.5">
                                {Object.entries(parsed).map(([k, v]) => (
                                    <li key={k}>
                                        <strong>{k}:</strong> {JSON.stringify(v)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <pre className="m-0 text-xs whitespace-pre-wrap break-words">{rawContent}</pre>
                        )}
                    </div>
                )}
            </div>
        );
    } else if (node.node_type === 'result') {
        const text = (node.content || node.description || '').trim();
        content = (
            <div className="text-sm text-[var(--color-text)] bg-[var(--color-surface)] rounded px-2 py-1.5 break-words">
                {text.length > 500 ? text.slice(0, 500) + '...' : text}
            </div>
        );
    } else if (node.node_type === 'error') {
        content = (
            <div className="text-sm text-[#ff4d4f]">
                {node.content || node.description || '未知错误'}
            </div>
        );
    }

    return (
        <div className="flex gap-3 py-3 border-b border-[var(--color-border)] last:border-b-0">
            <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)]">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">
                    {cfg.label}
                    {node.status === 'success' && <span className="ml-1 text-green-600">✓</span>}
                </div>
                {content}
            </div>
        </div>
    );
}

export default function ExecutionStreamAgent({ chainNodes = [], loading = false }) {
    const endRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const rafId = requestAnimationFrame(scrollToBottom);
        return () => cancelAnimationFrame(rafId);
    }, [chainNodes, scrollToBottom]);

    if (loading && chainNodes.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spin tip="加载中..." />
            </div>
        );
    }

    if (chainNodes.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无执行记录"
                className="py-12"
            />
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 py-2">
                {chainNodes.map((node, index) => (
                    <ExecutionStreamItem
                        key={node.chain_id || `node-${index}`}
                        node={node}
                    />
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
}

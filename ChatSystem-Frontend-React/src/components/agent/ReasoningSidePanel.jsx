/**
 * ReasoningSidePanel - 思维链侧边面板（融入主布局，非弹窗）
 * 参考 shipmentPlanning 的 ExecutionStream 风格展示思维链
 */

import { useEffect, useState } from 'react';
import { BulbOutlined, CheckSquareOutlined, CloseOutlined } from '@ant-design/icons';
import { Tabs, Empty, Spin } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { useAgent } from '../../contexts/AgentContext';
import { getEventHistory } from '../../api/agentApi';
import ExecutionStreamAgent from './ExecutionStreamAgent';
import TaskTodoList from './TaskTodoList';

export default function ReasoningSidePanel({ streamId, onClose }) {
    const { sessionId } = useAuth();
    const { tasks } = useAgent();

    const [historyData, setHistoryData] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const liveTask = streamId ? tasks[streamId] : null;
    const isLive = !!liveTask;

    useEffect(() => {
        if (!streamId || isLive) {
            setHistoryData(null);
            return;
        }

        setLoadingHistory(true);
        getEventHistory(sessionId, streamId)
            .then(data => setHistoryData(data))
            .catch(() => setHistoryData(null))
            .finally(() => setLoadingHistory(false));
    }, [streamId, isLive, sessionId]);

    const thoughtChain = isLive ? liveTask.thoughtChain : (historyData?.thought_chain ?? []);
    const todos = isLive ? liveTask.todos : (historyData?.todos ?? []);
    const isLoading = isLive
        ? (liveTask.status === 'pending' || liveTask.status === 'running')
        : loadingHistory;

    const tabItems = [
        {
            key: 'chain',
            label: (
                <span>
                    <BulbOutlined style={{ marginRight: 4 }} />
                    思考过程
                </span>
            ),
            children: (
                <div className="h-[calc(100vh-220px)] min-h-[200px]">
                    <ExecutionStreamAgent
                        chainNodes={thoughtChain}
                        loading={isLoading && thoughtChain.length === 0}
                    />
                </div>
            ),
        },
        {
            key: 'todos',
            label: (
                <span>
                    <CheckSquareOutlined style={{ marginRight: 4 }} />
                    任务步骤 {todos.length > 0 ? `(${todos.length})` : ''}
                </span>
            ),
            children: todos.length === 0 ? (
                <div className="py-12">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={isLoading ? '加载中...' : '无任务步骤'}
                    />
                </div>
            ) : (
                <div className="py-2">
                    <TaskTodoList todos={todos} showProgress />
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-full bg-[var(--color-surface-elevated)]/95 border-l border-[var(--color-border)]">
            {/* 头部 */}
            <div className="shrink-0 h-14 px-4 flex items-center justify-between border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                    <BulbOutlined style={{ color: '#faad14' }} />
                    <span className="font-medium text-[var(--color-text)]">推理过程</span>
                    {isLive && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            实时
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    title="关闭"
                >
                    <CloseOutlined />
                </button>
            </div>

            {/* 内容 */}
            <div className="flex-1 min-h-0 overflow-hidden px-3 py-2">
                {loadingHistory && !historyData ? (
                    <div className="flex justify-center items-center py-12">
                        <Spin tip="加载推理记录..." />
                    </div>
                ) : (
                    <Tabs
                        defaultActiveKey="chain"
                        items={tabItems}
                        size="small"
                        className="h-full [&_.ant-tabs-content]:h-full [&_.ant-tabs-tabpane]:h-full"
                    />
                )}
            </div>
        </div>
    );
}

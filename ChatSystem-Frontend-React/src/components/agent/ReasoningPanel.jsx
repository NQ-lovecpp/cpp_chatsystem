/**
 * ReasoningPanel - 每条 Agent 消息的推理过程弹窗
 *
 * 使用场景：
 * - 实时（stream 进行中）：从 AgentContext 读取 tasks 状态
 * - 历史（stream 已结束）：通过 getEventHistory API 加载 thought_chain + todos
 *
 * 打开方式：MessageArea 中每条 Agent 消息底部的「正在思考 >」按钮
 */

import { useEffect, useState } from 'react';
import { Drawer, Spin, Empty, Tabs, Typography } from 'antd';
import { BulbOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useAgent } from '../../contexts/AgentContext';
import { getEventHistory } from '../../api/agentApi';
import TaskThoughtChain from './TaskThoughtChain';
import TaskChecklist from './TaskTodoList';

const { Text } = Typography;

export default function ReasoningPanel({ streamId, open, onClose }) {
    const { sessionId } = useAuth();
    const { tasks } = useAgent();

    // 历史数据（已完成的 stream）
    const [historyData, setHistoryData] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // 实时数据（进行中的 stream）
    const liveTask = streamId ? tasks[streamId] : null;
    const isLive = !!liveTask;

    // 加载历史数据
    useEffect(() => {
        if (!open || !streamId || isLive) {
            setHistoryData(null);
            return;
        }

        setLoadingHistory(true);
        getEventHistory(sessionId, streamId)
            .then(data => setHistoryData(data))
            .catch(() => setHistoryData(null))
            .finally(() => setLoadingHistory(false));
    }, [open, streamId, isLive, sessionId]);

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
                <div style={{ padding: '8px 0' }}>
                    <TaskThoughtChain chainNodes={thoughtChain} loading={isLoading && thoughtChain.length === 0} />
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
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={isLoading ? '加载中...' : '无任务步骤'}
                    style={{ padding: '24px 0' }}
                />
            ) : (
                <div style={{ padding: '8px 0' }}>
                    <TaskChecklist todos={todos} showProgress />
                </div>
            ),
        },
    ];

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BulbOutlined style={{ color: '#faad14' }} />
                    <span>推理过程</span>
                    {isLive && (
                        <span style={{ fontSize: 11, color: '#1890ff', marginLeft: 4 }}>
                            实时
                        </span>
                    )}
                </div>
            }
            placement="right"
            width={420}
            open={open}
            onClose={onClose}
            styles={{ body: { padding: '8px 16px', overflowY: 'auto' } }}
            destroyOnClose={false}
        >
            {loadingHistory && !historyData ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
                    <Spin tip="加载推理记录..." />
                </div>
            ) : (
                <Tabs
                    defaultActiveKey="chain"
                    items={tabItems}
                    size="small"
                    style={{ height: '100%' }}
                />
            )}
        </Drawer>
    );
}

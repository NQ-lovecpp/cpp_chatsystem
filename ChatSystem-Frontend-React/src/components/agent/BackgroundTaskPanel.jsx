/**
 * BackgroundTaskPanel - 右侧可折叠后台任务面板
 *
 * 显示后台正在运行的智能体任务（如深度研究），
 * 通过 SSE 订阅实时进度，完成后卡片变为已完成状态。
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge, Button, Typography, Progress, Drawer, Empty } from 'antd';
import {
    ExperimentOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    RightOutlined,
    DownOutlined,
} from '@ant-design/icons';
import { getBackgroundTasks, subscribeTaskSSE } from '../../api/agentApi';
import { useAuth } from '../../contexts/AuthContext';

const { Text, Title } = Typography;

const STATUS_MAP = {
    running: { icon: <SyncOutlined spin />, color: '#1677ff', label: '执行中' },
    done: { icon: <CheckCircleOutlined />, color: '#52c41a', label: '已完成' },
    failed: { icon: <CloseCircleOutlined />, color: '#ff4d4f', label: '失败' },
};

function TaskCard({ task }) {
    const [expanded, setExpanded] = useState(task.status === 'running');
    const [todos, setTodos] = useState([]);
    const [thoughts, setThoughts] = useState([]);
    const [progress, setProgress] = useState(0);
    const sseRef = useRef(null);
    const { sessionId } = useAuth();

    useEffect(() => {
        if (task.status !== 'running' || !task.task_id) return;

        const cleanup = subscribeTaskSSE(sessionId, task.task_id, {
            onTodoAdded: (data) => {
                if (data.todo) {
                    setTodos(prev => [...prev, data.todo]);
                }
            },
            onTodoStatus: (data) => {
                setTodos(prev => prev.map(t =>
                    t.id === data.todoId ? { ...t, status: data.status } : t
                ));
            },
            onTodoProgress: (data) => {
                setProgress(data.progress || 0);
            },
            onThoughtChain: (data) => {
                setThoughts(prev => [...prev, data]);
            },
            onDone: () => {},
            onError: () => {},
        });

        sseRef.current = cleanup;
        return () => {
            if (typeof cleanup === 'function') cleanup();
        };
    }, [task.task_id, task.status, sessionId]);

    const st = STATUS_MAP[task.status] || STATUS_MAP.running;

    return (
        <div style={{
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            marginBottom: 8,
            overflow: 'hidden',
            background: 'var(--color-bg-elevated, var(--color-surface))',
        }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', cursor: 'pointer',
                }}
                onClick={() => setExpanded(e => !e)}
            >
                <span style={{ color: st.color }}>{st.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong ellipsis style={{ fontSize: 13, color: 'var(--color-text)' }}>
                        {task.topic || '后台任务'}
                    </Text>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {st.label}
                        {task.started_at && ` · ${new Date(task.started_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                </div>
                {expanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
            </div>

            {/* Expandable body */}
            {expanded && (
                <div style={{ padding: '0 12px 10px', borderTop: '1px solid var(--color-border)' }}>
                    {/* Progress bar */}
                    {task.status === 'running' && (
                        <Progress
                            percent={Math.round(progress)}
                            size="small"
                            strokeColor="#1677ff"
                            style={{ marginTop: 8, marginBottom: 4 }}
                        />
                    )}

                    {/* Todo checklist */}
                    {todos.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                            {todos.map((todo, idx) => {
                                const isCompleted = todo.status === 'completed';
                                const isRunning = todo.status === 'running';
                                return (
                                    <div key={todo.id || idx} style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '4px 0', fontSize: 12,
                                    }}>
                                        {isCompleted ? (
                                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                                        ) : isRunning ? (
                                            <SyncOutlined spin style={{ color: '#1677ff', fontSize: 12 }} />
                                        ) : (
                                            <div style={{
                                                width: 12, height: 12, borderRadius: 3,
                                                border: '1.5px solid var(--color-border)',
                                            }} />
                                        )}
                                        <span style={{
                                            color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
                                            textDecoration: isCompleted ? 'line-through' : 'none',
                                        }}>
                                            {todo.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Thought chain log */}
                    {thoughts.length > 0 && (
                        <div style={{ marginTop: 8, maxHeight: 120, overflowY: 'auto' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Activity</div>
                            {thoughts.map((t, idx) => (
                                <div key={idx} style={{
                                    fontSize: 11, color: 'var(--color-text-muted)',
                                    padding: '2px 0', borderLeft: '2px solid var(--color-border)',
                                    paddingLeft: 8, marginBottom: 2,
                                }}>
                                    {t.content || t.step || JSON.stringify(t)}
                                </div>
                            ))}
                        </div>
                    )}

                    {todos.length === 0 && thoughts.length === 0 && task.status === 'running' && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '8px 0' }}>
                            等待任务开始...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function BackgroundTaskPanel() {
    const [open, setOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const pollRef = useRef(null);

    const fetchTasks = useCallback(async () => {
        try {
            const result = await getBackgroundTasks();
            setTasks(result.tasks || []);
        } catch (e) {
            // silently fail
        }
    }, []);

    useEffect(() => {
        fetchTasks();
        pollRef.current = setInterval(fetchTasks, 10000);
        return () => clearInterval(pollRef.current);
    }, [fetchTasks]);

    const runningCount = tasks.filter(t => t.status === 'running').length;

    return (
        <>
            <Badge count={runningCount} size="small" offset={[-2, 2]}>
                <Button
                    type="text"
                    icon={<ExperimentOutlined />}
                    onClick={() => { setOpen(true); fetchTasks(); }}
                    title="后台任务"
                    style={{ color: 'var(--color-text-secondary)' }}
                />
            </Badge>

            <Drawer
                title="后台任务"
                placement="right"
                width={340}
                open={open}
                onClose={() => setOpen(false)}
                styles={{ body: { padding: '12px' } }}
            >
                {tasks.length === 0 ? (
                    <Empty description="暂无后台任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    tasks.map(task => <TaskCard key={task.task_id} task={task} />)
                )}
            </Drawer>
        </>
    );
}

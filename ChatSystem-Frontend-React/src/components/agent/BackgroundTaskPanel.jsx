/**
 * BackgroundTaskPanel - 右侧可折叠后台任务面板
 *
 * 按 chatSessionId 过滤任务，通过 SSE 订阅实时进度，
 * 完成后在面板内展示报告全文。
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
import { getBackgroundTasks, subscribeTaskEvents } from '../../api/agentApi';
import { useAuth } from '../../contexts/AuthContext';

const { Text, Paragraph } = Typography;

const STATUS_MAP = {
    running: { icon: <SyncOutlined spin />, color: '#1677ff', label: '执行中' },
    done: { icon: <CheckCircleOutlined />, color: '#52c41a', label: '已完成' },
    failed: { icon: <CloseCircleOutlined />, color: '#ff4d4f', label: '失败' },
};

function TaskCard({ task, onStatusChange }) {
    const [expanded, setExpanded] = useState(task.status === 'running');
    const [todos, setTodos] = useState([]);
    const [thoughts, setThoughts] = useState([]);
    const [progress, setProgress] = useState(0);
    const [localStatus, setLocalStatus] = useState(task.status);
    // 报告内容：从 SSE task_status.report 或轮询数据 task.report 获取
    const [report, setReport] = useState(task.report || null);
    const [summary, setSummary] = useState(task.summary || null);
    const sseRef = useRef(null);
    const { sessionId } = useAuth();

    useEffect(() => {
        setLocalStatus(task.status);
        if (task.report) setReport(task.report);
        if (task.summary) setSummary(task.summary);
    }, [task.status, task.report, task.summary]);

    useEffect(() => {
        if (localStatus !== 'running' || !task.task_id) return;

        const cleanup = subscribeTaskEvents(sessionId, task.task_id, {
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
            onTaskStatus: (data) => {
                const status = data.status === 'done' ? 'done'
                    : data.status === 'failed' ? 'failed'
                    : localStatus;
                setLocalStatus(status);
                if (status === 'done') {
                    setProgress(100);
                    if (data.report) setReport(data.report);
                    if (data.summary) setSummary(data.summary);
                }
                onStatusChange?.(task.task_id, status, data.report, data.summary);
            },
            onDone: () => {
                setLocalStatus('done');
                setProgress(100);
                onStatusChange?.(task.task_id, 'done');
            },
            onError: () => {
                setLocalStatus('failed');
                onStatusChange?.(task.task_id, 'failed');
            },
        });

        sseRef.current = cleanup;
        return () => {
            if (typeof cleanup === 'function') cleanup();
        };
    }, [task.task_id, localStatus, sessionId, onStatusChange]);

    const st = STATUS_MAP[localStatus] || STATUS_MAP.running;

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
                    {/* Progress bar (running only) */}
                    {localStatus === 'running' && (
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

                    {/* Thought chain log (running) */}
                    {thoughts.length > 0 && localStatus === 'running' && (
                        <div style={{ marginTop: 8, maxHeight: 120, overflowY: 'auto' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>执行日志</div>
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

                    {/* 已完成：展示摘要和报告全文 */}
                    {localStatus === 'done' && (
                        <div style={{ marginTop: 8 }}>
                            {summary && (
                                <div style={{
                                    padding: '8px 10px',
                                    background: 'var(--color-primary-light, rgba(22,119,255,0.06))',
                                    borderRadius: 6,
                                    borderLeft: '3px solid #1677ff',
                                    marginBottom: 8,
                                }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1677ff', marginBottom: 3 }}>摘要</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-text)' }}>{summary}</div>
                                </div>
                            )}
                            {report && (
                                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>研究报告</div>
                                    <Paragraph
                                        style={{
                                            fontSize: 12,
                                            color: 'var(--color-text)',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            margin: 0,
                                        }}
                                    >
                                        {report}
                                    </Paragraph>
                                </div>
                            )}
                            {!summary && !report && (
                                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '4px 0' }}>
                                    研究完成
                                </div>
                            )}
                        </div>
                    )}

                    {/* 失败提示 */}
                    {localStatus === 'failed' && (
                        <div style={{ fontSize: 12, color: '#ff4d4f', padding: '6px 0' }}>
                            任务执行失败
                        </div>
                    )}

                    {/* 等待开始 */}
                    {todos.length === 0 && thoughts.length === 0 && localStatus === 'running' && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '8px 0' }}>
                            等待任务开始...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function BackgroundTaskPanel({ chatSessionId }) {
    const [open, setOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const pollRef = useRef(null);

    const fetchTasks = useCallback(async () => {
        try {
            const result = await getBackgroundTasks(chatSessionId);
            setTasks(result.tasks || []);
        } catch (e) {
            // silently fail
        }
    }, [chatSessionId]);

    useEffect(() => {
        fetchTasks();
        pollRef.current = setInterval(fetchTasks, 10000);
        return () => clearInterval(pollRef.current);
    }, [fetchTasks]);

    const handleStatusChange = useCallback((taskId, status, report, summary) => {
        setTasks(prev => prev.map(t =>
            t.task_id === taskId
                ? { ...t, status, ...(report ? { report } : {}), ...(summary ? { summary } : {}) }
                : t
        ));
    }, []);

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
                title={`后台任务${tasks.length > 0 ? ` (${tasks.length})` : ''}`}
                placement="right"
                width={380}
                open={open}
                onClose={() => setOpen(false)}
                styles={{ body: { padding: '12px' } }}
            >
                {tasks.length === 0 ? (
                    <Empty description="当前会话暂无后台任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    tasks.map(task => (
                        <TaskCard
                            key={task.task_id}
                            task={task}
                            onStatusChange={handleStatusChange}
                        />
                    ))
                )}
            </Drawer>
        </>
    );
}

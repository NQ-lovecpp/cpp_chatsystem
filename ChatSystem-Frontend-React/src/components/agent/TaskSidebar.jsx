/**
 * TaskSidebar - 右侧任务面板
 *
 * 参考设计：展开式任务卡片，CHECKLIST + ACTIVITY LOG 堆叠显示（无 Tab）
 * - 运行中的任务默认展开
 * - CHECKLIST 区：复选框样式的 todo 列表（实时更新）
 * - ACTIVITY LOG 区：ThoughtChain 记录
 * - Stop Execution 按钮
 */

import { useState } from 'react';
import {
    Badge,
    Typography,
    Button,
    Empty,
    Flex,
    Progress,
} from 'antd';
import {
    RobotOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    PauseCircleOutlined,
    ThunderboltOutlined,
    DownOutlined,
    UpOutlined,
    StopOutlined,
} from '@ant-design/icons';
import { useAgent, TaskStatus } from '../../contexts/AgentContext';
import TaskChecklist from './TaskTodoList';
import TaskThoughtChain from './TaskThoughtChain';

const { Text } = Typography;

// 状态配置
const STATUS_CONFIG = {
    [TaskStatus.PENDING]:          { icon: <ClockCircleOutlined />,   color: '#8c8c8c',  text: '等待中',   dot: 'default' },
    [TaskStatus.RUNNING]:          { icon: <SyncOutlined spin />,      color: '#1677ff',  text: '执行中',   dot: 'processing' },
    [TaskStatus.WAITING_APPROVAL]: { icon: <PauseCircleOutlined />,    color: '#faad14',  text: '待审批',   dot: 'warning' },
    [TaskStatus.DONE]:             { icon: <CheckCircleOutlined />,    color: '#52c41a',  text: '已完成',   dot: 'success' },
    [TaskStatus.FAILED]:           { icon: <CloseCircleOutlined />,    color: '#ff4d4f',  text: '失败',     dot: 'error' },
    [TaskStatus.CANCELLED]:        { icon: <CloseCircleOutlined />,    color: '#8c8c8c',  text: '已取消',   dot: 'default' },
};

/**
 * 区块标题 - 对应设计稿中大写粗体的区块标签
 */
function SectionLabel({ children }) {
    return (
        <div style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            marginBottom: 8,
            marginTop: 4,
        }}>
            {children}
        </div>
    );
}

/**
 * 展开式任务卡片
 */
function TaskCard({ task, onCancel }) {
    // Start expanded for any non-terminal state so the panel is visible as soon as the
    // task is created (it's in PENDING when the card first mounts).
    const [expanded, setExpanded] = useState(
        task.status !== TaskStatus.DONE &&
        task.status !== TaskStatus.FAILED &&
        task.status !== TaskStatus.CANCELLED
    );

    const config = STATUS_CONFIG[task.status] || STATUS_CONFIG[TaskStatus.PENDING];
    const isRunning = task.status === TaskStatus.RUNNING;
    const isDone = task.status === TaskStatus.DONE;

    // 计算进度：优先使用 context 中已经计算好的 progress（来自 todo_progress SSE 事件）
    const progress = task.progress ?? (
        task.todos?.length > 0
            ? Math.round(
                (task.todos.filter(t => t.status === 'completed' || t.status === 'skipped').length / task.todos.length) * 100
              )
            : (isDone ? 100 : 0)
    );

    const hasTodos = task.todos?.length > 0;
    const hasChain = task.thoughtChain?.length > 0;

    return (
        <div
            style={{
                marginBottom: 8,
                borderRadius: 12,
                border: `1px solid ${isRunning ? '#1677ff40' : 'var(--color-border)'}`,
                background: 'var(--color-surface-elevated)',
                overflow: 'hidden',
                boxShadow: isRunning ? '0 0 0 2px #1677ff18' : undefined,
            }}
        >
            {/* ── 卡片头部：点击展开/收起 ── */}
            <div
                style={{ padding: '10px 14px', cursor: 'pointer' }}
                className="hover:bg-[var(--color-surface)] transition-colors"
                onClick={() => setExpanded(v => !v)}
            >
                <Flex justify="space-between" align="center" gap={8}>
                    {/* 左：状态点 + 标题 */}
                    <Flex align="center" gap={8} style={{ minWidth: 0, flex: 1 }}>
                        <Badge status={config.dot} />
                        <Text
                            ellipsis={{ tooltip: task.inputText }}
                            style={{
                                fontSize: 14,
                                fontWeight: isRunning ? 600 : 500,
                                flex: 1,
                                color: isRunning ? 'var(--color-text)' : 'var(--color-text-secondary)',
                            }}
                        >
                            {task.inputText?.slice(0, 32) || '未命名任务'}
                            {task.inputText?.length > 32 ? '...' : ''}
                        </Text>
                    </Flex>

                    {/* 右：状态文字 + 展开图标 */}
                    <Flex align="center" gap={6} style={{ flexShrink: 0 }}>
                        <Text style={{ fontSize: 12, color: config.color }}>
                            {config.text}
                        </Text>
                        {expanded
                            ? <UpOutlined style={{ fontSize: 10, color: 'var(--color-text-muted)' }} />
                            : <DownOutlined style={{ fontSize: 10, color: 'var(--color-text-muted)' }} />
                        }
                    </Flex>
                </Flex>

                {/* 进度条（始终可见）*/}
                {(hasTodos || isRunning || isDone) && (
                    <Flex align="center" gap={8} style={{ marginTop: 8 }}>
                        <Progress
                            percent={progress}
                            size="small"
                            status={
                                task.status === TaskStatus.FAILED ? 'exception' :
                                isDone ? 'success' :
                                isRunning ? 'active' : 'normal'
                            }
                            showInfo={false}
                            style={{ flex: 1, marginBottom: 0 }}
                            strokeColor={{ '0%': '#1677ff', '100%': '#52c41a' }}
                        />
                        <Text type="secondary" style={{ fontSize: 11, flexShrink: 0, minWidth: 30 }}>
                            {progress}%
                        </Text>
                    </Flex>
                )}
            </div>

            {/* ── 展开内容 ── */}
            {expanded && (
                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ padding: '12px 14px', maxHeight: 480, overflowY: 'auto' }}>

                        {/* CHECKLIST 区块：只在有 todos 或 running 时显示 */}
                        {(hasTodos || isRunning) && (
                            <>
                                <SectionLabel>Checklist</SectionLabel>
                                {hasTodos
                                    ? <TaskChecklist todos={task.todos} progress={progress} showProgress={false} />
                                    : (
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: 12, paddingBottom: 8 }}>
                                            Agent 正在规划步骤...
                                        </div>
                                    )
                                }
                            </>
                        )}

                        {/* ACTIVITY LOG 区块 */}
                        <div style={{ marginTop: 16 }}>
                            <SectionLabel>Activity Log</SectionLabel>
                            <TaskThoughtChain
                                chainNodes={task.thoughtChain}
                                loading={isRunning && !hasChain}
                            />
                        </div>

                        {/* 任务输出区块 */}
                        {task.taskOutput && (
                            <div style={{ marginTop: 16 }}>
                                <SectionLabel>输出</SectionLabel>
                                <div style={{ fontSize: 12, whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    {task.taskOutput}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stop Execution 按钮 */}
                    {isRunning && onCancel && (
                        <div style={{ padding: '8px 14px 12px', borderTop: '1px solid var(--color-border)' }}>
                            <Button
                                size="small"
                                icon={<StopOutlined />}
                                onClick={(e) => { e.stopPropagation(); onCancel(task.id); }}
                                block
                                style={{
                                    borderRadius: 20,
                                    color: 'var(--color-text-secondary)',
                                    borderColor: 'var(--color-border)',
                                }}
                            >
                                Stop Execution
                            </Button>
                        </div>
                    )}

                    {/* 时间戳 */}
                    <div style={{ padding: '2px 14px 8px', textAlign: 'right' }}>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                            {task.createdAt ? new Date(task.createdAt).toLocaleTimeString() : ''}
                        </Text>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * TaskSidebar - 右侧任务面板
 */
export default function TaskSidebar({ className = '', chatSessionId = null }) {
    const { getSessionTasks, cancelTask } = useAgent();

    const taskList = getSessionTasks(chatSessionId);

    // 排序：运行中 > 待审批 > 等待 > 失败 > 取消 > 已完成
    const sortedTasks = [...taskList].sort((a, b) => {
        const order = { running: 0, waiting_approval: 1, pending: 2, failed: 3, cancelled: 4, done: 5 };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9);
    });

    const activeCount = taskList.filter(t => t.status === TaskStatus.RUNNING).length;

    return (
        <div className={`flex flex-col h-full bg-[var(--color-surface-elevated)] ${className}`}>
            {/* 头部 */}
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                <Flex align="center" justify="space-between">
                    <Flex align="center" gap={8}>
                        <ThunderboltOutlined style={{ color: 'var(--color-primary)', fontSize: 14 }} />
                        <Text style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                            Agent Tasks
                        </Text>
                    </Flex>
                    {activeCount > 0 && (
                        <Flex align="center" gap={6}>
                            <Text type="secondary" style={{ fontSize: 12 }}>{activeCount} active</Text>
                            <Badge
                                count={activeCount}
                                size="small"
                                style={{ backgroundColor: '#1677ff' }}
                            />
                        </Flex>
                    )}
                </Flex>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-3 min-h-0">
                {/* 引导提示 */}
                <div style={{
                    padding: '7px 10px',
                    background: 'var(--color-primary-light, #e6f4ff)',
                    borderRadius: 8,
                    marginBottom: 12,
                    fontSize: 12,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}>
                    <RobotOutlined />
                    在聊天中 @AI 助手 触发任务
                </div>

                {/* 任务列表 */}
                {sortedTasks.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<Text type="secondary" style={{ fontSize: 12 }}>暂无任务</Text>}
                        style={{ margin: '24px 0' }}
                    />
                ) : (
                    sortedTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onCancel={cancelTask}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

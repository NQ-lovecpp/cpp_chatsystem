/**
 * TaskDetailPanel - 任务详情面板
 * 显示选中任务的详细信息、Todo 进度、消息流
 * 使用 CSS 变量适配深浅色模式
 */

import { useRef, useEffect, useState } from 'react';
import {
    Progress,
    Button,
    Space,
    Input,
    Tag,
    Tooltip,
    Spin,
    Empty,
    Alert,
} from 'antd';
import {
    CheckCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    SendOutlined,
    StopOutlined,
    ExclamationCircleOutlined,
    BulbOutlined,
} from '@ant-design/icons';
import { useAgent, TaskStatus, TodoStatus, MessageType } from '../../contexts/AgentContext';
import TaskMessageItem from './TaskMessageItem';

// Todo 状态图标
const todoStatusIcons = {
    [TodoStatus.IDLE]: <ClockCircleOutlined style={{ color: 'var(--color-text-muted)' }} />,
    [TodoStatus.RUNNING]: <SyncOutlined spin style={{ color: '#1677ff' }} />,
    [TodoStatus.COMPLETED]: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    [TodoStatus.FAILED]: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    [TodoStatus.SKIPPED]: <ClockCircleOutlined style={{ color: 'var(--color-text-muted)' }} />,
};

// Todo 进度组件
function TodoProgress({ todos }) {
    if (!todos || todos.length === 0) return null;

    const completed = todos.filter(t => t.status === TodoStatus.COMPLETED).length;
    const total = todos.length;
    const percent = Math.round((completed / total) * 100);

    return (
        <div className="mb-4 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-[var(--color-text)]">任务步骤</span>
                <span className="text-xs text-[var(--color-text-muted)]">{completed}/{total} 完成</span>
            </div>
            <Progress 
                percent={percent} 
                size="small" 
                status={percent === 100 ? 'success' : 'active'}
            />
            <div className="mt-3">
                {todos.map((todo, index) => (
                    <div 
                        key={todo.id} 
                        className={`flex items-center gap-2 py-1.5 ${index < todos.length - 1 ? 'border-b border-[var(--color-border-light)]' : ''}`}
                    >
                        {todoStatusIcons[todo.status] || todoStatusIcons[TodoStatus.IDLE]}
                        <span 
                            className={`flex-1 text-sm ${
                                todo.status === TodoStatus.COMPLETED 
                                    ? 'line-through text-[var(--color-text-muted)]' 
                                    : 'text-[var(--color-text)]'
                            }`}
                        >
                            {todo.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 主组件
export default function TaskDetailPanel({ className = '' }) {
    const { selectedTask, cancelTask, loading } = useAgent();
    const messagesEndRef = useRef(null);
    const [userInput, setUserInput] = useState('');

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTask?.messages]);

    if (!selectedTask) {
        return (
            <div className={`flex items-center justify-center h-full bg-[var(--color-surface)] ${className}`}>
                <Empty 
                    description={<span className="text-[var(--color-text-muted)]">选择一个任务查看详情</span>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </div>
        );
    }

    const isRunning = selectedTask.status === TaskStatus.RUNNING;
    const isWaitingApproval = selectedTask.status === TaskStatus.WAITING_APPROVAL;

    return (
        <div className={`flex flex-col h-full bg-[var(--color-background)] ${className}`}>
            {/* 头部 */}
            <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--color-text)] truncate text-sm mb-1">
                            {selectedTask.inputText?.slice(0, 50) || '任务详情'}
                            {selectedTask.inputText?.length > 50 ? '...' : ''}
                        </p>
                        <Space size={4}>
                            <Tag color={
                                selectedTask.status === TaskStatus.RUNNING ? 'processing' :
                                selectedTask.status === TaskStatus.DONE ? 'success' :
                                selectedTask.status === TaskStatus.FAILED ? 'error' :
                                selectedTask.status === TaskStatus.WAITING_APPROVAL ? 'warning' :
                                'default'
                            }>
                                {selectedTask.status === TaskStatus.RUNNING ? '执行中' :
                                 selectedTask.status === TaskStatus.DONE ? '已完成' :
                                 selectedTask.status === TaskStatus.FAILED ? '失败' :
                                 selectedTask.status === TaskStatus.WAITING_APPROVAL ? '待审批' :
                                 selectedTask.status}
                            </Tag>
                            {selectedTask.progress > 0 && selectedTask.progress < 100 && (
                                <span className="text-xs text-[var(--color-text-muted)]">
                                    {selectedTask.progress}%
                                </span>
                            )}
                        </Space>
                    </div>
                    {(isRunning || isWaitingApproval) && (
                        <Tooltip title="取消任务">
                            <Button 
                                danger 
                                size="small" 
                                icon={<StopOutlined />}
                                onClick={() => cancelTask(selectedTask.id)}
                            >
                                取消
                            </Button>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {/* Todo 进度 */}
                <TodoProgress todos={selectedTask.todos} />

                {/* 审批提醒 */}
                {selectedTask.pendingApprovals?.length > 0 && (
                    <Alert
                        type="warning"
                        message={`有 ${selectedTask.pendingApprovals.length} 个操作需要审批`}
                        showIcon
                        icon={<ExclamationCircleOutlined />}
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* 消息流 */}
                <div>
                    {selectedTask.messages.map((message, index) => {
                        const isLastAssistant = message.type === MessageType.ASSISTANT &&
                            index === selectedTask.messages.length - 1;
                        const isStreaming = message.streaming && isRunning;
                        return (
                            <TaskMessageItem
                                key={message.id}
                                message={message}
                                isLastAssistantAndStreaming={isLastAssistant && isStreaming}
                            />
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* 加载中 */}
                {isRunning && selectedTask.messages.length === 0 && (
                    <div className="text-center py-6">
                        <Spin tip="任务执行中..." />
                    </div>
                )}
            </div>

            {/* 底部输入区域 */}
            {isRunning && (
                <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] shrink-0">
                    <div className="flex gap-2">
                        <Input
                            placeholder="向任务发送消息..."
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onPressEnter={() => {
                                // TODO: 实现向运行中的任务发送消息
                                setUserInput('');
                            }}
                            disabled={!isRunning}
                        />
                        <Button 
                            type="primary" 
                            icon={<SendOutlined />}
                            disabled={!userInput.trim() || !isRunning}
                        >
                            发送
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

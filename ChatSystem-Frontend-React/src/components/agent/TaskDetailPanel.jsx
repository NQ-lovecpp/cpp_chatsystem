/**
 * TaskDetailPanel - 任务详情面板
 * 显示选中任务的详细信息、Todo 进度、消息流
 * 使用 CSS 变量适配深浅色模式
 */

import { useRef, useEffect, useState } from 'react';
import {
    Progress,
    Typography,
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
    CodeOutlined,
    SearchOutlined,
    GlobalOutlined,
    FileTextOutlined,
    SendOutlined,
    StopOutlined,
    UserOutlined,
    RobotOutlined,
    ExclamationCircleOutlined,
    BulbOutlined,
} from '@ant-design/icons';
import { useAgent, TaskStatus, MessageType, TodoStatus } from '../../contexts/AgentContext';
import StreamingMarkdown from './StreamingMarkdown';

const { Text } = Typography;

// Todo 状态图标
const todoStatusIcons = {
    [TodoStatus.IDLE]: <ClockCircleOutlined style={{ color: 'var(--color-text-muted)' }} />,
    [TodoStatus.RUNNING]: <SyncOutlined spin style={{ color: '#1677ff' }} />,
    [TodoStatus.COMPLETED]: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    [TodoStatus.FAILED]: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    [TodoStatus.SKIPPED]: <ClockCircleOutlined style={{ color: 'var(--color-text-muted)' }} />,
};

// 工具图标
const toolIcons = {
    web_search: <SearchOutlined style={{ color: '#1677ff' }} />,
    web_open: <GlobalOutlined style={{ color: '#52c41a' }} />,
    web_find: <FileTextOutlined style={{ color: '#722ed1' }} />,
    python_execute: <CodeOutlined style={{ color: '#fa8c16' }} />,
    add_todos: <BulbOutlined style={{ color: '#13c2c2' }} />,
    update_todo: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    list_todos: <FileTextOutlined style={{ color: 'var(--color-text-muted)' }} />,
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

// 工具调用卡片
function ToolCallCard({ message }) {
    const [expanded, setExpanded] = useState(false);
    const icon = toolIcons[message.toolName] || <CodeOutlined />;
    
    const statusColor = {
        executing: 'processing',
        completed: 'success',
        failed: 'error',
        pending_approval: 'warning',
    }[message.status] || 'default';

    const isTodoTool = ['add_todos', 'update_todo', 'list_todos'].includes(message.toolName);

    return (
        <div className={`mb-2 p-3 rounded-lg border ${
            message.requiresApproval 
                ? 'bg-yellow-500/10 border-yellow-500/30' 
                : 'bg-[var(--color-surface)] border-[var(--color-border)]'
        }`}>
            <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <Space>
                    {icon}
                    <span className="text-sm font-medium text-[var(--color-text)]">
                        {message.toolName === 'web_search' ? '网页搜索' :
                         message.toolName === 'web_open' ? '打开网页' :
                         message.toolName === 'web_find' ? '页面查找' :
                         message.toolName === 'python_execute' ? 'Python 执行' :
                         message.toolName === 'add_todos' ? '添加步骤' :
                         message.toolName === 'update_todo' ? '更新步骤' :
                         message.toolName}
                    </span>
                </Space>
                <Tag color={statusColor} style={{ marginRight: 0 }}>
                    {message.status === 'executing' ? '执行中' :
                     message.status === 'completed' ? '完成' :
                     message.status === 'failed' ? '失败' :
                     message.status === 'pending_approval' ? '待审批' :
                     message.status}
                </Tag>
            </div>
            
            {expanded && !isTodoTool && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                    {message.arguments && (
                        <div className="mb-2">
                            <span className="text-xs text-[var(--color-text-muted)]">参数:</span>
                            <pre className="text-xs bg-[var(--color-surface)] p-2 rounded mt-1 overflow-auto max-h-[100px] text-[var(--color-text-secondary)]">
                                {JSON.stringify(message.arguments, null, 2)}
                            </pre>
                        </div>
                    )}
                    {message.output && (
                        <div>
                            <span className="text-xs text-[var(--color-text-muted)]">输出:</span>
                            <pre className="text-xs bg-[var(--color-surface)] p-2 rounded mt-1 overflow-auto max-h-[150px] whitespace-pre-wrap text-[var(--color-text-secondary)]">
                                {typeof message.output === 'string' 
                                    ? message.output 
                                    : JSON.stringify(message.output, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// 消息气泡
function MessageBubble({ message }) {
    const isUser = message.type === MessageType.USER;
    const isError = message.type === MessageType.ERROR;
    const isReasoning = message.type === MessageType.REASONING;
    const isToolCall = message.type === MessageType.TOOL_CALL;

    if (isToolCall) {
        return <ToolCallCard message={message} />;
    }

    if (isReasoning) {
        return (
            <div className="flex gap-2 mb-3 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <BulbOutlined style={{ color: '#52c41a', marginTop: 2 }} />
                <span className="text-sm text-[var(--color-text-muted)] italic">
                    {message.content}
                </span>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert
                type="error"
                message={message.content}
                showIcon
                style={{ marginBottom: 12 }}
            />
        );
    }

    return (
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-2 mb-3`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isUser 
                    ? 'bg-[var(--color-primary)]' 
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
            }`}>
                {isUser 
                    ? <UserOutlined style={{ color: '#fff', fontSize: 14 }} /> 
                    : <RobotOutlined style={{ color: '#fff', fontSize: 14 }} />
                }
            </div>
            <div className={`max-w-[80%] px-3.5 py-2.5 ${
                isUser 
                    ? 'rounded-[16px_16px_4px_16px] bg-[var(--color-primary)] text-white' 
                    : 'rounded-[16px_16px_16px_4px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)]'
            } shadow-sm`}>
                <StreamingMarkdown content={message.content || ''} />
                {message.streaming && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-[var(--color-primary)] animate-blink" />
                )}
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
                    {selectedTask.messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}
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

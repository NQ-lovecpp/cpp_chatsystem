/**
 * TaskSidebar - 右侧任务面板
 * 显示任务列表、进度、快捷操作
 * 使用 CSS 变量适配深浅色模式
 */

import { useState } from 'react';
import { 
    Card, 
    Progress, 
    Badge, 
    Space, 
    Typography, 
    Button, 
    Input,
    Tooltip,
    Empty,
    Spin,
    Tag,
} from 'antd';
import {
    RobotOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    PauseCircleOutlined,
    SendOutlined,
    FileSearchOutlined,
    EditOutlined,
    TranslationOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useAgent, TaskStatus } from '../../contexts/AgentContext';

const { Text, Title } = Typography;

// 任务状态图标和颜色配置
const statusConfig = {
    [TaskStatus.PENDING]: {
        icon: <ClockCircleOutlined />,
        color: 'default',
        text: '等待中',
    },
    [TaskStatus.RUNNING]: {
        icon: <SyncOutlined spin />,
        color: 'processing',
        text: '执行中',
    },
    [TaskStatus.WAITING_APPROVAL]: {
        icon: <PauseCircleOutlined />,
        color: 'warning',
        text: '待审批',
    },
    [TaskStatus.DONE]: {
        icon: <CheckCircleOutlined />,
        color: 'success',
        text: '已完成',
    },
    [TaskStatus.FAILED]: {
        icon: <CloseCircleOutlined />,
        color: 'error',
        text: '失败',
    },
    [TaskStatus.CANCELLED]: {
        icon: <CloseCircleOutlined />,
        color: 'default',
        text: '已取消',
    },
};

// 快捷操作按钮
const quickActions = [
    { key: 'summarize', icon: <FileSearchOutlined />, label: '总结' },
    { key: 'fact_check', icon: <SearchOutlined />, label: '事实核查' },
    { key: 'draft_reply', icon: <EditOutlined />, label: '草拟回复' },
    { key: 'translate', icon: <TranslationOutlined />, label: '翻译' },
];

// 单个任务卡片
function TaskCard({ task, selected, onClick }) {
    const config = statusConfig[task.status] || statusConfig[TaskStatus.PENDING];
    const isRunning = task.status === TaskStatus.RUNNING;
    
    return (
        <div
            onClick={onClick}
            className={`
                mb-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                ${selected 
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-sm' 
                    : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface)] hover:shadow-sm'
                }
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <Space size={4}>
                    <span style={{ color: config.color === 'processing' ? '#1677ff' : 
                                          config.color === 'success' ? '#52c41a' : 
                                          config.color === 'error' ? '#ff4d4f' : 
                                          config.color === 'warning' ? '#faad14' : 'var(--color-text-muted)' }}>
                        {config.icon}
                    </span>
                    <span className="font-medium text-[var(--color-text)] text-sm truncate max-w-[160px]">
                        {task.inputText?.slice(0, 30) || '未命名任务'}
                        {task.inputText?.length > 30 ? '...' : ''}
                    </span>
                </Space>
                <Tag color={config.color} style={{ marginRight: 0 }}>
                    {config.text}
                </Tag>
            </div>
            
            {/* 进度条 */}
            <Progress 
                percent={task.progress || (task.status === TaskStatus.DONE ? 100 : 0)} 
                size="small"
                status={
                    task.status === TaskStatus.FAILED ? 'exception' :
                    task.status === TaskStatus.DONE ? 'success' :
                    isRunning ? 'active' : 'normal'
                }
                showInfo={false}
                style={{ marginBottom: 4 }}
            />
            
            {/* 任务信息 */}
            {isRunning && task.todos?.length > 0 && (
                <span className="text-xs text-[var(--color-text-muted)]">
                    {task.todos.filter(t => t.status === 'completed').length}/{task.todos.length} 步骤完成
                </span>
            )}
        </div>
    );
}

// 迷你聊天区域
function MiniChat({ onSend, disabled }) {
    const [input, setInput] = useState('');
    
    const handleSend = () => {
        if (input.trim() && !disabled) {
            onSend(input.trim());
            setInput('');
        }
    };
    
    return (
        <div className="mb-4 rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <Space>
                    <span className="text-xs font-semibold text-[var(--color-text)]">Agent Chat</span>
                    <Badge status="success" />
                </Space>
            </div>
            {/* 聊天历史区域 */}
            <div className="h-[80px] p-3 overflow-y-auto bg-[var(--color-surface)]">
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description={<span className="text-xs text-[var(--color-text-muted)]">与 Agent 对话</span>}
                    style={{ margin: 0 }}
                    imageStyle={{ height: 32 }}
                />
            </div>
            {/* 输入区域 */}
            <div className="p-2 flex gap-2 bg-[var(--color-surface-elevated)]">
                <Input
                    size="small"
                    placeholder="问问 Agent..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onPressEnter={handleSend}
                    disabled={disabled}
                    className="flex-1"
                />
                <Button 
                    type="primary" 
                    size="small" 
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    disabled={!input.trim() || disabled}
                />
            </div>
        </div>
    );
}

export default function TaskSidebar({ className = '' }) {
    const { 
        taskList, 
        selectedTaskId, 
        selectTask, 
        startTask,
        loading,
    } = useAgent();

    // 处理快捷操作
    const handleQuickAction = (action) => {
        const prompts = {
            summarize: '请总结一下当前对话的主要内容',
            fact_check: '请核实一下上述信息的准确性',
            draft_reply: '请帮我草拟一个回复',
            translate: '请将上述内容翻译成英文',
        };
        startTask(prompts[action] || action, 'session');
    };

    // 处理 Agent 对话
    const handleAgentChat = (input) => {
        startTask(input, 'global');
    };

    const runningTasks = taskList.filter(t => t.status === TaskStatus.RUNNING);
    const completedTasks = taskList.filter(t => t.status === TaskStatus.DONE);
    const otherTasks = taskList.filter(t => 
        ![TaskStatus.RUNNING, TaskStatus.DONE].includes(t.status)
    );

    return (
        <div className={`flex flex-col h-full bg-[var(--color-surface-elevated)] ${className}`}>
            {/* 头部 */}
            <div className="px-4 py-3 border-b border-[var(--color-border)] shrink-0">
                <Space>
                    <RobotOutlined style={{ fontSize: 18, color: 'var(--color-primary)' }} />
                    <span className="font-semibold text-[var(--color-text)]">Agent Assistant</span>
                </Space>
            </div>

            {/* 内容区域 - 可滚动 */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {/* 快捷操作 */}
                <div className="mb-4">
                    <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        快捷操作
                    </span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {quickActions.map(action => (
                            <Button
                                key={action.key}
                                icon={action.icon}
                                onClick={() => handleQuickAction(action.key)}
                                disabled={loading}
                                style={{ 
                                    height: 52,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                }}
                            >
                                <span style={{ fontSize: 12 }}>{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* 迷你聊天 */}
                <MiniChat onSend={handleAgentChat} disabled={loading} />

                {/* 任务列表 */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                            活动任务
                        </span>
                        <Badge count={taskList.length} size="small" />
                    </div>
                    
                    {taskList.length === 0 ? (
                        <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span className="text-[var(--color-text-muted)]">暂无任务</span>}
                            style={{ margin: '24px 0' }}
                        />
                    ) : (
                        <Spin spinning={loading && taskList.length === 0}>
                            {runningTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    selected={task.id === selectedTaskId}
                                    onClick={() => selectTask(task.id)}
                                />
                            ))}
                            {otherTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    selected={task.id === selectedTaskId}
                                    onClick={() => selectTask(task.id)}
                                />
                            ))}
                            {completedTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    selected={task.id === selectedTaskId}
                                    onClick={() => selectTask(task.id)}
                                />
                            ))}
                        </Spin>
                    )}
                </div>
            </div>
        </div>
    );
}

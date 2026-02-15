/**
 * TaskSidebar - 右侧任务面板（重构版）
 * 
 * 仅显示任务列表和进度，不包含用户与 Agent 的直接交互。
 * TaskAgent 只能由 SessionAgent 或 GlobalAgent 创建。
 */

import { 
    Card, 
    Progress, 
    Badge, 
    Space, 
    Typography, 
    Button, 
    Empty,
    Spin,
    Tag,
    Flex,
    Tooltip,
} from 'antd';
import {
    RobotOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    PauseCircleOutlined,
    FileSearchOutlined,
    EditOutlined,
    TranslationOutlined,
    SearchOutlined,
    ThunderboltOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { useAgent, TaskStatus } from '../../contexts/AgentContext';
import { CompactTodoList } from './TaskTodoList';

const { Text } = Typography;

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
    { key: 'summarize', icon: <FileSearchOutlined />, label: '总结', prompt: '请总结一下当前对话的主要内容' },
    { key: 'fact_check', icon: <SearchOutlined />, label: '核查', prompt: '请核实一下上述信息的准确性' },
    { key: 'draft_reply', icon: <EditOutlined />, label: '草拟', prompt: '请帮我草拟一个回复' },
    { key: 'translate', icon: <TranslationOutlined />, label: '翻译', prompt: '请将上述内容翻译成英文' },
];

// 单个任务卡片
function TaskCard({ task, selected, onClick, onViewDetail }) {
    const config = statusConfig[task.status] || statusConfig[TaskStatus.PENDING];
    const isRunning = task.status === TaskStatus.RUNNING;
    
    // 计算进度
    const progress = task.todos?.length > 0
        ? Math.round((task.todos.filter(t => t.status === 'completed').length / task.todos.length) * 100)
        : (task.status === TaskStatus.DONE ? 100 : 0);
    
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
            {/* 头部 */}
            <Flex justify="space-between" align="start" style={{ marginBottom: 8 }}>
                <Space size={4}>
                    <span style={{ color: config.color === 'processing' ? '#1677ff' : 
                                          config.color === 'success' ? '#52c41a' : 
                                          config.color === 'error' ? '#ff4d4f' : 
                                          config.color === 'warning' ? '#faad14' : 'var(--color-text-muted)' }}>
                        {config.icon}
                    </span>
                    <Text 
                        strong 
                        ellipsis 
                        style={{ maxWidth: 160, fontSize: 13 }}
                        title={task.inputText}
                    >
                        {task.inputText?.slice(0, 30) || '未命名任务'}
                        {task.inputText?.length > 30 ? '...' : ''}
                    </Text>
                </Space>
                <Tag color={config.color} style={{ marginRight: 0 }}>
                    {config.text}
                </Tag>
            </Flex>
            
            {/* 进度条 */}
            <Progress 
                percent={progress} 
                size="small"
                status={
                    task.status === TaskStatus.FAILED ? 'exception' :
                    task.status === TaskStatus.DONE ? 'success' :
                    isRunning ? 'active' : 'normal'
                }
                showInfo={false}
                style={{ marginBottom: 8 }}
            />
            
            {/* Todo 列表预览 */}
            {task.todos?.length > 0 && (
                <CompactTodoList todos={task.todos} maxItems={3} />
            )}
            
            {/* 任务信息 */}
            <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                    {task.createdAt ? new Date(task.createdAt).toLocaleTimeString() : ''}
                </Text>
                {onViewDetail && (
                    <Tooltip title="查看详情">
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetail(task.id);
                            }}
                        />
                    </Tooltip>
                )}
            </Flex>
        </div>
    );
}

export default function TaskSidebar({ 
    className = '', 
    useGlobalAgent = false, 
    chatSessionId = null, 
    chatHistory: sessionChatHistory = null,
    onViewTaskDetail
}) {
    const { 
        getGlobalTasks,
        getSessionTasks,
        selectedTaskId, 
        selectTask, 
        startTask,
        loading,
        setGlobalAgentTaskId,
        globalConversations,
        activeGlobalConversationId,
        createGlobalConversation,
        addMessageToGlobalConversation,
        removeLastMessageFromGlobalConversation,
    } = useAgent();

    // 按场景过滤：GlobalAgent 面板用 getGlobalTasks，Chat 面板用 getSessionTasks
    const taskList = useGlobalAgent ? getGlobalTasks() : getSessionTasks(chatSessionId);

    // 当前 GlobalAgent 会话的消息（用于 chatHistory）
    const currentConvMessages = activeGlobalConversationId 
        ? globalConversations.find(c => c.id === activeGlobalConversationId)?.messages ?? []
        : [];

    // 处理快捷操作 - 这些操作通过 SessionAgent 或 GlobalAgent 执行
    const handleQuickAction = async (action) => {
        const actionConfig = quickActions.find(a => a.key === action);
        if (!actionConfig) return;
        
        const prompt = actionConfig.prompt;
        const taskType = useGlobalAgent ? 'global' : 'session';
        const chatHistory = useGlobalAgent ? currentConvMessages : sessionChatHistory;
        
        let convId = activeGlobalConversationId;
        if (useGlobalAgent && !convId) {
            convId = createGlobalConversation();
        }
        
        if (useGlobalAgent) {
            addMessageToGlobalConversation(convId, { role: 'user', content: prompt });
        }
        
        try {
            const result = await startTask(prompt, taskType, chatSessionId, chatHistory, useGlobalAgent ? convId : null);
            if (useGlobalAgent && result?.id && setGlobalAgentTaskId) {
                setGlobalAgentTaskId(result.id);
            }
        } catch (e) {
            if (useGlobalAgent && convId) {
                removeLastMessageFromGlobalConversation(convId);
            }
        }
    };

    // 分类任务
    const runningTasks = taskList.filter(t => t.status === TaskStatus.RUNNING);
    const pendingTasks = taskList.filter(t => 
        [TaskStatus.PENDING, TaskStatus.WAITING_APPROVAL].includes(t.status)
    );
    const completedTasks = taskList.filter(t => t.status === TaskStatus.DONE);
    const failedTasks = taskList.filter(t => 
        [TaskStatus.FAILED, TaskStatus.CANCELLED].includes(t.status)
    );

    return (
        <div className={`flex flex-col h-full bg-[var(--color-surface-elevated)] ${className}`}>
            {/* 头部 */}
            <div className="px-4 py-3 border-b border-[var(--color-border)] shrink-0">
                <Flex align="center" gap={8}>
                    <ThunderboltOutlined style={{ fontSize: 18, color: 'var(--color-primary)' }} />
                    <Text strong>任务中心</Text>
                    <Badge count={taskList.length} size="small" />
                </Flex>
            </div>

            {/* 内容区域 - 可滚动 */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {/* 快捷操作 */}
                <div className="mb-4">
                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                        快捷操作
                    </Text>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {quickActions.map(action => (
                            <Tooltip key={action.key} title={action.prompt}>
                                <Button
                                    icon={action.icon}
                                    onClick={() => handleQuickAction(action.key)}
                                    disabled={loading}
                                    style={{ 
                                        height: 48,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <span style={{ fontSize: 12 }}>{action.label}</span>
                                </Button>
                            </Tooltip>
                        ))}
                    </div>
                </div>

                {/* 提示信息 */}
                <div 
                    style={{ 
                        padding: '8px 12px', 
                        background: '#f0f7ff', 
                        borderRadius: 8,
                        marginBottom: 16,
                        fontSize: 12,
                        color: '#1890ff'
                    }}
                >
                    <RobotOutlined style={{ marginRight: 8 }} />
                    在聊天中 @AI 助手 创建任务
                </div>

                {/* 任务列表 */}
                <div>
                    <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                        <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                            任务列表
                        </Text>
                    </Flex>
                    
                    {taskList.length === 0 ? (
                        <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<Text type="secondary">暂无任务</Text>}
                            style={{ margin: '24px 0' }}
                        />
                    ) : (
                        <Spin spinning={loading && taskList.length === 0}>
                            {/* 运行中的任务 */}
                            {runningTasks.length > 0 && (
                                <>
                                    <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: 'block' }}>
                                        进行中 ({runningTasks.length})
                                    </Text>
                                    {runningTasks.map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            selected={task.id === selectedTaskId}
                                            onClick={() => selectTask(task.id)}
                                            onViewDetail={onViewTaskDetail}
                                        />
                                    ))}
                                </>
                            )}
                            
                            {/* 等待中的任务 */}
                            {pendingTasks.length > 0 && (
                                <>
                                    <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: 'block', marginTop: 12 }}>
                                        等待中 ({pendingTasks.length})
                                    </Text>
                                    {pendingTasks.map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            selected={task.id === selectedTaskId}
                                            onClick={() => selectTask(task.id)}
                                            onViewDetail={onViewTaskDetail}
                                        />
                                    ))}
                                </>
                            )}
                            
                            {/* 已完成的任务 */}
                            {completedTasks.length > 0 && (
                                <>
                                    <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: 'block', marginTop: 12 }}>
                                        已完成 ({completedTasks.length})
                                    </Text>
                                    {completedTasks.slice(0, 5).map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            selected={task.id === selectedTaskId}
                                            onClick={() => selectTask(task.id)}
                                            onViewDetail={onViewTaskDetail}
                                        />
                                    ))}
                                    {completedTasks.length > 5 && (
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            还有 {completedTasks.length - 5} 个已完成任务...
                                        </Text>
                                    )}
                                </>
                            )}
                            
                            {/* 失败的任务 */}
                            {failedTasks.length > 0 && (
                                <>
                                    <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: 'block', marginTop: 12 }}>
                                        失败/取消 ({failedTasks.length})
                                    </Text>
                                    {failedTasks.slice(0, 3).map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            selected={task.id === selectedTaskId}
                                            onClick={() => selectTask(task.id)}
                                            onViewDetail={onViewTaskDetail}
                                        />
                                    ))}
                                </>
                            )}
                        </Spin>
                    )}
                </div>
            </div>
        </div>
    );
}

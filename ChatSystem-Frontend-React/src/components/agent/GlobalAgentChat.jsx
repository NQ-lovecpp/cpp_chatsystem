/**
 * GlobalAgent 对话界面
 * 
 * 使用 Ant Design X 组件：
 * - Bubble: 消息气泡
 * - Sender: 输入组件
 * - Prompts: 快捷提示
 * 
 * 注意：不包含左侧会话列表（由右侧 GlobalAgentSidePanel 管理）
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Bubble, Sender, Prompts, XProvider } from '@ant-design/x';
import { 
    Flex, 
    Typography, 
    Button, 
    Spin,
    message,
} from 'antd';
import {
    BulbOutlined,
    InfoCircleOutlined,
    RocketOutlined,
    SmileOutlined,
    PlusOutlined,
    MessageOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useAgent } from '../../contexts/AgentContext';
import { useAuth } from '../../contexts/AuthContext';
import { MessageType } from '../../contexts/AgentContext';
import AgentMessageRenderer from './AgentMessageRenderer';
import ThoughtChainDisplay from './ThoughtChainDisplay';

const { Text, Title } = Typography;

// 快捷提示配置
const promptItems = [
    {
        key: 'summarize',
        icon: <BulbOutlined style={{ color: '#FFD700' }} />,
        label: '总结聊天记录',
        description: '帮我总结一下最近的对话内容',
    },
    {
        key: 'search',
        icon: <InfoCircleOutlined style={{ color: '#1890FF' }} />,
        label: '搜索信息',
        description: '帮我搜索一下相关资料',
    },
    {
        key: 'task',
        icon: <RocketOutlined style={{ color: '#722ED1' }} />,
        label: '创建任务',
        description: '帮我创建一个后台任务',
    },
    {
        key: 'joke',
        icon: <SmileOutlined style={{ color: '#52C41A' }} />,
        label: '讲个笑话',
        description: '给我讲个笑话放松一下',
    },
];

// 欢迎界面
function WelcomeScreen({ userName, onPromptClick }) {
    return (
        <Flex 
            vertical 
            align="center" 
            justify="center" 
            style={{ height: '100%', padding: 24 }}
        >
            <div 
                style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 24
                }}
            >
                <MessageOutlined style={{ fontSize: 28, color: 'white' }} />
            </div>
            
            <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                您好，{userName || '用户'}！
            </Title>
            <Text type="secondary" style={{ marginBottom: 24, textAlign: 'center' }}>
                我是您的私人 AI 助手，可以帮您查询聊天记录、搜索信息、执行任务
            </Text>
            
            <Prompts
                title="✨ 试试这些功能"
                items={promptItems}
                onItemClick={(info) => onPromptClick(info.data)}
                style={{ width: '100%', maxWidth: 400 }}
            />
        </Flex>
    );
}

export default function GlobalAgentChat() {
    const { user } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();
    
    const { 
        startTask, 
        tasks,
        globalAgentTaskId,
        setGlobalAgentTaskId,
        globalConversations,
        activeGlobalConversationId,
        setActiveGlobalConversationId,
        createGlobalConversation,
        addMessageToGlobalConversation,
        removeLastMessageFromGlobalConversation,
        getTaskStatus,
        selectTask,
    } = useAgent();
    
    const [isLoading, setIsLoading] = useState(false);
    const senderRef = useRef(null);
    const messagesEndRef = useRef(null);
    
    // 当前会话
    const currentConversation = useMemo(() => {
        if (!activeGlobalConversationId) return null;
        return globalConversations.find(c => c.id === activeGlobalConversationId) || null;
    }, [activeGlobalConversationId, globalConversations]);
    
    const conversationMessages = useMemo(() => {
        return currentConversation?.messages ?? [];
    }, [currentConversation]);
    
    // 当前任务
    const currentTask = globalAgentTaskId ? tasks[globalAgentTaskId] : null;
    const taskStatus = globalAgentTaskId ? getTaskStatus(globalAgentTaskId) : null;
    
    // 合并消息：历史消息 + 当前正在流式输出的 assistant 消息
    const displayMessages = useMemo(() => {
        // 历史消息（已完成的，存在 conversation 中）
        const hist = conversationMessages.map((m, i) => ({
            key: `hist_${i}_${m.role}`,
            role: m.role,          // 'user' | 'assistant'
            content: m.content,
        }));
        
        if (!currentTask?.messages?.length) return hist;
        
        // 从当前任务中只提取 assistant 消息（正在流式输出的）
        // user 消息已在 hist 中（通过 addMessageToGlobalConversation），不重复
        // reasoning / tool_call 等通过 ThoughtChain 展示，不在气泡中
        const streamingMessages = currentTask.messages
            .filter(m => {
                if (m.type !== MessageType.ASSISTANT) return false;
                // 任务完成后 assistant 消息已经写入 conversation，跳过避免重复
                if (taskStatus === 'done' || taskStatus === 'failed') return false;
                return true;
            })
            .map((m, i) => ({
                key: `stream_${currentTask.id}_${i}`,
                role: 'assistant',
                content: m.content,
                loading: m.streaming && !m.content,
            }));
        
        return [...hist, ...streamingMessages];
    }, [conversationMessages, currentTask, taskStatus]);
    
    // 滚动到底部
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);
    
    useEffect(() => {
        scrollToBottom();
    }, [displayMessages, scrollToBottom]);
    
    // 监听任务完成
    const prevTaskStatusRef = useRef(null);
    useEffect(() => {
        if (!globalAgentTaskId) return;
        const status = getTaskStatus(globalAgentTaskId);
        if (prevTaskStatusRef.current !== status) {
            prevTaskStatusRef.current = status;
            if (status === 'done' || status === 'failed' || status === 'cancelled') {
                setIsLoading(false);
            }
        }
    }, [globalAgentTaskId, getTaskStatus]);
    
    // 发送消息
    const handleSend = async (text) => {
        if (!text?.trim() || isLoading) return;
        
        setIsLoading(true);
        
        // 确保有当前会话
        let convId = activeGlobalConversationId;
        if (!convId) {
            convId = createGlobalConversation();
        }
        
        // 添加用户消息到会话历史
        addMessageToGlobalConversation(convId, { role: 'user', content: text });
        
        try {
            const chatHistory = conversationMessages;
            const result = await startTask(text, 'global', null, chatHistory, convId);
            if (result?.id) {
                setGlobalAgentTaskId(result.id);
                selectTask(result.id);
            }
        } catch (error) {
            console.error('Failed to start global agent task:', error);
            setIsLoading(false);
            removeLastMessageFromGlobalConversation(convId);
            messageApi.error('发送失败: ' + error.message);
        }
        
        // 清空输入
        senderRef.current?.clear?.();
    };
    
    // 快捷提示点击
    const handlePromptClick = (prompt) => {
        handleSend(prompt.description);
    };
    
    // 新建对话
    const handleNewConversation = () => {
        const newId = createGlobalConversation();
        setActiveGlobalConversationId(newId);
        setGlobalAgentTaskId(null);
    };
    
    // 自定义消息渲染
    const renderMessage = (content, msg) => {
        if (msg.role === 'assistant') {
            return (
                <AgentMessageRenderer
                    content={content}
                    isStreaming={msg.loading}
                    streamStatus={msg.loading ? 'streaming' : 'done'}
                    metadata={msg.metadata}
                />
            );
        }
        // 用户消息直接文本渲染
        return <span>{content}</span>;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-surface)' }}>
            {contextHolder}
            
            {/* 头部 */}
            <div 
                style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid var(--color-border)',
                    background: 'var(--color-surface-elevated)',
                    flexShrink: 0,
                }}
            >
                <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                    <Flex align="center" gap={12}>
                        <div 
                            style={{ 
                                width: 36, 
                                height: 36, 
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <MessageOutlined style={{ fontSize: 16, color: 'white' }} />
                        </div>
                        <div>
                            <Title level={5} style={{ margin: 0, fontSize: 15 }}>AI 私人助手</Title>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                查询聊天记录、搜索信息、执行任务
                            </Text>
                        </div>
                    </Flex>
                    <Button 
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={handleNewConversation}
                    >
                        新对话
                    </Button>
                </Flex>
            </div>
            
            {/* 消息区域 */}
            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                {displayMessages.length === 0 && !isLoading ? (
                    <WelcomeScreen 
                        userName={user?.nickname}
                        onPromptClick={handlePromptClick}
                    />
                ) : (
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        <XProvider>
                            {/* 思维链显示（当前任务进行中时） */}
                            {currentTask?.thoughtChain?.length > 0 && 
                             taskStatus !== 'done' && taskStatus !== 'failed' && (
                                <ThoughtChainDisplay 
                                    nodes={currentTask.thoughtChain}
                                    compact={false}
                                    style={{ marginBottom: 16 }}
                                />
                            )}
                            
                            <Bubble.List
                                items={displayMessages.map(msg => ({
                                    key: msg.key,
                                    role: msg.role,
                                    content: msg.content,
                                    loading: msg.loading,
                                    contentRender: (content) => renderMessage(content, msg),
                                }))}
                                roles={{
                                    assistant: {
                                        placement: 'start',
                                        avatar: {
                                            icon: <MessageOutlined />,
                                            style: { 
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                            }
                                        }
                                    },
                                    user: { 
                                        placement: 'end',
                                        avatar: {
                                            icon: <UserOutlined />,
                                            style: {
                                                background: '#fa8c16'
                                            }
                                        }
                                    },
                                }}
                            />
                        </XProvider>
                        
                        {isLoading && displayMessages.filter(m => m.role === 'assistant').length === 0 && (
                            <Flex justify="center" style={{ padding: 24 }}>
                                <Spin tip="AI 正在思考..." />
                            </Flex>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
            
            {/* 输入区域 */}
            <div 
                style={{ 
                    padding: 16, 
                    borderTop: '1px solid var(--color-border)',
                    background: 'var(--color-surface-elevated)',
                    flexShrink: 0,
                }}
            >
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <XProvider>
                        <Sender
                            ref={senderRef}
                            placeholder="输入消息..."
                            onSubmit={handleSend}
                            loading={isLoading}
                            disabled={isLoading}
                            style={{ borderRadius: 12 }}
                        />
                    </XProvider>
                </div>
            </div>
        </div>
    );
}

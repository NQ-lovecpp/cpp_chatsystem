/**
 * Agent 上下文 - 重构版
 * 管理多任务状态、消息流、Todo 进度、审批请求
 * 支持 SessionAgent 和 TaskAgent 的交互
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { message as antMessage } from 'antd';
import { useAuth } from './AuthContext';
import {
    createAgentTask,
    getAgentTask,
    cancelAgentTask,
    subscribeTaskEvents,
    submitApproval,
} from '../api/agentApi';

const AgentContext = createContext(null);

// 任务状态枚举
export const TaskStatus = {
    PENDING: 'pending',
    RUNNING: 'running',
    WAITING_APPROVAL: 'waiting_approval',
    DONE: 'done',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
};

// 消息类型枚举
export const MessageType = {
    USER: 'user',
    ASSISTANT: 'assistant',
    TOOL_CALL: 'tool_call',
    TOOL_OUTPUT: 'tool_output',
    REASONING: 'reasoning',
    ERROR: 'error',
    SYSTEM: 'system',
};

// Todo 状态枚举
export const TodoStatus = {
    IDLE: 'idle',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    SKIPPED: 'skipped',
};

/**
 * 创建一个任务对象
 * @param {string} chatSessionId - 会话 ID（session 类型需要，用于任务过滤）
 */
function createTaskObject(taskId, inputText, taskType = 'session', parentTaskId = null, chatSessionId = null) {
    return {
        id: taskId,
        inputText,
        taskType,
        parentTaskId,
        chatSessionId,
        status: TaskStatus.PENDING,
        messages: [],
        todos: [],
        thoughtChain: [],  // 思维链节点
        pendingApprovals: [],
        progress: null,
        currentAgent: 'session',  // 'session' | 'task' — 当前活跃的 agent
        taskOutput: '',            // TaskAgent 的输出（侧边栏显示）
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
}

export function AgentProvider({ children }) {
    const { sessionId } = useAuth();
    
    // 所有任务 Map: taskId -> task
    const [tasks, setTasks] = useState({});
    
    // 当前选中的任务 ID
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    
    // GlobalAgent 当前任务 ID（左侧边栏的私人助手）
    const [globalAgentTaskId, setGlobalAgentTaskId] = useState(null);
    
    // GlobalAgent 多会话：{ id, title, messages, createdAt }[]
    const [globalConversations, setGlobalConversations] = useState([]);
    const [activeGlobalConversationId, setActiveGlobalConversationId] = useState(null);
    // 任务完成时追加到对应会话：taskId -> conversationId
    const taskIdToGlobalConversationIdRef = useRef({});
    // Session 任务完成时：taskId -> chatSessionId（用于 @ 触发后写入聊天）
    const taskIdToChatSessionIdRef = useRef({});
    
    // 全局加载状态
    const [loading, setLoading] = useState(false);
    
    // 全局错误
    const [error, setError] = useState(null);
    
    // SSE 取消订阅函数 Map
    const unsubscribeMapRef = useRef({});
    
    // 流式文本缓冲区 Map
    const streamBufferMapRef = useRef({});

    // TaskAgent 输出缓冲区 Map（侧边栏显示）
    const taskOutputBufferMapRef = useRef({});
    
    // 任务类型 Map（用于 onDone 时判断是否 global 以更新对话历史）
    const taskTypeMapRef = useRef({});

    // 清理特定任务的 SSE 订阅
    const cleanupTask = useCallback((taskId) => {
        if (unsubscribeMapRef.current[taskId]) {
            unsubscribeMapRef.current[taskId]();
            delete unsubscribeMapRef.current[taskId];
        }
        delete streamBufferMapRef.current[taskId];
        delete taskOutputBufferMapRef.current[taskId];
        delete taskTypeMapRef.current[taskId];
    }, []);

    // 清理所有订阅
    const cleanupAll = useCallback(() => {
        Object.keys(unsubscribeMapRef.current).forEach(taskId => {
            unsubscribeMapRef.current[taskId]();
        });
        unsubscribeMapRef.current = {};
        streamBufferMapRef.current = {};
        taskOutputBufferMapRef.current = {};
        taskTypeMapRef.current = {};
    }, []);

    // 组件卸载时清理
    useEffect(() => {
        return cleanupAll;
    }, [cleanupAll]);

    // 更新任务
    const updateTask = useCallback((taskId, updates) => {
        setTasks(prev => {
            if (!prev[taskId]) return prev;
            return {
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    ...updates,
                    updatedAt: Date.now(),
                }
            };
        });
    }, []);

    // 添加消息到任务
    const addMessageToTask = useCallback((taskId, message) => {
        setTasks(prev => {
            if (!prev[taskId]) return prev;
            const task = prev[taskId];
            return {
                ...prev,
                [taskId]: {
                    ...task,
                    messages: [...task.messages, {
                        ...message,
                        id: message.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                        timestamp: message.timestamp || Date.now(),
                    }],
                    updatedAt: Date.now(),
                }
            };
        });
    }, []);

    // 更新任务最后一条 assistant 消息
    const updateLastAssistantMessage = useCallback((taskId, content, streaming = true) => {
        setTasks(prev => {
            if (!prev[taskId]) return prev;
            const task = prev[taskId];
            const messages = [...task.messages];
            
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].type === MessageType.ASSISTANT) {
                    messages[i] = { ...messages[i], content, streaming };
                    break;
                }
            }
            
            return {
                ...prev,
                [taskId]: { ...task, messages, updatedAt: Date.now() }
            };
        });
    }, []);

    // 添加 Todo 到任务
    const addTodoToTask = useCallback((taskId, todo) => {
        setTasks(prev => {
            if (!prev[taskId]) return prev;
            const task = prev[taskId];
            return {
                ...prev,
                [taskId]: {
                    ...task,
                    todos: [...task.todos, todo],
                    updatedAt: Date.now(),
                }
            };
        });
    }, []);

    // 添加/更新 ThoughtChain 节点
    const addOrUpdateThoughtChainNode = useCallback((taskId, node) => {
        setTasks(prev => {
            if (!prev[taskId]) return prev;
            const task = prev[taskId];
            const existingIndex = task.thoughtChain.findIndex(n => n.chain_id === node.chain_id);
            
            let newChain;
            if (existingIndex >= 0) {
                // 更新现有节点
                newChain = [...task.thoughtChain];
                newChain[existingIndex] = { ...newChain[existingIndex], ...node };
            } else {
                // 添加新节点
                newChain = [...task.thoughtChain, node];
            }
            
            return {
                ...prev,
                [taskId]: {
                    ...task,
                    thoughtChain: newChain,
                    updatedAt: Date.now(),
                }
            };
        });
    }, []);

    // 更新 ThoughtChain 节点状态
    const updateThoughtChainStatus = useCallback((taskId, chainId, status, content) => {
        setTasks(prev => {
            if (!prev[taskId]) return prev;
            const task = prev[taskId];
            const newChain = task.thoughtChain.map(n => 
                n.chain_id === chainId 
                    ? { ...n, status, ...(content !== undefined ? { content } : {}) }
                    : n
            );
            return {
                ...prev,
                [taskId]: { ...task, thoughtChain: newChain, updatedAt: Date.now() }
            };
        });
    }, []);

    // 更新 Todo 状态
    const updateTodoStatus = useCallback((taskId, todoId, status) => {
        setTasks(prev => {
            if (!prev[taskId]) return prev;
            const task = prev[taskId];
            const todos = task.todos.map(t => 
                t.id === todoId ? { ...t, status } : t
            );
            
            // 计算进度
            const total = todos.length;
            const completed = todos.filter(t => t.status === TodoStatus.COMPLETED).length;
            const progress = total > 0 ? Math.round(completed / total * 100) : 0;
            
            return {
                ...prev,
                [taskId]: { ...task, todos, progress, updatedAt: Date.now() }
            };
        });
    }, []);

    // 更新工具调用状态
    const updateToolCall = useCallback((taskId, toolName, updates) => {
        setTasks(prev => {
            if (!prev[taskId]) return prev;
            const task = prev[taskId];
            const messages = [...task.messages];
            
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].type === MessageType.TOOL_CALL && messages[i].toolName === toolName) {
                    messages[i] = { ...messages[i], ...updates };
                    break;
                }
            }
            
            return {
                ...prev,
                [taskId]: { ...task, messages, updatedAt: Date.now() }
            };
        });
    }, []);

    // 创建 GlobalAgent 新会话
    const createGlobalConversation = useCallback(() => {
        const id = `gc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const conv = { id, title: '新对话', messages: [], createdAt: Date.now() };
        setGlobalConversations(prev => [conv, ...prev]);
        setActiveGlobalConversationId(id);
        setGlobalAgentTaskId(null);
        return id;
    }, []);

    // 切换 GlobalAgent 会话
    const switchGlobalConversation = useCallback((conversationId) => {
        setActiveGlobalConversationId(conversationId);
        setGlobalAgentTaskId(null);
    }, []);

    // 删除 GlobalAgent 会话
    const deleteGlobalConversation = useCallback((conversationId) => {
        setGlobalConversations(prev => prev.filter(c => c.id !== conversationId));
        if (activeGlobalConversationId === conversationId) {
            setActiveGlobalConversationId(null);
            setGlobalAgentTaskId(null);
        }
    }, [activeGlobalConversationId]);

    // 添加消息到指定 GlobalAgent 会话
    const addMessageToGlobalConversation = useCallback((conversationId, message) => {
        setGlobalConversations(prev => prev.map(c => 
            c.id === conversationId 
                ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
                : c
        ));
    }, []);

    // 移除会话最后一条消息（用于发送失败回滚）
    const removeLastMessageFromGlobalConversation = useCallback((conversationId) => {
        setGlobalConversations(prev => prev.map(c => 
            c.id === conversationId && c.messages.length > 0
                ? { ...c, messages: c.messages.slice(0, -1), updatedAt: Date.now() }
                : c
        ));
    }, []);

    // 创建并启动任务
    // chatHistory: 多轮对话历史 [{role, content}, ...]，用于 global/session 类型
    // globalConversationId: GlobalAgent 会话 ID，用于多会话时追加回复
    const startTask = useCallback(async (input, taskType = 'session', chatSessionId = null, chatHistory = null, globalConversationId = null) => {
        if (!sessionId) {
            setError('未登录');
            return null;
        }

        setError(null);
        setLoading(true);

        try {
            // 创建任务（global 类型传入 chat_history 实现多轮对话）
            const response = await createAgentTask(sessionId, input, taskType, chatSessionId, chatHistory);
            const taskId = response.task_id;
            
            // 初始化任务对象（session 类型需存储 chat_session_id 用于过滤）
            const task = createTaskObject(taskId, input, taskType, null, chatSessionId);
            
            // 添加用户消息
            task.messages.push({
                id: `msg_user_${Date.now()}`,
                type: MessageType.USER,
                content: input,
                timestamp: Date.now(),
            });
            
            // 添加空的 assistant 消息用于流式填充
            task.messages.push({
                id: `msg_assistant_${Date.now()}`,
                type: MessageType.ASSISTANT,
                content: '',
                streaming: true,
                timestamp: Date.now(),
            });
            
            // 保存任务
            taskTypeMapRef.current[taskId] = taskType;
            if (taskType === 'global' && globalConversationId) {
                taskIdToGlobalConversationIdRef.current[taskId] = globalConversationId;
            }
            if (taskType === 'session' && chatSessionId) {
                taskIdToChatSessionIdRef.current[taskId] = chatSessionId;
            }
            setTasks(prev => ({ ...prev, [taskId]: task }));
            setSelectedTaskId(taskId);
            
            // 初始化流缓冲区
            streamBufferMapRef.current[taskId] = '';
            taskOutputBufferMapRef.current[taskId] = '';

            // 订阅 SSE 事件
            const unsubscribe = subscribeTaskEvents(sessionId, taskId, {
                onInit: (data) => {
                    console.log('[Agent] Init:', data);
                },

                onReasoningDelta: (data) => {
                    // Reasoning 内容通过 ThoughtChain 展示
                    // 累积 reasoning 并更新对应 thought chain 节点
                    if (data.content) {
                        setTasks(prev => {
                            if (!prev[taskId]) return prev;
                            const task = prev[taskId];
                            const chain = [...task.thoughtChain];
                            // 找到最后一个 reasoning 类型的节点
                            let reasoningNode = null;
                            for (let i = chain.length - 1; i >= 0; i--) {
                                if (chain[i].node_type === 'reasoning' && chain[i].status === 'running') {
                                    reasoningNode = chain[i];
                                    break;
                                }
                            }
                            if (reasoningNode) {
                                const updatedContent = (reasoningNode.content || '') + data.content;
                                const newChain = chain.map(n =>
                                    n.chain_id === reasoningNode.chain_id
                                        ? { ...n, content: updatedContent }
                                        : n
                                );
                                return {
                                    ...prev,
                                    [taskId]: { ...task, thoughtChain: newChain, updatedAt: Date.now() }
                                };
                            }
                            return prev;
                        });
                    }
                },

                onToolCall: (data) => {
                    // 工具调用通过 ThoughtChain 展示，不创建消息气泡
                },

                onToolOutput: (data) => {
                    // 工具输出通过 ThoughtChain 展示，不创建消息气泡
                },

                onInterruption: (data) => {
                    if (data.approval) {
                        setTasks(prev => {
                            if (!prev[taskId]) return prev;
                            return {
                                ...prev,
                                [taskId]: {
                                    ...prev[taskId],
                                    pendingApprovals: [...prev[taskId].pendingApprovals, data.approval],
                                    status: TaskStatus.WAITING_APPROVAL,
                                }
                            };
                        });
                    }
                },

                onAgentSwitch: (data) => {
                    // agent_switch 事件: { agent: 'TaskAgent'|'SessionAgent', previous: ... }
                    const agentName = data.agent;
                    updateTask(taskId, {
                        currentAgent: agentName === 'TaskAgent' ? 'task' : 'session',
                    });
                },

                onMessage: (data) => {
                    const agent = data.agent;
                    if (agent === 'TaskAgent') {
                        // TaskAgent 输出 → taskOutput (侧边栏显示)
                        if (data.delta) {
                            const cur = taskOutputBufferMapRef.current[taskId] || '';
                            const next = cur + data.content;
                            taskOutputBufferMapRef.current[taskId] = next;
                            updateTask(taskId, { taskOutput: next });
                        } else if (data.content) {
                            taskOutputBufferMapRef.current[taskId] = data.content;
                            updateTask(taskId, { taskOutput: data.content });
                        }
                    } else {
                        // SessionAgent 输出 → 聊天消息气泡
                        if (data.delta) {
                            streamBufferMapRef.current[taskId] =
                                (streamBufferMapRef.current[taskId] || '') + data.content;
                            updateLastAssistantMessage(taskId, streamBufferMapRef.current[taskId], true);
                        } else if (data.content) {
                            updateLastAssistantMessage(taskId, data.content, false);
                        }
                    }
                },
                
                onTodoAdded: (data) => {
                    if (data.todo) {
                        addTodoToTask(taskId, data.todo);
                    }
                },
                
                onTodoStatus: (data) => {
                    updateTodoStatus(taskId, data.todoId, data.status);
                },
                
                onThoughtChain: (data) => {
                    // 添加或更新思维链节点
                    if (data.node) {
                        addOrUpdateThoughtChainNode(taskId, data.node);
                    }
                },
                
                onThoughtChainUpdate: (data) => {
                    // 更新思维链节点状态
                    if (data.chain_id) {
                        updateThoughtChainStatus(taskId, data.chain_id, data.status, data.content);
                    }
                },
                
                onDone: (data) => {
                    const finalText = streamBufferMapRef.current[taskId] || data.final_text || '完成';
                    updateTask(taskId, { status: TaskStatus.DONE });
                    updateLastAssistantMessage(taskId, finalText, false);
                    const doneTaskType = taskTypeMapRef.current[taskId];
                    // GlobalAgent 多轮：将本轮 assistant 回复追加到对应会话
                    if (doneTaskType === 'global') {
                        const convId = taskIdToGlobalConversationIdRef.current[taskId];
                        if (convId) {
                            setGlobalConversations(prev => prev.map(c => 
                                c.id === convId 
                                    ? { ...c, messages: [...c.messages, { role: 'assistant', content: finalText }], updatedAt: Date.now() }
                                    : c
                            ));
                            delete taskIdToGlobalConversationIdRef.current[taskId];
                        }
                    }
                    // SessionAgent @ 触发：通知前端将回复写入聊天
                    if (doneTaskType === 'session') {
                        const chatSessionIdForDone = taskIdToChatSessionIdRef.current[taskId];
                        if (chatSessionIdForDone) {
                            window.dispatchEvent(new CustomEvent('session-agent-done', {
                                detail: { chatSessionId: chatSessionIdForDone, finalText },
                            }));
                            delete taskIdToChatSessionIdRef.current[taskId];
                        }
                    }
                    setLoading(false);
                    cleanupTask(taskId);
                },
                
                onError: (errorMsg) => {
                    setError(errorMsg);
                    updateTask(taskId, { status: TaskStatus.FAILED });
                    addMessageToTask(taskId, {
                        type: MessageType.ERROR,
                        content: errorMsg,
                    });
                    setLoading(false);
                    cleanupTask(taskId);
                },
                
                onTaskStatus: (data) => {
                    updateTask(taskId, { status: data.status });
                },
                
                // 子任务创建事件
                onTaskCreated: (data) => {
                    console.log('[Agent] Child task created:', data);
                    // 创建子任务对象，继承父任务的 chatSessionId
                    setTasks(prev => {
                        const parentTask = prev[taskId];
                        const childTask = createTaskObject(
                            data.task_id, 
                            data.description, 
                            'task',
                            taskId,
                            parentTask?.chatSessionId ?? null
                        );
                        return { ...prev, [data.task_id]: childTask };
                    });
                    
                    // 订阅子任务事件
                    subscribeChildTask(data.task_id);
                    
                    antMessage.info(`已创建任务: ${data.description.slice(0, 20)}...`);
                },
                
                onTaskCallback: (data) => {
                    // 后台任务完成，更新子任务状态
                    if (data.task_id) {
                        updateTask(data.task_id, { status: TaskStatus.DONE });
                    }
                    antMessage.success('后台任务已完成', 3);
                },

                onApprovalResolved: (data) => {
                    setTasks(prev => {
                        if (!prev[taskId]) return prev;
                        return {
                            ...prev,
                            [taskId]: {
                                ...prev[taskId],
                                pendingApprovals: prev[taskId].pendingApprovals.filter(
                                    a => a.id !== data.approval_id
                                ),
                            }
                        };
                    });
                },
            });

            unsubscribeMapRef.current[taskId] = unsubscribe;
            return task;
            
        } catch (err) {
            setError(err.message);
            setLoading(false);
            return null;
        }
    }, [sessionId, addMessageToTask, updateLastAssistantMessage, updateToolCall, 
        addTodoToTask, updateTodoStatus, addOrUpdateThoughtChainNode, updateThoughtChainStatus,
        updateTask, cleanupTask]);

    // 订阅子任务事件
    const subscribeChildTask = useCallback((taskId) => {
        if (!sessionId) return;
        
        streamBufferMapRef.current[taskId] = '';
        
        const unsubscribe = subscribeTaskEvents(sessionId, taskId, {
            onInit: () => {},
            
            onMessage: (data) => {
                if (data.delta) {
                    streamBufferMapRef.current[taskId] = 
                        (streamBufferMapRef.current[taskId] || '') + data.content;
                    
                    // 更新子任务消息
                    setTasks(prev => {
                        if (!prev[taskId]) return prev;
                        const task = prev[taskId];
                        const messages = [...task.messages];
                        
                        // 找到或创建 assistant 消息
                        let found = false;
                        for (let i = messages.length - 1; i >= 0; i--) {
                            if (messages[i].type === MessageType.ASSISTANT) {
                                messages[i] = {
                                    ...messages[i],
                                    content: streamBufferMapRef.current[taskId],
                                    streaming: true,
                                };
                                found = true;
                                break;
                            }
                        }
                        
                        if (!found) {
                            messages.push({
                                id: `msg_${Date.now()}`,
                                type: MessageType.ASSISTANT,
                                content: streamBufferMapRef.current[taskId],
                                streaming: true,
                                timestamp: Date.now(),
                            });
                        }
                        
                        return {
                            ...prev,
                            [taskId]: { ...task, messages, status: TaskStatus.RUNNING }
                        };
                    });
                }
            },
            
            onToolCall: (data) => {
                addMessageToTask(taskId, {
                    type: MessageType.TOOL_CALL,
                    toolName: data.tool_name,
                    arguments: data.arguments,
                    status: data.status,
                });
            },
            
            onToolOutput: (data) => {
                updateToolCall(taskId, data.tool_name, {
                    output: data.result ?? data.result_preview,
                    status: data.status,
                });
            },
            
            onTodoAdded: (data) => {
                if (data.todo) {
                    addTodoToTask(taskId, data.todo);
                }
            },
            
            onTodoStatus: (data) => {
                updateTodoStatus(taskId, data.todoId, data.status);
            },
            
            onTodoProgress: (data) => {
                updateTask(taskId, { progress: data.progress });
            },
            
            onThoughtChain: (data) => {
                if (data.node) {
                    addOrUpdateThoughtChainNode(taskId, data.node);
                }
            },
            
            onThoughtChainUpdate: (data) => {
                if (data.chain_id) {
                    updateThoughtChainStatus(taskId, data.chain_id, data.status, data.content);
                }
            },
            
            onInterruption: (data) => {
                if (data.approval) {
                    setTasks(prev => {
                        if (!prev[taskId]) return prev;
                        return {
                            ...prev,
                            [taskId]: {
                                ...prev[taskId],
                                pendingApprovals: [...prev[taskId].pendingApprovals, data.approval],
                                status: TaskStatus.WAITING_APPROVAL,
                            }
                        };
                    });
                }
            },
            
            onDone: (data) => {
                updateTask(taskId, { status: TaskStatus.DONE });
                
                // 更新最终消息
                setTasks(prev => {
                    if (!prev[taskId]) return prev;
                    const task = prev[taskId];
                    const messages = [...task.messages];
                    
                    for (let i = messages.length - 1; i >= 0; i--) {
                        if (messages[i].type === MessageType.ASSISTANT) {
                            messages[i] = {
                                ...messages[i],
                                content: streamBufferMapRef.current[taskId] || data.final_text || '完成',
                                streaming: false,
                            };
                            break;
                        }
                    }
                    
                    return { ...prev, [taskId]: { ...task, messages } };
                });
                
                cleanupTask(taskId);
                antMessage.success('任务完成');
            },
            
            onError: (errorMsg) => {
                updateTask(taskId, { status: TaskStatus.FAILED });
                addMessageToTask(taskId, {
                    type: MessageType.ERROR,
                    content: errorMsg,
                });
                cleanupTask(taskId);
            },
            
            onTaskStatus: (data) => {
                updateTask(taskId, { status: data.status });
            },

            onReasoningDelta: (data) => {
                // 子任务 reasoning 通过 ThoughtChain 展示
                if (data.content) {
                    setTasks(prev => {
                        if (!prev[taskId]) return prev;
                        const task = prev[taskId];
                        const chain = [...task.thoughtChain];
                        let reasoningNode = null;
                        for (let i = chain.length - 1; i >= 0; i--) {
                            if (chain[i].node_type === 'reasoning' && chain[i].status === 'running') {
                                reasoningNode = chain[i];
                                break;
                            }
                        }
                        if (reasoningNode) {
                            const updatedContent = (reasoningNode.content || '') + data.content;
                            const newChain = chain.map(n =>
                                n.chain_id === reasoningNode.chain_id
                                    ? { ...n, content: updatedContent }
                                    : n
                            );
                            return {
                                ...prev,
                                [taskId]: { ...task, thoughtChain: newChain, updatedAt: Date.now() }
                            };
                        }
                        return prev;
                    });
                }
            },

            onApprovalResolved: (data) => {
                setTasks(prev => {
                    if (!prev[taskId]) return prev;
                    return {
                        ...prev,
                        [taskId]: {
                            ...prev[taskId],
                            pendingApprovals: prev[taskId].pendingApprovals.filter(
                                a => a.id !== data.approval_id
                            ),
                        }
                    };
                });
            },
        });

        unsubscribeMapRef.current[taskId] = unsubscribe;
    }, [sessionId, addMessageToTask, updateToolCall, addTodoToTask,
        updateTodoStatus, addOrUpdateThoughtChainNode, updateThoughtChainStatus,
        updateTask, cleanupTask]);

    // 取消任务
    const cancelTask = useCallback(async (taskId) => {
        if (!taskId || !sessionId) return;

        try {
            await cancelAgentTask(sessionId, taskId);
            cleanupTask(taskId);
            updateTask(taskId, { status: TaskStatus.CANCELLED });
            setLoading(false);
        } catch (err) {
            setError(err.message);
        }
    }, [sessionId, cleanupTask, updateTask]);

    // 处理审批
    const handleApproval = useCallback(async (taskId, approvalId, approved) => {
        if (!sessionId) return;

        try {
            await submitApproval(sessionId, approvalId, approved);
        } catch (err) {
            setError(err.message);
        }
    }, [sessionId]);

    // 选择任务
    const selectTask = useCallback((taskId) => {
        setSelectedTaskId(taskId);
    }, []);

    // 清除错误
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // 重置所有状态
    const reset = useCallback(() => {
        cleanupAll();
        setTasks({});
        setSelectedTaskId(null);
        setGlobalConversations([]);
        setActiveGlobalConversationId(null);
        taskIdToGlobalConversationIdRef.current = {};
        setError(null);
        setLoading(false);
    }, [cleanupAll]);

    // 计算派生状态
    const taskList = Object.values(tasks).sort((a, b) => b.createdAt - a.createdAt);
    const selectedTask = selectedTaskId ? tasks[selectedTaskId] : null;
    const runningTasks = taskList.filter(t => t.status === TaskStatus.RUNNING);
    const hasRunningTasks = runningTasks.length > 0;
    
    // 计算任务消息 Map（用于 GlobalAgent 等组件访问）
    const taskMessages = Object.fromEntries(
        Object.entries(tasks).map(([id, task]) => [id, task.messages])
    );
    
    // 获取任务状态
    const getTaskStatus = useCallback((taskId) => {
        return tasks[taskId]?.status || null;
    }, [tasks]);

    // 获取 GlobalAgent 相关任务（global 类型 + 其子 task 类型）
    const getGlobalTasks = useCallback(() => {
        const list = Object.values(tasks);
        return list.filter(t => {
            if (t.taskType === 'global') return true;
            if (t.taskType === 'task' && t.parentTaskId) {
                const parent = tasks[t.parentTaskId];
                return parent?.taskType === 'global';
            }
            return false;
        }).sort((a, b) => b.createdAt - a.createdAt);
    }, [tasks]);

    // 获取指定会话的 SessionAgent 相关任务（session 类型 + 其子 task 类型）
    const getSessionTasks = useCallback((chatSessionId) => {
        if (!chatSessionId) return [];
        const list = Object.values(tasks);
        return list.filter(t => {
            if (t.taskType === 'session' && t.chatSessionId === chatSessionId) return true;
            if (t.taskType === 'task') {
                if (t.chatSessionId === chatSessionId) return true;
                if (t.parentTaskId) {
                    const parent = tasks[t.parentTaskId];
                    return parent?.chatSessionId === chatSessionId;
                }
            }
            return false;
        }).sort((a, b) => b.createdAt - a.createdAt);
    }, [tasks]);

    const value = {
        // 状态
        tasks,
        taskList,
        selectedTask,
        selectedTaskId,
        loading,
        error,
        
        // GlobalAgent 状态
        globalAgentTaskId,
        setGlobalAgentTaskId,
        globalConversations,
        setGlobalConversations,
        activeGlobalConversationId,
        setActiveGlobalConversationId,
        createGlobalConversation,
        switchGlobalConversation,
        deleteGlobalConversation,
        addMessageToGlobalConversation,
        removeLastMessageFromGlobalConversation,
        taskMessages,
        getTaskStatus,
        getGlobalTasks,
        getSessionTasks,
        
        // 派生状态
        runningTasks,
        hasRunningTasks,
        
        // 操作
        startTask,
        cancelTask,
        selectTask,
        handleApproval,
        clearError,
        reset,
        
        // ThoughtChain 相关
        addOrUpdateThoughtChainNode,
        updateThoughtChainStatus,
        
        // 便捷方法
        approveApproval: (taskId, approvalId) => handleApproval(taskId, approvalId, true),
        rejectApproval: (taskId, approvalId) => handleApproval(taskId, approvalId, false),
    };

    return (
        <AgentContext.Provider value={value}>
            {children}
        </AgentContext.Provider>
    );
}

export function useAgent() {
    const context = useContext(AgentContext);
    if (!context) {
        throw new Error('useAgent must be used within an AgentProvider');
    }
    return context;
}

export default AgentContext;

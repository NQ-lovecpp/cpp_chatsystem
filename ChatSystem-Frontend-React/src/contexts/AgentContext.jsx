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
 */
function createTaskObject(taskId, inputText, taskType = 'session', parentTaskId = null) {
    return {
        id: taskId,
        inputText,
        taskType,
        parentTaskId,
        status: TaskStatus.PENDING,
        messages: [],
        todos: [],
        pendingApprovals: [],
        progress: 0,
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
    
    // 全局加载状态
    const [loading, setLoading] = useState(false);
    
    // 全局错误
    const [error, setError] = useState(null);
    
    // SSE 取消订阅函数 Map
    const unsubscribeMapRef = useRef({});
    
    // 流式文本缓冲区 Map
    const streamBufferMapRef = useRef({});

    // 清理特定任务的 SSE 订阅
    const cleanupTask = useCallback((taskId) => {
        if (unsubscribeMapRef.current[taskId]) {
            unsubscribeMapRef.current[taskId]();
            delete unsubscribeMapRef.current[taskId];
        }
        delete streamBufferMapRef.current[taskId];
    }, []);

    // 清理所有订阅
    const cleanupAll = useCallback(() => {
        Object.keys(unsubscribeMapRef.current).forEach(taskId => {
            unsubscribeMapRef.current[taskId]();
        });
        unsubscribeMapRef.current = {};
        streamBufferMapRef.current = {};
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

    // 创建并启动任务
    const startTask = useCallback(async (input, taskType = 'session', chatSessionId = null) => {
        if (!sessionId) {
            setError('未登录');
            return null;
        }

        setError(null);
        setLoading(true);

        try {
            // 创建任务
            const response = await createAgentTask(sessionId, input, taskType, chatSessionId);
            const taskId = response.task_id;
            
            // 初始化任务对象
            const task = createTaskObject(taskId, input, taskType);
            
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
            setTasks(prev => ({ ...prev, [taskId]: task }));
            setSelectedTaskId(taskId);
            
            // 初始化流缓冲区
            streamBufferMapRef.current[taskId] = '';

            // 订阅 SSE 事件
            const unsubscribe = subscribeTaskEvents(sessionId, taskId, {
                onInit: (data) => {
                    console.log('[Agent] Init:', data);
                },
                
                onReasoningDelta: (data) => {
                    if (data.content) {
                        addMessageToTask(taskId, {
                            type: MessageType.REASONING,
                            content: data.content,
                        });
                    }
                },
                
                onToolCall: (data) => {
                    addMessageToTask(taskId, {
                        type: MessageType.TOOL_CALL,
                        toolName: data.tool_name,
                        arguments: data.arguments,
                        status: data.status,
                        requiresApproval: data.requires_approval,
                    });
                },
                
                onToolOutput: (data) => {
                    updateToolCall(taskId, data.tool_name, {
                        output: data.result,
                        status: data.status,
                    });
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
                
                onMessage: (data) => {
                    if (data.delta) {
                        streamBufferMapRef.current[taskId] = 
                            (streamBufferMapRef.current[taskId] || '') + data.content;
                        updateLastAssistantMessage(taskId, streamBufferMapRef.current[taskId], true);
                    } else if (data.content) {
                        updateLastAssistantMessage(taskId, data.content, false);
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
                
                onDone: (data) => {
                    updateTask(taskId, { status: TaskStatus.DONE });
                    updateLastAssistantMessage(taskId, 
                        streamBufferMapRef.current[taskId] || data.final_text || '完成', 
                        false
                    );
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
                    // 创建子任务对象
                    const childTask = createTaskObject(
                        data.task_id, 
                        data.description, 
                        'task',
                        taskId
                    );
                    setTasks(prev => ({ ...prev, [data.task_id]: childTask }));
                    
                    // 订阅子任务事件
                    subscribeChildTask(data.task_id);
                    
                    antMessage.info(`已创建任务: ${data.description.slice(0, 20)}...`);
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
        addTodoToTask, updateTodoStatus, updateTask, cleanupTask]);

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
                    output: data.result,
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
        updateTodoStatus, updateTask, cleanupTask]);

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
        taskMessages,
        getTaskStatus,
        
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

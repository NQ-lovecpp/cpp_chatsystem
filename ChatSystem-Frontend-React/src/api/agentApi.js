/**
 * Agent API 客户端
 * 与 Agent Server 的 HTTP/SSE 通信
 */

import { getHttpBaseUrl } from './config';

// Agent Server 基础 URL（开发环境通过 Vite 代理）
const isDev = import.meta.env?.DEV || window.location.hostname === 'localhost';

function getAgentBaseUrl() {
    if (isDev) {
        // 开发模式使用 Vite 代理
        return '/agent';
    }
    // 生产模式：假设 Agent Server 与 Gateway 同域，通过网关代理
    return `${getHttpBaseUrl()}/service/agent`;
}

/**
 * 创建 Agent 任务
 * @param {string} sessionId - 用户会话 ID（用于认证）
 * @param {string} input - 任务输入文本
 * @param {string} taskType - 任务类型: 'session' | 'global' | 'task'
 * @param {string} chatSessionId - 聊天会话 ID（session 类型需要）
 * @param {Array<{role: string, content: string}>} chatHistory - 多轮对话历史（global/session 使用）
 */
export async function createAgentTask(sessionId, input, taskType = 'session', chatSessionId = null, chatHistory = null) {
    const body = {
        input,
        task_type: taskType,
        chat_session_id: chatSessionId,
    };
    if (chatHistory && chatHistory.length > 0) {
        body.chat_history = chatHistory;
    }
    const response = await fetch(`${getAgentBaseUrl()}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': sessionId,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * 获取任务详情
 * @param {string} sessionId - 用户会话 ID
 * @param {string} taskId - 任务 ID
 */
export async function getAgentTask(sessionId, taskId) {
    const response = await fetch(`${getAgentBaseUrl()}/tasks/${taskId}`, {
        headers: {
            'X-Session-Id': sessionId,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * 列出用户任务
 * @param {string} sessionId - 用户会话 ID
 * @param {number} limit - 返回数量限制
 */
export async function listAgentTasks(sessionId, limit = 20) {
    const response = await fetch(`${getAgentBaseUrl()}/tasks?limit=${limit}`, {
        headers: {
            'X-Session-Id': sessionId,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * 取消任务
 * @param {string} sessionId - 用户会话 ID
 * @param {string} taskId - 任务 ID
 */
export async function cancelAgentTask(sessionId, taskId) {
    const response = await fetch(`${getAgentBaseUrl()}/tasks/${taskId}/cancel`, {
        method: 'POST',
        headers: {
            'X-Session-Id': sessionId,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * 订阅任务 SSE 事件
 * @param {string} sessionId - 用户会话 ID
 * @param {string} taskId - 任务 ID
 * @param {object} handlers - 事件处理器
 * @returns {function} 取消订阅函数
 */
export function subscribeTaskEvents(sessionId, taskId, handlers) {
    const {
        onInit,
        onReasoningDelta,
        onToolCall,
        onToolOutput,
        onInterruption,
        onMessage,
        onTodoAdded,
        onTodoStatus,
        onTodoProgress,
        onDone,
        onError,
        onTaskStatus,
        onTaskCreated,
        onApprovalResolved,
    } = handlers;

    const url = `${getAgentBaseUrl()}/events?task_id=${taskId}`;
    
    // 使用 fetch + ReadableStream 实现 SSE（支持自定义 headers）
    const controller = new AbortController();
    
    const connect = async () => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'text/event-stream',
                    'X-Session-Id': sessionId,
                },
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`SSE connection failed: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                let eventType = null;
                let eventData = '';
                let eventId = null;

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        eventType = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        eventData = line.slice(5).trim();
                    } else if (line.startsWith('id:')) {
                        eventId = line.slice(3).trim();
                    } else if (line === '' && eventType && eventData) {
                        // 处理事件
                        try {
                            const data = JSON.parse(eventData);
                            handleEvent(eventType, data, eventId);
                        } catch (e) {
                            console.error('Failed to parse SSE data:', e);
                        }
                        eventType = null;
                        eventData = '';
                        eventId = null;
                    }
                }
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('SSE error:', error);
                onError?.(error.message);
            }
        }
    };

    const handleEvent = (type, data, id) => {
        switch (type) {
            case 'init':
                onInit?.(data);
                break;
            case 'reasoning_delta':
                onReasoningDelta?.(data);
                break;
            case 'tool_call':
                onToolCall?.(data);
                break;
            case 'tool_output':
                onToolOutput?.(data);
                break;
            case 'interruption':
                onInterruption?.(data);
                break;
            case 'message':
                onMessage?.(data);
                break;
            case 'todo_added':
                onTodoAdded?.(data);
                break;
            case 'todo_status':
                onTodoStatus?.(data);
                break;
            case 'todo_progress':
                onTodoProgress?.(data);
                break;
            case 'done':
                onDone?.(data);
                break;
            case 'error':
                onError?.(data.message || data.error || 'Unknown error');
                break;
            case 'task_status':
                onTaskStatus?.(data);
                break;
            case 'task_created':
                onTaskCreated?.(data);
                break;
            case 'approval_resolved':
                onApprovalResolved?.(data);
                break;
            default:
                console.log('Unknown SSE event:', type, data);
        }
    };

    connect();

    // 返回取消订阅函数
    return () => {
        controller.abort();
    };
}

/**
 * 提交审批决定
 * @param {string} sessionId - 用户会话 ID
 * @param {string} approvalId - 审批请求 ID
 * @param {boolean} approved - 是否批准
 */
export async function submitApproval(sessionId, approvalId, approved) {
    const response = await fetch(`${getAgentBaseUrl()}/approvals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': sessionId,
        },
        body: JSON.stringify({
            approval_id: approvalId,
            approved,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * 批量提交审批决定
 * @param {string} sessionId - 用户会话 ID
 * @param {Array<{approvalId: string, approved: boolean}>} decisions - 审批决定列表
 */
export async function submitBatchApproval(sessionId, decisions) {
    const response = await fetch(`${getAgentBaseUrl()}/approvals/batch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': sessionId,
        },
        body: JSON.stringify({
            decisions: decisions.map(d => ({
                approval_id: d.approvalId,
                approved: d.approved,
            })),
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * 获取任务的待审批请求
 * @param {string} sessionId - 用户会话 ID
 * @param {string} taskId - 任务 ID
 */
export async function getPendingApprovals(sessionId, taskId) {
    const response = await fetch(`${getAgentBaseUrl()}/approvals/pending/${taskId}`, {
        headers: {
            'X-Session-Id': sessionId,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * 获取事件历史（用于断线重连）
 * @param {string} sessionId - 用户会话 ID
 * @param {string} taskId - 任务 ID
 */
export async function getEventHistory(sessionId, taskId) {
    const response = await fetch(`${getAgentBaseUrl()}/events/history/${taskId}`, {
        headers: {
            'X-Session-Id': sessionId,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * 获取 Agent 服务状态
 */
export async function getAgentStatus() {
    const response = await fetch(`${getAgentBaseUrl()}/status`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

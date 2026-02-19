/**
 * Agent 上下文 - 简化版
 *
 * 只保留：
 * - Agent 用户列表管理（供 @mention）
 * - 审批处理
 * - Session SSE 订阅管理
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
    getAgentUsers,
    subscribeSessionEvents,
    submitApproval,
} from '../api/agentApi';

const AgentContext = createContext(null);

export function AgentProvider({ children }) {
    const { sessionId } = useAuth();

    // 可用 Agent 用户列表（供 @mention 下拉）
    const [agentUsers, setAgentUsers] = useState([]);

    // 当前订阅的会话 SSE
    const sessionSseRef = useRef(null);
    const currentSseSessionRef = useRef(null);

    // 审批状态
    const [pendingApprovals, setPendingApprovals] = useState([]);

    // 加载 Agent 用户列表
    const loadAgentUsers = useCallback(async () => {
        try {
            const agents = await getAgentUsers();
            setAgentUsers(agents);
        } catch (err) {
            console.error('Failed to load agent users:', err);
        }
    }, []);

    // 初始化时加载 Agent 用户
    useEffect(() => {
        if (sessionId) {
            loadAgentUsers();
        }
    }, [sessionId, loadAgentUsers]);

    // 订阅会话级 SSE（由 ChatContext 调用）
    const subscribeSession = useCallback((chatSessionId, handlers) => {
        if (!sessionId || !chatSessionId) return;

        // 如果已订阅同一会话，不重复订阅
        if (currentSseSessionRef.current === chatSessionId && sessionSseRef.current) {
            return;
        }

        // 先取消之前的订阅
        if (sessionSseRef.current) {
            sessionSseRef.current();
            sessionSseRef.current = null;
        }

        currentSseSessionRef.current = chatSessionId;

        const unsubscribe = subscribeSessionEvents(sessionId, chatSessionId, {
            onAgentStart: (data) => {
                handlers.onAgentStart?.(data);
            },
            onContentDelta: (data) => {
                handlers.onContentDelta?.(data);
            },
            onAgentDone: (data) => {
                handlers.onAgentDone?.(data);
            },
            onAgentError: (data) => {
                handlers.onAgentError?.(data);
            },
            onInterruption: (data) => {
                if (data.approval) {
                    setPendingApprovals(prev => [...prev, data.approval]);
                }
                handlers.onInterruption?.(data);
            },
        });

        sessionSseRef.current = unsubscribe;
    }, [sessionId]);

    // 取消当前会话 SSE 订阅
    const unsubscribeSession = useCallback(() => {
        if (sessionSseRef.current) {
            sessionSseRef.current();
            sessionSseRef.current = null;
        }
        currentSseSessionRef.current = null;
    }, []);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            if (sessionSseRef.current) {
                sessionSseRef.current();
            }
        };
    }, []);

    // 处理审批
    const handleApproval = useCallback(async (approvalId, approved) => {
        if (!sessionId) return;
        try {
            await submitApproval(sessionId, approvalId, approved);
            setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
        } catch (err) {
            console.error('Approval error:', err);
        }
    }, [sessionId]);

    const value = {
        // Agent 用户
        agentUsers,
        loadAgentUsers,

        // Session SSE
        subscribeSession,
        unsubscribeSession,

        // 审批
        pendingApprovals,
        handleApproval,
        approveApproval: (approvalId) => handleApproval(approvalId, true),
        rejectApproval: (approvalId) => handleApproval(approvalId, false),
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

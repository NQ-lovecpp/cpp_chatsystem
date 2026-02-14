/**
 * GlobalAgent 对话界面
 * 用户的私人 AI 助手，从左侧边栏访问
 * 
 * 与 SessionAgent 的区别：
 * - GlobalAgent: 用户的私人助手，独立于聊天会话，可创建 TaskAgent
 * - SessionAgent: 群聊/单聊中的 AI 成员
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAgent } from '../../contexts/AgentContext';
import { useAuth } from '../../contexts/AuthContext';
import { MessageType } from '../../contexts/AgentContext';
import TaskMessageItem from './TaskMessageItem';
import { cn } from '../../lib/utils';

export default function GlobalAgentChat() {
    const { user } = useAuth();
    const { 
        startTask, 
        tasks,
        globalAgentTaskId,
        setGlobalAgentTaskId,
        globalConversations,
        activeGlobalConversationId,
        createGlobalConversation,
        addMessageToGlobalConversation,
        removeLastMessageFromGlobalConversation,
        getTaskStatus,
        selectTask,
    } = useAgent();
    
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    
    // 当前会话
    const currentConversation = activeGlobalConversationId 
        ? globalConversations.find(c => c.id === activeGlobalConversationId) 
        : null;
    const conversationMessages = currentConversation?.messages ?? [];
    
    // 当前 GlobalAgent 任务（来自 context）
    const currentTask = globalAgentTaskId ? tasks[globalAgentTaskId] : null;
    
    // 合并展示：历史对话 + 当前轮次（工具调用、助手回复）
    // 注意：任务完成时 assistant 已追加到 conversationMessages，需排除 currentTask 中的 assistant 避免重复
    const taskStatus = globalAgentTaskId ? getTaskStatus(globalAgentTaskId) : null;
    const displayMessages = (() => {
        const hist = conversationMessages.map((m, i) => ({
            id: `hist_${i}`,
            type: m.role === 'user' ? MessageType.USER : MessageType.ASSISTANT,
            content: m.content,
        }));
        if (!currentTask?.messages?.length) return hist;
        const current = currentTask.messages.filter(m => {
            if (m.type === MessageType.USER) return false;
            if (m.type === MessageType.ASSISTANT && (taskStatus === 'done' || taskStatus === 'failed' || taskStatus === 'cancelled')) return false;
            return true;
        });
        return [...hist, ...current];
    })();
    
    // 滚动到底部
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);
    
    useEffect(() => {
        scrollToBottom();
    }, [displayMessages, scrollToBottom]);
    
    // 监听任务状态变化
    useEffect(() => {
        if (globalAgentTaskId) {
            const status = getTaskStatus(globalAgentTaskId);
            if (status === 'done' || status === 'failed' || status === 'cancelled') {
                setIsLoading(false);
            }
        }
    }, [globalAgentTaskId, getTaskStatus]);
    
    // 发送消息 - 调用 GlobalAgent（task_type: 'global'），支持多轮对话
    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;
        
        const text = inputText.trim();
        setInputText('');
        setIsLoading(true);
        
        // 若无当前会话则创建
        let convId = activeGlobalConversationId;
        if (!convId) {
            convId = createGlobalConversation();
        }
        
        // 多轮：先将用户消息加入当前会话
        addMessageToGlobalConversation(convId, { role: 'user', content: text });
        
        try {
            // chat_history 为当前会话历史（不含本条，后端会与 input 拼接）
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
        }
    };
    
    // 按键处理
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-[var(--color-surface)]">
            {/* 头部 */}
            <div className="shrink-0 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-semibold text-[var(--color-text)]">AI 私人助手</h2>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                可以帮您查询聊天记录、执行任务
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={createGlobalConversation}
                        className="text-xs px-3 py-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-colors"
                    >
                        新对话
                    </button>
                </div>
            </div>
            
            {/* 消息列表 - 多轮对话：历史 + 当前任务 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {displayMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-muted)]">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
                            您好，{user?.nickname || '用户'}！
                        </h3>
                        <p className="max-w-sm text-sm">
                            我是您的私人 AI 助手，可以帮您：
                        </p>
                        <ul className="mt-3 text-sm space-y-1.5">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                查询和总结聊天记录
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                搜索网页获取信息
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                执行代码和数据分析
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                创建后台任务（TaskAgent）处理复杂工作
                            </li>
                        </ul>
                    </div>
                ) : (
                    displayMessages.map((message, index) => {
                        const isLastAssistant = message.type === MessageType.ASSISTANT &&
                            index === displayMessages.length - 1;
                        const isStreaming = message.streaming && getTaskStatus(globalAgentTaskId) === 'running';
                        return (
                            <TaskMessageItem
                                key={message.id}
                                message={message}
                                isLastAssistantAndStreaming={isLastAssistant && isStreaming}
                            />
                        );
                    })
                )}
                {isLoading && displayMessages.length === 0 && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* 输入区域 */}
            <div className="shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="输入消息..."
                            rows={1}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl resize-none",
                                "bg-[var(--color-surface)] border border-[var(--color-border)]",
                                "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]",
                                "text-[var(--color-text)] placeholder-[var(--color-text-muted)]",
                                "transition-all duration-200"
                            )}
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isLoading}
                        className={cn(
                            "p-3 rounded-xl transition-all duration-200",
                            inputText.trim() && !isLoading
                                ? "bg-[var(--color-primary)] text-white hover:opacity-90 shadow-md"
                                : "bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

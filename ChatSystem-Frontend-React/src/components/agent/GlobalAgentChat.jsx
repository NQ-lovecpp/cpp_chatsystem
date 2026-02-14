/**
 * GlobalAgent 对话界面
 * 用户的私人 AI 助手，从左侧边栏访问
 * 
 * 与 SessionAgent 的区别：
 * - GlobalAgent: 用户的私人助手，独立于聊天会话
 * - SessionAgent: 群聊/单聊中的 AI 成员
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAgent } from '../../contexts/AgentContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import { cn } from '../../lib/utils';

export default function GlobalAgentChat() {
    const { user } = useAuth();
    const { 
        startTask, 
        taskMessages, 
        globalAgentTaskId,
        setGlobalAgentTaskId,
        getTaskStatus 
    } = useAgent();
    
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    
    // 滚动到底部
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);
    
    // 监听任务消息
    useEffect(() => {
        if (globalAgentTaskId && taskMessages[globalAgentTaskId]) {
            const taskMsgs = taskMessages[globalAgentTaskId];
            // 更新消息列表
            setMessages(prev => {
                // 找到最后一条助手消息并更新
                const lastAssistantIndex = prev.findLastIndex(m => m.role === 'assistant' && m.taskId === globalAgentTaskId);
                if (lastAssistantIndex >= 0 && taskMsgs.length > 0) {
                    const newMessages = [...prev];
                    const fullContent = taskMsgs.map(m => m.content).join('');
                    newMessages[lastAssistantIndex] = {
                        ...newMessages[lastAssistantIndex],
                        content: fullContent
                    };
                    return newMessages;
                }
                return prev;
            });
            scrollToBottom();
        }
    }, [globalAgentTaskId, taskMessages, scrollToBottom]);
    
    // 监听任务状态变化
    useEffect(() => {
        if (globalAgentTaskId) {
            const status = getTaskStatus(globalAgentTaskId);
            if (status === 'done' || status === 'failed' || status === 'cancelled') {
                setIsLoading(false);
            }
        }
    }, [globalAgentTaskId, getTaskStatus]);
    
    // 发送消息
    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;
        
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim(),
            timestamp: new Date()
        };
        
        // 添加用户消息
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);
        
        try {
            // 创建 global 类型的任务
            const taskId = await startTask(inputText.trim(), 'global');
            setGlobalAgentTaskId(taskId);
            
            // 添加助手消息占位
            const assistantMessage = {
                id: taskId,
                taskId: taskId,
                role: 'assistant',
                content: '',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            
        } catch (error) {
            console.error('Failed to start global agent task:', error);
            setIsLoading(false);
            // 添加错误消息
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: '发送失败，请重试',
                timestamp: new Date(),
                isError: true
            }]);
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
            </div>
            
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
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
                        </ul>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isUser={message.role === 'user'}
                            isLoading={message.role === 'assistant' && isLoading && message.content === ''}
                        />
                    ))
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

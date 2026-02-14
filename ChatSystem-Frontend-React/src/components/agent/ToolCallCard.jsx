/**
 * 工具调用卡片组件
 * 显示 Agent 调用的工具信息和执行结果
 */

import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';

// 工具图标配置
const TOOL_ICONS = {
    // 网页工具
    web_search: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        label: '网页搜索',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    web_open: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        ),
        label: '打开网页',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
    },
    web_find: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
        label: '页面查找',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
    },
    // Python 执行
    python_execute: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
        label: 'Python 执行',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
    },
    python_execute_with_approval: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
        label: 'Python 执行',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
    },
    // 数据库工具
    get_chat_history: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
        label: '获取聊天记录',
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
    },
    get_session_members: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        label: '获取会话成员',
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
    },
    get_user_info: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        label: '获取用户信息',
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
    },
    search_messages: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        label: '搜索消息',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
    },
    get_user_sessions: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
        label: '获取会话列表',
        color: 'text-teal-500',
        bg: 'bg-teal-500/10',
    },
    // 任务管理工具
    add_todos: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
        label: '添加待办',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
    update_todo: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        label: '更新待办',
        color: 'text-lime-500',
        bg: 'bg-lime-500/10',
    },
    list_todos: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
        ),
        label: '查看待办',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
    },
    // 创建任务
    create_task: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
        label: '创建任务',
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
    },
    create_global_task: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
        label: '创建全局任务',
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
    },
};

// 状态图标
const STATUS_ICONS = {
    executing: (
        <motion.div
            className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
    ),
    pending_approval: (
        <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    completed: (
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    failed: (
        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    rejected: (
        <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
    ),
    expired: (
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

// 格式化参数显示
function formatArguments(toolName, args) {
    if (!args) return null;
    
    switch (toolName) {
        case 'web_search':
            return (
                <div className="text-sm">
                    <span className="text-[var(--color-text-muted)]">搜索: </span>
                    <span className="text-[var(--color-text)]">"{args.query}"</span>
                    {args.topn && args.topn !== 10 && (
                        <span className="text-[var(--color-text-muted)]"> (前 {args.topn} 条)</span>
                    )}
                </div>
            );
        case 'web_open':
            return (
                <div className="text-sm">
                    <span className="text-[var(--color-text-muted)]">打开: </span>
                    <span className="text-[var(--color-primary)] break-all">{args.id_or_url}</span>
                </div>
            );
        case 'web_find':
            return (
                <div className="text-sm">
                    <span className="text-[var(--color-text-muted)]">查找: </span>
                    <span className="text-[var(--color-text)]">"{args.pattern}"</span>
                </div>
            );
        case 'python_execute':
        case 'python_execute_with_approval': {
            const code = args.code || '';
            const preview = code.length > 200 ? code.slice(0, 200) + '...' : code;
            return (
                <pre className="text-xs bg-[var(--color-surface)] p-2 rounded mt-1 overflow-x-auto max-h-32 overflow-y-auto">
                    <code>{preview}</code>
                </pre>
            );
        }
        // 数据库工具
        case 'get_chat_history':
            return (
                <div className="text-sm space-y-1">
                    <div>
                        <span className="text-[var(--color-text-muted)]">会话 ID: </span>
                        <span className="text-[var(--color-text)]">{args.chat_session_id}</span>
                    </div>
                    {args.limit && (
                        <div>
                            <span className="text-[var(--color-text-muted)]">数量: </span>
                            <span className="text-[var(--color-text)]">{args.limit}</span>
                        </div>
                    )}
                </div>
            );
        case 'get_session_members':
            return (
                <div className="text-sm">
                    <span className="text-[var(--color-text-muted)]">会话 ID: </span>
                    <span className="text-[var(--color-text)]">{args.chat_session_id}</span>
                </div>
            );
        case 'get_user_info':
            return (
                <div className="text-sm">
                    <span className="text-[var(--color-text-muted)]">用户 ID: </span>
                    <span className="text-[var(--color-text)]">{args.user_id}</span>
                </div>
            );
        case 'search_messages':
            return (
                <div className="text-sm space-y-1">
                    <div>
                        <span className="text-[var(--color-text-muted)]">会话 ID: </span>
                        <span className="text-[var(--color-text)]">{args.chat_session_id}</span>
                    </div>
                    <div>
                        <span className="text-[var(--color-text-muted)]">关键词: </span>
                        <span className="text-[var(--color-text)]">"{args.keyword}"</span>
                    </div>
                </div>
            );
        case 'get_user_sessions':
            return (
                <div className="text-sm">
                    <span className="text-[var(--color-text-muted)]">用户 ID: </span>
                    <span className="text-[var(--color-text)]">{args.user_id}</span>
                </div>
            );
        // 任务管理工具
        case 'add_todos':
            return (
                <div className="text-sm">
                    <span className="text-[var(--color-text-muted)]">待办列表: </span>
                    <ul className="mt-1 space-y-0.5 text-[var(--color-text)]">
                        {(args.texts || []).map((text, i) => (
                            <li key={i} className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-[var(--color-primary)]" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        case 'update_todo':
            return (
                <div className="text-sm space-y-1">
                    <div>
                        <span className="text-[var(--color-text-muted)]">待办 ID: </span>
                        <span className="text-[var(--color-text)]">{args.todo_id}</span>
                    </div>
                    <div>
                        <span className="text-[var(--color-text-muted)]">状态: </span>
                        <span className={`
                            ${args.status === 'completed' ? 'text-green-500' : ''}
                            ${args.status === 'running' ? 'text-blue-500' : ''}
                            ${args.status === 'failed' ? 'text-red-500' : ''}
                        `}>{args.status}</span>
                    </div>
                </div>
            );
        case 'create_task':
        case 'create_global_task':
            return (
                <div className="text-sm">
                    <span className="text-[var(--color-text-muted)]">任务描述: </span>
                    <span className="text-[var(--color-text)]">"{args.description}"</span>
                </div>
            );
        default:
            return (
                <pre className="text-xs bg-[var(--color-surface)] p-2 rounded mt-1 overflow-x-auto">
                    <code>{JSON.stringify(args, null, 2)}</code>
                </pre>
            );
    }
}

// 格式化输出显示
function formatOutput(toolName, output) {
    if (!output) return null;
    
    if (output.error) {
        return (
            <div className="text-sm text-red-500 mt-2">
                <span className="font-medium">错误: </span>
                {output.error}
            </div>
        );
    }
    
    // 对于浏览器工具，显示 display 字段
    if (output.display) {
        const display = output.display;
        const preview = display.length > 500 ? display.slice(0, 500) + '...' : display;
        return (
            <pre className="text-xs bg-[var(--color-surface)] p-2 rounded mt-2 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                {preview}
            </pre>
        );
    }
    
    // Python 执行结果
    if (toolName === 'python_execute' && output.output) {
        return (
            <div className="mt-2">
                <pre className="text-xs bg-[var(--color-surface)] p-2 rounded overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {output.output}
                </pre>
                {output.duration_ms && (
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">
                        执行耗时: {output.duration_ms}ms
                    </div>
                )}
            </div>
        );
    }
    
    // 默认 JSON 格式
    return (
        <pre className="text-xs bg-[var(--color-surface)] p-2 rounded mt-2 overflow-x-auto max-h-48 overflow-y-auto">
            <code>{JSON.stringify(output, null, 2)}</code>
        </pre>
    );
}

export default function ToolCallCard({ 
    toolName, 
    arguments: args, 
    output, 
    status = 'executing',
    // eslint-disable-next-line no-unused-vars
    requiresApproval = false,
    onApprove,
    onReject,
}) {
    const [expanded, setExpanded] = useState(false);
    
    const tool = TOOL_ICONS[toolName] || {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        ),
        label: toolName,
        color: 'text-gray-500',
        bg: 'bg-gray-500/10',
    };
    
    const statusIcon = STATUS_ICONS[status] || STATUS_ICONS.executing;
    const isWaitingApproval = status === 'pending_approval';
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                border rounded-xl overflow-hidden
                ${isWaitingApproval 
                    ? 'border-yellow-500/50 bg-yellow-500/5' 
                    : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]'}
            `}
        >
            {/* 头部 */}
            <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-[var(--color-surface)] transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${tool.bg} flex items-center justify-center ${tool.color}`}>
                        {tool.icon}
                    </div>
                    <div>
                        <div className="font-medium text-sm text-[var(--color-text)]">{tool.label}</div>
                        {isWaitingApproval && (
                            <div className="text-xs text-yellow-600">需要您的批准</div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {statusIcon}
                    <motion.svg 
                        className="w-4 h-4 text-[var(--color-text-muted)]"
                        animate={{ rotate: expanded ? 180 : 0 }}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                </div>
            </div>
            
            {/* 展开内容 */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 border-t border-[var(--color-border)]">
                            {/* 参数 */}
                            <div className="mt-3">
                                <div className="text-xs font-medium text-[var(--color-text-muted)] mb-1">参数</div>
                                {formatArguments(toolName, args)}
                            </div>
                            
                            {/* 输出 */}
                            {output && (
                                <div className="mt-3">
                                    <div className="text-xs font-medium text-[var(--color-text-muted)] mb-1">输出</div>
                                    {formatOutput(toolName, output)}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* 审批按钮 */}
            {isWaitingApproval && onApprove && onReject && (
                <div className="flex gap-2 p-3 border-t border-yellow-500/30 bg-yellow-500/5">
                    <button
                        onClick={onReject}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        拒绝
                    </button>
                    <button
                        onClick={onApprove}
                        className="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors"
                    >
                        批准
                    </button>
                </div>
            )}
        </motion.div>
    );
}

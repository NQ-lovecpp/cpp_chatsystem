/**
 * Agent 消息气泡组件
 * 支持流式渲染（streaming 时使用 StreamingMarkdown）
 */

import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import StreamingMarkdown from './StreamingMarkdown';

export default function MessageBubble({ message, isUser, isLoading, streaming = false }) {
    const { content, isError } = message;
    
    return (
        <div className={cn(
            "flex gap-3",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            {/* 头像 */}
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                isUser 
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
            )}>
                {isUser ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                )}
            </div>
            
            {/* 消息内容 */}
            <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5",
                isUser 
                    ? "bg-[var(--color-primary)] text-white"
                    : isError
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-[var(--color-surface-elevated)] text-[var(--color-text)] border border-[var(--color-border)]"
            )}>
                {isLoading ? (
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                ) : (
                    <div className={cn(
                        "prose prose-sm max-w-none",
                        isUser ? "prose-invert" : ""
                    )}>
                        {isUser ? (
                            <p className="m-0 whitespace-pre-wrap">{content}</p>
                        ) : streaming ? (
                            <>
                                <StreamingMarkdown content={content || ''} />
                                <span className="inline-block w-2 h-4 ml-0.5 bg-[var(--color-primary)] animate-blink" />
                            </>
                        ) : (
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="m-0 mb-2 last:mb-0">{children}</p>,
                                    code: ({ inline, children }) => (
                                        inline 
                                            ? <code className="px-1 py-0.5 rounded bg-black/10 text-sm">{children}</code>
                                            : <pre className="p-3 rounded-lg bg-[var(--color-surface)] overflow-x-auto text-sm"><code>{children}</code></pre>
                                    ),
                                    ul: ({ children }) => <ul className="list-disc list-inside my-2">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside my-2">{children}</ol>,
                                    li: ({ children }) => <li className="my-0.5">{children}</li>,
                                }}
                            >
                                {content || '思考中...'}
                            </ReactMarkdown>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

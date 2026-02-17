/**
 * 消息输入组件
 */

import { useState, useRef } from 'react';

export default function MessageInput({ onSend, onSendImage, onSendFile, onStartAgentTask }) {
    const [message, setMessage] = useState('');
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && onSendImage) {
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('图片大小不能超过 5MB');
                return;
            }
            onSendImage(file);
        }
        // 清空 input 以允许重复选择同一文件
        e.target.value = '';
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && onSendFile) {
            if (file.size > 50 * 1024 * 1024) {
                alert('文件大小不能超过 50MB');
                return;
            }
            onSendFile(file);
        }
        e.target.value = '';
    };

    const handleAgentClick = () => {
        if (!onStartAgentTask) return;
        const instruction = message.trim();
        if (instruction) {
            onStartAgentTask(instruction);
            setMessage('');
        } else {
            // 无内容时提示用户先输入
            const textarea = document.querySelector('textarea[data-agent-input]');
            if (textarea) textarea.focus();
        }
    };

    return (
        <div className="px-3 md:px-6 py-3 md:py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur-sm shrink-0">
            {/* 隐藏的文件选择器 */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
            />
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
            />

            <form onSubmit={handleSubmit} className="flex items-end gap-2 md:gap-3">
                {/* 附件按钮 */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 md:p-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-xl transition-colors shrink-0"
                    title="发送文件"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>

                {/* 图片按钮 */}
                <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 md:p-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-xl transition-colors shrink-0"
                    title="发送图片"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>

                {/* 输入框 */}
                <div className="flex-1 min-w-0">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入消息..."
                        rows={1}
                        data-agent-input
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-base"
                        style={{ maxHeight: '120px' }}
                    />
                </div>

                {/* @AI助手 按钮 */}
                {onStartAgentTask && (
                    <button
                        type="button"
                        onClick={handleAgentClick}
                        className="p-2 md:p-2.5 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-xl transition-colors shrink-0"
                        title="让 AI 助手处理此请求（后台任务）"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </button>
                )}

                {/* 发送按钮 */}
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-2 md:p-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
}

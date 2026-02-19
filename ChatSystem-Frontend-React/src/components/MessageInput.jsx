/**
 * 消息输入组件
 * 支持 @mention Agent 用户：键入 @ 弹出下拉选择 Agent
 */

import { useState, useRef, useCallback } from 'react';
import MentionDropdown from './MentionDropdown';

export default function MessageInput({ onSend, onSendImage, onSendFile, agentMembers = [] }) {
    const [message, setMessage] = useState('');
    const [mentionState, setMentionState] = useState({ visible: false, filter: '' });
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        // When mention dropdown is visible, let it handle keyboard events
        if (mentionState.visible) return;

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setMessage(val);

        // Detect @ trigger for mention dropdown
        const cursorPos = e.target.selectionStart;
        const textBefore = val.slice(0, cursorPos);
        // Match @ at word boundary (start of text or after space/newline)
        const mentionMatch = textBefore.match(/(^|[\s])@([^\s]*)$/);

        if (mentionMatch && agentMembers.length > 0) {
            setMentionState({ visible: true, filter: mentionMatch[2] });
        } else {
            setMentionState({ visible: false, filter: '' });
        }
    };

    const handleMentionSelect = useCallback((agent) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const cursorPos = textarea.selectionStart;
        const textBefore = message.slice(0, cursorPos);
        const textAfter = message.slice(cursorPos);

        // Find the @ trigger position
        const mentionMatch = textBefore.match(/(^|[\s])@([^\s]*)$/);
        if (!mentionMatch) return;

        const atStart = textBefore.length - mentionMatch[0].length + (mentionMatch[1] ? 1 : 0);
        const mentionTag = `@[${agent.nickname}]{${agent.user_id}} `;
        const newMessage = message.slice(0, atStart) + mentionTag + textAfter;

        setMessage(newMessage);
        setMentionState({ visible: false, filter: '' });

        // Restore focus and cursor position
        setTimeout(() => {
            textarea.focus();
            const newPos = atStart + mentionTag.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    }, [message]);

    const handleMentionClose = useCallback(() => {
        setMentionState({ visible: false, filter: '' });
    }, []);

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

                {/* 输入框容器（相对定位，用于 mention dropdown） */}
                <div className="flex-1 min-w-0 relative">
                    {/* @mention 下拉框 */}
                    <MentionDropdown
                        agents={agentMembers}
                        filter={mentionState.filter}
                        visible={mentionState.visible}
                        position={{ bottom: '100%', left: 0 }}
                        onSelect={handleMentionSelect}
                        onClose={handleMentionClose}
                    />
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={agentMembers.length > 0 ? '输入消息... 输入 @ 提及 AI 助手' : '输入消息...'}
                        rows={1}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-base"
                        style={{ maxHeight: '120px' }}
                    />
                </div>

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

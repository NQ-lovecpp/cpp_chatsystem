/**
 * MentionDropdown - @mention Agent 下拉选择框
 *
 * 当用户在输入框中键入 @ 时弹出，展示可用的 Agent 用户列表。
 * 支持键盘导航（上下箭头 + Enter 选择）和按名称过滤。
 */

import { useState, useEffect, useRef, memo } from 'react';

const MentionDropdown = memo(function MentionDropdown({
    agents = [],
    filter = '',
    visible = false,
    position = { bottom: 0, left: 0 },
    onSelect,
    onClose,
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef(null);

    // Filter agents by name
    const filtered = agents.filter(a =>
        a.nickname?.toLowerCase().includes(filter.toLowerCase())
    );

    // Reset index when filter changes
    useEffect(() => {
        setActiveIndex(0);
    }, [filter]);

    // Keyboard navigation
    useEffect(() => {
        if (!visible) return;

        const handler = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(i => (i + 1) % Math.max(filtered.length, 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(i => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
            } else if (e.key === 'Enter' && filtered.length > 0) {
                e.preventDefault();
                onSelect?.(filtered[activeIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose?.();
            }
        };

        document.addEventListener('keydown', handler, true);
        return () => document.removeEventListener('keydown', handler, true);
    }, [visible, filtered, activeIndex, onSelect, onClose]);

    // Scroll active item into view
    useEffect(() => {
        if (listRef.current) {
            const activeEl = listRef.current.children[activeIndex];
            activeEl?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    if (!visible || filtered.length === 0) return null;

    return (
        <div
            className="absolute z-50 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden"
            style={{
                bottom: position.bottom,
                left: position.left,
                minWidth: 200,
                maxHeight: 240,
            }}
        >
            <div className="px-3 py-1.5 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                选择 AI 助手
            </div>
            <div ref={listRef} className="overflow-y-auto max-h-[200px]">
                {filtered.map((agent, idx) => (
                    <div
                        key={agent.user_id}
                        onClick={() => onSelect?.(agent)}
                        className={`
                            flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors
                            ${idx === activeIndex
                                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                                : 'hover:bg-[var(--color-surface)] text-[var(--color-text)]'
                            }
                        `}
                    >
                        <div className="w-7 h-7 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{agent.nickname}</div>
                            {agent.description && (
                                <div className="text-xs text-[var(--color-text-muted)] truncate">{agent.description}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default MentionDropdown;

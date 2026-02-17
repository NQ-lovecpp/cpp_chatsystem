/**
 * GlobalAgent 右侧面板
 * 包含：GlobalAgent 会话列表
 */

import { useAgent } from '../../contexts/AgentContext';
import { cn } from '../../lib/utils';

export default function GlobalAgentSidePanel({ className = '' }) {
    const {
        globalConversations,
        activeGlobalConversationId,
        switchGlobalConversation,
        createGlobalConversation,
    } = useAgent();

    return (
        <div className={cn('flex flex-col h-full bg-[var(--color-surface-elevated)]', className)}>
            {/* 会话列表 */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--color-border)]">
                <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    会话列表
                </span>
                <button
                    onClick={createGlobalConversation}
                    className="text-xs px-2 py-1 rounded text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                >
                    + 新对话
                </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2">
                {globalConversations.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-muted)] py-2 px-2">
                        暂无会话，点击上方创建
                    </p>
                ) : (
                    <div className="space-y-1">
                        {globalConversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => switchGlobalConversation(conv.id)}
                                className={cn(
                                    'w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors',
                                    activeGlobalConversationId === conv.id
                                        ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                                        : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                                )}
                            >
                                {conv.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

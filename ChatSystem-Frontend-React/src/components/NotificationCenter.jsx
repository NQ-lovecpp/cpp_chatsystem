/**
 * 通知中心组件
 * 显示最近的消息通知，放置在会话列表底部
 */

import { useChat } from '../contexts/ChatContext';

export default function NotificationCenter() {
    const { recentNotifications, clearNotification, selectSession } = useChat();

    if (!recentNotifications || recentNotifications.length === 0) {
        return (
            <div className="border-t border-[var(--color-border)] px-5 py-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">通知中心</h3>
                <p className="text-xs text-[var(--color-text-muted)] text-center py-3">暂无新通知</p>
            </div>
        );
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
        const date = new Date(ms);
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    };

    const getPreview = (message) => {
        if (!message) return '';
        switch (message.message_type) {
            case 0: return message.string_message?.content || '';
            case 1: return '[图片]';
            case 2: return `[文件] ${message.file_message?.file_name || ''}`;
            case 3: return '[语音]';
            default: return '';
        }
    };

    return (
        <div className="border-t border-[var(--color-border)] px-3 py-3 overflow-y-auto" style={{ maxHeight: '34%' }}>
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-2">通知中心</h3>
            <div className="space-y-1">
                {recentNotifications.slice(0, 10).map((notification) => (
                    <div
                        key={notification.id}
                        className="group flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--color-surface)] cursor-pointer transition-colors"
                        onClick={() => {
                            selectSession(notification.sessionId);
                            clearNotification(notification.id);
                        }}
                    >
                        <div className="w-2 h-2 mt-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)] rounded-full shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[var(--color-text)] truncate">
                                    {notification.sender?.nickname || '未知用户'}
                                </span>
                                <span className="text-[10px] text-[var(--color-text-muted)] shrink-0 ml-1">
                                    {formatTime(notification.timestamp)}
                                </span>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] truncate">
                                {getPreview(notification.message)}
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-all"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

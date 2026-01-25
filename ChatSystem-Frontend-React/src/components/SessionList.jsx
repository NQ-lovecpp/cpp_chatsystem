/**
 * 会话列表组件
 */

import { useState } from 'react';
import { useChat } from '../contexts/ChatContext';

export default function SessionList() {
    const { sessions, currentSessionId, selectSession, loading } = useChat();
    const [searchQuery, setSearchQuery] = useState('');

    // 过滤会话
    const filteredSessions = sessions.filter(session =>
        session.chat_session_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 格式化时间
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    };

    // 获取消息预览
    const getMessagePreview = (session) => {
        const msg = session.prev_message;
        if (!msg) return '暂无消息';

        const content = msg.message;
        if (!content) return '暂无消息';

        switch (content.message_type) {
            case 0: // STRING
                return content.string_message?.content || '';
            case 1: // IMAGE
                return '[图片]';
            case 2: // FILE
                return `[文件] ${content.file_message?.file_name || ''}`;
            case 3: // SPEECH
                return '[语音]';
            default:
                return '暂无消息';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* 头部 */}
            <div className="px-5 pt-6 pb-4">
                <h1 className="text-xl font-bold text-gray-900 mb-4">消息</h1>

                {/* 搜索框 */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索会话..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20 focus:border-[#0B4F6C] transition-all"
                    />
                </div>
            </div>

            {/* 会话列表 */}
            <div className="flex-1 overflow-y-auto px-3">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-6 h-6 border-2 border-[#0B4F6C] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">暂无会话</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredSessions.map((session) => (
                            <button
                                key={session.chat_session_id}
                                onClick={() => selectSession(session.chat_session_id)}
                                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                  ${currentSessionId === session.chat_session_id
                                        ? 'bg-[#0B4F6C] text-white shadow-md shadow-[#0B4F6C]/20'
                                        : 'hover:bg-gray-50'
                                    }
                `}
                            >
                                {/* 头像 */}
                                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center font-medium text-lg shrink-0
                  ${currentSessionId === session.chat_session_id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gradient-to-br from-[#0B4F6C] to-[#0a4560] text-white'
                                    }
                `}>
                                    {session.chat_session_name?.charAt(0)?.toUpperCase() || 'C'}
                                </div>

                                {/* 内容 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-medium truncate ${currentSessionId === session.chat_session_id ? 'text-white' : 'text-gray-900'}`}>
                                            {session.chat_session_name || '未命名会话'}
                                        </span>
                                        <span className={`text-xs shrink-0 ${currentSessionId === session.chat_session_id ? 'text-white/70' : 'text-gray-400'}`}>
                                            {formatTime(session.prev_message?.timestamp)}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${currentSessionId === session.chat_session_id ? 'text-white/80' : 'text-gray-500'}`}>
                                        {getMessagePreview(session)}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

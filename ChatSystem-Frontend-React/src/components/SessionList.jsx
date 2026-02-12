/**
 * 会话列表组件
 */

import { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { createChatSession } from '../api/sessionApi';
import Avatar from './Avatar';
import NotificationCenter from './NotificationCenter';

export default function SessionList({ onSessionSelect }) {
    const { sessions, currentSessionId, selectSession, loading, friends, loadSessions, unreadCounts } = useChat();
    const { sessionId, user } = useAuth();
    const userId = user?.user_id;

    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [creating, setCreating] = useState(false);

    const filteredSessions = sessions.filter(session =>
        session.chat_session_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
        const date = new Date(ms);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    };

    const getMessagePreview = (session) => {
        const msg = session.prev_message;
        if (!msg) return '暂无消息';

        const content = msg.message;
        if (!content) return '暂无消息';

        switch (content.message_type) {
            case 0: return content.string_message?.content || '';
            case 1: return '[图片]';
            case 2: return `[文件] ${content.file_message?.file_name || ''}`;
            case 3: return '[语音]';
            default: return '暂无消息';
        }
    };

    const toggleMember = (friendId) => {
        setSelectedMembers(prev =>
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedMembers.length === 0) {
            alert('请输入群名称并选择至少一个成员');
            return;
        }

        setCreating(true);
        const memberList = [...selectedMembers, userId];
        const result = await createChatSession(sessionId, userId, groupName, memberList);

        if (result.success) {
            setShowCreateModal(false);
            setGroupName('');
            setSelectedMembers([]);
            loadSessions();
        } else {
            alert(result.errmsg || '创建失败');
        }
        setCreating(false);
    };

    // 未读提示渲染
    const renderUnreadBadge = (count) => {
        if (!count || count <= 0) return null;
        
        if (count <= 5) {
            // 小圆点 + 渐变光晕
            return (
                <div className="relative">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-ping opacity-30" />
                </div>
            );
        }
        
        // 胶囊型计数
        return (
            <div className="px-1.5 py-0.5 min-w-[20px] text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold rounded-full leading-tight shadow-sm shadow-blue-500/30">
                {count > 99 ? '99+' : count}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* 头部 */}
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900">消息</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-8 h-8 flex items-center justify-center bg-[#0B4F6C] text-white rounded-lg hover:bg-[#0a4560] transition-colors"
                        title="创建群聊"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

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

            {/* 会话列表（上方约2/3） */}
            <div className="flex-1 overflow-y-auto px-3" style={{ maxHeight: '66%' }}>
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
                        <p className="text-xs mt-1">添加好友后会自动创建会话</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredSessions.map((session) => {
                            const unread = unreadCounts[session.chat_session_id] || 0;
                            const isActive = currentSessionId === session.chat_session_id;

                            return (
                                <button
                                    key={session.chat_session_id}
                                    onClick={() => {
                                        selectSession(session.chat_session_id);
                                        onSessionSelect?.(session.chat_session_id);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                                        ${isActive
                                            ? 'bg-[#0B4F6C] text-white shadow-md shadow-[#0B4F6C]/20'
                                            : 'hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {/* 头像 */}
                                    <div className="relative">
                                        <Avatar
                                            src={session.avatar}
                                            name={session.chat_session_name}
                                            size="lg"
                                            rounded="xl"
                                            className={isActive ? 'bg-white/20' : ''}
                                        />
                                        {/* 未读提示 - 右上角 */}
                                        {!isActive && unread > 0 && (
                                            <div className="absolute -top-1 -right-1">
                                                {renderUnreadBadge(unread)}
                                            </div>
                                        )}
                                    </div>

                                    {/* 内容 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                                {session.chat_session_name || '未命名会话'}
                                            </span>
                                            <span className={`text-xs shrink-0 ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                                                {formatTime(session.prev_message?.timestamp)}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                            {getMessagePreview(session)}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 通知中心 - 底部约1/3 */}
            <NotificationCenter />

            {/* 创建群聊模态框 */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-80 max-h-[70vh] overflow-hidden shadow-xl">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">创建群聊</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">群名称</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="输入群聊名称..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20 focus:border-[#0B4F6C]"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    选择成员 ({selectedMembers.length}人已选)
                                </label>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {friends.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-4">暂无好友</p>
                                    ) : (
                                        friends.map(friend => (
                                            <label
                                                key={friend.user_id}
                                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedMembers.includes(friend.user_id)
                                                    ? 'bg-[#E0F2F7]'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(friend.user_id)}
                                                    onChange={() => toggleMember(friend.user_id)}
                                                    className="w-4 h-4 text-[#0B4F6C] rounded focus:ring-[#0B4F6C]"
                                                />
                                                <Avatar
                                                    src={friend.avatar}
                                                    name={friend.nickname}
                                                    size="sm"
                                                />
                                                <span className="text-sm text-gray-900">{friend.nickname}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleCreateGroup}
                                disabled={creating || !groupName.trim() || selectedMembers.length === 0}
                                className="w-full py-3 bg-[#0B4F6C] text-white rounded-xl font-medium hover:bg-[#0a4560] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creating ? '创建中...' : '创建群聊'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

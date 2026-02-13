/**
 * 好友信息弹窗组件
 * 显示好友详细信息，支持发起聊天和删除好友
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { removeFriend } from '../api/friendApi';
import Avatar from './Avatar';

export default function FriendInfoModal({ friend, onClose, onStartChat }) {
    const { sessionId, user } = useAuth();
    const { loadFriends, sessions, selectSession } = useChat();
    const [removing, setRemoving] = useState(false);
    const [error, setError] = useState('');

    if (!friend) return null;

    // 发起聊天
    const handleStartChat = () => {
        const existingSession = sessions.find(
            s => s.single_chat_friend_id === friend.user_id
        );

        if (existingSession) {
            selectSession(existingSession.chat_session_id);
            onStartChat?.();
        }
        onClose();
    };

    // 删除好友
    const handleRemoveFriend = async () => {
        if (!confirm('确定要删除该好友吗？')) return;

        setRemoving(true);
        setError('');

        try {
            const res = await removeFriend(sessionId, user.user_id, friend.user_id);
            if (res.success) {
                await loadFriends();
                onClose();
            } else {
                setError(res.errmsg || '删除失败');
            }
        } catch (err) {
            setError('删除失败: ' + err.message);
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
                className="bg-[var(--color-surface-elevated)] rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
            >
                {/* 头部背景 */}
                <div className="h-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] relative">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1 text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 头像 */}
                <div className="relative -mt-10 flex justify-center">
                    <Avatar
                        src={friend.avatar}
                        name={friend.nickname}
                        size="xl"
                        className="border-4 border-[var(--color-surface-elevated)] shadow-lg"
                    />
                </div>

                {/* 内容 */}
                <div className="p-5 text-center">
                    {error && (
                        <div className="mb-3 p-2 bg-red-500/10 text-red-500 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <h2 className="text-lg font-bold text-[var(--color-text)] mb-1">{friend.nickname || '用户'}</h2>
                    <p className="text-[var(--color-text-secondary)] text-sm mb-4">{friend.description || '暂无签名'}</p>

                    <div className="bg-[var(--color-surface)] rounded-xl p-3 mb-4 text-left">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-[var(--color-text-muted)]">ID:</span>
                            <span className="text-[var(--color-text-secondary)] font-mono text-xs">{friend.user_id}</span>
                        </div>
                        {friend.phone && (
                            <div className="flex items-center gap-2 text-sm mt-1">
                                <span className="text-[var(--color-text-muted)]">手机:</span>
                                <span className="text-[var(--color-text-secondary)]">{friend.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <motion.button
                            onClick={handleStartChat}
                            className="flex-1 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            发消息
                        </motion.button>
                        <motion.button
                            onClick={handleRemoveFriend}
                            disabled={removing}
                            className="px-4 py-2.5 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {removing ? '...' : '删除'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

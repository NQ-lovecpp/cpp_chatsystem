/**
 * 会话信息弹窗组件
 * 显示会话详情和成员列表
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { getChatSessionMember } from '../api/sessionApi';

export default function SessionInfoModal({ session, onClose }) {
    const { sessionId, user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const isGroupChat = !session?.single_chat_friend_id;

    useEffect(() => {
        if (isGroupChat && session?.chat_session_id) {
            loadMembers();
        } else {
            setLoading(false);
        }
    }, [session]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const result = await getChatSessionMember(
                sessionId,
                user?.user_id,
                session.chat_session_id
            );
            if (result.success && result.member_info_list) {
                setMembers(result.member_info_list);
            }
        } catch (error) {
            console.error('加载成员失败:', error);
        }
        setLoading(false);
    };

    if (!session) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
                className="bg-[var(--color-surface-elevated)] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[80vh] flex flex-col"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* 头部 */}
                <div className="h-16 px-5 flex items-center justify-between border-b border-[var(--color-border)] shrink-0">
                    <h2 className="font-semibold text-[var(--color-text)]">会话信息</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 内容 */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* 会话名称 */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white text-2xl font-bold">
                            {isGroupChat ? (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            ) : (
                                session.chat_session_name?.charAt(0)?.toUpperCase() || 'U'
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-[var(--color-text)]">
                            {session.chat_session_name || '未命名会话'}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            {isGroupChat ? '群聊' : '单聊'}
                        </p>
                    </div>

                    {/* 群成员列表 */}
                    {isGroupChat && (
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
                                群成员 {members.length > 0 ? `(${members.length})` : ''}
                            </p>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <motion.div 
                                        className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
                                    暂无成员信息
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {members.map((member) => (
                                        <div
                                            key={member.user_id}
                                            className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-xl"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white font-medium">
                                                {member.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-[var(--color-text)]">
                                                    {member.nickname}
                                                    {member.user_id === user?.user_id && (
                                                        <span className="ml-2 text-xs text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2 py-0.5 rounded">
                                                            我
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-[var(--color-text-secondary)] truncate">
                                                    {member.description || '暂无签名'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 单聊信息 */}
                    {!isGroupChat && (
                        <div className="bg-[var(--color-surface)] rounded-xl p-4">
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                这是与 <span className="font-medium text-[var(--color-text)]">{session.chat_session_name}</span> 的私聊会话
                            </p>
                        </div>
                    )}
                </div>

                {/* 底部按钮 */}
                <div className="p-4 border-t border-[var(--color-border)] shrink-0">
                    <motion.button
                        onClick={onClose}
                        className="w-full py-2.5 bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl hover:bg-[var(--color-border)] transition-colors font-medium"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        关闭
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

/**
 * 用户信息卡片组件
 * 点击头像时以模态框形式居中显示
 */

import { motion } from 'motion/react';
import Avatar from './Avatar';

export default function UserInfoCard({ user, onClose, onSendMessage, onViewProfile }) {
    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                className="bg-[var(--color-surface-elevated)] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 头部背景 + 头像 */}
                <div className="relative">
                    <div className="h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
                        <div className="absolute inset-0 bg-black/10" />
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors z-10"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex justify-center -mt-10 relative z-10">
                        <div className="relative">
                            <Avatar
                                src={user.avatar}
                                name={user.nickname}
                                size="2xl"
                                className="border-4 border-[var(--color-surface-elevated)] shadow-lg"
                            />
                            <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--color-surface-elevated)]" />
                        </div>
                    </div>
                </div>

                {/* 用户信息 */}
                <div className="px-6 pt-3 pb-5">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-[var(--color-text)] mb-0.5">
                            {user.nickname || '未命名用户'}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            ID: {user.user_id || '-'}
                        </p>
                    </div>

                    {user.description && (
                        <div className="mb-4 p-3 bg-[var(--color-surface)] rounded-xl">
                            <p className="text-sm text-[var(--color-text-secondary)] text-center italic">
                                "{user.description}"
                            </p>
                        </div>
                    )}

                    {/* 详细信息 */}
                    {(user.phone || user.email) && (
                        <div className="space-y-1.5 mb-4">
                            {user.phone && (
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
                                    <svg className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-sm text-[var(--color-text-secondary)]">{user.phone}</span>
                                </div>
                            )}
                            {user.email && (
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
                                    <svg className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm text-[var(--color-text-secondary)]">{user.email}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="grid grid-cols-2 gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onSendMessage}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>发消息</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onViewProfile}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl text-sm font-medium hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>详细资料</span>
                        </motion.button>
                    </div>

                    {/* 更多操作 */}
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:bg-red-500/10 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <span>屏蔽此用户</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

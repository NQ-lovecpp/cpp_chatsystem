/**
 * 用户信息卡片组件
 * 点击头像时弹出，显示用户详细信息和操作选项
 */

// import { motion, AnimatePresence } from 'motion/react';
import Avatar from './Avatar';
// import { cn } from '../lib/utils';

export default function UserInfoCard({ user, onClose, position = { x: 0, y: 0 }, onSendMessage, onViewProfile }) {
    if (!user) return null;

    // 根据位置调整卡片显示位置
    const cardStyle = {
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, 10px)', // 居中并向下偏移
    };

    return (
        <>
            {/* 遮罩层 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* 信息卡片 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={cardStyle}
                className="z-50 w-80 bg-[var(--color-surface-elevated)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--color-border)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 头部背景 */}
                <div className="h-24 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] relative">
                    <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* 用户信息区 */}
                <div className="px-5 pb-5">
                    {/* 头像 */}
                    <div className="flex justify-center -mt-12 mb-3">
                        <div className="relative">
                            <Avatar
                                src={user.avatar}
                                name={user.nickname}
                                size="2xl"
                                className="border-4 border-[var(--color-surface-elevated)] shadow-lg"
                            />
                            {/* 在线状态指示器 */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[var(--color-surface-elevated)]"
                            />
                        </div>
                    </div>

                    {/* 用户名和ID */}
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">
                            {user.nickname || '未命名用户'}
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            ID: {user.user_id || '-'}
                        </p>
                    </div>

                    {/* 签名 */}
                    {user.description && (
                        <div className="mb-4 p-3 bg-[var(--color-surface)] rounded-xl">
                            <p className="text-sm text-[var(--color-text-secondary)] text-center">
                                "{user.description}"
                            </p>
                        </div>
                    )}

                    {/* 详细信息 */}
                    <div className="space-y-2 mb-4">
                        {user.phone && (
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
                                <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-sm text-[var(--color-text-secondary)]">{user.phone}</span>
                            </div>
                        )}
                        {user.email && (
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
                                <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-[var(--color-text-secondary)]">{user.email}</span>
                            </div>
                        )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="grid grid-cols-2 gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onSendMessage}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
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
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl font-medium hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] transition-colors"
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
        </>
    );
}

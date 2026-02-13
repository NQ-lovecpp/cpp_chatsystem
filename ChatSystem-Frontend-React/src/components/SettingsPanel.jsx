/**
 * 设置面板组件
 * 支持主题设置、服务器配置等
 * 响应式：大屏右侧展开详情，小屏弹窗
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import ServerConfig from './ServerConfig';
import ThemeSettings from './ThemeSettings';
import Avatar from './Avatar';
import { cn } from '../lib/utils';

export default function SettingsPanel() {
    const { user, logout } = useAuth();
    const [showServerConfig, setShowServerConfig] = useState(false);
    const [activeSection, setActiveSection] = useState(null); // 'theme', 'server', 'notification', 'profile'
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    // 监听屏幕宽度
    useEffect(() => {
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= 1280); // xl breakpoint
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // 处理设置项点击
    const handleSectionClick = (section) => {
        if (section === 'server') {
            // 服务器配置始终使用弹窗（需要刷新页面）
            setShowServerConfig(true);
        } else if (section === 'logout') {
            logout();
        } else {
            setActiveSection(activeSection === section ? null : section);
        }
    };

    const SettingItem = ({ icon, label, onClick, variant = 'default', active = false, hasDetail = false }) => (
        <motion.button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left',
                variant === 'danger' 
                    ? 'text-red-500 hover:bg-red-500/10'
                    : active
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
            )}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
        >
            <span className={cn(
                variant === 'danger' ? '' : active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
            )}>
                {icon}
            </span>
            <span className="flex-1">{label}</span>
            {hasDetail && (
                <svg className={cn(
                    "w-4 h-4 transition-transform",
                    active ? "rotate-90 text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            )}
        </motion.button>
    );

    // 渲染详情面板内容
    const renderDetailContent = () => {
        switch (activeSection) {
            case 'theme':
                return <ThemeSettings />;
            case 'notification':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[var(--color-text)]">通知设置</h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-xl">
                                <span className="text-[var(--color-text)]">消息通知</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-[var(--color-primary)]" />
                            </label>
                            <label className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-xl">
                                <span className="text-[var(--color-text)]">声音提醒</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-[var(--color-primary)]" />
                            </label>
                            <label className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-xl">
                                <span className="text-[var(--color-text)]">桌面通知</span>
                                <input type="checkbox" className="w-5 h-5 accent-[var(--color-primary)]" />
                            </label>
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[var(--color-text)]">个人资料</h3>
                        <div className="flex flex-col items-center py-4">
                            <Avatar src={user?.avatar} name={user?.nickname} size="2xl" />
                            <p className="mt-3 text-lg font-semibold text-[var(--color-text)]">{user?.nickname || '用户'}</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">{user?.description || '暂无签名'}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="p-3 bg-[var(--color-surface)] rounded-xl">
                                <p className="text-xs text-[var(--color-text-muted)]">用户ID</p>
                                <p className="text-sm text-[var(--color-text)] font-mono">{user?.user_id || '-'}</p>
                            </div>
                            {user?.phone && (
                                <div className="p-3 bg-[var(--color-surface)] rounded-xl">
                                    <p className="text-xs text-[var(--color-text-muted)]">手机号</p>
                                    <p className="text-sm text-[var(--color-text)]">{user.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // 小屏幕时的弹窗
    const renderMobileModal = () => {
        if (isLargeScreen || !activeSection) return null;

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[var(--color-surface-elevated)] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl"
                >
                    <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[var(--color-text)]">
                            {activeSection === 'theme' && '主题设置'}
                            {activeSection === 'notification' && '通知设置'}
                            {activeSection === 'profile' && '个人资料'}
                        </h2>
                        <button
                            onClick={() => setActiveSection(null)}
                            className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface)]"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-5 overflow-y-auto max-h-[60vh]">
                        {renderDetailContent()}
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="flex h-full">
            {/* 左侧设置列表 */}
            <div className={cn(
                "flex flex-col h-full",
                isLargeScreen && activeSection ? "w-72 border-r border-[var(--color-border)]" : "flex-1"
            )}>
                {/* 头部 */}
                <div className="px-5 pt-6 pb-4 shrink-0">
                    <h1 className="text-xl font-bold text-[var(--color-text)]">设置</h1>
                </div>

                {/* 设置列表 */}
                <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-4">
                    {/* 用户信息卡片 */}
                    <motion.div 
                        className={cn(
                            "p-4 rounded-xl border cursor-pointer transition-colors",
                            activeSection === 'profile' 
                                ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20"
                                : "bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]"
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleSectionClick('profile')}
                    >
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={user?.avatar}
                                name={user?.nickname}
                                size="lg"
                                rounded="xl"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[var(--color-text)] truncate">
                                    {user?.nickname || '用户'}
                                </p>
                                <p className="text-sm text-[var(--color-text-secondary)] truncate">
                                    {user?.description || '暂无签名'}
                                </p>
                            </div>
                            <svg className={cn(
                                "w-4 h-4 shrink-0 transition-transform",
                                activeSection === 'profile' ? "rotate-90 text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                            )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </motion.div>

                    {/* 应用设置 */}
                    <div className="space-y-1">
                        <p className="px-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 mt-4">
                            应用设置
                        </p>

                        <SettingItem
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>}
                            label="主题设置"
                            onClick={() => handleSectionClick('theme')}
                            active={activeSection === 'theme'}
                            hasDetail
                        />

                        <SettingItem
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>}
                            label="服务器配置"
                            onClick={() => handleSectionClick('server')}
                        />

                        <SettingItem
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>}
                            label="通知设置"
                            onClick={() => handleSectionClick('notification')}
                            active={activeSection === 'notification'}
                            hasDetail
                        />
                    </div>

                    {/* 退出登录 */}
                    <div className="pt-4 border-t border-[var(--color-border)] mt-4">
                        <SettingItem
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>}
                            label="退出登录"
                            onClick={() => handleSectionClick('logout')}
                            variant="danger"
                        />
                    </div>
                </div>
            </div>

            {/* 右侧详情面板 - 仅大屏显示 */}
            <AnimatePresence>
                {isLargeScreen && activeSection && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '100%' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full flex-1 overflow-hidden"
                    >
                        <div className="h-full w-full p-5 overflow-y-auto bg-[var(--color-surface)]">
                            {renderDetailContent()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 服务器配置模态框 */}
            {showServerConfig && <ServerConfig onClose={() => setShowServerConfig(false)} />}

            {/* 小屏幕时的弹窗 */}
            <AnimatePresence>
                {renderMobileModal()}
            </AnimatePresence>
        </div>
    );
}

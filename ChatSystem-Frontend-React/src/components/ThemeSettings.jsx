/**
 * 主题设置组件
 * 支持亮/暗模式切换和主题色选择
 */

import { motion } from 'motion/react';
import { useTheme, THEME_COLORS } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

export default function ThemeSettings() {
    const { mode, setMode, isDark, colorName, setThemeColor } = useTheme();

    const modeOptions = [
        { value: 'light', label: '浅色', icon: SunIcon },
        { value: 'dark', label: '深色', icon: MoonIcon },
        { value: 'system', label: '跟随系统', icon: MonitorIcon },
    ];

    return (
        <div className="space-y-6">
            {/* 主题模式 */}
            <div>
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">外观模式</h3>
                <div className="grid grid-cols-3 gap-2">
                    {modeOptions.map((option) => {
                        const isActive = mode === option.value;
                        const Icon = option.icon;
                        return (
                            <motion.button
                                key={option.value}
                                onClick={() => setMode(option.value)}
                                className={cn(
                                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors',
                                    isActive
                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon className={cn(
                                    'w-6 h-6',
                                    isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                                )} />
                                <span className={cn(
                                    'text-xs font-medium',
                                    isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                                )}>
                                    {option.label}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* 主题色 */}
            <div>
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">主题色</h3>
                <div className="grid grid-cols-3 gap-3">
                    {Object.entries(THEME_COLORS).map(([key, color]) => {
                        const isActive = colorName === key;
                        const hslColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
                        return (
                            <motion.button
                                key={key}
                                onClick={() => setThemeColor(key)}
                                className={cn(
                                    'relative flex items-center gap-2 p-2.5 rounded-xl border-2 transition-colors',
                                    isActive
                                        ? 'border-[var(--color-primary)]'
                                        : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span
                                    className="w-5 h-5 rounded-full shrink-0"
                                    style={{ backgroundColor: hslColor }}
                                />
                                <span className="text-xs font-medium text-[var(--color-text)] truncate">
                                    {color.name}
                                </span>
                                {isActive && (
                                    <motion.span
                                        layoutId="theme-check"
                                        className="absolute right-2 text-[var(--color-primary)]"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </motion.span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* 预览 */}
            <div>
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">预览</h3>
                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-medium">
                            U
                        </div>
                        <div>
                            <p className="font-medium text-[var(--color-text)]">用户名</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">在线</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-start">
                            <div className="px-4 py-2 rounded-2xl rounded-bl-md bg-[var(--color-surface-elevated)] text-[var(--color-text)] text-sm">
                                你好！
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="px-4 py-2 rounded-2xl rounded-br-md bg-[var(--color-primary)] text-white text-sm">
                                你好，很高兴认识你！
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 图标组件
function SunIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

function MoonIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    );
}

function MonitorIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

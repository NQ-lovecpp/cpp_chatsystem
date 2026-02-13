/**
 * Badge 组件 - shadcn/ui 风格
 * 支持多种变体和动画
 */

import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const variants = {
    default: 'bg-[var(--color-primary)] text-white',
    secondary: 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    outline: 'border border-[var(--color-border)] text-[var(--color-text)]',
};

const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
};

const Badge = forwardRef(({
    className,
    variant = 'default',
    size = 'md',
    dot = false,
    pulse = false,
    children,
    ...props
}, ref) => {
    return (
        <span
            ref={ref}
            className={cn(
                'inline-flex items-center gap-1 font-medium rounded-full',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span className="relative flex h-2 w-2">
                    {pulse && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-40" />
                    )}
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                </span>
            )}
            {children}
        </span>
    );
});

Badge.displayName = 'Badge';

// 未读数量徽章
const CountBadge = forwardRef(({
    count,
    max = 99,
    showZero = false,
    className,
    ...props
}, ref) => {
    if (!showZero && (!count || count <= 0)) return null;
    
    const displayCount = count > max ? `${max}+` : count;
    
    return (
        <motion.span
            ref={ref}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
                'min-w-[18px] h-[18px] px-1.5 inline-flex items-center justify-center',
                'text-[10px] font-bold rounded-full',
                'bg-[var(--color-error)] text-white',
                className
            )}
            {...props}
        >
            {displayCount}
        </motion.span>
    );
});

CountBadge.displayName = 'CountBadge';

export { Badge, CountBadge };
export default Badge;

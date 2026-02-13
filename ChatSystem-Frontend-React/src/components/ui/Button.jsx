/**
 * Button 组件 - shadcn/ui 风格
 * 支持多种变体、尺寸和动画效果
 */

import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const variants = {
    default: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm',
    secondary: 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-border)] border border-[var(--color-border)]',
    outline: 'border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-surface)] text-[var(--color-text)]',
    ghost: 'hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]',
    link: 'text-[var(--color-primary)] underline-offset-4 hover:underline',
    destructive: 'bg-[var(--color-error)] text-white hover:bg-red-600',
    success: 'bg-[var(--color-success)] text-white hover:bg-emerald-600',
};

const sizes = {
    sm: 'h-8 px-3 text-xs rounded-md',
    md: 'h-10 px-4 text-sm rounded-lg',
    lg: 'h-12 px-6 text-base rounded-xl',
    icon: 'h-10 w-10 rounded-lg',
    'icon-sm': 'h-8 w-8 rounded-md',
    'icon-lg': 'h-12 w-12 rounded-xl',
};

const Button = forwardRef(({
    className,
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    children,
    asChild = false,
    animate = true,
    ...props
}, ref) => {
    const Comp = animate ? motion.button : 'button';
    
    const motionProps = animate ? {
        whileHover: disabled ? {} : { scale: 1.02 },
        whileTap: disabled ? {} : { scale: 0.98 },
        transition: { type: 'spring', stiffness: 400, damping: 17 }
    } : {};

    return (
        <Comp
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center gap-2 font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || loading}
            {...motionProps}
            {...props}
        >
            {loading ? (
                <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>加载中...</span>
                </>
            ) : children}
        </Comp>
    );
});

Button.displayName = 'Button';

export { Button };
export default Button;

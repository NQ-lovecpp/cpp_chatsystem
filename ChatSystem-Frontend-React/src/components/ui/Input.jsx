/**
 * Input 组件 - shadcn/ui 风格
 * 支持多种变体和动画效果
 */

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({
    className,
    type = 'text',
    error,
    label,
    hint,
    leftIcon,
    rightIcon,
    ...props
}, ref) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                        {leftIcon}
                    </div>
                )}
                <motion.input
                    ref={ref}
                    type={type}
                    className={cn(
                        'w-full px-4 py-2.5 rounded-xl text-sm',
                        'bg-[var(--color-surface)] border border-[var(--color-border)]',
                        'text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]/20 focus:border-[var(--color-error)]',
                        leftIcon && 'pl-10',
                        rightIcon && 'pr-10',
                        className
                    )}
                    onFocus={(e) => {
                        setFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        props.onBlur?.(e);
                    }}
                    animate={{
                        boxShadow: focused 
                            ? '0 0 0 4px color-mix(in srgb, var(--color-primary) 10%, transparent)'
                            : '0 0 0 0px transparent'
                    }}
                    transition={{ duration: 0.15 }}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                        {rightIcon}
                    </div>
                )}
            </div>
            <AnimatePresence>
                {(error || hint) && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={cn(
                            'text-xs mt-1.5',
                            error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-muted)]'
                        )}
                    >
                        {error || hint}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
});

Input.displayName = 'Input';

export { Input };
export default Input;

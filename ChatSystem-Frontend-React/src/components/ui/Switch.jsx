/**
 * Switch 组件 - shadcn/ui 风格
 * 带平滑动画的切换开关
 */

import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const Switch = forwardRef(({
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    label,
    className,
    ...props
}, ref) => {
    const sizes = {
        sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 16 },
        md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 },
        lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 28 },
    };

    const currentSize = sizes[size];

    const handleClick = () => {
        if (!disabled) {
            onChange?.(!checked);
        }
    };

    return (
        <label
            className={cn(
                'inline-flex items-center gap-3 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <button
                ref={ref}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    'relative inline-flex shrink-0 rounded-full',
                    'transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
                    currentSize.track,
                    checked 
                        ? 'bg-[var(--color-primary)]' 
                        : 'bg-[var(--color-border)]'
                )}
                {...props}
            >
                <motion.span
                    className={cn(
                        'absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm',
                        currentSize.thumb
                    )}
                    animate={{
                        x: checked ? currentSize.translate : 0,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
                />
            </button>
            {label && (
                <span className="text-sm text-[var(--color-text)]">{label}</span>
            )}
        </label>
    );
});

Switch.displayName = 'Switch';

export { Switch };
export default Switch;

/**
 * Card 组件 - shadcn/ui 风格
 * 支持多种变体和悬浮动画
 */

import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const Card = forwardRef(({
    className,
    variant = 'default',
    hover = false,
    animate = true,
    children,
    ...props
}, ref) => {
    const Comp = animate ? motion.div : 'div';
    
    const variants = {
        default: 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]',
        ghost: 'bg-transparent',
        glass: 'glass border border-[var(--color-border-light)]',
    };
    
    const motionProps = animate && hover ? {
        whileHover: { 
            y: -2,
            boxShadow: 'var(--shadow-lg)',
        },
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    } : {};

    return (
        <Comp
            ref={ref}
            className={cn(
                'rounded-2xl shadow-sm',
                variants[variant],
                hover && 'cursor-pointer',
                className
            )}
            {...motionProps}
            {...props}
        >
            {children}
        </Comp>
    );
});

Card.displayName = 'Card';

const CardHeader = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('p-6 pb-4', className)}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn('text-lg font-semibold text-[var(--color-text)]', className)}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-[var(--color-text-secondary)] mt-1', className)}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('p-6 pt-0', className)}
        {...props}
    />
));
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('p-6 pt-0 flex items-center gap-2', className)}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;

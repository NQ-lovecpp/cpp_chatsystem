/**
 * 通用头像组件
 * 优先显示图片头像，失败回退到首字母
 * 支持动画效果
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// DiceBear 默认头像（使用 notionists 风格）
const DEFAULT_AVATARS = [
    'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=c0aede',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka&backgroundColor=b6e3f4',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Milo&backgroundColor=d1d4f9',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Luna&backgroundColor=ffd5dc',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Leo&backgroundColor=c0f0e8',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Maya&backgroundColor=ffe0b2',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Oscar&backgroundColor=e8d5b7',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Zoe&backgroundColor=fbc4ab',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Kai&backgroundColor=a8d8ea',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Ivy&backgroundColor=cce2cb',
];

export { DEFAULT_AVATARS };

const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
    '2xl': 'w-24 h-24 text-3xl',
};

export default function Avatar({ 
    src,
    name,
    size = 'md',
    className = '',
    rounded = 'full',
    onClick,
    showStatus = false,
    status = 'offline', // online | offline | busy | away
    animate = true,
}) {
    const [imgError, setImgError] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const roundedClass = rounded === 'full' ? 'rounded-full' : `rounded-${rounded}`;
    const initial = name?.charAt(0)?.toUpperCase() || 'U';
    const showImage = src && !imgError;

    const statusColors = {
        online: 'bg-emerald-500',
        offline: 'bg-gray-400',
        busy: 'bg-red-500',
        away: 'bg-amber-500',
    };

    const Wrapper = animate && onClick ? motion.div : 'div';
    const wrapperProps = animate && onClick ? {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 17 }
    } : {};

    return (
        <Wrapper
            className={cn(
                sizeClass,
                roundedClass,
                'relative flex items-center justify-center font-medium shrink-0 overflow-hidden',
                showImage ? '' : 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
            {...wrapperProps}
        >
            <AnimatePresence mode="wait">
                {showImage ? (
                    <motion.img
                        key="avatar-img"
                        src={src}
                        alt={name || '头像'}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                        onLoad={() => setImgLoaded(true)}
                        initial={animate ? { opacity: 0, scale: 1.1 } : false}
                        animate={{ opacity: imgLoaded ? 1 : 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    />
                ) : (
                    <motion.span
                        key="avatar-initial"
                        initial={animate ? { opacity: 0, scale: 0.5 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        {initial}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* 在线状态指示器 */}
            {showStatus && (
                <motion.span
                    className={cn(
                        'absolute bottom-0 right-0 rounded-full border-2 border-[var(--color-background)]',
                        statusColors[status],
                        size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                />
            )}
        </Wrapper>
    );
}

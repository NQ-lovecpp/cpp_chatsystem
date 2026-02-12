/**
 * 通用头像组件
 * 优先显示图片头像，失败回退到首字母
 */

import { useState } from 'react';

// DiceBear 默认头像（使用 notionists 风格）
// 预生成 10 个确定性的头像 URL
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
    src,           // 头像图片 src (data URL 或普通 URL)
    name,          // 用于生成首字母的名字
    size = 'md',   // xs | sm | md | lg | xl | 2xl
    className = '',
    rounded = 'full',  // 'full' | 'xl' | 'lg'
    onClick,
}) {
    const [imgError, setImgError] = useState(false);
    
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const roundedClass = rounded === 'full' ? 'rounded-full' : `rounded-${rounded}`;
    const initial = name?.charAt(0)?.toUpperCase() || 'U';
    
    const showImage = src && !imgError;

    return (
        <div
            className={`
                ${sizeClass} ${roundedClass} 
                flex items-center justify-center font-medium shrink-0 overflow-hidden
                ${showImage ? '' : 'bg-gradient-to-br from-[#0B4F6C] to-[#0a4560] text-white'}
                ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {showImage ? (
                <img
                    src={src}
                    alt={name || '头像'}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                initial
            )}
        </div>
    );
}

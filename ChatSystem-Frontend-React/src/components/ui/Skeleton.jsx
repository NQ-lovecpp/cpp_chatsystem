/**
 * Skeleton 组件 - shadcn/ui 风格
 * 加载占位符动画
 */

import { cn } from '../../lib/utils';

function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-[var(--color-border)]',
                className
            )}
            {...props}
        />
    );
}

// 消息骨架屏
function MessageSkeleton({ isMe = false }) {
    return (
        <div className={cn('flex items-end gap-3', isMe && 'flex-row-reverse')}>
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className={cn('max-w-[60%] space-y-2', isMe && 'items-end')}>
                {!isMe && <Skeleton className="w-16 h-3" />}
                <Skeleton className={cn(
                    'h-10 rounded-2xl',
                    isMe ? 'w-36 rounded-br-md' : 'w-48 rounded-bl-md'
                )} />
                <Skeleton className="w-12 h-3" />
            </div>
        </div>
    );
}

// 会话列表骨架屏
function SessionSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-10 h-3" />
                </div>
                <Skeleton className="w-full h-3" />
            </div>
        </div>
    );
}

// 头像骨架屏
function AvatarSkeleton({ size = 'md' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };
    return <Skeleton className={cn('rounded-full', sizes[size])} />;
}

export { Skeleton, MessageSkeleton, SessionSkeleton, AvatarSkeleton };
export default Skeleton;

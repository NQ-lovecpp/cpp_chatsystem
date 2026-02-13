'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * 呼吸/脉冲效果的 Skeleton
 */
export function PulseSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      <Skeleton className="w-full h-full" />
    </motion.div>
  );
}

/**
 * 扫光效果的 Skeleton
 */
export function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-zinc-100', className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

/**
 * 函数调用加载骨架屏
 */
export function FunctionCallSkeleton() {
  return (
    <div className="flex flex-col w-[70%] relative mb-[8px] space-y-3">
      <div className="flex items-center gap-2">
        <ShimmerSkeleton className="w-5 h-5 rounded-full" />
        <ShimmerSkeleton className="w-32 h-4" />
      </div>
      <div className="bg-zinc-50 rounded-xl p-4 ml-4 space-y-2">
        <ShimmerSkeleton className="w-full h-3" />
        <ShimmerSkeleton className="w-3/4 h-3" />
        <ShimmerSkeleton className="w-1/2 h-3" />
      </div>
    </div>
  );
}

/**
 * 消息加载骨架屏
 */
export function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'rounded-2xl p-4 space-y-2',
          isUser ? 'bg-zinc-100 max-w-[70%]' : 'bg-white max-w-[80%]'
        )}
      >
        <ShimmerSkeleton className="w-48 h-4" />
        <ShimmerSkeleton className="w-36 h-4" />
        {!isUser && <ShimmerSkeleton className="w-56 h-4" />}
      </div>
    </div>
  );
}

/**
 * 思考中的动画点
 */
export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-2 px-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * 工具执行中的状态指示器
 */
type ToolStatusProps = {
  status: 'running' | 'completed' | 'error';
  toolName: string;
};

export function ToolStatusIndicator({ status, toolName }: ToolStatusProps) {
  const statusConfig = {
    running: {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      label: 'Running...',
    },
    completed: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      label: 'Completed',
    },
    error: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
      label: 'Error',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border',
        config.bgColor,
        config.textColor,
        config.borderColor
      )}
    >
      {status === 'running' && (
        <motion.span
          className="w-2 h-2 bg-current rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      <span>{config.label}</span>
    </div>
  );
}

/**
 * 打字机效果 Hook
 */
export function useTypewriter(text: string, speed: number = 30) {
  const [displayedText, setDisplayedText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isComplete };
}

/**
 * 渐入动画包装器
 */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

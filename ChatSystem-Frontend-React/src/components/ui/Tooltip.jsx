/**
 * Tooltip 组件 - shadcn/ui 风格
 * 带动画的工具提示
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

function Tooltip({
    children,
    content,
    side = 'top',
    align = 'center',
    delay = 200,
    className,
}) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => setOpen(true), delay);
    };

    const handleMouseLeave = () => {
        clearTimeout(timeoutRef.current);
        setOpen(false);
    };

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    const positions = {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
        right: 'left-full ml-2',
    };

    const alignments = {
        start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
        center: side === 'top' || side === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
        end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
    };

    const animations = {
        top: { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } },
        bottom: { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } },
        left: { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 } },
        right: { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 } },
    };

    return (
        <div 
            className="relative inline-flex"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <AnimatePresence>
                {open && content && (
                    <motion.div
                        initial={animations[side].initial}
                        animate={animations[side].animate}
                        exit={animations[side].initial}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            'absolute z-50 pointer-events-none',
                            'px-3 py-1.5 text-xs font-medium',
                            'bg-[var(--color-text)] text-[var(--color-background)]',
                            'rounded-lg shadow-lg whitespace-nowrap',
                            positions[side],
                            alignments[align],
                            className
                        )}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export { Tooltip };
export default Tooltip;

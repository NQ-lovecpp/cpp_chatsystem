/**
 * Modal 组件 - shadcn/ui 风格
 * 支持动画入场/退场
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

function Modal({
    open,
    onClose,
    children,
    className,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
}) {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-[90vw] max-h-[90vh]',
    };

    // 键盘事件
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && closeOnEscape) {
            onClose?.();
        }
    }, [closeOnEscape, onClose]);

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, handleKeyDown]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* 遮罩层 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeOnOverlayClick ? onClose : undefined}
                    />
                    
                    {/* 内容 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ 
                            type: 'spring',
                            stiffness: 300,
                            damping: 25,
                        }}
                        className={cn(
                            'relative z-10 w-full mx-4',
                            'bg-[var(--color-surface-elevated)] rounded-2xl shadow-xl',
                            'max-h-[85vh] overflow-hidden',
                            sizes[size],
                            className
                        )}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function ModalHeader({ className, children, onClose, ...props }) {
    return (
        <div
            className={cn(
                'px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between',
                className
            )}
            {...props}
        >
            <div className="font-semibold text-lg text-[var(--color-text)]">{children}</div>
            {onClose && (
                <motion.button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </motion.button>
            )}
        </div>
    );
}

function ModalBody({ className, children, ...props }) {
    return (
        <div
            className={cn('p-6 overflow-y-auto', className)}
            {...props}
        >
            {children}
        </div>
    );
}

function ModalFooter({ className, children, ...props }) {
    return (
        <div
            className={cn(
                'px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export { Modal, ModalHeader, ModalBody, ModalFooter };
export default Modal;

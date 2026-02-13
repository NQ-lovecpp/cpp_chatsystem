/**
 * Toast 组件 - shadcn/ui 风格
 * 带动画的轻量级通知
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const ToastContext = createContext(null);

const toastVariants = {
    default: 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)]',
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white',
};

const icons = {
    success: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ title, description, variant = 'default', duration = 4000 }) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, description, variant }]);
        
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
        
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // 便捷方法
    const toast = useCallback((props) => addToast(props), [addToast]);
    toast.success = (title, description) => addToast({ title, description, variant: 'success' });
    toast.error = (title, description) => addToast({ title, description, variant: 'error' });
    toast.warning = (title, description) => addToast({ title, description, variant: 'warning' });
    toast.info = (title, description) => addToast({ title, description, variant: 'info' });

    return (
        <ToastContext.Provider value={{ toast, addToast, removeToast }}>
            {children}
            
            {/* Toast 容器 */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className={cn(
                                'pointer-events-auto min-w-[300px] max-w-[420px]',
                                'px-4 py-3 rounded-xl shadow-lg',
                                'flex items-start gap-3',
                                toastVariants[t.variant]
                            )}
                        >
                            {icons[t.variant] && (
                                <span className="shrink-0 mt-0.5">{icons[t.variant]}</span>
                            )}
                            <div className="flex-1 min-w-0">
                                {t.title && (
                                    <p className="font-medium text-sm">{t.title}</p>
                                )}
                                {t.description && (
                                    <p className={cn(
                                        'text-sm mt-0.5',
                                        t.variant === 'default' ? 'text-[var(--color-text-secondary)]' : 'opacity-90'
                                    )}>
                                        {t.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(t.id)}
                                className={cn(
                                    'shrink-0 p-1 rounded-lg transition-colors',
                                    t.variant === 'default' 
                                        ? 'hover:bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                                        : 'hover:bg-white/20 text-white/80'
                                )}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export { ToastProvider, useToast };
export default ToastProvider;

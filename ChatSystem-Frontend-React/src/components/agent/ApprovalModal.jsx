/**
 * 审批弹窗组件
 * 显示待审批的工具调用，支持批准/拒绝操作
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';

// 工具信息配置
const TOOL_INFO = {
    python_execute: {
        name: 'Python 代码执行',
        description: '此操作将在隔离的 Docker 容器中执行 Python 代码',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
        riskLevel: 'medium',
        tips: [
            '代码将在隔离环境中执行，有资源限制',
            '执行时间限制为 60 秒',
            '内存限制为 512MB',
            '无法访问本地文件系统',
        ],
    },
    default: {
        name: '工具调用',
        description: '此操作需要您的批准才能执行',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        riskLevel: 'low',
        tips: [],
    },
};

// 风险等级配置
const RISK_LEVELS = {
    low: {
        label: '低风险',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
    },
    medium: {
        label: '中等风险',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
    },
    high: {
        label: '高风险',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
    },
};

// 单个审批卡片
function ApprovalCard({ approval, onApprove, onReject, isProcessing }) {
    const [expanded, setExpanded] = useState(true);
    
    const toolInfo = TOOL_INFO[approval.tool_name] || TOOL_INFO.default;
    const riskLevel = RISK_LEVELS[toolInfo.riskLevel];
    
    // 格式化参数显示
    const formatArgs = () => {
        if (approval.tool_name === 'python_execute') {
            const code = approval.tool_args?.code || '';
            return (
                <pre className="text-xs bg-[var(--color-surface)] p-3 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                    <code className="text-[var(--color-text)]">{code}</code>
                </pre>
            );
        }
        return (
            <pre className="text-xs bg-[var(--color-surface)] p-3 rounded-lg overflow-x-auto">
                <code>{JSON.stringify(approval.tool_args, null, 2)}</code>
            </pre>
        );
    };
    
    return (
        <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface-elevated)]">
            {/* 头部 */}
            <div className="p-4 border-b border-[var(--color-border)]">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${riskLevel.bg} flex items-center justify-center ${riskLevel.color}`}>
                            {toolInfo.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--color-text)]">{toolInfo.name}</h3>
                            <p className="text-sm text-[var(--color-text-muted)]">{toolInfo.description}</p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${riskLevel.bg} ${riskLevel.color}`}>
                        {riskLevel.label}
                    </span>
                </div>
            </div>
            
            {/* 详情 */}
            <div className="p-4">
                {/* 原因说明 */}
                {approval.reason && (
                    <div className="mb-4">
                        <div className="text-sm font-medium text-[var(--color-text-muted)] mb-2">审批原因</div>
                        <p className="text-sm text-[var(--color-text)]">{approval.reason}</p>
                    </div>
                )}
                
                {/* 参数详情 */}
                <div className="mb-4">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    >
                        <motion.svg 
                            className="w-4 h-4"
                            animate={{ rotate: expanded ? 90 : 0 }}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                        参数详情
                    </button>
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-2 overflow-hidden"
                            >
                                {formatArgs()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* 提示信息 */}
                {toolInfo.tips.length > 0 && (
                    <div className="mb-4 p-3 bg-[var(--color-surface)] rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] mb-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            安全提示
                        </div>
                        <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                            {toolInfo.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-[var(--color-text-muted)]">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* 操作按钮 */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onReject(approval.id)}
                        disabled={isProcessing}
                        className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        拒绝
                    </Button>
                    <Button
                        onClick={() => onApprove(approval.id)}
                        disabled={isProcessing}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                        {isProcessing ? (
                            <motion.div
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                        ) : (
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        批准执行
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function ApprovalModal({ open, approvals = [], onApprove, onReject, onClose }) {
    const [processing, setProcessing] = useState(null);
    
    const handleApprove = async (approvalId) => {
        setProcessing(approvalId);
        try {
            await onApprove(approvalId);
        } finally {
            setProcessing(null);
        }
    };
    
    const handleReject = async (approvalId) => {
        setProcessing(approvalId);
        try {
            await onReject(approvalId);
        } finally {
            setProcessing(null);
        }
    };
    
    if (!approvals.length) return null;
    
    return (
        <Modal open={open} onClose={onClose} size="lg" closeOnOverlayClick={false}>
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <span>需要您的批准</span>
                    {approvals.length > 1 && (
                        <span className="px-2 py-0.5 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
                            {approvals.length} 项
                        </span>
                    )}
                </div>
            </ModalHeader>
            
            <ModalBody className="space-y-4 max-h-[60vh] overflow-y-auto">
                <p className="text-sm text-[var(--color-text-muted)]">
                    AI 助手请求执行以下操作，请审核后决定是否允许。
                </p>
                
                {approvals.map((approval) => (
                    <ApprovalCard
                        key={approval.id}
                        approval={approval}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        isProcessing={processing === approval.id}
                    />
                ))}
            </ModalBody>
            
            {approvals.length > 1 && (
                <ModalFooter>
                    <Button
                        variant="outline"
                        onClick={() => approvals.forEach(a => handleReject(a.id))}
                        disabled={processing !== null}
                        className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                    >
                        全部拒绝
                    </Button>
                    <Button
                        onClick={() => approvals.forEach(a => handleApprove(a.id))}
                        disabled={processing !== null}
                        className="bg-green-500 hover:bg-green-600"
                    >
                        全部批准
                    </Button>
                </ModalFooter>
            )}
        </Modal>
    );
}

/**
 * 服务器配置模态框
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { getServerConfig, saveServerConfig } from '../api/config';

export default function ServerConfig({ onClose }) {
    const [config, setConfig] = useState(getServerConfig());

    const handleSave = () => {
        saveServerConfig(config);
        onClose();
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                className="bg-[var(--color-surface-elevated)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* 头部 */}
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[var(--color-text)]">服务器配置</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 内容 */}
                <div className="p-6 space-y-5">
                    {/* HTTP 配置 */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-[var(--color-text)]">HTTP 接口</h3>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">主机地址</label>
                                <input
                                    type="text"
                                    value={config.httpHost}
                                    onChange={(e) => setConfig({ ...config, httpHost: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none text-sm"
                                    placeholder="localhost"
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">端口</label>
                                <input
                                    type="number"
                                    value={config.httpPort}
                                    onChange={(e) => setConfig({ ...config, httpPort: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none text-sm"
                                    placeholder="8080"
                                />
                            </div>
                        </div>
                    </div>

                    {/* WebSocket 配置 */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-[var(--color-text)]">WebSocket 接口</h3>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">主机地址</label>
                                <input
                                    type="text"
                                    value={config.wsHost}
                                    onChange={(e) => setConfig({ ...config, wsHost: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none text-sm"
                                    placeholder="localhost"
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">端口</label>
                                <input
                                    type="number"
                                    value={config.wsPort}
                                    onChange={(e) => setConfig({ ...config, wsPort: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none text-sm"
                                    placeholder="8081"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 提示 */}
                    <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)] text-xs">
                        <p>💡 修改配置后需要重新登录才能生效</p>
                    </div>
                </div>

                {/* 底部按钮 */}
                <div className="px-6 py-4 bg-[var(--color-surface)] flex gap-3 justify-end">
                    <motion.button
                        onClick={onClose}
                        className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] rounded-lg transition-colors text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        取消
                    </motion.button>
                    <motion.button
                        onClick={handleSave}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors text-sm font-medium shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        保存并刷新
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

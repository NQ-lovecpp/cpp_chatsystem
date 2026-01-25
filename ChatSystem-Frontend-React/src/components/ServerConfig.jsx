/**
 * 服务器配置模态框
 */

import { useState } from 'react';
import { getServerConfig, saveServerConfig } from '../api/config';

export default function ServerConfig({ onClose }) {
    const [config, setConfig] = useState(getServerConfig());

    const handleSave = () => {
        saveServerConfig(config);
        onClose();
        // 刷新页面以应用新配置
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* 头部 */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">服务器配置</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 内容 */}
                <div className="p-6 space-y-5">
                    {/* HTTP 配置 */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">HTTP 接口</h3>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">主机地址</label>
                                <input
                                    type="text"
                                    value={config.httpHost}
                                    onChange={(e) => setConfig({ ...config, httpHost: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0B4F6C] focus:ring-2 focus:ring-[#0B4F6C]/20 transition-all outline-none text-sm"
                                    placeholder="localhost"
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs text-gray-500 mb-1">端口</label>
                                <input
                                    type="number"
                                    value={config.httpPort}
                                    onChange={(e) => setConfig({ ...config, httpPort: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0B4F6C] focus:ring-2 focus:ring-[#0B4F6C]/20 transition-all outline-none text-sm"
                                    placeholder="8080"
                                />
                            </div>
                        </div>
                    </div>

                    {/* WebSocket 配置 */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">WebSocket 接口</h3>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">主机地址</label>
                                <input
                                    type="text"
                                    value={config.wsHost}
                                    onChange={(e) => setConfig({ ...config, wsHost: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0B4F6C] focus:ring-2 focus:ring-[#0B4F6C]/20 transition-all outline-none text-sm"
                                    placeholder="localhost"
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs text-gray-500 mb-1">端口</label>
                                <input
                                    type="number"
                                    value={config.wsPort}
                                    onChange={(e) => setConfig({ ...config, wsPort: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0B4F6C] focus:ring-2 focus:ring-[#0B4F6C]/20 transition-all outline-none text-sm"
                                    placeholder="8081"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 提示 */}
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-700 text-xs">
                        <p>💡 修改配置后需要重新登录才能生效</p>
                    </div>
                </div>

                {/* 底部按钮 */}
                <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-[#0B4F6C] text-white rounded-lg hover:bg-[#0a4560] transition-colors text-sm font-medium shadow-md shadow-[#0B4F6C]/20"
                    >
                        保存并刷新
                    </button>
                </div>
            </div>
        </div>
    );
}

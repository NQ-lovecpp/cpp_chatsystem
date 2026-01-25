/**
 * 设置面板组件
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ServerConfig from './ServerConfig';

export default function SettingsPanel() {
    const { user, logout } = useAuth();
    const [showServerConfig, setShowServerConfig] = useState(false);

    return (
        <div className="flex flex-col h-full">
            {/* 头部 */}
            <div className="px-5 pt-6 pb-4">
                <h1 className="text-xl font-bold text-gray-900 mb-4">设置</h1>
            </div>

            {/* 设置列表 */}
            <div className="flex-1 overflow-y-auto px-3 space-y-2">
                {/* 用户信息卡片 */}
                <div className="p-4 bg-white rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0B4F6C] to-[#0a4560] flex items-center justify-center text-white text-xl font-bold">
                            {user?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-lg">{user?.nickname || '用户'}</p>
                            <p className="text-sm text-gray-500">{user?.description || '暂无签名'}</p>
                        </div>
                    </div>
                </div>

                {/* 设置项 */}
                <div className="space-y-1">
                    <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">
                        账户
                    </p>

                    <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-gray-700">个人资料</span>
                    </button>
                </div>

                <div className="space-y-1">
                    <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">
                        应用设置
                    </p>

                    <button
                        onClick={() => setShowServerConfig(true)}
                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                        <span className="text-gray-700">服务器配置</span>
                    </button>
                </div>

                {/* 退出登录 */}
                <div className="pt-4 border-t border-gray-100 mt-4">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>退出登录</span>
                    </button>
                </div>
            </div>

            {/* 服务器配置模态框 */}
            {showServerConfig && <ServerConfig onClose={() => setShowServerConfig(false)} />}
        </div>
    );
}

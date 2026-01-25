/**
 * 聊天主页面
 * 三栏布局：导航栏 | 会话列表 | 消息区域
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';
import Sidebar from '../components/Sidebar';
import SessionList from '../components/SessionList';
import MessageArea from '../components/MessageArea';
import FriendList from '../components/FriendList';
import SettingsPanel from '../components/SettingsPanel';

export default function ChatPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('chat'); // chat, contacts, settings

    return (
        <ChatProvider>
            <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
                {/* 背景装饰 */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#0B4F6C]/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0B4F6C]/3 rounded-full blur-3xl"></div>
                </div>

                {/* 左侧导航栏 */}
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />

                {/* 中间区域 */}
                <div className="flex flex-1 relative z-10">
                    {/* 会话/联系人列表 */}
                    <div className="w-80 border-r border-gray-200 bg-white/80 backdrop-blur-xl flex flex-col">
                        {activeTab === 'chat' && <SessionList />}
                        {activeTab === 'contacts' && <FriendList />}
                        {activeTab === 'settings' && <SettingsPanel />}
                    </div>

                    {/* 消息区域 */}
                    <div className="flex-1 bg-white/50 backdrop-blur-sm">
                        {activeTab === 'chat' && <MessageArea />}
                        {activeTab === 'contacts' && (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p>选择联系人查看详情</p>
                                </div>
                            </div>
                        )}
                        {activeTab === 'settings' && (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p>应用设置</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ChatProvider>
    );
}

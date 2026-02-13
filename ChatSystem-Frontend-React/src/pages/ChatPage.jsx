/**
 * 聊天主页面
 * 响应式布局：移动端单栏/平板双栏/桌面三栏
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChatProvider, useChat } from '../contexts/ChatContext';
import Sidebar from '../components/Sidebar';
import SessionList from '../components/SessionList';
import MessageArea from '../components/MessageArea';
import FriendList from '../components/FriendList';
import SettingsPanel from '../components/SettingsPanel';

// 移动端消息区域包装组件
function MobileMessageArea({ onBack }) {
    return (
        <div className="h-full flex flex-col">
            {/* 移动端返回按钮 */}
            <div className="lg:hidden h-14 px-4 flex items-center border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur-sm shrink-0">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 min-h-0">
                <MessageArea />
            </div>
        </div>
    );
}

// 内部组件，使用ChatContext
function ChatPageContent() {
    const { user } = useAuth();
    const { currentSession, selectSession } = useChat();
    const [activeTab, setActiveTab] = useState('chat'); // chat, contacts, settings
    const [showMobileChat, setShowMobileChat] = useState(false);

    // 监听会话选择，在移动端显示消息区域
    useEffect(() => {
        if (currentSession && window.innerWidth < 1024) {
            setShowMobileChat(true);
        }
    }, [currentSession]);

    // 移动端返回会话列表
    const handleMobileBack = () => {
        setShowMobileChat(false);
    };

    // 移动端选择会话
    const handleSessionSelect = (sessionId) => {
        selectSession(sessionId);
        if (window.innerWidth < 1024) {
            setShowMobileChat(true);
        }
    };

    return (
        <div className="h-[100dvh] w-screen flex overflow-hidden bg-[var(--color-background)]">
            {/* 背景装饰 */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--color-primary)]/3 rounded-full blur-3xl"></div>
            </div>

            {/* 左侧导航栏 - 移动端底部显示 */}
            <div className="hidden md:block">
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />
            </div>

            {/* 主内容区域 - 增加内边距和圆角 */}
            <div className="flex flex-1 relative z-10 min-w-0 p-0 md:p-3 gap-0 md:gap-3">
                {/* 会话/联系人列表 - 移动端全宽，桌面端固定宽度，增加圆角和阴影 */}
                <div className={`
                    w-full md:w-80 lg:w-80 
                    md:rounded-2xl border-r md:border border-[var(--color-border)] 
                    bg-[var(--color-surface-elevated)]/95 backdrop-blur-xl flex flex-col
                    ${showMobileChat ? 'hidden lg:flex' : 'flex'}
                    pb-16 md:pb-0 overflow-hidden
                    md:shadow-[var(--shadow-elevated)]
                `}>
                    {activeTab === 'chat' && <SessionList onSessionSelect={handleSessionSelect} />}
                    {activeTab === 'contacts' && <FriendList />}
                    {activeTab === 'settings' && <SettingsPanel />}
                </div>

                {/* 消息区域 - 移动端全屏覆盖，桌面端右侧显示，增加圆角和阴影 */}
                <div className={`
                    flex-1 md:rounded-2xl md:border border-[var(--color-border)]
                    bg-[var(--color-surface)]/60 backdrop-blur-sm min-w-0
                    ${showMobileChat ? 'flex' : 'hidden lg:flex'}
                    flex-col overflow-hidden
                    pb-16 md:pb-0
                    md:shadow-[var(--shadow-elevated)]
                `}>
                    {activeTab === 'chat' && (
                        <div className="h-full lg:block">
                            <div className="hidden lg:block h-full">
                                <MessageArea />
                            </div>
                            <div className="lg:hidden h-full">
                                <MobileMessageArea onBack={handleMobileBack} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'contacts' && (
                        <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">
                            <div className="text-center px-4">
                                <svg className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p>选择联系人查看详情</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">
                            <div className="text-center px-4">
                                <svg className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p>应用设置</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 移动端底部导航栏 */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-surface-elevated)] border-t border-[var(--color-border)] flex items-center justify-around z-50">
                <button
                    onClick={() => { setActiveTab('chat'); setShowMobileChat(false); }}
                    className={`flex flex-col items-center justify-center w-16 h-full ${activeTab === 'chat' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-xs mt-1">消息</span>
                </button>
                <button
                    onClick={() => { setActiveTab('contacts'); setShowMobileChat(false); }}
                    className={`flex flex-col items-center justify-center w-16 h-full ${activeTab === 'contacts' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs mt-1">联系人</span>
                </button>
                <button
                    onClick={() => { setActiveTab('settings'); setShowMobileChat(false); }}
                    className={`flex flex-col items-center justify-center w-16 h-full ${activeTab === 'settings' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs mt-1">设置</span>
                </button>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <ChatProvider>
            <ChatPageContent />
        </ChatProvider>
    );
}

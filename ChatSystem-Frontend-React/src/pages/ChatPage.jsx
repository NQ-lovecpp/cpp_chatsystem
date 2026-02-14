/**
 * 聊天主页面
 * 响应式布局：移动端单栏/平板双栏/桌面三栏+Agent面板
 * 
 * 布局结构:
 * ┌──────┬──────────┬────────────────────────────────────┐
 * │      │          │                    │  Agent Panel   │
 * │ Nav  │ Session  │   Message Area     │  (可折叠)      │
 * │      │  List    │                    │                │
 * └──────┴──────────┴────────────────────────────────────┘
 * 
 * 设置面板时:
 * ┌──────┬───────────────────────────────────────────────┐
 * │ Nav  │           Settings Panel (full width)         │
 * └──────┴───────────────────────────────────────────────┘
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChatProvider, useChat } from '../contexts/ChatContext';
import { AgentProvider, useAgent } from '../contexts/AgentContext';
import Sidebar from '../components/Sidebar';
import SessionList from '../components/SessionList';
import MessageArea from '../components/MessageArea';
import FriendList from '../components/FriendList';
import SettingsPanel from '../components/SettingsPanel';
import { TaskSidebar, TaskDetailPanel, GlobalAgentChat } from '../components/agent';
import ApprovalModalAntd from '../components/agent/ApprovalModalAntd';

// 移动端消息区域包装组件
function MobileMessageArea({ onBack }) {
    return (
        <div className="h-full flex flex-col">
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

// Agent 面板切换按钮
function AgentToggleButton({ showAgentPanel, setShowAgentPanel, hasRunningTasks }) {
    return (
        <div className="hidden lg:flex items-center shrink-0">
            <button
                onClick={() => setShowAgentPanel(!showAgentPanel)}
                className={`
                    relative p-2 rounded-l-lg transition-all duration-200
                    ${showAgentPanel 
                        ? 'bg-[var(--color-primary)] text-white shadow-md' 
                        : 'bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-r-0 border-[var(--color-border)]'
                    }
                `}
                title={showAgentPanel ? '关闭 Agent 面板' : '打开 Agent 面板'}
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {hasRunningTasks && !showAgentPanel && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-surface-elevated)] animate-pulse" />
                )}
            </button>
        </div>
    );
}

// 右侧 Agent 面板（桌面端）
function AgentSidePanel() {
    return (
        <div className="flex flex-col h-full min-h-0">
            {/* 上方：任务详情 */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <TaskDetailPanel />
            </div>
            {/* 下方：任务列表 */}
            <div className="h-[280px] border-t border-[var(--color-border)] shrink-0 overflow-hidden">
                <TaskSidebar className="h-full" />
            </div>
        </div>
    );
}

// 内部组件，使用 ChatContext
function ChatPageContent() {
    const { user } = useAuth();
    const { selectSession } = useChat();
    const { hasRunningTasks, selectedTaskId } = useAgent();
    const [activeTab, setActiveTab] = useState('chat');
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [showAgentPanel, setShowAgentPanel] = useState(false);

    const handleMobileBack = () => setShowMobileChat(false);

    const handleSessionSelect = useCallback((sessionId) => {
        selectSession(sessionId);
        if (window.innerWidth < 1024) {
            setShowMobileChat(true);
        }
    }, [selectSession]);

    // 点击 agent 标签时：打开 GlobalAgent 对话界面
    const handleTabChange = (tab) => {
        // agent 标签现在直接显示 GlobalAgent 对话界面
        setActiveTab(tab);
        setShowMobileChat(false);
    };

    // 设置面板独占整个右侧区域
    const isSettingsTab = activeTab === 'settings';

    return (
        <div className="h-[100dvh] w-screen flex overflow-hidden bg-[var(--color-background)]">
            {/* 背景装饰 */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--color-primary)]/3 rounded-full blur-3xl" />
            </div>

            {/* 左侧导航栏 */}
            <div className="hidden md:block shrink-0 z-20">
                <Sidebar activeTab={activeTab} onTabChange={handleTabChange} user={user} />
            </div>

            {/* 主内容区域 */}
            <div className="flex flex-1 relative z-10 min-w-0 p-0 md:p-3 gap-0 md:gap-3">

                {isSettingsTab ? (
                    /* ===== 设置面板：独占全宽 ===== */
                    <div className="flex-1 md:rounded-2xl md:border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 backdrop-blur-xl overflow-hidden md:shadow-[var(--shadow-elevated)] pb-16 md:pb-0">
                        <SettingsPanel />
                    </div>
                ) : (
                    /* ===== 聊天/联系人/Agent 布局 ===== */
                    <>
                        {/* 左列：会话列表 / 联系人列表 */}
                        <div className={`
                            w-full md:w-80 lg:w-80 shrink-0
                            md:rounded-2xl border-r md:border border-[var(--color-border)] 
                            bg-[var(--color-surface-elevated)]/95 backdrop-blur-xl flex flex-col
                            ${showMobileChat ? 'hidden lg:flex' : 'flex'}
                            pb-16 md:pb-0 overflow-hidden
                            md:shadow-[var(--shadow-elevated)]
                        `}>
                            {activeTab === 'chat' && <SessionList onSessionSelect={handleSessionSelect} />}
                            {activeTab === 'contacts' && <FriendList />}
                            {activeTab === 'agent' && <TaskSidebar />}
                        </div>

                        {/* 右列：消息区域 + Agent 面板 */}
                        <div className={`
                            flex-1 md:rounded-2xl md:border border-[var(--color-border)]
                            bg-[var(--color-surface)]/60 backdrop-blur-sm min-w-0
                            ${showMobileChat ? 'flex' : 'hidden lg:flex'}
                            flex-col overflow-hidden
                            pb-16 md:pb-0
                            md:shadow-[var(--shadow-elevated)]
                        `}>
                            {/* Chat 标签内容 */}
                            {activeTab === 'chat' && (
                                <div className="flex-1 flex min-h-0">
                                    {/* 消息区域 - 始终可见，flex-1 自适应 */}
                                    <div className="flex-1 flex flex-col min-w-0 min-h-0">
                                        <div className="hidden lg:flex flex-col h-full min-h-0">
                                            <MessageArea />
                                        </div>
                                        <div className="lg:hidden flex flex-col h-full min-h-0">
                                            <MobileMessageArea onBack={handleMobileBack} />
                                        </div>
                                    </div>
                                    
                                    {/* Agent 切换按钮 */}
                                    <AgentToggleButton 
                                        showAgentPanel={showAgentPanel}
                                        setShowAgentPanel={setShowAgentPanel}
                                        hasRunningTasks={hasRunningTasks}
                                    />
                                    
                                    {/* Agent 右侧面板 */}
                                    {showAgentPanel && (
                                        <div className="hidden lg:flex w-[320px] xl:w-[360px] border-l border-[var(--color-border)] flex-col shrink-0 min-h-0">
                                            <AgentSidePanel />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Contacts 标签内容 */}
                            {activeTab === 'contacts' && (
                                <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">
                                    <div className="text-center px-4">
                                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <p className="text-[var(--color-text-muted)]">选择联系人查看详情</p>
                                    </div>
                                </div>
                            )}

                            {/* Agent 标签内容 - GlobalAgent 对话界面 */}
                            {activeTab === 'agent' && (
                                <div className="flex-1 flex min-h-0">
                                    {/* GlobalAgent 聊天区域 */}
                                    <div className="flex-1 min-w-0">
                                        <GlobalAgentChat />
                                    </div>
                                    
                                    {/* 桌面端：右侧任务面板 */}
                                    <div className="hidden lg:flex w-[300px] border-l border-[var(--color-border)] flex-col shrink-0">
                                        <TaskSidebar className="h-full" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* 审批弹窗 */}
                {selectedTaskId && <ApprovalModalAntd taskId={selectedTaskId} />}
            </div>

            {/* 移动端底部导航栏 */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-surface-elevated)] border-t border-[var(--color-border)] flex items-center justify-around z-50">
                {[
                    { id: 'chat', label: '消息', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
                    { id: 'contacts', label: '联系人', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                    { id: 'agent', label: 'AI', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                    { id: 'settings', label: '设置', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                            activeTab === item.id 
                                ? 'text-[var(--color-primary)]' 
                                : 'text-[var(--color-text-muted)]'
                        }`}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        <span className="text-xs mt-1">{item.label}</span>
                        {item.id === 'agent' && hasRunningTasks && (
                            <span className="absolute top-1 right-1/4 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <ChatProvider>
            <AgentProvider>
                <ChatPageContent />
            </AgentProvider>
        </ChatProvider>
    );
}

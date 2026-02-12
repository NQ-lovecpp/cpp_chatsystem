/**
 * 左侧导航栏
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserProfileModal from './UserProfileModal';
import Avatar from './Avatar';

const navItems = [
    { id: 'chat', icon: 'chat', label: '消息' },
    { id: 'contacts', icon: 'contacts', label: '联系人' },
    { id: 'settings', icon: 'settings', label: '设置' },
];

const icons = {
    chat: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    contacts: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    settings: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

export default function Sidebar({ activeTab, onTabChange, user }) {
    const { logout } = useAuth();
    const [showProfile, setShowProfile] = useState(false);

    return (
        <>
            <nav className="w-20 min-w-[80px] flex flex-col items-center py-6 gap-4 border-r border-gray-200 bg-white/95 backdrop-blur-sm z-20 shadow-sm">
                {/* Logo */}
                <div className="mb-4">
                    <div className="w-10 h-10 bg-[#0B4F6C] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0B4F6C]/30">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                </div>

                {/* 导航项 */}
                <div className="flex flex-col gap-3 w-full px-3">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`
              group flex items-center justify-center w-full aspect-square rounded-xl
              transition-all duration-200
              ${activeTab === item.id
                                    ? 'bg-[#0B4F6C] text-white shadow-md shadow-[#0B4F6C]/30'
                                    : 'text-gray-500 hover:text-[#0B4F6C] hover:bg-[#E0F2F7]'
                                }
            `}
                            title={item.label}
                        >
                            {icons[item.icon]}
                        </button>
                    ))}
                </div>

                {/* 底部区域 */}
                <div className="mt-auto flex flex-col gap-3 w-full px-3">
                    {/* 用户头像 */}
                    <Avatar
                        src={user?.avatar}
                        name={user?.nickname}
                        size="md"
                        rounded="xl"
                        onClick={() => setShowProfile(true)}
                        className="mx-auto hover:ring-2 hover:ring-[#0B4F6C]/30 transition-all"
                    />

                    {/* 登出按钮 */}
                    <button
                        onClick={logout}
                        className="group flex items-center justify-center w-full aspect-square rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="退出登录"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* 个人资料弹窗 */}
            {showProfile && <UserProfileModal onClose={() => setShowProfile(false)} />}
        </>
    );
}


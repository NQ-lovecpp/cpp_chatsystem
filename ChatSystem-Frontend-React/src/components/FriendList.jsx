/**
 * 好友列表组件
 */

import { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { searchFriend, addFriendApply, addFriendProcess } from '../api/friendApi';

export default function FriendList() {
    const { friends, friendRequests, loadFriends, loadFriendRequests } = useChat();
    const { sessionId, user } = useAuth();
    const userId = user?.user_id;

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('friends'); // friends, requests, search

    // 搜索好友
    const handleSearch = async () => {
        if (!searchQuery.trim() || !userId) return;

        setSearching(true);
        setActiveTab('search');
        const result = await searchFriend(sessionId, userId, searchQuery);
        if (result.success && result.user_info) {
            setSearchResults(result.user_info);
        } else {
            setSearchResults([]);
        }
        setSearching(false);
    };

    // 发送好友申请
    const handleAddFriend = async (targetUserId) => {
        if (!userId) return;
        const result = await addFriendApply(sessionId, userId, targetUserId);
        if (result.success) {
            alert('好友申请已发送');
        } else {
            alert(result.errmsg || '申请失败');
        }
    };

    // 处理好友申请
    const handleFriendRequest = async (applyUserId, eventId, agree) => {
        if (!userId) return;
        const result = await addFriendProcess(sessionId, userId, applyUserId, agree, eventId);
        if (result.success) {
            loadFriendRequests();
            if (agree) {
                loadFriends();
            }
        } else {
            alert(result.errmsg || '处理失败');
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* 头部 */}
            <div className="px-5 pt-6 pb-4">
                <h1 className="text-xl font-bold text-gray-900 mb-4">联系人</h1>

                {/* 搜索框 */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="搜索用户..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20 focus:border-[#0B4F6C] transition-all"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2.5 bg-[#0B4F6C] text-white rounded-xl text-sm font-medium hover:bg-[#0a4560] transition-colors"
                    >
                        搜索
                    </button>
                </div>

                {/* 标签页 */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'friends'
                            ? 'bg-[#0B4F6C] text-white'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        好友 ({friends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'requests'
                            ? 'bg-[#0B4F6C] text-white'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        申请 ({friendRequests.length})
                    </button>
                </div>
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto px-3">
                {/* 搜索结果 */}
                {activeTab === 'search' && (
                    <div className="space-y-2">
                        {searching ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="w-6 h-6 border-2 border-[#0B4F6C] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p className="text-sm">未找到用户</p>
                            </div>
                        ) : (
                            searchResults.map((user) => (
                                <div key={user.user_id} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B4F6C] to-[#0a4560] flex items-center justify-center text-white font-medium">
                                        {user.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{user.nickname}</p>
                                        <p className="text-sm text-gray-500">{user.description || '暂无签名'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddFriend(user.user_id)}
                                        className="px-3 py-1.5 bg-[#E0F2F7] text-[#0B4F6C] rounded-lg text-sm font-medium hover:bg-[#0B4F6C] hover:text-white transition-colors"
                                    >
                                        添加
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* 好友列表 */}
                {activeTab === 'friends' && (
                    <div className="space-y-2">
                        {friends.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p className="text-sm">暂无好友</p>
                            </div>
                        ) : (
                            friends.map((friend) => (
                                <div key={friend.user_id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                                        {friend.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{friend.nickname}</p>
                                        <p className="text-sm text-gray-500 truncate">{friend.description || '暂无签名'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* 好友申请 */}
                {activeTab === 'requests' && (
                    <div className="space-y-2">
                        {friendRequests.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p className="text-sm">暂无好友申请</p>
                            </div>
                        ) : (
                            friendRequests.map((request) => (
                                <div key={request.event_id} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-medium">
                                        {request.sender?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{request.sender?.nickname}</p>
                                        <p className="text-sm text-gray-500">请求添加你为好友</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleFriendRequest(request.sender?.user_id, request.event_id, true)}
                                            className="px-3 py-1.5 bg-[#0B4F6C] text-white rounded-lg text-sm font-medium hover:bg-[#0a4560] transition-colors"
                                        >
                                            同意
                                        </button>
                                        <button
                                            onClick={() => handleFriendRequest(request.sender?.user_id, request.event_id, false)}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            拒绝
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

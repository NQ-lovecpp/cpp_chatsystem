/**
 * 好友列表组件
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { searchFriend, addFriendApply, addFriendProcess } from '../api/friendApi';
import FriendInfoModal from './FriendInfoModal';
import Avatar from './Avatar';
import { cn } from '../lib/utils';

export default function FriendList() {
    const { friends, friendRequests, loadFriends, loadFriendRequests } = useChat();
    const { sessionId, user } = useAuth();
    const userId = user?.user_id;

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('friends'); // friends, requests, search
    const [selectedFriend, setSelectedFriend] = useState(null);

    // 搜索好友
    const handleSearch = async () => {
        if (!searchQuery.trim() || !userId) return;

        setSearching(true);
        setActiveTab('search');
        const result = await searchFriend(sessionId, userId, searchQuery);
        if (result.success && result.user_info) {
            const users = Array.isArray(result.user_info)
                ? result.user_info
                : [result.user_info];
            setSearchResults(users);
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
                <h1 className="text-xl font-bold text-[var(--color-text)] mb-4">联系人</h1>

                {/* 搜索框 */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="搜索用户..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                        />
                    </div>
                    <motion.button
                        onClick={handleSearch}
                        className="px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        搜索
                    </motion.button>
                </div>

                {/* 标签页 */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                            activeTab === 'friends'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                        )}
                    >
                        好友 ({friends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                            activeTab === 'requests'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                        )}
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
                                <motion.div 
                                    className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center py-10 text-[var(--color-text-muted)]">
                                <p className="text-sm">未找到用户</p>
                            </div>
                        ) : (
                            searchResults.map((u) => (
                                <motion.div 
                                    key={u.user_id} 
                                    className="flex items-center gap-3 p-3 bg-[var(--color-surface-elevated)] rounded-xl"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Avatar src={u.avatar} name={u.nickname} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[var(--color-text)] truncate">{u.nickname}</p>
                                        <p className="text-sm text-[var(--color-text-secondary)] truncate">{u.description || '暂无签名'}</p>
                                    </div>
                                    <motion.button
                                        onClick={() => handleAddFriend(u.user_id)}
                                        className="px-3 py-1.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg text-sm font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        添加
                                    </motion.button>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* 好友列表 */}
                {activeTab === 'friends' && (
                    <div className="space-y-2">
                        {friends.length === 0 ? (
                            <div className="text-center py-10 text-[var(--color-text-muted)]">
                                <p className="text-sm">暂无好友</p>
                            </div>
                        ) : (
                            friends.map((friend, index) => (
                                <motion.div
                                    key={friend.user_id}
                                    onClick={() => setSelectedFriend(friend)}
                                    className="flex items-center gap-3 p-3 hover:bg-[var(--color-surface)] rounded-xl transition-colors cursor-pointer"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <Avatar src={friend.avatar} name={friend.nickname} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[var(--color-text)] truncate">{friend.nickname}</p>
                                        <p className="text-sm text-[var(--color-text-secondary)] truncate">{friend.description || '暂无签名'}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* 好友申请 */}
                {activeTab === 'requests' && (
                    <div className="space-y-2">
                        {friendRequests.length === 0 ? (
                            <div className="text-center py-10 text-[var(--color-text-muted)]">
                                <p className="text-sm">暂无好友申请</p>
                            </div>
                        ) : (
                            friendRequests.map((request, index) => (
                                <motion.div 
                                    key={request.event_id} 
                                    className="flex items-center gap-3 p-3 bg-[var(--color-surface-elevated)] rounded-xl"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Avatar src={request.sender?.avatar} name={request.sender?.nickname} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[var(--color-text)] truncate">{request.sender?.nickname}</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">请求添加你为好友</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <motion.button
                                            onClick={() => handleFriendRequest(request.sender?.user_id, request.event_id, true)}
                                            className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            同意
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleFriendRequest(request.sender?.user_id, request.event_id, false)}
                                            className="px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-secondary)] rounded-lg text-sm font-medium hover:bg-[var(--color-border)] transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            拒绝
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
            {/* 好友信息弹窗 */}
            {selectedFriend && (
                <FriendInfoModal
                    friend={selectedFriend}
                    onClose={() => setSelectedFriend(null)}
                    onStartChat={() => setActiveTab('friends')}
                />
            )}
        </div>
    );
}

/**
 * 会话成员管理弹窗
 * 支持查看、添加、删除会话成员
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { 
    getChatSessionMember, 
    addChatSessionMember, 
    removeChatSessionMember 
} from '../api/sessionApi';
import { getFriendList } from '../api/friendApi';
import Avatar from './Avatar';
import { cn } from '../lib/utils';

export default function SessionMembersModal({ chatSessionId, chatSessionName, onClose }) {
    const { sessionId, user } = useAuth();
    const { refreshSessions } = useChat();
    
    const [members, setMembers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    
    // 加载成员列表
    const loadMembers = useCallback(async () => {
        if (!sessionId || !chatSessionId) return;
        
        try {
            setLoading(true);
            const result = await getChatSessionMember(sessionId, user?.user_id, chatSessionId);
            if (result.success) {
                setMembers(result.member_info_list || []);
            } else {
                message.error(result.errmsg || '获取成员列表失败');
            }
        } catch (error) {
            console.error('Load members error:', error);
            message.error('获取成员列表失败');
        } finally {
            setLoading(false);
        }
    }, [sessionId, user?.user_id, chatSessionId]);
    
    // 加载好友列表（用于添加成员）
    const loadFriends = useCallback(async () => {
        if (!sessionId) return;
        
        try {
            const result = await getFriendList(sessionId, user?.user_id);
            if (result.success) {
                setFriends(result.friend_list || []);
            }
        } catch (error) {
            console.error('Load friends error:', error);
        }
    }, [sessionId, user?.user_id]);
    
    useEffect(() => {
        loadMembers();
        loadFriends();
    }, [loadMembers, loadFriends]);
    
    // 添加成员
    const handleAddMembers = async () => {
        if (selectedFriends.length === 0) {
            message.warning('请选择要添加的成员');
            return;
        }
        
        try {
            setActionLoading(true);
            const result = await addChatSessionMember(
                sessionId, 
                user?.user_id, 
                chatSessionId, 
                selectedFriends
            );
            
            if (result.success) {
                message.success('添加成员成功');
                setSelectedFriends([]);
                setShowAddPanel(false);
                loadMembers();
                refreshSessions?.();
            } else {
                message.error(result.errmsg || '添加成员失败');
            }
        } catch (error) {
            console.error('Add members error:', error);
            message.error('添加成员失败');
        } finally {
            setActionLoading(false);
        }
    };
    
    // 删除成员
    const handleRemoveMember = async (memberId, memberName) => {
        if (memberId === user?.user_id) {
            message.warning('不能移除自己');
            return;
        }
        
        try {
            setActionLoading(true);
            const result = await removeChatSessionMember(
                sessionId, 
                user?.user_id, 
                chatSessionId, 
                memberId
            );
            
            if (result.success) {
                message.success(`已移除 ${memberName}`);
                loadMembers();
                refreshSessions?.();
            } else {
                message.error(result.errmsg || '移除成员失败');
            }
        } catch (error) {
            console.error('Remove member error:', error);
            message.error('移除成员失败');
        } finally {
            setActionLoading(false);
        }
    };
    
    // 获取可添加的好友（不在当前成员列表中的）
    const availableFriends = friends.filter(
        f => !members.some(m => m.user_id === f.user_id)
    );
    
    // 切换选中好友
    const toggleFriendSelection = (friendId) => {
        setSelectedFriends(prev => 
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--color-surface-elevated)] rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
            >
                {/* 头部 */}
                <div className="shrink-0 px-5 py-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-text)]">
                                {showAddPanel ? '添加成员' : '会话成员'}
                            </h2>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {chatSessionName} · {members.length} 人
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
                        >
                            <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* 内容区域 */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
                        </div>
                    ) : showAddPanel ? (
                        /* 添加成员面板 */
                        <div className="space-y-2">
                            {availableFriends.length === 0 ? (
                                <div className="text-center py-8 text-[var(--color-text-muted)]">
                                    没有可添加的好友
                                </div>
                            ) : (
                                availableFriends.map(friend => (
                                    <div
                                        key={friend.user_id}
                                        onClick={() => toggleFriendSelection(friend.user_id)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                                            selectedFriends.includes(friend.user_id)
                                                ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]"
                                                : "hover:bg-[var(--color-surface)] border border-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                            selectedFriends.includes(friend.user_id)
                                                ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                                                : "border-[var(--color-border)]"
                                        )}>
                                            {selectedFriends.includes(friend.user_id) && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <Avatar
                                            src={friend.avatar}
                                            name={friend.nickname}
                                            size="sm"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[var(--color-text)] truncate">
                                                {friend.nickname}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        /* 成员列表 */
                        <div className="space-y-2">
                            {members.map(member => (
                                <div
                                    key={member.user_id}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface)] transition-colors group"
                                >
                                    <Avatar
                                        src={member.avatar}
                                        name={member.nickname}
                                        size="md"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[var(--color-text)] truncate">
                                            {member.nickname}
                                            {member.user_id === user?.user_id && (
                                                <span className="ml-2 text-xs text-[var(--color-primary)]">（我）</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                                            {member.description || 'ID: ' + member.user_id}
                                        </p>
                                    </div>
                                    {member.user_id !== user?.user_id && (
                                        <button
                                            onClick={() => handleRemoveMember(member.user_id, member.nickname)}
                                            disabled={actionLoading}
                                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-all"
                                            title="移除成员"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* 底部操作 */}
                <div className="shrink-0 px-5 py-4 border-t border-[var(--color-border)] flex gap-3">
                    {showAddPanel ? (
                        <>
                            <button
                                onClick={() => {
                                    setShowAddPanel(false);
                                    setSelectedFriends([]);
                                }}
                                className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddMembers}
                                disabled={selectedFriends.length === 0 || actionLoading}
                                className={cn(
                                    "flex-1 py-2.5 rounded-xl transition-all",
                                    selectedFriends.length > 0 && !actionLoading
                                        ? "bg-[var(--color-primary)] text-white hover:opacity-90"
                                        : "bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-not-allowed"
                                )}
                            >
                                {actionLoading ? '添加中...' : `添加 (${selectedFriends.length})`}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setShowAddPanel(true)}
                            className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            添加成员
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

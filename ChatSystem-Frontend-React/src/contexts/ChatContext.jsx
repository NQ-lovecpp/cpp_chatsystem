/**
 * 聊天上下文
 * 管理会话列表、消息列表、好友列表等数据
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getChatSessionList } from '../api/sessionApi';
import { getFriendList, getPendingFriendEvents } from '../api/friendApi';
import { getRecentMessages } from '../api/messageApi';
import wsClient from '../api/wsClient';

const ChatContext = createContext(null);

// WebSocket 通知类型
const NotifyType = {
    FRIEND_ADD_APPLY: 0,
    FRIEND_ADD_PROCESS: 1,
    CHAT_SESSION_CREATE: 2,
    CHAT_MESSAGE: 3,
    FRIEND_REMOVE: 4,
};

export function ChatProvider({ children }) {
    const { sessionId, user, isAuthenticated } = useAuth();
    const userId = user?.user_id;

    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState({});
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // 加载会话列表
    const loadSessions = useCallback(async () => {
        if (!sessionId || !userId) return;
        setLoading(true);
        const result = await getChatSessionList(sessionId, userId);
        if (result.success && result.chat_session_info_list) {
            setSessions(result.chat_session_info_list);
        }
        setLoading(false);
    }, [sessionId, userId]);

    // 加载好友列表
    const loadFriends = useCallback(async () => {
        if (!sessionId || !userId) return;
        const result = await getFriendList(sessionId, userId);
        if (result.success && result.friend_list) {
            setFriends(result.friend_list);
        }
    }, [sessionId, userId]);

    // 加载好友申请
    const loadFriendRequests = useCallback(async () => {
        if (!sessionId || !userId) return;
        const result = await getPendingFriendEvents(sessionId, userId);
        if (result.success && result.event) {
            setFriendRequests(result.event);
        }
    }, [sessionId, userId]);

    // 加载会话消息
    const loadMessages = useCallback(async (chatSessionId) => {
        if (!sessionId || !chatSessionId || !userId) return;

        const result = await getRecentMessages(sessionId, userId, chatSessionId);
        if (result.success && result.msg_list) {
            setMessages(prev => ({
                ...prev,
                [chatSessionId]: result.msg_list,
            }));
        }
    }, [sessionId, userId]);

    // 选择会话
    const selectSession = useCallback((chatSessionId) => {
        setCurrentSessionId(chatSessionId);
        if (chatSessionId && !messages[chatSessionId]) {
            loadMessages(chatSessionId);
        }
    }, [messages, loadMessages]);

    // 添加新消息到当前会话
    const addMessage = useCallback((chatSessionId, message) => {
        setMessages(prev => ({
            ...prev,
            [chatSessionId]: [...(prev[chatSessionId] || []), message],
        }));
    }, []);

    // 初始化 WebSocket 消息处理
    useEffect(() => {
        if (!isAuthenticated) return;

        // 处理新消息
        wsClient.onMessage(NotifyType.CHAT_MESSAGE, (data) => {
            if (data.new_message_info?.message_info) {
                const msg = data.new_message_info.message_info;
                addMessage(msg.chat_session_id, msg);
            }
        });

        // 处理好友申请
        wsClient.onMessage(NotifyType.FRIEND_ADD_APPLY, () => {
            loadFriendRequests();
        });

        // 处理好友申请结果
        wsClient.onMessage(NotifyType.FRIEND_ADD_PROCESS, () => {
            loadFriends();
        });

        // 处理新会话创建
        wsClient.onMessage(NotifyType.CHAT_SESSION_CREATE, () => {
            loadSessions();
        });

        // 处理好友删除
        wsClient.onMessage(NotifyType.FRIEND_REMOVE, () => {
            loadFriends();
            loadSessions();
        });

        return () => {
            wsClient.offMessage(NotifyType.CHAT_MESSAGE);
            wsClient.offMessage(NotifyType.FRIEND_ADD_APPLY);
            wsClient.offMessage(NotifyType.FRIEND_ADD_PROCESS);
            wsClient.offMessage(NotifyType.CHAT_SESSION_CREATE);
            wsClient.offMessage(NotifyType.FRIEND_REMOVE);
        };
    }, [isAuthenticated, addMessage, loadFriendRequests, loadFriends, loadSessions]);

    // 登录后加载数据
    useEffect(() => {
        if (isAuthenticated && userId) {
            loadSessions();
            loadFriends();
            loadFriendRequests();
        }
    }, [isAuthenticated, userId, loadSessions, loadFriends, loadFriendRequests]);

    const currentSession = sessions.find(s => s.chat_session_id === currentSessionId);
    const currentMessages = messages[currentSessionId] || [];

    const value = {
        sessions,
        currentSession,
        currentSessionId,
        currentMessages,
        friends,
        friendRequests,
        loading,
        selectSession,
        loadSessions,
        loadFriends,
        loadFriendRequests,
        loadMessages,
        addMessage,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

export default ChatContext;

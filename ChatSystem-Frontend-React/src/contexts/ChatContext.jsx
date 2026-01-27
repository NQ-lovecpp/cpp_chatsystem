/**
 * 聊天上下文
 * 管理会话列表、消息列表、好友列表等数据
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getChatSessionList } from '../api/sessionApi';
import { getFriendList, getPendingFriendEvents } from '../api/friendApi';
import { getHistoryMessages } from '../api/messageApi';
import { decodeMessageInfo } from '../api/httpClient';
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

    // 加载会话消息 (获取历史记录)
    const loadMessages = useCallback(async (chatSessionId) => {
        if (!sessionId || !chatSessionId || !userId) return;

        // 获取历史消息：时间戳使用秒级（后端期望秒级时间戳）
        const overTime = Math.floor(Date.now() / 1000); // 转换为秒级时间戳
        // 使用 2000-01-01 00:00:00 作为起始时间，避免 ODB/MySQL 边界问题
        // 946684800 = 2000-01-01 00:00:00 UTC
        const startTime = 946684800;

        try {
            const result = await getHistoryMessages(sessionId, userId, chatSessionId, startTime, overTime);
            if (result.success && result.msg_list) {
                setMessages(prev => ({
                    ...prev,
                    [chatSessionId]: result.msg_list,
                }));
            }
        } catch (error) {
            console.error('获取历史消息失败:', error);
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
            console.log('[ChatContext] 收到新消息通知:', data);

            let msg = null;

            // 1. 尝试直接获取 (如果 wsClient 已经解析)
            if (data.new_message_info?.message_info) {
                msg = data.new_message_info.message_info;
            }
            // 2. 尝试从 field_6_data 解码 (new_message_info) -> message_info
            else if (data.field_6_data) {
                try {
                    // NotifyNewMessage { MessageInfo message_info = 1; }
                    // field_6_data 是 NotifyNewMessage 的 bytes
                    // 我们需要解码 field 1

                    const bytes = new Uint8Array(data.field_6_data);
                    console.log('[DEBUG] field_6_data 字节:', Array.from(bytes.slice(0, 50)).map(b => b.toString(16).padStart(2, '0')).join(' '));
                    // 简单的手动解码: tag(1<<3|2) + length + bytes
                    let pos = 0;
                    while (pos < bytes.length) {
                        const [tag, newPos] = wsClient.decodeVarint(bytes, pos);
                        pos = newPos;
                        const fieldNum = tag >> 3;
                        const wireType = tag & 7;

                        if (wireType === 2) {
                            const [len, newPos2] = wsClient.decodeVarint(bytes, pos);
                            pos = newPos2;
                            const fieldData = bytes.slice(pos, pos + len);
                            pos += len;

                            if (fieldNum === 1) { // message_info
                                console.log('[DEBUG] 解码 message_info, 数据长度:', fieldData.length);
                                msg = decodeMessageInfo(fieldData);
                                console.log('[DEBUG] 解码结果:', JSON.stringify(msg, null, 2));
                                break;
                            }
                        } else {
                            break; // 暂不支持其他类型跳过
                        }
                    }
                } catch (e) {
                    console.error('解码新消息通知失败:', e);
                }
            }

            if (msg) {
                console.log('[ChatContext] 解析出新消息:', msg);
                addMessage(msg.chat_session_id, msg);

                // 如果不是当前会话，显示通知
                if (msg.chat_session_id !== currentSessionId) {
                    // TODO: 使用 Toast 或 Notification API
                    console.log(`收到来自会话 ${msg.chat_session_id} 的新消息`);
                    // 简单的浏览器通知
                    if (Notification.permission === 'granted') {
                        new Notification(`新消息: ${msg.sender?.nickname || '用户'}`, {
                            body: msg.message?.string_message?.content || '[消息]',
                        });
                    } else if (Notification.permission !== 'denied') {
                        Notification.requestPermission();
                    }
                }
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

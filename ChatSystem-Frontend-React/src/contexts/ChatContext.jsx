/**
 * 聊天上下文
 * 管理会话列表、消息列表、好友列表、未读计数、通知中心等数据
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getChatSessionList } from '../api/sessionApi';
import { getFriendList, getPendingFriendEvents } from '../api/friendApi';
import { getHistoryMessages, getSingleFile } from '../api/messageApi';
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

// 图片缓存（按 file_id 缓存 base64）
const imageCache = new Map();
// 并发控制
const MAX_CONCURRENT_FETCHES = 3;
let activeFetches = 0;
const fetchQueue = [];

function processFetchQueue() {
    while (activeFetches < MAX_CONCURRENT_FETCHES && fetchQueue.length > 0) {
        const task = fetchQueue.shift();
        activeFetches++;
        task().finally(() => {
            activeFetches--;
            processFetchQueue();
        });
    }
}

export function ChatProvider({ children }) {
    const { sessionId, user, isAuthenticated } = useAuth();
    const userId = user?.user_id;
    const sessionStorageKey = userId ? `chat_current_session_id_${userId}` : null;

    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState({});
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 未读计数：{ [sessionId]: count }
    const [unreadCounts, setUnreadCounts] = useState({});
    
    // 最近通知（供通知中心消费）
    const [recentNotifications, setRecentNotifications] = useState([]);
    
    // 图片加载状态：{ [fileId]: 'loading' | 'loaded' | 'error' }
    const [imageLoadStates, setImageLoadStates] = useState({});

    // 使用 ref 跟踪当前会话ID（避免闭包问题）
    const currentSessionIdRef = useRef(null);
    useEffect(() => {
        currentSessionIdRef.current = currentSessionId;
    }, [currentSessionId]);

    // 异步加载单个图片
    const fetchImage = useCallback(async (fileId) => {
        if (!sessionId || !userId || !fileId) return null;
        if (imageCache.has(fileId)) return imageCache.get(fileId);
        
        return new Promise((resolve) => {
            fetchQueue.push(async () => {
                try {
                    setImageLoadStates(prev => ({ ...prev, [fileId]: 'loading' }));
                    const result = await getSingleFile(sessionId, userId, fileId);
                    if (result.success && result.file_data?.file_content) {
                        const base64 = result.file_data.file_content;
                        imageCache.set(fileId, base64);
                        setImageLoadStates(prev => ({ ...prev, [fileId]: 'loaded' }));
                        resolve(base64);
                        return;
                    }
                    setImageLoadStates(prev => ({ ...prev, [fileId]: 'error' }));
                    resolve(null);
                } catch {
                    setImageLoadStates(prev => ({ ...prev, [fileId]: 'error' }));
                    resolve(null);
                }
            });
            processFetchQueue();
        });
    }, [sessionId, userId]);

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

    // 加载会话消息（使用 exclude_file_content=true 仅拉元数据）
    const loadMessages = useCallback(async (chatSessionId) => {
        if (!sessionId || !chatSessionId || !userId) return;

        const overTime = Math.floor(Date.now() / 1000);
        const startTime = 946684800;

        try {
            // 传 excludeFileContent=true 来跳过文件二进制内容
            const result = await getHistoryMessages(sessionId, userId, chatSessionId, startTime, overTime, true);
            if (result.success && Array.isArray(result.msg_list)) {
                setMessages(prev => {
                    const existingMessages = prev[chatSessionId] || [];
                    const mergedMap = new Map(existingMessages.map((m) => [m.message_id, m]));

                    // 保留本地 _pending/_streaming 消息，服务器同 id 消息仅覆盖已稳定消息
                    for (const msg of result.msg_list) {
                        const local = mergedMap.get(msg.message_id);
                        if (local?._pending || local?._streaming) {
                            continue;
                        }
                        mergedMap.set(msg.message_id, msg);
                    }

                    const merged = Array.from(mergedMap.values()).sort(
                        (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
                    );

                    return {
                        ...prev,
                        [chatSessionId]: merged,
                    };
                });
                
                // 异步加载图片消息的内容
                const imageMessages = result.msg_list.filter(
                    msg => msg.message?.message_type === 1 && msg.message?.image_message?.file_id
                );
                for (const msg of imageMessages) {
                    const fileId = msg.message.image_message.file_id;
                    if (!imageCache.has(fileId)) {
                        fetchImage(fileId);
                    }
                }
            }
        } catch (error) {
            console.error('获取历史消息失败:', error);
        }
    }, [sessionId, userId, fetchImage]);

    // 选择会话
    const selectSession = useCallback((chatSessionId) => {
        setCurrentSessionId(chatSessionId);
        // 清除该会话未读计数
        if (chatSessionId) {
            setUnreadCounts(prev => {
                const next = { ...prev };
                delete next[chatSessionId];
                return next;
            });
        }
        if (chatSessionId && (!messages[chatSessionId] || messages[chatSessionId].length === 0)) {
            loadMessages(chatSessionId);
        }
    }, [messages, loadMessages]);

    // 添加新消息到当前会话（支持更新已有消息状态）
    const addMessage = useCallback((chatSessionId, message) => {
        setMessages(prev => {
            const existingMessages = prev[chatSessionId] || [];
            
            // 检查是否是更新已有的本地消息（发送成功后服务器返回的消息）
            // 本地消息 message_id 以 'local_' 开头，服务器消息不是
            if (!message.message_id?.startsWith('local_') && message.sender?.user_id) {
                // 查找是否有对应的本地pending消息需要替换
                const pendingIndex = existingMessages.findIndex(m => 
                    m._pending && 
                    m.sender?.user_id === message.sender.user_id &&
                    m.message?.message_type === message.message?.message_type &&
                    // 时间差在30秒内认为是同一条消息
                    Math.abs((m.timestamp || 0) - (message.timestamp || 0)) < 30000
                );
                
                if (pendingIndex !== -1) {
                    // 替换pending消息为服务器确认的消息
                    const newMessages = [...existingMessages];
                    newMessages[pendingIndex] = { ...message, _pending: false };
                    return { ...prev, [chatSessionId]: newMessages };
                }
            }
            
            // 检查是否是重复消息（相同message_id）
            const isDuplicate = existingMessages.some(m => 
                m.message_id === message.message_id && !m.message_id?.startsWith('local_')
            );
            if (isDuplicate) {
                return prev;
            }
            
            return {
                ...prev,
                [chatSessionId]: [...existingMessages, message],
            };
        });

        // 增量消息到达时同步更新会话预览与排序，避免依赖额外 HTTP 回拉
        setSessions(prev => {
            const idx = prev.findIndex(s => s.chat_session_id === chatSessionId);
            if (idx === -1) return prev;

            const updated = [...prev];
            updated[idx] = { ...updated[idx], prev_message: message };
            updated.sort((a, b) => {
                const ta = a.prev_message?.timestamp || 0;
                const tb = b.prev_message?.timestamp || 0;
                return tb - ta;
            });
            return updated;
        });
    }, []);

    // 获取缓存的图片（供渲染使用）
    const getCachedImage = useCallback((fileId) => {
        return imageCache.get(fileId) || null;
    }, []);

    // 更新消息发送状态（移除pending标记）
    const updateMessageStatus = useCallback((chatSessionId, messageId, pending = false) => {
        setMessages(prev => {
            const existingMessages = prev[chatSessionId] || [];
            const index = existingMessages.findIndex(m => m.message_id === messageId);
            if (index === -1) return prev;
            
            const newMessages = [...existingMessages];
            newMessages[index] = { ...newMessages[index], _pending: pending };
            return { ...prev, [chatSessionId]: newMessages };
        });
    }, []);

    // 按 streamId 更新 Agent 消息内容（用于流式输出）
    const updateAgentMessageContent = useCallback((chatSessionId, streamId, content, streaming = true) => {
        setMessages(prev => {
            const existingMessages = prev[chatSessionId] || [];
            const index = existingMessages.findIndex(m => m._streamId === streamId);
            if (index === -1) return prev;
            
            const newMessages = [...existingMessages];
            const msg = newMessages[index];
            newMessages[index] = {
                ...msg,
                message: {
                    ...msg.message,
                    message_type: 0,
                    string_message: { content: content || '' },
                },
                _streaming: streaming,
            };
            return { ...prev, [chatSessionId]: newMessages };
        });
    }, []);

    // 总未读数
    const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);

    // 初始化 WebSocket 消息处理
    useEffect(() => {
        if (!isAuthenticated) return;

        // 处理新消息
        wsClient.onMessage(NotifyType.CHAT_MESSAGE, (data) => {
            console.log('[ChatContext] 收到新消息通知:', data);

            let msg = null;

            if (data.new_message_info?.message_info) {
                msg = data.new_message_info.message_info;
            } else if (data.field_6_data) {
                try {
                    const bytes = new Uint8Array(data.field_6_data);
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

                            if (fieldNum === 1) {
                                msg = decodeMessageInfo(fieldData);
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                } catch (e) {
                    console.error('解码新消息通知失败:', e);
                }
            }

            if (msg) {
                console.log('[ChatContext] 解析出新消息:', msg);
                addMessage(msg.chat_session_id, msg);
                
                // 如果是图片消息且有file_id，异步加载图片内容
                if (msg.message?.message_type === 1 && msg.message?.image_message?.file_id) {
                    const fileId = msg.message.image_message.file_id;
                    if (!imageCache.has(fileId)) {
                        fetchImage(fileId);
                    }
                }

                // 更新会话列表：预览消息 + 排序到顶部
                setSessions(prev => {
                    const updated = prev.map(s => {
                        if (s.chat_session_id === msg.chat_session_id) {
                            return { ...s, prev_message: msg };
                        }
                        return s;
                    });
                    // 按最新消息排序
                    updated.sort((a, b) => {
                        const ta = a.prev_message?.timestamp || 0;
                        const tb = b.prev_message?.timestamp || 0;
                        return tb - ta;
                    });
                    return updated;
                });

                // 更新未读计数（非当前会话）
                if (msg.chat_session_id !== currentSessionIdRef.current) {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [msg.chat_session_id]: (prev[msg.chat_session_id] || 0) + 1,
                    }));
                    
                    // 添加到通知中心（最多保留 20 条）
                    setRecentNotifications(prev => {
                        const notification = {
                            id: msg.message_id || Date.now(),
                            sessionId: msg.chat_session_id,
                            sender: msg.sender,
                            message: msg.message,
                            timestamp: msg.timestamp,
                        };
                        return [notification, ...prev].slice(0, 20);
                    });
                }

                // 浏览器通知
                if (msg.chat_session_id !== currentSessionIdRef.current) {
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

    // 持久化当前选中的会话，支持刷新后恢复
    useEffect(() => {
        if (!sessionStorageKey) return;
        if (currentSessionId) {
            localStorage.setItem(sessionStorageKey, currentSessionId);
        } else {
            localStorage.removeItem(sessionStorageKey);
        }
    }, [sessionStorageKey, currentSessionId]);

    // 会话列表加载后自动恢复上次会话；若不存在则默认选第一条
    useEffect(() => {
        if (!isAuthenticated || !userId || sessions.length === 0) return;

        // 当前会话仍然有效则不处理
        if (currentSessionId && sessions.some(s => s.chat_session_id === currentSessionId)) {
            return;
        }

        const stored = sessionStorageKey ? localStorage.getItem(sessionStorageKey) : null;
        if (stored && sessions.some(s => s.chat_session_id === stored)) {
            selectSession(stored);
            return;
        }

        selectSession(sessions[0].chat_session_id);
    }, [isAuthenticated, userId, sessions, currentSessionId, sessionStorageKey, selectSession]);

    // 登出时清空当前会话，避免串用户状态
    useEffect(() => {
        if (!isAuthenticated) {
            setCurrentSessionId(null);
        }
    }, [isAuthenticated]);

    // 清除通知
    const clearNotification = useCallback((notificationId) => {
        setRecentNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, []);

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
        unreadCounts,
        totalUnread,
        recentNotifications,
        imageLoadStates,
        selectSession,
        loadSessions,
        loadFriends,
        loadFriendRequests,
        loadMessages,
        addMessage,
        updateMessageStatus,
        updateAgentMessageContent,
        fetchImage,
        getCachedImage,
        clearNotification,
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

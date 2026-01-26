/**
 * 消息区域组件
 */

import { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { sendTextMessage, searchMessages } from '../api/messageApi';
import MessageInput from './MessageInput';
import SessionInfoModal from './SessionInfoModal';

export default function MessageArea() {
    const { currentSession, currentMessages, addMessage } = useChat();
    const { user, sessionId } = useAuth();
    const messagesEndRef = useRef(null);
    const [showSessionInfo, setShowSessionInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    // 发送消息
    const handleSendMessage = async (content) => {
        if (!content.trim() || !currentSession || !user?.user_id) return;

        // 创建本地消息用于即时显示（乐观更新）
        const localMessage = {
            message_id: `local_${Date.now()}`,
            chat_session_id: currentSession.chat_session_id,
            timestamp: Date.now(),
            sender: {
                user_id: user.user_id,
                nickname: user.nickname,
            },
            message: {
                message_type: 0, // STRING
                string_message: { content },
            },
            _pending: true, // 标记为发送中
        };

        // 立即添加到本地消息列表
        addMessage(currentSession.chat_session_id, localMessage);

        try {
            // 发送到服务器 - 注意参数顺序：sessionId, userId, chatSessionId, content
            await sendTextMessage(sessionId, user.user_id, currentSession.chat_session_id, content);
        } catch (error) {
            console.error('发送消息失败:', error);
            // TODO: 可以标记消息发送失败
        }
    };

    // 格式化时间
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // 消息搜索
    const handleSearch = async () => {
        if (!searchQuery.trim() || !currentSession) return;

        setSearching(true);
        try {
            const result = await searchMessages(
                sessionId,
                user?.user_id,
                currentSession.chat_session_id,
                searchQuery
            );
            if (result.success && result.msg_list) {
                setSearchResults(result.msg_list);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('搜索失败:', error);
            setSearchResults([]);
        }
        setSearching(false);
    };

    // 渲染消息内容
    const renderMessageContent = (msg) => {
        const content = msg.message;
        if (!content) return null;

        switch (content.message_type) {
            case 0: // STRING
                return (
                    <p className="break-words">{content.string_message?.content}</p>
                );
            case 1: // IMAGE
                return (
                    <div className="max-w-[200px]">
                        <img
                            src={`data:image/png;base64,${content.image_message?.image_content}`}
                            alt="图片"
                            className="rounded-lg max-w-full"
                        />
                    </div>
                );
            case 2: // FILE
                return (
                    <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium">{content.file_message?.file_name}</p>
                            <p className="text-xs text-gray-500">
                                {Math.round((content.file_message?.file_size || 0) / 1024)} KB
                            </p>
                        </div>
                    </div>
                );
            case 3: // SPEECH
                return (
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span className="text-sm">[语音消息]</span>
                    </div>
                );
            default:
                return <p className="text-gray-500">未知消息类型</p>;
        }
    };

    if (!currentSession) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg">选择一个会话开始聊天</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative">
            {/* 头部 */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
                <div>
                    <h2 className="font-semibold text-gray-900">{currentSession.chat_session_name}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${showSearch ? 'bg-[#E0F2F7] text-[#0B4F6C]' : ''}`}
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setShowSessionInfo(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentMessages.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        <p>暂无消息，发送一条消息开始对话吧</p>
                    </div>
                ) : (
                    currentMessages.map((msg, index) => {
                        const isMe = msg.sender?.user_id === user?.user_id;

                        return (
                            <div
                                key={msg.message_id || index}
                                className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                            >
                                {/* 头像 */}
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0
                  ${isMe ? 'bg-[#0B4F6C]' : 'bg-gradient-to-br from-purple-500 to-pink-500'}
                `}>
                                    {msg.sender?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                </div>

                                {/* 消息气泡 */}
                                <div className={`max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {/* 发送者名称 */}
                                    {!isMe && (
                                        <p className="text-xs text-gray-400 mb-1 ml-1">
                                            {msg.sender?.nickname}
                                        </p>
                                    )}

                                    <div className={`
                    px-4 py-2.5 rounded-2xl
                    ${isMe
                                            ? 'bg-[#0B4F6C] text-white rounded-br-md'
                                            : 'bg-white text-gray-900 shadow-sm rounded-bl-md'
                                        }
                  `}>
                                        {renderMessageContent(msg)}
                                    </div>

                                    {/* 时间 */}
                                    <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                                        {formatTime(msg.timestamp)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 消息输入区 */}
            <MessageInput onSend={handleSendMessage} />

            {/* 搜索栏 */}
            {showSearch && (
                <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-3 shadow-md z-10">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="搜索消息..."
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20 focus:border-[#0B4F6C]"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="px-4 py-2 bg-[#0B4F6C] text-white rounded-lg text-sm hover:bg-[#0a4560] transition-colors disabled:opacity-50"
                        >
                            {searching ? '...' : '搜索'}
                        </button>
                        <button
                            onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(''); }}
                            className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
                        >
                            取消
                        </button>
                    </div>
                    {searchResults.length > 0 && (
                        <div className="mt-2 max-h-60 overflow-y-auto">
                            <p className="text-xs text-gray-400 mb-2">找到 {searchResults.length} 条结果</p>
                            {searchResults.map((msg, idx) => (
                                <div key={idx} className="p-2 hover:bg-gray-50 rounded text-sm">
                                    <span className="text-gray-400">{msg.sender?.nickname}: </span>
                                    <span>{msg.message?.string_message?.content || '[消息]'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 会话信息弹窗 */}
            {showSessionInfo && (
                <SessionInfoModal
                    session={currentSession}
                    onClose={() => setShowSessionInfo(false)}
                />
            )}
        </div>
    );
}

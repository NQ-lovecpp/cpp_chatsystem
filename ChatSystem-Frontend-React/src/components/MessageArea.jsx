/**
 * 消息区域组件
 */

import { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { sendTextMessage } from '../api/messageApi';
import MessageInput from './MessageInput';

export default function MessageArea() {
    const { currentSession, currentMessages } = useChat();
    const { user, sessionId } = useAuth();
    const messagesEndRef = useRef(null);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    // 发送消息
    const handleSendMessage = async (content) => {
        if (!content.trim() || !currentSession) return;

        await sendTextMessage(sessionId, currentSession.chat_session_id, content);
    };

    // 格式化时间
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
        });
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
        <div className="h-full flex flex-col">
            {/* 头部 */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
                <div>
                    <h2 className="font-semibold text-gray-900">{currentSession.chat_session_name}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
        </div>
    );
}

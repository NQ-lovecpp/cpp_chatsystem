/**
 * 消息区域组件
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { sendTextMessage, sendImageMessage, sendFileMessage, searchMessages } from '../api/messageApi';
import MessageInput from './MessageInput';
import SessionInfoModal from './SessionInfoModal';
import SessionMembersModal from './SessionMembersModal';
import Avatar from './Avatar';
import UserInfoCard from './UserInfoCard';

// 文件图标配置
const FILE_ICONS = {
    pdf: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'PDF' },
    doc: { color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'DOC' },
    docx: { color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'DOC' },
    xls: { color: 'text-green-600', bg: 'bg-green-500/10', label: 'XLS' },
    xlsx: { color: 'text-green-600', bg: 'bg-green-500/10', label: 'XLS' },
    ppt: { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'PPT' },
    pptx: { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'PPT' },
    zip: { color: 'text-yellow-600', bg: 'bg-yellow-500/10', label: 'ZIP' },
    rar: { color: 'text-yellow-600', bg: 'bg-yellow-500/10', label: 'RAR' },
    '7z': { color: 'text-yellow-600', bg: 'bg-yellow-500/10', label: '7Z' },
    txt: { color: 'text-[var(--color-text-muted)]', bg: 'bg-[var(--color-surface)]', label: 'TXT' },
    mp4: { color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'MP4' },
    mp3: { color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'MP3' },
};

function getFileIcon(fileName) {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    return FILE_ICONS[ext] || { color: 'text-[var(--color-text-muted)]', bg: 'bg-[var(--color-surface)]', label: ext.toUpperCase() || 'FILE' };
}

function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 图片预览器组件
function ImagePreview({ src, onClose }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <img
                src={src}
                alt="预览"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

// 懒加载图片消息组件
function LazyImageMessage({ fileId, imageContent, fetchImage, getCachedImage }) {
    const [lazyLoadedSrc, setLazyLoadedSrc] = useState(null);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const imgRef = useRef(null);

    // 计算初始图片源（优先使用 imageContent，其次缓存）- 避免在 effect 中 setState
    const initialSrc = (() => {
        if (imageContent) {
            return imageContent.startsWith('data:') ? imageContent : `data:image/png;base64,${imageContent}`;
        }
        const cached = getCachedImage(fileId);
        if (cached) {
            return cached.startsWith('data:') ? cached : `data:image/png;base64,${cached}`;
        }
        return null;
    })();

    // 最终使用的图片源：懒加载的 > 初始的
    const src = lazyLoadedSrc || initialSrc;

    useEffect(() => {
        // 如果已有初始源，不需要懒加载
        if (initialSrc) {
            return;
        }

        // 使用 IntersectionObserver 懒加载
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !lazyLoadedSrc && !loading) {
                    setLoading(true);
                    fetchImage(fileId).then((base64) => {
                        if (base64) {
                            const url = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
                            setLazyLoadedSrc(url);
                        }
                        setLoading(false);
                    });
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }
        return () => observer.disconnect();
    }, [fileId, initialSrc, fetchImage, lazyLoadedSrc, loading]);

    return (
        <>
            <div ref={imgRef} className="max-w-[280px] cursor-pointer" onClick={() => src && setPreviewSrc(src)}>
                {src ? (
                    <img
                        src={src}
                        alt="图片"
                        className="rounded-xl max-w-full object-cover"
                        style={{ border: 'none' }}
                    />
                ) : loading ? (
                    <div className="w-48 h-36 rounded-xl bg-[var(--color-surface)] flex items-center justify-center animate-pulse">
                        <svg className="w-8 h-8 text-[var(--color-text-muted)] animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : (
                    <div className="w-48 h-36 rounded-xl bg-[var(--color-surface)] flex items-center justify-center">
                        <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>
            {previewSrc && <ImagePreview src={previewSrc} onClose={() => setPreviewSrc(null)} />}
        </>
    );
}

export default function MessageArea() {
    const { currentSession, currentMessages, addMessage, updateMessageStatus, fetchImage, getCachedImage } = useChat();
    const { user, sessionId } = useAuth();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const prevSessionIdRef = useRef(null);
    const [showSessionInfo, setShowSessionInfo] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userCardPosition, setUserCardPosition] = useState({ x: 0, y: 0 });

    // 智能滚动：切换会话时瞬间到底部，新消息时平滑滚动
    useEffect(() => {
        if (!messagesEndRef.current) return;
        
        const isSessionChange = prevSessionIdRef.current !== currentSession?.chat_session_id;
        prevSessionIdRef.current = currentSession?.chat_session_id;
        
        if (isSessionChange) {
            // 切换会话：瞬间滚动到底部，无动画
            messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
        } else {
            // 新消息：平滑滚动
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentMessages, currentSession?.chat_session_id]);

    // 发送文本消息
    const handleSendMessage = async (content) => {
        if (!content.trim() || !currentSession || !user?.user_id) return;

        const localMessage = {
            message_id: `local_${Date.now()}`,
            chat_session_id: currentSession.chat_session_id,
            timestamp: Date.now(),
            sender: {
                user_id: user.user_id,
                nickname: user.nickname,
                avatar: user.avatar,
            },
            message: {
                message_type: 0,
                string_message: { content },
            },
            _pending: true,
        };

        addMessage(currentSession.chat_session_id, localMessage);

        try {
            const result = await sendTextMessage(sessionId, user.user_id, currentSession.chat_session_id, content);
            if (result.success) {
                // 发送成功，移除pending状态（通过WebSocket通知会更新消息）
                // 如果30秒后还是pending状态，也认为发送成功（服务器已处理但通知可能丢失）
                setTimeout(() => {
                    updateMessageStatus(currentSession.chat_session_id, localMessage.message_id, false);
                }, 3000);
            }
        } catch (error) {
            console.error('发送消息失败:', error);
        }
    };

    // 发送图片
    const handleSendImage = useCallback(async (file) => {
        if (!currentSession || !user?.user_id) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result.split(',')[1];

            // 乐观更新
            const localMessage = {
                message_id: `local_${Date.now()}`,
                chat_session_id: currentSession.chat_session_id,
                timestamp: Date.now(),
                sender: {
                    user_id: user.user_id,
                    nickname: user.nickname,
                    avatar: user.avatar,
                },
                message: {
                    message_type: 1,
                    image_message: { image_content: base64 },
                },
                _pending: true,
            };
            addMessage(currentSession.chat_session_id, localMessage);

            try {
                const result = await sendImageMessage(sessionId, user.user_id, currentSession.chat_session_id, base64);
                if (result.success) {
                    setTimeout(() => {
                        updateMessageStatus(currentSession.chat_session_id, localMessage.message_id, false);
                    }, 3000);
                }
            } catch (error) {
                console.error('发送图片失败:', error);
            }
        };
        reader.readAsDataURL(file);
    }, [currentSession, user, sessionId, addMessage, updateMessageStatus]);

    // 发送文件
    const handleSendFile = useCallback(async (file) => {
        if (!currentSession || !user?.user_id) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result.split(',')[1];

            const localMessage = {
                message_id: `local_${Date.now()}`,
                chat_session_id: currentSession.chat_session_id,
                timestamp: Date.now(),
                sender: {
                    user_id: user.user_id,
                    nickname: user.nickname,
                    avatar: user.avatar,
                },
                message: {
                    message_type: 2,
                    file_message: {
                        file_name: file.name,
                        file_size: file.size,
                    },
                },
                _pending: true,
            };
            addMessage(currentSession.chat_session_id, localMessage);

            try {
                const result = await sendFileMessage(sessionId, user.user_id, currentSession.chat_session_id, file.name, file.size, base64);
                if (result.success) {
                    setTimeout(() => {
                        updateMessageStatus(currentSession.chat_session_id, localMessage.message_id, false);
                    }, 3000);
                }
            } catch (error) {
                console.error('发送文件失败:', error);
            }
        };
        reader.readAsDataURL(file);
    }, [currentSession, user, sessionId, addMessage, updateMessageStatus]);

    // 格式化时间
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
        return new Date(ms).toLocaleTimeString('zh-CN', {
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

    // 点击头像显示用户信息
    const handleAvatarClick = (sender, event) => {
        // 不显示自己的信息卡
        if (sender?.user_id === user?.user_id) return;
        
        const rect = event.currentTarget.getBoundingClientRect();
        setUserCardPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom
        });
        setSelectedUser(sender);
    };

    // 关闭用户信息卡
    const handleCloseUserCard = () => {
        setSelectedUser(null);
    };

    // 向用户发送消息
    const handleSendToUser = () => {
        // TODO: 创建与该用户的会话或切换到已有会话
        handleCloseUserCard();
    };

    // 查看用户详细资料
    const handleViewUserProfile = () => {
        // TODO: 打开用户详细资料模态框
        handleCloseUserCard();
    };

    // 渲染消息内容
    const renderMessageContent = (msg) => {
        const content = msg.message;
        if (!content) return null;

        switch (content.message_type) {
            case 0: // STRING
                return (
                    <p className="break-words whitespace-pre-wrap">{content.string_message?.content}</p>
                );
            case 1: // IMAGE
                return (
                    <LazyImageMessage
                        fileId={content.image_message?.file_id}
                        imageContent={content.image_message?.image_content}
                        fetchImage={fetchImage}
                        getCachedImage={getCachedImage}
                    />
                );
            case 2: { // FILE
                const fileName = content.file_message?.file_name || '未知文件';
                const fileSize = content.file_message?.file_size || 0;
                const icon = getFileIcon(fileName);
                return (
                    <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl min-w-[200px]">
                        <div className={`w-10 h-10 ${icon.bg} rounded-lg flex items-center justify-center shrink-0`}>
                            <span className={`text-xs font-bold ${icon.color}`}>{icon.label}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900">{fileName}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(fileSize)}</p>
                        </div>
                        <button
                            className="p-1.5 text-gray-400 hover:text-[#0B4F6C] hover:bg-[#E0F2F7] rounded-lg transition-colors shrink-0"
                            title="下载文件"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                    </div>
                );
            }
            case 3: // SPEECH
                return (
                    <div className="flex items-center gap-2 py-1">
                        <svg className="w-5 h-5 text-current opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span className="text-sm">[语音消息]</span>
                    </div>
                );
            default:
                return <p className="text-gray-500 text-sm">未知消息类型</p>;
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
            {/* 头部 - 桌面端显示，移动端由父组件MobileMessageArea处理 */}
            <div className="hidden lg:flex h-16 px-6 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur-sm shrink-0">
                <div>
                    <h2 className="font-semibold text-[var(--color-text)] truncate max-w-[200px]">{currentSession.chat_session_name}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className={`p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors ${showSearch ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setShowMembersModal(true)}
                        className="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors text-[var(--color-text-muted)]"
                        title="成员管理"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setShowSessionInfo(true)}
                        className="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors text-[var(--color-text-muted)]"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 移动端头部 - 显示会话名称 */}
            <div className="lg:hidden h-14 px-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur-sm shrink-0">
                <h2 className="font-semibold text-[var(--color-text)] truncate flex-1">{currentSession.chat_session_name}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className={`p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors ${showSearch ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setShowMembersModal(true)}
                        className="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors text-[var(--color-text-muted)]"
                        title="成员管理"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setShowSessionInfo(true)}
                        className="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors text-[var(--color-text-muted)]"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 消息列表 */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {currentMessages.length === 0 ? (
                    <div className="text-center text-[var(--color-text-muted)] py-10">
                        <p>暂无消息，发送一条消息开始对话吧</p>
                    </div>
                ) : (
                    currentMessages.map((msg, index) => {
                        const isMe = msg.sender?.user_id === user?.user_id;
                        const isImageMsg = msg.message?.message_type === 1;

                        return (
                            <div
                                key={msg.message_id || index}
                                className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                            >
                                {/* 头像 - 使用 Avatar 组件 */}
                                <Avatar
                                    src={msg.sender?.avatar}
                                    name={msg.sender?.nickname}
                                    size="md"
                                    onClick={!isMe ? (e) => handleAvatarClick(msg.sender, e) : undefined}
                                    className={!isMe ? 'cursor-pointer' : ''}
                                />

                                {/* 消息气泡 */}
                                <div className={`max-w-[75%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && (
                                        <p className="text-xs text-[var(--color-text-muted)] mb-1 ml-1">
                                            {msg.sender?.nickname}
                                        </p>
                                    )}

                                    <div className={`
                                        ${isImageMsg ? '' : 'px-4 py-2.5'}
                                        rounded-2xl
                                        ${isMe
                                            ? (isImageMsg ? '' : 'bg-[var(--color-bubble-self)] text-[var(--color-bubble-self-text)]') + ' rounded-br-md'
                                            : (isImageMsg ? '' : 'bg-[var(--color-bubble-other)] text-[var(--color-bubble-other-text)] shadow-sm') + ' rounded-bl-md'
                                        }
                                    `}>
                                        {renderMessageContent(msg)}
                                    </div>

                                    <p className={`text-xs text-[var(--color-text-muted)] mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                                        {formatTime(msg.timestamp)}
                                        {msg._pending && <span className="ml-1 opacity-50">发送中...</span>}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 消息输入区 */}
            <MessageInput
                onSend={handleSendMessage}
                onSendImage={handleSendImage}
                onSendFile={handleSendFile}
            />

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

            {/* 成员管理弹窗 */}
            {showMembersModal && currentSession && (
                <SessionMembersModal
                    chatSessionId={currentSession.chat_session_id}
                    chatSessionName={currentSession.chat_session_name}
                    onClose={() => setShowMembersModal(false)}
                />
            )}

            {/* 用户信息卡片 */}
            <AnimatePresence>
                {selectedUser && (
                    <UserInfoCard
                        user={selectedUser}
                        position={userCardPosition}
                        onClose={handleCloseUserCard}
                        onSendMessage={handleSendToUser}
                        onViewProfile={handleViewUserProfile}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

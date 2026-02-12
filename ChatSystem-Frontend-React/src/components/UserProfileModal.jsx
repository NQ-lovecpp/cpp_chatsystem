/**
 * 用户个人资料弹窗组件
 * 显示和编辑当前登录用户的信息
 * 支持上传头像或选择系统默认头像
 */

import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { setNickname, setDescription, setAvatar, getUserInfo } from '../api/userApi';
import Avatar, { DEFAULT_AVATARS } from './Avatar';

export default function UserProfileModal({ onClose }) {
    const { user, sessionId, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNicknameValue] = useState(user?.nickname || '');
    const [description, setDescriptionValue] = useState(user?.description || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const fileInputRef = useRef(null);

    // 保存修改
    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            if (nickname !== user?.nickname && nickname.trim()) {
                const res = await setNickname(sessionId, nickname.trim());
                if (!res.success) {
                    setError(res.errmsg || '修改昵称失败');
                    setSaving(false);
                    return;
                }
            }

            if (description !== user?.description) {
                const res = await setDescription(sessionId, description);
                if (!res.success) {
                    setError(res.errmsg || '修改签名失败');
                    setSaving(false);
                    return;
                }
            }

            const userRes = await getUserInfo(sessionId);
            if (userRes.success && userRes.user_info) {
                updateUser?.(userRes.user_info);
            }

            setIsEditing(false);
        } catch (err) {
            setError('保存失败: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // 处理头像上传
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('请选择图片文件');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('图片大小不能超过 2MB');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result.split(',')[1];
                const res = await setAvatar(sessionId, base64);

                if (res.success) {
                    const userRes = await getUserInfo(sessionId);
                    if (userRes.success && userRes.user_info) {
                        updateUser?.(userRes.user_info);
                    }
                    setShowAvatarPicker(false);
                } else {
                    setError(res.errmsg || '上传头像失败');
                }
                setSaving(false);
            };
            reader.onerror = () => {
                setError('读取图片失败');
                setSaving(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError('上传失败: ' + err.message);
            setSaving(false);
        }
    };

    // 选择默认头像
    const handleSelectDefaultAvatar = async (avatarUrl) => {
        setSaving(true);
        setError('');

        try {
            // 下载默认头像图片并转为 base64
            const response = await fetch(avatarUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result.split(',')[1];
                const res = await setAvatar(sessionId, base64);

                if (res.success) {
                    const userRes = await getUserInfo(sessionId);
                    if (userRes.success && userRes.user_info) {
                        updateUser?.(userRes.user_info);
                    }
                    setShowAvatarPicker(false);
                } else {
                    setError(res.errmsg || '设置头像失败');
                }
                setSaving(false);
            };
            reader.readAsDataURL(blob);
        } catch (err) {
            setError('设置头像失败: ' + err.message);
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* 头部背景 */}
                <div className="h-24 bg-gradient-to-r from-[#0B4F6C] to-[#0a4560] relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 头像 */}
                <div className="relative -mt-12 flex justify-center">
                    <div className="relative">
                        <Avatar
                            src={user?.avatar}
                            name={user?.nickname}
                            size="2xl"
                            className="border-4 border-white shadow-lg"
                            onClick={() => setShowAvatarPicker(true)}
                        />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#0B4F6C] rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-[#0a4560] transition-colors"
                             onClick={() => setShowAvatarPicker(true)}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                    />
                </div>

                {/* 头像选择面板 */}
                {showAvatarPicker && (
                    <div className="mx-6 mt-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-gray-700">选择头像</h3>
                            <button
                                onClick={() => setShowAvatarPicker(false)}
                                className="text-gray-400 hover:text-gray-600 text-xs"
                            >
                                关闭
                            </button>
                        </div>
                        
                        {/* 默认头像网格 */}
                        <div className="grid grid-cols-5 gap-2 mb-3">
                            {DEFAULT_AVATARS.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectDefaultAvatar(url)}
                                    disabled={saving}
                                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-[#0B4F6C] transition-colors disabled:opacity-50"
                                >
                                    <img src={url} alt={`默认头像 ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* 上传按钮 */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={saving}
                            className="w-full py-2 text-sm text-[#0B4F6C] bg-white border border-[#0B4F6C]/20 rounded-lg hover:bg-[#E0F2F7] transition-colors disabled:opacity-50"
                        >
                            {saving ? '上传中...' : '上传自定义头像'}
                        </button>
                    </div>
                )}

                {/* 内容 */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNicknameValue(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20 focus:border-[#0B4F6C]"
                                    placeholder="输入昵称"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">个性签名</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescriptionValue(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20 focus:border-[#0B4F6C]"
                                    placeholder="输入个性签名"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={saving}
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-2.5 bg-[#0B4F6C] text-white rounded-lg hover:bg-[#0a4560] transition-colors disabled:opacity-50"
                                    disabled={saving}
                                >
                                    {saving ? '保存中...' : '保存'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.nickname || '用户'}</h2>
                            <p className="text-gray-500 mb-4">{user?.description || '暂无签名'}</p>

                            <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs text-gray-400">用户ID</p>
                                        <p className="text-sm text-gray-700 font-mono">{user?.user_id || '-'}</p>
                                    </div>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-400">手机号</p>
                                            <p className="text-sm text-gray-700">{user.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-2.5 bg-[#0B4F6C] text-white rounded-lg hover:bg-[#0a4560] transition-colors"
                            >
                                编辑资料
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

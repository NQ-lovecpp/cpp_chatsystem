/**
 * 用户个人资料弹窗组件
 * 显示和编辑当前登录用户的信息
 */

import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { setNickname, setDescription, setAvatar, getUserInfo } from '../api/userApi';

export default function UserProfileModal({ onClose }) {
    const { user, sessionId, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNicknameValue] = useState(user?.nickname || '');
    const [description, setDescriptionValue] = useState(user?.description || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // 保存修改
    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            // 修改昵称
            if (nickname !== user?.nickname && nickname.trim()) {
                const res = await setNickname(sessionId, nickname.trim());
                if (!res.success) {
                    setError(res.errmsg || '修改昵称失败');
                    setSaving(false);
                    return;
                }
            }

            // 修改签名
            if (description !== user?.description) {
                const res = await setDescription(sessionId, description);
                if (!res.success) {
                    setError(res.errmsg || '修改签名失败');
                    setSaving(false);
                    return;
                }
            }

            // 刷新用户信息
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
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 检查文件类型和大小
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
            // 将图片转为 base64
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result.split(',')[1];
                const res = await setAvatar(sessionId, base64);

                if (res.success) {
                    // 刷新用户信息
                    const userRes = await getUserInfo(sessionId);
                    if (userRes.success && userRes.user_info) {
                        updateUser?.(userRes.user_info);
                    }
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
                    <div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0B4F6C] to-[#0a4560] flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => fileInputRef.current?.click()}
                        title="点击更换头像"
                    >
                        {user?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                </div>

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

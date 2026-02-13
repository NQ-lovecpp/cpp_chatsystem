/**
 * 登录/注册页面
 * 支持用户名密码登录、注册和服务器配置
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { usernameRegister } from '../api/userApi';
import ServerConfig from '../components/ServerConfig';

export default function LoginPage() {
    const { login } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!nickname.trim() || !password.trim()) {
            setError('请输入用户名和密码');
            return;
        }

        if (isRegister) {
            // 注册模式
            if (password !== confirmPassword) {
                setError('两次输入的密码不一致');
                return;
            }
            if (password.length < 6) {
                setError('密码长度至少6位');
                return;
            }

            setLoading(true);
            const result = await usernameRegister(nickname, password);
            setLoading(false);

            if (result.success) {
                setSuccess('注册成功！请登录');
                setIsRegister(false);
                setConfirmPassword('');
            } else {
                setError(result.errmsg || '注册失败');
            }
        } else {
            // 登录模式
            setLoading(true);
            const result = await login(nickname, password);
            setLoading(false);

            if (!result.success) {
                setError(result.error || '登录失败');
            }
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError('');
        setSuccess('');
        setConfirmPassword('');
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
            {/* 背景装饰 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-primary)]/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--color-primary)]/5 rounded-full blur-3xl"></div>
            </div>

            <motion.div 
                className="relative w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div 
                        className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary)] rounded-2xl shadow-lg mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </motion.div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">
                        {isRegister ? '创建新账户' : '欢迎回来'}
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        {isRegister ? '填写信息注册账户' : '登录您的账户继续'}
                    </p>
                </div>

                {/* 表单卡片 */}
                <motion.div 
                    className="bg-[var(--color-surface-elevated)] rounded-2xl shadow-xl p-8 border border-[var(--color-border)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* 用户名输入 */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                用户名
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none"
                                placeholder="请输入用户名"
                            />
                        </div>

                        {/* 密码输入 */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                密码
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none"
                                placeholder="请输入密码"
                            />
                        </div>

                        {/* 确认密码（仅注册时显示） */}
                        {isRegister && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                    确认密码
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none"
                                    placeholder="请再次输入密码"
                                />
                            </motion.div>
                        )}

                        {/* 错误提示 */}
                        {error && (
                            <motion.div 
                                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* 成功提示 */}
                        {success && (
                            <motion.div 
                                className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {success}
                            </motion.div>
                        )}

                        {/* 提交按钮 */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: loading ? 1 : 1.01 }}
                            whileTap={{ scale: loading ? 1 : 0.99 }}
                        >
                            {loading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注册' : '登录')}
                        </motion.button>
                    </form>

                    {/* 服务器配置按钮 */}
                    <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                        <button
                            onClick={() => setShowConfig(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            服务器配置
                        </button>
                    </div>
                </motion.div>

                {/* 切换登录/注册 */}
                <p className="text-center mt-6 text-[var(--color-text-secondary)] text-sm">
                    {isRegister ? '已有账户？' : '还没有账户？'}
                    <button
                        onClick={toggleMode}
                        className="text-[var(--color-primary)] font-medium hover:underline ml-1"
                    >
                        {isRegister ? '返回登录' : '注册新账户'}
                    </button>
                </p>
            </motion.div>

            {/* 服务器配置模态框 */}
            {showConfig && <ServerConfig onClose={() => setShowConfig(false)} />}
        </div>
    );
}

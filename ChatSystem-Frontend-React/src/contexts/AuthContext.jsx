/**
 * 认证上下文
 * 管理用户登录状态和会话信息
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usernameLogin, getUserInfo } from '../api/userApi';
import wsClient from '../api/wsClient';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'chat_auth';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);

    // 从 localStorage 恢复会话并验证
    useEffect(() => {
        const initAuth = async () => {
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    if (data.sessionId) {
                        // 验证 Session 是否有效
                        console.log('[Auth] Verifying session:', data.sessionId);
                        const result = await getUserInfo(data.sessionId);

                        if (result.success && result.user_info) {
                            console.log('[Auth] Session valid, restoring user');
                            setSessionId(data.sessionId);
                            setUser(result.user_info);

                            // 恢复 WebSocket 连接
                            wsClient.connect(data.sessionId);
                        } else {
                            console.warn('[Auth] Session invalid or expired, clearing auth');
                            localStorage.removeItem(AUTH_STORAGE_KEY);
                        }
                    }
                } catch (e) {
                    console.error('[Auth] Failed to restore auth:', e);
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // 登录
    const login = useCallback(async (nickname, password) => {
        const result = await usernameLogin(nickname, password);

        if (result.success) {
            const loginSessionId = result.login_session_id;
            setSessionId(loginSessionId);

            // 获取用户信息
            const userResult = await getUserInfo(loginSessionId);
            if (userResult.success && userResult.user_info) {
                setUser(userResult.user_info);

                // 保存到 localStorage
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
                    sessionId: loginSessionId,
                    user: userResult.user_info,
                }));

                // 连接 WebSocket
                wsClient.connect(loginSessionId);

                return { success: true };
            }

            return { success: true, user: null };
        }

        return { success: false, error: result.errmsg || '登录失败' };
    }, []);

    // 登出
    const logout = useCallback(() => {
        setUser(null);
        setSessionId(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        wsClient.disconnect();
    }, []);

    // 更新用户信息
    const updateUser = useCallback((updates) => {
        setUser(prev => {
            const newUser = { ...prev, ...updates };
            // 更新 localStorage
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                data.user = newUser;
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
            }
            return newUser;
        });
    }, []);

    const value = {
        user,
        sessionId,
        loading,
        isAuthenticated: !!sessionId,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;

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

    // 从 localStorage 恢复会话
    useEffect(() => {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setSessionId(data.sessionId);
                setUser(data.user);
            } catch (e) {
                console.error('Failed to restore auth:', e);
            }
        }
        setLoading(false);
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

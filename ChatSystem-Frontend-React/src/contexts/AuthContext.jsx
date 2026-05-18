/**
 * 认证上下文
 * 管理用户登录状态和会话信息
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usernameLogin, getUserInfo, sessionRefresh } from '../api/userApi';
import wsClient from '../api/wsClient';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'chat_auth';
// 5 分钟心跳：远小于后端 Session/Status 的 24h TTL，足以保证活跃用户永不掉线
const SESSION_HEARTBEAT_MS = 5 * 60 * 1000;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);

    // 从 localStorage 恢复会话并验证
    useEffect(() => {
        const initAuth = async () => {
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
                let data = null;
                try {
                    data = JSON.parse(stored);
                } catch (e) {
                    console.error('[Auth] localStorage 解析失败，清除：', e);
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                }

                if (data && data.sessionId) {
                    // 验证 Session 是否有效
                    console.log('[Auth] Verifying session:', data.sessionId);
                    const result = await getUserInfo(data.sessionId);

                    if (result.success && result.user_info) {
                        console.log('[Auth] Session valid, restoring user');
                        setSessionId(data.sessionId);
                        setUser(result.user_info);
                        wsClient.connect(data.sessionId);
                    } else if (result.transient) {
                        // 网络/网关瞬时错误：不清除 localStorage，先用缓存渲染，
                        // 让用户继续操作，后续请求或心跳会自我修复。
                        console.warn('[Auth] getUserInfo transient error, restoring from cache:', result.errmsg);
                        setSessionId(data.sessionId);
                        if (data.user) setUser(data.user);
                        wsClient.connect(data.sessionId);
                    } else {
                        // 真正鉴权失败（业务层 success=false 且非 transient）才登出
                        console.warn('[Auth] Session invalid or expired, clearing auth:', result.errmsg);
                        localStorage.removeItem(AUTH_STORAGE_KEY);
                    }
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // 滑动 TTL 心跳：登录期间每 5 分钟向 gateway 续期一次 session/status。
    // 401 才登出，transient 错误（网络/5xx）忽略。
    useEffect(() => {
        if (!sessionId) return;
        let cancelled = false;
        const tick = async () => {
            const r = await sessionRefresh(sessionId);
            if (cancelled) return;
            if (!r.success && !r.transient) {
                console.warn('[Auth] heartbeat reports session expired, logging out');
                setUser(null);
                setSessionId(null);
                localStorage.removeItem(AUTH_STORAGE_KEY);
                wsClient.disconnect();
            }
        };
        const id = setInterval(tick, SESSION_HEARTBEAT_MS);
        return () => { cancelled = true; clearInterval(id); };
    }, [sessionId]);

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

/**
 * 用户相关 API
 */

import { httpPost, httpPostWithSession } from './httpClient';
import { getHttpBaseUrl } from './config';

// API 路径
const API = {
    USERNAME_REGISTER: '/service/user/username_register',
    USERNAME_LOGIN: '/service/user/username_login',
    PHONE_REGISTER: '/service/user/phone_register',
    PHONE_LOGIN: '/service/user/phone_login',
    GET_VERIFY_CODE: '/service/user/get_phone_verify_code',
    GET_USER_INFO: '/service/user/get_user_info',
    SET_NICKNAME: '/service/user/set_nickname',
    SET_AVATAR: '/service/user/set_avatar',
    SET_DESCRIPTION: '/service/user/set_description',
    SET_PHONE: '/service/user/set_phone',
    SESSION_REFRESH: '/service/user/session_refresh',
};

/**
 * 用户名注册
 */
export async function usernameRegister(nickname, password) {
    return httpPost(API.USERNAME_REGISTER, {
        nickname,
        password,
    });
}

/**
 * 用户名登录
 */
export async function usernameLogin(nickname, password) {
    return httpPost(API.USERNAME_LOGIN, {
        nickname,
        password,
    });
}

/**
 * 获取用户信息
 */
export async function getUserInfo(sessionId) {
    return httpPostWithSession(API.GET_USER_INFO, {}, sessionId);
}

/**
 * 修改昵称
 */
export async function setNickname(sessionId, nickname) {
    return httpPostWithSession(API.SET_NICKNAME, { nickname }, sessionId);
}

/**
 * 修改头像
 */
export async function setAvatar(sessionId, avatarBase64) {
    return httpPostWithSession(API.SET_AVATAR, { avatar: avatarBase64 }, sessionId);
}

/**
 * 修改签名
 */
export async function setDescription(sessionId, description) {
    return httpPostWithSession(API.SET_DESCRIPTION, { description }, sessionId);
}

/**
 * 获取手机验证码
 */
export async function getPhoneVerifyCode(phoneNumber) {
    return httpPost(API.GET_VERIFY_CODE, { phone_number: phoneNumber });
}

/**
 * 手机号登录
 */
export async function phoneLogin(phoneNumber, verifyCodeId, verifyCode) {
    return httpPost(API.PHONE_LOGIN, {
        phone_number: phoneNumber,
        verify_code_id: verifyCodeId,
        verify_code: verifyCode,
    });
}

/**
 * 会话续期：心跳触发，续 Redis 中 session/status 的 TTL。
 * 端点不走 protobuf：请求体即 sessionId 字符串；
 *   - 200: ok（已刷新）
 *   - 401: session 过期，调用方应执行登出
 *   - 其它/网络错: 视为 transient，不要清除登录态
 */
export async function sessionRefresh(sessionId) {
    if (!sessionId) return { success: false, transient: false, errmsg: 'no session' };
    const url = `${getHttpBaseUrl()}${API.SESSION_REFRESH}`;
    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: sessionId,
        });
        if (resp.status === 200) return { success: true, transient: false };
        if (resp.status === 401) return { success: false, transient: false, errmsg: 'session expired' };
        // 5xx / 其它 -> transient
        return { success: false, transient: true, errmsg: `HTTP ${resp.status}` };
    } catch (e) {
        return { success: false, transient: true, errmsg: e.message || 'network error' };
    }
}

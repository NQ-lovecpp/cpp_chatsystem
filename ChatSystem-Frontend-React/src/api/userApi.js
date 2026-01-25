/**
 * 用户相关 API
 */

import { httpPost, httpPostWithSession } from './httpClient';

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

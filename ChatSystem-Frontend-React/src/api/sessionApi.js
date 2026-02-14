/**
 * 会话相关 API
 */

import { httpPostWithSession } from './httpClient';

const API = {
    GET_SESSION_LIST: '/service/friend/get_chat_session_list',
    CREATE_SESSION: '/service/friend/create_chat_session',
    GET_SESSION_MEMBER: '/service/friend/get_chat_session_member',
    ADD_MEMBER: '/service/friend/chat_session_add_member',
    REMOVE_MEMBER: '/service/friend/chat_session_remove_member',
};

/**
 * 获取会话列表
 */
export async function getChatSessionList(sessionId, userId) {
    return httpPostWithSession(API.GET_SESSION_LIST, {}, sessionId, userId);
}

/**
 * 创建群聊会话
 */
export async function createChatSession(sessionId, userId, chatSessionName, memberIdList) {
    return httpPostWithSession(API.CREATE_SESSION, {
        chat_session_name: chatSessionName,
        member_id_list: memberIdList,
    }, sessionId, userId);
}

/**
 * 获取会话成员
 */
export async function getChatSessionMember(sessionId, userId, chatSessionId) {
    return httpPostWithSession(API.GET_SESSION_MEMBER, {
        chat_session_id: chatSessionId,
    }, sessionId, userId);
}

/**
 * 添加会话成员
 * @param {string} sessionId - 登录会话 ID
 * @param {string} userId - 用户 ID
 * @param {string} chatSessionId - 聊天会话 ID
 * @param {string[]} memberIdList - 要添加的成员 ID 列表
 */
export async function addChatSessionMember(sessionId, userId, chatSessionId, memberIdList) {
    return httpPostWithSession(API.ADD_MEMBER, {
        chat_session_id: chatSessionId,
        member_id_list: memberIdList,
    }, sessionId, userId);
}

/**
 * 删除会话成员
 * @param {string} sessionId - 登录会话 ID
 * @param {string} userId - 用户 ID
 * @param {string} chatSessionId - 聊天会话 ID
 * @param {string} memberId - 要删除的成员 ID
 */
export async function removeChatSessionMember(sessionId, userId, chatSessionId, memberId) {
    return httpPostWithSession(API.REMOVE_MEMBER, {
        chat_session_id: chatSessionId,
        member_id: memberId,
    }, sessionId, userId);
}

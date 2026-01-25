/**
 * 会话相关 API
 */

import { httpPostWithSession } from './httpClient';

const API = {
    GET_SESSION_LIST: '/service/friend/get_chat_session_list',
    CREATE_SESSION: '/service/friend/create_chat_session',
    GET_SESSION_MEMBER: '/service/friend/get_chat_session_member',
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

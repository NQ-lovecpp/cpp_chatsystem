/**
 * 消息相关 API
 */

import { httpPostWithSession } from './httpClient';

const API = {
    GET_RECENT: '/service/message_storage/get_recent',
    GET_HISTORY: '/service/message_storage/get_history',
    SEARCH_HISTORY: '/service/message_storage/search_history',
    NEW_MESSAGE: '/service/message_transmit/new_message',
};

// 消息类型
export const MessageType = {
    STRING: 0,
    IMAGE: 1,
    FILE: 2,
    SPEECH: 3,
};

/**
 * 获取最近消息
 */
export async function getRecentMessages(sessionId, userId, chatSessionId, msgCount = 50) {
    return httpPostWithSession(API.GET_RECENT, {
        chat_session_id: chatSessionId,
        msg_count: msgCount,
    }, sessionId, userId);
}

/**
 * 获取历史消息
 */
export async function getHistoryMessages(sessionId, userId, chatSessionId, startTime, overTime) {
    return httpPostWithSession(API.GET_HISTORY, {
        chat_session_id: chatSessionId,
        start_time: startTime,
        over_time: overTime,
    }, sessionId, userId);
}

/**
 * 搜索消息
 */
export async function searchMessages(sessionId, userId, chatSessionId, searchKey) {
    return httpPostWithSession(API.SEARCH_HISTORY, {
        chat_session_id: chatSessionId,
        search_key: searchKey,
    }, sessionId, userId);
}

/**
 * 发送文本消息
 */
export async function sendTextMessage(sessionId, userId, chatSessionId, content) {
    return httpPostWithSession(API.NEW_MESSAGE, {
        chat_session_id: chatSessionId,
        message: {
            message_type: MessageType.STRING,
            string_message: { content },
        },
    }, sessionId, userId);
}

/**
 * 发送图片消息
 */
export async function sendImageMessage(sessionId, userId, chatSessionId, imageContent) {
    return httpPostWithSession(API.NEW_MESSAGE, {
        chat_session_id: chatSessionId,
        message: {
            message_type: MessageType.IMAGE,
            image_message: { image_content: imageContent },
        },
    }, sessionId, userId);
}

/**
 * 发送文件消息
 */
export async function sendFileMessage(sessionId, userId, chatSessionId, fileName, fileSize, fileContents) {
    return httpPostWithSession(API.NEW_MESSAGE, {
        chat_session_id: chatSessionId,
        message: {
            message_type: MessageType.FILE,
            file_message: {
                file_name: fileName,
                file_size: fileSize,
                file_contents: fileContents,
            },
        },
    }, sessionId, userId);
}

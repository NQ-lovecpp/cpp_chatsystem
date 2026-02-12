/**
 * 消息相关 API
 */

import { httpPostWithSession } from './httpClient';

const API = {
    GET_RECENT: '/service/message_storage/get_recent',
    GET_HISTORY: '/service/message_storage/get_history',
    SEARCH_HISTORY: '/service/message_storage/search_history',
    NEW_MESSAGE: '/service/message_transmit/new_message',
    GET_SINGLE_FILE: '/service/file/get_single_file',
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
 * @param {boolean} excludeFileContent - 是否排除文件二进制内容
 */
export async function getRecentMessages(sessionId, userId, chatSessionId, msgCount = 50, excludeFileContent = false) {
    return httpPostWithSession(API.GET_RECENT, {
        chat_session_id: chatSessionId,
        msg_count: msgCount,
        exclude_file_content: excludeFileContent,
    }, sessionId, userId);
}

/**
 * 获取历史消息
 * @param {boolean} excludeFileContent - 是否排除文件二进制内容
 */
export async function getHistoryMessages(sessionId, userId, chatSessionId, startTime, overTime, excludeFileContent = false) {
    return httpPostWithSession(API.GET_HISTORY, {
        chat_session_id: chatSessionId,
        start_time: startTime,
        over_time: overTime,
        exclude_file_content: excludeFileContent,
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
 * @param {string} imageContent - base64 编码的图片内容（不含 data URL 前缀）
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
 * @param {Uint8Array|string} fileContents - 文件内容（base64 或二进制）
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

/**
 * 获取单个文件内容
 * @param {string} fileId - 文件ID
 * @returns 包含 file_data 的响应
 */
export async function getSingleFile(sessionId, userId, fileId) {
    return httpPostWithSession(API.GET_SINGLE_FILE, {
        file_id: fileId,
    }, sessionId, userId);
}

/**
 * HTTP 客户端封装
 * 支持 Protobuf 请求/响应
 */

import { getHttpBaseUrl, makeRequestId } from './config';

/**
 * 编码 varint
 */
function encodeVarint(value) {
    const bytes = [];
    while (value > 127) {
        bytes.push((value & 0x7f) | 0x80);
        value >>>= 7;
    }
    bytes.push(value);
    return new Uint8Array(bytes);
}

/**
 * 编码字符串字段
 * field_number << 3 | wire_type(2 for length-delimited)
 */
function encodeStringField(fieldNumber, value) {
    if (!value) return new Uint8Array(0);

    const encoder = new TextEncoder();
    const strBytes = encoder.encode(value);
    const tag = encodeVarint((fieldNumber << 3) | 2);
    const length = encodeVarint(strBytes.length);

    const result = new Uint8Array(tag.length + length.length + strBytes.length);
    let offset = 0;
    result.set(tag, offset); offset += tag.length;
    result.set(length, offset); offset += length.length;
    result.set(strBytes, offset);
    return result;
}

/**
 * 编码 bool 字段
 */
function encodeBoolField(fieldNumber, value) {
    if (value === undefined || value === null) return new Uint8Array(0);
    const tag = encodeVarint((fieldNumber << 3) | 0);
    const val = encodeVarint(value ? 1 : 0);
    return concatArrays(tag, val);
}

/**
 * 合并多个 Uint8Array
 */
function concatArrays(...arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

/**
 * 编码 UserLoginReq
 * message UserLoginReq {
 *   string request_id = 1;
 *   string nickname = 2;
 *   string password = 3;
 *   string verify_code_id = 4;
 *   string verify_code = 5;
 * }
 */
function encodeUserLoginReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.nickname),
        encodeStringField(3, data.password),
        encodeStringField(4, data.verify_code_id || ''),
        encodeStringField(5, data.verify_code || '')
    );
}

/**
 * 编码 UserRegisterReq
 */
function encodeUserRegisterReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.nickname),
        encodeStringField(3, data.password),
        encodeStringField(4, data.verify_code_id || ''),
        encodeStringField(5, data.verify_code || '')
    );
}

/**
 * 编码 GetUserInfoReq
 */
function encodeGetUserInfoReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.user_id || ''),
        encodeStringField(3, data.session_id || '')
    );
}

/**
 * 编码 GetFriendListReq
 * message GetFriendListReq {
 *   string request_id = 1;
 *   string user_id = 2;
 *   string session_id = 3;
 * }
 */
function encodeGetFriendListReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.user_id || ''),
        encodeStringField(3, data.session_id || '')
    );
}

/**
 * 编码 GetChatSessionListReq
 * message GetChatSessionListReq {
 *   string request_id = 1;
 *   string session_id = 2;
 *   string user_id = 3;
 * }
 */
function encodeGetChatSessionListReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.session_id || ''),
        encodeStringField(3, data.user_id || '')
    );
}

/**
 * 编码 FriendSearchReq
 * message FriendSearchReq {
 *   string request_id = 1;
 *   string search_key = 2;
 *   string session_id = 3;
 *   string user_id = 4;
 * }
 */
function encodeFriendSearchReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.search_key || ''),
        encodeStringField(3, data.session_id || ''),
        encodeStringField(4, data.user_id || '')
    );
}

/**
 * 编码 GetPendingFriendEventListReq
 * message GetPendingFriendEventListReq {
 *   string request_id = 1;
 *   string session_id = 2;
 *   string user_id = 3;
 * }
 */
function encodeGetPendingFriendEventListReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.session_id || ''),
        encodeStringField(3, data.user_id || '')
    );
}

/**
 * 编码 FriendAddReq (发送好友申请)
 * message FriendAddReq {
 *   string request_id = 1;
 *   string session_id = 2;
 *   string user_id = 3;
 *   string respondent_id = 4;
 * }
 */
function encodeFriendAddReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.session_id || ''),
        encodeStringField(3, data.user_id || ''),
        encodeStringField(4, data.respondent_id || '')
    );
}

/**
 * 编码 FriendAddProcessReq (处理好友申请)
 * message FriendAddProcessReq {
 *   string request_id = 1;
 *   string notify_event_id = 2;
 *   bool agree = 3;
 *   string apply_user_id = 4;
 *   string session_id = 5;
 *   string user_id = 6;
 * }
 */
function encodeFriendAddProcessReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.notify_event_id || ''),
        encodeBoolField(3, data.agree),
        encodeStringField(4, data.apply_user_id || ''),
        encodeStringField(5, data.session_id || ''),
        encodeStringField(6, data.user_id || '')
    );
}

/**
 * 编码 FriendRemoveReq (删除好友)
 * message FriendRemoveReq {
 *   string request_id = 1;
 *   string user_id = 2;
 *   string session_id = 3;
 *   string peer_id = 4;
 * }
 */
function encodeFriendRemoveReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.user_id || ''),
        encodeStringField(3, data.session_id || ''),
        encodeStringField(4, data.peer_id || '')
    );
}

/**
 * 编码 GetMultiUserInfoReq (批量获取用户信息)
 * message GetMultiUserInfoReq {
 *   string request_id = 1;
 *   repeated string user_id_list = 2;
 *   string session_id = 3;
 *   string user_id = 4;
 * }
 */
function encodeGetMultiUserInfoReq(data) {
    const parts = [
        encodeStringField(1, data.request_id),
    ];
    // 编码 repeated string
    if (data.user_id_list && data.user_id_list.length > 0) {
        for (const id of data.user_id_list) {
            parts.push(encodeStringField(2, id));
        }
    }
    parts.push(encodeStringField(3, data.session_id || ''));
    parts.push(encodeStringField(4, data.user_id || ''));
    return concatArrays(...parts);
}

/**
 * 编码 ChatSessionCreateReq (创建会话)
 * message ChatSessionCreateReq {
 *   string request_id = 1;
 *   string session_id = 2;
 *   string user_id = 3;
 *   string chat_session_name = 4;
 *   repeated string member_id_list = 5;
 * }
 */
function encodeChatSessionCreateReq(data) {
    const parts = [
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.session_id || ''),
        encodeStringField(3, data.user_id || ''),
        encodeStringField(4, data.chat_session_name || ''),
    ];
    if (data.member_id_list && data.member_id_list.length > 0) {
        for (const id of data.member_id_list) {
            parts.push(encodeStringField(5, id));
        }
    }
    return concatArrays(...parts);
}

/**
 * 编码 GetChatSessionMemberReq (获取会话成员)
 * message GetChatSessionMemberReq {
 *   string request_id = 1;
 *   string session_id = 2;
 *   string user_id = 3;
 *   string chat_session_id = 4;
 * }
 */
function encodeGetChatSessionMemberReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.session_id || ''),
        encodeStringField(3, data.user_id || ''),
        encodeStringField(4, data.chat_session_id || '')
    );
}

/**
 * 编码 int64 字段
 */
function encodeInt64Field(fieldNumber, value) {
    if (value === undefined || value === null) return new Uint8Array(0);
    const tag = encodeVarint((fieldNumber << 3) | 0);
    const val = encodeVarint(value);
    return concatArrays(tag, val);
}

/**
 * 编码 GetRecentMsgReq (获取最近消息)
 * message GetRecentMsgReq {
 *   string request_id = 1;
 *   string chat_session_id = 2;
 *   int64 msg_count = 3;
 *   int64 cur_time = 4;
 *   string user_id = 5;
 *   string session_id = 6;
 * }
 */
function encodeGetRecentMsgReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.chat_session_id || ''),
        encodeInt64Field(3, data.msg_count || 50),
        encodeInt64Field(4, data.cur_time || 0),
        encodeStringField(5, data.user_id || ''),
        encodeStringField(6, data.session_id || '')
    );
}

/**
 * 编码 GetHistoryMsgReq (获取历史消息)
 * message GetHistoryMsgReq {
 *   string request_id = 1;
 *   string chat_session_id = 2;
 *   int64 start_time = 3;
 *   int64 over_time = 4;
 *   string user_id = 5;
 *   string session_id = 6;
 * }
 */
function encodeGetHistoryMsgReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.chat_session_id || ''),
        encodeInt64Field(3, data.start_time || 0),
        encodeInt64Field(4, data.over_time || 0),
        encodeStringField(5, data.user_id || ''),
        encodeStringField(6, data.session_id || '')
    );
}

/**
 * 编码 MsgSearchReq (搜索消息)
 * message MsgSearchReq {
 *   string request_id = 1;
 *   string user_id = 2;
 *   string session_id = 3;
 *   string chat_session_id = 4;
 *   string search_key = 5;
 * }
 */
function encodeMsgSearchReq(data) {
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.user_id || ''),
        encodeStringField(3, data.session_id || ''),
        encodeStringField(4, data.chat_session_id || ''),
        encodeStringField(5, data.search_key || '')
    );
}

/**
 * 编码嵌套消息 (length-delimited)
 */
function encodeNestedField(fieldNumber, bytes) {
    if (!bytes || bytes.length === 0) return new Uint8Array(0);
    const tag = encodeVarint((fieldNumber << 3) | 2);
    const length = encodeVarint(bytes.length);
    return concatArrays(tag, length, bytes);
}

/**
 * 编码 MessageContent
 * message MessageContent {
 *   MessageType message_type = 1;
 *   oneof content {
 *     StringMessageInfo string_message = 2;
 *     ImageMessageInfo image_message = 3;
 *     FileMessageInfo file_message = 4;
 *     SpeechMessageInfo speech_message = 5;
 *   }
 * }
 */
function encodeMessageContent(message) {
    if (!message) return new Uint8Array(0);

    const parts = [];
    // message_type (enum as varint)
    const typeTag = encodeVarint((1 << 3) | 0);
    const typeVal = encodeVarint(message.message_type || 0);
    parts.push(concatArrays(typeTag, typeVal));

    // 根据类型编码内容
    if (message.message_type === 0 && message.string_message) {
        // StringMessageInfo: { content: string }
        const contentBytes = encodeStringField(1, message.string_message.content || '');
        parts.push(encodeNestedField(2, contentBytes));
    } else if (message.message_type === 1 && message.image_message) {
        // ImageMessageInfo: { image_content: bytes, file_id: string }
        const imgParts = [];
        if (message.image_message.image_content) {
            // 编码 bytes 字段
            const imgData = typeof message.image_message.image_content === 'string'
                ? new TextEncoder().encode(message.image_message.image_content)
                : message.image_message.image_content;
            const imgTag = encodeVarint((1 << 3) | 2);
            const imgLen = encodeVarint(imgData.length);
            imgParts.push(concatArrays(imgTag, imgLen, imgData));
        }
        if (message.image_message.file_id) {
            imgParts.push(encodeStringField(2, message.image_message.file_id));
        }
        if (imgParts.length > 0) {
            parts.push(encodeNestedField(3, concatArrays(...imgParts)));
        }
    } else if (message.message_type === 2 && message.file_message) {
        // FileMessageInfo: { file_name: string, file_size: int64, file_contents: bytes, file_id: string }
        const fileParts = [];
        fileParts.push(encodeStringField(1, message.file_message.file_name || ''));
        fileParts.push(encodeInt64Field(2, message.file_message.file_size || 0));
        if (message.file_message.file_contents) {
            const fileData = typeof message.file_message.file_contents === 'string'
                ? new TextEncoder().encode(message.file_message.file_contents)
                : message.file_message.file_contents;
            const fileTag = encodeVarint((3 << 3) | 2);
            const fileLen = encodeVarint(fileData.length);
            fileParts.push(concatArrays(fileTag, fileLen, fileData));
        }
        if (message.file_message.file_id) {
            fileParts.push(encodeStringField(4, message.file_message.file_id));
        }
        parts.push(encodeNestedField(4, concatArrays(...fileParts)));
    }

    return concatArrays(...parts);
}

/**
 * 编码 NewMessageReq (发送新消息)
 * message NewMessageReq {
 *   string request_id = 1;
 *   string user_id = 2;
 *   string session_id = 3;
 *   string chat_session_id = 4;
 *   MessageContent message = 5;
 * }
 */
function encodeNewMessageReq(data) {
    const msgContent = encodeMessageContent(data.message);
    return concatArrays(
        encodeStringField(1, data.request_id),
        encodeStringField(2, data.user_id || ''),
        encodeStringField(3, data.session_id || ''),
        encodeStringField(4, data.chat_session_id || ''),
        encodeNestedField(5, msgContent)
    );
}

// 消息编码器映射
const encoders = {
    // 用户相关
    '/service/user/username_login': encodeUserLoginReq,
    '/service/user/username_register': encodeUserRegisterReq,
    '/service/user/get_user_info': encodeGetUserInfoReq,
    '/service/user/get_multi_user_info': encodeGetMultiUserInfoReq,
    // 好友相关
    '/service/friend/get_friend_list': encodeGetFriendListReq,
    '/service/friend/search_friend': encodeFriendSearchReq,
    '/service/friend/add_friend_apply': encodeFriendAddReq,
    '/service/friend/add_friend_process': encodeFriendAddProcessReq,
    '/service/friend/remove_friend': encodeFriendRemoveReq,
    '/service/friend/get_pending_friend_events': encodeGetPendingFriendEventListReq,
    // 会话相关
    '/service/friend/get_chat_session_list': encodeGetChatSessionListReq,
    '/service/friend/create_chat_session': encodeChatSessionCreateReq,
    '/service/friend/get_chat_session_member': encodeGetChatSessionMemberReq,
    // 消息相关
    '/service/message_storage/get_recent': encodeGetRecentMsgReq,
    '/service/message_storage/get_history': encodeGetHistoryMsgReq,
    '/service/message_storage/search_history': encodeMsgSearchReq,
    '/service/message_transmit/new_message': encodeNewMessageReq,
};

/**
 * 解码 varint，返回 [value, newPos]
 */
function decodeVarint(bytes, pos) {
    let value = 0;
    let shift = 0;
    while (pos < bytes.length) {
        const b = bytes[pos++];
        value |= (b & 0x7f) << shift;
        if ((b & 0x80) === 0) break;
        shift += 7;
    }
    return [value, pos];
}

/**
 * 解码嵌套的 protobuf 消息 (如 UserInfo)
 */
function decodeNestedMessage(bytes) {
    const result = {};
    let pos = 0;

    while (pos < bytes.length) {
        const [tagValue, newPos1] = decodeVarint(bytes, pos);
        pos = newPos1;
        const fieldNum = tagValue >> 3;
        const wireType = tagValue & 0x07;

        if (wireType === 0) {
            // Varint
            const [value, newPos2] = decodeVarint(bytes, pos);
            pos = newPos2;
            result[`field${fieldNum}`] = value;
        } else if (wireType === 2) {
            // Length-delimited
            const [length, newPos2] = decodeVarint(bytes, pos);
            pos = newPos2;
            if (pos + length > bytes.length) break;
            const data = bytes.slice(pos, pos + length);
            pos += length;

            try {
                const str = new TextDecoder().decode(data);
                // 根据字段号映射到具体字段名
                // UserInfo: user_id=1, nickname=2, description=3, phone=4, avatar_id=5
                if (fieldNum === 1) result.user_id = str;
                else if (fieldNum === 2) result.nickname = str;
                else if (fieldNum === 3) result.description = str;
                else if (fieldNum === 4) result.phone = str;
                else if (fieldNum === 5) result.avatar_id = str;
                else result[`field${fieldNum}`] = str;
            } catch {
                result[`field${fieldNum}_bytes`] = Array.from(data);
            }
        } else {
            break;
        }
    }
    return result;
}

/**
 * 解码 protobuf 响应
 */
function decodeProtobufResponse(buffer) {
    try {
        const bytes = new Uint8Array(buffer);
        const result = { _rawFields: {} };
        let pos = 0;

        // 用于存储 repeated 字段
        const repeatedFields = {};

        while (pos < bytes.length) {
            if (pos >= bytes.length) break;

            // 读取 tag
            const [tagValue, newPos1] = decodeVarint(bytes, pos);
            pos = newPos1;
            const fieldNum = tagValue >> 3;
            const wireType = tagValue & 0x07;

            if (wireType === 0) {
                // Varint
                const [value, newPos2] = decodeVarint(bytes, pos);
                pos = newPos2;

                // 字段映射
                if (fieldNum === 2) result.success = value === 1;
                else result._rawFields[`field_${fieldNum}_int`] = value;
            } else if (wireType === 2) {
                // Length-delimited
                const [length, newPos2] = decodeVarint(bytes, pos);
                pos = newPos2;

                if (pos + length > bytes.length) break;

                const data = bytes.slice(pos, pos + length);
                pos += length;

                // 尝试解析为字符串
                let strValue = null;
                try {
                    strValue = new TextDecoder().decode(data);
                } catch {
                    // ignore
                }

                if (fieldNum === 1) {
                    result.request_id = strValue;
                } else if (fieldNum === 3) {
                    result.errmsg = strValue;
                } else if (fieldNum === 4) {
                    // 字段4可能是:
                    // - login_session_id (UserLoginRsp - 可读字符串)
                    // - user_info / friend_list / chat_session_info_list (嵌套消息)
                    // 判断标准: 如果字符串以可读字符开头且不包含不可打印字符，则是字符串
                    const isReadableString = strValue && /^[\x20-\x7E]+$/.test(strValue.substring(0, 20));

                    if (isReadableString && !repeatedFields[4]) {
                        // 第一次遇到字段4且是可读字符串，认为是 login_session_id
                        result.login_session_id = strValue;
                    } else {
                        // 否则尝试解析为嵌套消息
                        try {
                            const nested = decodeNestedMessage(data);
                            if (!repeatedFields[fieldNum]) {
                                repeatedFields[fieldNum] = [];
                            }
                            repeatedFields[fieldNum].push(nested);
                        } catch {
                            // 解析失败，保存字符串
                            if (!result.login_session_id) {
                                result.login_session_id = strValue;
                            }
                        }
                    }
                } else if (fieldNum === 5) {
                    result.user_id = strValue;
                } else {
                    result._rawFields[`field_${fieldNum}`] = strValue;
                }
            } else {
                // 未知类型，跳过
                console.warn('Unknown wire type:', wireType, 'at field:', fieldNum);
                break;
            }
        }

        // 处理 repeated 字段
        if (repeatedFields[4] && repeatedFields[4].length > 0) {
            // 如果只有一个元素，则可能是 GetUserInfoRsp 的 user_info（单个对象）
            if (repeatedFields[4].length === 1) {
                result.user_info = repeatedFields[4][0];
            } else {
                // 多个元素是列表（好友列表、搜索结果等）
                result.user_info = repeatedFields[4];
            }
            result.friend_list = repeatedFields[4];
            result.chat_session_info_list = repeatedFields[4]; // 会话列表
            result.member_info_list = repeatedFields[4]; // 成员列表
            result.event = repeatedFields[4]; // 好友申请事件列表
        }

        // 确保有 success 字段
        if (result.success === undefined) {
            result.success = !result.errmsg;
        }

        return result;
    } catch (error) {
        console.error('Failed to decode protobuf:', error);
        return null;
    }
}

/**
 * 发送 HTTP POST 请求（使用 Protobuf 格式）
 */
export async function httpPost(path, data) {
    const baseUrl = getHttpBaseUrl();
    const url = `${baseUrl}${path}`;

    // 添加 request_id
    const requestData = {
        request_id: makeRequestId(),
        ...data,
    };

    console.log('[HTTP] Request:', path, requestData);

    try {
        let body;
        let contentType;

        // 如果有对应的编码器，使用 protobuf 格式
        const encoder = encoders[path];
        if (encoder) {
            body = encoder(requestData);
            contentType = 'application/x-protobuf';
            console.log('[HTTP] Using protobuf encoding, body length:', body.length);
        } else {
            // 否则使用 JSON (不推荐，后端可能无法解析)
            body = JSON.stringify(requestData);
            contentType = 'application/json';
            console.warn('[HTTP] No protobuf encoder for path:', path, '- using JSON (may not work)');
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
            },
            body: body,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 解析响应
        const buffer = await response.arrayBuffer();
        console.log('[HTTP] Response buffer length:', buffer.byteLength);

        const decoded = decodeProtobufResponse(buffer);
        console.log('[HTTP] Decoded response:', decoded);

        if (decoded) {
            return decoded;
        }

        return {
            success: false,
            errmsg: '无法解析服务器响应'
        };
    } catch (error) {
        console.error('HTTP request failed:', error);
        return {
            success: false,
            errmsg: error.message || '网络请求失败',
        };
    }
}

/**
 * 带 session_id 和 user_id 的请求
 */
export async function httpPostWithSession(path, data, sessionId, userId) {
    return httpPost(path, {
        ...data,
        session_id: sessionId,
        user_id: userId,
    });
}

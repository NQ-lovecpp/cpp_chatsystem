/**
 * Protobuf 消息处理工具
 * 使用 protobufjs 进行编码和解码
 */

import protobuf from 'protobufjs';

// 缓存已加载的 proto 定义
const protoCache = {};

// Proto 文件路径映射
const PROTO_FILES = {
    user: '/src/proto/user.proto',
    base: '/src/proto/base.proto',
    friend: '/src/proto/friend.proto',
    message_storage: '/src/proto/message_storage.proto',
    message_transmit: '/src/proto/message_transmit.proto',
    notify: '/src/proto/notify.proto',
    file: '/src/proto/file.proto',
    gateway: '/src/proto/gateway.proto',
};

/**
 * 加载 proto 定义
 */
async function loadProto(name) {
    if (protoCache[name]) {
        return protoCache[name];
    }

    const path = PROTO_FILES[name];
    if (!path) {
        throw new Error(`Unknown proto: ${name}`);
    }

    try {
        const root = await protobuf.load(path);
        protoCache[name] = root;
        return root;
    } catch (error) {
        console.error(`Failed to load proto ${name}:`, error);
        throw error;
    }
}

/**
 * 编码消息为 protobuf 二进制
 */
export async function encodeMessage(protoName, messageName, data) {
    try {
        const root = await loadProto(protoName);
        const MessageType = root.lookupType(`bite_im.${messageName}`);
        const errMsg = MessageType.verify(data);
        if (errMsg) {
            console.warn('Message verification warning:', errMsg);
        }
        const message = MessageType.create(data);
        return MessageType.encode(message).finish();
    } catch (error) {
        console.error('Failed to encode message:', error);
        throw error;
    }
}

/**
 * 解码 protobuf 二进制为消息
 */
export async function decodeMessage(protoName, messageName, buffer) {
    try {
        const root = await loadProto(protoName);
        const MessageType = root.lookupType(`bite_im.${messageName}`);
        const message = MessageType.decode(new Uint8Array(buffer));
        return MessageType.toObject(message, {
            longs: String,
            enums: String,
            bytes: String,
            defaults: true,
        });
    } catch (error) {
        console.error('Failed to decode message:', error);
        throw error;
    }
}

// 导出常用消息类型的快捷方法
export const UserProto = {
    encodeLoginReq: (data) => encodeMessage('user', 'UserLoginReq', data),
    decodeLoginRsp: (buffer) => decodeMessage('user', 'UserLoginRsp', buffer),
    encodeRegisterReq: (data) => encodeMessage('user', 'UserRegisterReq', data),
    decodeRegisterRsp: (buffer) => decodeMessage('user', 'UserRegisterRsp', buffer),
    encodeGetUserInfoReq: (data) => encodeMessage('user', 'GetUserInfoReq', data),
    decodeGetUserInfoRsp: (buffer) => decodeMessage('user', 'GetUserInfoRsp', buffer),
};

export const FriendProto = {
    encodeGetFriendListReq: (data) => encodeMessage('friend', 'GetFriendListReq', data),
    decodeGetFriendListRsp: (buffer) => decodeMessage('friend', 'GetFriendListRsp', buffer),
    encodeGetChatSessionListReq: (data) => encodeMessage('friend', 'GetChatSessionListReq', data),
    decodeGetChatSessionListRsp: (buffer) => decodeMessage('friend', 'GetChatSessionListRsp', buffer),
};

export default {
    encodeMessage,
    decodeMessage,
    UserProto,
    FriendProto,
};

/**
 * WebSocket 客户端
 * 处理实时消息通信
 */

import { getWebSocketUrl, makeRequestId } from './config';

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
 * 编码 ClientAuthenticationReq
 * message ClientAuthenticationReq {
 *   string request_id = 1;
 *   string session_id = 2;
 * }
 */
function encodeClientAuthenticationReq(requestId, sessionId) {
    return concatArrays(
        encodeStringField(1, requestId),
        encodeStringField(2, sessionId)
    );
}

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.sessionId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.messageHandlers = new Map();
        this.isConnecting = false;
    }

    /**
     * 连接 WebSocket
     */
    connect(sessionId) {
        if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        this.sessionId = sessionId;
        this.isConnecting = true;

        const url = getWebSocketUrl();
        console.log('[WebSocket] Connecting to:', url);

        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer'; // 接收二进制数据

        this.ws.onopen = () => {
            console.log('[WebSocket] Connected');
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            // 发送身份认证消息
            this.sendAuth();
        };

        this.ws.onclose = (event) => {
            console.log('[WebSocket] Disconnected:', event.code, event.reason);
            this.isConnecting = false;
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('[WebSocket] Error:', error);
            this.isConnecting = false;
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(event.data);
        };
    }

    /**
     * 发送身份认证消息 (Protobuf 格式)
     */
    sendAuth() {
        if (!this.sessionId) {
            console.error('[WebSocket] No session ID for auth');
            return;
        }

        const requestId = makeRequestId();
        const authMessage = encodeClientAuthenticationReq(requestId, this.sessionId);

        // 调试: 显示发送的字节
        console.log('[WebSocket] Auth request_id:', requestId);
        console.log('[WebSocket] Auth session_id:', this.sessionId);
        console.log('[WebSocket] Auth message bytes:', Array.from(authMessage).map(b => b.toString(16).padStart(2, '0')).join(' '));
        console.log('[WebSocket] Auth message length:', authMessage.length);

        this.sendBinary(authMessage);
        console.log('[WebSocket] Auth message sent');
    }

    /**
     * 发送二进制消息
     */
    sendBinary(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            console.error('[WebSocket] Not connected, cannot send message');
        }
    }

    /**
     * 发送文本消息 (JSON)
     */
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            console.error('[WebSocket] Not connected, cannot send message');
        }
    }

    /**
     * 解码 varint
     */
    decodeVarint(bytes, pos) {
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
     * 解码 protobuf 通知消息
     */
    decodeNotifyMessage(buffer) {
        const bytes = new Uint8Array(buffer);
        const result = {};
        let pos = 0;

        while (pos < bytes.length) {
            const [tagValue, newPos1] = this.decodeVarint(bytes, pos);
            pos = newPos1;
            const fieldNum = tagValue >> 3;
            const wireType = tagValue & 0x07;

            if (wireType === 0) {
                // Varint
                const [value, newPos2] = this.decodeVarint(bytes, pos);
                pos = newPos2;
                if (fieldNum === 2) {
                    result.notify_type = value;
                    console.log('[WebSocket] Parsed notify_type:', value);
                } else {
                    console.log('[WebSocket] Ignored varint field:', fieldNum, value);
                }
            } else if (wireType === 2) {
                // Length-delimited
                const [length, newPos2] = this.decodeVarint(bytes, pos);
                pos = newPos2;
                if (pos + length > bytes.length) break;
                const data = bytes.slice(pos, pos + length);
                pos += length;

                // 保存嵌套消息数据用于后续处理
                result[`field_${fieldNum}_data`] = data;
            }
        }

        return result;
    }

    /**
     * 处理接收到的消息
     */
    handleMessage(data) {
        console.log('[WebSocket] Received message');

        try {
            let message;

            if (data instanceof ArrayBuffer) {
                // 处理二进制数据 (protobuf)
                message = this.decodeNotifyMessage(data);
                console.log('[WebSocket] Decoded notify message:', message);
            } else if (typeof data === 'string') {
                message = JSON.parse(data);
            } else {
                console.log('[WebSocket] Unknown message type');
                return;
            }

            // 根据消息类型分发处理
            const notifyType = message.notify_type;
            if (notifyType !== undefined) {
                const handler = this.messageHandlers.get(notifyType);
                if (handler) {
                    handler(message);
                } else {
                    console.log('[WebSocket] Unhandled message type:', notifyType);
                }
            }
        } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
        }
    }

    /**
     * 注册消息处理器
     */
    onMessage(type, handler) {
        this.messageHandlers.set(type, handler);
    }

    /**
     * 移除消息处理器
     */
    offMessage(type) {
        this.messageHandlers.delete(type);
    }

    /**
     * 尝试重连
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('[WebSocket] Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`[WebSocket] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            if (this.sessionId) {
                this.connect(this.sessionId);
            }
        }, this.reconnectDelay);
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.sessionId = null;
        this.reconnectAttempts = this.maxReconnectAttempts; // 阻止重连
    }
}

// 单例实例
export const wsClient = new WebSocketClient();
export default wsClient;

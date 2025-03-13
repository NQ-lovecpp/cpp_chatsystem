import protobuf from 'protobufjs';

let root = null;
let protoTypes = {};

export const loadProtobufs = async () => {
  try {
    // 加载proto定义文件
    root = await protobuf.load([
      '/proto/base.proto',
      '/proto/user.proto',
      '/proto/friend.proto',
      '/proto/message_transmit.proto',
      '/proto/message_storage.proto',
      '/proto/notify.proto',
      '/proto/file.proto',
      '/proto/gateway.proto',
      '/proto/speech_recognition.proto'
    ]);
    
    // 预先查找常用消息类型
    protoTypes.UserLoginReq = root.lookupType('UserLoginReq');
    protoTypes.UserLoginRsp = root.lookupType('UserLoginRsp');
    protoTypes.FriendSearchReq = root.lookupType('FriendSearchReq');
    protoTypes.FriendSearchRsp = root.lookupType('FriendSearchRsp');
    protoTypes.GetHistoryMsgReq = root.lookupType('GetHistoryMsgReq');
    protoTypes.GetHistoryMsgRsp = root.lookupType('GetHistoryMsgRsp');
    protoTypes.NewMessageReq = root.lookupType('NewMessageReq');
    protoTypes.NewMessageRsp = root.lookupType('NewMessageRsp');
    protoTypes.NotifyMessage = root.lookupType('NotifyMessage');
    
    console.log('Protobuf definitions loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load protobuf definitions:', error);
    return false;
  }
};

// 编码请求消息
export const encodeRequest = (messageType, payload) => {
  try {
    const MessageType = protoTypes[messageType] || root.lookupType(messageType);
    const errMsg = MessageType.verify(payload);
    if (errMsg) {
      throw new Error(errMsg);
    }
    
    const message = MessageType.create(payload);
    return MessageType.encode(message).finish();
  } catch (error) {
    console.error(`Failed to encode ${messageType}:`, error);
    throw error;
  }
};

// 解码响应消息
export const decodeResponse = (messageType, buffer) => {
  try {
    const MessageType = protoTypes[messageType] || root.lookupType(messageType);
    const message = MessageType.decode(new Uint8Array(buffer));
    return MessageType.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
    });
  } catch (error) {
    console.error(`Failed to decode ${messageType}:`, error);
    throw error;
  }
};

// 专门用于解码通知消息
export const decodeNotifyMessage = async (buffer) => {
  try {
    const NotifyMessage = protoTypes.NotifyMessage || root.lookupType('NotifyMessage');
    const message = NotifyMessage.decode(new Uint8Array(buffer));
    return NotifyMessage.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
    });
  } catch (error) {
    console.error('Failed to decode notify message:', error);
    throw error;
  }
};
import { useDataCenter } from '@/store/dataCenter';
import { decodeNotifyMessage } from '../protobuf';

let websocket = null;

export const setupWebSocket = (sessionId) => {
  const wsUrl = `${import.meta.env.VITE_WS_URL}?sessionId=${sessionId}`;
  
  if (websocket) {
    websocket.close();
  }
  
  websocket = new WebSocket(wsUrl);
  
  websocket.binaryType = 'arraybuffer';
  
  websocket.onopen = () => {
    console.log('WebSocket连接已建立');
    // 发送心跳
    startHeartbeat();
  };
  
  websocket.onmessage = (event) => {
    const data = event.data;
    if (typeof data === 'string') {
      // 处理文本消息，可能是心跳响应
      console.log('收到文本消息:', data);
    } else {
      // 处理二进制消息，使用protobuf解码
      handleBinaryMessage(data);
    }
  };
  
  websocket.onclose = () => {
    console.log('WebSocket连接已关闭');
    stopHeartbeat();
    
    // 尝试重新连接
    setTimeout(() => {
      if (localStorage.getItem('sessionId')) {
        setupWebSocket(localStorage.getItem('sessionId'));
      }
    }, 3000);
  };
  
  websocket.onerror = (error) => {
    console.error('WebSocket错误:', error);
  };
  
  return websocket;
};

// 心跳定时器
let heartbeatTimer = null;

function startHeartbeat() {
  heartbeatTimer = setInterval(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send('ping');
    }
  }, 30000); // 30秒发送一次心跳
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// 处理二进制消息
async function handleBinaryMessage(data) {
  try {
    const notify = await decodeNotifyMessage(data);
    const dataCenter = useDataCenter();
    
    // 根据通知类型进行处理
    switch (notify.notifyType) {
      case 'CHAT_MESSAGE_NOTIFY':
        // 新消息通知
        dataCenter.receiveNewMessage(notify.newMessageInfo.messageInfo);
        break;
        
      case 'FRIEND_APPLY_NOTIFY':
        // 好友申请通知
        dataCenter.pendingFriendEvents.unshift(notify.friendApply);
        break;
        
      case 'FRIEND_APPLY_PROCESSED_NOTIFY':
        // 好友申请处理结果通知
        // 刷新好友列表
        dataCenter.getFriendList();
        break;
        
      case 'CHAT_SESSION_CREATE_NOTIFY':
        // 新会话创建通知
        dataCenter.getChatSessionList();
        break;
        
      case 'FRIEND_REMOVE_NOTIFY':
        // 好友删除通知
        dataCenter.getFriendList();
        break;
        
      default:
        console.log('未处理的通知类型:', notify.notifyType);
    }
  } catch (error) {
    console.error('处理二进制消息失败:', error);
  }
}

export const sendWebSocketMessage = (message) => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(message);
    return true;
  }
  return false;
};

export const closeWebSocket = () => {
  if (websocket) {
    websocket.close();
    websocket = null;
    stopHeartbeat();
  }
};
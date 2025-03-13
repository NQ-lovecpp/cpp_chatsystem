import axios from 'axios';
import { setupWebSocket } from './websocket';
import { loadProtobufs } from './protobuf';

// 创建axios实例
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-protobuf'
  }
});

// 请求拦截器 - 添加会话ID等身份信息
httpClient.interceptors.request.use(
  config => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      config.headers['Session-Id'] = sessionId;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器 - 处理protobuf响应
httpClient.interceptors.response.use(
  response => {
    // 处理二进制响应
    return response;
  },
  error => Promise.reject(error)
);

export const initNetwork = async () => {
  // 加载protobuf定义
  await loadProtobufs();
  
  // 初始化WebSocket连接
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    setupWebSocket(sessionId);
  }
  
  return {
    httpClient
  };
};

export default httpClient;
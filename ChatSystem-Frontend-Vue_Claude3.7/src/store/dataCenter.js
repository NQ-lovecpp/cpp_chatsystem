import { defineStore } from 'pinia';
import { userApi, friendApi, messageApi, sessionApi } from '@/network/api';

export const useDataCenter = defineStore('dataCenter', {
  state: () => ({
    currentUser: null,
    friendList: [],
    chatSessions: [],
    currentSessionId: null,
    currentMessages: [],
    pendingFriendEvents: [],
    searchUserResults: [],
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.currentUser,
    currentSession: (state) => 
      state.chatSessions.find(s => s.chatSessionId === state.currentSessionId),
    sessionById: (state) => (id) => 
      state.chatSessions.find(s => s.chatSessionId === id),
  },
  
  actions: {
    // 用户登录
    async login(phoneNumber, password) {
      const response = await userApi.login(phoneNumber, password);
      if (response.success) {
        this.currentUser = response.userInfo;
        localStorage.setItem('sessionId', response.sessionId);
        // 初始化WebSocket连接
        return true;
      }
      return false;
    },
    
    // 获取好友列表
    async getFriendList() {
      const response = await friendApi.getFriendList();
      if (response.success) {
        this.friendList = response.friendList;
      }
      return response.success;
    },
    
    // 搜索用户
    async searchUserAsync(keyword) {
      const response = await friendApi.searchUser(keyword);
      if (response.success) {
        this.searchUserResults = response.userInfoList;
      }
      return response.success;
    },
    
    // 获取会话列表
    async getChatSessionList() {
      const response = await sessionApi.getChatSessionList();
      if (response.success) {
        this.chatSessions = response.chatSessionInfoList;
      }
      return response.success;
    },
    
    // 获取消息历史
    async getHistoryMessages(sessionId, maxMessageId, count) {
      const response = await messageApi.getHistoryMsg(sessionId, maxMessageId, count);
      if (response.success) {
        if (sessionId === this.currentSessionId) {
          // 合并历史消息并按时间排序
          const allMessages = [...this.currentMessages, ...response.msgList];
          this.currentMessages = allMessages.sort((a, b) => a.msgId - b.msgId);
        }
      }
      return response.success;
    },
    
    // 添加好友申请
    async addFriendApplyAsync(userId) {
      return await friendApi.addFriendApply(userId);
    },
    
    // 创建群聊会话
    async createGroupChatSessionAsync(memberIdList) {
      const response = await sessionApi.createGroupChatSession(memberIdList);
      if (response.success) {
        // 更新会话列表
        this.getChatSessionList();
      }
      return response.success;
    },
    
    // 接收新消息
    receiveNewMessage(message) {
      // 处理会话和消息更新逻辑
      const sessionId = message.chatSessionId;
      
      // 更新会话的最新消息
      const sessionIndex = this.chatSessions.findIndex(s => s.chatSessionId === sessionId);
      if (sessionIndex !== -1) {
        const session = this.chatSessions[sessionIndex];
        session.lastMessage = message;
        session.unreadCount = sessionId === this.currentSessionId ? 0 : (session.unreadCount || 0) + 1;
        
        // 将当前会话移到顶部
        this.chatSessions.splice(sessionIndex, 1);
        this.chatSessions.unshift(session);
      }
      
      // 如果是当前会话，添加到消息列表
      if (sessionId === this.currentSessionId) {
        this.currentMessages.push(message);
      }
    },
    
    // 切换当前会话
    async switchSession(sessionId) {
      this.currentSessionId = sessionId;
      this.currentMessages = [];
      
      // 加载最近消息
      await this.getRecentMessages(sessionId);
      
      // 重置未读计数
      const sessionIndex = this.chatSessions.findIndex(s => s.chatSessionId === sessionId);
      if (sessionIndex !== -1) {
        this.chatSessions[sessionIndex].unreadCount = 0;
      }
    },
    
    // 获取最近消息
    async getRecentMessages(sessionId) {
      const response = await messageApi.getRecentMsg(sessionId, 20);
      if (response.success) {
        this.currentMessages = response.msgList.sort((a, b) => a.msgId - b.msgId);
      }
      return response.success;
    },
    
    // 发送消息
    async sendMessage(sessionId, content, type = 'text') {
      const message = {
        chatSessionId: sessionId,
        msgType: type,
        content: content,
        sendTime: Date.now(),
      };
      
      const response = await messageApi.sendNewMessage(message);
      if (response.success) {
        // 添加到本地消息列表
        message.msgId = response.msgId;
        message.senderId = this.currentUser.userId;
        this.currentMessages.push(message);
        
        // 更新会话的最新消息
        const sessionIndex = this.chatSessions.findIndex(s => s.chatSessionId === sessionId);
        if (sessionIndex !== -1) {
          const session = { ...this.chatSessions[sessionIndex] };
          session.lastMessage = message;
          
          // 将当前会话移到顶部
          this.chatSessions.splice(sessionIndex, 1);
          this.chatSessions.unshift(session);
        }
      }
      return response.success;
    },
  }
});
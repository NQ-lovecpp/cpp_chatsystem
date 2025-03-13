import { ref } from 'vue'

// 模拟用户数据
const mockUsers = [
  {
    userId: '1001',
    username: 'test',
    nickname: '测试用户',
    avatar: null,
    phoneNumber: '13800138000'
  }
]

// 模拟会话数据
const mockSessions = [
  {
    chatSessionId: '2001',
    chatSessionName: '测试会话',
    sessionType: 'single',
    avatar: null,
    lastMessage: {
      msgId: '3001',
      content: '欢迎使用聊天系统',
      msgType: 'text',
      senderId: '1002',
      sendTime: Date.now() - 3600000
    },
    unreadCount: 1,
    friendId: '1002'
  }
]

// 模拟好友数据
const mockFriends = [
  {
    userId: '1002',
    username: 'friend1',
    nickname: '好友1',
    avatar: null,
    description: '我是好友1'
  }
]

// 模拟消息数据
const mockMessages = {
  '2001': [
    {
      msgId: '3001',
      chatSessionId: '2001',
      content: '欢迎使用聊天系统',
      msgType: 'text',
      senderId: '1002',
      sendTime: Date.now() - 3600000
    }
  ]
}

// 模拟API响应
export const mockApi = {
  // 用户API
  userApi: {
    login: async (username, password) => {
      console.log('Mock login:', username, password)
      
      // 模拟登录验证
      const user = username === 'test' && password === '123456' 
        ? mockUsers[0] 
        : null
      
      if (user) {
        const sessionId = 'mock-session-id-' + Date.now()
        localStorage.setItem('sessionId', sessionId)
        return { 
          success: true, 
          userInfo: user,
          sessionId: sessionId
        }
      }
      
      return { success: false, errmsg: '用户名或密码错误' }
    },
    
    smsLogin: async (phoneNumber, verifyCode) => {
      console.log('Mock SMS login:', phoneNumber, verifyCode)
      
      if (verifyCode === '123456') {
        const user = mockUsers.find(u => u.phoneNumber === phoneNumber) || mockUsers[0]
        const sessionId = 'mock-session-id-' + Date.now()
        localStorage.setItem('sessionId', sessionId)
        
        return { 
          success: true, 
          userInfo: user,
          sessionId: sessionId
        }
      }
      
      return { success: false, errmsg: '验证码错误' }
    },
    
    sendVerifyCode: async (phoneNumber) => {
      console.log('Mock send verify code to:', phoneNumber)
      return { success: true }
    },
    
    getUserInfo: async () => {
      return { success: true, userInfo: mockUsers[0] }
    }
  },
  
  // 好友API
  friendApi: {
    getFriendList: async () => {
      return { success: true, friendList: mockFriends }
    },
    
    searchUser: async (keyword) => {
      const results = mockUsers.filter(u => 
        u.username.includes(keyword) || 
        u.nickname.includes(keyword)
      )
      return { success: true, userInfoList: results }
    },
    
    addFriendApply: async () => {
      return { success: true }
    }
  },
  
  // 会话API
  sessionApi: {
    getChatSessionList: async () => {
      return { success: true, chatSessionInfoList: mockSessions }
    },
    
    createGroupChatSession: async (memberList, name) => {
      console.log('Create group:', memberList, name)
      return { success: true }
    }
  },
  
  // 消息API
  messageApi: {
    getHistoryMsg: async (sessionId) => {
      const messages = mockMessages[sessionId] || []
      return { success: true, msgList: messages }
    },
    
    getRecentMsg: async (sessionId) => {
      const messages = mockMessages[sessionId] || []
      return { success: true, msgList: messages }
    },
    
    sendNewMessage: async (message) => {
      console.log('Send message:', message)
      const msgId = 'msg-' + Date.now()
      
      // 添加到模拟消息列表
      if (!mockMessages[message.chatSessionId]) {
        mockMessages[message.chatSessionId] = []
      }
      
      mockMessages[message.chatSessionId].push({
        msgId,
        ...message,
        senderId: mockUsers[0].userId,
        sendTime: Date.now()
      })
      
      return { success: true, msgId }
    }
  }
}

// 应用模拟API钩子
export function useMockApi() {
  // 替换原有API调用
  if (window.USE_MOCK_API) {
    console.log('Mock API is enabled')
    return mockApi
  }
  
  return null
}

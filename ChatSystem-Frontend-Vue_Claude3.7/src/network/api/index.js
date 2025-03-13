import httpClient from '../index';
import { encodeRequest, decodeResponse } from '../protobuf';


// Add this to the top of your network/api/index.js file
// Define mockApi or set it to null
const mockApi = typeof window !== 'undefined' && window.USE_MOCK_API ? window.mockApi : null;

// 用户相关API
export const userApi = {
  // 获取短信验证码
  async sendVerifyCode(phoneNumber) {
    if (mockApi) return mockApi.userApi.sendVerifyCode(phoneNumber);
    
    const payload = {
      request_id: Date.now().toString(),
      phone_number: phoneNumber
    };
    
    const encodedRequest = encodeRequest('PhoneVerifyCodeReq', payload);
    const response = await httpClient.post('/phone_verify_code', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('PhoneVerifyCodeRsp', response.data);
  },
  
  // 用户名密码登录
  async login(username, password) {
    if (mockApi) return mockApi.userApi.login(username, password);
    
    const payload = {
      request_id: Date.now().toString(),
      username,
      password
    };
    
    const encodedRequest = encodeRequest('UserLoginReq', payload);
    const response = await httpClient.post('/user_login', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('UserLoginRsp', response.data);
  },
  
  // 手机号验证码登录
  async smsLogin(phoneNumber, verifyCode) {
    if (mockApi) return mockApi.userApi.smsLogin(phoneNumber, verifyCode);
    
    const payload = {
      request_id: Date.now().toString(),
      phone_number: phoneNumber,
      verify_code: verifyCode
    };
    
    const encodedRequest = encodeRequest('PhoneLoginReq', payload);
    const response = await httpClient.post('/phone_login', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('PhoneLoginRsp', response.data);
  },
  
  // 获取用户信息
  async getUserInfo() {
    if (mockApi) return mockApi.userApi.getUserInfo();
    
    const sessionId = localStorage.getItem('sessionId');
    const payload = {
      request_id: Date.now().toString(),
      session_id: sessionId
    };
    
    const encodedRequest = encodeRequest('GetUserInfoReq', payload);
    const response = await httpClient.post('/get_user_info', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('GetUserInfoRsp', response.data);
  },



  // 设置用户头像
  async setUserAvatar(sessionId, avatarData) {
    const payload = {
      request_id: Date.now().toString(),
      session_id: sessionId,
      avatar: avatarData
    };
    
    const encodedRequest = encodeRequest('SetUserAvatarReq', payload);
    const response = await httpClient.post('/set_user_avatar', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('SetUserAvatarRsp', response.data);
  }
};

// Add the missing messageApi export - these methods were incorrectly under friendApi
export const messageApi = {
  // 获取历史消息
  async getHistoryMsg(chatSessionId, maxMsgId, count) {
    if (mockApi) return mockApi.messageApi.getHistoryMsg(chatSessionId);
    
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      chat_session_id: chatSessionId,
      max_msg_id: maxMsgId || '0',
      msg_count: count || 20
    };
    
    const encodedRequest = encodeRequest('GetHistoryMsgReq', payload);
    const response = await httpClient.post('/get_history_msg', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('GetHistoryMsgRsp', response.data);
  },
  
  // 获取最近消息
  async getRecentMsg(chatSessionId, count) {
    if (mockApi) return mockApi.messageApi.getRecentMsg(chatSessionId);
    
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      chat_session_id: chatSessionId,
      msg_count: count || 20
    };
    
    const encodedRequest = encodeRequest('GetRecentMsgReq', payload);
    const response = await httpClient.post('/get_recent_msg', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('GetRecentMsgRsp', response.data);
  },
  
  // 发送新消息
  async sendNewMessage(message) {
    if (mockApi) return mockApi.messageApi.sendNewMessage(message);
    
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      chat_session_id: message.chatSessionId,
      msg_type: message.msgType,
      content: message.content
    };
    
    const encodedRequest = encodeRequest('NewMessageReq', payload);
    const response = await httpClient.post('/new_message', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('NewMessageRsp', response.data);
  },
  
  // 搜索消息
  async searchMessage(keyword, chatSessionId) {
    if (mockApi) return mockApi.messageApi.searchMessage(keyword, chatSessionId);
    
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      chat_session_id: chatSessionId,
      search_text: keyword
    };
    
    const encodedRequest = encodeRequest('MsgSearchReq', payload);
    const response = await httpClient.post('/msg_search', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('MsgSearchRsp', response.data);
  }
};

// 好友相关API
export const friendApi = {
  // 获取历史消息
  async getHistoryMsg(chatSessionId, maxMsgId, count) {
    if (mockApi) return mockApi.messageApi.getHistoryMsg(chatSessionId);
    
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      chat_session_id: chatSessionId,
      max_msg_id: maxMsgId || '0',
      msg_count: count || 20
    };
    
    const encodedRequest = encodeRequest('GetHistoryMsgReq', payload);
    const response = await httpClient.post('/get_history_msg', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('GetHistoryMsgRsp', response.data);
  },
  
  // 获取最近消息
  async getRecentMsg(chatSessionId, count) {
    if (mockApi) return mockApi.messageApi.getRecentMsg(chatSessionId);
    
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      chat_session_id: chatSessionId,
      msg_count: count || 20
    };
    
    const encodedRequest = encodeRequest('GetRecentMsgReq', payload);
    const response = await httpClient.post('/get_recent_msg', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('GetRecentMsgRsp', response.data);
  },
  
  // 发送新消息
  async sendNewMessage(message) {
    if (mockApi) return mockApi.messageApi.sendNewMessage(message);
    
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      chat_session_id: message.chatSessionId,
      msg_type: message.msgType,
      content: message.content
    };
    
    const encodedRequest = encodeRequest('NewMessageReq', payload);
    const response = await httpClient.post('/new_message', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('NewMessageRsp', response.data);
  },
  
  // 搜索消息
  async searchMessage(keyword, chatSessionId) {
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      chat_session_id: chatSessionId,
      search_text: keyword
    };
    
    const encodedRequest = encodeRequest('MsgSearchReq', payload);
    const response = await httpClient.post('/msg_search', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('MsgSearchRsp', response.data);
  }
};

// 文件相关API
export const fileApi = {
  // 上传单个文件
  async uploadSingleFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', localStorage.getItem('sessionId'));
    
    const response = await httpClient.post('/file_put_single', formData);
    return response.data;
  },
  
  // 下载单个文件
  async downloadSingleFile(fileId) {
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      file_id: fileId
    };
    
    const encodedRequest = encodeRequest('GetSingleFileReq', payload);
    const response = await httpClient.post('/file_get_single', encodedRequest, {
      responseType: 'blob'
    });
    
    return response.data;
  }
};

// 语音识别API
export const speechApi = {
  // 语音转文字
  async speechRecognition(audioData) {
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      audio_data: audioData
    };
    
    const encodedRequest = encodeRequest('SpeechRecognitionReq', payload);
    const response = await httpClient.post('/speech_recognition', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('SpeechRecognitionRsp', response.data);
  }
};

// Add mock support to sessionApi
export const sessionApi = {
  // Get chat session list
  async getChatSessionList() {
    if (mockApi) return mockApi.sessionApi.getChatSessionList();
    
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId')
    };
    
    const encodedRequest = encodeRequest('GetChatSessionListReq', payload);
    const response = await httpClient.post('/get_chat_session_list', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('GetChatSessionListRsp', response.data);
  },
  
  // Create group chat session
  async createGroupChatSession(memberIdList, sessionName) {
    if (mockApi) return mockApi.sessionApi.createGroupChatSession(memberIdList, sessionName);
    
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      member_id_list: memberIdList,
      chat_session_name: sessionName
    };
    
    const encodedRequest = encodeRequest('ChatSessionCreateReq', payload);
    const response = await httpClient.post('/chat_session_create', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('ChatSessionCreateRsp', response.data);
  },
  
  // Get chat session members
  async getChatSessionMember(chatSessionId) {
    if (mockApi) return mockApi.sessionApi.getChatSessionMember(chatSessionId);
    
    const payload = {
      request_id: Date.now().toString(),
      session_id: localStorage.getItem('sessionId'),
      chat_session_id: chatSessionId
    };
    
    const encodedRequest = encodeRequest('GetChatSessionMemberReq', payload);
    const response = await httpClient.post('/get_chat_session_member', encodedRequest, {
      responseType: 'arraybuffer'
    });
    
    return decodeResponse('GetChatSessionMemberRsp', response.data);
  }
};
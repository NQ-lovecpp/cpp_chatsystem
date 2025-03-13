<template>
    <div class="main-container">
      <!-- 左侧边栏 - 会话列表 -->
      <div class="sidebar">
        <div class="user-profile" @click="openUserProfile">
          <el-avatar :size="45" :src="currentUser?.avatar || defaultAvatar"></el-avatar>
          <span class="username">{{ currentUser?.nickname || '用户名' }}</span>
        </div>
        
        <div class="menu-tabs">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="会话" name="sessions">
              <session-list 
                :sessions="chatSessions" 
                :current-session-id="currentSessionId"
                @select-session="handleSelectSession"
              />
            </el-tab-pane>
            <el-tab-pane label="好友" name="friends">
              <friend-list 
                :friends="friendList" 
                @select-friend="handleSelectFriend"
                @add-friend="openAddFriendDialog"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" icon="el-icon-plus" circle @click="openAddFriendDialog"></el-button>
          <el-button type="success" icon="el-icon-user-solid" circle @click="openCreateGroupDialog"></el-button>
        </div>
      </div>
      
      <!-- 右侧聊天区域 -->
      <div class="chat-area" v-if="currentSessionId">
        <div class="chat-header">
          <div class="chat-title">
            <span>{{ currentSession?.chatSessionName || '聊天' }}</span>
            <el-button icon="el-icon-more" circle plain @click="openSessionDetail"></el-button>
          </div>
        </div>
        
        <message-display 
          :messages="currentMessages" 
          :current-user-id="currentUser?.userId"
        />
        
        <message-editor @send="handleSendMessage" />
      </div>
      
      <div class="empty-chat" v-else>
        <el-empty description="选择会话或开始新对话"></el-empty>
      </div>
    </div>
    
    <!-- 对话框组件 -->
    <add-friend-dialog v-if="showAddFriendDialog" @close="showAddFriendDialog = false" />
    <create-group-dialog v-if="showGroupDialog" @close="showGroupDialog = false" />
    <session-detail-dialog 
      v-if="showSessionDetail" 
      :session-id="currentSessionId"
      @close="showSessionDetail = false" 
    />
    <user-profile-dialog 
      v-if="showUserProfile" 
      :user="currentUser" 
      @close="showUserProfile = false" 
    />
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watchEffect } from 'vue';
  import { useDataCenter } from '@/store/dataCenter';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  
  // 导入组件
  import SessionList from '@/components/chat/SessionList.vue';
  import FriendList from '@/components/friend/FriendList.vue';
  import MessageDisplay from '@/components/chat/MessageDisplay.vue';
  import MessageEditor from '@/components/chat/MessageEditor.vue';
  import AddFriendDialog from '@/components/friend/AddFriendDialog.vue';
  import CreateGroupDialog from '@/components/friend/CreateGroupDialog.vue';
  import SessionDetailDialog from '@/components/chat/SessionDetailDialog.vue';
  import UserProfileDialog from '@/components/user/UserProfileDialog.vue';
  
  const dataCenter = useDataCenter();
  const router = useRouter();
  
  // 状态变量
  const activeTab = ref('sessions');
  const showAddFriendDialog = ref(false);
  const showGroupDialog = ref(false);
  const showSessionDetail = ref(false);
  const showUserProfile = ref(false);
  const defaultAvatar = '/assets/default-avatar.png';
  
  // 计算属性
  const currentUser = computed(() => dataCenter.currentUser);
  const friendList = computed(() => dataCenter.friendList);
  const chatSessions = computed(() => dataCenter.chatSessions);
  const currentSessionId = computed(() => dataCenter.currentSessionId);
  const currentSession = computed(() => dataCenter.currentSession);
  const currentMessages = computed(() => dataCenter.currentMessages);
  
  // 生命周期钩子
  onMounted(async () => {
    if (!dataCenter.isLoggedIn) {
      router.push('/login');
      return;
    }
    
    // 加载基础数据
    try {
      await Promise.all([
        dataCenter.getFriendList(),
        dataCenter.getChatSessionList()
      ]);
    } catch (error) {
      ElMessage.error('加载数据失败，请重试');
      console.error('加载数据失败:', error);
    }
  });
  
  // 监听当前会话变化，自动加载消息
  watchEffect(async () => {
    const sessionId = currentSessionId.value;
    if (sessionId) {
      try {
        await dataCenter.getRecentMessages(sessionId);
      } catch (error) {
        console.error('加载消息失败:', error);
      }
    }
  });
  
  // 方法
  const handleTabClick = (tab) => {
    // 处理标签页切换逻辑
  };
  
  const handleSelectSession = (sessionId) => {
    dataCenter.switchSession(sessionId);
  };
  
  const handleSelectFriend = (friendId) => {
    // 获取或创建与该好友的会话
    const session = chatSessions.value.find(s => 
      s.sessionType === 'single' && s.friendId === friendId
    );
    
    if (session) {
      dataCenter.switchSession(session.chatSessionId);
    } else {
      // 创建新会话
      // 实际应用中可能需要向后端请求创建会话
      ElMessage.info('正在创建与该好友的会话...');
    }
  };
  
  const handleSendMessage = async (content, type = 'text') => {
    if (!currentSessionId.value) {
      ElMessage.warning('请先选择会话');
      return;
    }
    
    try {
      await dataCenter.sendMessage(currentSessionId.value, content, type);
    } catch (error) {
      ElMessage.error('发送消息失败');
      console.error('发送消息失败:', error);
    }
  };
  
  const openAddFriendDialog = () => {
    showAddFriendDialog.value = true;
  };
  
  const openCreateGroupDialog = () => {
    showGroupDialog.value = true;
  };
  
  const openSessionDetail = () => {
    showSessionDetail.value = true;
  };
  
  const openUserProfile = () => {
    showUserProfile.value = true;
  };
  </script>
  
  <style lang="scss" scoped>
  .main-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background-color: #f0f2f5;
    
    .sidebar {
      width: 280px;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      border-right: 1px solid #eaeaea;
      
      .user-profile {
        display: flex;
        align-items: center;
        padding: 16px;
        cursor: pointer;
        
        .username {
          margin-left: 12px;
          font-weight: 500;
        }
      }
      
      .menu-tabs {
        flex: 1;
        overflow: hidden;
        
        :deep(.el-tabs__header) {
          padding: 0 16px;
          margin: 0;
        }
        
        :deep(.el-tabs__content) {
          height: calc(100% - 40px);
          overflow: hidden;
        }
        
        :deep(.el-tab-pane) {
          height: 100%;
          overflow-y: auto;
        }
      }
      
      .action-buttons {
        display: flex;
        justify-content: space-around;
        padding: 12px 16px;
        border-top: 1px solid #eaeaea;
      }
    }
    
    .chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
      
      .chat-header {
        padding: 12px 20px;
        background-color: #fff;
        border-bottom: 1px solid #eaeaea;
        
        .chat-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          
          span {
            font-size: 16px;
            font-weight: 500;
          }
        }
      }
    }
    
    .empty-chat {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
    }
  }
  </style>
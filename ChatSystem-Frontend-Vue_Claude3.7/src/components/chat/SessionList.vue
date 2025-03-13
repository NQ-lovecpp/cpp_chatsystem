<template>
    <div class="session-list">
      <div 
        v-for="session in sessions" 
        :key="session.chatSessionId" 
        class="session-item"
        :class="{ 'active': session.chatSessionId === currentSessionId }"
        @click="selectSession(session.chatSessionId)"
      >
        <el-avatar :size="40" :src="session.avatar || defaultAvatar"></el-avatar>
        
        <div class="session-info">
          <div class="session-header">
            <span class="session-name">{{ session.chatSessionName }}</span>
            <span class="session-time">{{ formatTime(session.lastMessage?.sendTime) }}</span>
          </div>
          
          <div class="session-content">
            <div class="session-msg">
              {{ formatLastMessage(session.lastMessage) }}
            </div>
            
            <div v-if="session.unreadCount > 0" class="unread-badge">
              {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="sessions.length === 0" class="empty-list">
        <el-empty description="没有会话" :image-size="64"></el-empty>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  import { format } from 'date-fns';
  
  const props = defineProps({
    sessions: {
      type: Array,
      default: () => []
    },
    currentSessionId: {
      type: String,
      default: ''
    }
  });
  
  const emit = defineEmits(['selectSession']);
  
  const defaultAvatar = '/assets/default-avatar.png';
  
  // 选择会话
  const selectSession = (sessionId) => {
    emit('selectSession', sessionId);
  };
  
  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const msgDate = new Date(parseInt(timestamp));
    const today = new Date();
    
    if (msgDate.toDateString() === today.toDateString()) {
      return format(msgDate, 'HH:mm');
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (msgDate.toDateString() === yesterday.toDateString()) {
        return '昨天';
      } else {
        return format(msgDate, 'MM/dd');
      }
    }
  };
  
  // 格式化最后一条消息
  const formatLastMessage = (message) => {
    if (!message) return '';
    
    switch (message.msgType) {
      case 'text':
        return message.content;
      case 'image':
        return '[图片]';
      case 'file':
        return '[文件]';
      case 'voice':
        return '[语音]';
      default:
        return '[未知消息类型]';
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .session-list {
    height: 100%;
    overflow-y: auto;
    
    .session-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &.active {
        background-color: #ecf5ff;
      }
      
      .session-info {
        flex: 1;
        margin-left: 12px;
        overflow: hidden;
        
        .session-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          
          .session-name {
            font-size: 15px;
            font-weight: 500;
            color: #333;
          }
          
          .session-time {
            font-size: 12px;
            color: #999;
          }
        }
        
        .session-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .session-msg {
            flex: 1;
            font-size: 13px;
            color: #666;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .unread-badge {
            min-width: 18px;
            height: 18px;
            border-radius: 9px;
            font-size: 12px;
            background-color: #f56c6c;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 5px;
          }
        }
      }
    }
    
    .empty-list {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #909399;
    }
  }
  </style>
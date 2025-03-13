<template>
    <div class="message-container" ref="messageContainer">
      <div class="message-list">
        <div v-if="isLoading" class="loading-more">
          <el-spinner type="primary" size="small"></el-spinner>
          <span>加载历史消息中...</span>
        </div>
  
        <div v-if="showLoadMore" class="load-more" @click="loadMoreMessages">
          <span>加载更多消息</span>
        </div>
        
        <template v-for="(message, index) in messages" :key="message.msgId">
          <!-- 日期分隔线 -->
          <div v-if="shouldShowDateDivider(message, index)" class="date-divider">
            <span>{{ formatDate(message.sendTime) }}</span>
          </div>
          
          <!-- 消息项 -->
          <div 
            class="message-item" 
            :class="{ 'self-message': message.senderId === currentUserId }"
          >
            <el-avatar 
              :size="36" 
              :src="getUserAvatar(message.senderId)" 
              class="avatar"
            ></el-avatar>
            
            <div class="message-content">
              <div class="sender-name" v-if="message.senderId !== currentUserId">
                {{ getUserName(message.senderId) }}
              </div>
              
              <div class="message-bubble">
                <!-- 文本消息 -->
                <div v-if="message.msgType === 'text'" class="text-message">
                  {{ message.content }}
                </div>
                
                <!-- 图片消息 -->
                <div v-else-if="message.msgType === 'image'" class="image-message">
                  <el-image 
                    :src="message.content" 
                    :preview-src-list="[message.content]"
                    fit="cover"
                  ></el-image>
                </div>
                
                <!-- 文件消息 -->
                <div v-else-if="message.msgType === 'file'" class="file-message">
                  <div class="file-icon">
                    <i class="el-icon-document"></i>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ getFileName(message.content) }}</div>
                    <div class="file-size">{{ getFileSize(message.fileSize) }}</div>
                  </div>
                  <el-button 
                    size="small" 
                    type="primary" 
                    icon="el-icon-download" 
                    circle
                    @click="downloadFile(message.content, message.fileName)"
                  ></el-button>
                </div>
                
                <!-- 语音消息 -->
                <div v-else-if="message.msgType === 'voice'" class="voice-message">
                  <div class="voice-icon" @click="playVoice(message.content)">
                    <i class="el-icon-microphone"></i>
                  </div>
                  <div class="voice-duration">{{ message.duration }}″</div>
                </div>
              </div>
              
              <div class="message-time">
                {{ formatTime(message.sendTime) }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, nextTick, watch } from 'vue';
  import { useDataCenter } from '@/store/dataCenter';
  import { format } from 'date-fns';
  import { ElMessage } from 'element-plus';
  
  const props = defineProps({
    messages: {
      type: Array,
      default: () => []
    },
    currentUserId: {
      type: String,
      required: true
    }
  });
  
  const dataCenter = useDataCenter();
  const messageContainer = ref(null);
  const isLoading = ref(false);
  const showLoadMore = ref(true);
  const currentAudio = ref(null);
  
  // 获取用户头像
  const getUserAvatar = (userId) => {
    if (userId === props.currentUserId) {
      return dataCenter.currentUser?.avatar || '/assets/default-avatar.png';
    }
    
    const friend = dataCenter.friendList.find(f => f.userId === userId);
    return friend?.avatar || '/assets/default-avatar.png';
  };
  
  // 获取用户名称
  const getUserName = (userId) => {
    const friend = dataCenter.friendList.find(f => f.userId === userId);
    return friend?.nickname || userId;
  };
  
  // 格式化日期
  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return format(date, 'yyyy年MM月dd日');
    }
  };
  
  // 格式化时间
  const formatTime = (timestamp) => {
    return format(new Date(parseInt(timestamp)), 'HH:mm');
  };
  
  // 是否显示日期分隔线
  const shouldShowDateDivider = (message, index) => {
    if (index === 0) return true;
    
    const currentDate = new Date(parseInt(message.sendTime));
    const prevDate = new Date(parseInt(props.messages[index - 1].sendTime));
    
    return currentDate.toDateString() !== prevDate.toDateString();
  };
  
  // 获取文件名
  const getFileName = (fileUrl) => {
    const parts = fileUrl.split('/');
    return parts[parts.length - 1];
  };
  
  // 格式化文件大小
  const getFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return '';
    
    const kb = sizeInBytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    } else {
      return `${(kb / 1024).toFixed(2)} MB`;
    }
  };
  
  // 下载文件
  const downloadFile = async (fileUrl, fileName) => {
    try {
      ElMessage.info('正在下载文件...');
      // 实际应用中，需要调用API获取文件
      // const response = await fileApi.downloadFile(fileUrl);
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', fileName || getFileName(fileUrl));
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      
      ElMessage.success('文件下载完成');
    } catch (error) {
      console.error('下载文件失败:', error);
      ElMessage.error('下载文件失败');
    }
  };
  
  // 播放语音
  const playVoice = (voiceUrl) => {
    // 停止当前正在播放的语音
    if (currentAudio.value) {
      currentAudio.value.pause();
      currentAudio.value.currentTime = 0;
    }
    
    // 播放新语音
    const audio = new Audio(voiceUrl);
    audio.onended = () => {
      currentAudio.value = null;
    };
    audio.play();
    currentAudio.value = audio;
  };
  
  // 加载更多历史消息
  const loadMoreMessages = async () => {
    if (isLoading.value || !props.messages.length) return;
    
    try {
      isLoading.value = true;
      
      const sessionId = dataCenter.currentSessionId;
      const oldestMsgId = props.messages[0]?.msgId;
      
      const success = await dataCenter.getHistoryMessages(sessionId, oldestMsgId, 20);
      
      if (!success || dataCenter.currentMessages.length <= props.messages.length) {
        showLoadMore.value = false;
      }
    } catch (error) {
      console.error('加载历史消息失败:', error);
      ElMessage.error('加载历史消息失败');
    } finally {
      isLoading.value = false;
    }
  };
  
  // 自动滚动到底部
  const scrollToBottom = () => {
    nextTick(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      }
    });
  };
  
  // 监听消息变化，自动滚动到底部
  watch(() => props.messages.length, (newVal, oldVal) => {
    if (newVal > oldVal) {
      scrollToBottom();
    }
  });
  
  // 组件挂载完成，滚动到底部
  onMounted(() => {
    scrollToBottom();
  });
  </script>
  
  <style lang="scss" scoped>
  .message-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    
    .message-list {
      display: flex;
      flex-direction: column;
      
      .loading-more, .load-more {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px 0;
        color: #999;
        font-size: 14px;
        
        span {
          margin-left: 8px;
        }
      }
      
      .load-more {
        cursor: pointer;
        
        &:hover {
          color: #409EFF;
        }
      }
      
      .date-divider {
        display: flex;
        justify-content: center;
        margin: 16px 0;
        
        span {
          padding: 4px 12px;
          background-color: #f1f1f1;
          border-radius: 16px;
          font-size: 12px;
          color: #999;
        }
      }
      
      .message-item {
        display: flex;
        margin-bottom: 16px;
        
        .avatar {
          margin-right: 12px;
        }
        
        .message-content {
          max-width: 60%;
          
          .sender-name {
            font-size: 13px;
            color: #999;
            margin-bottom: 4px;
          }
          
          .message-bubble {
            padding: 10px 12px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            
            .text-message {
              font-size: 15px;
              line-height: 1.5;
              word-break: break-word;
            }
            
            .image-message {
              img {
                max-width: 300px;
                max-height: 300px;
                border-radius: 4px;
              }
            }
            
            .file-message {
              display: flex;
              align-items: center;
              
              .file-icon {
                font-size: 24px;
                color: #409EFF;
                margin-right: 12px;
              }
              
              .file-info {
                flex: 1;
                
                .file-name {
                  font-size: 14px;
                  margin-bottom: 4px;
                  word-break: break-word;
                }
                
                .file-size {
                  font-size: 12px;
                  color: #999;
                }
              }
            }
            
            .voice-message {
              display: flex;
              align-items: center;
              
              .voice-icon {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background-color: #409EFF;
                color: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                margin-right: 12px;
              }
              
              .voice-duration {
                font-size: 14px;
                color: #666;
              }
            }
          }
          
          .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
            text-align: left;
          }
        }
        
        &.self-message {
          flex-direction: row-reverse;
          
          .avatar {
            margin-right: 0;
            margin-left: 12px;
          }
          
          .message-content {
            .message-bubble {
              background-color: #e1f3fb;
            }
            
            .message-time {
              text-align: right;
            }
          }
        }
      }
    }
  }
  </style>
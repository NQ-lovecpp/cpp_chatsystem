<template>
    <div class="message-editor">
      <div class="toolbar">
        <el-tooltip content="表情" placement="top">
          <el-button icon="el-icon-smile" circle plain @click="showEmoji = !showEmoji"></el-button>
        </el-tooltip>
        
        <el-tooltip content="图片" placement="top">
          <el-button icon="el-icon-picture" circle plain @click="selectImage"></el-button>
        </el-tooltip>
        
        <el-tooltip content="文件" placement="top">
          <el-button icon="el-icon-folder" circle plain @click="selectFile"></el-button>
        </el-tooltip>
        
        <el-tooltip content="录音" placement="top">
          <el-button 
            icon="el-icon-microphone" 
            circle 
            plain 
            :class="{ 'recording': isRecording }"
            @mousedown="startRecording" 
            @mouseup="stopRecording"
            @mouseleave="cancelRecording"
          ></el-button>
        </el-tooltip>
        
        <input 
          type="file" 
          ref="imageInput" 
          accept="image/*" 
          style="display: none" 
          @change="handleImageSelected"
        />
        
        <input 
          type="file" 
          ref="fileInput" 
          style="display: none" 
          @change="handleFileSelected"
        />
      </div>
      
      <!-- 表情面板 -->
      <div v-if="showEmoji" class="emoji-panel">
        <div 
          v-for="emoji in emojiList" 
          :key="emoji" 
          class="emoji-item"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
      
      <div class="input-area">
        <el-input
          v-model="content"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          resize="none"
          @keydown.enter.exact.prevent="sendTextMessage"
        ></el-input>
      </div>
      
      <div class="send-area">
        <span v-if="isRecording" class="recording-tip">
          正在录音... {{ recordingDuration }}s
        </span>
        <span v-else class="shortcut-tip">
          按 Enter 发送，Shift + Enter 换行
        </span>
        
        <el-button type="primary" @click="sendTextMessage" :disabled="!content.trim()">
          发送
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onBeforeUnmount } from 'vue';
  import { ElMessage } from 'element-plus';
  
  const emit = defineEmits(['send']);
  
  // 状态变量
  const content = ref('');
  const showEmoji = ref(false);
  const isRecording = ref(false);
  const recordingDuration = ref(0);
  const recordingTimer = ref(null);
  const mediaRecorder = ref(null);
  const audioChunks = ref([]);
  const imageInput = ref(null);
  const fileInput = ref(null);
  
  // 表情列表
  const emojiList = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', 
    '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', 
    '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', 
    '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟'
  ];
  
  // 方法
  const sendTextMessage = () => {
    if (!content.value.trim()) return;
    
    emit('send', content.value, 'text');
    content.value = '';
    showEmoji.value = false;
  };
  
  const insertEmoji = (emoji) => {
    content.value += emoji;
  };
  
  const selectImage = () => {
    imageInput.value.click();
  };
  
  const handleImageSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.includes('image/')) {
      ElMessage.error('请选择图片文件');
      return;
    }
    
    // 限制文件大小
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过10MB');
      return;
    }
    
    try {
      // 在实际应用中，这里可能需要先上传图片，然后获取图片URL
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fileApi.uploadImage(formData);
      // emit('send', response.fileUrl, 'image');
      
      // 临时使用本地预览
      const reader = new FileReader();
      reader.onload = (e) => {
        emit('send', e.target.result, 'image');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('上传图片失败:', error);
      ElMessage.error('上传图片失败');
    } finally {
      // 清空输入框，以便下次选择同一文件时仍能触发change事件
      event.target.value = '';
    }
  };
  
  const selectFile = () => {
    fileInput.value.click();
  };
  
  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // 限制文件大小
    if (file.size > 100 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过100MB');
      return;
    }
    
    try {
      // 在实际应用中，这里需要先上传文件，然后获取文件URL
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fileApi.uploadFile(formData);
      // emit('send', response.fileUrl, 'file');
      
      // 临时模拟
      ElMessage.success('文件上传成功');
      emit('send', file.name, 'file');
    } catch (error) {
      console.error('上传文件失败:', error);
      ElMessage.error('上传文件失败');
    } finally {
      event.target.value = '';
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorder.value = new MediaRecorder(stream);
      audioChunks.value = [];
      
      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data);
        }
      };
      
      mediaRecorder.value.onstop = async () => {
        if (audioChunks.value.length === 0) return;
        
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' });
        
        // 在实际应用中，这里需要上传语音文件
        // const formData = new FormData();
        // formData.append('file', audioBlob);
        // const response = await fileApi.uploadVoice(formData);
        // emit('send', response.fileUrl, 'voice');
        
        // 临时使用本地URL
        const audioUrl = URL.createObjectURL(audioBlob);
        emit('send', audioUrl, 'voice');
        
        // 关闭麦克风
        stopMediaTracks(mediaRecorder.value.stream);
      };
      
      mediaRecorder.value.start();
      isRecording.value = true;
      
      // 开始计时
      recordingDuration.value = 0;
      recordingTimer.value = setInterval(() => {
        recordingDuration.value++;
        
        // 限制录音时长（60秒）
        if (recordingDuration.value >= 60) {
          stopRecording();
        }
      }, 1000);
    } catch (error) {
      console.error('录音失败:', error);
      ElMessage.error('无法获取麦克风权限');
      isRecording.value = false;
    }
  };
  
  const stopRecording = () => {
    if (!isRecording.value || !mediaRecorder.value) return;
    
    clearInterval(recordingTimer.value);
    mediaRecorder.value.stop();
    isRecording.value = false;
  };
  
  const cancelRecording = () => {
    if (!isRecording.value) return;
    
    clearInterval(recordingTimer.value);
    mediaRecorder.value.stop();
    isRecording.value = false;
    
    // 清空录音数据
    audioChunks.value = [];
    
    // 关闭麦克风
    if (mediaRecorder.value && mediaRecorder.value.stream) {
      stopMediaTracks(mediaRecorder.value.stream);
    }
  };
  
  const stopMediaTracks = (stream) => {
    if (!stream) return;
    
    stream.getTracks().forEach(track => {
      track.stop();
    });
  };
  
  // 组件销毁前清理资源
  onBeforeUnmount(() => {
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value);
    }
    
    if (mediaRecorder.value && mediaRecorder.value.stream) {
      stopMediaTracks(mediaRecorder.value.stream);
    }
  });
  </script>
  
  <style lang="scss" scoped>
  .message-editor {
    border-top: 1px solid #eaeaea;
    background-color: #fff;
    
    .toolbar {
      display: flex;
      padding: 10px 20px;
      gap: 10px;
      
      .el-button.recording {
        background-color: #f56c6c;
        color: white;
      }
    }
    
    .emoji-panel {
      display: flex;
      flex-wrap: wrap;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin: 0 20px;
      
      .emoji-item {
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        cursor: pointer;
        
        &:hover {
          background-color: #e0e0e0;
          border-radius: 4px;
        }
      }
    }
    
    .input-area {
      padding: 0 20px;
      
      .el-textarea {
        :deep(.el-textarea__inner) {
          resize: none;
          border: none;
          padding: 10px 0;
          font-size: 15px;
          line-height: 1.5;
          
          &:focus {
            box-shadow: none;
          }
        }
      }
    }
    
    .send-area {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      
      .shortcut-tip, .recording-tip {
        font-size: 13px;
        color: #999;
      }
      
      .recording-tip {
        color: #f56c6c;
        animation: blink 1s infinite;
      }
    }
  }
  
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  </style>
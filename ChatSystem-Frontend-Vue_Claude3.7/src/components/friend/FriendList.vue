<template>
    <div class="friend-list">
      <div class="search-bar">
        <el-input 
          v-model="searchText" 
          placeholder="搜索好友" 
          prefix-icon="el-icon-search"
          clearable
        ></el-input>
      </div>
      
      <!-- 好友请求通知 -->
      <div v-if="pendingRequests.length > 0" class="friend-requests" @click="openFriendRequests">
        <i class="el-icon-bell"></i>
        <span>好友请求 ({{ pendingRequests.length }})</span>
        <i class="el-icon-right"></i>
      </div>
      
      <!-- 好友分组 -->
      <el-collapse v-model="activeGroups">
        <el-collapse-item title="我的好友" name="my-friends">
          <div 
            v-for="friend in filteredFriends" 
            :key="friend.userId" 
            class="friend-item"
            @click="selectFriend(friend.userId)"
          >
            <el-avatar :size="40" :src="friend.avatar || defaultAvatar"></el-avatar>
            <div class="friend-info">
              <div class="friend-name">{{ friend.nickname }}</div>
              <div class="friend-signature">{{ friend.description || '这个人很懒，什么都没写' }}</div>
            </div>
          </div>
          
          <div v-if="filteredFriends.length === 0" class="empty-list">
            {{ friends.length === 0 ? '还没有好友' : '没有匹配的好友' }}
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { useDataCenter } from '@/store/dataCenter';
  
  const props = defineProps({
    friends: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['selectFriend', 'addFriend']);
  
  const dataCenter = useDataCenter();
  const searchText = ref('');
  const activeGroups = ref(['my-friends']);
  const defaultAvatar = '/assets/default-avatar.png';
  
  // 计算属性：获取待处理的好友请求
  const pendingRequests = computed(() => dataCenter.pendingFriendEvents);
  
  // 计算属性：筛选好友
  const filteredFriends = computed(() => {
    if (!searchText.value) return props.friends;
    
    return props.friends.filter(friend => 
      friend.nickname.toLowerCase().includes(searchText.value.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchText.value.toLowerCase())
    );
  });
  
  // 选择好友
  const selectFriend = (friendId) => {
    emit('selectFriend', friendId);
  };
  
  // 打开好友请求列表
  const openFriendRequests = () => {
    ElMessageBox.confirm(
      '您有未处理的好友请求，是否现在处理？',
      '好友请求',
      {
        confirmButtonText: '去处理',
        cancelButtonText: '稍后',
        type: 'info'
      }
    ).then(() => {
      // 跳转到好友请求页面
      // 实现方式取决于你的路由设计
    }).catch(() => {
      // 取消操作
    });
  };
  </script>
  
  <style lang="scss" scoped>
  .friend-list {
    height: 100%;
    overflow-y: auto;
    
    .search-bar {
      padding: 10px 16px;
      
      .el-input {
        margin-bottom: 10px;
      }
    }
    
    .friend-requests {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 10px;
      background-color: #f5f7fa;
      border-radius: 4px;
      cursor: pointer;
      
      i.el-icon-bell {
        font-size: 18px;
        color: #409EFF;
        margin-right: 10px;
      }
      
      span {
        flex: 1;
        font-size: 14px;
      }
    }
    
    :deep(.el-collapse) {
      border: none;
      
      .el-collapse-item__header {
        font-size: 15px;
        font-weight: 500;
        height: 40px;
        line-height: 40px;
        background-color: #f5f7fa;
        padding-left: 16px;
      }
      
      .el-collapse-item__wrap {
        border: none;
      }
      
      .el-collapse-item__content {
        padding: 0;
      }
    }
    
    .friend-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      .friend-info {
        margin-left: 12px;
        
        .friend-name {
          font-size: 15px;
          color: #333;
          margin-bottom: 4px;
        }
        
        .friend-signature {
          font-size: 13px;
          color: #999;
        }
      }
    }
    
    .empty-list {
      padding: 20px;
      text-align: center;
      color: #909399;
      font-size: 14px;
    }
  }
  </style>
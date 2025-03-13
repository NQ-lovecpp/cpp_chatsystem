<template>
    <div class="login-container">
      <div class="login-box">
        <div class="logo">
          <img src="@/assets/logo.png" alt="Logo">
          <h1>Vue聊天室</h1>
        </div>
        
        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="账号密码登录" name="password">
            <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-width="0">
              <el-form-item prop="phoneNumber">
                <el-input 
                  v-model="loginForm.phoneNumber" 
                  placeholder="手机号" 
                  prefix-icon="el-icon-mobile-phone"
                />
              </el-form-item>
              
              <el-form-item prop="password">
                <el-input 
                  v-model="loginForm.password" 
                  type="password" 
                  placeholder="密码" 
                  prefix-icon="el-icon-lock"
                  @keyup.enter="handleLogin"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  class="login-button" 
                  :loading="loading" 
                  @click="handleLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="短信验证码登录" name="sms">
            <el-form ref="smsForm" :model="smsForm" :rules="smsRules" label-width="0">
              <el-form-item prop="phoneNumber">
                <el-input 
                  v-model="smsForm.phoneNumber" 
                  placeholder="手机号" 
                  prefix-icon="el-icon-mobile-phone"
                />
              </el-form-item>
              
              <el-form-item prop="verifyCode">
                <div class="verify-code">
                  <el-input 
                    v-model="smsForm.verifyCode" 
                    placeholder="验证码" 
                    prefix-icon="el-icon-key"
                  />
                  <el-button 
                    :disabled="cooldown > 0" 
                    @click="sendVerifyCode"
                  >
                    {{ cooldown > 0 ? `${cooldown}s` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  class="login-button" 
                  :loading="loading" 
                  @click="handleSmsLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        
        <div class="register-link">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useDataCenter } from '@/store/dataCenter';
  import { userApi } from '@/network/api';
  import { setupWebSocket } from '@/network/websocket';
  
  const router = useRouter();
  const dataCenter = useDataCenter();
  
  // 状态变量
  const activeTab = ref('password');
  const loading = ref(false);
  const cooldown = ref(0);
  
  // 表单数据
  const loginForm = reactive({
    phoneNumber: '',
    password: ''
  });
  
  const smsForm = reactive({
    phoneNumber: '',
    verifyCode: ''
  });
  
  // 表单验证规则
  const loginRules = {
    phoneNumber: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ]
  };
  
  const smsRules = {
    phoneNumber: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    verifyCode: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { pattern: /^\d{6}$/, message: '验证码格式不正确', trigger: 'blur' }
    ]
  };
  
  // 方法
  const handleLogin = async () => {
    try {
      loading.value = true;
      
      // 登录请求
      const success = await dataCenter.login(loginForm.phoneNumber, loginForm.password);
      
      if (success) {
        // 建立WebSocket连接
        setupWebSocket(localStorage.getItem('sessionId'));
        
        // 登录成功，跳转到首页
        router.push('/');
        ElMessage.success('登录成功');
      } else {
        ElMessage.error('用户名或密码错误');
      }
    } catch (error) {
      console.error('登录失败:', error);
      ElMessage.error('登录失败，请重试');
    } finally {
      loading.value = false;
    }
  };
  
  const handleSmsLogin = async () => {
    try {
      loading.value = true;
      
      // 短信验证码登录
      const response = await userApi.smsLogin(smsForm.phoneNumber, smsForm.verifyCode);
      
      if (response.success) {
        // 更新用户信息
        dataCenter.currentUser = response.userInfo;
        localStorage.setItem('sessionId', response.sessionId);
        
        // 建立WebSocket连接
        setupWebSocket(response.sessionId);
        
        // 登录成功，跳转到首页
        router.push('/');
        ElMessage.success('登录成功');
      } else {
        ElMessage.error(response.errmsg || '验证码错误');
      }
    } catch (error) {
      console.error('登录失败:', error);
      ElMessage.error('登录失败，请重试');
    } finally {
      loading.value = false;
    }
  };
  
  const sendVerifyCode = async () => {
    try {
      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(smsForm.phoneNumber)) {
        ElMessage.warning('请输入正确的手机号');
        return;
      }
      
      // 发送验证码
      const response = await userApi.sendVerifyCode(smsForm.phoneNumber);
      
      if (response.success) {
        ElMessage.success('验证码已发送');
        
        // 倒计时
        cooldown.value = 60;
        const timer = setInterval(() => {
          cooldown.value--;
          if (cooldown.value <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      } else {
        ElMessage.error(response.errmsg || '发送验证码失败');
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      ElMessage.error('发送验证码失败，请重试');
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
    
    .login-box {
      width: 380px;
      padding: 30px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      
      .logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 30px;
        
        img {
          width: 80px;
          height: 80px;
        }
        
        h1 {
          margin-top: 16px;
          font-size: 24px;
          color: #333;
        }
      }
      
      .login-tabs {
        margin-bottom: 20px;
      }
      
      .login-button {
        width: 100%;
        height: 40px;
        font-size: 16px;
      }
      
      .verify-code {
        display: flex;
        
        .el-input {
          flex: 1;
          margin-right: 10px;
        }
        
        .el-button {
          width: 120px;
        }
      }
      
      .register-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      
      span {
        color: #666;
      }
      
      a {
        color: #409EFF;
        text-decoration: none;
        margin-left: 5px;
      }
    }
  }
}
</style>
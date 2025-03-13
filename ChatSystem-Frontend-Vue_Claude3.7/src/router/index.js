// import { createRouter, createWebHistory } from 'vue-router';
// import { useDataCenter } from '@/store/dataCenter';

// const routes = [
//   {
//     path: '/',
//     name: 'Main',
//     component: () => import('@/views/MainView.vue'),
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/login',
//     name: 'Login',
//     component: () => import('@/views/LoginView.vue'),
//     meta: { guest: true }
//   },
//   {
//     path: '/register',
//     name: 'Register',
//     component: () => import('@/views/RegisterView.vue'),
//     meta: { guest: true }
//   },
//   {
//     path: '/friend-requests',
//     name: 'FriendRequests',
//     component: () => import('@/views/FriendRequestsView.vue'),
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/user-profile',
//     name: 'UserProfile',
//     component: () => import('@/views/UserProfileView.vue'),
//     meta: { requiresAuth: true }
//   }
// ];

// const router = createRouter({
//   history: createWebHistory(),
//   routes
// });

// // 导航守卫
// router.beforeEach((to, from, next) => {
//   const dataCenter = useDataCenter();
//   const isLoggedIn = !!localStorage.getItem('sessionId');
  
//   // 需要登录的路由
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     if (!isLoggedIn) {
//       next({ name: 'Login' });
//     } else {
//       // 如果已登录但没有当前用户信息，则获取用户信息
//       if (!dataCenter.currentUser) {
//         dataCenter.getUserInfo();
//       }
//       next();
//     }
//   } 
//   // 游客路由（已登录用户不应访问）
//   else if (to.matched.some(record => record.meta.guest)) {
//     if (isLoggedIn) {
//       next({ name: 'Main' });
//     } else {
//       next();
//     }
//   } else {
//     next();
//   }
// });

// export default router;


import { createRouter, createWebHistory } from 'vue-router';
import { useDataCenter } from '@/store/dataCenter';
import { userApi } from '@/network/api';

const routes = [
  {
    path: '/',
    name: 'Main',
    component: () => import('@/views/MainView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guest: true }
  },
  {
    path: '/friend-requests',
    name: 'FriendRequests',
    component: () => import('@/views/FriendRequestsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user-profile',
    name: 'UserProfile',
    component: () => import('@/views/UserProfileView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导航守卫
router.beforeEach(async (to, from, next) => {
  const dataCenter = useDataCenter();
  const isLoggedIn = !!localStorage.getItem('sessionId');
  
  // 需要登录的路由
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ name: 'Login' });
    } else {
      try {
        // 如果已登录但没有当前用户信息，则获取用户信息
        if (!dataCenter.currentUser) {
          const response = await userApi.getUserInfo();
          if (response.success) {
            dataCenter.currentUser = response.userInfo;
          } else {
            // 如果获取用户信息失败，可能是会话已过期
            localStorage.removeItem('sessionId');
            next({ name: 'Login' });
            return;
          }
        }
        next();
      } catch (error) {
        console.error('Failed to get user info:', error);
        // 出错时清除登录状态并重定向到登录页
        localStorage.removeItem('sessionId');
        next({ name: 'Login' });
      }
    }
  } 
  // 游客路由（已登录用户不应访问）
  else if (to.matched.some(record => record.meta.guest)) {
    if (isLoggedIn) {
      next({ name: 'Main' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

#!/bin/bash
# 创建 vue-chatroom 项目基础目录和空文件

BASE_DIR="~/cpp_chatsystem/ChatSystem-Frontend-Vue_O3mini"


# 根目录下的目录和文件
mkdir -p $BASE_DIR/proto
mkdir -p $BASE_DIR/public
mkdir -p $BASE_DIR/src/api
mkdir -p $BASE_DIR/src/assets/font
mkdir -p $BASE_DIR/src/assets/img/emoji
mkdir -p $BASE_DIR/src/assets/img/avatars
mkdir -p $BASE_DIR/src/assets/img/fileIcons
mkdir -p $BASE_DIR/src/components/common
mkdir -p $BASE_DIR/src/components/layout
mkdir -p $BASE_DIR/src/components/chat
mkdir -p $BASE_DIR/src/utils
mkdir -p $BASE_DIR/src/views
mkdir -p $BASE_DIR/src/router
mkdir -p $BASE_DIR/src/stores

# 创建空文件
touch $BASE_DIR/public/index.html
touch $BASE_DIR/src/api/http.js
touch $BASE_DIR/src/api/websocket.js
touch $BASE_DIR/src/api/protobuf.js
touch $BASE_DIR/src/assets/logo.png
touch $BASE_DIR/src/components/common/HeadPortrait.vue
touch $BASE_DIR/src/components/common/EmojiPicker.vue
touch $BASE_DIR/src/components/common/FileCard.vue
touch $BASE_DIR/src/components/common/IconButton.vue
touch $BASE_DIR/src/components/layout/Sidebar.vue
touch $BASE_DIR/src/components/layout/Navbar.vue
touch $BASE_DIR/src/components/chat/ChatList.vue
touch $BASE_DIR/src/components/chat/ChatWindow.vue
touch $BASE_DIR/src/components/chat/MessageInput.vue
touch $BASE_DIR/src/utils/animation.js
touch $BASE_DIR/src/utils/websocket.js
touch $BASE_DIR/src/utils/debounce.js
touch $BASE_DIR/src/utils/protobuf.js
touch $BASE_DIR/src/views/AuthView.vue
touch $BASE_DIR/src/views/ChatHome.vue
touch $BASE_DIR/src/views/Setting.vue
touch $BASE_DIR/src/router/index.js
touch $BASE_DIR/src/stores/auth.js
touch $BASE_DIR/src/stores/friend.js
touch $BASE_DIR/src/stores/message.js
touch $BASE_DIR/src/stores/notification.js
touch $BASE_DIR/src/App.vue
touch $BASE_DIR/src/main.js
touch $BASE_DIR/vite.config.js
touch $BASE_DIR/package.json
touch $BASE_DIR/README.md

echo "项目目录结构已创建在 $BASE_DIR 下."

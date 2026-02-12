#!/bin/bash

# 文件服务测试脚本
# 用于测试图片上传、下载和显示功能

echo "======================================"
echo "文件服务诊断测试"
echo "======================================"
echo ""

# 1. 检查后端服务状态
echo "1. 检查后端服务状态..."
docker ps | grep -E "gateway|file_server|user_server|message" | awk '{print $NF" - "$3}'
echo ""

# 2. 检查文件服务存储目录
echo "2. 检查文件服务存储目录..."
echo "文件总数:"
docker exec chatsystem-backend-file_server-1 ls /im/data/ | wc -l
echo "最近的文件:"
docker exec chatsystem-backend-file_server-1 ls -lht /im/data/ | head -10
echo ""

# 3. 检查数据库中的文件ID
echo "3. 检查数据库中的文件关联数据..."
echo "图片/文件消息:"
docker exec mysql mysql -uroot -p'Cydia4384!' chen_im -e \
  "SELECT message_id, user_id, message_type, file_id, file_name FROM message WHERE message_type IN (1,2) ORDER BY create_time DESC LIMIT 5;" \
  2>/dev/null | grep -v "Warning"
echo ""
echo "用户头像:"
docker exec mysql mysql -uroot -p'Cydia4384!' chen_im -e \
  "SELECT user_id, nickname, avatar_id FROM user WHERE avatar_id IS NOT NULL LIMIT 5;" \
  2>/dev/null | grep -v "Warning"
echo ""

# 4. 测试文件服务API（需要有效的session_id和user_id）
echo "4. 检查网关服务器日志（最近的文件请求）..."
docker logs chatsystem-backend-gateway_server-1 --tail 50 2>&1 | \
  grep -E "get_single_file|set_avatar" | tail -10
echo ""

# 5. 检查文件服务日志
echo "5. 检查文件服务日志（最近的请求）..."
docker logs chatsystem-backend-file_server-1 --tail 50 2>&1 | \
  grep -E "请求获取|请求单个|error|fail" -i | tail -10
echo ""

echo "======================================"
echo "诊断完成"
echo "======================================"
echo ""
echo "如果看到文件ID存在但前端无法显示，请检查："
echo "1. 前端配置的服务器地址是否正确（查看 src/api/config.js）"
echo "2. 浏览器控制台是否有CORS或网络错误"
echo "3. 前端是否正确调用了文件服务接口"
echo ""

#!/bin/bash
# ChatSystem v1.0 Release Script
# 使用方法: ./release-v1.0.sh

set -e  # 遇到错误立即退出

echo "========================================="
echo "  ChatSystem v1.0 Release Script"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 检查是否在正确的目录
if [ ! -f "ChatSystem-Backend/docker-compose.yaml" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}步骤 1/6: 检查 Git 状态${NC}"
git status

echo ""
read -p "是否继续发布 v1.0? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "发布已取消"
    exit 0
fi

# 2. 添加新文档到 Git
echo ""
echo -e "${YELLOW}步骤 2/6: 添加文档到 Git${NC}"
git add Docs-and-demos/ChatSystem技术演进规划v1.0-v2.0.md
git add Docs-and-demos/v1.0-Release-Checklist.md
git add release-v1.0.sh

echo -e "${GREEN}✓ 文档已添加${NC}"

# 3. 提交更改
echo ""
echo -e "${YELLOW}步骤 3/6: 提交更改${NC}"
git commit -m "chore: 发布 v1.0 版本

- 添加技术演进规划文档 (v1.0 -> v2.0)
- 添加 v1.0 发布清单
- 完成首个稳定版本发布准备

Release Notes:
- ✨ 完整的即时通讯功能
- 🏗️ 微服务架构实现
- 🖥️ Qt 跨平台客户端
- 🎤 语音识别集成
- 🔍 全文搜索功能
- 📖 完善的架构文档

Known Issues:
- Elasticsearch 资源占用较大
- MySQL + ES 双写一致性待优化
- WebSocket 未加密

Roadmap:
详见 Docs-and-demos/ChatSystem技术演进规划v1.0-v2.0.md
"

echo -e "${GREEN}✓ 更改已提交${NC}"

# 4. 创建 Git 标签
echo ""
echo -e "${YELLOW}步骤 4/6: 创建 v1.0 标签${NC}"
git tag -a v1.0 -m "Release v1.0 - Foundation

ChatSystem v1.0 首个稳定版本发布 🎉

核心特性:
- 完整的即时通讯功能（单聊、群聊）
- 微服务架构（7个服务）
- Qt 跨平台客户端
- 实时消息推送（WebSocket）
- 多种消息类型（文本、图片、文件、语音）
- 语音识别（ASR）
- 全文搜索（Elasticsearch）
- 消息队列（RabbitMQ）
- 服务发现（Etcd）

技术栈:
- C++ 17
- MySQL 5.7+
- Redis 6.0+
- Elasticsearch 7.x
- RabbitMQ 3.8+
- Qt 5.15+
- Docker & Docker Compose

部署:
详见 ChatSystem-Backend/README.md

文档:
- 架构对比分析: Docs-and-demos/Rocket.Chat与ChatSystem架构对比分析.md
- 技术演进规划: Docs-and-demos/ChatSystem技术演进规划v1.0-v2.0.md
- 发布清单: Docs-and-demos/v1.0-Release-Checklist.md

下一步:
v2.0 规划中，重点优化资源占用和数据一致性，新增 AI 对话功能
"

echo -e "${GREEN}✓ 标签 v1.0 已创建${NC}"

# 5. 查看标签信息
echo ""
echo -e "${YELLOW}步骤 5/6: 查看标签信息${NC}"
git show v1.0 --stat

# 6. 推送到 GitHub
echo ""
echo -e "${YELLOW}步骤 6/6: 推送到 GitHub${NC}"
echo -e "${RED}注意: 即将推送代码和标签到 GitHub${NC}"
read -p "确认推送? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "推送代码..."
    git push origin main || git push origin master
    
    echo ""
    echo "推送标签..."
    git push origin v1.0
    
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}✓ v1.0 发布成功！${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "接下来："
    echo "1. 访问 GitHub 仓库的 Releases 页面"
    echo "2. 点击 'Draft a new release'"
    echo "3. 选择标签 'v1.0'"
    echo "4. 填写 Release Notes（可参考 v1.0-Release-Checklist.md）"
    echo "5. 上传编译好的客户端二进制文件（可选）"
    echo "6. 点击 'Publish release'"
    echo ""
    echo "或使用 GitHub CLI："
    echo "gh release create v1.0 --title \"v1.0 - Foundation\" --notes-file Docs-and-demos/v1.0-Release-Checklist.md"
    echo ""
else
    echo ""
    echo -e "${YELLOW}推送已取消${NC}"
    echo "你可以稍后手动推送："
    echo "  git push origin main"
    echo "  git push origin v1.0"
fi

echo ""
echo -e "${GREEN}🎉 本地发布准备完成！${NC}"

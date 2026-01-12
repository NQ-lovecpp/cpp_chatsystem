# 🚀 ChatSystem v1.0 发布指南

> **仓库**: https://github.com/NQ-lovecpp/cpp_chatsystem  
> **版本**: v1.0  
> **日期**: 2026-01-12

---

## 📦 快速发布（推荐）

使用自动化脚本一键发布：

```bash
# 1. 赋予执行权限
chmod +x release-v1.0.sh

# 2. 运行发布脚本
./release-v1.0.sh
```

脚本会引导你完成：
- ✅ Git 提交
- ✅ 创建标签
- ✅ 推送到 GitHub

---

## 🎯 手动发布步骤

### Step 1: 提交代码

```bash
# 查看当前状态
git status

# 添加新文件
git add Docs-and-demos/ChatSystem技术演进规划v1.0-v2.0.md
git add Docs-and-demos/v1.0-Release-Checklist.md
git add release-v1.0.sh
git add RELEASE_GUIDE.md

# 提交
git commit -m "chore: 发布 v1.0 版本

✨ Features:
- 完整的即时通讯功能
- 微服务架构实现
- Qt 跨平台客户端
- 语音识别集成
- 全文搜索功能

📖 Documentation:
- 技术演进规划文档
- 架构对比分析文档
- 发布清单

🔜 Next:
v2.0 规划：优化资源占用，新增 AI 对话功能
"
```

### Step 2: 创建标签

```bash
git tag -a v1.0 -m "Release v1.0 - Foundation

ChatSystem v1.0 首个稳定版本发布 🎉

核心特性:
✨ 完整的即时通讯功能（单聊、群聊）
🏗️ 微服务架构（7个服务）
🖥️ Qt 跨平台客户端
🔄 实时消息推送（WebSocket）
📨 多种消息类型（文本、图片、文件、语音）
🎤 语音识别（ASR）
🔍 全文搜索（Elasticsearch）

技术栈:
- C++ 17
- MySQL 5.7+
- Redis 6.0+
- Elasticsearch 7.x
- RabbitMQ 3.8+
- Qt 5.15+
- Docker & Docker Compose
"

# 查看标签
git tag -l
git show v1.0
```

### Step 3: 推送到 GitHub

```bash
# 推送代码（根据你的主分支名称选择）
git push origin main
# 或者
git push origin master

# 推送标签
git push origin v1.0
```

---

## 📝 创建 GitHub Release

推送成功后，有两种方式创建 Release：

### 方式 A: 使用 GitHub CLI（推荐）

```bash
# 创建 Release（使用发布清单作为 Release Notes）
gh release create v1.0 \
  --title "v1.0 - Foundation 🎉" \
  --notes-file Docs-and-demos/v1.0-Release-Checklist.md

# 或使用自定义 Release Notes
gh release create v1.0 \
  --title "v1.0 - Foundation 🎉" \
  --notes "ChatSystem v1.0 首个稳定版本发布！

## ✨ 核心特性

- 完整的即时通讯功能（单聊、群聊）
- 微服务架构（7个服务）
- Qt 跨平台客户端
- 实时消息推送（WebSocket）
- 多种消息类型（文本、图片、文件、语音）
- 语音识别（ASR）
- 全文搜索（Elasticsearch）

## 🏗️ 技术架构

- **语言**: C++ 17
- **数据库**: MySQL 5.7+, Redis 6.0+, Elasticsearch 7.x
- **消息队列**: RabbitMQ 3.8+
- **服务发现**: Etcd 3.4+
- **客户端**: Qt 5.15+
- **部署**: Docker & Docker Compose

## 📖 文档

- [架构对比分析](https://github.com/NQ-lovecpp/cpp_chatsystem/blob/main/Docs-and-demos/Rocket.Chat与ChatSystem架构对比分析.md)
- [技术演进规划](https://github.com/NQ-lovecpp/cpp_chatsystem/blob/main/Docs-and-demos/ChatSystem技术演进规划v1.0-v2.0.md)
- [发布清单](https://github.com/NQ-lovecpp/cpp_chatsystem/blob/main/Docs-and-demos/v1.0-Release-Checklist.md)

## ⚠️ 已知限制

- Elasticsearch 资源占用较大（推荐 4c8g+ 服务器）
- MySQL + ES 双写存在一致性风险
- httplib.h 并发性能有限（~10K QPS）

## 🔜 下一步

v2.0 规划中，将重点优化：
- 删除 Elasticsearch，降低资源占用
- 优化数据一致性
- 新增 AI 对话功能
- 增强缓存策略

详见：[技术演进规划](https://github.com/NQ-lovecpp/cpp_chatsystem/blob/main/Docs-and-demos/ChatSystem技术演进规划v1.0-v2.0.md)

## 📦 部署

\`\`\`bash
# 克隆项目
git clone https://github.com/NQ-lovecpp/cpp_chatsystem.git
cd cpp_chatsystem

# 启动后端服务
cd ChatSystem-Backend
docker-compose up -d

# 编译客户端
cd ../ChatSystem-Frontend-QtProj/ChatClient_Qt
mkdir build && cd build
cmake .. && make -j4
./ChatClient_Qt
\`\`\`

## 🙏 致谢

感谢所有使用和贡献的朋友们！

---

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**"
```

### 方式 B: 使用 GitHub 网页

1. 访问 https://github.com/NQ-lovecpp/cpp_chatsystem/releases/new
2. 选择标签: `v1.0`
3. 填写 Release 标题: `v1.0 - Foundation 🎉`
4. 复制 `Docs-and-demos/v1.0-Release-Checklist.md` 的内容到 Release Notes
5. 可选：上传编译好的客户端二进制文件
6. 点击 **"Publish release"**

---

## 📸 可选：上传二进制文件

如果你已经编译好了客户端，可以上传二进制文件：

```bash
# 使用 GitHub CLI 上传
gh release upload v1.0 \
  build/ChatClient_Qt-linux-x64.tar.gz \
  build/ChatClient_Qt-windows-x64.zip \
  build/ChatClient_Qt-macos-x64.dmg
```

---

## ✅ 发布检查清单

发布前请确认：

- [ ] 所有代码已提交
- [ ] 版本号正确（v1.0）
- [ ] Release Notes 完整
- [ ] 文档链接正确
- [ ] 已知问题已列出
- [ ] 部署说明清晰
- [ ] 联系方式正确

发布后：

- [ ] 在 GitHub 上验证 Release 页面
- [ ] 验证标签存在
- [ ] 验证下载链接
- [ ] 更新 README（添加 Release badge）
- [ ] 社交媒体宣传（可选）
- [ ] 通知贡献者和用户

---

## 🐛 遇到问题？

### 推送被拒绝

```bash
# 先拉取最新代码
git pull origin main --rebase

# 再次推送
git push origin main
git push origin v1.0
```

### GitHub CLI 未安装

```bash
# Ubuntu/Debian
sudo apt install gh

# macOS
brew install gh

# 登录
gh auth login
```

### 标签已存在

```bash
# 删除本地标签
git tag -d v1.0

# 删除远程标签
git push origin :refs/tags/v1.0

# 重新创建
git tag -a v1.0 -m "..."
git push origin v1.0
```

---

## 📚 参考文档

- [GitHub Releases 文档](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [GitHub CLI 文档](https://cli.github.com/manual/gh_release)
- [语义化版本](https://semver.org/lang/zh-CN/)

---

## 🎉 发布成功！

发布完成后，你的项目将：
- ✅ 出现在 GitHub Releases 页面
- ✅ 用户可以下载特定版本
- ✅ 可以通过标签访问代码快照
- ✅ 提升项目的专业度

**下一步**：
1. 添加 Release badge 到 README
2. 开始 v1.1 的开发
3. 收集用户反馈

祝项目越来越好！🚀

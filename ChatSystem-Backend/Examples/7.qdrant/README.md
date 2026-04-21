# 7. Qdrant 练习 / PoC

这是一个**纯练习用**的最小 codebase，目的：评估用 [Qdrant](https://qdrant.tech/) 替换 / 补充现有 Elasticsearch（`5.Message_Store_Server`）的可行性。

> **不会改动任何现有服务、`docker-compose.yaml`、CMake 构建。** 只在 `Examples/` 下新增一个独立的小 demo，按 `Examples/2.elasticsearch/` 的风格组织。

## 为什么是 Qdrant 而不是继续用 ES？

当前 `5.Message_Store_Server` 用 ES 做**关键词倒排检索**，做基本文本搜索没问题；但接下来 `8.Agent_Server`（FastAPI + OpenAI Agents SDK）越来越偏 RAG / 语义场景，**关键词匹配会越来越力不从心**。备选方案对比：

| 维度 | Elasticsearch (现状) | Qdrant |
|---|---|---|
| 主场 | 全文 / 倒排索引 / 聚合 | 向量相似度检索（HNSW） |
| 语义检索 | 需要 `dense_vector` + 8.x KNN，配置繁琐，资源吃得猛 | 一等公民，开箱即用 |
| 资源占用 | JVM，单节点常驻数 GB | 纯 Rust，单容器几十 ~ 几百 MB |
| 部署 | 需要 `vm.max_map_count` / 内存等系统级调优 | 一个容器 + 一个端口（6333）就能跑 |
| 过滤 | DSL 强大但学习曲线陡 | `filter.must / should / must_not` + payload，足够日常使用 |
| 接入 C++ | 用 `elasticlient` HTTP 包装 | 直接打 REST（6333）或 gRPC（6334） |

结论：**对于聊天消息的语义检索 / Agent RAG 场景，Qdrant 是更轻、更对口的工具**；ES 暂时不动，仍然处理关键词检索。Qdrant 跑通后，可以在 `5.Message_Store_Server` 增加一条“写消息时同步写一份 embedding 到 Qdrant”的旁路，做读写双写。

## 目录结构

```
7.qdrant/
├── Makefile             # 编译方式与 2.elasticsearch/Makefile 对齐
├── qdrant_basic.hpp     # 极简的 Qdrant HTTP 封装（建集合 / Upsert / Search / Delete）
├── qdrant_test.cc       # 端到端 demo：建集合 → upsert → 向量检索 → 带过滤检索 → 删除
└── README.md
```

依赖（项目里已经在用了，无需额外引入）：

- `cpr`（HTTP 客户端）
- `jsoncpp`
- `spdlog`
- `gflags`

## 启动一个本地 Qdrant

不要动现有 `docker-compose.yaml`；单独跑一个临时容器即可：

```bash
docker run -d --name qdrant-poc \
  -p 6333:6333 -p 6334:6334 \
  -v "$PWD/qdrant_data:/qdrant/storage" \
  qdrant/qdrant:v1.12.4
```

Web Dashboard：<http://127.0.0.1:6333/dashboard>

健康检查：

```bash
curl -s http://127.0.0.1:6333/readyz
```

## 编译 & 运行

```bash
cd ChatSystem-Backend/Examples/7.qdrant
make
./qdrant_test
# 或自定义地址 / 集合名
./qdrant_test --qdrant_url=http://127.0.0.1:6333 --collection=chat_messages_demo
```

跑完会看到三段检索结果：

1. **纯向量检索**：查询向量与 “今晚一起吃火锅吗？” / “晚上去吃顿火锅怎么样” 的向量接近，应排在前两位。
2. **向量 + payload 过滤** (`user == zhangsan`)：只返回 zhangsan 的消息。
3. **删除一个点后再查**：被删的点不再出现。

## Demo 里 Qdrant 的几个核心 API

| 操作 | HTTP | 路径 |
|---|---|---|
| 建集合 | `PUT` | `/collections/{name}` |
| 删集合 | `DELETE` | `/collections/{name}` |
| Upsert（插入/更新都用它） | `PUT` | `/collections/{name}/points?wait=true` |
| 向量检索（可带 filter） | `POST` | `/collections/{name}/points/search` |
| 删除点 | `POST` | `/collections/{name}/points/delete?wait=true` |

## 接下来如果要落到主项目里

- 在 `5.Message_Store_Server`：消息入库时，调一次 embedding 接口，把向量 + `{message_id, chat_session_id, user_id, text}` 当 payload 一起 upsert 到 Qdrant。
- 在 `8.Agent_Server` 的 `tools/db_tools.py` 增加 `semantic_search_messages(query, k)`：先 embed 再调 Qdrant 检索，给 Agent 用。
- 集合的 `vector_size` 要和真实 embedding 模型对齐（OpenAI `text-embedding-3-small` = 1536，`bge-small-zh` = 512 等）。
- 生产部署再把 Qdrant 加进 `docker-compose.yaml`（image: `qdrant/qdrant`，端口 6333/6334，挂卷到 `./docker_image_data/qdrant`），不要在 PoC 阶段改。

只是练习用，所以这里点到为止。 

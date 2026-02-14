# Session 与 Status 合并重构方案（方案 A）

## 一、背景与问题

### 1.1 当前 Redis 使用情况

| 功能 | 类 | Redis 结构 | 使用服务 | 说明 |
|------|-----|------------|----------|------|
| **会话管理** | `Session` | `ssid → uid` | User_Server、Gateway | 登录创建，鉴权查询，keepAlive 刷新 |
| **登录状态** | `Status` | `uid → ""` | User_Server、Gateway | 防重复登录，断开时删除，keepAlive 刷新 |
| **验证码** | `Codes` | `code_id → code` | User_Server | 手机注册、手机登录、修改绑定手机 |
| **应急清理** | `RedisDatabaseUtility` | - | Gateway | 进程异常退出时 `flushall` 清空 Redis |

### 1.2 当前设计存在的问题

**安全漏洞：**

- **新登录未作废旧 session**：设备 A 断开后 status 被删，设备 B 可登录，但设备 A 的 session 仍有效，导致同一账号多设备同时在线
- **无显式登出**：无 logout 接口，无法主动作废 session
- **Session 劫持窗口大**：sessionId 存 localStorage，断开后 session 仍保留 24h，被窃取后可长期使用

**冗余与不一致：**

- **Status 语义不清**：设计为“用户是否已登录”，但断开时删除、重连时不再写入，keepAlive 仍对不存在的 key 做 refresh
- **Session 与 Status 职责重叠**：鉴权只用 session，防重复登录只用 status，两者都参与登录流程，逻辑分散

---

## 二、方案 A：合并为单一 Session 存储

### 2.1 核心思路

用 `uid → ssid` 作为“当前有效会话”的索引，将鉴权和防重复登录统一到 session 上，删除 Status 类。

### 2.2 变更对比

| 维度 | 当前 | 方案 A |
|------|------|--------|
| **Session** | `ssid → uid` | 保留，仍为 `ssid → uid` |
| **Status** | `uid → ""` | **删除**，不再使用 |
| **新增** | - | `uid → ssid`（当前有效会话的反向索引） |

### 2.3 方案 A 下的 Redis 结构

| 键 | 值 | TTL | 用途 |
|----|-----|-----|------|
| `ssid` | `uid` | 24h | 鉴权：`get_uid(ssid)` |
| `uid` | `ssid` | 24h | 防重复登录 + 作废旧 session |
| `code_id` | `code` | 5min | 验证码（不变） |

### 2.4 方案 A 下的操作流程

| 场景 | 操作 |
|------|------|
| **登录** | 1. `get(uid)` 查是否已有 session；2. 若有，`del(old_ssid)` 作废旧 session；3. `set(ssid, uid)`、`set(uid, ssid)` |
| **鉴权** | `get(ssid)` → 得到 `uid`（不变） |
| **keepAlive** | `expire(ssid, 24h)`、`expire(uid, 24h)` |
| **断开** | `del(uid)`，保留 `ssid → uid`（支持刷新恢复） |
| **新设备登录** | `get(uid)` 得到旧 `ssid` → `del(old_ssid)` → 创建新 session |

---

## 三、实现要点

### 3.1 修改 `redis_CRUD.hpp`

1. **扩展 Session 类**：增加 `get_ssid(uid)`、`remove_by_uid(uid)` 等接口，或新增 `SessionIndex` 类管理 `uid → ssid`
2. **删除 Status 类**：移除 `Status` 类及其所有引用
3. **Session 需支持**：
   - `append(ssid, uid)`：同时写入 `ssid→uid` 和 `uid→ssid`
   - `get_uid(ssid)`：鉴权
   - `get_ssid(uid)`：获取当前有效 ssid（用于作废旧 session）
   - `remove(ssid)`：删除 session
   - `remove_by_uid(uid)`：根据 uid 删除（需先 get_ssid 再 del）
   - `refresh(ssid)` / `refresh_by_uid(uid)`：刷新 TTL

### 3.2 修改 User_Server

- **登录逻辑**：`status.exists(uid)` 改为 `session.get_ssid(uid)`；若存在，先 `session.remove(old_ssid)`，再 `session.append(new_ssid, uid)`
- **移除**：所有 `_redis_status` 引用

### 3.3 修改 Gateway_Server

- **keepAlive**：`status.refresh(uid)` 改为 `session.refresh_by_uid(uid)` 或对 `uid→ssid` 做 expire
- **断开**：`status.remove(uid)` 改为 `session.remove_uid_index(uid)`（只删 `uid→ssid`，保留 `ssid→uid`）
- **移除**：所有 `_redis_status` 引用

### 3.4 键命名空间

为避免 `ssid` 与 `uid` 冲突（若两者格式相同），建议使用前缀：

- Session 正向：`session:ssid` → `uid`
- Session 反向：`session_uid:uid` → `ssid`

---

## 四、方案 A 下 Redis 的最终职责

| 功能 | 说明 |
|------|------|
| **Session（合并后）** | 鉴权 + 防重复登录 + 作废旧 session，通过 `ssid→uid` 与 `uid→ssid` 两个键实现 |
| **Codes** | 验证码，逻辑不变 |
| **RedisDatabaseUtility** | 应急清理，逻辑不变 |

---

## 五、后续可考虑增强

1. **显式 Logout**：提供 logout 接口，主动删除 session
2. **Session 劫持缓解**：如绑定 IP/User-Agent、缩短 TTL、支持“踢下线”等

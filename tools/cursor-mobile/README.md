# Cursor 手机指令中继

手机发令工具，支持两种本地方案。

## 方案对比（重要）

| 方案 | 管什么 | 个人账号能用 | 手机体验 |
|------|--------|-------------|---------|
| **remote-agent（推荐）** | 电脑上的 **Cursor CLI**，直接改本地项目 | ✅ | 完整聊天、审批工具、看输出 |
| **My Machines worker** | 电脑目录，但任务从 **cursor.com** 下发 | ✅ 需在网页选机器 | 官方手机网页仍可能发不出 |
| **本中继 + Cloud API** | GitHub 云端虚拟机 | ✅ | 只能发令，不能管本地未保存文件 |

**你要的「管电脑本地 Cursor」→ 用 `start-remote-agent.ps1`。**

---

## 推荐：remote-agent（本机 Cursor CLI）

### 1. 确保 Cursor CLI 可用

```powershell
agent --version
```

若报 `No version directories found`：

```powershell
.\tools\cursor-mobile\fix-agent-cli.ps1
```

### 2. 启动（出门用 Tailscale）

```powershell
.\tools\cursor-mobile\start-remote-agent.ps1 -Tailscale
```

同一 WiFi 可试：

```powershell
.\tools\cursor-mobile\start-remote-agent.ps1 -SameLan
```

### 3. 手机打开打印出来的 HTTPS 地址

1. 新建 Session
2. Provider 选 **Cursor CLI**
3. 工作目录选：`C:\Users\SHIKIMORI\Desktop\个人网站`
4. 发指令、审批工具调用、看实时输出

可安装为 PWA 加到主屏幕。

---

## 备选：My Machines worker

适合在 **cursor.com/agents** 网页操作（推理在云端，改文件在你电脑）。

### 启动 worker

```powershell
.\tools\cursor-mobile\start-worker.ps1
```

保持窗口不关。当前配置：

- 名称：`shikimori-desktop`
- 目录：`C:\Users\SHIKIMORI\Desktop\个人网站`

### 在 Cursor 网页使用

打开 [cursor.com/agents](https://cursor.com/agents)，环境选 **shikimori-desktop**，再发任务。

> 注意：你的账号 **不能通过 API 自动触发本机 worker**（会报 Private workers not enabled）。只能网页手动选机器，或用上面的 remote-agent。

---

## 旧版手机中继（Cloud / API）

```powershell
.\tools\cursor-mobile\start-local.ps1
```

会开两个窗口：worker + 中继网页（4789）。

手机访问：`http://<电脑IP>:4789/?token=你的ACCESS_TOKEN`

`.env` 关键项：

| 变量 | 说明 |
|------|------|
| `AGENT_TARGET` | `local` 或 `cloud` |
| `WORKER_NAME` | 本机 worker 名 |
| `ACCESS_TOKEN` | 手机访问口令 |

---

## 一键命令速查

```powershell
# 本机 Cursor（推荐）
.\tools\cursor-mobile\start-remote-agent.ps1 -Tailscale

# 本机 worker（给 cursor.com 网页用）
.\tools\cursor-mobile\start-worker.ps1

# 手机中继网页
.\tools\cursor-mobile\start.ps1

# 修复 Windows 下 agent 命令
.\tools\cursor-mobile\fix-agent-cli.ps1
```

---

## 安全

- 不要提交 `.env`
- 出门用 Tailscale，不要把端口暴露公网
- API Key 泄露后去 Dashboard 撤销重建

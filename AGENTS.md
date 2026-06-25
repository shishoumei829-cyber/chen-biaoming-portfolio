# 个人 Codex 偏好

- 除非用户明确要求，否则始终用中文回答。
- 回复保持简洁，避免不必要的铺垫。
- 优先给直接答案，不写冗长解释。
- 对话里出现分歧、修正或设计偏好冲突时，尽量记录到合适的日志或长期指令里，避免重复犯错。
- 执行任务前，先检查适用的偏好日志或指令。
- 前端、网页或交互 UI 需要动画时，优先使用 GSAP 和已安装的 GSAP 技能；只有非常简单的 hover 或过渡效果才用纯 CSS。
- 所有网页布局、构图和视觉样式工作，在设计或编辑前默认使用已安装的 `gpt-tasteskill` 审美技能。

## Cursor 强制规则（所有对话）

以下文件对本仓库 **始终或按路径生效**，改代码前必须遵守：

| 文件 | 作用 |
|------|------|
| `.cursor/rules/agent-work-constitution.mdc` | 全对话：感知优先、禁止补丁堆叠、先读后改、验证后才能说完成 |
| `.cursor/rules/digitalark-scroll.mdc` | 数字方舟相关文件：横滑体验宪法、禁止项、四步验收 |

**数字方舟铁律（摘要）**：白底 `#da2Cover` 是首页 → 红档案 6 屏横滑一屏一吸附 → 06 轻滑吸附 `#da2FinaleStage`；禁止空白红 pin 页、双 pin 卡死、氛围图占屏。

## Codex + opencode 委派规则

- Codex 作为审核者和大脑，opencode + DeepSeek 作为简单、低风险任务的执行手。
- 小改动、错别字、文件检查、轻量脚本、简单格式整理，优先使用 `tools/opencode-delegate.ps1` 委派，再由 Codex 检查 `git diff` 并修正不合格部分。
- 产品、设计、架构方向不确定时，使用 `tools/opencode-meeting.ps1` 收集模型意见，再由 Codex 用中文总结取舍，交给用户拍板。
- 高风险任务不能盲目委派：密钥、破坏性文件操作、大规模重构、发布部署、隐私敏感内容、方向不明确的设计决策，都必须先由 Codex 审核。
- 任何委派修改完成后，Codex 必须检查变更文件，尽量运行相关验证，并说明 opencode 做了什么、Codex 修改了什么、还有什么风险。

## Cursor Cloud specific instructions

本仓库是个人作品集，包含两类可运行目标：

1. **静态作品集网站（主交付物）**：根目录 `index.html` + 多个静态子站（`digitalark/`、`timewalker-app/`、`resume/` 等），用 GitHub Pages 部署（见 `scripts/deploy-github.ps1`、`.nojekyll`）。
   - 本地预览：在仓库根目录跑 `python3 -m http.server 8080`，访问 `http://localhost:8080/`（直接双击 `index.html` 也行，但子站资源用 HTTP 服务更可靠）。
   - 纯前端、无构建步骤；动效用 GSAP。

2. **amadeus（Node + Express + Electron 的本地 AI 伴侣后端）**：目录 `amadeus/`。
   - 启动：`cd amadeus && npm run dev`（即 `node server.js`），监听 `http://localhost:3000`，聊天 UI 在 `/amadeus_work.html`。其余命令见 `amadeus/README.md` / `amadeus/INSTALL.md`。
   - **聊天功能依赖本地 Ollama**（非 npm 依赖，不在 update script 内，需单独装）。无 Ollama 时后端仍能启动并提供页面，但 `/health` 会返回 503、`/chat` 报错——这是预期行为。
   - **Ollama 版本坑（重要）**：在本 CPU 虚拟机上，最新版 Ollama（0.30.x 新引擎）在模型预热时会 `segmentation fault` 崩溃。请用较旧稳定版：`OLLAMA_VERSION=0.5.13 sh <(curl -fsSL https://ollama.com/install.sh)`（装 Ollama 前需先 `apt-get install -y zstd`）。安装后无 systemd，需手动 `ollama serve` 后台运行。
   - **模型名**：UI 与 `/health` 默认聊天模型硬编码为 `kurisu:latest`。CPU 环境可拉小模型并起别名：`ollama pull qwen2.5:0.5b` 然后用 `FROM qwen2.5:0.5b` 的 Modelfile 跑 `ollama create kurisu:latest -f Modelfile`。也可临时在 `amadeus/.env` 设 `AMADEUS_CHAT_MODEL`（`.env` 已被 gitignore）。小模型回复质量差但能验证链路通畅。
   - **自动化测试现状**：`amadeus` 的 `npm test` 脚本引用 `amadeus/tests/*.test.js`，但该 `tests/` 目录未提交到仓库，因此现状下 `npm test` 找不到文件、无法运行（非环境问题）。
   - 运行数据默认写到用户主目录 `~/amadeus_data/`，不污染仓库。
   - Electron 桌面壳 `npm start` 在无显示环境（云 VM）下无法直接运行，请用 `npm run dev` 走浏览器。

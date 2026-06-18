# Codex + opencode 工作流

目标：Codex 做大脑，opencode + DeepSeek 做执行手。简单任务先委派，Codex 负责最后审查、修正和总结。

## 已打通

- CLI: `%LOCALAPPDATA%\OpenCode\opencode-cli.exe`
- 普通执行模型: `deepseek/deepseek-chat`
- 复杂分析模型: `deepseek/deepseek-reasoner`
- 凭据位置由 opencode 管理，不在本仓库保存密钥。

## 委派规则

Codex 可以把这些任务交给 opencode：

- 小范围文案、样式、脚本修复
- 文件定位、重复文本替换、简单格式整理
- 低风险 bug 初修
- 先让 DeepSeek 给方案或初稿，再由 Codex 审核

Codex 不应直接放手的任务：

- 删除/移动大量文件
- 架构重构、数据迁移、发布配置
- 涉及密钥、账号、支付、隐私数据
- 用户方向不明确的设计决策

## 使用方式

只读检查：

```powershell
.\tools\opencode-delegate.ps1 "检查首页是否有断链，不要修改文件"
```

允许 opencode 修改文件：

```powershell
.\tools\opencode-delegate.ps1 "把 README 里的错别字修掉" -AllowEdits
```

指定模型：

```powershell
.\tools\opencode-delegate.ps1 "分析这个 bug 的可能原因" -Model deepseek/deepseek-reasoner
```

## Codex 审核步骤

每次 opencode 修改后，Codex 必须做：

1. `git diff --stat`
2. 阅读实际 diff
3. 运行相关测试或最小验证
4. 修掉不合格部分
5. 用中文向用户总结：opencode 做了什么、Codex 改了什么、剩余风险

## 会议室机制

当方向不确定时，Codex 可以拉一个本地会议目录：

```powershell
.\tools\opencode-meeting.ps1 "个人网站首页是否应该弱化数字方舟，突出 MIRAGE 和 AMADEUS？"
```

默认参会模型：

- `deepseek/deepseek-chat`
- `deepseek/deepseek-reasoner`

如果以后在 opencode 里配置了 OpenAI、Claude、Gemini、Qwen 等凭据，可以这样扩展：

```powershell
.\tools\opencode-meeting.ps1 "主题" -Models @(
  "deepseek/deepseek-chat",
  "deepseek/deepseek-reasoner",
  "openai/gpt-4.1",
  "anthropic/claude-sonnet-4",
  "google/gemini-2.5-pro"
)
```

会议输出会写入 `.codex\meetings\<时间戳>\`。Codex 阅读这些观点后，再给用户一份最终总结，由用户拍板。

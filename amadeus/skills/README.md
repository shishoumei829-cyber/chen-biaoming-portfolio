# Amadeus Skills

与 [Cursor Agent Skills](https://cursor.com/docs/skills) 同结构的 `SKILL.md`，由红莉栖在对话时**自动匹配**或**手动指定**后注入提示词。

## 放哪里

| 目录 | 作用 |
|------|------|
| `Amadeus_Project/skills/你的技能名/SKILL.md` | 项目技能（推荐） |
| `Amadeus_Project/.cursor/skills/` | 与 Cursor 项目技能共用 |
| `%USERPROFILE%\.cursor\skills\` | 个人技能（默认扫描） |

## 手动启用

```
@skill:code-helper 帮我看这个报错
@技能:neuro-lab 实验设计有没有漏洞
```

## 环境变量

```env
AMADEUS_SKILLS=1
AMADEUS_SKILLS_MAX=2
AMADEUS_SKILLS_CHARS=1400
# AMADEUS_SKILLS_USER=0   # 不扫描 ~/.cursor/skills
# AMADEUS_SKILLS_DIRS=D:\other\skills  # 额外目录（; 分隔）
```

## 查看已加载技能

`GET http://localhost:3000/skills`

## 新建技能

复制 `code-helper` 文件夹，改 `SKILL.md` 头部：

```yaml
---
name: my-skill
description: 做什么 + 什么时候用（写清触发词）
modes: work        # work | chat | work,chat
triggers:
  - 正则或关键词
disable-model-invocation: true   # 仅 @skill 时启用
---
```

`disable-model-invocation: true` 时不会自动匹配，只能 `@skill:name` 调用。

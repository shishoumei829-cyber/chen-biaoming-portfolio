'use strict';

/**
 * 轻量 BDI：根据最近用户发言推断信念 / 欲望 / 意图（JSON）
 * 失败时返回 null，主流程可忽略。
 */

const DEFAULT_MODEL = process.env.AMADEUS_BDI_MODEL || 'llama3.2:latest';
const OLLAMA_CHAT = process.env.AMADEUS_OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';

function stripThinking(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*?<\/redacted_thinking>/gi, '')
    .trim();
}

/**
 * @param {{ recentUserLines: string[], model?: string, timeoutMs?: number }} opts
 * @returns {Promise<{ beliefs: string[], desires: string[], intentions: string[] } | null>}
 */
async function inferUserBdi(opts) {
  const lines = (opts.recentUserLines || []).filter(Boolean).slice(-10);
  if (!lines.length) return null;

  const model = opts.model || DEFAULT_MODEL;
  const timeoutMs = Number(opts.timeoutMs) || 8000;

  const system = `你是对话心理分析器（心智理论）。只输出一个 JSON 对象，不要 markdown，不要解释。
字段：
- beliefs：他相信/认定什么（1-3条短句，可含对事实或对你的看法）
- desires：他情绪上或关系上想要什么（0-3条，如被理解、被认可、独处）
- intentions：他这轮话表面/深层想达成什么（0-3条，如倾诉、试探、拌嘴、求帮忙）
结合语气与上下文，区分字面与潜台词。全部用中文短句；信息不足则数组为空。`;

  const user = `以下是用户最近发言（从新到旧或从旧到新均可，自行判断语气）：\n${lines.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(OLLAMA_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        options: { temperature: 0.3, num_predict: 220 },
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const raw = stripThinking((data.message && data.message.content) || data.response || '');
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = JSON.parse(m[0]);
    const beliefs = Array.isArray(parsed.beliefs) ? parsed.beliefs.map(String).filter(Boolean).slice(0, 5) : [];
    const desires = Array.isArray(parsed.desires) ? parsed.desires.map(String).filter(Boolean).slice(0, 5) : [];
    const intentions = Array.isArray(parsed.intentions) ? parsed.intentions.map(String).filter(Boolean).slice(0, 5) : [];
    return { beliefs, desires, intentions };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

module.exports = { inferUserBdi, DEFAULT_MODEL };

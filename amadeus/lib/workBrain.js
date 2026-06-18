'use strict';

/**
 * 工作脑：Gemini / OpenAI 兼容 / 大模型 Ollama
 * 用于代码、文档、分析等需要强推理的任务。
 */

const OLLAMA_BASE = (process.env.AMADEUS_OLLAMA_BASE || process.env.AMADEUS_OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');

const WORK_SYSTEM = `你是牧濑红莉栖的「工作脑」——在处理研究、代码、文档、逻辑分析、规划与排错时，发挥与顶级云端助手同级的前瞻推理与专业能力。

规则：
1. 优先正确、可执行、结构清晰；可分点、列步骤、给代码块（注明语言）。
2. 保持她的智力底色：干脆、讨厌废话、对明显错误不容忍；不必每句傲娇，也不必表演人设。
3. 不要自称 Google/Gemini/OpenAI/AI 助手/聊天机器人；你是红莉栖在认真处理工作。
4. 中文为主；代码、公式、专有名词保留英文。
5. 不确定时明说；禁止编造数据、文献、对话里没出现过的「你说过」。
6. 若对方贴代码/报错，先定位原因再给修复；避免空泛鼓励。`;

const DEEPSEEK_DEFAULT_BASE = 'https://api.deepseek.com/v1';
const DEEPSEEK_DEFAULT_MODEL = 'deepseek-chat';
const DEEPSEEK_REASONER_MODEL = 'deepseek-reasoner';

function getWorkBrainConfig() {
  const provider = String(process.env.AMADEUS_WORK_BRAIN || 'off').trim().toLowerCase();
  const useReasoner = String(process.env.AMADEUS_WORK_USE_REASONER || '0').trim() === '1';
  const openaiBase = String(process.env.AMADEUS_WORK_OPENAI_BASE || '').trim();
  const openaiModel = String(process.env.AMADEUS_WORK_OPENAI_MODEL || '').trim();
  const isDeepseekProvider = provider === 'deepseek' || provider === 'deepseek-chat' || provider === 'deepseek-reasoner';
  const resolvedOpenaiBase = openaiBase
    || (isDeepseekProvider ? DEEPSEEK_DEFAULT_BASE : 'https://api.openai.com/v1');
  const resolvedOpenaiModel = openaiModel
    || (provider === 'deepseek-reasoner' || (isDeepseekProvider && useReasoner)
      ? DEEPSEEK_REASONER_MODEL
      : (isDeepseekProvider ? DEEPSEEK_DEFAULT_MODEL : 'gpt-4o-mini'));

  return {
    provider,
    gemini: {
      apiKey: String(process.env.AMADEUS_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim(),
      model: String(process.env.AMADEUS_GEMINI_MODEL || 'gemini-2.0-flash').trim(),
      baseUrl: String(process.env.AMADEUS_GEMINI_BASE || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, ''),
    },
    openai: {
      apiKey: String(
        process.env.AMADEUS_OPENAI_API_KEY
        || process.env.AMADEUS_WORK_API_KEY
        || process.env.OPENAI_API_KEY
        || '',
      ).trim(),
      model: resolvedOpenaiModel.replace(/\/$/, ''),
      baseUrl: resolvedOpenaiBase.replace(/\/$/, ''),
    },
    ollama: {
      model: String(process.env.AMADEUS_WORK_OLLAMA_MODEL || 'qwen2.5:14b').trim(),
      baseUrl: OLLAMA_BASE,
    },
    maxTokens: Math.min(8192, Math.max(256, Number(process.env.AMADEUS_WORK_MAX_TOKENS) || 2048)),
    timeoutMs: Math.min(120000, Math.max(8000, Number(process.env.AMADEUS_WORK_TIMEOUT_MS) || 90000)),
  };
}

function resolveActiveProvider(cfg) {
  const p = cfg.provider;
  if (p === 'off' || !p) return null;
  if (p === 'gemini' && cfg.gemini.apiKey) return 'gemini';
  if (
    (p === 'openai' || p === 'openai_compat' || p === 'deepseek'
      || p === 'deepseek-chat' || p === 'deepseek-reasoner')
    && cfg.openai.apiKey
  ) return 'openai';
  if (p === 'ollama') return 'ollama';
  if (p === 'auto') {
    if (cfg.gemini.apiKey) return 'gemini';
    if (cfg.openai.apiKey) return 'openai';
    return 'ollama';
  }
  return null;
}

function isWorkBrainEnabled() {
  return resolveActiveProvider(getWorkBrainConfig()) !== null;
}

function getWorkBrainStatus() {
  const cfg = getWorkBrainConfig();
  const active = resolveActiveProvider(cfg);
  return {
    enabled: active !== null,
    configured: cfg.provider !== 'off' && cfg.provider !== '',
    provider: cfg.provider,
    active,
    gemini: { configured: Boolean(cfg.gemini.apiKey), model: cfg.gemini.model },
    openai: { configured: Boolean(cfg.openai.apiKey), model: cfg.openai.model, baseUrl: cfg.openai.baseUrl },
    ollama: { model: cfg.ollama.model, baseUrl: cfg.ollama.baseUrl },
    autoRoute: String(process.env.AMADEUS_WORK_AUTO || '1').trim() !== '0',
  };
}

function dialogueToMessages(dialogue, latestUser) {
  const out = [];
  for (const m of dialogue || []) {
    if (!m || !m.content) continue;
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    let text = String(m.content).trim();
    if (!text) continue;
    if (role === 'assistant') {
      text = text.replace(/\n\s*JP\s*[:：][\s\S]*$/i, '').trim();
    }
    out.push({ role, content: text });
  }
  const last = out[out.length - 1];
  const user = String(latestUser || '').trim();
  if (user && (!last || last.role !== 'user' || last.content !== user)) {
    out.push({ role: 'user', content: user });
  }
  return out.slice(-24);
}

function buildWorkSystemPrompt(extra = '') {
  const x = String(extra || '').trim();
  return x ? `${WORK_SYSTEM}\n\n${x}` : WORK_SYSTEM;
}

async function callWorkBrain(opts) {
  const cfg = getWorkBrainConfig();
  const provider = resolveActiveProvider(cfg);
  if (!provider) {
    throw new Error('工作脑未配置：请设置 AMADEUS_WORK_BRAIN=gemini 并填写 AMADEUS_GEMINI_API_KEY');
  }

  const messages = opts.messages || [];
  const system = buildWorkSystemPrompt(opts.systemExtra);
  const temperature = Number.isFinite(opts.temperature) ? opts.temperature : 0.35;
  const maxTokens = Number.isFinite(opts.maxTokens) ? opts.maxTokens : cfg.maxTokens;
  const stream = opts.stream === true;
  const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : cfg.timeoutMs;

  if (provider === 'gemini') {
    return callGemini({ cfg, system, messages, temperature, maxTokens, stream, timeoutMs });
  }
  if (provider === 'openai') {
    return callOpenAICompat({ cfg, system, messages, temperature, maxTokens, stream, timeoutMs });
  }
  return callOllamaWork({ cfg, system, messages, temperature, maxTokens, stream, timeoutMs });
}

async function callGemini({ cfg, system, messages, temperature, maxTokens, stream, timeoutMs }) {
  const { apiKey, model, baseUrl } = cfg.gemini;
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    contents,
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };

  const q = `key=${encodeURIComponent(apiKey)}`;
  const url = stream
    ? `${baseUrl}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&${q}`
    : `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?${q}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify(body),
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 240)}`);
    }
    if (stream) {
      return { provider: 'gemini', stream: true, response: res };
    }
    const data = await res.json();
    const text = extractGeminiText(data);
    return { provider: 'gemini', stream: false, text };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((p) => p.text || '').join('').trim();
}

function extractGeminiStreamDelta(obj) {
  return extractGeminiText(obj);
}

async function callOpenAICompat({ cfg, system, messages, temperature, maxTokens, stream, timeoutMs }) {
  const { apiKey, model, baseUrl } = cfg.openai;
  const oaiMessages = [{ role: 'system', content: system }, ...messages];

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        messages: oaiMessages,
        temperature,
        max_tokens: maxTokens,
        stream,
      }),
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`OpenAI HTTP ${res.status}: ${errText.slice(0, 240)}`);
    }
    if (stream) {
      return { provider: 'openai', stream: true, response: res };
    }
    const data = await res.json();
    const msg = data?.choices?.[0]?.message || {};
    const text = msg.content || msg.reasoning_content || '';
    return { provider: 'openai', stream: false, text: String(text).trim() };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function callOllamaWork({ cfg, system, messages, temperature, maxTokens, stream, timeoutMs }) {
  const oaiMessages = [{ role: 'system', content: system }, ...messages];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${cfg.ollama.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: cfg.ollama.model,
        messages: oaiMessages,
        stream,
        options: { temperature, num_predict: maxTokens, num_ctx: 8192 },
      }),
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Ollama work HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }
    if (stream) {
      return { provider: 'ollama', stream: true, response: res };
    }
    const data = await res.json();
    const text = (data.message && data.message.content) || data.response || '';
    return { provider: 'ollama', stream: false, text: String(text).trim() };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/** 将 Gemini / OpenAI / Ollama 流转为 SSE { text } 写给前端 */
async function pipeWorkStreamToSse(provider, upstreamRes, res, onFull) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const reader = upstreamRes.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';
  let full = '';

  const writeToken = (token) => {
    if (!token) return;
    full += token;
    res.write(`data: ${JSON.stringify({ text: token })}\n\n`);
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        if (line.startsWith('data:')) line = line.slice(5).trim();
        if (line === '[DONE]') continue;

        try {
          const obj = JSON.parse(line);
          if (provider === 'gemini') {
            const delta = extractGeminiStreamDelta(obj);
            writeToken(delta);
            continue;
          }
          if (provider === 'openai') {
            const delta = obj?.choices?.[0]?.delta?.content || '';
            writeToken(delta);
            continue;
          }
          const delta = (obj.message && obj.message.content) || obj.response || '';
          writeToken(delta);
          if (obj.done) break;
        } catch {
          /* 非 JSON 行忽略 */
        }
      }
    }
  } finally {
    if (typeof onFull === 'function') onFull(full);
    res.write('data: [DONE]\n\n');
    if (!res.writableEnded) res.end();
  }
}

module.exports = {
  WORK_SYSTEM,
  getWorkBrainConfig,
  getWorkBrainStatus,
  isWorkBrainEnabled,
  resolveActiveProvider,
  dialogueToMessages,
  buildWorkSystemPrompt,
  callWorkBrain,
  pipeWorkStreamToSse,
  extractGeminiText,
};

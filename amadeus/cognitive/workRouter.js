'use strict';

/**
 * 工作脑 / 人设脑 路由：何时用 Gemini 级云端推理，何时走本地 Ollama。
 */

const WORK_PREFIX_RE = /^[@＠](?:工作|work|大脑|iq)\s*/i;
const EXPLICIT_WORK_RE = /^\/(?:work|iq|brain)\b\s*/i;

const WORK_HINT_RE = new RegExp(
  [
    '帮我(写|做|改|润色|翻译|总结|分析|查|算|列|拟|审|校对|归纳|拆解|规划|评估)',
    '请(写|做|改|翻译|总结|分析|解释|列出|给出)',
    '写一(篇|份|段|个)',
    '(代码|程序|脚本|函数|类|接口|API|SQL|正则)',
    '(报错|error|exception|stack\\s*trace|编译|debug|调试)',
    '(论文|摘要|文献|引用|实验设计|统计|回归|假设检验)',
    '(excel|表格|ppt|幻灯片|markdown|文档)',
    '(方案|计划书|roadmap|需求|规格|架构|设计文档)',
    '(对比|优缺点|利弊|可行性)',
    '用(python|javascript|typescript|java|c\\+\\+|rust|go)\\b',
    '```',
  ].join('|'),
  'i',
);

const CHAT_ONLY_RE = new RegExp(
  [
    '想你|喜欢你|爱你|在乎你|陪我|别走',
    '难受|伤心|害怕|孤独|寂寞|心情不好|无聊',
    '克里斯蒂?娜|助手|冈部|凤凰院|凶真',
    '在吗|干嘛呢|吃了吗|晚安|早安|你好',
    '你是谁|我是谁|记得我吗',
  ].join('|'),
  'i',
);

/**
 * @param {object} body 请求体
 * @param {string} userText
 * @returns {'work'|'chat'}
 */
function resolveBrainMode(body, userText) {
  const explicit = String(body?.brainMode || body?.brain || body?.mode || '').trim().toLowerCase();
  if (['work', 'iq', 'brain', 'gemini', 'cloud'].includes(explicit)) return 'work';
  if (['chat', 'soul', 'kurisu', 'local', 'ollama'].includes(explicit)) return 'chat';

  const t = String(userText || '').trim();
  if (!t) return 'chat';

  if (WORK_PREFIX_RE.test(t) || EXPLICIT_WORK_RE.test(t)) return 'work';

  const auto = String(process.env.AMADEUS_WORK_AUTO || '1').trim() !== '0';
  if (!auto) return 'chat';

  if (CHAT_ONLY_RE.test(t) && !WORK_HINT_RE.test(t)) return 'chat';
  if (t.length <= 14 && !WORK_HINT_RE.test(t)) return 'chat';

  if (WORK_HINT_RE.test(t)) return 'work';
  if (t.length > 280 && /[。；\n]/.test(t)) return 'work';

  return 'chat';
}

function stripWorkPrefix(userText) {
  return String(userText || '')
    .replace(WORK_PREFIX_RE, '')
    .replace(EXPLICIT_WORK_RE, '')
    .trim();
}

module.exports = {
  resolveBrainMode,
  stripWorkPrefix,
  WORK_PREFIX_RE,
};

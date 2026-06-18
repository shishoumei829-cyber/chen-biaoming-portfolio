'use strict';

/**
 * 打开页面时的“在场感”决策。
 * 这里只产生概率、延迟和情境事实，不产生固定对白。
 */

function _num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function _clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function chooseOpenPresenceDelayMs(opts = {}) {
  const rng = typeof opts.rng === 'function' ? opts.rng : Math.random;
  const min = _clamp(_num(opts.minMs, 1200), 300, 10000);
  const max = Math.max(min, _clamp(_num(opts.maxMs, 5000), 300, 12000));
  return Math.round(min + (max - min) * _clamp(rng(), 0, 1));
}

function openPresenceSpeakChance(ctx = {}) {
  if (ctx.hidden || ctx.quotaOk === false || ctx.startupReady === false) return 0;

  const sinceLastOpenSpeakMs = _num(ctx.sinceLastOpenSpeakMs, Infinity);
  if (sinceLastOpenSpeakMs < 10 * 60 * 1000) return 0.08;

  const closeness = _clamp(_num(ctx.closeness, 0), 0, 1);
  const lastUserAgeMs = _num(ctx.lastUserAgeMs, Infinity);
  const lastKurisuAgeMs = _num(ctx.lastKurisuAgeMs, Infinity);
  const hour = Number.isFinite(Number(ctx.hour)) ? Number(ctx.hour) : new Date().getHours();

  let chance = 0.34 + closeness * 0.34;
  if (lastUserAgeMs > 30 * 60 * 1000) chance += 0.06;
  if (lastUserAgeMs > 6 * 60 * 60 * 1000) chance += 0.08;
  if (lastKurisuAgeMs < 3 * 60 * 1000) chance -= 0.18;
  if (hour >= 23 || hour < 6) chance -= 0.05;
  if (ctx.hasUnansweredThread) chance += 0.08;

  return _clamp(chance, 0.12, 0.82);
}

function shouldOpenPresenceSpeak(opts = {}) {
  const rng = typeof opts.rng === 'function' ? opts.rng : Math.random;
  const chance = Number.isFinite(Number(opts.chance))
    ? Number(opts.chance)
    : openPresenceSpeakChance(opts);
  return rng() < _clamp(chance, 0, 1);
}

function buildOpenPresencePrompt(ctx = {}) {
  const lastUserText = String(ctx.lastUserText || '').trim();
  const idleMin = Math.max(0, Math.floor(_num(ctx.idleMin, 0)));
  const closeness = _clamp(_num(ctx.closeness, 0), 0, 1);
  const parts = [
    '（想说话）【在场事件】他刚打开了你；这是你注意到的事实，不是必须说出口的台词。',
    `【状态】距离上次用户发言约 ${idleMin} 分钟；亲近度约 ${closeness.toFixed(2)}。`,
    '【要求】如果开口，基于当前状态、关系、时间和最近记忆自然生成；可以接上次话题，也可以只是短短靠近一下；不要写欢迎词，不要客服腔，不要固定句式。',
  ];
  if (lastUserText) {
    parts.push(`【最近锚点】他最近一句：「${lastUserText.slice(0, 120)}」；可接也可不接，但不要编造他没提过的事。`);
  }
  return parts.join('');
}

const api = {
  chooseOpenPresenceDelayMs,
  openPresenceSpeakChance,
  shouldOpenPresenceSpeak,
  buildOpenPresencePrompt,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof window !== 'undefined') {
  window.AmadeusOpenPresence = api;
}

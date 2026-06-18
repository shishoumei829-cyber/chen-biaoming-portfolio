'use strict';

function _cleanBase(base) {
  const s = String(base || '').trim();
  if (!/^https?:\/\//i.test(s)) return '';
  return s.replace(/\/+$/, '');
}

function candidateBackendBases(origin) {
  const current = _cleanBase(origin);
  const defaults = [
    'http://127.0.0.1:3001',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ];
  const list = current ? [current, ...defaults] : defaults;
  const seen = new Set();
  return list.filter((x) => {
    const b = _cleanBase(x);
    if (!b || seen.has(b)) return false;
    seen.add(b);
    return true;
  });
}

function shouldRetryTtsOnBackendBase(opts = {}) {
  const status = Number(opts.status);
  const ct = String(opts.contentType || '').toLowerCase();
  const ttsBase = _cleanBase(opts.ttsBase);
  const apiBase = _cleanBase(opts.apiBase);
  if (status !== 404) return false;
  if (!apiBase || !ttsBase || apiBase === ttsBase) return false;
  return !ct.includes('application/json');
}

const api = {
  candidateBackendBases,
  shouldRetryTtsOnBackendBase,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof window !== 'undefined') {
  window.AmadeusBackendBase = api;
}

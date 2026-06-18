/**
 * 作品集 iframe 嵌入：无语音/视频，可选 ?api= 指定后端
 * 不修改 Amadeus 核心逻辑，仅在 portfolio=1 时生效
 */
(function () {
  'use strict';
  const qs = new URLSearchParams(location.search);
  if (qs.get('portfolio') !== '1') return;

  const style = document.createElement('style');
  style.textContent = `
    html, body { width: 100%; height: 100%; min-height: 520px; overflow: hidden; }
    #micbtn, #cfh { display: none !important; }
    #cc, #cpv { pointer-events: none; }
  `;
  document.head.appendChild(style);

  function apply() {
    const a = window.amadeus;
    if (!a) {
      setTimeout(apply, 100);
      return;
    }
    a._disableTTS('作品集演示模式（无语音）');
    const api = (qs.get('api') || '').trim().replace(/\/+$/, '');
    if (api) {
      a.config.apiBase = api;
      a.config.sovitsBase = api;
      if (typeof a._probeBackend === 'function') void a._probeBackend();
    }
    a._log('作品集嵌入 · 请在本机运行 Amadeus 后端（默认 :3001）或配置 ?api= 公网地址', 'sys');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();

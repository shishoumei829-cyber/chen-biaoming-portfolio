/**
 * 数字方舟宣传海报 — 纯代码绘制（SVG + 排版），替代静态插图
 */
(function initDaPosterArt() {
  const MOUNT = '[data-da-poster]';

  const kitchenSceneSvg = `
<svg class="da-poster-art__scene-svg" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="da-wall" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8e4dc"/>
      <stop offset="55%" stop-color="#d4cfc4"/>
      <stop offset="100%" stop-color="#b8b2a6"/>
    </linearGradient>
    <linearGradient id="da-window-glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8f6f0"/>
      <stop offset="45%" stop-color="#ece8de"/>
      <stop offset="100%" stop-color="#c8c0b0" stop-opacity=".4"/>
    </linearGradient>
    <linearGradient id="da-floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8a8278"/>
      <stop offset="100%" stop-color="#5e584e"/>
    </linearGradient>
    <radialGradient id="da-light-spill" cx="18%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#fff" stop-opacity=".55"/>
      <stop offset="70%" stop-color="#fff" stop-opacity=".08"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <filter id="da-soft" x="-8%" y="-8%" width="116%" height="116%">
      <feGaussianBlur stdDeviation="1.2"/>
    </filter>
  </defs>
  <rect width="640" height="360" fill="url(#da-wall)"/>
  <rect width="640" height="360" fill="url(#da-light-spill)"/>
  <rect x="0" y="300" width="640" height="60" fill="url(#da-floor)"/>
  <rect x="28" y="48" width="148" height="188" rx="2" fill="#f2efe8" stroke="#9a9488" stroke-width="1.2"/>
  <rect x="36" y="56" width="132" height="172" fill="url(#da-window-glow)"/>
  <line x1="102" y1="56" x2="102" y2="228" stroke="#c4bdb0" stroke-width=".8" opacity=".65"/>
  <line x1="36" y1="142" x2="168" y2="142" stroke="#c4bdb0" stroke-width=".8" opacity=".65"/>
  <path d="M28 236 L176 236 L188 300 L16 300 Z" fill="#6a645a" opacity=".35"/>
  <rect x="52" y="248" width="88" height="42" rx="2" fill="#4a4640"/>
  <rect x="60" y="254" width="24" height="18" rx="1" fill="#2a2824"/>
  <ellipse cx="72" cy="262" rx="3" ry="2" fill="#ff8844" opacity=".75"/>
  <path d="M108 210 Q118 198 128 210 L126 248 Q118 252 110 248 Z" fill="#3a3834"/>
  <path d="M98 210 Q108 188 120 192 Q132 196 128 210 L126 248 Q118 252 110 248 Z" fill="#2e2c28"/>
  <path d="M104 248 L110 290 L116 290 L118 248 Z" fill="#3a3834"/>
  <path d="M96 252 Q104 240 112 248 L108 268 Q100 272 94 264 Z" fill="#484440"/>
  <path d="M88 218 Q94 210 100 218 L98 246 Q92 250 86 244 Z" fill="#3a3834"/>
  <rect x="318" y="268" width="198" height="10" rx="2" fill="#5a5248"/>
  <path d="M312 278 L520 278 L524 300 L308 300 Z" fill="#4a443c"/>
  <rect x="318" y="228" width="198" height="40" rx="3" fill="#6e6558"/>
  <rect x="326" y="236" width="182" height="4" rx="1" fill="#8a8070" opacity=".55"/>
  <ellipse cx="468" cy="252" rx="22" ry="8" fill="#7a7268" opacity=".45"/>
  <ellipse cx="468" cy="250" rx="10" ry="12" fill="#c8d4e0" opacity=".65"/>
  <ellipse cx="468" cy="250" rx="7" ry="9" fill="#e8eef4" opacity=".8"/>
  <path d="M388 228 Q404 210 420 228 L418 268 Q404 274 390 266 Z" fill="#343230"/>
  <circle cx="404" cy="218" r="16" fill="#2a2826"/>
  <path d="M390 228 L382 268 L398 272 L408 268 L400 228 Z" fill="#383634"/>
  <path d="M382 268 L376 292 L392 294 L398 272 Z" fill="#2e2c2a"/>
  <path d="M408 268 L414 292 L398 294 L392 272 Z" fill="#2e2c2a"/>
  <path d="M418 240 Q438 236 448 248 L444 260 Q432 262 420 254 Z" fill="#3a3836"/>
  <path d="M36 72 L168 120" stroke="#fff" stroke-width="12" opacity=".12" filter="url(#da-soft)"/>
  <path d="M48 88 L156 132" stroke="#fff" stroke-width="6" opacity=".08" filter="url(#da-soft)"/>
  <rect x="0" y="0" width="640" height="360" fill="url(#da-wall)" opacity=".04" style="mix-blend-mode:multiply"/>
</svg>`;

  const posterHtml = `
<div class="da-poster-art" role="img" aria-label="数字方舟 · Memory Preservation Project">
  <div class="da-poster-art__grain" aria-hidden="true"></div>
  <div class="da-poster-art__top">
    <p class="da-poster-art__hand da-poster-art__hand--lg">以前总说工作忙。</p>
    <p class="da-poster-art__hand da-poster-art__hand--sm">今天买到虾了。<span class="da-poster-art__rule"></span></p>
    <p class="da-poster-art__hand da-poster-art__hand--sm">你以前总挑最大的。<span class="da-poster-art__rule"></span></p>
  </div>
  <div class="da-poster-art__scene">
    ${kitchenSceneSvg}
    <p class="da-poster-art__hand da-poster-art__hand--center da-poster-art__scene-text">现在总算能一直陪着我了。</p>
  </div>
  <div class="da-poster-art__bottom">
    <p class="da-poster-art__hand da-poster-art__hand--sm">昨天又梦见你了。<span class="da-poster-art__rule"></span></p>
    <p class="da-poster-art__hand da-poster-art__hand--sm">那件毛衣我还留着。<span class="da-poster-art__rule"></span></p>
    <p class="da-poster-art__hand da-poster-art__hand--wide">这次总算能好好聊天了。<span class="da-poster-art__rule da-poster-art__rule--center"></span></p>
    <footer class="da-poster-art__footer">
      <div class="da-poster-art__brand">
        <span class="da-poster-art__brand-en">DIGITAL ARK</span>
        <span class="da-poster-art__brand-cn">数字方舟</span>
        <p class="da-poster-art__brand-sub">Memory Preservation Project</p>
        <p class="da-poster-art__tagline">在思念无处安放时，<br>让记忆有处停靠，<br>让陪伴继续发生。</p>
      </div>
      <div class="da-poster-art__mark">
        <svg class="da-poster-art__logo" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="19" fill="none" stroke="#17110d" stroke-width="1"/>
          <path d="M20 8 L32 28 L8 28 Z" fill="none" stroke="#17110d" stroke-width="1"/>
          <circle cx="20" cy="22" r="2.5" fill="#17110d"/>
          <circle cx="14" cy="24" r="1.8" fill="#17110d"/>
          <circle cx="26" cy="24" r="1.8" fill="#17110d"/>
        </svg>
        <span class="da-poster-art__mark-text">数字人<br>留存系统</span>
      </div>
    </footer>
  </div>
</div>`;

  function mount() {
    document.querySelectorAll(MOUNT).forEach((node) => {
      if (node.dataset.daPosterReady) return;
      node.innerHTML = posterHtml;
      node.dataset.daPosterReady = '1';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

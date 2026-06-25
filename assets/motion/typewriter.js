(function initSiteTypewriter() {
  const EXCLUDE =
    '#ama-intro, #digitalark, #self, .hz-about, nav, footer, .dock-nav, .project-jump-nav, .ama-gallery-rail, [aria-hidden="true"], .ama-dnote-ellipsis, .ama-editorial__stats, .ama-editorial__formula, .ama-editorial__live, .ama-editorial__glyph, pre.ama-editorial__mono, svg';

  const ROOTS = ['#amadeus', '#timewalker', '#mirage'];

  const AUTO = [
    '.thought-kicker', '.thought-sub', '.thought-aside', '.thought-line',
    '.ama-dnote-h', '.ama-scene__kicker', '.ama-scene__title', '.ama-scene__lead', '.ama-scene__frame-label',
    '.ama-stack-flow__tag', '.ama-stack-flow__file', '.ama-stack-flow__desc', '.ama-stack-flow__foot',
    '.ama-chapter-break__kicker', '.ama-chapter-break__title', '.ama-chapter-break__sub',
    '.ama-editorial__tag', '.ama-editorial__title', '.ama-editorial__lead', '.ama-editorial__list li',
    '.ama-editorial__mono-tag', '.ama-editorial__mono code',
    '.ama-ui-poster__kicker', '.ama-ui-poster__headline', '.ama-ui-poster__lead',
    '.ama-changelog-cta__kicker', '.ama-changelog-cta__title', '.ama-changelog-cta__lead', '.ama-changelog-cta__more',
    '.ama-paper-cta__kicker', '.ama-paper-cta__title', '.ama-paper-cta__lead',
    '.tw-kicker', '.tw-lede', '.tw-brush-title', '.tw-dnote-label', '.tw-dnote-sub', '.tw-vision-sub',
    '.section-title', '.section-desc', '.case-index', '.case-copy h3', '.case-lead', '.case-list div',
    '.spec-copy h3', '.spec-row', '.eva-caption.mirage-quote', '.project-status span', '.num',
    '.tw-value strong', '.tw-value p', '.tw-feature-num', '.tw-feature h4', '.tw-feature p',
    '.tw-design-head h4', '.tw-design-desc',
    '.tw-mock-spotlight-title', '.tw-mock-spotlight-poem', '.tw-mock-status',
    '.tw-mock-discover-title', '.tw-mock-discover-sub', '.tw-mock-rank-name', '.tw-mock-rank-desc',
    '.tw-proof-copy p', '.tw-proof-card h3', '.tw-proof-card p', 'figcaption'
  ].join(',');

  const GROUPSel =
    '.thought-copy, .ama-dnote-cell, .ama-scene__copy, .ama-scene__frame, .ama-chapter-break__inner, .ama-editorial__side, .ama-ui-poster__center, .tw-dnote-row, .tw-vision-inner, .case-copy, .ama-changelog-cta__card, .ama-paper-cta__card, .tw-hero-copy, .tw-intro, .tw-proof-copy, .tw-proof-card, .tw-value, .tw-feature, .tw-design-head, .mirage-open-foot, .spec-copy';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let gsapApi = null;
  let installed = false;

  function decode(text) {
    return String(text || '').replace(/&#10;/g, '\n').replace(/\\n/g, '\n');
  }

  function skip(el) {
    if (!el || el.matches('a, button, input, select, textarea, script, style, label')) return true;
    if (el.closest(EXCLUDE)) return true;
    if (el.closest('.hz-line')) return true;
    if (el.dataset.amaPad != null || el.dataset.amaEmotionScore != null) return true;
    if (el.dataset.amaEmotionTurn != null || el.dataset.amaEmotionCaption != null) return true;
    if (el.querySelector('img, video, svg, canvas, iframe')) return true;
    return false;
  }

  function extract(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('[aria-hidden="true"], .ama-poster-block__dots').forEach((n) => n.remove());
    clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
    return clone.textContent.replace(/\u00a0/g, ' ').replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n').trim();
  }

  function charMs(el) {
    if (el.matches('.ama-editorial__mono code')) return 14;
    if (el.matches('.thought-line, .ama-chapter-break__title, .ama-dnote-line, .section-title')) return 38;
    if (el.matches('.thought-sub, .ama-dnote-sub, .ama-chapter-break__sub, .ama-scene__lead, .ama-editorial__lead, .tw-dnote-sub, .tw-vision-sub, .section-desc, .case-lead')) return 26;
    if (el.matches('.thought-kicker, .ama-scene__kicker, .ama-dnote-h, .ama-chapter-break__kicker, .ama-editorial__tag, .ama-stack-flow__tag, .tw-kicker, .tw-dnote-label, .num, .case-index')) return 32;
    return 42;
  }

  function prepare(el) {
    if (skip(el) || el.dataset.twReady === '1') return;
    const text = el.hasAttribute('data-typewriter') ? decode(el.dataset.typewriter) : extract(el);
    if (!text) return;
    el.dataset.typewriter = text;
    el.dataset.twReady = '1';
    el.dataset.ms = String(charMs(el));
    el.textContent = text;
  }

  function prepareAll() {
    document.querySelectorAll('[data-typewriter]').forEach(prepare);
    ROOTS.forEach((sel) => {
      const root = document.querySelector(sel);
      if (root) root.querySelectorAll(AUTO).forEach(prepare);
    });
  }

  function pageOf(el) {
    return el.closest('.thought-page, .ama-dnote-cell, .tw-dnote-row, .tw-vision-inner');
  }

  function sliceByProgress(text, ms, progress) {
    if (progress >= 1) return text;
    let budget = 0;
    let total = 0;
    for (let i = 0; i < text.length; i += 1) total += text[i] === '\n' ? ms * 5 : ms;
    const target = total * progress;
    let out = '';
    for (let i = 0; i < text.length; i += 1) {
      budget += text[i] === '\n' ? ms * 5 : ms;
      out += text[i];
      if (budget >= target) break;
    }
    return out;
  }

  function typeDuration(text, ms) {
    let total = 0;
    for (let i = 0; i < text.length; i += 1) total += text[i] === '\n' ? ms * 5 : ms;
    return Math.max(0.2, total / 1000);
  }

  function finishEl(el, text) {
    el.textContent = text;
    el.classList.remove('type-caret', 'tw-typing');
    el.classList.add('tw-done');
    el.dataset.typed = 'true';
  }

  function showInstant(el) {
    if (!el || el.dataset.typed === 'true') return;
    finishEl(el, decode(el.dataset.typewriter));
    pageOf(el)?.classList.add('typed');
  }

  function playElement(el, tl) {
    const text = decode(el.dataset.typewriter);
    const ms = Number(el.dataset.ms || 42);
    const state = { p: 0 };

    tl.call(() => {
      el.textContent = '';
      el.classList.add('type-caret');
      if (el.matches('.thought-sub, .ama-dnote-sub, .tw-dnote-sub, .tw-vision-sub')) el.classList.add('tw-typing');
    });

    tl.to(state, {
      p: 1,
      duration: typeDuration(text, ms),
      ease: 'none',
      onUpdate: () => {
        el.textContent = sliceByProgress(text, ms, state.p);
      },
      onComplete: () => finishEl(el, text)
    });
  }

  function playGroup(host) {
    if (!gsapApi || host.dataset.twDone === '1') return;
    const items = [...host.querySelectorAll('[data-tw-ready]')].filter((el) => el.dataset.typed !== 'true');
    if (!items.length) {
      host.dataset.twDone = '1';
      return;
    }

    host.dataset.twPlaying = '1';
    const tl = gsapApi.timeline({
      onComplete: () => {
        host.dataset.twDone = '1';
        host.dataset.twPlaying = '0';
        pageOf(items[items.length - 1])?.classList.add('typed');
      }
    });
    items.forEach((el) => playElement(el, tl));
  }

  function markGroups() {
    document.querySelectorAll(GROUPSel).forEach((host) => {
      if (host.querySelector('[data-tw-ready]')) host.dataset.twGroup = '1';
    });
    document.querySelectorAll('[data-tw-ready]').forEach((el) => {
      if (!el.closest('[data-tw-group]')) el.dataset.twGroup = '1';
    });
  }

  function bindScrollTriggers(gsap, ST) {
    ST.getAll().forEach((st) => {
      if (String(st.vars?.id || '').startsWith('tw-')) st.kill();
    });
    ST.defaults({ scroller: document.documentElement });

    const hosts = gsap.utils.toArray('[data-tw-group]');
    hosts.forEach((host, index) => {
      ST.create({
        id: `tw-group-${index}`,
        trigger: host,
        start: 'top 82%',
        once: true,
        onEnter: () => playGroup(host)
      });
    });

    ST.refresh();
  }

  function scrollFallback() {
    if (!gsapApi || reduceMotion.matches) return;
    const x = Math.round(window.innerWidth * 0.5);
    const y0 = Math.round(window.innerHeight * 0.22);
    const y1 = Math.round(window.innerHeight * 0.78);
    const step = Math.max(48, Math.round(window.innerHeight * 0.14));

    document.querySelectorAll('[data-tw-group]').forEach((host) => {
      if (host.dataset.twDone === '1' || host.dataset.twPlaying === '1') return;
      for (let y = y0; y <= y1; y += step) {
        const hit = document.elementsFromPoint(x, y).some((node) => node === host || host.contains(node));
        if (hit) {
          playGroup(host);
          break;
        }
      }
    });
  }

  let scrollTimer = 0;
  function bindScrollFallback() {
    const run = () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(scrollFallback, 64);
    };
    window.addEventListener('scroll', run, { passive: true });
    if (window.__lenis) window.__lenis.on('scroll', run);
    else window.addEventListener('lenis-ready', () => window.__lenis?.on('scroll', run), { once: true });
  }

  function install() {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return false;

    gsapApi = gsap;
    gsap.registerPlugin(ST);
    prepareAll();
    markGroups();
    bindScrollTriggers(gsap, ST);
    return true;
  }

  function boot() {
    prepareAll();

    if (reduceMotion.matches) {
      document.querySelectorAll('[data-tw-ready]').forEach(showInstant);
      return;
    }

    if (!install()) {
      document.querySelectorAll('[data-tw-ready]').forEach(showInstant);
      return;
    }

    installed = true;
    bindScrollFallback();
  }

  prepareAll();

  function scheduleBoot() {
    boot();
    window.ScrollTrigger?.refresh(true);
  }

  if (document.readyState === 'complete') {
    window.setTimeout(scheduleBoot, 420);
  } else {
    window.addEventListener('load', () => window.setTimeout(scheduleBoot, 420), { once: true });
  }
})();

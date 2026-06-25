(function initSiteTypewriter() {
  const EXCLUDE_CLOSEST =
    '#ama-intro, #digitalark, #self, .hz-about, nav, footer, .dock-nav, .project-jump-nav, .ama-gallery-rail, [aria-hidden="true"], .ama-dnote-ellipsis, .ama-editorial__stats, .ama-editorial__formula, .ama-editorial__live, .ama-editorial__glyph, pre.ama-editorial__mono, svg';

  const SITE_ROOTS = ['#amadeus', '#timewalker', '#mirage'];

  const AUTO_SELECTOR = [
    '.thought-kicker',
    '.thought-sub',
    '.thought-aside',
    '.thought-line',
    '.ama-dnote-h',
    '.ama-scene__kicker',
    '.ama-scene__title',
    '.ama-scene__lead',
    '.ama-scene__frame-label',
    '.ama-stack-flow__tag',
    '.ama-stack-flow__file',
    '.ama-stack-flow__desc',
    '.ama-stack-flow__foot',
    '.ama-chapter-break__kicker',
    '.ama-chapter-break__title',
    '.ama-chapter-break__sub',
    '.ama-editorial__tag',
    '.ama-editorial__title',
    '.ama-editorial__lead',
    '.ama-editorial__list li',
    '.ama-editorial__mono-tag',
    '.ama-editorial__mono code',
    '.ama-ui-poster__kicker',
    '.ama-ui-poster__headline',
    '.ama-ui-poster__lead',
    '.ama-changelog-cta__kicker',
    '.ama-changelog-cta__title',
    '.ama-changelog-cta__lead',
    '.ama-changelog-cta__more',
    '.ama-paper-cta__kicker',
    '.ama-paper-cta__title',
    '.ama-paper-cta__lead',
    '.tw-kicker',
    '.tw-lede',
    '.tw-brush-title',
    '.tw-dnote-label',
    '.tw-dnote-sub',
    '.tw-vision-sub',
    '.section-title',
    '.section-desc',
    '.case-index',
    '.case-copy h3',
    '.case-lead',
    '.case-list div',
    '.spec-copy h3',
    '.spec-row',
    '.eva-caption.mirage-quote',
    '.project-status span',
    '.num',
    '.tw-value strong',
    '.tw-value p',
    '.tw-feature-num',
    '.tw-feature h4',
    '.tw-feature p',
    '.tw-design-head h4',
    '.tw-design-desc',
    '.tw-mock-spotlight-title',
    '.tw-mock-spotlight-poem',
    '.tw-mock-status',
    '.tw-mock-discover-title',
    '.tw-mock-discover-sub',
    '.tw-mock-rank-name',
    '.tw-mock-rank-desc',
    '.tw-proof-copy p',
    '.tw-proof-card h3',
    '.tw-proof-card p',
    'figcaption'
  ].join(',');

  const SEQUENCE_ROOTS =
    '.thought-copy, .ama-dnote-cell, .ama-scene__copy, .ama-scene__frame, .ama-chapter-break__inner, .ama-editorial__side, .ama-ui-poster__center, .tw-dnote-row, .tw-vision-inner, .case-copy, .ama-changelog-cta__card, .ama-paper-cta__card, .tw-hero-copy, .tw-intro, .tw-proof-copy, .tw-proof-card, .tw-value, .tw-feature, .tw-design-head, .mirage-open-foot, .spec-copy';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scanQueued = false;

  function decodeAttr(text) {
    return String(text || '')
      .replace(/&#10;/g, '\n')
      .replace(/\\n/g, '\n');
  }

  function shouldSkip(el) {
    if (!el || el.dataset.twSkip === 'true') return true;
    if (el.matches('a, button, input, select, textarea, script, style, label')) return true;
    if (el.closest(EXCLUDE_CLOSEST)) return true;
    if (el.closest('.hz-line')) return true;
    if (el.dataset.amaPad !== undefined) return true;
    if (el.dataset.amaEmotionScore !== undefined) return true;
    if (el.dataset.amaEmotionTurn !== undefined) return true;
    if (el.dataset.amaEmotionCaption !== undefined) return true;
    if (el.querySelector('img, video, svg, canvas, iframe')) return true;
    return false;
  }

  function extractText(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('[aria-hidden="true"], .ama-poster-block__dots').forEach((node) => node.remove());
    clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
    return clone.textContent
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  function defaultSpeed(el) {
    if (el.matches('.ama-editorial__mono code')) return 14;
    if (el.matches('.thought-line, .ama-chapter-break__title, .ama-dnote-line, .section-title')) return 38;
    if (el.matches('.thought-sub, .ama-dnote-sub, .ama-chapter-break__sub, .ama-scene__lead, .ama-editorial__lead, .tw-dnote-sub, .tw-vision-sub, .section-desc, .case-lead')) return 26;
    if (el.matches('.thought-kicker, .ama-scene__kicker, .ama-dnote-h, .ama-chapter-break__kicker, .ama-editorial__tag, .ama-stack-flow__tag, .tw-kicker, .tw-dnote-label, .num, .case-index')) return 32;
    return 42;
  }

  function prepareElement(el) {
    if (shouldSkip(el) || el.dataset.twPrepared === 'true') return;

    const text = el.hasAttribute('data-typewriter') ? decodeAttr(el.dataset.typewriter) : extractText(el);
    if (!text) return;

    el.dataset.typewriter = text;
    el.dataset.twPrepared = 'true';
    if (!el.dataset.speed) el.dataset.speed = String(defaultSpeed(el));
    el.classList.add('tw-ready');

    // 仅 data-typewriter 占位标题预先留空；其余文案保持可见，直到真正开始打字
    if (el.hasAttribute('data-typewriter') && !el.textContent.trim()) {
      el.classList.add('tw-pending');
    }
  }

  function showInstant(el) {
    if (!el || el.dataset.typed === 'true') return;
    el.dataset.typed = 'true';
    el.textContent = decodeAttr(el.dataset.typewriter || '');
    el.classList.remove('tw-pending', 'tw-ready', 'type-caret');
    el.classList.add('tw-done');
    const page = el.closest('.thought-page');
    if (page) page.classList.add('typed');
  }

  function chainNext(el) {
    const root = el.closest(SEQUENCE_ROOTS);
    if (!root) return;
    const next = [...root.querySelectorAll('[data-tw-prepared]')].find((node) => node.dataset.typed !== 'true');
    if (next) typeThought(next);
  }

  function typeThought(el) {
    if (!el || el.dataset.typed === 'true') return;
    el.dataset.typed = 'true';
    el.classList.remove('tw-pending', 'tw-ready');

    const text = decodeAttr(el.dataset.typewriter || '');
    const speed = Number(el.dataset.speed || 42);
    el.textContent = '';
    el.classList.add('type-caret');
    if (el.matches('.thought-sub, .ama-dnote-sub, .tw-dnote-sub, .tw-vision-sub')) {
      el.classList.add('tw-typing');
    }

    let i = 0;
    function tick() {
      el.textContent = text.slice(0, i);
      i += 1;
      if (i <= text.length) {
        setTimeout(tick, text[i - 2] === '\n' ? speed * 5 : speed);
        return;
      }
      el.classList.remove('type-caret', 'tw-typing');
      el.classList.add('tw-done');
      const page = el.closest('.thought-page');
      if (page && el.matches('.thought-line, .thought-sub, .tw-dnote-sub, .tw-vision-sub')) {
        page.classList.add('typed');
      }
      chainNext(el);
      queueScan();
    }
    tick();
  }

  function collectHitRoots() {
    const hitRoots = new Set();
    const xs = [
      Math.round(window.innerWidth * 0.28),
      Math.round(window.innerWidth * 0.5),
      Math.round(window.innerWidth * 0.72)
    ];
    const yStart = Math.round(window.innerHeight * 0.1);
    const yEnd = Math.round(window.innerHeight * 0.9);
    const yStep = Math.max(40, Math.round(window.innerHeight * 0.09));

    xs.forEach((x) => {
      for (let y = yStart; y <= yEnd; y += yStep) {
        document.elementsFromPoint(x, y).forEach((node) => {
          const seqRoot = node.closest?.(SEQUENCE_ROOTS);
          if (seqRoot) hitRoots.add(seqRoot);
        });
      }
    });

    return hitRoots;
  }

  function scanVisible() {
    scanQueued = false;
    if (reduceMotion.matches) return;

    const hitRoots = collectHitRoots();

    hitRoots.forEach((root) => {
      const next = [...root.querySelectorAll('[data-tw-prepared]')].find((node) => node.dataset.typed !== 'true');
      if (next) typeThought(next);
    });
  }

  function flushStuckPending() {
    const hitRoots = collectHitRoots();
    document.querySelectorAll('[data-tw-prepared]').forEach((el) => {
      if (el.dataset.typed === 'true') return;
      if (!el.classList.contains('tw-pending')) return;
      const root = el.closest(SEQUENCE_ROOTS);
      if (root && hitRoots.has(root)) {
        const next = [...root.querySelectorAll('[data-tw-prepared]')].find((node) => node.dataset.typed !== 'true');
        if (next) typeThought(next);
        return;
      }
      showInstant(el);
    });
  }

  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(scanVisible);
  }

  function bindScrollScan() {
    window.addEventListener('scroll', queueScan, { passive: true });
    window.addEventListener('resize', queueScan, { passive: true });
    window.addEventListener('load', queueScan, { passive: true });

    const hookLenis = () => {
      window.__lenis?.on('scroll', queueScan);
      queueScan();
    };
    if (window.__lenis) hookLenis();
    else window.addEventListener('lenis-ready', hookLenis, { once: true });

    if (window.ScrollTrigger) {
      window.ScrollTrigger.addEventListener('refresh', queueScan);
    }
  }

  function init() {
    document.querySelectorAll('[data-typewriter]').forEach(prepareElement);

    SITE_ROOTS.forEach((rootSel) => {
      const root = document.querySelector(rootSel);
      if (!root) return;
      root.querySelectorAll(AUTO_SELECTOR).forEach(prepareElement);
    });

    if (reduceMotion.matches) {
      document.querySelectorAll('[data-tw-prepared]').forEach(showInstant);
      return;
    }

    bindScrollScan();
    queueScan();
    window.setTimeout(flushStuckPending, 12000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) {
      document.querySelectorAll('[data-tw-prepared]').forEach(showInstant);
    } else {
      queueScan();
    }
  });

  window.__siteTypewriter = { typeThought, prepareElement, queueScan, showInstant };
})();

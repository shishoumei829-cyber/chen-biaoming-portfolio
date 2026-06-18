/* ============================================================
   白场放映厅 · Cinema engine (Phase 1)
   Lenis 平滑滚动 + Orwell 式离散切章「胶片闸门」转场 + 章节 HUD
   依赖：window.gsap / window.ScrollTrigger（已在页面引入）
        window.Lenis（assets/vendor/lenis/lenis.min.js）
   ============================================================ */
(function initCinema(){
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('cinema');

  /* 幕序（MIRAGE 已移除，按 DOM 顺序重新编号 01–04） */
  const CHAPTERS = [
    { id:'amadeus',    num:'01', en:'AMADEUS',     cn:'数字生命',      accent:'#c0892f' },
    { id:'digitalark', num:'02', en:'DIGITAL ARK', cn:'数字方舟',      accent:'#3f6f86' },
    { id:'timewalker', num:'03', en:'MOKUSHU',     cn:'墨舟',          accent:'#4f6f4a' },
    { id:'self',       num:'04', en:'WORLDVIEW',   cn:'关于 · 世界观', accent:'#b06a36' }
  ];

  /* ── Lenis 平滑滚动 ──────────────────────────────
     说明：本机系统开启了「减少动态效果」，但用户明确要这套电影感动效，
     故核心滚动动效不被该系统开关关闭，仅装饰性颗粒按 reduce 降级。 */
  if (window.Lenis) {
    const lenis = new window.Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      smoothTouch: false
    });
    lenis.on('scroll', ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.15, easing: (x) => 1 - Math.pow(1 - x, 3) });
      });
    });
  }

  /* ── 胶片闸门转场层 ──────────────────────────── */
  const veil = document.createElement('div');
  veil.id = 'cinema-veil';
  veil.setAttribute('aria-hidden', 'true');
  veil.innerHTML =
    '<div class="cv-panel cv-panel--t"></div>' +
    '<div class="cv-panel cv-panel--b"></div>' +
    '<div class="cv-stage">' +
      '<span class="cv-en"></span>' +
      '<span class="cv-num"></span>' +
      '<span class="cv-rule"></span>' +
      '<span class="cv-cn"></span>' +
    '</div>' +
    '<div class="cv-grain"></div>';
  document.body.appendChild(veil);

  const panels = veil.querySelectorAll('.cv-panel');
  const stage  = veil.querySelector('.cv-stage');
  const elNum  = veil.querySelector('.cv-num');
  const elEn   = veil.querySelector('.cv-en');
  const elCn   = veil.querySelector('.cv-cn');
  const elRule = veil.querySelector('.cv-rule');

  /* ── 章节 HUD ────────────────────────────────── */
  const hud = document.createElement('div');
  hud.id = 'cinema-hud';
  hud.innerHTML = '<span class="hud-num">00</span><span class="hud-sep">/</span><span class="hud-cn">序幕</span>';
  document.body.appendChild(hud);
  const hudNum = hud.querySelector('.hud-num');
  const hudCn  = hud.querySelector('.hud-cn');

  function setVeilContent(c){
    elNum.textContent = c.num;
    elEn.textContent  = c.en;
    elCn.textContent  = c.cn;
    veil.style.setProperty('--cv-accent', c.accent);
  }
  function setActive(c){
    hudNum.textContent = c.num;
    hudCn.textContent  = c.cn;
    document.body.style.setProperty('--cv-accent', c.accent);
  }

  /* ── 逐幕：HUD 追踪 + 闸门切章 ───────────────── */
  CHAPTERS.forEach((c) => {
    const el = document.getElementById(c.id);
    if (!el) return;

    ST.create({
      trigger: el,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (s) => { if (s.isActive) setActive(c); }
    });

    const cut = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'top 6%',
        scrub: 0.55,
        invalidateOnRefresh: true,
        onEnter:     () => setVeilContent(c),
        onEnterBack: () => setVeilContent(c)
      }
    });

    cut.set(stage, { autoAlpha: 0 })
       .fromTo(panels, { scaleY: 0 }, { scaleY: 1, ease: 'power2.in', duration: 0.5 }, 0)
       .fromTo(stage,  { autoAlpha: 0, yPercent: 6 }, { autoAlpha: 1, yPercent: 0, ease: 'power1.out', duration: 0.22 }, 0.16)
       .fromTo(elRule, { scaleX: 0 }, { scaleX: 1, ease: 'power2.out', duration: 0.3 }, 0.2)
       .to(stage,  { autoAlpha: 0, ease: 'power1.in', duration: 0.2 }, 0.6)
       .to(panels, { scaleY: 0, ease: 'power2.out', duration: 0.5 }, 0.5);
  });

  window.addEventListener('load', () => ST.refresh(), { once: true, passive: true });
})();

(function initHeroTheatre() {
  const hero = document.querySelector('.hero-zine');
  if (!hero) return;

  const pin = hero.querySelector('.hz-pin');
  const cluster = hero.querySelector('.hz-hero-cluster');
  const canvas = hero.querySelector('.hz-photo-canvas');
  const nameRole = hero.querySelector('.hz-role');
  const projectIndex = hero.querySelector('.home-project-index');
  const scrollCue = hero.querySelector('.hz-scroll-cue');
  const gsapApi = window.gsap;
  const ST = window.ScrollTrigger;
  const photos = gsapApi?.utils?.toArray?.(hero.querySelectorAll('.hz-photo')) || [];
  const aboutStage = document.querySelector('.hz-about-stage');
  const about = document.querySelector('.hz-about');
  const aboutInner = document.querySelector('.hz-about-inner');
  const aboutBody = document.querySelector('.hz-about-body');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SCRUB = reduceMotion ? 0.28 : 0.42;
  const SCRUB_DAMP = reduceMotion ? 0.38 : 0.62;
  const HERO_SCROLL_VH = 2.35;
  const TEXT_SCROLL_VH = 1.35;
  const EXIT_SCROLL_VH = 0.55;

  const lineMuted = { color: 'rgba(155, 0, 0, 0.16)' };
  const SPLIT_V = 'about-me-30';

  function splitAboutLines() {
    if (!aboutBody) return [];
    const existing = gsapApi?.utils?.toArray?.('.hz-line', aboutBody) || [];
    if (aboutBody.dataset.splitV === SPLIT_V && existing.length) return existing;
    const lines = [
      '当未来的数据足够全面，技术足够精湛',
      '我们仍需要一颗柔软而敏锐的心',
      '而设计的思维，正是那份灵光闪烁的',
      '创造力，它不靠堆砌功能，而在于唤醒',
      '人与生活之间的美的对话'
    ];
    aboutBody.innerHTML = lines.map((text) => `<span class="hz-line">${text}</span>`).join('');
    aboutBody.dataset.splitV = SPLIT_V;
    return gsapApi?.utils?.toArray?.('.hz-line', aboutBody) || aboutBody.querySelectorAll('.hz-line');
  }

  function primeAboutLines(list) {
    if (!list.length || !gsapApi) return;
    gsapApi.set(list, { ...lineMuted, fontWeight: 400 });
    list.forEach((line) => line.classList.remove('is-lit'));
  }

  function paintAboutLines(list, progress) {
    if (!list.length || !gsapApi) return;
    const count = list.length;
    list.forEach((line, index) => {
      const start = index / count;
      const end = (index + 1) / count;
      const t = gsapApi.utils.clamp(0, 1, (progress - start) / (end - start));
      gsapApi.set(line, {
        color: gsapApi.utils.interpolate('rgba(155, 0, 0, 0.16)', 'rgb(155, 0, 0)', t),
        fontWeight: 400
      });
      line.classList.toggle('is-lit', t >= 0.98);
    });
  }

  function heroEnd() {
    return ST.getById('home-theatre')?.end ?? 0;
  }

  function textEnd() {
    return ST.getById('hz-about-text')?.end ?? heroEnd();
  }

  if (!gsapApi || !ST) {
    hero.classList.add('is-static', 'is-awake', 'is-index-reveal');
    document.body.classList.add('home-index-ready');
    splitAboutLines().forEach((line) => line.classList.add('is-lit'));
    if (aboutStage) aboutStage.classList.add('is-visible');
    return;
  }

  document.documentElement.classList.add('motion-scroll');
  gsapApi.registerPlugin(ST);
  const motionScale = reduceMotion ? 0.45 : 1;
  const lines = splitAboutLines();
  primeAboutLines(lines);

  gsapApi.set(canvas, {
    autoAlpha: 0,
    filter: 'none',
    force3D: false
  });
  gsapApi.set(photos, {
    autoAlpha: 0,
    y: 168 * motionScale,
    scale: 0.86,
    rotation: (i) => [-6, 5, -3, 4, -2][i] || 0,
    transformOrigin: '50% 82%',
    filter: 'none',
    force3D: false
  });
  if (cluster) {
    gsapApi.set(cluster, {
      xPercent: -50,
      yPercent: -50,
      left: '50%',
      top: '52%',
      scale: 0.92,
      y: 88 * motionScale,
      force3D: false
    });
  }
  if (projectIndex) {
    gsapApi.set(projectIndex, {
      xPercent: -50,
      left: '50%',
      top: '62%',
      autoAlpha: 0,
      y: 40 * motionScale
    });
  }
  if (aboutInner) gsapApi.set(aboutInner, { yPercent: 100, y: 0, autoAlpha: 1 });
  if (about) gsapApi.set(about, { yPercent: 0, y: 0, autoAlpha: 1 });

  const mm = gsapApi.matchMedia();

  mm.add('(min-width: 821px)', () => {
    const heroTl = gsapApi.timeline({
      defaults: { ease: 'none', immediateRender: false },
      scrollTrigger: {
        id: 'home-theatre',
        trigger: hero,
        start: 'top top',
        end: () => `+=${Math.round(HERO_SCROLL_VH * 100)}%`,
        pin,
        scrub: SCRUB,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        refreshPriority: 30,
        onUpdate: (self) => {
          const p = self.progress;
          hero.classList.toggle('is-awake', p > 0.02);
          hero.classList.toggle('is-index-reveal', p > 0.34);
          if (!aboutStage) return;
          aboutStage.classList.toggle('is-covering', p > 0.62);
          aboutStage.classList.toggle('is-visible', p > 0.72);
        }
      }
    });

    const markIndexReady = () => {
      document.body.classList.add('home-index-ready');
      hero.classList.add('is-index-reveal');
    };
    const unmarkIndexReady = () => {
      document.body.classList.remove('home-index-ready');
      hero.classList.remove('is-index-reveal');
    };

    heroTl
      /* 第一幕：拼贴图入场 */
      .to(cluster, { y: 0, scale: 1, duration: 0.18 }, 0)
      .to(canvas, { autoAlpha: 1, duration: 0.12 }, 0)
      .to(photos, {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        rotation: (i) => [-8, 7, -4, 5, -2][i] || 0,
        duration: 0.22,
        stagger: { each: 0.018, from: 'start' }
      }, 0.02)
      /* 第二幕：整组上移缩小，三项目同步出现 */
      .to(scrollCue, { autoAlpha: 0, duration: 0.04 }, 0.2)
      .to(cluster, { top: '22%', scale: 0.5, duration: 0.24 }, 0.22);
    if (nameRole) heroTl.to(nameRole, { autoAlpha: 0, duration: 0.08 }, 0.22);
    heroTl
      .to(projectIndex, {
        y: 0,
        autoAlpha: 1,
        duration: 0.16,
        onStart: markIndexReady,
        onReverseComplete: unmarkIndexReady
      }, 0.24)
      .to({}, { duration: 0.08 }, 0.56)
      /* 第三幕：进入 about */
      .to(aboutInner, { yPercent: 0, y: 0, duration: 0.22, ease: 'power2.out' }, 0.62);

    if (aboutStage && lines.length) {
      gsapApi.timeline({
        scrollTrigger: {
          id: 'hz-about-text',
          trigger: aboutStage,
          start: () => heroEnd(),
          end: () => `+=${Math.round(TEXT_SCROLL_VH * 100)}%`,
          pin: aboutStage,
          pinSpacing: true,
          scrub: 0.42,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          refreshPriority: 22,
          onEnter: () => primeAboutLines(lines),
          onEnterBack: () => primeAboutLines(lines),
          onLeaveBack: () => primeAboutLines(lines),
          onToggle: (self) => {
            document.body.classList.toggle('hz-about-active', self.isActive);
            aboutStage.classList.toggle('is-text-pin', self.isActive);
            if (!self.isActive) primeAboutLines(lines);
          }
        }
      }).to({}, {
        duration: 1,
        ease: 'none',
        onUpdate() {
          const st = ST.getById('hz-about-text');
          if (st) paintAboutLines(lines, st.progress);
        }
      });
    }

    if (aboutStage && about) {
      gsapApi.timeline({
        defaults: { ease: 'none', immediateRender: false },
        scrollTrigger: {
          id: 'hz-about-exit',
          trigger: aboutStage,
          start: () => textEnd(),
          end: () => textEnd() + window.innerHeight * EXIT_SCROLL_VH,
          scrub: SCRUB_DAMP,
          invalidateOnRefresh: true,
          refreshPriority: 18
        }
      })
        .fromTo(
          aboutInner,
          { yPercent: 0, y: 0, autoAlpha: 1 },
          { y: -48 * motionScale, autoAlpha: 0.92, duration: 1, ease: 'power2.in' },
          0
        )
        .fromTo(
          about,
          { y: 0, autoAlpha: 1 },
          { y: -24 * motionScale, autoAlpha: 1, duration: 1, ease: 'power2.in' },
          0
        )
        .fromTo(
          aboutStage,
          { y: 0 },
          { y: -40 * motionScale, duration: 1, ease: 'power2.in' },
          0
        );
    }

    ST.sort();
    ST.refresh();

    return () => {
      document.body.classList.remove('hz-about-active');
      aboutStage?.classList.remove('is-visible', 'is-covering', 'is-text-pin');
      hero.classList.remove('is-awake', 'is-index-reveal');
      document.body.classList.remove('home-index-ready');
    };
  });

  mm.add('(max-width: 820px)', () => {
    gsapApi.set(canvas, { autoAlpha: 1 });
    gsapApi.set(photos, { autoAlpha: 1, y: 0, scale: 1 });
    if (cluster) gsapApi.set(cluster, { y: 0, scale: 1, top: '50%' });
    if (projectIndex) gsapApi.set(projectIndex, { autoAlpha: 1, y: 0, top: '62%' });
    hero.classList.add('is-awake', 'is-index-reveal');
    document.body.classList.add('home-index-ready');
    if (about) gsapApi.set(about, { yPercent: 0, y: 0 });
    if (aboutInner) gsapApi.set(aboutInner, { yPercent: 0, y: 0 });
    lines.forEach((line) => line.classList.add('is-lit'));
    if (aboutStage) aboutStage.classList.add('is-visible');
  });

  window.addEventListener('load', () => ST.refresh(), { once: true, passive: true });
})();

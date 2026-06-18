(function initDigitalArkMotion() {
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const root = document.getElementById('digitalark');
  if (!root || !gsap || !ST) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let experienceCtx = null;

  function boot() {
    gsap.registerPlugin(ST);
    ST.config({ limitCallbacks: true, ignoreMobileResize: true });
    document.body.classList.add('da-motion-ready');

    const q = (sel) => root.querySelector(sel);
    maskAllPanelText(root);
    wrapLineMasks(q('.da2-finale-kicker'));
    wrapLineMasks(q('.da2-finale-h'), { emLast: true });
    root.querySelectorAll('.da2-finale-sub').forEach((el) => wrapLineMasks(el, { splitRe: /[，。；]/ }));

    const maskedInners = root.querySelectorAll('.da2-line-inner');
    if (maskedInners.length) {
      gsap.set(maskedInners, { yPercent: 110, force3D: true });
    }

    const experience = q('#da2Experience');
    const viewport = q('.da2-experience-viewport');
    const cover = q('#da2Cover');
    const gallery = q('.da2-intro-hscroll');
    const seam = document.getElementById('da2ChapterSeam');

    const mm = gsap.matchMedia();
    mm.add('(min-width: 821px)', () => {
      let handoffCtx = null;
      if (experience && viewport && cover && gallery && seam) {
        experienceCtx = buildExperience(experience, viewport, cover, gallery, seam, reduce);
        handoffCtx = buildAmaArkHandoff(seam);
      }
      return () => {
        handoffCtx?.kill();
        handoffCtx = null;
        experienceCtx?.kill();
        experienceCtx = null;
        root.classList.remove('is-handoff-exit', 'is-da-experience-done', 'is-da-red-live');
        document.body.classList.remove('is-da-hscroll-active', 'is-da-tw-handoff');
      };
    });

    mm.add('(max-width: 820px)', () => {
      gsap.utils.toArray(root.querySelectorAll('.da2-hscroll-panel')).forEach((panel) => {
        gsap.set(panel, { clearProps: 'all' });
      });
      const track = root.querySelector('.da2-hscroll-track');
      if (track) gsap.set(track, { clearProps: 'all' });
      if (cover) gsap.set(cover, { clearProps: 'all' });
    });

    ST.sort();
    ST.refresh();
    if (window.__lenis) window.__lenis.resize();
    experienceCtx?.rebuildPin?.();
  }

  function buildAmaArkHandoff(seam) {
    const amaOutro = document.querySelector('#amadeus .ama-outro-wrap');
    if (!amaOutro || !seam) return null;

    const outroBlocks = gsap.utils.toArray(
      amaOutro.querySelectorAll('.ama-changelog-cta, .ama-paper-cta, .ama-chapter-break--vision')
    );
    if (!outroBlocks.length) return null;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'ama-ark-handoff',
        trigger: seam,
        start: 'top 92%',
        end: 'bottom top',
        scrub: 0.55,
        invalidateOnRefresh: true,
        refreshPriority: 14
      }
    });

    tl.to(outroBlocks, {
      autoAlpha: 0,
      y: -24,
      stagger: 0.04,
      duration: 0.5,
      ease: 'power1.in'
    }, 0);

    return {
      kill() {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(outroBlocks, { clearProps: 'opacity,transform,visibility' });
      }
    };
  }

  function buildExperience(experience, viewport, cover, section, seam, compact) {
    const track = section.querySelector('.da2-hscroll-track');
    const panels = gsap.utils.toArray(section.querySelectorAll('.da2-hscroll-panel'));
    const dots = gsap.utils.toArray(section.querySelectorAll('.da2-hscroll-dots span'));
    const progressNum = section.querySelector('.da2-hscroll-progress-num');
    if (!track || panels.length < 2) return null;

    const count = panels.length;
    const COVER_ENTER = compact ? 0.08 : 0.14;
    const COVER_HOLD = compact ? 0.95 : 1.12;
    const COVER_FADE = compact ? 0.14 : 0.16;
    const FIRST_PANEL_HOLD = compact ? 0.48 : 0.62;
    const PANEL_SPAN = compact ? 0.98 : 1.14;
    const EXIT_SCALE = compact ? 0.58 : 0.88;
    const SLIDE_REVEAL_IN = compact ? 0.06 : 0.08;
    const SLIDE_REVEAL_DONE = compact ? 0.1 : 0.12;

    const finaleStage = section.querySelector('#da2FinaleStage');
    const finaleInnersEarly = finaleStage ? Array.from(finaleStage.querySelectorAll('.da2-line-inner')) : [];
    const panelWidthEst = Math.max(PANEL_SPAN, (count - 1) * PANEL_SPAN) / Math.max(1, count - 1);
    const panelRevealWin = panelWidthEst * (compact ? 0.82 : 0.88);
    const FINALE_HOLD = Math.max(compact ? 0.55 : 0.68, panelRevealWin * 1.05);

    const hscrollStart = COVER_HOLD + COVER_FADE;
    const hscrollMove = Math.max(PANEL_SPAN, (count - 1) * PANEL_SPAN);

    const archive = viewport.querySelector('.da2-experience-archive');
    const timewalker = document.getElementById('timewalker');
    const finaleInners = finaleInnersEarly;

    const coverParts = [
      cover.querySelector('.da2-cover-body'),
      cover.querySelector('.da2-hud'),
      cover.querySelector('.da2-scroll-hint'),
      cover.querySelector('.da2-cover-index')
    ].filter(Boolean);

    gsap.set(track, { x: 0 });
    gsap.set(cover, { autoAlpha: 1, visibility: 'visible' });
    gsap.set(coverParts, { y: compact ? 8 : 24, autoAlpha: 1, force3D: true });
    if (archive) gsap.set(archive, { scale: 1, transformOrigin: '50% 50%' });

    const indexFromPanel = (panel) => Math.min(count - 1, Math.max(0, panel));

    const updateProgress = (panelIndex) => {
      const active = indexFromPanel(panelIndex);
      dots.forEach((dot, i) => dot.classList.toggle('is-on', i === active));
      if (progressNum) progressNum.textContent = String(active + 1).padStart(2, '0');
    };

    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    let cursor = 0;

    tl.fromTo(coverParts, {
      y: compact ? 8 : 24,
      autoAlpha: 1
    }, {
      y: 0,
      autoAlpha: 1,
      stagger: 0.04,
      duration: COVER_ENTER,
      ease: 'power2.out'
    }, cursor);
    cursor += COVER_ENTER;

    tl.to({}, { duration: Math.max(0.08, COVER_HOLD - COVER_ENTER) }, cursor);
    cursor += Math.max(0.08, COVER_HOLD - COVER_ENTER);

    tl.to(coverParts, {
      y: -20,
      autoAlpha: 0,
      ease: 'power2.in',
      duration: COVER_FADE,
      stagger: 0.015
    }, cursor);
    tl.to(cover, { autoAlpha: 0, duration: COVER_FADE * 0.5, ease: 'power2.in' }, cursor);
    cursor += COVER_FADE;

    const trackSegment = gsap.timeline();
    const panelWidth = hscrollMove / Math.max(1, count - 1);
    const finaleVisual = finaleStage?.querySelector('.da2-finale-visual');

    const panelRevealStart = (index) => {
      if (index <= 0) return 0.02;
      const moveStart = (index - 1 + SLIDE_REVEAL_IN) * panelWidth;
      return FIRST_PANEL_HOLD + moveStart;
    };

    const panelRevealWindow = (index) => {
      if (index <= 0) return FIRST_PANEL_HOLD * 0.68;
      const moveStart = (index - 1 + SLIDE_REVEAL_IN) * panelWidth;
      const moveEnd = (index - SLIDE_REVEAL_DONE) * panelWidth;
      return Math.max(panelWidth * 0.5, moveEnd - moveStart);
    };

    const lineRevealEase = (t) => 1 - (1 - t) * (1 - t);

    const panelLinePlans = panels.map((panel, index) => {
      const inners = gsap.utils.toArray(panel.querySelectorAll('.da2-line-inner'));
      if (!inners.length) return null;
      const windowDur = panelRevealWindow(index);
      const lineDur = Math.min(compact ? 0.12 : 0.14, windowDur * 0.22);
      const stagger = inners.length > 1 ? (windowDur - lineDur) / (inners.length - 1) : 0;
      return {
        inners,
        start: panelRevealStart(index),
        lineDur,
        stagger
      };
    }).filter(Boolean);

    const syncPanelLineReveals = (localU) => {
      panelLinePlans.forEach((plan) => {
        plan.inners.forEach((inner, i) => {
          const lineStart = plan.start + i * plan.stagger;
          const lineEnd = lineStart + plan.lineDur;
          let y = 110;
          if (localU >= lineEnd) y = 0;
          else if (localU > lineStart) {
            y = 110 * (1 - lineRevealEase((localU - lineStart) / plan.lineDur));
          }
          gsap.set(inner, { yPercent: y, force3D: true });
        });
      });
    };

    trackSegment.to({}, { duration: FIRST_PANEL_HOLD });

    trackSegment.to(track, {
      x: () => -(count - 1) * window.innerWidth,
      duration: hscrollMove,
      ease: 'none'
    });

    if (finaleInners.length) {
      trackSegment.to({}, { duration: FINALE_HOLD });
    }

    const hscrollDuration = trackSegment.duration();
    const exitStart = hscrollStart + hscrollDuration;

    tl.add(trackSegment, cursor);
    cursor += hscrollDuration;

    const exitCursor = cursor;

    if (archive) {
      tl.to(archive, {
        scale: compact ? 0.88 : 0.76,
        duration: EXIT_SCALE,
        ease: 'power2.inOut'
      }, exitCursor);
      cursor += EXIT_SCALE;
    }

    const totalUnits = cursor;
    const scrollVh = () => totalUnits * (compact ? 0.92 : 1);

    let coverDismissed = false;
    let archiveEngaged = false;

    const readAppliedOverlap = () => {
      const marginTop = parseFloat(getComputedStyle(timewalker).marginTop);
      if (Number.isFinite(marginTop)) return Math.abs(marginTop);
      const raw = getComputedStyle(timewalker).getPropertyValue('--da-handoff-overlap').trim();
      const px = parseFloat(raw);
      return Number.isFinite(px) ? px : 0;
    };

    const stabilizeHandoffOverlap = () => {
      if (!timewalker || !tl.scrollTrigger) return;
      let prev = -1;
      for (let i = 0; i < 5; i += 1) {
        const st = tl.scrollTrigger;
        const end = typeof st.end === 'function' ? st.end() : st.end;
        if (!Number.isFinite(end)) break;

        const applied = readAppliedOverlap();
        const naturalTop = timewalker.offsetTop + applied;
        const overlap = Math.max(0, Math.ceil(naturalTop - end));
        if (overlap === prev) break;
        prev = overlap;
        timewalker.style.setProperty('--da-handoff-overlap', `${overlap}px`);
        ST.refresh();
      }
    };

    const dismissCover = () => {
      if (coverDismissed) return;
      coverDismissed = true;
      cover.classList.add('is-cover-done');
      gsap.set(cover, { autoAlpha: 0, visibility: 'hidden' });
    };

    const resetExperienceEntry = () => {
      coverDismissed = false;
      archiveEngaged = false;
      cover.classList.remove('is-cover-done');
      gsap.set(cover, { autoAlpha: 1, visibility: 'visible' });
      gsap.set(coverParts, { y: 0, autoAlpha: 1 });
    };

    const syncHandoff = (u) => {
      const inExit = u >= exitStart;
      root.classList.toggle('is-handoff-exit', inExit);
      document.body.classList.toggle('is-da-tw-handoff', inExit);
      if (viewport) {
        if (inExit) gsap.set(viewport, { zIndex: 1 });
        else gsap.set(viewport, { clearProps: 'zIndex' });
      }
    };

    const getSegmentLocal = (u) => Math.max(0, u - hscrollStart);

    const panelIndexFromSegment = (segmentLocal) => {
      if (segmentLocal < FIRST_PANEL_HOLD + 0.01) return 0;
      const moveLocal = segmentLocal - FIRST_PANEL_HOLD;
      if (moveLocal >= hscrollMove) return count - 1;
      return Math.min(count - 1, Math.max(0, Math.round((moveLocal / hscrollMove) * (count - 1))));
    };

    const syncFinaleVisual = (segmentLocal) => {
      if (!finaleVisual || !finaleInners.length) return;
      const finaleIndex = count - 1;
      const fStart = panelRevealStart(finaleIndex);
      const fWin = panelRevealWindow(finaleIndex);
      const ft = segmentLocal <= fStart ? 0 : Math.min(1, (segmentLocal - fStart) / (fWin * 0.55));
      gsap.set(finaleVisual, {
        scale: 0.8 + 0.2 * lineRevealEase(ft),
        transformOrigin: 'center bottom'
      });
    };

    const syncExperienceFrame = (self) => {
      const u = self.progress * totalUnits;
      syncHandoff(u);
      root.classList.toggle('is-da-red-live', u >= hscrollStart - 0.02);
      document.body.classList.toggle('is-da-hscroll-active', u >= hscrollStart - 0.04);

      if (u >= hscrollStart) {
        archiveEngaged = true;
        dismissCover();
        const segmentLocal = getSegmentLocal(u);
        syncPanelLineReveals(segmentLocal);
        syncFinaleVisual(segmentLocal);
        updateProgress(panelIndexFromSegment(segmentLocal));
      } else if (!archiveEngaged) {
        cover.classList.remove('is-cover-done');
        root.querySelectorAll('.da2-line-inner').forEach((inner) => {
          gsap.set(inner, { yPercent: 110, force3D: true });
        });
        if (finaleVisual) gsap.set(finaleVisual, { scale: 0.8, transformOrigin: 'center bottom' });
        updateProgress(-1);
      }

      if (coverDismissed) {
        cover.classList.add('is-cover-done');
        gsap.set(cover, { autoAlpha: 0, visibility: 'hidden' });
      }
    };

    let handoffRefreshTimer;
    const onHandoffRefresh = () => {
      clearTimeout(handoffRefreshTimer);
      handoffRefreshTimer = setTimeout(stabilizeHandoffOverlap, 0);
    };

    const createDaScrollTrigger = () => ScrollTrigger.create({
      id: 'da-experience',
      trigger: experience,
      start: 'top top',
      end: () => `+=${window.innerHeight * scrollVh()}`,
      pin: experience,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 0,
      refreshPriority: 20,
      animation: tl,
      snap: false,
      onEnter: () => updateProgress(-1),
      onUpdate: syncExperienceFrame,
      onRefresh: (self) => syncExperienceFrame(self),
      onLeave: () => {
        dismissCover();
        root.classList.add('is-da-experience-done');
        root.classList.remove('is-handoff-exit');
        document.body.classList.remove('is-da-hscroll-active', 'is-da-tw-handoff');
        if (viewport) gsap.set(viewport, { clearProps: 'zIndex' });
      },
      onLeaveBack: () => {
        resetExperienceEntry();
        root.classList.remove('is-da-experience-done', 'is-da-red-live');
        syncHandoff(0);
        if (archive) gsap.set(archive, { scale: 1, autoAlpha: 1 });
        root.querySelectorAll('.da2-line-inner').forEach((inner) => {
          gsap.set(inner, { yPercent: 110, force3D: true });
        });
        if (finaleVisual) gsap.set(finaleVisual, { scale: 0.8, transformOrigin: 'center bottom' });
        document.body.classList.remove('is-da-hscroll-active', 'is-da-tw-handoff');
        root.classList.remove('is-handoff-exit');
        if (viewport) gsap.set(viewport, { clearProps: 'zIndex' });
      }
    });

    return {
      rebuildPin() {
        tl.scrollTrigger?.kill();
        ST.removeEventListener('refresh', onHandoffRefresh);
        ST.refresh();
        tl.scrollTrigger = createDaScrollTrigger();
        ST.addEventListener('refresh', onHandoffRefresh);
        stabilizeHandoffOverlap();
        if (tl.scrollTrigger) syncExperienceFrame(tl.scrollTrigger);
      },
      kill() {
        ST.removeEventListener('refresh', onHandoffRefresh);
        clearTimeout(handoffRefreshTimer);
        tl.scrollTrigger?.kill();
        tl.kill();
        root.classList.remove('is-handoff-exit', 'is-da-experience-done', 'is-da-red-live');
        document.body.classList.remove('is-da-hscroll-active', 'is-da-tw-handoff');
        if (viewport) gsap.set(viewport, { clearProps: 'zIndex' });
        if (timewalker) timewalker.style.removeProperty('--da-handoff-overlap');
        if (archive) gsap.set(archive, { clearProps: 'scale,transformOrigin,opacity,visibility' });
      }
    };
  }

  function maskAllPanelText(scope) {
    const sentSplit = /[。；，—：]/;
    scope.querySelectorAll('.da2-pull').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-p').forEach((el) => wrapLineMasks(el, { splitRe: sentSplit }));
    scope.querySelectorAll('.da2-archive-tag').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-split-h').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-split-p').forEach((el) => wrapLineMasks(el, { splitRe: sentSplit }));
    scope.querySelectorAll('.da2-archive-link').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-eight-name, .da2-eight-w').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-layer-num').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-layer-name').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-layer-desc').forEach((el) => wrapLineMasks(el, { splitRe: sentSplit }));
    scope.querySelectorAll('.da2-pillar strong').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-pillar p').forEach((el) => wrapLineMasks(el, { splitRe: sentSplit }));
    scope.querySelectorAll('.da2-training-num').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-training-step strong').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-training-step p').forEach((el) => wrapLineMasks(el, { splitRe: sentSplit }));
    scope.querySelectorAll('.da2-product-card-label').forEach((el) => wrapLineMasks(el));
    scope.querySelectorAll('.da2-product-card-desc').forEach((el) => wrapLineMasks(el, { splitRe: sentSplit }));
    scope.querySelectorAll('.da2-hscroll-panel--finale .da2-product-foot a').forEach((el) => wrapLineMasks(el));
  }

  function wrapLineMasks(el, options = {}) {
    if (!el || el.dataset.masked) return;
    let chunks;
    if (options.splitRe) {
      chunks = el.textContent.trim().split(options.splitRe).map((s) => s.trim()).filter(Boolean);
    } else {
      chunks = el.innerHTML.split(/<br\s*\/?>/i).map((s) => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      if (!chunks.length && el.textContent.trim()) {
        chunks = [el.textContent.trim()];
      }
    }
    if (!chunks.length) return;
    el.innerHTML = chunks.map((line, index) => {
      const innerClass = options.emLast && index === chunks.length - 1
        ? 'da2-line-inner da2-line-inner--em'
        : 'da2-line-inner';
      return `<span class="da2-line-mask"><span class="${innerClass}">${line}</span></span>`;
    }).join('');
    el.dataset.masked = 'true';
  }

  function start() {
    if (document.body.classList.contains('da-motion-ready')) return;
    const run = () => {
      ST?.refresh();
      boot();
    };
    if (window.__lenisReady) run();
    else window.addEventListener('lenis-ready', run, { once: true });
  }

  window.addEventListener('load', () => {
    setTimeout(start, 120);
  }, { once: true });
})();

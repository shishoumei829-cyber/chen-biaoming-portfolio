(function initWorldviewMotion() {
  const BOOT_FLAG = 'wvMotionInit';

  function boot() {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    const section = document.getElementById('self');
    if (!section || !gsap || !ST) return false;
    if (section.dataset[BOOT_FLAG] === '1') return true;

    gsap.registerPlugin(ST);
    section.dataset[BOOT_FLAG] = '1';

    const q = (sel, root = section) => root.querySelector(sel);
    const qa = (sel, root = section) => gsap.utils.toArray(root.querySelectorAll(sel));

    section.classList.add('wv-motion-pending');

    const lineEase = (t) => 1 - (1 - t) * (1 - t);
    const vh = () => window.innerHeight;
    const SCALE_FROM = 1.26;
    const ITEM_DUR = 0.44;
    const ITEM_GAP = 0.1;

    function wrapLineMasks(el) {
      if (!el || el.dataset.wvMasked) return;
      const chunks = el.innerHTML.split(/<br\s*\/?>/i)
        .map((s) => s.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);
      const lines = chunks.length ? chunks : (el.textContent.trim() ? [el.textContent.trim()] : []);
      if (!lines.length) return;
      el.innerHTML = lines.map((line) =>
        `<span class="wv-line-mask"><span class="wv-line-inner">${line}</span></span>`
      ).join('');
      el.dataset.wvMasked = 'true';
    }

    function unwrapPhotoStage(figure) {
      const stage = figure.querySelector(':scope > .wv-photo-stage');
      if (!stage) return;
      const img = stage.querySelector('img');
      if (img) figure.appendChild(img);
      stage.remove();
    }

    function wrapPhotoPin(screen) {
      let pin = screen.querySelector(':scope > .wv-photo-pin');
      if (pin) return pin;
      pin = document.createElement('div');
      pin.className = 'wv-photo-pin';
      const movable = [...screen.children].filter((el) => !el.classList.contains('wv-foot'));
      movable.forEach((el) => pin.appendChild(el));
      screen.prepend(pin);
      return pin;
    }

    function collectPhotoItems(screen) {
      const items = [];
      const feature = screen.querySelector(':scope > .wv-photo-pin > .wv-feature, :scope > .wv-feature');
      const triptych = screen.querySelector(':scope > .wv-photo-pin > .wv-triptych, :scope > .wv-triptych');
      const band = screen.querySelector(':scope > .wv-photo-pin > .wv-band, :scope > .wv-band');
      if (feature) items.push(feature);
      if (triptych) qa('figure', triptych).forEach((fig) => items.push(fig));
      if (band) items.push(band);
      return items;
    }

    function buildLineReveal(trigger, groups, options = {}) {
      const inners = groups.flatMap((g) => g.inners);
      if (!inners.length) return;

      gsap.set(inners, { yPercent: 110, force3D: true });
      groups.forEach((g) => {
        if (g.marks?.length) gsap.set(g.marks, { autoAlpha: 0, scale: 0.55, transformOrigin: '50% 50%' });
      });

      const sync = (progress) => {
        const total = groups.length;
        const unit = 1 / total;
        groups.forEach((group, gi) => {
          const gStart = gi * unit;
          const gEnd = gStart + unit;
          const localU = progress <= gStart ? 0 : progress >= gEnd ? 1 : (progress - gStart) / unit;
          const lineDur = group.inners.length > 1 ? 0.3 : 0.42;
          const stagger = group.inners.length > 1 ? (1 - lineDur) / (group.inners.length - 1) : 0;

          group.inners.forEach((inner, li) => {
            const lineStart = li * stagger;
            const lineEnd = lineStart + lineDur;
            let y = 110;
            if (localU >= lineEnd) y = 0;
            else if (localU > lineStart) y = 110 * (1 - lineEase((localU - lineStart) / lineDur));
            gsap.set(inner, { yPercent: y, force3D: true });
          });

          if (group.marks?.length) {
            const markStart = 0.58;
            group.marks.forEach((mark, mi) => {
              let alpha = 0;
              if (localU > markStart) {
                const mt = Math.min(1, (localU - markStart) / (1 - markStart));
                alpha = Math.max(0, Math.min(1, mt * 1.35 - mi * 0.1));
              }
              gsap.set(mark, { autoAlpha: alpha, scale: 0.55 + 0.45 * alpha, force3D: true });
            });
          }
        });
      };

      ST.create({
        id: options.id || 'wv-lines',
        trigger,
        start: options.start || 'top 92%',
        end: options.end || 'top 8%',
        scrub: 0.9,
        invalidateOnRefresh: true,
        onUpdate: (self) => sync(self.progress),
        onRefresh: (self) => sync(self.progress)
      });
    }

    /** pin + onUpdate 直驱：避免 Lenis 下 timeline scrub 不同步 */
    function buildPhotoPinScreen(screen, screenIndex) {
      qa('figure', screen).forEach(unwrapPhotoStage);
      const pinRoot = wrapPhotoPin(screen);
      const items = collectPhotoItems(screen);
      if (!items.length) return;

      items.forEach((el) => el.classList.add('wv-photo-rise'));

      const totalSpan = (items.length - 1) * ITEM_GAP + ITEM_DUR;

      const sync = (progress) => {
        const p = Math.max(0, Math.min(1, progress));
        items.forEach((item, i) => {
          const start = (i * ITEM_GAP) / totalSpan;
          const end = start + ITEM_DUR / totalSpan;
          let t = 0;
          if (p >= end) t = 1;
          else if (p > start) t = (p - start) / (end - start);

          gsap.set(item, { y: vh() * (1 - t), force3D: true });
          const img = item.querySelector('img');
          if (img) {
            gsap.set(img, {
              scale: SCALE_FROM + (1 - SCALE_FROM) * t,
              transformOrigin: '50% 50%',
              force3D: true
            });
          }
        });
      };

      ST.create({
        id: `wv-photo-pin-${screenIndex}`,
        trigger: screen,
        start: 'top top',
        end: () => `+=${Math.round(vh() * (2 + items.length * 0.38))}`,
        pin: pinRoot,
        pinSpacing: true,
        scrub: 0.55,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => sync(self.progress),
        onRefresh: (self) => sync(self.progress)
      });

      sync(0);
    }

    const textScreen = q('.wv-screen--text');
    const textGroups = [];

    if (textScreen) {
      const quote = q('.wv-quote', textScreen);
      if (quote) {
        wrapLineMasks(quote);
        textGroups.push({ inners: qa('.wv-line-inner', quote) });
      }

      qa('.wv-prose__row', textScreen).forEach((row) => {
        qa('.wv-prose__l, .wv-prose__r', row).forEach(wrapLineMasks);
        const inners = qa('.wv-line-inner', row);
        if (inners.length) textGroups.push({ inners });
      });

      const head = q('.wv-head', textScreen);
      if (head) {
        wrapLineMasks(q('.wv-head__en', head));
        wrapLineMasks(q('.wv-head__cn', head));
        const inners = qa('.wv-head__en .wv-line-inner, .wv-head__cn .wv-line-inner', head);
        const marks = qa('.wv-head__marks span', head);
        if (inners.length) textGroups.push({ inners, marks });
      }

      buildLineReveal(textScreen, textGroups, { id: 'wv-text-lines' });
    }

    qa('.wv-screen--photos').forEach((screen, i) => buildPhotoPinScreen(screen, i));

    const foot = q('.wv-foot');
    if (foot) {
      const footGroups = [];
      const meta = q('.wv-foot__meta', foot);
      if (meta) {
        wrapLineMasks(meta);
        footGroups.push({ inners: qa('.wv-line-inner', meta) });
      }
      qa('.wv-foot__contact a', foot).forEach((el) => {
        wrapLineMasks(el);
        footGroups.push({ inners: qa('.wv-line-inner', el) });
      });
      buildLineReveal(foot, footGroups, {
        id: 'wv-foot-lines',
        start: 'top 96%',
        end: 'top 55%'
      });
    }

    section.classList.remove('wv-motion-pending');
    section.classList.add('wv-motion-ready');

    const refresh = () => ST.refresh();
    qa('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', refresh, { once: true });
    });
    refresh();
    requestAnimationFrame(refresh);
    return true;
  }

  function tryBoot() {
    if (boot()) window.__wvMotionInit = true;
  }

  if (document.readyState === 'complete') {
    tryBoot();
  } else {
    window.addEventListener('load', tryBoot, { once: true });
  }

  window.addEventListener('lenis-ready', () => {
    if (sectionExists() && !document.getElementById('self')?.dataset?.wvMotionInit) {
      tryBoot();
    }
  }, { once: true });

  function sectionExists() {
    return !!document.getElementById('self');
  }
})();

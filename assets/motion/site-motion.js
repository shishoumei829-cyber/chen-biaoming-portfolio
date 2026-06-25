(function initSiteMotion() {
  function boot() {
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (!gsap || !ST) return;

  gsap.registerPlugin(ST);
  ST.defaults({ scroller: document.documentElement });
  gsap.defaults({ overwrite: 'auto' });

  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => gsap.utils.toArray(root.querySelectorAll(sel));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lite = reduce;

  document.body.classList.add('motion-running', lite ? 'motion-reduced' : 'motion-ready');

  const projects = [
    {
      id: 'timewalker',
      trigger: '#timewalker .tw-hero',
      media: '.tw-atmo__mountains,.tw-atmo__moon,.tw-boat,.tw-seal',
      copy: '.tw-kicker,.tw-brush-char,.tw-brush-rule,.tw-lede,.tw-tags span,.project-status span',
      mode: 'side'
    }
  ];

  projects.forEach((project, index) => {
    const section = document.getElementById(project.id);
    if (!section) return;
    const trigger = q(project.trigger, section) || q(project.trigger) || section;

    project.el = section;
    project.trigger = trigger;
    section.classList.add('motion-section', `motion-${project.id}`);
    section.style.setProperty('--motion-index', index + 1);

    buildProjectEntry(project, section, trigger, index);
    buildProjectDrift(project, section, trigger);
  });

  buildAmadeusPosterMotion();
  buildProofStages();
  ST.sort();
  ST.refresh();

  buildDetailReveals();
  buildTimewalkerSpotlights();
  buildProjectJumpNav();

  window.addEventListener('load', () => ST.refresh(), { once: true, passive: true });

  function buildProjectEntry(project, section, trigger, index) {
    const media = project.media ? qa(project.media, section).filter(Boolean) : [];
    const copy = project.copy ? qa(project.copy, section).filter(Boolean) : [];
    if (!media.length && !copy.length) return;

    const scrub = lite ? 0.4 : 0.48 + index * 0.05;
    const mediaFrom = getMediaFrom(project.mode);
    const copyFrom = getCopyFrom(project.mode);

    const tl = gsap.timeline({
      defaults: { ease: 'none', immediateRender: false },
      scrollTrigger: {
        id: `${project.id}-entry`,
        trigger,
        start: 'top 88%',
        end: 'top 32%',
        scrub,
        invalidateOnRefresh: true
      }
    });

    if (media.length) {
      tl.from(media, {
        ...mediaFrom,
        stagger: { each: 0.04, from: 'start' },
        duration: 0.55,
        immediateRender: false
      }, 0);
    }

    if (copy.length) {
      tl.from(copy, {
        ...copyFrom,
        stagger: { each: 0.03, from: 'start' },
        duration: 0.5,
        immediateRender: false
      }, 0.06);
    }
  }

  function buildProjectDrift(project, section, trigger) {
    const selector = [
      project.id === 'timewalker' ? '.tw-hero-copy,.tw-boat' : ''
    ].filter(Boolean).join(',');
    if (!selector) return;

    qa(selector, section).forEach((target, i) => {
      gsap.to(target, {
        y: () => (i % 2 ? -22 : -36),
        x: () => (project.mode === 'side' ? (i % 2 ? -14 : 16) : 0),
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub: lite ? 0.6 : 1.2,
          invalidateOnRefresh: true
        }
      });
    });
  }

  function buildDetailReveals() {
    const blocks = qa([
      '#amadeus .ama-v2-module',
      '#amadeus .ama-editorial__spread',
      '#amadeus .ama-dnote:not(.ama-dnote--split)',
      '#amadeus .ama-ui-poster',
      '#timewalker .tw-dnote',
      '#timewalker .tw-product-row',
      '#timewalker .tw-feature'
    ].join(',')).filter((block) => !block.closest('.ama-gallery-stream'));

    blocks.forEach((block, i) => {
      const items = qa('h2,h3,h4,p,figure,img,.da2-reveal,.tw-value,.ama-system-card', block).slice(0, 8);
      if (!items.length) return;

      gsap.from(items, {
        autoAlpha: 0,
        y: lite ? 14 : 28,
        x: lite ? 0 : (i % 2 ? 10 : -10),
        scale: 0.99,
        stagger: lite ? 0.02 : 0.04,
        duration: lite ? 0.45 : 0.7,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: block,
          start: 'top 84%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  function buildTimewalkerSpotlights() {
    qa('#timewalker .tw-spotlight-demo,#timewalker .tw-design-frame,#timewalker .tw-mock-phone,#timewalker .tw-app-phone')
      .forEach((item, i) => {
        gsap.from(item, {
          autoAlpha: 0,
          y: lite ? 40 : 100,
          x: lite ? 0 : (i % 2 ? 40 : -36),
          scale: lite ? 0.96 : 0.9,
          rotation: lite ? 0 : (i % 2 ? 2.5 : -2.5),
          duration: lite ? 0.55 : 0.85,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        });

        gsap.to(item, {
          y: i % 2 ? -18 : -28,
          rotation: i % 2 ? -0.4 : 0.4,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1
          }
        });
      });
  }

  function buildProofStages() {
    buildTimewalkerProof();
  }

  function buildAmadeusPosterMotion() {
    const poster = q('#ama-intro');
    const amadeus = q('#amadeus');
    if (!poster) return;

    amadeus?.classList.add('motion-section', 'motion-amadeus');

    const mid = q('.ama-poster-mid', poster);
    const topCap = q('.ama-poster-top', poster);
    const foot = q('.ama-poster-foot', poster);
    const footEn = q('.ama-poster-foot-en', poster);
    const scanlines = q('.ama-poster-scanlines', poster);
    const bg = q('.ama-poster-bg', poster);
    const grain = q('.ama-poster-grain', poster);
    const vtext = qa('.ama-poster-vtext', poster);
    const title = q('.ama-poster-title', poster);
    const sub = q('.ama-poster-sub', poster);
    const en = q('.ama-poster-en', poster);
    const tag = q('.ama-poster-tag', poster);
    const status = qa('#ama-intro .project-status span');
    const restCopy = [en, sub, tag, ...status].filter(Boolean);
    const scroller = document.documentElement;
    const dnoteLift = () => Math.round(window.innerHeight * 0.22);

    if (lite) {
      gsap.set([title, ...restCopy, topCap, foot, footEn, scanlines], { autoAlpha: 1, x: 0, skewX: 0 });
      return;
    }

    gsap.set([title, ...restCopy, topCap, foot, footEn], { autoAlpha: 0, y: 0, skewX: 0 });
    gsap.set(scanlines, { autoAlpha: 0 });

    let introDone = false;
    const introTl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.out' },
      onStart: () => poster.classList.add('ama-poster--booting'),
      onComplete: () => {
        poster.classList.remove('ama-poster--booting');
        mid?.classList.remove('is-glitching');
      }
    })
      .to(scanlines, { autoAlpha: 0.9, duration: 0.06, ease: 'none' }, 0)
      .add(() => mid?.classList.add('is-glitching'), 0)
      .to(title, { autoAlpha: 1, duration: 0.04, ease: 'none' }, 0.02)
      .to(title, {
        ease: 'none',
        keyframes: [
          { x: -6, skewX: 3, autoAlpha: 0.72, duration: 0.035 },
          { x: 5, skewX: -4, autoAlpha: 1, duration: 0.035 },
          { x: -3, autoAlpha: 0.58, duration: 0.03 },
          { x: 2, autoAlpha: 0.88, duration: 0.03 },
          { x: 0, skewX: 0, autoAlpha: 1, duration: 0.05 }
        ]
      }, 0.02)
      .to(topCap, { autoAlpha: 1, duration: 0.1 }, 0.16)
      .to(sub, { autoAlpha: 1, duration: 0.08 }, 0.22)
      .to(en, { autoAlpha: 1, duration: 0.08 }, 0.26)
      .to(status, { autoAlpha: 1, stagger: 0.035, duration: 0.08 }, 0.3)
      .to(tag, { autoAlpha: 1, duration: 0.1 }, 0.36)
      .to(footEn, { autoAlpha: 1, duration: 0.1 }, 0.38)
      .to(scanlines, { autoAlpha: 0, duration: 0.18, ease: 'power2.out' }, 0.48)
      .add(() => mid?.classList.remove('is-glitching'), 0.58);

    const runIntro = () => {
      if (introDone) return;
      introDone = true;
      introTl.restart(true);
    };

    const ensureIntro = () => {
      if (introDone) return;
      const rect = poster.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) runIntro();
    };

    ST.create({
      id: 'ama-poster-intro',
      trigger: poster,
      scroller,
      start: 'top bottom',
      once: true,
      onEnter: runIntro,
      onRefresh: ensureIntro
    });

    if (window.__lenis) {
      window.__lenis.on('scroll', ensureIntro);
    } else {
      window.addEventListener('scroll', ensureIntro, { passive: true });
    }

    poster.classList.add('motion-handoff-cover');

    const dnote = q('#amadeus .ama-dnote--split') || q('#amadeus section.ama-dnote');
    if (!dnote) return;

    let veil = q('.ama-poster-handoff-veil', poster);
    if (!veil) {
      veil = document.createElement('div');
      veil.className = 'ama-poster-handoff-veil';
      veil.setAttribute('aria-hidden', 'true');
      poster.appendChild(veil);
    }

    gsap.set(veil, { autoAlpha: 0, yPercent: 108 });
    gsap.set(dnote, { y: dnoteLift, autoAlpha: 0.08 });
    dnote.classList.add('ama-dnote--handoff');

    const handoffVh = lite ? 0.88 : 1.12;
    let handoffAnchor = 0;

    const captureHandoffAnchor = () => {
      if (handoffAnchor > 0) return handoffAnchor;
      const scroll = window.__lenis?.scroll ?? window.scrollY;
      const rect = poster.getBoundingClientRect();
      if (rect.top > 2) handoffAnchor = scroll + rect.top;
      return handoffAnchor;
    };

    const handoffStart = () => captureHandoffAnchor();
    const handoffEnd = () => captureHandoffAnchor() + Math.round(window.innerHeight * handoffVh);

    const handoffTl = gsap.timeline({
      paused: true,
      defaults: { ease: 'none', immediateRender: false }
    })
      .to(bg, { scale: 1.12, yPercent: -8, filter: 'brightness(0.58)', duration: 0.55 }, 0)
      .to(mid, { y: -84, autoAlpha: 0, scale: 0.9, duration: 0.48 }, 0.04)
      .to([topCap, foot, footEn, ...vtext], { autoAlpha: 0, y: -42, duration: 0.42 }, 0.08)
      .to(veil, { autoAlpha: 1, yPercent: 0, duration: 0.58, ease: 'power2.inOut' }, 0.18)
      .to(grain, { autoAlpha: 0, duration: 0.35 }, 0.32)
      .to(bg, { autoAlpha: 0, duration: 0.42 }, 0.48)
      .fromTo(
        dnote,
        { y: dnoteLift, autoAlpha: 0.08 },
        { y: 0, autoAlpha: 1, duration: 0.68, ease: 'power2.out' },
        0.14
      );

    const syncHandoff = (progress) => {
      if (progress > 0.02 && !introDone) runIntro();
      handoffTl.progress(Math.max(0, Math.min(1, progress)));
    };

    ST.create({
      id: 'ama-poster-handoff',
      trigger: poster,
      scroller,
      start: handoffStart,
      end: handoffEnd,
      pin: poster,
      pinType: 'fixed',
      pinSpacing: true,
      scrub: lite ? 0.72 : 1.62,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 26,
      onToggle: (self) => {
        document.body.classList.toggle('motion-handoff-active', self.isActive);
        amadeus?.classList.toggle('is-ama-handoff-active', self.isActive);
        poster.classList.toggle('is-pin-active', self.isActive);
        dnote.classList.toggle('is-handoff-receiving', self.isActive);
      },
      onUpdate: (self) => syncHandoff(self.progress),
      onRefresh: (self) => {
        if (!self.isActive) captureHandoffAnchor();
        syncHandoff(self.progress);
      },
      onLeave: () => gsap.set(dnote, { clearProps: 'transform,opacity,visibility' }),
      onLeaveBack: () => {
        gsap.set(dnote, { y: dnoteLift, autoAlpha: 0.08 });
        syncHandoff(0);
      }
    });

    captureHandoffAnchor();
    syncHandoff(0);

    requestAnimationFrame(() => {
      ensureIntro();
      ST.refresh();
      captureHandoffAnchor();
      ensureIntro();
    });
  }

  function buildTimewalkerProof() {
    const stage = q('.proof-stage--tw');
    if (!stage) return;
    const pin = q('.proof-pin', stage);
    const bg = q('.tw-proof-bg', stage);
    const copy = qa('.tw-proof-copy .proof-kicker,.tw-proof-copy .proof-title', stage);
    const phone = q('.tw-proof-phone', stage);
    const card = q('.tw-proof-card', stage);
    const route = qa('.tw-proof-route span', stage);

    gsap.set(copy, { autoAlpha: 0, y: 28 });
    gsap.set(phone, { autoAlpha: 0, y: 120, scale: 0.88, rotation: -2 });
    gsap.set(card, { autoAlpha: 0, x: 70, y: 20, scale: 0.92 });
    gsap.set(route, { autoAlpha: 0, y: 18 });

    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'proof-timewalker',
        trigger: stage,
        start: 'top top',
        end: '+=180%',
        pin,
        scrub: lite ? 0.35 : 0.9,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const active = Math.min(route.length - 1, Math.floor(self.progress * route.length));
          route.forEach((item, i) => item.classList.toggle('is-active', i <= active));
        }
      }
    })
      .to(bg, { scale: 1.08, y: -30, duration: 1 }, 0)
      .to(copy, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.18 }, 0.02)
      .to(phone, { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 0.25 }, 0.18)
      .to(card, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.25 }, 0.42)
      .to(route, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.28 }, 0.55)
      .to(card, { y: 150, scale: 0.76, x: -180, duration: 0.28 }, 0.72)
      .to(phone, { y: -34, scale: 0.96, duration: 0.2 }, 0.78);
  }

  function buildProjectJumpNav() {
    const nav = q('.project-jump-nav');
    if (!nav) return;
    const links = qa('a[href^="#"]', nav);
    const ids = ['amadeus', 'digitalark', 'timewalker'];

    ST.create({
      trigger: '#amadeus',
      endTrigger: '#self',
      start: 'top 70%',
      end: 'top 40%',
      onToggle: (self) => document.body.classList.toggle('project-nav-visible', self.isActive)
    });

    ids.forEach((id) => {
      const target = document.getElementById(id);
      if (!target) return;
      ST.create({
        trigger: target,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (!self.isActive) return;
          links.forEach((link) => link.classList.toggle('is-here', link.getAttribute('href') === `#${id}`));
        }
      });
    });
  }

  function getMediaFrom(mode) {
    if (lite) return { autoAlpha: 0, y: 24, scale: 0.96 };
    if (mode === 'side') return { autoAlpha: 0, x: -64, y: 12, scale: 0.8 };
    if (mode === 'lift') return { autoAlpha: 0, y: 72, scale: 0.8 };
    if (mode === 'stack') return { autoAlpha: 0, y: 80, scale: 0.8 };
    return { autoAlpha: 0, y: 56, scale: 0.8 };
  }

  function getCopyFrom(mode) {
    if (lite) return { autoAlpha: 0, y: 18 };
    if (mode === 'side') return { autoAlpha: 0, x: 48, y: 16 };
    if (mode === 'lift') return { autoAlpha: 0, y: 48 };
    if (mode === 'stack') return { autoAlpha: 0, y: 40 };
    return { autoAlpha: 0, y: 36 };
  }
  }

  if (window.__lenisReady) boot();
  else window.addEventListener('lenis-ready', boot, { once: true });
})();

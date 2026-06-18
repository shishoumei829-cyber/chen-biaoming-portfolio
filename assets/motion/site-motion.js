(function initSiteMotion() {
  function boot() {
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (!gsap || !ST) return;

  gsap.registerPlugin(ST);
  gsap.defaults({ overwrite: 'auto' });

  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => gsap.utils.toArray(root.querySelectorAll(sel));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lite = reduce;

  document.body.classList.add('motion-running', lite ? 'motion-reduced' : 'motion-ready');

  const projects = [
    {
      id: 'amadeus',
      trigger: '#ama-intro',
      media: '.ama-poster-bg,.ama-poster-grain,.ama-poster-vtext,.ama-poster-foot',
      copy: '.ama-poster-en,.ama-poster-title,.ama-poster-sub,.ama-poster-tag,.project-status span',
      mode: 'vertical'
    },
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

  buildDetailReveals();
  buildTimewalkerSpotlights();

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
      project.id === 'amadeus' ? '.ama-poster-mid,.ama-poster-foot' : '',
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
      '#amadeus .ama-dnote',
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

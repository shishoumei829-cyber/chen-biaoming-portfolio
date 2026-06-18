(function initSmoothScroll() {
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const LenisCtor = window.Lenis;

  function ready() {
    window.__lenisReady = true;
    window.dispatchEvent(new CustomEvent('lenis-ready'));
  }

  if (!gsap || !ST || !LenisCtor) {
    ready();
    return;
  }

  gsap.registerPlugin(ST);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    window.addEventListener('scroll', () => ST.update(), { passive: true });
    ready();
    return;
  }

  const lenis = new LenisCtor({
    lerp: 0.075,
    wheelMultiplier: 0.82,
    smoothWheel: true,
    syncTouch: false,
    touchMultiplier: 1,
    duration: 1.15
  });

  lenis.on('scroll', ST.update);

  ST.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
  });

  ST.addEventListener('refresh', () => lenis.resize());

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window.__lenis = lenis;
  document.documentElement.classList.add('has-smooth-scroll');

  window.addEventListener('load', () => {
    lenis.resize();
    ST.refresh();
  }, { once: true });

  ready();
})();

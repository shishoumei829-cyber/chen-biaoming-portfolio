const progress = document.querySelector(".progress");
const reveals = document.querySelectorAll(".reveal");
const preview = document.querySelector(".hover-preview");
const previewImg = preview?.querySelector("img");
const archiveRows = document.querySelectorAll(".archive-row");

const IMAGE_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";
const SCRUB_SOFT = 0.45;

function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const value = max > 0 ? (scrollY / max) * 100 : 0;
  progress.style.width = `${value}%`;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

function splitAboutWords() {
  const paragraph = document.querySelector(".about-copy");
  if (!paragraph || paragraph.dataset.split) return;
  const phrases = [
    "我相信设计不是把功能排列清楚，",
    "而是让一个人愿意靠近、理解、停留，并在反复使用中形成自己的关系。",
    "好的产品不只解决任务，也会处理感知、情绪、信任、节奏和记忆。",
    "我关心那些不容易被写进功能列表的部分：",
    "为什么它让人安心，为什么它能被记住，",
    "为什么它值得继续使用。"
  ];
  paragraph.innerHTML = phrases.map((phrase, index) => {
    const red = index === 0 ? " is-red" : "";
    return `<span class="phrase${red}">${phrase}</span>`;
  }).join(" ");
  paragraph.dataset.split = "true";
}

function initFallbackReveal() {
  document.documentElement.classList.add("has-smooth-scroll");
  reveals.forEach((el) => observer.observe(el));
  document.querySelectorAll(".line-inner").forEach((line) => line.classList.add("is-in"));
}

function initScrollStudy() {
  if (!window.gsap || !window.ScrollTrigger) {
    initFallbackReveal();
    return;
  }

  document.body.classList.add("is-gsap");
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "none" });
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true
  });
  if (ScrollTrigger.normalizeScroll) {
    ScrollTrigger.normalizeScroll(false);
  }
  splitAboutWords();

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const mm = gsap.matchMedia();

  mm.add("(min-width: 821px)", () => {
    const heroLayers = gsap.utils.toArray(".hero-layer");
    gsap.set(heroLayers, {
      autoAlpha: 1,
      xPercent: -50,
      yPercent: -50,
      scale: 1,
      filter: "blur(0px)"
    });
    gsap.set(".hero-media-wrap", { y: 0 });
    gsap.set(".hero-layer", { rotation: 0 });
    gsap.set(".about", { yPercent: 0, autoAlpha: 1 });
    gsap.set(".about-panel .bg-div", { y: "-20rem" });
    gsap.set(".line-inner", { yPercent: 110 });
    gsap.set(".statement-visual", { scale: 0.8 });

    const heroTl = gsap.timeline({
      scrollTrigger: {
        id: "hero-canvas",
        trigger: ".hero",
        start: "top top",
        end: "+=340%",
        scrub: SCRUB_SOFT,
        pin: true,
        anticipatePin: 0,
        refreshPriority: 30
      }
    });

    heroTl
      .to(".hero-media-wrap", { y: "-86vh", duration: 1.45, ease: "none" }, 0)
      .to(".scroll-cue", { autoAlpha: 0, y: -16, duration: 0.35, ease: "none" }, 0.35)
      .to(".hero-media-wrap", { y: "-148vh", autoAlpha: 1, filter: "blur(0px)", duration: 0.95, ease: "none" }, 1.35);

    gsap.fromTo(".about",
      { yPercent: 14 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          id: "about-cover-in",
          trigger: ".about",
          start: "top bottom",
          end: "top 72%",
          scrub: SCRUB_SOFT,
          refreshPriority: 25
        }
      }
    );

    const phrases = gsap.utils.toArray(".about .phrase");
    gsap.set(phrases, { color: "rgba(23, 17, 13, 0.18)" });
    gsap.set(phrases[0], { color: "var(--red)" });

    gsap.timeline({
      scrollTrigger: {
        id: "about-text",
        trigger: ".about",
        start: "top top",
        end: "+=175%",
        scrub: SCRUB_SOFT,
        pin: true,
        pinSpacing: true,
        anticipatePin: 0,
        refreshPriority: 22
      }
    })
      .to(phrases[1], { color: "var(--red)", duration: 0.16 })
      .to(phrases[2], { color: "var(--red)", duration: 0.16 })
      .to(phrases[3], { color: "var(--red)", duration: 0.16 })
      .to(phrases[4], { color: "var(--red)", duration: 0.16 })
      .to(phrases[5], { color: "var(--red)", duration: 0.16 })
      .to(phrases, { color: "var(--red)", duration: 0.2 });

    ScrollTrigger.create({
      id: "about-cover-state",
      trigger: ".about-stage",
      start: "top 88%",
      end: "bottom top",
      onEnter: () => document.body.classList.add("is-about-section"),
      onEnterBack: () => document.body.classList.add("is-about-section"),
      onLeave: () => document.body.classList.remove("is-about-section"),
      onLeaveBack: () => document.body.classList.remove("is-about-section"),
      refreshPriority: 22
    });

    const lineInners = gsap.utils.toArray(".line-inner");

    gsap.fromTo(".about-panel .bg-div",
      { y: "-20rem" },
      {
        y: 0,
        ease: "none",
        scrollTrigger: {
          id: "about-panel-curtain",
          trigger: ".about",
          start: "bottom bottom",
          endTrigger: ".about-panel",
          end: "top 40%",
          scrub: SCRUB_SOFT,
          refreshPriority: 19
        }
      }
    );

    gsap.timeline({
      scrollTrigger: {
        id: "about-panel",
        trigger: ".about-panel",
        start: "top top",
        end: "+=115%",
        scrub: SCRUB_SOFT,
        pin: true,
        pinSpacing: true,
        anticipatePin: 0,
        refreshPriority: 18
      }
    })
      .to(lineInners, {
        yPercent: 0,
        duration: 0.38,
        stagger: 0.07,
        ease: "power2.out"
      }, 0.08)
      .to(".statement-visual", {
        scale: 1,
        duration: 0.55,
        ease: IMAGE_EASE
      }, 0.14);

    ScrollTrigger.create({
      id: "red-section-state",
      trigger: ".about-panel",
      start: "top 58%",
      end: "bottom top",
      onEnter: () => document.body.classList.add("is-red-section"),
      onEnterBack: () => document.body.classList.add("is-red-section"),
      onLeaveBack: () => document.body.classList.remove("is-red-section"),
      refreshPriority: 18
    });

    const projectCards = gsap.utils.toArray(".project-card");
    const projectTrack = document.querySelector(".project-track");
    const projectThumbs = gsap.utils.toArray(".project-thumbs button");
    gsap.set(projectCards, { autoAlpha: 1, yPercent: 0, scale: 1, filter: "none" });
    gsap.set(".project-card .project-image", { y: 28, autoAlpha: 0.96, scale: 0.8 });
    gsap.set(".project-card .project-meta h2", { autoAlpha: 0.92 });

    const setProjectThumb = (progress) => {
      const active = Math.min(projectCards.length - 1, Math.max(0, Math.round(progress * (projectCards.length - 1))));
      projectThumbs.forEach((thumb, index) => thumb.classList.toggle("is-active", index === active));
    };

    const projectTween = gsap.to(projectTrack, {
      x: () => -(projectCards.length - 1) * window.innerWidth,
      ease: "none",
      scrollTrigger: {
        id: "project-horizontal",
        trigger: ".featured-projects",
        start: "top top",
        end: () => `+=${window.innerWidth * (projectCards.length - 1) * 2.2}`,
        scrub: SCRUB_SOFT,
        pin: true,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => setProjectThumb(self.progress),
        refreshPriority: 10
      }
    });

    ScrollTrigger.create({
      id: "project-state",
      trigger: ".featured-projects",
      start: "top top",
      end: "bottom top",
      onEnter: () => document.body.classList.add("is-red-section", "is-project-section"),
      onEnterBack: () => document.body.classList.add("is-red-section", "is-project-section"),
      onLeave: () => document.body.classList.remove("is-project-section"),
      onLeaveBack: () => document.body.classList.remove("is-project-section"),
      refreshPriority: 10
    });

    gsap.fromTo(".section-kicker",
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".featured-projects",
          start: "top 78%",
          end: "top top",
          scrub: SCRUB_SOFT
        }
      }
    );

    projectCards.forEach((card, index) => {
      const image = card.querySelector(".project-image");
      const title = card.querySelector(".project-meta h2");
      gsap.fromTo(image,
        { y: 36, autoAlpha: 0.92, scale: 0.8 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          ease: IMAGE_EASE,
          scrollTrigger: {
            trigger: card,
            containerAnimation: projectTween,
            start: "left 94%",
            end: "center 52%",
            scrub: 0.65
          }
        }
      );
      gsap.fromTo(title,
        { x: index % 2 ? 140 : -140, autoAlpha: 0.55 },
        {
          x: 0,
          autoAlpha: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            containerAnimation: projectTween,
            start: "left 94%",
            end: "center 46%",
            scrub: 0.55
          }
        }
      );
    });

    gsap.fromTo(".archive-row",
      { autoAlpha: 0.18, y: 72 },
      {
        autoAlpha: 1,
        y: 0,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".archive",
          start: "top top",
          end: "+=95%",
          scrub: SCRUB_SOFT,
          pin: true,
          anticipatePin: 0,
          preventOverlaps: "portfolio"
        }
      }
    );

    if (reduceMotion) {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.scrub) st.vars.scrub = true;
      });
    }

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });

  mm.add("(max-width: 820px)", () => {
    initFallbackReveal();
  });
}

archiveRows.forEach((row) => {
  row.addEventListener("mouseenter", () => {
    if (!preview || !previewImg) return;
    previewImg.src = row.dataset.preview;
    preview.classList.add("is-visible");
  });

  row.addEventListener("mousemove", (event) => {
    if (!preview) return;
    preview.style.transform = `translate3d(${event.clientX + 34}px, ${event.clientY - 12}px, 0) scale(1)`;
  });

  row.addEventListener("mouseleave", () => {
    if (!preview) return;
    preview.classList.remove("is-visible");
    preview.style.transform = "translate3d(-50%, -50%, 0) scale(.94)";
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: document.body.classList.contains("is-gsap") ? "auto" : "smooth" });
  });
});

addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
updateProgress();
initScrollStudy();

const progress = document.querySelector(".progress");
const loader = document.querySelector(".loader");
const loaderPct = document.querySelector(".loader-pct");
const words = document.querySelectorAll(".about-text .word");
const categories = document.querySelectorAll(".category");
const projectThumbs = document.querySelectorAll(".project-thumb");
const inspireButtons = document.querySelectorAll(".inspire-thumbs button");
const inspirePanels = document.querySelectorAll(".inspire-panel");
const backTop = document.querySelector(".back-top");

const categoryMap = {
  housing: ["housing"],
  interior: ["interior"],
  infra: ["infra"]
};

function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
}

function runLoader() {
  let value = 0;
  const finish = () => {
    loaderPct.textContent = "100 %";
    document.body.classList.add("is-loaded");
  };

  const tick = () => {
    value = Math.min(100, value + Math.random() * 18 + 6);
    loaderPct.textContent = `${Math.round(value)} %`;
    if (value < 100) {
      requestAnimationFrame(tick);
    } else {
      finish();
    }
  };

  requestAnimationFrame(tick);
  window.addEventListener("load", finish, { once: true });
  setTimeout(finish, 2200);
}

function setCategory(name) {
  categories.forEach((cat) => {
    cat.classList.toggle("is-active", cat.dataset.category === name);
  });
  projectThumbs.forEach((thumb) => {
    const show = thumb.dataset.cat === name;
    thumb.classList.toggle("is-hidden", !show);
  });
}

function setInspirePanel(index) {
  inspireButtons.forEach((btn, i) => btn.classList.toggle("is-active", i === index));
  inspirePanels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
}

function initInteractions() {
  categories.forEach((cat) => {
    cat.addEventListener("click", () => setCategory(cat.dataset.category));
  });

  inspireButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => setInspirePanel(index));
  });

  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function initScroll() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("is-gsap");

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    words.forEach((word) => word.classList.add("is-lit"));
    return;
  }

  const mm = gsap.matchMedia();

  mm.add("(min-width: 821px)", () => {
    const galleryCards = gsap.utils.toArray(".gallery-card");

    gsap.set(galleryCards, { autoAlpha: 0 });
    gsap.set(".card-1", { autoAlpha: 1 });

    const introTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".home-intro",
        start: "top top",
        end: "+=360%",
        scrub: true,
        pin: ".intro-pin",
        anticipatePin: 0
      }
    });

    introTl
      .to(".intro-hero", { y: "-18vh", duration: 0.4 }, 0)
      .to(".scroll-cue", { autoAlpha: 0, y: -12, duration: 0.25 }, 0.2)
      .to(".intro-gallery", { y: "-120vh", duration: 1.2, ease: "none" }, 0.15)
      .to(galleryCards, { autoAlpha: 1, stagger: 0.08, duration: 0.35 }, 0.35)
      .to(".intro-hero", { autoAlpha: 0, scale: 0.92, duration: 0.35 }, 0.55);

    gsap.set(words, { color: "rgba(155, 0, 0, 0.28)" });
    words[0]?.classList.add("is-lit");

    const aboutTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".home-about",
        start: "top top",
        end: "+=150%",
        scrub: true,
        pin: true,
        anticipatePin: 0
      }
    });

    words.forEach((word, index) => {
      if (index === 0) return;
      aboutTl.to(word, { color: "#9b0000", duration: 0.08, onStart: () => word.classList.add("is-lit") }, index * 0.04);
    });

    ScrollTrigger.create({
      trigger: ".home-about",
      start: "top 80%",
      end: "bottom top",
      onEnter: () => document.body.classList.add("is-about-section"),
      onEnterBack: () => document.body.classList.add("is-about-section"),
      onLeave: () => document.body.classList.remove("is-about-section"),
      onLeaveBack: () => document.body.classList.remove("is-about-section")
    });

    const categoryOrder = ["housing", "interior", "infra"];
    ScrollTrigger.create({
      trigger: ".home-projects",
      start: "top top",
      end: "+=220%",
      scrub: true,
      pin: true,
      onUpdate: (self) => {
        const index = Math.min(categoryOrder.length - 1, Math.floor(self.progress * categoryOrder.length));
        setCategory(categoryOrder[index]);
      },
      onEnter: () => document.body.classList.add("is-red-section", "is-project-section"),
      onEnterBack: () => document.body.classList.add("is-red-section", "is-project-section"),
      onLeave: () => document.body.classList.remove("is-red-section", "is-project-section"),
      onLeaveBack: () => document.body.classList.remove("is-red-section", "is-project-section")
    });

    const inspireTrack = document.querySelector(".inspire-track");
    if (inspireTrack) {
      gsap.to(inspireTrack, {
        x: () => -(inspireTrack.scrollWidth - window.innerWidth + 80),
        ease: "none",
        scrollTrigger: {
          trigger: ".home-inspire",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            const index = Math.min(inspirePanels.length - 1, Math.round(self.progress * (inspirePanels.length - 1)));
            setInspirePanel(index);
          }
        }
      });
    }

    const teamTrack = document.querySelector(".team-track");
    if (teamTrack) {
      gsap.fromTo(teamTrack.children, { autoAlpha: 0.2, y: 40 }, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".home-team",
          start: "top 70%",
          end: "top 20%",
          scrub: true
        }
      });
    }
  });

  mm.add("(max-width: 820px)", () => {
    words.forEach((word) => word.classList.add("is-lit"));
    gsap.utils.toArray(".gallery-card").forEach((card) => gsap.set(card, { autoAlpha: 1 }));
  });
}

runLoader();
setCategory("housing");
setInspirePanel(0);
initInteractions();
initScroll();
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
updateProgress();

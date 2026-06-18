const progress = document.querySelector('.progress');
const preview = document.querySelector('.hover-preview');
const previewImg = preview?.querySelector('img');
const previewTargets = document.querySelectorAll('[data-preview]');

function updateProgress(){
  const max = document.documentElement.scrollHeight - innerHeight;
  const ratio = max > 0 ? scrollY / max : 0;
  progress.style.width = `${ratio * 100}%`;
}

addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

previewTargets.forEach((el) => {
  el.addEventListener('mouseenter', () => {
    if (!preview || !previewImg) return;
    previewImg.src = el.dataset.preview;
    preview.classList.add('is-on');
  });
  el.addEventListener('mousemove', (event) => {
    if (!preview) return;
    preview.style.left = `${event.clientX + 28}px`;
    preview.style.top = `${event.clientY + 18}px`;
  });
  el.addEventListener('mouseleave', () => {
    preview?.classList.remove('is-on');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('[data-case], .statement, .gallery-copy, .project-card, .archive-row')
  .forEach((el) => revealObserver.observe(el));

const filterButtons = document.querySelectorAll('[data-filter]');
const archiveRows = document.querySelectorAll('.archive-row');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    archiveRows.forEach((row) => {
      const show = filter === 'all' || row.dataset.kind === filter;
      row.classList.toggle('is-hidden', !show);
    });
  });
});

const heroImage = document.querySelector('.sa-hero-image');
addEventListener('scroll', () => {
  if (!heroImage) return;
  const y = Math.min(scrollY, innerHeight);
  heroImage.style.transform = `translateY(${y * -0.08}px) scale(${1 + y / innerHeight * 0.04})`;
}, { passive: true });

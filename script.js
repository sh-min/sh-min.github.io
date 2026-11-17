const preview = document.getElementById('preview-video');
const previewToggle = document.getElementById('preview-toggle');
const playbackIcon = document.getElementById('playback-icon');
const dialog = document.getElementById('video-dialog');
const fullVideo = document.getElementById('full-video');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let manuallyPaused = false;
let inView = false;
let opener;

previewToggle.hidden = false;
function updateButton() {
  previewToggle.setAttribute('aria-label', preview.paused ? 'Play preview' : 'Pause preview');
  playbackIcon.setAttribute('d', preview.paused ? 'm7 4 9 6-9 6Z' : 'M5 4h4v12H5ZM12 4h4v12h-4Z');
}
function syncPreview() {
  if (reducedMotion.matches || manuallyPaused || !inView || document.hidden || dialog.open) {
    preview.pause();
  } else {
    preview.play().catch(updateButton);
  }
}
preview.addEventListener('play', updateButton);
preview.addEventListener('pause', updateButton);
previewToggle.addEventListener('click', () => {
  if (preview.paused) {
    manuallyPaused = false;
    preview.play().catch(updateButton);
  } else {
    manuallyPaused = true;
    preview.pause();
  }
});
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  syncPreview();
}, { threshold: 0.15 }).observe(preview);
reducedMotion.addEventListener('change', syncPreview);
document.addEventListener('visibilitychange', syncPreview);

for (const link of document.querySelectorAll('[data-open-video]')) {
  link.addEventListener('click', event => {
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    opener = link;
    preview.pause();
    dialog.showModal();
    fullVideo.currentTime = 0;
    fullVideo.play().catch(() => {});
  });
}
document.getElementById('close-video').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  fullVideo.pause();
  syncPreview();
  opener?.focus({ preventScroll: true });
});

const citationToggle = document.getElementById('citation-toggle');
const citation = document.getElementById('citation');
citationToggle.addEventListener('click', () => {
  citation.hidden = !citation.hidden;
  citationToggle.setAttribute('aria-expanded', String(!citation.hidden));
});
document.getElementById('copy-citation').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(document.getElementById('bibtex').textContent);
    status.textContent = 'Citation copied.';
  } catch {
    status.textContent = 'Select the citation text above to copy it.';
  }
});

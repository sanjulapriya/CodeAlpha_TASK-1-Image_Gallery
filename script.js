// Masonry Gallery — filters + lightbox + next/prev + keyboard + swipe
document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.card'));
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const masonry = document.getElementById('masonry');

  // Lightbox elements
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const lbClose = document.getElementById('lbClose');

  // Track visible indices (by data-index)
  let visible = cards.map(c => Number(c.dataset.index));
  let current = visible.length ? visible[0] : 0;

  // Filtering logic
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      visible = [];
      cards.forEach(card => {
        const match = (cat === 'all') || (card.dataset.category === cat);
        card.style.display = match ? 'inline-block' : 'none';
        if (match) visible.push(Number(card.dataset.index));
      });
      // set current to first visible
      if (visible.length) current = visible[0];
    });
  });

  // Open lightbox for index
  function openLightbox(idx) {
    current = idx;
    const card = cards.find(c => Number(c.dataset.index) === idx);
    if (!card) return;
    const img = card.querySelector('img');
    // use larger img via picsum seed with bigger size for crispness
    const srcLarge = img.src.replace(/\/\d+\/\d+$/, '/1400/1400');
    lbImg.src = srcLarge;
    lbImg.alt = img.alt || '';
    lbCaption.textContent = `${card.dataset.category} • Image ${idx}`;
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    preloadNeighbors();
  }

  function closeLightbox() {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function gotoOffset(offset) {
    if (!visible.length) return;
    const pos = visible.indexOf(current);
    const nextPos = (pos + offset + visible.length) % visible.length;
    openLightbox(visible[nextPos]);
  }

  // Attach click/keyboard to cards
  cards.forEach(card => {
    const idx = Number(card.dataset.index);
    card.addEventListener('click', () => openLightbox(idx));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  // Lightbox controls
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); gotoOffset(-1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); gotoOffset(1); });
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') gotoOffset(1);
    if (e.key === 'ArrowLeft') gotoOffset(-1);
  });

  // Touch swipe
  let startX = 0;
  lbImg.addEventListener('touchstart', e => startX = e.touches[0].clientX);
  lbImg.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    if (endX - startX > 40) gotoOffset(-1);
    if (startX - endX > 40) gotoOffset(1);
  });

  // Preload neighbors for smooth nav
  function preloadNeighbors() {
    const pos = visible.indexOf(current);
    if (pos === -1) return;
    const prev = visible[(pos - 1 + visible.length) % visible.length];
    const next = visible[(pos + 1) % visible.length];
    [prev, current, next].forEach(i => {
      const card = cards.find(c => Number(c.dataset.index) === i);
      if (!card) return;
      const src = card.querySelector('img').src.replace(/\/\d+\/\d+$/, '/1400/1400');
      const im = new Image(); im.src = src;
    });
  }

  // Initial reveal animation (staggered)
  cards.forEach((c, i) => { c.style.opacity = 0; setTimeout(()=> { c.style.transition = 'opacity .5s ease'; c.style.opacity = 1; }, 30 * (i % 12)); });

  // Ensure visible initial list is correct (in case some CSS display rules applied)
  visible = cards.filter(c => c.style.display !== 'none').map(c => Number(c.dataset.index));
});

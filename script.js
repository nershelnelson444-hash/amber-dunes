/* ============================================================
   AMBER DUNES — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAVBAR always solid black ── */
  // Sync hero margin-top to exact navbar height — eliminates any gap
  function syncHeroMargin() {
    const nav  = document.getElementById('navbar');
    const hero = document.getElementById('home');
    if (!nav || !hero) return;
    const h = nav.getBoundingClientRect().height;
    hero.style.setProperty('margin-top', h + 'px', 'important');
  }
  syncHeroMargin();
  window.addEventListener('resize', syncHeroMargin);
  window.addEventListener('load', syncHeroMargin);
  // Extra call after a tick to catch any layout shift
  setTimeout(syncHeroMargin, 100);
  setTimeout(syncHeroMargin, 500);

  /* ── MOBILE MENU ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* ── HERO CAROUSEL (elegant crossfade) ── */
  const heroTrack  = document.getElementById('heroTrack');
  const heroDots   = document.getElementById('heroDots');
  const realSlides = Array.from(heroTrack.querySelectorAll('.hero-slide'));
  const total      = realSlides.length;
  let heroIndex    = 0;
  let heroTimer;
  let animating    = false;

  // Stack all slides on top of each other via absolute positioning
  heroTrack.style.position = 'relative';
  heroTrack.style.width    = '100%';
  heroTrack.style.height   = '100%';

  realSlides.forEach((slide, i) => {
    slide.style.position   = 'absolute';
    slide.style.inset      = '0';
    slide.style.width      = '100%';
    slide.style.height     = '100%';
    slide.style.opacity    = i === 0 ? '1' : '0';
    slide.style.transition = 'opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1)';
    slide.style.zIndex     = i === 0 ? '1' : '0';
  });

  // Build dots
  realSlides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'hero-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goToHero(i));
    heroDots.appendChild(d);
  });

  function updateDots() {
    document.querySelectorAll('.hero-dot').forEach((d, i) => {
      d.classList.toggle('active', i === heroIndex);
    });
  }

  function goToHero(target) {
    if (animating) return;
    const next = ((target % total) + total) % total;
    if (next === heroIndex) return;

    animating = true;

    const current = realSlides[heroIndex];
    const incoming = realSlides[next];

    // Bring incoming slide up, start transparent
    incoming.style.transition = 'none';
    incoming.style.opacity    = '0';
    incoming.style.zIndex     = '2';

    // Force reflow
    incoming.getBoundingClientRect();

    // Fade in incoming
    incoming.style.transition = 'opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1)';
    incoming.style.opacity    = '1';

    // After fade completes, reset current slide underneath
    setTimeout(() => {
      current.style.zIndex  = '0';
      current.style.opacity = '0';
      incoming.style.zIndex = '1';
      heroIndex = next;
      updateDots();
      animating = false;
    }, 1200);

    resetHeroTimer();
  }

  function resetHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => goToHero(heroIndex + 1), 6000);
  }

  document.getElementById('heroPrev').addEventListener('click', () => goToHero(heroIndex - 1));
  document.getElementById('heroNext').addEventListener('click', () => goToHero(heroIndex + 1));

  resetHeroTimer();

  /* ── SIGNATURE CAROUSEL ── */
  const sigTrack   = document.getElementById('sigTrack');
  const sigCards   = Array.from(sigTrack.querySelectorAll('.sig-card'));
  let sigIndex     = 0;

  function isMobile() { return window.innerWidth < 768; }

  function getSigVisible() {
    if (window.innerWidth < 400) return 1;
    if (window.innerWidth < 768) return 3;
    return 3;
  }

  function setSigSizes() {
    if (isMobile()) {
      // On mobile: reset all JS styles — CSS native scroll handles it
      sigCards.forEach(c => { c.style.minWidth = ''; c.style.width = ''; });
      sigTrack.style.width = '';
      sigTrack.style.transform = '';
      sigTrack.style.transition = '';
      return;
    }
    const visible = getSigVisible();
    const outerW  = sigTrack.parentElement.offsetWidth;
    const cardW   = outerW / visible;
    sigCards.forEach(c => c.style.minWidth = cardW + 'px');
    sigTrack.style.width = (sigCards.length * cardW) + 'px';
  }
  setSigSizes();

  function updateSig(animate = true) {
    if (isMobile()) return; // handled by CSS scroll on mobile
    const visible = getSigVisible();
    const outerW  = sigTrack.parentElement.offsetWidth;
    const cardW   = outerW / visible;
    const maxIdx  = Math.max(0, sigCards.length - Math.floor(visible));
    sigIndex      = Math.min(Math.max(sigIndex, 0), maxIdx);
    sigTrack.style.transition = animate ? 'transform 700ms cubic-bezier(0.65,0,0.35,1)' : 'none';
    sigTrack.style.transform  = `translateX(-${sigIndex * cardW}px)`;
  }

  document.getElementById('sigPrev').addEventListener('click', () => {
    if (isMobile()) {
      // scroll the outer container left by one card width
      const outer = sigTrack.parentElement;
      const cardW = outer.querySelector('.sig-card')?.offsetWidth || 105;
      outer.scrollBy({ left: -(cardW + 10), behavior: 'smooth' });
    } else { sigIndex--; updateSig(); }
  });
  document.getElementById('sigNext').addEventListener('click', () => {
    if (isMobile()) {
      const outer = sigTrack.parentElement;
      const cardW = outer.querySelector('.sig-card')?.offsetWidth || 105;
      outer.scrollBy({ left: cardW + 10, behavior: 'smooth' });
    } else { sigIndex++; updateSig(); }
  });

  /* ── SEASONS CAROUSEL ── */
  // All 4 cards visible via CSS — arrows disabled since all fit
  document.getElementById('seasonPrev').style.visibility = 'hidden';
  document.getElementById('seasonNext').style.visibility = 'hidden';
  function setSeasonSizes() {}
  function updateSeasons() {}

  window.addEventListener('resize', () => { setSigSizes(); if (!isMobile()) updateSig(false); });

  /* ── UNIFIED SCROLL REVEAL ── */

  // Elements that reveal as a group (children stagger slightly)
  const revealGroups = [
    '.signature-section',
    '.seasons-section',
    '.occasion-section',
    '.how-section',
    '.about-section',
  ];

  // Add reveal class to section titles and key child elements
  document.querySelectorAll('.section-title, .about-title').forEach(el => {
    el.classList.add('reveal');
  });

  revealGroups.forEach(sel => {
    const section = document.querySelector(sel);
    if (!section) return;

    // Mark direct card children for staggered reveal
    const cards = section.querySelectorAll(
      '.sig-card, .season-card, .occ-card, .how-step, .about-img, .about-text'
    );

    // Wrap cards in a reveal-group span context via class
    const parent = cards[0]?.parentElement;
    if (parent) parent.classList.add('reveal-group');

    cards.forEach(el => el.classList.add('reveal'));
  });

  // Single IntersectionObserver — fires once per section
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const section = entry.target;

      // Reveal title first
      const title = section.querySelector('.reveal');
      if (title) title.classList.add('in-view');

      // Then reveal all cards together with slight stagger
      const cards = section.querySelectorAll('.reveal-group .reveal');
      cards.forEach((el, i) => {
        setTimeout(() => el.classList.add('in-view'), i * 100);
      });

      // Reveal any standalone reveals (titles not in groups)
      section.querySelectorAll('.section-title.reveal, .about-title.reveal').forEach(el => {
        el.classList.add('in-view');
      });

      revealObserver.unobserve(section);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -80px 0px'
  });

  // Observe each section as a whole unit
  document.querySelectorAll(
    '.signature-section, .seasons-section, .occasion-section, .how-section, .about-section'
  ).forEach(s => revealObserver.observe(s));

});
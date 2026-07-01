document.addEventListener('DOMContentLoaded', () => {

  /* ── Menú mobile ─────────────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ── Header con fondo al scrollear ───────────────────── */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Scrollspy: resalta el link activo del menú ──────── */
  const navLinks = document.querySelectorAll('.nav__link');
  const sectionIds = ['main', 'students', 'our-prices', 'links', 'us'];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(section => spyObserver.observe(section));

  /* ── Botón de WhatsApp: aparece a los 4 segundos ─────── */
  setTimeout(() => {
    document.getElementById('whatsapp').classList.add('is-visible');
  }, 4000);

  /* ── Carrusel de opiniones (soporta varias instancias) ── */
  const initCarousel = (root) => {
    const track = root.querySelector('[data-carousel-track]');
    const dotsWrap = root.querySelector('[data-carousel-dots]');
    const prevBtn = root.querySelector('[data-carousel-prev]');
    const nextBtn = root.querySelector('[data-carousel-next]');
    if (!track) return;

    const slides = Array.from(track.children);

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir a la imagen ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    const currentIndex = () => {
      if (!track.clientWidth) return 0;
      return Math.round(track.scrollLeft / track.clientWidth);
    };

    const goTo = (index) => {
      if (!track.clientWidth) return;
      const clamped = (index + slides.length) % slides.length;
      track.scrollTo({ left: slides[clamped].offsetLeft, behavior: 'smooth' });
    };

    const updateActiveDot = () => {
      const index = currentIndex();
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));
    track.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateActiveDot);
    }, { passive: true });

    updateActiveDot();

    // Auto-avance, pausado si el usuario interactúa. No hace nada si el
    // carrusel está oculto (display:none) por CSS responsive.
    let autoplay = setInterval(() => goTo(currentIndex() + 1), 5000);
    const pause = () => clearInterval(autoplay);
    const resume = () => {
      clearInterval(autoplay);
      autoplay = setInterval(() => goTo(currentIndex() + 1), 5000);
    };
    track.addEventListener('pointerdown', pause);
    track.addEventListener('pointerup', resume);
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', resume);
  };

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

});

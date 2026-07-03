document.addEventListener('DOMContentLoaded', () => {

  /* ── Modo claro / oscuro ──────────────────────────────
     El atributo data-theme ya se setea en un script inline en el
     <head> (para evitar el parpadeo del tema equivocado al cargar).
     Acá solo cableamos el botón y persistimos la elección. */
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const THEME_COLORS = { dark: '#0b0d10', light: '#f5f7fa' };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeColorMeta) themeColorMeta.setAttribute('content', THEME_COLORS[theme]);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    }
  };

  // Sincroniza el color de la barra del navegador con el tema ya aplicado
  applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

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

  /* ── Header con fondo al scrollear ───────────────────── 
  const header = document.getElementById('site-header');
  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      scrollTicking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); */

  /* ── Header con fondo al scrollear ───────────────────── */
  const header = document.getElementById('site-header');
  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      scrollTicking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // SOLUCIÓN: Envolver el onScroll inicial en un requestAnimationFrame 
  // para que no ensucie las lecturas limpias que hacen los carruseles abajo.
  window.requestAnimationFrame(onScroll);

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

  /* ── Carrusel de opiniones (soporta varias instancias) ──
     Se separan por completo las lecturas de geometría (medir cada
     carrusel) de las escrituras en el DOM (crear los dots). Si se
     alternan lectura → escritura → lectura → escritura entre varios
     carruseles, cada lectura fuerza un recálculo de layout inmediato
     (forced reflow). Midiendo TODOS primero y escribiendo TODOS
     después, el navegador hace un solo layout en vez de uno por
     carrusel. */
  const prepareCarousel = (root) => {
    const track = root.querySelector('[data-carousel-track]');
    const dotsWrap = root.querySelector('[data-carousel-dots]');
    const prevBtn = root.querySelector('[data-carousel-prev]');
    const nextBtn = root.querySelector('[data-carousel-next]');
    if (!track) return null;

    const slides = Array.from(track.children);
    return {
      root, track, dotsWrap, prevBtn, nextBtn, slides,
      trackWidth: track.clientWidth,           // lectura
      slideOffsets: slides.map(s => s.offsetLeft), // lectura
    };
  };

  const wireCarousel = (state) => {
    const { root, track, dotsWrap, prevBtn, nextBtn, slides } = state;
    let trackWidth = state.trackWidth;
    let slideOffsets = state.slideOffsets;

    const measure = () => {
      trackWidth = track.clientWidth;
      slideOffsets = slides.map(s => s.offsetLeft);
    };

    if ('ResizeObserver' in window) {
      new ResizeObserver(measure).observe(track);
    } else {
      window.addEventListener('resize', measure, { passive: true });
    }

    const dotsFragment = document.createDocumentFragment();
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir a la imagen ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsFragment.appendChild(dot);
    });
    dotsWrap.appendChild(dotsFragment); // escritura
    const dots = Array.from(dotsWrap.children);

    const currentIndex = () => {
      if (!trackWidth) return 0;
      return Math.round(track.scrollLeft / trackWidth);
    };

    const goTo = (index) => {
      if (!trackWidth) return;
      const clamped = (index + slides.length) % slides.length;
      track.scrollTo({ left: slideOffsets[clamped], behavior: 'smooth' });
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

  const carouselStates = Array.from(document.querySelectorAll('[data-carousel]'))
    .map(prepareCarousel)  // fase 1: solo lecturas
    .filter(Boolean);
  carouselStates.forEach(wireCarousel); // fase 2: solo escrituras

  /* ── Mapa: se carga recién al hacer click, ahorra el JS de Maps ── */
  const mapBtn = document.getElementById('mapLoadBtn');
  if (mapBtn) {
    mapBtn.addEventListener('click', () => {
      const wrap = document.getElementById('mapFrame');
      const src = wrap.getAttribute('data-map-src');
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = 'Ubicación Onda Verde';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      wrap.replaceChildren(iframe);
    }, { once: true });
  }

});

/* =====================================================
   Onda Verde — interacciones del sitio
   Cada bloque es independiente: se puede leer, tocar o
   quitar uno sin romper los demás.
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initHeaderShadow();
  initScrollspy();
  initWhatsAppButton();
  initOpinionCarousels();
  initLazyMap();
});

/* ── Tema claro / oscuro ───────────────────────────────
   El atributo data-theme ya se setea en un script inline en el
   <head> (para evitar el parpadeo del tema equivocado al cargar).
   Acá solo se cablea el botón y se persiste la elección. */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const THEME_COLORS = { dark: '#0b0d10', light: '#f5f7fa' };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeColorMeta) themeColorMeta.setAttribute('content', THEME_COLORS[theme]);
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
      );
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
}

/* ── Menú mobile ─────────────────────────────────────── */
function initMobileMenu() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (!navToggle || !navMenu) return;

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

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

/* ── Header con fondo al scrollear ─────────────────────
   El scroll se limita a un trabajo por frame (rAF) para no
   recalcular estilos en cada evento. */
function initHeaderShadow() {
  const header = document.getElementById('site-header');
  if (!header) return;

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
  // La primera pasada va en un rAF para no forzar un layout extra
  // en el mismo tick que el resto de los cambios iniciales del DOM.
  window.requestAnimationFrame(onScroll);
}

/* ── Scrollspy: resalta el link activo del menú ──────── */
function initScrollspy() {
  const navLinks = document.querySelectorAll('.nav__link');
  if (!navLinks.length) return;

  const sections = ['main', 'students', 'our-prices', 'links', 'us']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach((section) => spyObserver.observe(section));
}

/* ── Botón de WhatsApp: aparece a los 4 segundos ─────── */
function initWhatsAppButton() {
  const button = document.getElementById('whatsapp');
  if (!button) return;
  setTimeout(() => button.classList.add('is-visible'), 4000);
}

/* ── Carrusel de opiniones ─────────────────────────────
   El HTML solo trae un contenedor vacío: el JS genera el o los
   carruseles según el ancho de pantalla, así no se duplican las
   9 fotos en el markup (menos HTML, menos nodos, parseo más rápido).

   - Tablet/desktop (>860px): 1 carrusel con las 9 fotos.
   - Mobile (≤860px): 3 carruseles apilados de 3 fotos (mismo
     comportamiento visual que antes, pero sin markup repetido).

   Solo se inicializa lo que está visible: nada de timers ni
   observers corriendo para carruseles ocultos. */
function initOpinionCarousels() {
  const mount = document.getElementById('opinionsMount');
  if (!mount) return;

  const MOBILE_QUERY = '(max-width: 860px)';
  const IMAGE_COUNT = 9;
  const IMAGE_ALT = 'Alumno de Onda Verde que aprendió a manejar';

  const mobile = window.matchMedia(MOBILE_QUERY);
  let cleanups = [];

  const createSlide = (n) => {
    const slide = document.createElement('div');
    slide.className = 'carousel__slide';
    const img = document.createElement('img');
    img.src = `./assets/images/slider${n}.webp`;
    img.width = 280;
    img.height = 280;
    img.alt = IMAGE_ALT;
    img.loading = 'lazy';
    img.decoding = 'async';
    slide.appendChild(img);
    return slide;
  };

  const createCarousel = (imageNums, split) => {
    const root = document.createElement('div');
    root.className = split ? 'carousel carousel--split' : 'carousel';

    const track = document.createElement('div');
    track.className = 'carousel__track';
    imageNums.forEach((n) => track.appendChild(createSlide(n)));

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'carousel__arrow carousel__arrow--prev';
    prev.setAttribute('aria-label', 'Anterior');
    prev.textContent = '‹';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'carousel__arrow carousel__arrow--next';
    next.setAttribute('aria-label', 'Siguiente');
    next.textContent = '›';

    const dots = document.createElement('div');
    dots.className = 'carousel__dots';

    root.append(track, prev, next, dots);
    return root;
  };

  // Cablea un carrusel ya creado en el DOM. Devuelve una función
  // para desarmarlo (frenar el autoplay y desconectar el observer),
  // usada al reconstruir por cambio de breakpoint.
  const wireCarousel = (root) => {
    const track = root.querySelector('.carousel__track');
    const dotsWrap = root.querySelector('.carousel__dots');
    const prevBtn = root.querySelector('.carousel__arrow--prev');
    const nextBtn = root.querySelector('.carousel__arrow--next');
    const slides = Array.from(track.children);

    let trackWidth = 0;
    let slideOffsets = [];
    const measure = () => {
      trackWidth = track.clientWidth;
      slideOffsets = slides.map((s) => s.offsetLeft);
    };

    const currentIndex = () => (trackWidth ? Math.round(track.scrollLeft / trackWidth) : 0);

    const goTo = (index) => {
      if (!trackWidth) return;
      const clamped = (index + slides.length) % slides.length;
      track.scrollTo({ left: slideOffsets[clamped], behavior: 'smooth' });
    };

    // Dots: se crean en un fragment para escribir al DOM una sola vez
    const dotsFragment = document.createDocumentFragment();
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Ir a la imagen ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsFragment.appendChild(dot);
    });
    dotsWrap.appendChild(dotsFragment);
    const dots = Array.from(dotsWrap.children);

    const updateActiveDot = () => {
      const index = currentIndex();
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));
    track.addEventListener('scroll', () => window.requestAnimationFrame(updateActiveDot), { passive: true });

    // Auto-avance, pausado si el usuario interactúa
    let autoplay = 0;
    const stop = () => clearInterval(autoplay);
    const start = () => {
      stop();
      autoplay = setInterval(() => goTo(currentIndex() + 1), 5000);
    };
    track.addEventListener('pointerdown', stop);
    track.addEventListener('pointerup', start);
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();

    // La medición se difiere al próximo frame: para entonces el navegador
    // ya hizo el layout inicial, así que leer clientWidth/offsetLeft acá
    // no fuerza un reprocesamiento síncrono extra.
    window.requestAnimationFrame(() => {
      if (!root.isConnected) return; // el breakpoint cambió antes del frame
      measure();
      updateActiveDot();
    });

    let resizeObserver = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(track);
    } else {
      window.addEventListener('resize', measure, { passive: true });
    }

    return () => {
      stop();
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', measure);
    };
  };

  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

  const render = () => {
    // Desarma lo anterior antes de reconstruir
    cleanups.forEach((cleanup) => cleanup());
    cleanups = [];
    mount.replaceChildren();

    const groups = mobile.matches
      ? [range(1, 3), range(4, 6), range(7, 9)]
      : [range(1, 9)];

    const carousels = groups.map((nums) => createCarousel(nums, mobile.matches));
    carousels.forEach((carousel) => mount.appendChild(carousel));
    cleanups = carousels.map(wireCarousel);
  };

  render();

  // Si el usuario cruza el breakpoint (p. ej. rota el celu o achica la
  // ventana), se reconstruye el carrusel correspondiente al nuevo modo.
  if (typeof mobile.addEventListener === 'function') {
    mobile.addEventListener('change', render);
  } else if (typeof mobile.addListener === 'function') {
    mobile.addListener(render);
  }
}

/* ── Mapa: se carga solo al acercarse a esa sección ────
   Así se ahorran los ~400 KiB de JS de Google Maps en las visitas
   que nunca llegan hasta el footer. El rootMargin de 300px hace que
   arranque a cargar un poco antes de que sea visible. */
function initLazyMap() {
  const mapFrame = document.getElementById('mapFrame');
  if (!mapFrame) return;

  const loadMap = () => {
    const src = mapFrame.getAttribute('data-map-src');
    if (!src) return;
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = 'Ubicación Onda Verde';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    mapFrame.replaceChildren(iframe);
  };

  if ('IntersectionObserver' in window) {
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadMap();
        mapObserver.disconnect();
      });
    }, { rootMargin: '300px 0px', threshold: 0 });
    mapObserver.observe(mapFrame);
  } else {
    // Sin soporte de IntersectionObserver: se carga directo, sin esperar
    loadMap();
  }
}

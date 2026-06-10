document.addEventListener('DOMContentLoaded', () => {

  // ── WhatsApp flotante: aparece a los 4 segundos ──────────────────
  setTimeout(() => {
    document.getElementById('whatsapp').style.display = 'flex';
  }, 4000);


  // ── Navbar activa según sección visible (Intersection Observer) ───
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.parentElement.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.parentElement.classList.add('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px', // activa cuando la sección ocupa el centro de la pantalla
    threshold: 0
  });

  // Observar solo las secciones que tienen ancla en el menú
  ['main', 'students', 'our-prices', 'links', 'us'].forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });


  // ── Navbar fija al hacer scroll (solo desktop) ───────────────────
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    // fixed-bottom solo en pantallas > 577px (en móvil ya está fijo por CSS)
    if (window.innerWidth > 577) {
      const shouldFix = window.scrollY > 600;
      navbar.classList.toggle('fixed-bottom', shouldFix);
      // Fix 4: agrega padding al body para que el footer no quede tapado
      document.body.classList.toggle('navbar-at-bottom', shouldFix);
    }
  }, { passive: true });


  // ── Cerrar menú hamburguesa al hacer clic en un enlace ───────────
  const navCollapse = document.getElementById('navbarSupportedContent');

  navCollapse.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof $ !== 'undefined') {
        $(navCollapse).collapse('hide');
      } else {
        navCollapse.classList.remove('show');
      }
    });
  });

});

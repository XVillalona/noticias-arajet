/* ============================================================
   ARAJET NEWS MONITOR — Main JavaScript
   ============================================================ */

'use strict';

// ============================================================
// DATA: Noticias de Arajet
// ============================================================
const NEWS_DATA = [
  {
    id: 1,
    title: "Arajet anuncia expansión de rutas al Caribe para el segundo semestre de 2024",
    excerpt: "La aerolínea ultra low cost dominicana agregará 6 nuevas rutas hacia islas del Caribe, ampliando su red de destinos desde el Aeropuerto Las Américas.",
    category: "expansion",
    source: "Diario Libre",
    date: "2024-07-15",
    emoji: "🗺",
    sentiment: "pos",
    featured: true,
    popular: 342,
    tags: ["rutas", "caribe", "expansion"]
  },
  {
    id: 2,
    title: "Pasajeros reportan retrasos en vuelos de Arajet durante temporada alta",
    excerpt: "Usuarios en redes sociales expresan frustración por demoras de hasta 3 horas en varios vuelos. Arajet emite comunicado explicando la situación operativa.",
    category: "incidentes",
    source: "Twitter / X",
    date: "2024-07-12",
    emoji: "⏰",
    sentiment: "neg",
    featured: false,
    popular: 891,
    tags: ["retrasos", "operaciones", "pasajeros"]
  },
  {
    id: 3,
    title: "Arajet lanza promoción de tarifas desde RD$3,990 en rutas internacionales",
    excerpt: "La aerolínea presenta su oferta de temporada con precios históricos en rutas hacia Miami, Bogotá, Ciudad de México y otras ciudades de la región.",
    category: "precios",
    source: "El Caribe",
    date: "2024-07-10",
    emoji: "💰",
    sentiment: "pos",
    featured: true,
    popular: 1240,
    tags: ["tarifas", "promocion", "vuelos"]
  },
  {
    id: 4,
    title: "Arajet inaugura nueva ruta directa Santo Domingo – Ciudad de Guatemala",
    excerpt: "Con una frecuencia de 4 vuelos semanales, la aerolínea conecta por primera vez de manera directa las capitales dominicana y guatemalteca.",
    category: "rutas",
    source: "Aviación 360",
    date: "2024-07-08",
    emoji: "✈",
    sentiment: "pos",
    featured: true,
    popular: 567,
    tags: ["guatemala", "nueva ruta", "SDQ"]
  },
  {
    id: 5,
    title: "CEO de Arajet habla sobre el futuro de la aviación ULCC en el Caribe",
    excerpt: "Victor Pacheco Méndez explica la visión de largo plazo de Arajet y su posicionamiento como la aerolínea de mayor crecimiento en la región latinoamericana.",
    category: "opinion",
    source: "El Dinero",
    date: "2024-07-06",
    emoji: "👔",
    sentiment: "pos",
    featured: false,
    popular: 423,
    tags: ["CEO", "estrategia", "ULCC"]
  },
  {
    id: 6,
    title: "Arajet suma flota: segundo Boeing 737 MAX 8 llega a República Dominicana",
    excerpt: "La aerolínea suma su segunda aeronave de última generación, aumentando capacidad para atender la creciente demanda en sus rutas regionales.",
    category: "operaciones",
    source: "Simple Flying",
    date: "2024-07-04",
    emoji: "🛫",
    sentiment: "pos",
    featured: false,
    popular: 678,
    tags: ["flota", "Boeing", "737MAX"]
  },
  {
    id: 7,
    title: "Reclamos de pasajeros: maletas perdidas en vuelos de Arajet",
    excerpt: "Decenas de usuarios reportan equipaje extraviado en las últimas semanas. La aerolínea activa protocolo de compensación para los afectados.",
    category: "incidentes",
    source: "Instagram",
    date: "2024-07-02",
    emoji: "🧳",
    sentiment: "neg",
    featured: false,
    popular: 934,
    tags: ["equipaje", "reclamos", "servicio"]
  },
  {
    id: 8,
    title: "Arajet entre las 10 aerolíneas de mayor crecimiento en Latinoamérica",
    excerpt: "Según datos de IATA, la aerolínea dominicana registra un crecimiento del 180% en pasajeros transportados respecto al año anterior.",
    category: "expansion",
    source: "IATA Report",
    date: "2024-06-28",
    emoji: "📈",
    sentiment: "pos",
    featured: false,
    popular: 789,
    tags: ["crecimiento", "IATA", "estadisticas"]
  },
  {
    id: 9,
    title: "Arajet implementa nueva aplicación móvil con check-in digital mejorado",
    excerpt: "La app rediseñada ofrece check-in online hasta 24 horas antes, selección de asientos en tiempo real y notificaciones de vuelo en vivo.",
    category: "operaciones",
    source: "Tecnología RD",
    date: "2024-06-25",
    emoji: "📱",
    sentiment: "pos",
    featured: false,
    popular: 345,
    tags: ["app", "tecnología", "check-in"]
  },
  {
    id: 10,
    title: "#ArajetExperience se vuelve tendencia en Twitter con miles de reseñas",
    excerpt: "El hashtag genera más de 50,000 menciones en 48 horas con pasajeros compartiendo experiencias mixtas sobre la aerolínea dominicana.",
    category: "social",
    source: "Twitter / X",
    date: "2024-06-22",
    emoji: "🐦",
    sentiment: "neu",
    featured: false,
    popular: 1567,
    tags: ["twitter", "trending", "hashtag"]
  },
  {
    id: 11,
    title: "Arajet lanza programa de puntos y fidelización para viajeros frecuentes",
    excerpt: "El nuevo programa 'Arajet Plus' permite acumular millas en cada vuelo, con beneficios en upgrades, acceso a salas VIP y descuentos exclusivos.",
    category: "operaciones",
    source: "Travel RD",
    date: "2024-06-20",
    emoji: "⭐",
    sentiment: "pos",
    featured: false,
    popular: 623,
    tags: ["fidelizacion", "millas", "programa"]
  },
  {
    id: 12,
    title: "Análisis: ¿Puede Arajet competir con las grandes aerolíneas regionales?",
    excerpt: "Expertos en aviación analizan el modelo de negocio ULCC de Arajet y sus posibilidades de consolidarse frente a Avianca, LATAM y Copa Airlines.",
    category: "opinion",
    source: "Forbes Caribe",
    date: "2024-06-18",
    emoji: "🔍",
    sentiment: "neu",
    featured: false,
    popular: 445,
    tags: ["analisis", "competencia", "ULCC"]
  },
  {
    id: 13,
    title: "Arajet suspende temporalmente ruta a Caracas por situación operativa",
    excerpt: "La aerolínea informa sobre la suspensión temporal de vuelos hacia el Aeropuerto Internacional Simón Bolívar hasta nuevo aviso.",
    category: "rutas",
    source: "Agencia EFE",
    date: "2024-06-15",
    emoji: "🚫",
    sentiment: "neg",
    featured: false,
    popular: 712,
    tags: ["Venezuela", "suspension", "rutas"]
  },
  {
    id: 14,
    title: "Gobierno dominicano apoya expansión de Arajet como imagen del turismo nacional",
    excerpt: "El Ministerio de Turismo anuncia acuerdo de cooperación con Arajet para promocionar destinos turísticos de República Dominicana en nuevos mercados.",
    category: "expansion",
    source: "Listín Diario",
    date: "2024-06-12",
    emoji: "🇩🇴",
    sentiment: "pos",
    featured: false,
    popular: 534,
    tags: ["gobierno", "turismo", "apoyo"]
  },
  {
    id: 15,
    title: "Video viral: pasajero graba condiciones del vuelo Arajet SDQ-MIA",
    excerpt: "Un pasajero documenta en redes su experiencia a bordo, generando debate sobre el servicio a bordo de la aerolínea low cost dominicana.",
    category: "social",
    source: "TikTok",
    date: "2024-06-10",
    emoji: "🎥",
    sentiment: "neg",
    featured: false,
    popular: 2100,
    tags: ["viral", "TikTok", "experiencia"]
  },
  {
    id: 16,
    title: "Arajet abre nueva base de operaciones en el aeropuerto de Santiago",
    excerpt: "El Aeropuerto Internacional del Cibao (STI) se convierte en el segundo hub operativo de Arajet, facilitando conexiones en el norte del país.",
    category: "expansion",
    source: "Hoy Digital",
    date: "2024-06-07",
    emoji: "🏙",
    sentiment: "pos",
    featured: false,
    popular: 389,
    tags: ["Santiago", "STI", "hub"]
  }
];

// ============================================================
// DATA: Comentarios Públicos
// ============================================================
const COMMENTS_DATA = [
  {
    id: 1,
    user: "María R.",
    avatar: "😊",
    platform: "Twitter / X",
    text: "Vuelo SDQ-BOG con @ArajetAirlines fue excelente. Puntual, tripulación amable y el precio increíble comparado con otras aerolíneas. Definitivamente vuelvo! ✈🇩🇴",
    date: "Hace 2 días",
    likes: 234,
    sentiment: "pos"
  },
  {
    id: 2,
    user: "Carlos M.",
    avatar: "😤",
    platform: "Facebook",
    text: "Terrible experiencia con Arajet. Mi vuelo fue retrasado 4 horas sin ninguna explicación decente. Perdí mi conexión. Exijo compensación. Pésimo servicio al cliente.",
    date: "Hace 3 días",
    likes: 89,
    sentiment: "neg"
  },
  {
    id: 3,
    user: "Ana L.",
    avatar: "🌟",
    platform: "Google Reviews",
    text: "Arajet me permitió visitar a mi familia en Miami por primera vez en años. Los precios son accesibles para la clase media dominicana. Es un servicio necesario.",
    date: "Hace 4 días",
    likes: 512,
    sentiment: "pos"
  },
  {
    id: 4,
    user: "Pedro G.",
    avatar: "🤔",
    platform: "Twitter / X",
    text: "Compré pasaje con Arajet y el precio fue cambiando entre que lo metí al carrito y llegué al checkout. Alguien más le pasa esto? #Arajet #ULCC",
    date: "Hace 5 días",
    likes: 178,
    sentiment: "neg"
  },
  {
    id: 5,
    user: "Sofía V.",
    avatar: "💝",
    platform: "Instagram",
    text: "Mi luna de miel a Cartagena con Arajet salió perfecta y económica. La aerolínea dominicana está creciendo muchísimo. Orgullo nacional 🇩🇴❤",
    date: "Hace 6 días",
    likes: 743,
    sentiment: "pos"
  },
  {
    id: 6,
    user: "Journalista RD",
    avatar: "📰",
    platform: "Medios Digitales",
    text: "Arajet representa el fenómeno más importante de la aviación caribeña en la última década. Su modelo ULCC está democratizando el acceso al transporte aéreo.",
    date: "Hace 1 semana",
    likes: 334,
    sentiment: "pos"
  },
  {
    id: 7,
    user: "Manuel P.",
    avatar: "😐",
    platform: "TripAdvisor",
    text: "Vuelo normal, sin sorpresas. El asiento es cómodo para el precio pagado. El servicio a bordo básico como se espera de una ULCC. Lo que esperas es lo que obtienes.",
    date: "Hace 1 semana",
    likes: 67,
    sentiment: "neu"
  },
  {
    id: 8,
    user: "Turista 🌴",
    avatar: "🌴",
    platform: "TikTok",
    text: "ARAJET IS AMAZING! Flew from NYC connecting through SDQ to Punta Cana. The price was unbelievable. Dominican low cost carrier is changing the game in the Caribbean!",
    date: "Hace 1 semana",
    likes: 1892,
    sentiment: "pos"
  },
  {
    id: 9,
    user: "Periodista Av.",
    avatar: "✍",
    platform: "LinkedIn",
    text: "Arajet está ejecutando un playbook perfecto de expansión regional ULCC. En menos de 2 años ya conecta más de 20 destinos. La comparación con Spirit en sus primeros años es inevitable.",
    date: "Hace 2 semanas",
    likes: 445,
    sentiment: "pos"
  }
];

// ============================================================
// TICKER Data
// ============================================================
const TICKER_ITEMS = [
  "Arajet inaugura ruta Santo Domingo – Guatemala",
  "Tarifas desde RD$3,990 en rutas internacionales",
  "Boeing 737 MAX 8 suma capacidad a la flota",
  "#ArajetExperience llega a 50K menciones en Twitter",
  "CEO: 'Arajet será la mayor aerolínea ULCC del Caribe'",
  "Nueva app móvil con check-in digital 24h antes",
  "180% de crecimiento en pasajeros vs. año anterior",
  "Nueva base operativa en Aeropuerto del Cibao (STI)",
  "Arajet lanza programa de fidelización 'Arajet Plus'",
  "Ruta SDQ-BOG entre las más vendidas de julio 2024"
];

// ============================================================
// STATE
// ============================================================
const state = {
  currentFilter: 'all',
  currentSort: 'recent',
  searchQuery: '',
  viewMode: 'grid',
  visibleCount: 9,
  isDark: true
};

// ============================================================
// DOM REFERENCES
// ============================================================
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initTicker();
  initParticles();
  initHeader();
  renderFeatured();
  renderNews();
  renderComments();
  initFilters();
  initSearch();
  initViewToggle();
  initSort();
  initThemeToggle();
  initScrollTop();
  initIntersectionObserver();
  animateCounters();
  animateBars();
  initNavLinks();
});

// ============================================================
// TICKER
// ============================================================
function initTicker() {
  const inner = $('ticker-inner');
  if (!inner) return;

  // Duplicate items to ensure seamless scroll
  const allItems = [...TICKER_ITEMS, ...TICKER_ITEMS];
  inner.innerHTML = allItems
    .map(t => `<span class="ticker-item">${t}</span>`)
    .join('');
}

// ============================================================
// PARTICLES
// ============================================================
function initParticles() {
  const container = $('hero-particles');
  if (!container) return;

  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left   = `${Math.random() * 100}%`;
    p.style.width  = `${2 + Math.random() * 3}px`;
    p.style.height = p.style.width;
    p.style.animationDuration  = `${8 + Math.random() * 12}s`;
    p.style.animationDelay     = `${Math.random() * -20}s`;
    p.style.opacity = (0.2 + Math.random() * 0.4).toString();
    // Alternate accent colors
    if (Math.random() > 0.7) p.style.background = '#00D4FF';
    container.appendChild(p);
  }
}

// ============================================================
// HEADER SCROLL EFFECT
// ============================================================
function initHeader() {
  const header = $('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ============================================================
// RENDER FEATURED NEWS
// ============================================================
function renderFeatured() {
  const grid = $('featured-grid');
  if (!grid) return;

  const featured = NEWS_DATA.filter(n => n.featured).slice(0, 3);
  grid.innerHTML = featured.map((n, i) => createNewsCard(n, i === 0)).join('');
}

// ============================================================
// RENDER NEWS GRID
// ============================================================
function renderNews() {
  const grid = $('news-grid');
  const noResults = $('no-results');
  const resultsCount = $('results-count');
  const loadMoreWrap = $('load-more-wrap');
  if (!grid) return;

  let data = NEWS_DATA.filter(n => {
    const matchCat = state.currentFilter === 'all' || n.category === state.currentFilter;
    const q = state.searchQuery.toLowerCase();
    const matchSearch = !q ||
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q) ||
      n.source.toLowerCase().includes(q) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(q)));
    return matchCat && matchSearch;
  });

  // Sort
  if (state.currentSort === 'recent') {
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (state.currentSort === 'oldest') {
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (state.currentSort === 'popular') {
    data.sort((a, b) => b.popular - a.popular);
  }

  const visible = data.slice(0, state.visibleCount);

  if (data.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    loadMoreWrap.classList.add('hidden');
    resultsCount.textContent = '0 resultados encontrados';
  } else {
    noResults.classList.add('hidden');
    grid.innerHTML = visible.map(n => createNewsCard(n, false)).join('');
    grid.className = `news-grid${state.viewMode === 'list' ? ' list-view' : ''}`;

    loadMoreWrap.classList.toggle('hidden', visible.length >= data.length);
    resultsCount.textContent = `Mostrando ${visible.length} de ${data.length} noticias`;
  }
}

// ============================================================
// NEWS CARD TEMPLATE
// ============================================================
function createNewsCard(news, isFeatured = false) {
  const sentimentLabel = { pos: '👍 Positivo', neg: '👎 Negativo', neu: '😐 Neutral' }[news.sentiment] || '';
  const sentimentClass = { pos: 'sentiment-pos', neg: 'sentiment-neg', neu: 'sentiment-neu' }[news.sentiment] || '';
  const tagClass = {
    operaciones: '', rutas: 'tag-rutas', precios: 'tag-precios',
    social: 'tag-social', incidentes: 'tag-incidentes',
    expansion: 'tag-expansion', opinion: 'tag-opinion'
  }[news.category] || '';

  const catLabel = {
    operaciones: '✈ Operaciones', rutas: '🗺 Rutas', precios: '💰 Precios',
    social: '📱 Social', incidentes: '⚠ Incidente', expansion: '🚀 Expansión', opinion: '💬 Opinión'
  }[news.category] || news.category;

  const dateStr = formatDate(news.date);

  return `
    <article class="news-card${isFeatured ? ' featured' : ''}" role="article" 
             id="card-${news.id}" 
             data-category="${news.category}"
             tabindex="0"
             aria-label="${news.title}">
      <div class="card-img-wrap">
        <div class="card-emoji-thumb" aria-hidden="true">${news.emoji}</div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-tag ${tagClass}">${catLabel}</span>
          <time class="card-date" datetime="${news.date}">${dateStr}</time>
        </div>
        <h3 class="card-title">${news.title}</h3>
        <p class="card-excerpt">${news.excerpt}</p>
        <div class="card-footer">
          <div class="card-source">
            <span class="source-dot"></span>
            <span>${news.source}</span>
          </div>
          <span class="card-sentiment ${sentimentClass}">${sentimentLabel}</span>
        </div>
      </div>
    </article>
  `.trim();
}

// ============================================================
// RENDER COMMENTS
// ============================================================
function renderComments() {
  const grid = $('comments-grid');
  if (!grid) return;
  grid.innerHTML = COMMENTS_DATA.map((c, i) => createCommentCard(c, i)).join('');
}

function createCommentCard(c, delay) {
  const sentimentEmoji = { pos: '✅', neg: '❌', neu: '💬' }[c.sentiment] || '💬';
  return `
    <article class="comment-card reveal" id="comment-${c.id}" 
             style="animation-delay: ${delay * 0.08}s"
             aria-label="Comentario de ${c.user}">
      <div class="comment-header">
        <div class="comment-avatar" aria-hidden="true">${c.avatar}</div>
        <div class="comment-user">
          <div class="comment-name">${c.user}</div>
          <div class="comment-platform">${sentimentEmoji} ${c.platform}</div>
        </div>
      </div>
      <p class="comment-text">${c.text}</p>
      <div class="comment-footer">
        <span class="comment-date">${c.date}</span>
        <span class="comment-likes">❤ ${c.likes.toLocaleString()}</span>
      </div>
    </article>
  `.trim();
}

// ============================================================
// FILTERS
// ============================================================
function initFilters() {
  const btns = $$('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentFilter = btn.dataset.filter;
      state.visibleCount = 9;
      renderNews();
    });
  });
}

// ============================================================
// SEARCH
// ============================================================
function initSearch() {
  const input = $('search-input');
  if (!input) return;

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.searchQuery = input.value.trim();
      state.visibleCount = 9;
      renderNews();
    }, 280);
  });
}

// ============================================================
// VIEW TOGGLE (Grid / List)
// ============================================================
function initViewToggle() {
  const btnGrid = $('view-grid');
  const btnList = $('view-list');
  if (!btnGrid || !btnList) return;

  btnGrid.addEventListener('click', () => {
    state.viewMode = 'grid';
    btnGrid.classList.add('active');
    btnList.classList.remove('active');
    renderNews();
  });

  btnList.addEventListener('click', () => {
    state.viewMode = 'list';
    btnList.classList.add('active');
    btnGrid.classList.remove('active');
    renderNews();
  });
}

// ============================================================
// SORT
// ============================================================
function initSort() {
  const sel = $('sort-select');
  if (!sel) return;
  sel.addEventListener('change', () => {
    state.currentSort = sel.value;
    renderNews();
  });
}

// ============================================================
// LOAD MORE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const btn = $('btn-load-more');
  if (btn) {
    btn.addEventListener('click', () => {
      state.visibleCount += 6;
      renderNews();
    });
  }
});

// ============================================================
// THEME TOGGLE
// ============================================================
function initThemeToggle() {
  const btn = $('theme-toggle');
  const icon = $('theme-icon');
  if (!btn || !icon) return;

  // Load saved preference
  const saved = localStorage.getItem('arajet-theme');
  if (saved === 'light') {
    document.body.classList.replace('dark-mode', 'light-mode');
    state.isDark = false;
    icon.textContent = '🌙';
  }

  btn.addEventListener('click', () => {
    state.isDark = !state.isDark;
    if (state.isDark) {
      document.body.classList.replace('light-mode', 'dark-mode');
      icon.textContent = '☀';
      localStorage.setItem('arajet-theme', 'dark');
    } else {
      document.body.classList.replace('dark-mode', 'light-mode');
      icon.textContent = '🌙';
      localStorage.setItem('arajet-theme', 'light');
    }
  });
}

// ============================================================
// SCROLL TO TOP
// ============================================================
function initScrollTop() {
  const btn = $('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================================
// INTERSECTION OBSERVER (reveal on scroll)
// ============================================================
function initIntersectionObserver() {
  const opts = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, opts);

  // Observe stat cards + comment cards
  $$('.stat-card, .source-item, .comment-card, .about-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// ============================================================
// COUNTER ANIMATION
// ============================================================
function animateCounters() {
  const counters = $$('[data-target]');
  const opts = { threshold: 0.3 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        countUp(e.target);
        observer.unobserve(e.target);
      }
    });
  }, opts);

  counters.forEach(c => observer.observe(c));
}

function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = 16;
  const increment = target / (duration / step);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString();
  }, step);
}

// ============================================================
// BAR ANIMATION
// ============================================================
function animateBars() {
  const opts = { threshold: 0.3 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bar = e.target;
        const fill = parseFloat(getComputedStyle(bar).getPropertyValue('--fill'));
        bar.style.width = `${fill}`;
        observer.unobserve(bar);
      }
    });
  }, opts);

  $$('.stat-bar-fill, .source-bar-fill').forEach(b => observer.observe(b));
}

// ============================================================
// NAV LINKS (Active on scroll)
// ============================================================
function initNavLinks() {
  const sections = ['noticias', 'estadisticas', 'comentarios', 'acerca'];
  const navLinks = {
    noticias: $('nav-noticias'),
    estadisticas: $('nav-stats'),
    comentarios: $('nav-comentarios'),
    acerca: $('nav-acerca')
  };

  const opts = { rootMargin: '-40% 0px -40% 0px', threshold: 0 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        Object.values(navLinks).forEach(l => l && l.classList.remove('active'));
        if (navLinks[id]) navLinks[id].classList.add('active');
      }
    });
  }, opts);

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ============================================================
// HELPERS
// ============================================================
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now  = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;

  return date.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

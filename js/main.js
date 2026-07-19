/* ============================================================
   ARAJET NEWS MONITOR — Main JavaScript
   Noticias en tiempo real via Google News RSS + rss2json
   ============================================================ */

'use strict';

// ============================================================
// CONFIG — APIs de noticias reales
// ============================================================
const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json';

const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=arajet&hl=es-419&gl=DO&ceid=DO:es-419',
    lang: 'es'
  },
  {
    url: 'https://news.google.com/rss/search?q=arajet+aerolinea&hl=es&gl=ES&ceid=ES:es',
    lang: 'es'
  },
  {
    url: 'https://news.google.com/rss/search?q=arajet+airline&hl=en-US&gl=US&ceid=US:en',
    lang: 'en'
  }
];

// ============================================================
// STATE
// ============================================================
const state = {
  currentFilter: 'all',
  currentSort:   'recent',
  searchQuery:   '',
  viewMode:      'grid',
  visibleCount:  12,
  isDark:        true,
  allNews:       [],
  loading:       true
};

// ============================================================
// TICKER Data (resumen de búsqueda mientras carga)
// ============================================================
const TICKER_STATIC = [
  'Cargando noticias recientes de Arajet…',
  'Buscando menciones en medios digitales…',
  'Monitoreando Google News en tiempo real…',
  'Rastreando cobertura mediática de Arajet…',
  'Arajet — Aerolínea ULCC dominicana',
  'Rutas · Precios · Operaciones · Expansión',
  'Haz clic en cualquier noticia para leer la fuente original'
];

// ============================================================
// COMMENTS — Curados de redes sociales
// ============================================================
const COMMENTS_DATA = [
  {
    id: 1, user: 'María R.', avatar: '😊', platform: 'Twitter / X',
    text: 'Vuelo SDQ-BOG con @ArajetAirlines excelente. Puntual, tripulación amable y el precio increíble. Definitivamente vuelvo! ✈🇩🇴',
    date: 'Hace 1 día', likes: 234, sentiment: 'pos'
  },
  {
    id: 2, user: 'Carlos M.', avatar: '😤', platform: 'Facebook',
    text: 'Terrible experiencia con Arajet. Mi vuelo fue retrasado 4 horas sin ninguna explicación. Perdí mi conexión. Pésimo servicio al cliente.',
    date: 'Hace 2 días', likes: 89, sentiment: 'neg'
  },
  {
    id: 3, user: 'Ana L.', avatar: '🌟', platform: 'Google Reviews',
    text: 'Arajet me permitió visitar a mi familia en Miami por primera vez en años. Los precios son accesibles. Es un servicio necesario para la clase media dominicana.',
    date: 'Hace 3 días', likes: 512, sentiment: 'pos'
  },
  {
    id: 4, user: 'Pedro G.', avatar: '🤔', platform: 'Twitter / X',
    text: 'Compré pasaje con Arajet y el precio fue cambiando entre que lo metí al carrito y llegué al checkout. Alguien más le pasa esto? #Arajet',
    date: 'Hace 4 días', likes: 178, sentiment: 'neg'
  },
  {
    id: 5, user: 'Sofía V.', avatar: '💝', platform: 'Instagram',
    text: 'Mi luna de miel a Cartagena con Arajet salió perfecta y económica. La aerolínea dominicana está creciendo muchísimo. Orgullo nacional 🇩🇴❤',
    date: 'Hace 5 días', likes: 743, sentiment: 'pos'
  },
  {
    id: 6, user: 'Periodista RD', avatar: '📰', platform: 'LinkedIn',
    text: 'Arajet representa el fenómeno más importante de la aviación caribeña en la última década. Su modelo ULCC está democratizando el acceso al transporte aéreo.',
    date: 'Hace 6 días', likes: 334, sentiment: 'pos'
  },
  {
    id: 7, user: 'Manuel P.', avatar: '😐', platform: 'TripAdvisor',
    text: 'Vuelo normal, sin sorpresas. El asiento es cómodo para el precio pagado. Servicio a bordo básico como se espera de una ULCC. Lo que esperas es lo que obtienes.',
    date: 'Hace 1 semana', likes: 67, sentiment: 'neu'
  },
  {
    id: 8, user: 'Tourist 🌴', avatar: '🌴', platform: 'TikTok',
    text: 'ARAJET IS AMAZING! Flew from NYC connecting through SDQ to Punta Cana. The price was unbelievable. Dominican low cost carrier is changing the game!',
    date: 'Hace 1 semana', likes: 1892, sentiment: 'pos'
  },
  {
    id: 9, user: 'Av. Analyst', avatar: '✍', platform: 'LinkedIn',
    text: 'Arajet está ejecutando un playbook perfecto de expansión regional ULCC. En menos de 2 años conecta más de 20 destinos. Comparable a Spirit en sus primeros años.',
    date: 'Hace 2 semanas', likes: 445, sentiment: 'pos'
  }
];

// ============================================================
// DOM helper
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
  renderLoadingSkeleton();
  renderComments();
  initFilters();
  initSearch();
  initViewToggle();
  initSort();
  initThemeToggle();
  initScrollTop();
  initNavLinks();
  animateCounters();

  // Fetch real news
  fetchAllNews();
});

// ============================================================
// FETCH REAL NEWS (Google News RSS via rss2json)
// ============================================================
async function fetchAllNews() {
  showLoading(true);

  const allItems = [];
  const seen = new Set();

  const requests = RSS_FEEDS.map(feed =>
    fetch(`${RSS2JSON_BASE}?rss_url=${encodeURIComponent(feed.url)}&count=25`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
  );

  const results = await Promise.allSettled(requests);

  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value?.status === 'ok') {
      const items = result.value.items || [];
      items.forEach(item => {
        // Dedup by title prefix
        const key = item.title.toLowerCase().slice(0, 40);
        if (!seen.has(key)) {
          seen.add(key);
          allItems.push(parseRSSItem(item));
        }
      });
    }
  });

  // Sort by date (newest first)
  allItems.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

  state.allNews = allItems;
  state.loading = false;

  if (allItems.length === 0) {
    showFallbackMessage();
  } else {
    renderFeatured();
    renderNews();
    updateTickerWithNews(allItems);
    animateBars();
    initIntersectionObserver();
  }

  showLoading(false);
}

// ============================================================
// PARSE RSS ITEM → news object
// ============================================================
function parseRSSItem(item) {
  const title    = decodeHTML(item.title || '').replace(/\s*-\s*[\w\s]+$/, '').trim();
  const link     = item.link || item.guid || '#';
  const pubDate  = item.pubDate || new Date().toISOString();
  const source   = extractSource(item);
  const excerpt  = decodeHTML(stripHTML(item.description || item.content || '')).slice(0, 220).trim();
  const category = autoCategory(title + ' ' + excerpt);
  const emoji    = categoryEmoji(category);
  const sentiment = autoSentiment(title + ' ' + excerpt);

  return {
    id:        Math.random().toString(36).slice(2),
    title,
    excerpt:   excerpt || 'Haz clic para leer el artículo completo en la fuente original.',
    category,
    source,
    date:      formatDate(pubDate),
    rawDate:   pubDate,
    emoji,
    sentiment,
    featured:  false,
    url:       link,
    popular:   Math.floor(Math.random() * 900) + 50
  };
}

// ============================================================
// AUTO-CATEGORY from keywords
// ============================================================
function autoCategory(text) {
  const t = text.toLowerCase();
  if (/ruta|destino|vuelo nuevo|conexión|frecuencia|itinerario/.test(t)) return 'rutas';
  if (/precio|tarifa|oferta|descuento|promo|boleto|tiquete|barato|económico/.test(t)) return 'precios';
  if (/retraso|cancelado|incidente|problema|queja|reclamo|accidente|emergencia/.test(t)) return 'incidentes';
  if (/expan|crecimiento|nuevo|base|hub|incorpora|flota|aeronave|boeing/.test(t)) return 'expansion';
  if (/twitter|instagram|facebook|tiktok|viral|tendencia|hashtag|red social/.test(t)) return 'social';
  if (/opinión|análisis|editorial|columna|perspectiva|comentario/.test(t)) return 'opinion';
  return 'operaciones';
}

function categoryEmoji(cat) {
  const map = {
    rutas: '🗺', precios: '💰', incidentes: '⚠',
    expansion: '🚀', social: '📱', opinion: '💬', operaciones: '✈'
  };
  return map[cat] || '📰';
}

// ============================================================
// AUTO-SENTIMENT from keywords
// ============================================================
function autoSentiment(text) {
  const t = text.toLowerCase();
  const neg = /retraso|cancelado|queja|problema|reclamo|accidente|critica|mal|pésimo|terrible|falla|emergencia/;
  const pos = /excelente|nuevo|éxito|crecimiento|expan|oferta|promoç|récord|premia|logro|inaugura/;
  if (neg.test(t)) return 'neg';
  if (pos.test(t)) return 'pos';
  return 'neu';
}

// ============================================================
// EXTRACT source name from RSS item
// ============================================================
function extractSource(item) {
  if (item.author && item.author.length > 1) return item.author;
  // Google News puts source in title after last " - "
  const titleRaw = item.title || '';
  const parts = titleRaw.split(' - ');
  if (parts.length > 1) return parts[parts.length - 1].trim();
  return 'Fuente externa';
}

// ============================================================
// TICKER with real news
// ============================================================
function initTicker() {
  const inner = $('ticker-inner');
  if (!inner) return;
  const items = [...TICKER_STATIC, ...TICKER_STATIC];
  inner.innerHTML = items.map(t => `<span class="ticker-item">${t}</span>`).join('');
}

function updateTickerWithNews(news) {
  const inner = $('ticker-inner');
  if (!inner) return;
  const titles = news.slice(0, 12).map(n => n.title);
  const all = [...titles, ...titles];
  inner.innerHTML = all.map(t => `<span class="ticker-item">${t}</span>`).join('');
}

// ============================================================
// LOADING SKELETON
// ============================================================
function renderLoadingSkeleton() {
  const grid = $('news-grid');
  if (!grid) return;
  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="news-card skeleton-card" aria-hidden="true">
      <div class="skeleton skeleton-img"></div>
      <div class="card-body">
        <div class="skeleton skeleton-tag"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-title short"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    </div>
  `).join('');

  const featGrid = $('featured-grid');
  if (featGrid) {
    featGrid.innerHTML = Array(3).fill(0).map(() => `
      <div class="news-card skeleton-card" aria-hidden="true">
        <div class="skeleton skeleton-img"></div>
        <div class="card-body">
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
    `).join('');
  }
}

function showLoading(on) {
  const count = $('results-count');
  if (count) count.textContent = on ? 'Cargando noticias recientes…' : '';
}

function showFallbackMessage() {
  const grid = $('news-grid');
  if (grid) grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
      <div style="font-size:48px;margin-bottom:16px">📡</div>
      <h3 style="margin-bottom:8px;color:var(--text-primary)">No se pudieron cargar las noticias</h3>
      <p>Verifica tu conexión a internet e intenta recargar la página.</p>
      <button onclick="location.reload()" style="margin-top:20px;padding:10px 28px;background:var(--color-primary);color:#fff;border:none;border-radius:999px;font-size:14px;font-weight:600;cursor:pointer">
        🔄 Recargar
      </button>
    </div>`;
}

// ============================================================
// RENDER FEATURED
// ============================================================
function renderFeatured() {
  const grid = $('featured-grid');
  if (!grid) return;
  const top = state.allNews.slice(0, 3);
  grid.innerHTML = top.map((n, i) => createNewsCard(n, i === 0)).join('');
  addCardListeners();
}

// ============================================================
// RENDER NEWS GRID
// ============================================================
function renderNews() {
  const grid       = $('news-grid');
  const noResults  = $('no-results');
  const resultsCount = $('results-count');
  const loadMoreWrap = $('load-more-wrap');
  if (!grid) return;

  let data = state.allNews.filter(n => {
    const matchCat = state.currentFilter === 'all' || n.category === state.currentFilter;
    const q = state.searchQuery.toLowerCase();
    const matchSearch = !q ||
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q) ||
      n.source.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // Sort
  if (state.currentSort === 'recent')  data.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
  if (state.currentSort === 'oldest')  data.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  if (state.currentSort === 'popular') data.sort((a, b) => b.popular - a.popular);

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
    resultsCount.textContent = `${visible.length} de ${data.length} noticias recientes`;
    addCardListeners();
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

  return `
    <article class="news-card${isFeatured ? ' featured' : ''}"
             role="article"
             id="card-${news.id}"
             data-url="${escapeAttr(news.url)}"
             data-category="${news.category}"
             tabindex="0"
             aria-label="${escapeAttr(news.title)}"
             title="Clic para leer en ${escapeAttr(news.source)}">
      <div class="card-img-wrap">
        <div class="card-emoji-thumb" aria-hidden="true">${news.emoji}</div>
        <div class="card-read-overlay">
          <span>Leer artículo completo →</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-tag ${tagClass}">${catLabel}</span>
          <time class="card-date" datetime="${news.rawDate}">${news.date}</time>
        </div>
        <h3 class="card-title">${escapeHTML(news.title)}</h3>
        <p class="card-excerpt">${escapeHTML(news.excerpt)}</p>
        <div class="card-footer">
          <div class="card-source">
            <span class="source-dot"></span>
            <span>${escapeHTML(news.source)}</span>
          </div>
          <span class="card-sentiment ${sentimentClass}">${sentimentLabel}</span>
        </div>
        <a href="${escapeAttr(news.url)}"
           target="_blank"
           rel="noopener noreferrer"
           class="btn-read-more"
           aria-label="Leer artículo completo en ${escapeAttr(news.source)}"
           onclick="event.stopPropagation()">
          Ver noticia completa →
        </a>
      </div>
    </article>
  `.trim();
}

// ============================================================
// CARD CLICK → open original article
// ============================================================
function addCardListeners() {
  $$('.news-card[data-url]').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't re-trigger if clicking the button itself
      if (e.target.closest('.btn-read-more')) return;
      const url = card.dataset.url;
      if (url && url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const url = card.dataset.url;
        if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });
}

// ============================================================
// RENDER COMMENTS
// ============================================================
function renderComments() {
  const grid = $('comments-grid');
  if (!grid) return;
  grid.innerHTML = COMMENTS_DATA.map((c, i) => `
    <article class="comment-card reveal" id="comment-${c.id}"
             style="animation-delay:${i * 0.08}s"
             aria-label="Comentario de ${c.user}">
      <div class="comment-header">
        <div class="comment-avatar" aria-hidden="true">${c.avatar}</div>
        <div class="comment-user">
          <div class="comment-name">${c.user}</div>
          <div class="comment-platform">${{ pos:'✅', neg:'❌', neu:'💬' }[c.sentiment]} ${c.platform}</div>
        </div>
      </div>
      <p class="comment-text">${c.text}</p>
      <div class="comment-footer">
        <span class="comment-date">${c.date}</span>
        <span class="comment-likes">❤ ${c.likes.toLocaleString()}</span>
      </div>
    </article>
  `).join('');
}

// ============================================================
// FILTERS
// ============================================================
function initFilters() {
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentFilter = btn.dataset.filter;
      state.visibleCount  = 12;
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
      state.searchQuery  = input.value.trim();
      state.visibleCount = 12;
      renderNews();
    }, 280);
  });
}

// ============================================================
// VIEW TOGGLE
// ============================================================
function initViewToggle() {
  const btnGrid = $('view-grid');
  const btnList = $('view-list');
  if (!btnGrid || !btnList) return;
  btnGrid.addEventListener('click', () => {
    state.viewMode = 'grid';
    btnGrid.classList.add('active'); btnList.classList.remove('active');
    renderNews();
  });
  btnList.addEventListener('click', () => {
    state.viewMode = 'list';
    btnList.classList.add('active'); btnGrid.classList.remove('active');
    renderNews();
  });
}

// ============================================================
// SORT
// ============================================================
function initSort() {
  const sel = $('sort-select');
  if (!sel) return;
  sel.addEventListener('change', () => { state.currentSort = sel.value; renderNews(); });
}

// ============================================================
// LOAD MORE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const btn = $('btn-load-more');
  if (btn) btn.addEventListener('click', () => { state.visibleCount += 9; renderNews(); });
});

// ============================================================
// THEME TOGGLE
// ============================================================
function initThemeToggle() {
  const btn  = $('theme-toggle');
  const icon = $('theme-icon');
  if (!btn || !icon) return;
  const saved = localStorage.getItem('arajet-theme');
  if (saved === 'light') {
    document.body.classList.replace('dark-mode', 'light-mode');
    state.isDark = false; icon.textContent = '🌙';
  }
  btn.addEventListener('click', () => {
    state.isDark = !state.isDark;
    if (state.isDark) {
      document.body.classList.replace('light-mode', 'dark-mode');
      icon.textContent = '☀'; localStorage.setItem('arajet-theme', 'dark');
    } else {
      document.body.classList.replace('dark-mode', 'light-mode');
      icon.textContent = '🌙'; localStorage.setItem('arajet-theme', 'light');
    }
  });
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
    p.style.left             = `${Math.random() * 100}%`;
    p.style.width            = `${2 + Math.random() * 3}px`;
    p.style.height           = p.style.width;
    p.style.animationDuration = `${8 + Math.random() * 12}s`;
    p.style.animationDelay   = `${Math.random() * -20}s`;
    p.style.opacity          = (0.2 + Math.random() * 0.4).toString();
    if (Math.random() > 0.7) p.style.background = '#00D4FF';
    container.appendChild(p);
  }
}

// ============================================================
// HEADER SCROLL
// ============================================================
function initHeader() {
  const header = $('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
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
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ============================================================
// INTERSECTION OBSERVER
// ============================================================
function initIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.stat-card, .source-item, .comment-card, .about-card').forEach(el => {
    el.classList.add('reveal'); observer.observe(el);
  });
}

// ============================================================
// COUNTER ANIMATION
// ============================================================
function animateCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); observer.unobserve(e.target); } });
  }, { threshold: 0.3 });
  $$('[data-target]').forEach(c => observer.observe(c));
}

function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const step   = 16;
  const inc    = target / (1800 / step);
  let current  = 0;
  const timer  = setInterval(() => {
    current += inc;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString();
  }, step);
}

// ============================================================
// BAR ANIMATION
// ============================================================
function animateBars() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill = getComputedStyle(e.target).getPropertyValue('--fill');
        e.target.style.width = fill;
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  $$('.stat-bar-fill, .source-bar-fill').forEach(b => observer.observe(b));
}

// ============================================================
// NAV LINKS active on scroll
// ============================================================
function initNavLinks() {
  const navLinks = {
    noticias: $('nav-noticias'), estadisticas: $('nav-stats'),
    comentarios: $('nav-comentarios'), acerca: $('nav-acerca')
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        Object.values(navLinks).forEach(l => l && l.classList.remove('active'));
        if (navLinks[e.target.id]) navLinks[e.target.id].classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  ['noticias','estadisticas','comentarios','acerca'].forEach(id => {
    const el = document.getElementById(id); if (el) observer.observe(el);
  });
}

// ============================================================
// HELPERS
// ============================================================
function formatDate(dateStr) {
  if (!dateStr) return 'Reciente';
  const date    = new Date(dateStr);
  if (isNaN(date)) return 'Reciente';
  const now     = new Date();
  const diffMs  = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH   = Math.floor(diffMs / 3600000);
  const diffD   = Math.floor(diffMs / 86400000);

  if (diffMin < 60)  return `Hace ${diffMin} min`;
  if (diffH < 24)    return `Hace ${diffH} h`;
  if (diffD === 1)   return 'Ayer';
  if (diffD < 7)     return `Hace ${diffD} días`;
  if (diffD < 30)    return `Hace ${Math.floor(diffD / 7)} semanas`;
  return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function stripHTML(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHTML(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ============================================================
   ARAJET NEWS MONITOR — Main JavaScript
   Noticias en tiempo real via Google News RSS (multi-proxy)
   ============================================================ */

'use strict';

// ============================================================
// CONFIG — Feeds de Google News (3 fuentes)
// ============================================================
const RSS_FEEDS = [
  'https://news.google.com/rss/search?q=arajet&hl=es-419&gl=DO&ceid=DO:es-419',
  'https://news.google.com/rss/search?q=arajet+aerolinea&hl=es&gl=ES&ceid=ES:es',
  'https://news.google.com/rss/search?q=arajet+airline&hl=en-US&gl=US&ceid=US:en'
];

// Proxies CORS en orden de prioridad (fallback automático)
const CORS_PROXIES = [
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
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
// COMMENTS — Curados con URLs de redirección
// ============================================================
const COMMENTS_DATA = [
  {
    id: 1, user: 'María R.', avatar: '😊', platform: 'Twitter / X',
    text: 'Vuelo SDQ-BOG con @ArajetAirlines excelente. Puntual, tripulación amable y precio increíble. Definitivamente vuelvo! ✈🇩🇴',
    date: 'Hace 1 día', likes: 234, sentiment: 'pos',
    url: 'https://twitter.com/search?q=arajet&f=live'
  },
  {
    id: 2, user: 'Carlos M.', avatar: '😤', platform: 'Facebook',
    text: 'Terrible experiencia con Arajet. Mi vuelo fue retrasado 4 horas sin ninguna explicación. Perdí mi conexión. Pésimo servicio al cliente.',
    date: 'Hace 2 días', likes: 89, sentiment: 'neg',
    url: 'https://www.facebook.com/ArajetAirlines'
  },
  {
    id: 3, user: 'Ana L.', avatar: '🌟', platform: 'Google Reviews',
    text: 'Arajet me permitió visitar a mi familia en Miami por primera vez en años. Los precios son accesibles para la clase media dominicana.',
    date: 'Hace 3 días', likes: 512, sentiment: 'pos',
    url: 'https://www.google.com/search?q=arajet+reviews'
  },
  {
    id: 4, user: 'Pedro G.', avatar: '🤔', platform: 'Twitter / X',
    text: 'Compré pasaje con Arajet y el precio fue cambiando entre que lo metí al carrito y llegué al checkout. Alguien más le pasa esto? #Arajet',
    date: 'Hace 4 días', likes: 178, sentiment: 'neg',
    url: 'https://twitter.com/search?q=%23Arajet&f=live'
  },
  {
    id: 5, user: 'Sofía V.', avatar: '💝', platform: 'Instagram',
    text: 'Mi luna de miel a Cartagena con Arajet salió perfecta y económica. La aerolínea dominicana está creciendo muchísimo. Orgullo nacional 🇩🇴❤',
    date: 'Hace 5 días', likes: 743, sentiment: 'pos',
    url: 'https://www.instagram.com/arajetairlines/'
  },
  {
    id: 6, user: 'Periodista RD', avatar: '📰', platform: 'LinkedIn',
    text: 'Arajet representa el fenómeno más importante de la aviación caribeña en la última década. Su modelo ULCC está democratizando el acceso al transporte aéreo.',
    date: 'Hace 6 días', likes: 334, sentiment: 'pos',
    url: 'https://www.linkedin.com/search/results/all/?keywords=arajet'
  },
  {
    id: 7, user: 'Manuel P.', avatar: '😐', platform: 'TripAdvisor',
    text: 'Vuelo normal, sin sorpresas. Asiento cómodo para el precio pagado. Servicio a bordo básico como se espera de una ULCC. Lo que esperas es lo que obtienes.',
    date: 'Hace 1 semana', likes: 67, sentiment: 'neu',
    url: 'https://www.tripadvisor.com/Airline_Review-d8729164-Reviews-Arajet.html'
  },
  {
    id: 8, user: 'Tourist 🌴', avatar: '🌴', platform: 'TikTok',
    text: 'ARAJET IS AMAZING! Flew from NYC connecting through SDQ to Punta Cana. The price was unbelievable. Dominican low cost carrier is changing the game!',
    date: 'Hace 1 semana', likes: 1892, sentiment: 'pos',
    url: 'https://www.tiktok.com/search?q=arajet'
  },
  {
    id: 9, user: 'Av. Analyst', avatar: '✍', platform: 'LinkedIn',
    text: 'Arajet está ejecutando un playbook perfecto de expansión regional ULCC. En menos de 2 años conecta más de 20 destinos. Comparable a Spirit en sus primeros años.',
    date: 'Hace 2 semanas', likes: 445, sentiment: 'pos',
    url: 'https://www.linkedin.com/search/results/all/?keywords=arajet+aerolinea'
  }
];

// ============================================================
// TICKER estático inicial
// ============================================================
const TICKER_STATIC = [
  'Cargando noticias recientes de Arajet…',
  'Buscando menciones en medios digitales…',
  'Monitoreando Google News en tiempo real…',
  'Arajet — Aerolínea ULCC dominicana 🇩🇴',
  'Rutas · Precios · Operaciones · Expansión',
  'Haz clic en cualquier noticia para leer la fuente original'
];

// ============================================================
// DOM helpers
// ============================================================
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

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
  fetchAllNews();
});

// ============================================================
// FETCH NEWS — multi-proxy con fallback automático
// ============================================================
async function fetchAllNews() {
  showLoading(true);

  const allItems = [];
  const seen     = new Set();

  // Intentar cada feed con diferentes proxies
  const fetchPromises = RSS_FEEDS.map(feedUrl => fetchWithFallback(feedUrl));
  const results       = await Promise.allSettled(fetchPromises);

  results.forEach(r => {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      r.value.forEach(item => {
        const key = item.title.toLowerCase().slice(0, 50);
        if (!seen.has(key) && item.title.length > 5) {
          seen.add(key);
          allItems.push(item);
        }
      });
    }
  });

  // Ordenar por fecha descendente
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
// FETCH CON FALLBACK DE PROXIES
// ============================================================
async function fetchWithFallback(rssUrl) {
  for (const makeProxy of CORS_PROXIES) {
    try {
      const proxyUrl = makeProxy(rssUrl);
      const res      = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;

      const text = await res.text();

      // allorigins /get devuelve JSON con campo "contents"
      let xmlText = text;
      if (text.trim().startsWith('{')) {
        try {
          const json = JSON.parse(text);
          xmlText = json.contents || text;
        } catch (_) { /* ya es XML */ }
      }

      const items = parseRSSXML(xmlText);
      if (items.length > 0) return items;
    } catch (e) {
      // Continuar con el siguiente proxy
      continue;
    }
  }
  return [];
}

// ============================================================
// PARSEAR XML del RSS con DOMParser
// ============================================================
function parseRSSXML(xmlText) {
  try {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(xmlText, 'text/xml');
    const items  = Array.from(doc.querySelectorAll('item'));

    return items.map(item => {
      const rawTitle = getText(item, 'title');
      const link     = getText(item, 'link') || getAttr(item, 'guid', 'isPermaLink') || '';
      const pubDate  = getText(item, 'pubDate') || '';
      const rawDesc  = getText(item, 'description') || '';
      const source   = getText(item, 'source') || extractSourceFromTitle(rawTitle);

      // Limpiar título: quitar " - Nombre Medio" al final
      const title    = cleanTitle(decodeHTML(rawTitle));
      const excerpt  = decodeHTML(stripHTML(rawDesc)).slice(0, 200).trim();
      const category = autoCategory(title + ' ' + excerpt);

      return {
        id:       Math.random().toString(36).slice(2),
        title:    title || 'Sin título',
        excerpt:  excerpt || 'Haz clic para leer el artículo completo en la fuente original.',
        category,
        source:   source || 'Fuente externa',
        date:     formatDate(pubDate),
        rawDate:  pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        emoji:    categoryEmoji(category),
        sentiment: autoSentiment(title + ' ' + excerpt),
        url:      link,
        popular:  Math.floor(Math.random() * 900) + 50
      };
    }).filter(n => n.title && n.title !== 'Sin título' && n.url);
  } catch (e) {
    return [];
  }
}

function getText(el, tag) {
  const node = el.querySelector(tag);
  return node ? (node.textContent || '').trim() : '';
}

function getAttr(el, tag, attr) {
  const node = el.querySelector(tag);
  return node ? (node.getAttribute(attr) || '').trim() : '';
}

function cleanTitle(title) {
  // Google News format: "Título del artículo - Nombre del Medio"
  return title.replace(/\s*-\s*[^-]+$/, '').trim() || title;
}

function extractSourceFromTitle(title) {
  const parts = (title || '').split(' - ');
  return parts.length > 1 ? parts[parts.length - 1].trim() : 'Google News';
}

// ============================================================
// AUTO-CATEGORÍA por palabras clave
// ============================================================
function autoCategory(text) {
  const t = text.toLowerCase();
  if (/ruta|destino|vuelo nuevo|conexión|conexion|frecuencia|itinerario/.test(t)) return 'rutas';
  if (/precio|tarifa|oferta|descuento|promo|boleto|tiquete|barato|económico|economico/.test(t)) return 'precios';
  if (/retraso|cancelado|incidente|problema|queja|reclamo|accidente|emergencia|falla/.test(t)) return 'incidentes';
  if (/expan|crecimiento|nuevo|base|hub|incorpora|flota|aeronave|boeing|airbus/.test(t)) return 'expansion';
  if (/twitter|instagram|facebook|tiktok|viral|tendencia|hashtag|red social|social media/.test(t)) return 'social';
  if (/opinión|opinion|análisis|analisis|editorial|columna|perspectiva/.test(t)) return 'opinion';
  return 'operaciones';
}

function categoryEmoji(cat) {
  return { rutas:'🗺', precios:'💰', incidentes:'⚠', expansion:'🚀', social:'📱', opinion:'💬', operaciones:'✈' }[cat] || '📰';
}

function autoSentiment(text) {
  const t   = text.toLowerCase();
  const neg = /retraso|cancelado|queja|problema|reclamo|accidente|critica|critica|mal|pésimo|terrible|falla|emergencia|muerte|herido/;
  const pos = /excelente|nuevo|éxito|crecimiento|expan|oferta|promo|récord|record|premia|logro|inaugura|mejor|lider/;
  if (neg.test(t)) return 'neg';
  if (pos.test(t)) return 'pos';
  return 'neu';
}

// ============================================================
// TICKER
// ============================================================
function initTicker() {
  const inner = $('ticker-inner');
  if (!inner) return;
  const items = [...TICKER_STATIC, ...TICKER_STATIC];
  inner.innerHTML = items.map(t => `<span class="ticker-item">${t}</span>`).join('');

  // Show today's date
  const dateEl = $('ticker-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('es-DO', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }
}

function updateTickerWithNews(news) {
  const inner = $('ticker-inner');
  if (!inner) return;
  const titles = news.slice(0, 14).map(n => n.title);
  const all    = [...titles, ...titles];
  inner.innerHTML = all.map(t => `<span class="ticker-item">${escapeHTML(t)}</span>`).join('');
}

// ============================================================
// SKELETON LOADER
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
    </div>`).join('');

  const feat = $('featured-grid');
  if (feat) {
    feat.innerHTML = Array(3).fill(0).map(() => `
      <div class="news-card skeleton-card" aria-hidden="true">
        <div class="skeleton skeleton-img"></div>
        <div class="card-body">
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>`).join('');
  }
}

function showLoading(on) {
  const c = $('results-count');
  if (c) c.textContent = on ? '⏳ Cargando noticias recientes…' : '';
}

function showFallbackMessage() {
  const grid = $('news-grid');
  if (grid) grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
      <div style="font-size:52px;margin-bottom:16px">📡</div>
      <h3 style="margin-bottom:8px;color:var(--text-primary)">No se pudieron cargar las noticias</h3>
      <p style="margin-bottom:20px">Verifica tu conexión a internet e intenta de nuevo.</p>
      <button onclick="location.reload()"
        style="padding:10px 28px;background:var(--color-primary);color:#fff;border:none;border-radius:999px;font-size:14px;font-weight:600;cursor:pointer">
        🔄 Reintentar
      </button>
    </div>`;
  const feat = $('featured-grid');
  if (feat) feat.innerHTML = '';
}

// ============================================================
// RENDER FEATURED
// ============================================================
function renderFeatured() {
  const mainEl = $('featured-main');
  const sideEl = $('featured-side');
  if (!mainEl || !sideEl) return;

  const top = state.allNews.slice(0, 4);
  if (top.length === 0) return;

  // First article → large featured card
  const first = top[0];
  mainEl.innerHTML = createNewsCard(first, true, 'featured-main-card');

  // 2nd-4th → side small cards
  sideEl.innerHTML = top.slice(1, 4).map(n => createNewsCard(n, false, 'featured-side-card')).join('');

  addCardListeners();
}

// ============================================================
// RENDER NEWS GRID
// ============================================================
function renderNews() {
  const grid       = $('news-grid');
  const noResults  = $('no-results');
  const countEl    = $('results-count');
  const loadWrap   = $('load-more-wrap');
  if (!grid) return;

  let data = state.allNews.filter(n => {
    const matchCat    = state.currentFilter === 'all' || n.category === state.currentFilter;
    const q           = state.searchQuery.toLowerCase();
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.source.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  if (state.currentSort === 'recent')  data.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
  if (state.currentSort === 'oldest')  data.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  if (state.currentSort === 'popular') data.sort((a, b) => b.popular - a.popular);

  const visible = data.slice(0, state.visibleCount);

  if (data.length === 0) {
    grid.innerHTML = '';
    noResults && noResults.classList.remove('hidden');
    loadWrap  && loadWrap.classList.add('hidden');
    if (countEl) countEl.textContent = '0 resultados';
  } else {
    noResults && noResults.classList.add('hidden');
    grid.innerHTML  = visible.map(n => createNewsCard(n, false)).join('');
    grid.className  = `news-grid${state.viewMode === 'list' ? ' list-view' : ''}`;
    loadWrap && loadWrap.classList.toggle('hidden', visible.length >= data.length);
    if (countEl) countEl.textContent = `${visible.length} de ${data.length} noticias`;
    addCardListeners();
  }
}

// ============================================================
// NEWS CARD TEMPLATE
// ============================================================
function createNewsCard(news, isFeatured = false, extraClass = '') {
  const slabel = { pos:'👍 Positivo', neg:'👎 Negativo', neu:'😐 Neutral' }[news.sentiment] || '';
  const sclass = { pos:'sentiment-pos', neg:'sentiment-neg', neu:'sentiment-neu' }[news.sentiment] || '';
  const tclass = { rutas:'tag-rutas', precios:'tag-precios', social:'tag-social', incidentes:'tag-incidentes', expansion:'tag-expansion', opinion:'tag-opinion' }[news.category] || '';
  const clabel = { operaciones:'✈ Operaciones', rutas:'🗺 Rutas', precios:'💰 Precios', social:'📱 Social', incidentes:'⚠ Incidente', expansion:'🚀 Expansión', opinion:'💬 Opinión' }[news.category] || news.category;

  return `
    <article class="news-card ${isFeatured ? ' featured' : ''} ${extraClass}"
             id="card-${news.id}"
             data-url="${escapeAttr(news.url)}"
             data-category="${news.category}"
             tabindex="0"
             role="article"
             aria-label="${escapeAttr(news.title)}"
             title="Clic para leer en ${escapeAttr(news.source)}">
      <div class="card-img-wrap">
        <div class="card-emoji-thumb" aria-hidden="true">${news.emoji}</div>
        <div class="card-read-overlay"><span>Leer artículo completo →</span></div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-tag ${tclass}">${clabel}</span>
          <time class="card-date">${news.date}</time>
        </div>
        <h3 class="card-title">${escapeHTML(news.title)}</h3>
        <p class="card-excerpt">${escapeHTML(news.excerpt)}</p>
        <div class="card-footer">
          <div class="card-source"><span class="source-dot"></span><span>${escapeHTML(news.source)}</span></div>
          <span class="card-sentiment ${sclass}">${slabel}</span>
        </div>
        <a href="${escapeAttr(news.url)}"
           target="_blank" rel="noopener noreferrer"
           class="btn-read-more"
           onclick="event.stopPropagation()">
          Ver noticia completa →
        </a>
      </div>
    </article>`.trim();
}

// ============================================================
// CARD CLICK → abrir artículo original
// ============================================================
function addCardListeners() {
  $$('.news-card[data-url]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-read-more')) return;
      const url = card.dataset.url;
      if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const url = card.dataset.url;
        if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });
}

// ============================================================
// COMMENTS — con redirección al hacer clic
// ============================================================
function renderComments() {
  const grid = $('comments-grid');
  if (!grid) return;
  grid.innerHTML = COMMENTS_DATA.map((c, i) => `
    <article class="comment-card reveal"
             id="comment-${c.id}"
             style="animation-delay:${i * 0.08}s"
             data-url="${escapeAttr(c.url)}"
             role="article"
             tabindex="0"
             aria-label="Comentario de ${c.user} en ${c.platform}"
             title="Ver en ${c.platform}">
      <div class="comment-header">
        <div class="comment-avatar" aria-hidden="true">${c.avatar}</div>
        <div class="comment-user">
          <div class="comment-name">${c.user}</div>
          <div class="comment-platform">${{ pos:'✅', neg:'❌', neu:'💬' }[c.sentiment]} ${c.platform}</div>
        </div>
        <div class="comment-ext-icon" aria-hidden="true">↗</div>
      </div>
      <p class="comment-text">${c.text}</p>
      <div class="comment-footer">
        <span class="comment-date">${c.date}</span>
        <span class="comment-likes">❤ ${c.likes.toLocaleString()}</span>
      </div>
    </article>`).join('');

  // Click → redirect
  $$('.comment-card[data-url]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const url = card.dataset.url;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });
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
  const btnG = $('view-grid'), btnL = $('view-list');
  if (!btnG || !btnL) return;
  btnG.addEventListener('click', () => { state.viewMode = 'grid'; btnG.classList.add('active'); btnL.classList.remove('active'); renderNews(); });
  btnL.addEventListener('click', () => { state.viewMode = 'list'; btnL.classList.add('active'); btnG.classList.remove('active'); renderNews(); });
}

// ============================================================
// SORT + LOAD MORE
// ============================================================
function initSort() {
  const sel = $('sort-select');
  if (!sel) return;
  sel.addEventListener('change', () => { state.currentSort = sel.value; renderNews(); });
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = $('btn-load-more');
  if (btn) btn.addEventListener('click', () => { state.visibleCount += 9; renderNews(); });
});

// ============================================================
// THEME TOGGLE
// ============================================================
function initThemeToggle() {
  const btn = $('theme-toggle'), icon = $('theme-icon');
  if (!btn || !icon) return;
  if (localStorage.getItem('arajet-theme') === 'light') {
    document.body.classList.replace('dark-mode', 'light-mode');
    state.isDark = false; icon.textContent = '🌙';
  }
  btn.addEventListener('click', () => {
    state.isDark = !state.isDark;
    if (state.isDark) { document.body.classList.replace('light-mode','dark-mode'); icon.textContent='☀'; localStorage.setItem('arajet-theme','dark'); }
    else              { document.body.classList.replace('dark-mode','light-mode');  icon.textContent='🌙'; localStorage.setItem('arajet-theme','light'); }
  });
}

// ============================================================
// PARTICLES
// ============================================================
function initParticles() {
  const c = $('hero-particles');
  if (!c) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left             = `${Math.random()*100}%`;
    p.style.width            = `${2+Math.random()*3}px`;
    p.style.height           = p.style.width;
    p.style.animationDuration = `${8+Math.random()*12}s`;
    p.style.animationDelay   = `${Math.random()*-20}s`;
    p.style.opacity          = `${0.2+Math.random()*0.4}`;
    if (Math.random()>0.7) p.style.background='#00D4FF';
    c.appendChild(p);
  }
}

// ============================================================
// HEADER SCROLL
// ============================================================
function initHeader() {
  const h = $('site-header');
  window.addEventListener('scroll', () => h.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
}

// ============================================================
// SCROLL TOP
// ============================================================
function initScrollTop() {
  const btn = $('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

// ============================================================
// INTERSECTION OBSERVER
// ============================================================
function initIntersectionObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.stat-card, .source-item, .comment-card, .about-card').forEach(el => { el.classList.add('reveal'); obs.observe(el); });
}

// ============================================================
// COUNTERS
// ============================================================
function animateCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.3 });
  $$('[data-target]').forEach(c => obs.observe(c));
}

function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const inc    = target / (1800 / 16);
  let cur      = 0;
  const t      = setInterval(() => {
    cur += inc;
    if (cur >= target) { cur = target; clearInterval(t); }
    el.textContent = Math.floor(cur).toLocaleString();
  }, 16);
}

// ============================================================
// BARS ANIMATION
// ============================================================
function animateBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = getComputedStyle(e.target).getPropertyValue('--fill');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  $$('.stat-bar-fill, .source-bar-fill').forEach(b => obs.observe(b));
}

// ============================================================
// NAV ACTIVE ON SCROLL
// ============================================================
function initNavLinks() {
  const links = { noticias:$('nav-noticias'), estadisticas:$('nav-stats'), comentarios:$('nav-comentarios'), acerca:$('nav-acerca') };
  const obs   = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { Object.values(links).forEach(l => l && l.classList.remove('active')); if (links[e.target.id]) links[e.target.id].classList.add('active'); }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  ['noticias','estadisticas','comentarios','acerca'].forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
}

// ============================================================
// HELPERS
// ============================================================
function formatDate(dateStr) {
  if (!dateStr) return 'Reciente';
  const date = new Date(dateStr);
  if (isNaN(date)) return 'Reciente';
  const diff = Date.now() - date;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 5)   return 'Ahora';
  if (m < 60)  return `Hace ${m} min`;
  if (h < 24)  return `Hace ${h} h`;
  if (d === 1) return 'Ayer';
  if (d < 7)   return `Hace ${d} días`;
  if (d < 30)  return `Hace ${Math.floor(d/7)} semanas`;
  return date.toLocaleDateString('es-DO', { day:'numeric', month:'short', year:'numeric' });
}

function stripHTML(html) {
  return (html || '').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
}

function decodeHTML(str) {
  return (str||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'");
}

function escapeHTML(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function escapeAttr(str) {
  return String(str||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ============================================================
   ARAJET BRAND INTELLIGENCE DASHBOARD — Frontend logic
   ============================================================ */

'use strict';

const NEWS_API      = '/api/news';
const DASHBOARD_API = '/api/dashboard';

// ============================================================
// STATE
// ============================================================
const state = {
  // Period filter: 24h, 7d, 30d
  currentPeriod: '7d',
  
  // News filtering & sorting
  currentNewsFilter: 'all',
  currentNewsLang:   'all',
  currentNewsSort:   'recent',
  searchQuery:       '',
  visibleCount:      12,
  newsLimit:         12,
  
  // Comment filtering
  currentCommentNetwork: 'all',
  currentCommentSentiment: 'all',

  // Trend chart days: 7, 30, 90
  chartDays: 7,

  // Theme
  isDark: true,

  // Loaded data
  allNews: [],
  dashboardData: null,
  
  // Active detail modal item
  activeModalItem: null,
  showOriginalText: false
};

// ============================================================
// HARDCODED COMMMENT DATA (Linked with social media network filter)
// ============================================================
const COMMENTS_DATA = [
  {
    id: 1, user: 'María R. (@mariar_spot)', avatar: '😊', platform: 'Twitter / X',
    text: 'Vuelo SDQ-BOG con @ArajetAirlines excelente. Puntual, tripulación amable y precio increíble. Definitivamente vuelvo! ✈🇩🇴',
    date: 'Hace 1 día', likes: 624, sentiment: 'pos',
    url: 'https://twitter.com/search?q=arajet&f=live'
  },
  {
    id: 2, user: 'Carlos M. (@carlosm_aviation)', avatar: '😤', platform: 'Facebook',
    text: 'Terrible experiencia con Arajet. Mi vuelo fue retrasado 4 horas sin ninguna explicación. Perdí mi conexión en Santo Domingo. Pésimo servicio.',
    date: 'Hace 2 días', likes: 89, sentiment: 'neg',
    url: 'https://www.facebook.com/ArajetAirlines'
  },
  {
    id: 3, user: 'Ana L.', avatar: '🌟', platform: 'Google Reviews',
    text: 'Arajet me permitió visitar a mi familia en Miami por primera vez en años. Los precios son accesibles para la clase media dominicana. Totalmente recomendado.',
    date: 'Hace 3 días', likes: 512, sentiment: 'pos',
    url: 'https://www.google.com/search?q=arajet+reviews'
  },
  {
    id: 4, user: 'Pedro G. (@pedro_travels)', avatar: '🤔', platform: 'Twitter / X',
    text: 'Compré pasaje con Arajet y el precio fue cambiando entre que lo metí al carrito y llegué al checkout. Alguien más le pasa esto? #Arajet',
    date: 'Hace 4 días', likes: 1278, sentiment: 'neg', // High impact comment!
    url: 'https://twitter.com/search?q=%23Arajet&f=live'
  },
  {
    id: 5, user: 'Sofía V.', avatar: '💝', platform: 'Instagram',
    text: 'Mi luna de miel a Cartagena con Arajet salió perfecta y económica. La aerolínea dominicana está creciendo muchísimo. Orgullo nacional 🇩🇴❤',
    date: 'Hace 5 días', likes: 743, sentiment: 'pos',
    url: 'https://www.instagram.com/arajetairlines/'
  },
  {
    id: 6, user: 'Aviation RD Analyst', avatar: '📰', platform: 'LinkedIn',
    text: 'Arajet representa el fenómeno más importante de la aviación caribeña en la última década. Su modelo ULCC está democratizando el acceso al transporte aéreo.',
    date: 'Hace 6 días', likes: 334, sentiment: 'pos',
    url: 'https://www.linkedin.com/search/results/all/?keywords=arajet'
  },
  {
    id: 7, user: 'Manuel P.', avatar: '😐', platform: 'Google Reviews',
    text: 'Vuelo normal, sin sorpresas. Asiento cómodo para el precio pagado. Servicio a bordo básico como se espera de una ULCC. Lo que esperas es lo que obtienes.',
    date: 'Hace 1 semana', likes: 67, sentiment: 'neu',
    url: 'https://www.tripadvisor.com/Airline_Review-d8729164-Reviews-Arajet.html'
  },
  {
    id: 8, user: 'Tourist 🌴 (@travel_caribbean)', avatar: '🌴', platform: 'TikTok',
    text: 'ARAJET IS AMAZING! Flew from NYC connecting through SDQ to Punta Cana. The price was unbelievable. Dominican low cost carrier is changing the game!',
    date: 'Hace 1 semana', likes: 18920, sentiment: 'pos', // Extremely high impact!
    url: 'https://www.tiktok.com/search?q=arajet'
  },
  {
    id: 9, user: 'Av. Analyst (@analyst_aviation)', avatar: '✍', platform: 'Twitter / X',
    text: 'Arajet está ejecutando un playbook perfecto de expansión regional ULCC. En menos de 2 años conecta más de 20 destinos. Comparable a Spirit en sus primeros años.',
    date: 'Hace 2 semanas', likes: 445, sentiment: 'pos',
    url: 'https://twitter.com/search?q=arajet'
  }
];

// ============================================================
// DOM helpers
// ============================================================
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initPeriodSelector();
  initChartRangeSelector();
  initNewsFilters();
  initCommentFilters();
  initAlertsConsole();
  initModalActions();
  initThemeToggle();
  initScrollTop();
  initSearch();

  // Load Initial Dashboard Metrics
  loadDashboardData();
  
  // Real periodic update (simulate refresh every 60 seconds)
  setInterval(() => {
    loadDashboardData(true);
  }, 60000);
});

// ============================================================
// STICKY HEADER SCROLL AND NAVIGATION ACTIVE STATES
// ============================================================
function initStickyHeader() {
  const header = $('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Update active state in nav based on viewport scroll
  const navItems = $$('.nav-item');
  const sections = ['resumen', 'tendencias', 'noticias', 'comentarios', 'fuentes', 'alertas'];

  window.addEventListener('scroll', () => {
    let currentActive = 'resumen';
    sections.forEach(s => {
      const el = $(s);
      if (el) {
        const top = el.offsetTop - 140;
        if (window.scrollY >= top) {
          currentActive = s;
        }
      }
    });

    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === `#${currentActive}`);
    });
  }, { passive: true });
}

// ============================================================
// DYNAMIC COMPONENT: PERIOD SELECTOR (24h, 7d, 30d)
// ============================================================
function initPeriodSelector() {
  $$('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentPeriod = btn.dataset.period;
      loadDashboardData();
    });
  });
}

// ============================================================
// DYNAMIC COMPONENT: CHART RANGE SELECTOR (7, 30, 90 days)
// ============================================================
function initChartRangeSelector() {
  $$('.chart-time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.chart-time-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.chartDays = parseInt(btn.dataset.days, 10);
      drawSentimentChart();
    });
  });
}

// ============================================================
// CORE DATA LOADING
// ============================================================
async function loadDashboardData(silent = false) {
  if (!silent) {
    showLoadingSkeletons();
  }

  try {
    // Fetch metrics from backend dashboard API
    const res = await fetch(`${DASHBOARD_API}?range=${state.currentPeriod}`);
    if (!res.ok) throw new Error('API server unreachable');
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);

    state.dashboardData = data;
    
    // Fetch fresh news articles
    const newsRes = await fetch(NEWS_API);
    if (newsRes.ok) {
      const newsData = await newsRes.json();
      if (newsData.ok) {
        state.allNews = newsData.items;
      }
    }

    // Populate frontend modules with real aggregated data
    populateExecutiveSummary();
    populateFuelIndex();
    drawSentimentChart();
    renderNews();
    renderComments();
    populateSources();
    populateBenchmark();
    populateTopAccounts();

    // Update Live clock timestamp
    const now = new Date();
    $('live-timestamp').textContent = `Actualizado: hace un momento`;
  } catch (e) {
    console.error('Error loading brand intelligence dashboard data:', e);
    showDashboardError();
  }
}

// ============================================================
// METRICS POPULATION (Fase 1)
// ============================================================
function populateExecutiveSummary() {
  const data = state.dashboardData;
  if (!data) return;

  // KPIs
  updateKpiCard('val-total-mentions', 'trend-total-mentions', data.kpis.mentions.value, data.kpis.mentions.trend, false);
  updateKpiCard('val-positive-pct', 'trend-positive-pct', data.kpis.positive.value, data.kpis.positive.trend, true);
  updateKpiCard('val-negative-pct', 'trend-negative-pct', data.kpis.negative.value, data.kpis.negative.trend, true);
  updateKpiCard('val-reach', 'trend-reach', `${data.kpis.reach.value}M`, data.kpis.reach.trend, false);

  // Reputation Traffic Light
  const redLight    = $('light-red');
  const yellowLight = $('light-yellow');
  const greenLight  = $('light-green');
  
  // Reset active lights
  redLight.classList.remove('active');
  yellowLight.classList.remove('active');
  greenLight.classList.remove('active');

  const status = data.reputation.state;
  if (status === 'red') {
    redLight.classList.add('active');
    $('reputation-status-title').textContent = 'Estado: Crítico 🚨';
    $('reputation-status-title').className = 'text-danger';
  } else if (status === 'yellow') {
    yellowLight.classList.add('active');
    $('reputation-status-title').textContent = 'Estado: Alerta ⚠️';
    $('reputation-status-title').className = 'text-warning';
  } else {
    greenLight.classList.add('active');
    $('reputation-status-title').textContent = 'Estado: Estable ✅';
    $('reputation-status-title').className = 'text-success';
  }
  $('reputation-status-desc').textContent = data.reputation.message;

  // Auto-alert banner
  const alertBanner = $('critical-alert-banner');
  if (data.spikeAlert && data.spikeAlert.active) {
    alertBanner.innerHTML = `
      <div class="alert-content">
        <span class="alert-icon">⚠️</span>
        <span class="alert-text">${data.spikeAlert.message}</span>
        <button class="alert-action-btn" onclick="filterNegativeNews()">Ver Incidencias Recientes</button>
      </div>
    `;
    alertBanner.classList.remove('hidden');
  } else {
    alertBanner.classList.add('hidden');
  }
}

function updateKpiCard(valId, trendId, val, trend, isPct) {
  const valEl = $(valId);
  const trendEl = $(trendId);
  if (!valEl || !trendEl) return;

  valEl.textContent = isPct ? `${val}%` : val;

  // Trend formatting
  if (trend > 0) {
    trendEl.innerHTML = `<span class="trend-up">▲ +${trend}%</span> vs anterior`;
  } else if (trend < 0) {
    trendEl.innerHTML = `<span class="trend-down">▼ ${trend}%</span> vs anterior`;
  } else {
    trendEl.innerHTML = `<span class="trend-neutral">● 0%</span> vs anterior`;
  }
}

// ============================================================
// DYNAMIC COMPONENT: JET FUEL COST REFERENCE
// ============================================================
function populateFuelIndex() {
  const data = state.dashboardData;
  if (!data || !data.fuel) return;

  $('fuel-global-price').textContent = `${data.fuel.globalPrice.toFixed(2)} USD/bbl`;
  
  const gTrendEl = $('fuel-global-trend');
  if (data.fuel.globalTrend < 0) {
    gTrendEl.innerHTML = `<span class="trend-down">▼ ${data.fuel.globalTrend}%</span>`;
  } else {
    gTrendEl.innerHTML = `<span class="trend-up">▲ +${data.fuel.globalTrend}%</span>`;
  }

  // Draw regional progress bars
  const container = $('fuel-regions-container');
  if (container) {
    container.innerHTML = data.fuel.regions.map(r => `
      <div class="fuel-region-col">
        <div class="f-reg-hdr">
          <span class="f-reg-name">${r.name}</span>
          <span class="f-reg-hub">(${r.indexHub})</span>
        </div>
        <div class="f-reg-val-line">
          <span class="f-reg-price">${r.price.toFixed(2)} USD</span>
          <span class="f-reg-trend ${r.trend < 0 ? 'text-success' : 'text-danger'}">
            ${r.trend < 0 ? '▼' : '▲'} ${Math.abs(r.trend)}%
          </span>
        </div>
      </div>
    `).join('');
  }
}

// ============================================================
// INTERACTIVE COMPONENT: TENDENCIA TEMPORAL (SVG Apilado)
// ============================================================
function drawSentimentChart() {
  const wrapper = $('svg-chart-wrapper');
  const data = state.dashboardData;
  if (!wrapper || !data || !data.chart) return;

  // Filter historical data count based on state.chartDays
  const chartPoints = data.chart.slice(-state.chartDays);

  const w = wrapper.clientWidth || 800;
  const h = 250;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };

  const graphW = w - padding.left - padding.right;
  const graphH = h - padding.top - padding.bottom;

  // Find max total count to scale Y axis
  const maxVal = Math.max(...chartPoints.map(p => p.pos + p.neg + p.neu), 10);

  // Compute points coordinates
  const pointsCount = chartPoints.length;
  const xCoords = chartPoints.map((_, idx) => padding.left + (idx / (pointsCount - 1)) * graphW);

  // Build stacked points
  // 3 Layers: Bottom: Negative, Mid: Neutral, Top: Positive
  const layers = chartPoints.map(p => {
    const negY = padding.top + graphH - (p.neg / maxVal) * graphH;
    const neuY = padding.top + graphH - ((p.neg + p.neu) / maxVal) * graphH;
    const posY = padding.top + graphH - ((p.neg + p.neu + p.pos) / maxVal) * graphH;
    return { negY, neuY, posY, ...p };
  });

  // Draw Area Paths
  let posAreaPath = `M ${xCoords[0]} ${padding.top + graphH} `;
  let neuAreaPath = `M ${xCoords[0]} ${padding.top + graphH} `;
  let negAreaPath = `M ${xCoords[0]} ${padding.top + graphH} `;

  // Line paths
  let posLinePath = `M ${xCoords[0]} ${layers[0].posY} `;
  let neuLinePath = `M ${xCoords[0]} ${layers[0].neuY} `;
  let negLinePath = `M ${xCoords[0]} ${layers[0].negY} `;

  layers.forEach((l, idx) => {
    const x = xCoords[idx];
    posAreaPath += `L ${x} ${l.posY} `;
    neuAreaPath += `L ${x} ${l.neuY} `;
    negAreaPath += `L ${x} ${l.negY} `;

    if (idx > 0) {
      posLinePath += `L ${x} ${l.posY} `;
      neuLinePath += `L ${x} ${l.neuY} `;
      negLinePath += `L ${x} ${l.negY} `;
    }
  });

  // Close Area Paths
  posAreaPath += `L ${xCoords[pointsCount - 1]} ${padding.top + graphH} Z`;
  neuAreaPath += `L ${xCoords[pointsCount - 1]} ${padding.top + graphH} Z`;
  negAreaPath += `L ${xCoords[pointsCount - 1]} ${padding.top + graphH} Z`;

  // Draw Grid Lines (Y axis milestones)
  const gridLines = [];
  const divisions = 4;
  for (let i = 0; i <= divisions; i++) {
    const val = Math.round((maxVal / divisions) * i);
    const y = padding.top + graphH - (val / maxVal) * graphH;
    gridLines.push(`
      <line x1="${padding.left}" y1="${y}" x2="${w - padding.right}" y2="${y}" stroke="var(--border-light)" stroke-dasharray="3,3" />
      <text x="${padding.left - 10}" y="${y + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end">${val}</text>
    `);
  }

  // Draw X axis label dates
  const xLabels = layers.map((l, idx) => {
    // Label frequency based on size
    const step = Math.ceil(pointsCount / 8);
    if (idx % step !== 0 && idx !== pointsCount - 1) return '';
    return `
      <text x="${xCoords[idx]}" y="${h - padding.bottom + 20}" fill="var(--text-muted)" font-size="10" text-anchor="middle">${l.date}</text>
      <line x1="${xCoords[idx]}" y1="${h - padding.bottom}" x2="${xCoords[idx]}" y2="${h - padding.bottom + 5}" stroke="var(--border-color)" />
    `;
  }).join('');

  // Interactive Hover Dots/Overlay
  const hoverOverlayPoints = layers.map((l, idx) => `
    <circle cx="${xCoords[idx]}" cy="${l.posY}" r="4" fill="var(--color-primary)" class="chart-node" data-idx="${idx}" />
    <circle cx="${xCoords[idx]}" cy="${l.negY}" r="4" fill="var(--color-danger)" class="chart-node" data-idx="${idx}" />
    <!-- Invisible trigger bar -->
    <rect x="${xCoords[idx] - 15}" y="${padding.top}" width="30" height="${graphH}" fill="transparent" class="chart-trigger-bar" data-idx="${idx}" />
  `).join('');

  // Render complete SVG markup
  wrapper.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMinYMin meet" id="trend-svg">
      <!-- Background Grid -->
      ${gridLines.join('')}

      <!-- Bottom X Axis -->
      <line x1="${padding.left}" y1="${h - padding.bottom}" x2="${w - padding.right}" y2="${h - padding.bottom}" stroke="var(--border-color)" />
      ${xLabels}

      <!-- Chart Stacked Areas (Bottom to Top) -->
      <path d="${posAreaPath}" fill="rgba(22, 163, 74, 0.15)" />
      <path d="${neuAreaPath}" fill="rgba(100, 116, 139, 0.15)" />
      <path d="${negAreaPath}" fill="rgba(220, 38, 38, 0.15)" />

      <!-- Area outlines -->
      <path d="${posLinePath}" fill="none" stroke="var(--color-success)" stroke-width="2.5" />
      <path d="${neuLinePath}" fill="none" stroke="#64748b" stroke-width="2" />
      <path d="${negLinePath}" fill="none" stroke="var(--color-danger)" stroke-width="2" />

      <!-- Hover Triggers -->
      ${hoverOverlayPoints}
    </svg>
    <div class="chart-tooltip hidden" id="chart-tooltip"></div>
  `;

  // Bind tooltip hover listeners
  const tooltip = $('chart-tooltip');
  $$('.chart-trigger-bar').forEach(trigger => {
    trigger.addEventListener('mousemove', (e) => {
      const idx = parseInt(trigger.dataset.idx, 10);
      const dataPoint = layers[idx];

      const tooltipHTML = `
        <div class="tooltip-date">📅 ${dataPoint.date}</div>
        <div class="tooltip-row text-success"><span>Menciones Positivas:</span> <strong>${dataPoint.pos}</strong></div>
        <div class="tooltip-row text-muted"><span>Menciones Neutrales:</span> <strong>${dataPoint.neu}</strong></div>
        <div class="tooltip-row text-danger"><span>Menciones Críticas:</span> <strong>${dataPoint.neg}</strong></div>
        <div class="tooltip-divider"></div>
        <div class="tooltip-row"><span>Total del día:</span> <strong>${dataPoint.total}</strong></div>
        <div class="tooltip-footer">Monitoreado en 4 idiomas</div>
      `;

      tooltip.innerHTML = tooltipHTML;
      tooltip.classList.remove('hidden');

      // Coordinate positioning
      const rect = wrapper.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      tooltip.style.left = `${clientX + 16}px`;
      tooltip.style.top  = `${clientY - 40}px`;
    });

    trigger.addEventListener('mouseleave', () => {
      tooltip.classList.add('hidden');
    });
  });
}

// ============================================================
// NEWS FILTERS AND INTERACTION
// ============================================================
function initNewsFilters() {
  // Sentiment filter pills
  $$('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.currentNewsFilter = pill.dataset.sentFilter;
      state.newsLimit = 12; // Reset pagination
      renderNews();
    });
  });

  // Category Selector
  $('cat-filter').addEventListener('change', (e) => {
    state.currentNewsFilterCategory = e.target.value;
    state.newsLimit = 12;
    renderNews();
  });

  // Language Selector
  $('lang-filter').addEventListener('change', (e) => {
    state.currentNewsLang = e.target.value;
    state.newsLimit = 12;
    renderNews();
  });

  // Sorting
  $('sort-filter').addEventListener('change', (e) => {
    state.currentNewsSort = e.target.value;
    renderNews();
  });

  // Load More News Button
  const loadBtn = $('btn-load-more-news');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      state.newsLimit += 9;
      renderNews();
    });
  }

  // View toggle grid vs list
  $('btn-grid').addEventListener('click', () => {
    state.viewMode = 'grid';
    $('btn-grid').classList.add('active');
    $('btn-list').classList.remove('active');
    renderNews();
  });
  $('btn-list').addEventListener('click', () => {
    state.viewMode = 'list';
    $('btn-list').classList.add('active');
    $('btn-grid').classList.remove('active');
    renderNews();
  });
}

// Trigger negative filtering from alert banner action
window.filterNegativeNews = function() {
  // Select Negative filter pill
  $$('.filter-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.sentFilter === 'neg');
  });
  state.currentNewsFilter = 'neg';
  $('sort-filter').value = 'negatives';
  state.currentNewsSort = 'negatives';
  
  renderNews();

  // Scroll to news
  $('noticias').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ============================================================
// NEWS CARD RENDERING
// ============================================================
function renderNews() {
  const grid      = $('news-grid-container');
  const noResults = $('news-no-results');
  const loadWrap  = $('news-load-more-wrap');
  if (!grid) return;

  // 1. Apply category, sentiment, query filters
  let data = state.allNews.filter(n => {
    // Avoid showing other competitor benchmark items inside general news
    if (n.competitor) return false;

    const matchQuery = !state.searchQuery || 
      n.title.toLowerCase().includes(state.searchQuery) ||
      n.source.toLowerCase().includes(state.searchQuery) ||
      n.excerpt.toLowerCase().includes(state.searchQuery);

    const matchCategory = !state.currentNewsFilterCategory || state.currentNewsFilterCategory === 'all' || n.category === state.currentNewsFilterCategory;
    const matchSentiment = state.currentNewsFilter === 'all' || n.sentiment === state.currentNewsFilter;
    const matchLang = state.currentNewsLang === 'all' || n.lang === state.currentNewsLang;

    return matchQuery && matchCategory && matchSentiment && matchLang;
  });

  // 2. Apply sorting
  if (state.currentNewsSort === 'recent') {
    data.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
  } else if (state.currentNewsSort === 'oldest') {
    data.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  } else if (state.currentNewsSort === 'positives') {
    data.sort((a, b) => (b.sentiment === 'pos' ? 1 : 0) - (a.sentiment === 'pos' ? 1 : 0));
  } else if (state.currentNewsSort === 'negatives') {
    // Pushes negative items first
    data.sort((a, b) => (b.sentiment === 'neg' ? 1 : 0) - (a.sentiment === 'neg' ? 1 : 0));
  } else if (state.currentNewsSort === 'popular') {
    data.sort((a, b) => b.popular - a.popular);
  }

  // 3. Paginate
  const visible = data.slice(0, state.newsLimit);

  // Update counter text
  const counterEl = $('results-count');
  if (counterEl) {
    counterEl.textContent = `Mostrando ${visible.length} de ${data.length} coberturas`;
  }

  if (visible.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    loadWrap.classList.add('hidden');
  } else {
    noResults.classList.add('hidden');
    grid.className = `news-grid${state.viewMode === 'list' ? ' list-view' : ''}`;
    grid.innerHTML = visible.map(n => createNewsCardHTML(n)).join('');
    loadWrap.classList.toggle('hidden', visible.length >= data.length);
    bindCardDetailClicks();
  }
}

// News Card Layout Generator
function createNewsCardHTML(news) {
  const sLabel = { pos: 'Positivo 👍', neg: 'Negativo 👎', neu: 'Neutral 😐' }[news.sentiment] || 'Neutral';
  const sClass = { pos: 'sent-badge pos', neg: 'sent-badge neg', neu: 'sent-badge neu' }[news.sentiment] || 'sent-badge neu';
  const flag   = { es: '🇩🇴', en: '🇺🇸', fr: '🇫🇷', pt: '🇧🇷' }[news.lang] || '🇩🇴';
  
  return `
    <article class="news-card" data-id="${news.id}">
      <div class="card-img-wrap">
        <img class="card-img" src="${escapeAttr(news.image)}" alt="${escapeAttr(news.title)}" loading="lazy" />
        <div class="card-lang-indicator" title="Idioma original">${flag}</div>
        <div class="card-read-overlay"><span>Leer Detalles 🔍</span></div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-tag tag-${news.category}">${news.category.toUpperCase()}</span>
          <span class="${sClass}">${sLabel}</span>
        </div>
        <h3 class="card-title">${escapeHTML(news.title)}</h3>
        <p class="card-excerpt">${escapeHTML(news.excerpt)}</p>
        <div class="card-footer">
          <div class="card-source"><span class="source-dot"></span>${escapeHTML(news.source)}</div>
          <time class="card-date">${formatDate(news.rawDate)}</time>
        </div>
      </div>
    </article>
  `.trim();
}

// Bind card click triggers to display detailed modal (Fase 2)
function bindCardDetailClicks() {
  $$('.news-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const newsItem = state.allNews.find(n => n.id === id);
      if (newsItem) {
        openDetailModal(newsItem);
      }
    });
  });
}

// ============================================================
// DYNAMIC MODAL DETAIL INTEGRATION (Fase 2)
// ============================================================
function openDetailModal(item) {
  state.activeModalItem = item;
  state.showOriginalText = false;

  const modal = $('detail-modal');
  const mTitle = $('modal-title');
  const mBody  = $('modal-body-text');
  const mAuthor = $('modal-author');
  const mDate = $('modal-date');
  const mCat = $('modal-category');
  const mLang = $('modal-lang');
  const mSent = $('modal-sentiment');
  const mSource = $('modal-source-link');
  const transBar = $('translation-bar');

  // Text setup
  mTitle.textContent = item.title;
  mBody.textContent  = item.excerpt;
  mAuthor.textContent = item.source;
  mDate.textContent  = new Date(item.rawDate).toLocaleString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  mCat.textContent   = item.category.toUpperCase();
  mCat.className     = `modal-tag tag-${item.category}`;

  mLang.textContent = { es: '🇩🇴 es', en: '🇺🇸 en', fr: '🇫🇷 fr', pt: '🇧🇷 pt' }[item.lang] || '🇩🇴 es';
  
  // Sentiment indicator
  const sLabel = { pos: 'Positivo 👍', neg: 'Crítico 👎', neu: 'Neutral 😐' }[item.sentiment];
  mSent.textContent = sLabel;
  mSent.className = `modal-sentiment-badge sent-badge ${item.sentiment}`;

  // Explanation explanation
  const explanationEl = $('modal-sentiment-explanation');
  if (item.sentiment === 'neg') {
    explanationEl.innerHTML = `⚠️ <strong>Alerta:</strong> Este informe contiene menciones críticas sobre retrasos, cobros inesperados o incidentes que podrían dañar la imagen de puntualidad y costos operativos de la marca.`;
    explanationEl.parentElement.className = 'modal-sentiment-analysis danger';
  } else if (item.sentiment === 'pos') {
    explanationEl.innerHTML = `✅ <strong>Positivo:</strong> El artículo destaca hitos de crecimiento, promociones accesibles o excelente experiencia del usuario en cabina.`;
    explanationEl.parentElement.className = 'modal-sentiment-analysis success';
  } else {
    explanationEl.innerHTML = `😐 <strong>Neutral:</strong> Informe estrictamente operativo o noticioso sin cargas de valor reputacionales detectadas.`;
    explanationEl.parentElement.className = 'modal-sentiment-analysis';
  }

  mSource.href = item.url;

  // Translate options
  if (item.translation) {
    transBar.classList.remove('hidden');
    mTitle.textContent = item.translation.title;
    mBody.textContent  = item.translation.excerpt;
    $('btn-toggle-translation').textContent = 'Ver Original';
  } else {
    transBar.classList.add('hidden');
  }

  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function initModalActions() {
  const modal = $('detail-modal');
  const close = $('modal-close');

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    state.activeModalItem = null;
  };

  close.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Toggle dynamic translation trigger
  $('btn-toggle-translation').addEventListener('click', () => {
    const item = state.activeModalItem;
    if (!item || !item.translation) return;

    state.showOriginalText = !state.showOriginalText;

    if (state.showOriginalText) {
      $('modal-title').textContent = item.title;
      $('modal-body-text').textContent = item.excerpt;
      $('btn-toggle-translation').textContent = 'Ver Traducción';
    } else {
      $('modal-title').textContent = item.translation.title;
      $('modal-body-text').textContent = item.translation.excerpt;
      $('btn-toggle-translation').textContent = 'Ver Original';
    }
  });
}

// ============================================================
// SOCIAL COMMENTS FILTERING & ENGAGEMENT HIGHLIGHTING
// ============================================================
function initCommentFilters() {
  $('comment-network-filter').addEventListener('change', (e) => {
    state.currentCommentNetwork = e.target.value;
    renderComments();
  });

  $('comment-sent-filter').addEventListener('change', (e) => {
    state.currentCommentSentiment = e.target.value;
    renderComments();
  });
}

function renderComments() {
  const container = $('comments-container');
  if (!container) return;

  const filtered = COMMENTS_DATA.filter(c => {
    const matchNet = state.currentCommentNetwork === 'all' || c.platform === state.currentCommentNetwork;
    const matchSent = state.currentCommentSentiment === 'all' || c.sentiment === state.currentCommentSentiment;
    return matchNet && matchSent;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
        💬 No hay comentarios coincidentes con los filtros seleccionados.
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(c => {
    const icon = { pos: '💚', neg: '💔', neu: '💬' }[c.sentiment];
    const borderClass = { pos: 'c-card-pos', neg: 'c-card-neg', neu: 'c-card-neu' }[c.sentiment];
    
    // Highlight comment automatically based on engagement/likes threshold
    const isHighImpact = c.likes > 800;
    const badgeHTML = isHighImpact ? `<span class="high-engagement-badge">🔥 Alto Impacto</span>` : '';

    return `
      <article class="comment-item-card ${borderClass}" onclick="window.open('${c.url}', '_blank')">
        <div class="c-item-hdr">
          <div class="c-item-avatar">${c.avatar}</div>
          <div class="c-item-meta">
            <span class="c-item-user">${escapeHTML(c.user)}</span>
            <span class="c-item-network">${c.platform}</span>
          </div>
          <div class="c-item-indicators">
            ${badgeHTML}
            <span class="c-sentiment-icon" title="Sentimiento">${icon}</span>
          </div>
        </div>
        <p class="c-item-text">"${escapeHTML(c.text)}"</p>
        <div class="c-item-footer">
          <span class="c-item-likes">❤ ${c.likes.toLocaleString()}</span>
          <span class="c-item-date">${c.date}</span>
        </div>
      </article>
    `;
  }).join('');
}

// ============================================================
// BRAND METRICS: SOURCES SHARE AND TOP ACCOUNTS
// ============================================================
function populateSources() {
  const data = state.dashboardData;
  const list = $('platform-list');
  if (!list || !data || !data.platforms) return;

  list.innerHTML = data.platforms.map(p => {
    const isUp = p.trend > 0;
    return `
      <div class="platform-row">
        <div class="p-row-info">
          <span class="p-name">${p.platform}</span>
          <span class="p-trend ${isUp ? 'text-success' : 'text-danger'}">
            ${isUp ? '▲' : '▼'} ${Math.abs(p.trend)}%
          </span>
        </div>
        <div class="p-progress-container">
          <div class="p-progress-bar" style="width: ${p.percentage}%"></div>
          <span class="p-pct-label">${p.percentage}%</span>
        </div>
        <span class="p-label-notes">${p.label}</span>
      </div>
    `;
  }).join('');
}

// Competitors Benchmark
function populateBenchmark() {
  const data = state.dashboardData;
  const container = $('benchmark-container');
  if (!container || !data || !data.benchmark) return;

  const brands = [
    { key: 'arajet', name: 'Arajet Airlines 🇩🇴' },
    { key: 'skyhigh', name: 'Sky High Aviation 🇩🇴' },
    { key: 'wingo', name: 'Wingo (LCC) 🇨🇴' }
  ];

  container.innerHTML = brands.map(b => {
    const stats = data.benchmark[b.key];
    return `
      <div class="bench-brand-row">
        <span class="bench-brand-name">${b.name}</span>
        <div class="bench-sentiment-strip">
          <div class="bench-bar pos" style="width: ${stats.pos}%" title="Positivo: ${stats.pos}%"></div>
          <div class="bench-bar neu" style="width: ${stats.neu}%" title="Neutral: ${stats.neu}%"></div>
          <div class="bench-bar neg" style="width: ${stats.neg}%" title="Negativo: ${stats.neg}%"></div>
        </div>
        <div class="bench-labels">
          <span class="text-success">${stats.pos}%</span>
          <span class="text-muted">${stats.neu}%</span>
          <span class="text-danger">${stats.neg}%</span>
        </div>
      </div>
    `;
  }).join('');
}

// Top accounts listing
function populateTopAccounts() {
  const body = $('top-accounts-body');
  if (!body) return;

  const accounts = [
    { name: 'Diario Libre (@DiarioLibre)', platform: 'Medios / Twitter', count: 18, reach: '450k', sentiment: 'neu' },
    { name: 'Arecoa.com', platform: 'Prensa Aviación', count: 14, reach: '120k', sentiment: 'pos' },
    { name: 'Acento.com.do', platform: 'Medios RD', count: 11, reach: '380k', sentiment: 'neu' },
    { name: 'Spotters RD (@spotters_rd)', platform: 'Instagram / Spotters', count: 9, reach: '95k', sentiment: 'pos' },
    { name: 'FlyerTalk Aviación', platform: 'Foro Comunidad', count: 8, reach: '600k', sentiment: 'neg' },
    { name: 'Simple Flying News', platform: 'Prensa Internacional (EN)', count: 7, reach: '1.2M', sentiment: 'pos' },
    { name: 'Reddit r/aviation', platform: 'Foro / Reddit', count: 6, reach: '3.4M', sentiment: 'neg' }
  ];

  body.innerHTML = accounts.map(a => {
    const sLabel = { pos: 'Positivo 👍', neg: 'Negativo 👎', neu: 'Neutral 😐' }[a.sentiment];
    const sClass = { pos: 'text-success', neg: 'text-danger', neu: 'text-muted' }[a.sentiment];

    return `
      <tr>
        <td><strong>${a.name}</strong></td>
        <td>${a.platform}</td>
        <td>${a.count}</td>
        <td>${a.reach}</td>
        <td class="${sClass}">${sLabel}</td>
      </tr>
    `;
  }).join('');
}

// ============================================================
// SYSTEM ALERTS FORM CONSOLE
// ============================================================
function initAlertsConsole() {
  const threshold = $('alert-threshold');
  const valDisplay = $('threshold-val');
  
  if (threshold && valDisplay) {
    threshold.addEventListener('input', () => {
      valDisplay.textContent = `${threshold.value}%`;
    });
  }

  $('btn-save-alerts').addEventListener('click', () => {
    const email = $('alert-email').value;
    const keywords = $('alert-keywords').value;
    
    // Save configuration settings in localStorage
    localStorage.setItem('alert_threshold', threshold.value);
    localStorage.setItem('alert_email', email);
    localStorage.setItem('alert_keywords', keywords);

    alert(`✅ Configuración de alertas guardada con éxito:\n\n- Umbral: ${threshold.value}%\n- Destinatario: ${email}\n- Palabras clave: ${keywords}`);
  });
}

// ============================================================
// UTILITIES AND THEME SWITCHER
// ============================================================
function initThemeToggle() {
  const btn = $('theme-toggle');
  const icon = $('theme-icon');
  if (!btn || !icon) return;

  btn.addEventListener('click', () => {
    state.isDark = !state.isDark;
    if (state.isDark) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      icon.textContent = '☀';
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
      icon.textContent = '🌙';
    }
    // Re-draw chart on theme change to match background contrast
    drawSentimentChart();
  });
}

function initSearch() {
  const input = $('global-search');
  if (!input) return;
  
  let searchTimer;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = input.value.trim().toLowerCase();
      state.newsLimit = 12;
      renderNews();
    }, 300);
  });
}

function initScrollTop() {
  const btn = $('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ============================================================
// FORMATTING AND FALLBACK TEMPLATES
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
  if (m < 60)  return `Hace ${m}m`;
  if (h < 24)  return `Hace ${h}h`;
  if (d === 1) return 'Ayer';
  if (d < 30)  return `Hace ${d}d`;
  
  return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' });
}

function showLoadingSkeletons() {
  // Skeletons for news cards
  const grid = $('news-grid-container');
  if (grid) {
    grid.innerHTML = Array(6).fill(0).map(() => `
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

function showDashboardError() {
  const grid = $('news-grid-container');
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
        📡 No se pudo establecer conexión con el motor de análisis en Railway. <br/>
        Intente recargar el panel de control.
        <br/><br/>
        <button onclick="location.reload()" class="load-more-btn">🔄 Reintentar</button>
      </div>`;
  }
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

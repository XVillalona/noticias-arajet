/**
 * Arajet News Monitor — Static File Server + RSS Proxy
 * Servidor HTTP con proxy de noticias server-side (sin CORS).
 * Compatible con Railway ($PORT env variable).
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = parseInt(process.env.PORT || '8080', 10);
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// ============================================================
// Google News RSS feeds for Arajet
// ============================================================
const RSS_FEEDS = [
  'https://news.google.com/rss/search?q=arajet&hl=es-419&gl=DO&ceid=DO:es-419',
  'https://news.google.com/rss/search?q=arajet+aerolinea&hl=es&gl=ES&ceid=ES:es',
  'https://news.google.com/rss/search?q=arajet+airline&hl=en-US&gl=US&ceid=US:en'
];

// Simple news cache (5 minutes)
let newsCache = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

// ============================================================
// Fetch a URL over HTTPS (Node built-in)
// ============================================================
function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsed   = new URL(targetUrl);
    const options  = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method:   'GET',
      headers:  {
        'User-Agent': 'Mozilla/5.0 (compatible; ArajetNewsBot/1.0)',
        'Accept':     'application/rss+xml, application/xml, text/xml'
      },
      timeout: 8000
    };

    const req = https.request(options, res => {
      // Follow redirects (up to 3)
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://${parsed.hostname}${res.headers.location}`;
        return fetchUrl(redirectUrl).then(resolve).catch(reject);
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end',  () => resolve(data));
    });

    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

// ============================================================
// Parse RSS XML with regex (no external dependencies)
// ============================================================
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const get   = (tag) => {
      const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`);
      const mm = r.exec(block);
      return mm ? (mm[1] || mm[2] || '').trim() : '';
    };

    const title   = get('title');
    const link    = get('link') || get('guid');
    const pubDate = get('pubDate');
    const desc    = get('description');
    const source  = get('source');

    if (title && link) {
      items.push({ title, link, pubDate, description: desc, source });
    }
  }
  return items;
}

// ============================================================
// Clean and transform RSS item → news object
// ============================================================
function transformItem(raw) {
  // Google News wraps title as "Headline - Source"
  const titleFull = decodeEntities(raw.title || '');
  const dashIdx   = titleFull.lastIndexOf(' - ');
  const title     = dashIdx > 0 ? titleFull.slice(0, dashIdx).trim() : titleFull;
  const source    = dashIdx > 0 ? titleFull.slice(dashIdx + 3).trim() : (raw.source || 'Google News');

  const excerpt   = decodeEntities(stripTags(raw.description || '')).slice(0, 220).trim();
  const category  = autoCategory(title + ' ' + excerpt);
  const sentiment = autoSentiment(title + ' ' + excerpt);

  return {
    id:       Math.random().toString(36).slice(2),
    title:    title || 'Sin título',
    excerpt:  excerpt || 'Haz clic para leer el artículo completo.',
    category,
    source,
    rawDate:  raw.pubDate ? new Date(raw.pubDate).toISOString() : new Date().toISOString(),
    url:      raw.link,
    sentiment,
    popular:  Math.floor(Math.random() * 900) + 50
  };
}

function autoCategory(t) {
  t = t.toLowerCase();
  if (/ruta|destino|vuelo nuevo|conexi[oó]n|frecuencia|itinerario/.test(t)) return 'rutas';
  if (/precio|tarifa|oferta|descuento|promo|boleto|tiquete|barato|econ[oó]mico/.test(t)) return 'precios';
  if (/retraso|cancelado|incidente|problema|queja|reclamo|accidente|emergencia|falla/.test(t)) return 'incidentes';
  if (/expan|crecimiento|nuevo|base|hub|incorpora|flota|aeronave|boeing|airbus/.test(t)) return 'expansion';
  if (/twitter|instagram|facebook|tiktok|viral|tendencia|hashtag|red social/.test(t)) return 'social';
  if (/opini[oó]n|an[aá]lisis|editorial|columna/.test(t)) return 'opinion';
  return 'operaciones';
}

function autoSentiment(t) {
  t = t.toLowerCase();
  if (/retraso|cancelado|queja|problema|reclamo|accidente|cr[ií]tica|mal|p[eé]simo|terrible|falla|emergencia/.test(t)) return 'neg';
  if (/excelente|nuevo|[eé]xito|crecimiento|expan|oferta|promo|r[eé]cord|premia|logro|inaugura|mejor/.test(t)) return 'pos';
  return 'neu';
}

function stripTags(html)    { return html.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(); }
function decodeEntities(s)  { return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'").replace(/&nbsp;/g,' '); }

// ============================================================
// Fetch all news (with cache)
// ============================================================
async function getAllNews() {
  if (newsCache && Date.now() - cacheTime < CACHE_TTL) {
    return newsCache;
  }

  const seen  = new Set();
  const items = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const xml  = await fetchUrl(feedUrl);
      const raw  = parseRSS(xml);
      for (const r of raw) {
        const key = r.title.toLowerCase().slice(0, 50);
        if (!seen.has(key) && r.title.length > 5) {
          seen.add(key);
          items.push(transformItem(r));
        }
      }
    } catch (e) {
      console.error(`Feed error: ${feedUrl}`, e.message);
    }
  }

  // Sort by date
  items.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

  newsCache = items;
  cacheTime = Date.now();
  console.log(`✅ Noticias cargadas: ${items.length} artículos`);
  return items;
}

// ============================================================
// HTTP Server
// ============================================================
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname  = parsedUrl.pathname;

  // CORS headers para que el JS del browser pueda llamar /api/news
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // ---- API Endpoint: /api/news ----
  if (pathname === '/api/news') {
    try {
      const news = await getAllNews();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, count: news.length, items: news }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // ---- Static Files ----
  let urlPath = pathname;
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.resolve(ROOT, '.' + urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('403 Forbidden');
  }

  const ext         = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(ROOT, 'index.html'), (err2, html) => {
        if (err2) { res.writeHead(404); return res.end('404 Not Found'); }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✈  Arajet News Monitor — activo en http://0.0.0.0:${PORT}`);
});

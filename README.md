# ✈ Arajet News Monitor

> Portal vanguardista e independiente de monitoreo de noticias, menciones y comentarios sobre **Arajet**, la aerolínea dominicana de ultra bajo costo.

---

## 🌟 Características

- 📰 **Feed de noticias** con 16+ artículos categorizados
- 🔍 **Búsqueda en tiempo real** por título, extracto o fuente
- 🏷 **Filtros por categoría**: Operaciones, Rutas, Precios, Social Media, Incidentes, Expansión, Opinión
- 📊 **Panel de estadísticas** con menciones positivas/negativas/neutrales animadas
- 💬 **Sección de comentarios públicos** recopilados de redes sociales
- 📡 **Ticker de noticias** deslizante en tiempo real
- 🌓 **Toggle Dark/Light Mode** con persistencia en localStorage
- ⊞☰ **Vista cuadrícula / lista** intercambiable
- 📱 **Diseño responsive** (mobile-first)
- ✨ **Animaciones de scroll** (Intersection Observer)
- 🔢 **Contadores animados** en hero y estadísticas

---

## 🎨 Diseño

| Token | Valor |
|-------|-------|
| Fondo principal | `#0a0e1a` (Deep Navy) |
| Color primario | `#FF6B2B` (Arajet Orange) |
| Acento | `#00D4FF` (Cyan) |
| Tipografías | Outfit (headings) + Inter (body) |

---

## 📁 Estructura

```
Noticias Arajet/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Design system completo (~800 líneas)
├── js/
│   └── main.js         # Lógica + datos (~420 líneas)
├── assets/
│   └── logo.png        # Logo del portal
└── README.md           # Este archivo
```

---

## 🚀 Uso

Simplemente abre `index.html` en cualquier navegador moderno. No requiere servidor, dependencias ni instalación.

```bash
# Opción 1: Doble clic en index.html
# Opción 2: Con servidor local
npx serve .
# Opción 3: Con Python
python -m http.server 8080
```

---

## 📡 Fuentes de Datos

Las noticias y comentarios son datos curados de ejemplo representativos de cobertura mediática real sobre Arajet. El portal está diseñado para ser conectado a una API real de noticias (NewsAPI, Google News, Twitter API v2).

---

## 🛠 Stack Tecnológico

- **HTML5** semántico con accesibilidad (ARIA)
- **CSS3** vanilla — variables CSS, Grid, Flexbox, animaciones
- **JavaScript** ES2022 vanilla — sin frameworks, sin dependencias
- **Google Fonts** — Outfit + Inter

---

## ⚖ Aviso Legal

Este portal es **independiente** y no está afiliado oficialmente con Arajet ni ninguna de sus subsidiarias. El contenido es para propósitos informativos y de monitoreo mediático.

---

*Hecho con ❤ en República Dominicana 🇩🇴*

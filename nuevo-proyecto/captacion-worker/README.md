# 📡 BOE Radar Inteligente — Plataforma Profesional de Outreach B2B

> Sistema automatizado de prospección y outreach B2B para vender acceso al **Radar de Boletines Oficiales**, con scraping inteligente, emails HTML profesionales, tracking de aperturas/clics, seguimientos automáticos y protección de reputación del dominio.

---

## ✨ Características

| Funcionalidad | Descripción |
|---|---|
| 🌐 **Scraping Ultra-Agresivo** | Google Maps + 30+ rutas de contacto + Schema.org JSON-LD + Open Graph |
| 💌 **Emails HTML Profesionales** | Diseño branded con logo, botón CTA, firma visual y footer de desuscripción |
| 🧵 **Threading de Emails** | Los follow-ups aparecen en el **mismo hilo** que el email original |
| 📧 **Anti-Spam Certified** | Cabeceras `List-Unsubscribe`, `In-Reply-To`, `Message-ID`, `Precedence: bulk` |
| 📎 **PDF Adjunto** | El dossier *BOE Radar Inteligente.pdf* se adjunta automáticamente |
| 🤖 **Clasificación con GPT-4o** | Tipo de empresa + pain point + **línea de apertura personalizada** |
| 👁️ **Tracking de Aperturas** | Pixel invisible → sabes exactamente quién abrió tu email |
| 🖱️ **Tracking de Clics** | Enlace CTA trackeado → sabes quién hizo clic |
| 🔥 **Hot Leads** | Identifica automáticamente los leads más calientes (ansiosos por comprar) |
| 🚫 **Bounce Handler** | Lee bounces de tu IMAP y los marca automáticamente en la DB |
| 🛡️ **Protección de Dominio** | Rate limiting, delays configurables, gestión de desuscripciones |

---

## 📁 Estructura del Proyecto

```
src/
├── cli.js                    # CLI principal (16 comandos)
├── config.js                 # Configuración y validación (.env)
├── classify/
│   ├── openai.js             # IA: clasificación + openingLine personalizada
│   └── heuristics.js         # Fallback sin API Key
├── csv/
│   ├── reader.js             # Lector de CSVs de leads
│   └── writer.js             # Escritor de CSVs de resultados
├── db/
│   ├── index.js              # Operaciones de base de datos SQLite
│   └── migrations.js         # Esquema de tablas (leads, sends, events)
├── email/
│   ├── sender.js             # Envío SMTP con HTML + anti-spam headers
│   └── bounce_handler.js     # Gestión de rebotes por IMAP
├── scraper/
│   ├── google.js             # Scraper de Google Maps (multi-query)
│   ├── bulk_spain.js         # Scraping masivo de toda España
│   ├── niches.js             # Diccionario de variantes por nicho
│   └── review_classifier.js  # Clasificador de leads sin email
├── templates/
│   └── templates.js          # Emails HTML profesionales + texto plano
├── tracking/
│   ├── pixel.js              # Generador de URLs de tracking
│   └── server.js             # Servidor HTTP de tracking (open/click/unsub)
└── utils/
    ├── scraper.js             # Extractor de emails de webs (v3)
    ├── throttle.js            # Rate limiter y sleep
    └── logger.js              # Winston logger con ficheros de log
```

---

## 🚀 Instalación

```bash
git clone https://github.com/josepcervera622/BOE.git
cd BOE
npm install

# Opcional: para lectura automática de bounces por IMAP
npm install imapflow
```

### Configuración

```bash
cp .env.example .env
# Edita .env con tus credenciales SMTP, OpenAI, etc.
```

**Variables mínimas para empezar:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=tu_app_password   # App Password de Google (no tu contraseña normal)
FROM_EMAIL=tu@gmail.com
FROM_NAME=Tu Nombre
```

> 💡 **Gmail App Password**: Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) y crea una contraseña de aplicación.

---

## 📖 Comandos

### 📤 Envío de Emails

```bash
# Ver preview de emails sin enviar
node src/cli.js preview -f MisLeads.csv -l 3

# Enviar emails con PDF adjunto y tracking
node src/cli.js send -f MisLeads.csv

# Modo simulado (no envía, solo registra)
node src/cli.js send -f MisLeads.csv --dry-run

# Enviar follow-up a leads sin respuesta (en hilo del email original)
node src/cli.js followup-send --days 4

# Enviar a todo All_Spain_Leads.csv
node src/cli.js send-all
```

### 🌐 Scraping

```bash
# Scrapea un nicho y guardacen CSV
node src/cli.js scrape -n "asesoria" -l "Madrid" --limit 200

# Scrappea Y envía en la misma sesión (modo automático)
node src/cli.js scrape-and-send -n "consultora" -l "Valencia" --limit 100

# God Mode: scraping de toda España
node src/cli.js scrape-spain --limit 50
```

### 📊 Reporting & Pipeline

```bash
# Reporte ejecutivo completo del funnel
node src/cli.js report

# Ver leads que abrieron/hicieron clic pero no contestaron (¡CALIENTES!)
node src/cli.js hot-leads

# Ver todos los que no han contestado (con aperturas y clics)
node src/cli.js unreplied

# Estadísticas rápidas por estado
node src/cli.js stats
```

### 🔧 Gestión de Leads

```bash
# Marcar un lead como contestado (para detener follow-ups)
node src/cli.js mark-replied -e empresa@email.com

# Marcar un email como rebotado (manualmente)
node src/cli.js mark-bounced -e invalido@email.com

# Leer bounces del buzón IMAP y marcarlos automáticamente
node src/cli.js check-bounces
```

### 🛰️ Tracking Server

```bash
# Arranca el servidor de tracking (puerto 3456)
node src/cli.js tracking-server

# Con ngrok para exponerlo a internet:
ngrok http 3456
# → Pon la URL de ngrok en TRACKING_URL del .env
```

---

## 🔄 Flujo de Trabajo Recomendado

```
1. SCRAPPEAR
   node src/cli.js scrape -n "asesoria" -l "Madrid" --limit 200

2. ENVIAR con PDF + tracking
   node src/cli.js send -f Leads_asesoria_Madrid_2026-03-01.csv

3. MONITORIZAR (cada día)
   node src/cli.js report           → Resumen completo del funnel
   node src/cli.js hot-leads        → Leads más calientes → llamar hoy

4. SEGUIMIENTO (a los 4 días)
   node src/cli.js followup-send    → Se envía en el mismo hilo del email original

5. LIMPIAR BOUNCES (periodicamente)
   node src/cli.js check-bounces    → Elimina emails inválidos

6. GESTIONAR RESPUESTAS
   node src/cli.js mark-replied -e empresa@email.com
```

---

## 📧 Formato del CSV de Entrada

El CSV debe tener al menos una columna `email`. Las demás son opcionales pero mejoran la personalización:

```csv
name,email,website,category,city,description
"Asesoría García",info@asesoria-garcia.es,https://asesoria-garcia.es,"Gestoria fiscal","Valencia","Asesoría fiscal y laboral para pymes"
```

**Columnas soportadas:**
- `name` — Nombre de la empresa (recomendado)
- `email` — Email de contacto (obligatorio o se extrae de `website`)
- `website` — Web de la empresa (para extracción de email y clasificación)
- `category` — Categoría de Google Maps
- `city` — Ciudad
- `description` — Descripción de la empresa
- `domain` — Dominio (para deduplicación)

---

## ⚙️ Configuración Avanzada

### Tracking de Aperturas y Clics

1. Arranca el servidor: `node src/cli.js tracking-server`
2. Expón a internet con ngrok: `ngrok http 3456`
3. Añade en `.env`: `TRACKING_URL=https://xxxx.ngrok.io/track`
4. A partir de ahora, todos los emails incluirán tracking automático

### Protección del Dominio

```env
SEND_DELAY_MS=180000   # 3 minutos entre emails (recomendado)
MAX_PER_HOUR=15        # Máximo 15 emails/hora
```

> ⚠️ Gmail tiene un límite de ~500 emails/día con cuenta personal. Con Google Workspace son 2000/día.

### Bounce Handling Automático

```env
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=tu@gmail.com
IMAP_PASS=tu_app_password
```

Luego ejecuta `node src/cli.js check-bounces` periódicamente (o añádelo a un cron).

---

## 📊 Base de Datos

El proyecto usa **SQLite** (sin servidor, archivo local). Puedes inspeccionarla con [DB Browser for SQLite](https://sqlitebrowser.org/).

**Tablas:**
- `leads` — Todos los leads con estado, tracking y metadata
- `sends` — Historial de todos los emails enviados
- `events` — Log granular de aperturas y clics con IP/UserAgent

**Estados posibles de un lead:**
| Estado | Descripción |
|---|---|
| `PENDING` | Clasificado pero no enviado |
| `SENT` | Email enviado, esperando respuesta |
| `REPLIED` | Lead contestó → detener follow-ups |
| `FAILED` | Error al enviar |
| `BOUNCED` | Email rebotado → no volver a contactar |

---

## 🛠️ Tecnologías

- **Node.js 20+** — Runtime
- **Puppeteer** — Scraping de Google Maps y webs
- **Nodemailer** — Envío de emails SMTP con HTML
- **SQLite** (node:sqlite nativo) — Base de datos local sin servidor
- **OpenAI GPT-4o-mini** — Clasificación e IA de personalización
- **Winston** — Logging con rotación de ficheros
- **Zod** — Validación de configuración y respuestas IA
- **Commander.js** — CLI profesional con subcomandos

---

## 📄 Licencia

MIT © Josep — BOE Radar Inteligente

---

> 💬 **¿Dudas o mejoras?** Abre un issue en el repositorio o contacta por WhatsApp: [633448806](https://wa.me/34633448806)

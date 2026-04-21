# Captación B2B 24/7 — Deploy y estado

> Fecha: 2026-04-21
> Objetivo: scraper B2B corriendo en VPS Contabo 24/7, enviando a ~18k leads existentes y scrapeando nuevos en paralelo.

---

## QUÉ SE HA HECHO (código ya en repo)

### 1. `ScrapperEmpresasBOE - copia/src/server.js` — NUEVO
Servidor HTTP que envuelve el CLI del scraper. Expone:
- `GET /health` — healthcheck (sin auth)
- `POST /trigger/send` — lanza `send-all` (envía a todos los leads PENDING)
- `POST /trigger/followup` — lanza `followup-send --days 4`
- `POST /trigger/scrape` — lanza `scrape-spain --limit 500` (puede tardar horas)
- `GET /stats` — métricas del pipeline SQLite (para integración Mavie futura)

Puerto: **3002** (BOE-Worker usa 3001). Todos los endpoints excepto `/health` requieren `Authorization: Bearer CRON_SECRET`.

### 2. `ScrapperEmpresasBOE - copia/package.json` — MODIFICADO
Añadido script `"server": "node src/server.js"`.

### 3. `nuevo-proyecto/web-app/app/api/captacion/cron/route.ts` — NUEVO
Endpoint Vercel que el cron llama cada día a las 9:00 AM. Llama al VPS (`CAPTACION_WORKER_URL/trigger/send`). Mismo patrón que el cron del BOE-Worker.

### 4. `nuevo-proyecto/web-app/vercel.json` — MODIFICADO
Añadido segundo cron:
```json
{ "path": "/api/captacion/cron", "schedule": "0 9 * * *" }
```
Ahora tienes 2 crons (máximo en plan Hobby de Vercel):
- 08:00 → BOE-Worker
- 09:00 → Captación B2B

---

## QUÉ TIENES QUE HACER TÚ (pasos manuales en orden)

### PASO 1 — Rotar keys expuestas (URGENTE antes de subir al VPS)

El `.env` del scraper fue leído durante esta sesión. Rota:

| Key | Dónde rotarla |
|-----|--------------|
| `SMTP_PASS` (Brevo SMTP) | Brevo → SMTP & API → Borrar key actual → Crear nueva |
| `OPENAI_API_KEY` | platform.openai.com → API keys → Delete → Create new |

Actualiza el `.env` del scraper con los nuevos valores antes de continuar.

---

### PASO 2 — En el VPS: instalar Node 22 (no Node 20)

**Crítico:** el scraper usa `node:sqlite` built-in que requiere Node 22.5+. Con Node 20 no arranca.

```bash
ssh root@TU_IP_VPS

# Desinstalar Node 20 si está instalado
apt-get remove -y nodejs

# Instalar Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt-get install -y nodejs

# Verificar
node --version   # debe ser v22.x.x
```

---

### PASO 3 — En el VPS: instalar dependencias Chrome para Puppeteer

Puppeteer necesita estas libs en Ubuntu para funcionar headless:

```bash
apt-get install -y ca-certificates fonts-liberation libappindicator3-1 \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libcairo2 libcups2 \
  libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 \
  libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 wget xdg-utils
```

---

### PASO 4 — Subir el scraper al VPS

**Desde tu máquina (Windows PowerShell o Git Bash):**

```bash
# El espacio en el nombre de la carpeta requiere comillas
scp -r "C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB\ScrapperEmpresasBOE - copia" root@TU_IP_VPS:/opt/captacion
```

**En el VPS:**
```bash
cd /opt/captacion
npm install
```

---

### PASO 5 — Configurar el .env del scraper en el VPS

```bash
nano /opt/captacion/.env
```

El `.env` ya existe en tu repo local. Asegúrate de que tiene estas variables (algunas ya estarán, añade las nuevas):

```env
# SMTP Brevo (la key rotada en Paso 1)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_smtp_user_brevo
SMTP_PASS=tu_nueva_smtp_pass_rotada

# OpenAI (la key rotada en Paso 1)
OPENAI_API_KEY=sk-proj-...nueva...
OPENAI_MODEL=gpt-4o-mini

# Identidad
FROM_NAME=Josep
FROM_EMAIL=jose@mavieautomations.com
REPLY_TO=jose@mavieautomations.com
COMPANY_NAME=MavieAutomations
SIGNATURE_URL=https://mavieautomations.com

# Base de datos
DB_PATH=./data/outreach.sqlite

# Rate limits (Brevo free = 300/día)
MAX_PER_DAY=219
MAX_PER_HOUR=56
SEND_DELAY_MS=72000

# Servidor HTTP (NUEVO)
PORT=3002
CRON_SECRET=el_mismo_que_en_vercel_y_boe_worker
```

Proteger el archivo:
```bash
chmod 600 /opt/captacion/.env
```

---

### PASO 6 — Subir los CSVs existentes al VPS

Tienes ~18.000 leads listos en tu máquina local. Súbelos:

```bash
# Desde tu máquina
scp "C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB\ScrapperEmpresasBOE - copia\All_Spain_Leads.csv" root@TU_IP:/opt/captacion/
scp "C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB\ScrapperEmpresasBOE - copia\All_Spain_Leads_2.csv" root@TU_IP:/opt/captacion/
scp "C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB\ScrapperEmpresasBOE - copia\Faltantes_por_enviar.csv" root@TU_IP:/opt/captacion/
```

---

### PASO 7 — Arrancar con PM2

```bash
cd /opt/captacion

# Arrancar el servidor HTTP
pm2 start src/server.js --name captacion-worker

# Verificar
pm2 status
curl http://localhost:3002/health
# Debe devolver: {"ok":true}

# Guardar y configurar autostart
pm2 save
pm2 startup
# → ejecuta el comando sudo que te devuelve
```

---

### PASO 8 — Crontab VPS para scraping semanal

El scraping (Puppeteer + Chrome) es pesado. Se ejecuta una vez por semana en horario de madrugada para no interferir con el envío:

```bash
crontab -e
```

Añadir esta línea:
```
0 2 * * 1 cd /opt/captacion && node src/cli.js scrape-spain --limit 500 >> /var/log/captacion-scrape.log 2>&1
```

Esto ejecuta el scraping todos los lunes a las 2:00 AM.

---

### PASO 9 — En Vercel: añadir variable de entorno

Ve a Vercel → tu proyecto → Settings → Environment Variables:

| Variable | Valor |
|----------|-------|
| `CAPTACION_WORKER_URL` | `http://TU_IP_VPS:3002` |

La `CRON_SECRET` ya está configurada (misma para BOE-Worker y Captación).

Luego: Vercel → Deployments → **Redeploy** para que coja la nueva variable.

---

### PASO 10 — Abrir puerto 3002 en el firewall del VPS

```bash
ufw allow 3002/tcp
ufw status
```

Solo Vercel lo llamará. Considera restringirlo a IPs de Vercel si quieres más seguridad.

---

### PASO 11 — Test completo

**Test 1 — Health desde exterior:**
```bash
curl http://TU_IP_VPS:3002/health
# → {"ok":true}
```

**Test 2 — Trigger send manual:**
```bash
curl -X POST http://TU_IP_VPS:3002/trigger/send \
  -H "Authorization: Bearer TU_CRON_SECRET"
# → {"ok":true,"message":"Campaña de envío iniciada"}
# Revisar logs: pm2 logs captacion-worker
```

**Test 3 — Cron Vercel manual:**
Ve a Vercel → Settings → Cron Jobs → Ejecutar manualmente `/api/captacion/cron`.

**Test 4 — Verificar email enviado:**
Comprueba que el primer email llega a un destinatario de prueba (usa `--dry-run` primero si quieres).

---

## ARQUITECTURA RESULTANTE

```
09:00 AM cada día
  → Vercel Cron dispara GET /api/captacion/cron
  → Vercel llama POST http://VPS:3002/trigger/send (con CRON_SECRET)
  → Captacion Worker ejecuta: node cli.js send-all
      → Lee leads PENDING del SQLite
      → Clasifica con GPT-4o-mini
      → Envía HTML emails via Brevo SMTP
      → 219 emails/día máximo, 1.2 min entre emails
      → Registra aperturas/clics via tracking

Lunes 02:00 AM
  → VPS crontab ejecuta: node cli.js scrape-spain --limit 500
      → Puppeteer scraping Google Maps
      → Extrae emails de webs
      → Añade nuevos leads PENDING al SQLite

PM2 mantiene captacion-worker 24/7, reinicia si cae

Stats visibles en:
  - Brevo dashboard (aperturas, clics, campañas)
  - Admin Mavie /api/brevo/* (mismo Brevo)
  - GET http://VPS:3002/stats (datos SQLite raw)
```

---

## LEADS DISPONIBLES AHORA

| CSV | Leads |
|-----|-------|
| `All_Spain_Leads.csv` | 5.488 |
| `All_Spain_Leads_2.csv` | 9.810 |
| `Faltantes_por_enviar.csv` | 3.380 |
| **Total** | **~18.678** |

Con 219/día → ~85 días para enviar a todos. El scraping semanal rellena el pipeline antes de que se agote.

---

## COMANDOS ÚTILES DEL DÍA A DÍA (en VPS)

```bash
pm2 status                          # estado del worker
pm2 logs captacion-worker           # logs en tiempo real
pm2 logs captacion-worker --lines 50

# Triggers manuales
curl -X POST http://localhost:3002/trigger/send \
  -H "Authorization: Bearer TU_SECRET"

curl -X POST http://localhost:3002/trigger/followup \
  -H "Authorization: Bearer TU_SECRET"

curl -X POST http://localhost:3002/trigger/scrape \
  -H "Authorization: Bearer TU_SECRET"

# Stats pipeline
curl http://localhost:3002/stats \
  -H "Authorization: Bearer TU_SECRET"

# CLI directo
cd /opt/captacion
node src/cli.js stats
node src/cli.js report
node src/cli.js hot-leads
```

---

## CHECKLIST FINAL

- [ ] Keys rotadas (SMTP_PASS + OPENAI_API_KEY)
- [ ] Node 22 instalado en VPS
- [ ] Chrome deps instaladas
- [ ] Código subido a `/opt/captacion`
- [ ] `npm install` ejecutado
- [ ] `.env` configurado con CRON_SECRET, PORT=3002, keys rotadas
- [ ] CSVs subidos al VPS
- [ ] `pm2 start src/server.js --name captacion-worker`
- [ ] `curl localhost:3002/health` devuelve `{"ok":true}`
- [ ] Crontab semanal de scraping configurado
- [ ] `CAPTACION_WORKER_URL` añadida en Vercel
- [ ] Redeploy Vercel ejecutado
- [ ] Test trigger manual OK
- [ ] Primer email llegando

---

**Dueño:** Josep
**Última actualización:** 2026-04-21

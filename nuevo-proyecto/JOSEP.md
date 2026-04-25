# MAVIE MASTER PLAN — Josep
> Última actualización: 2026-04-21  
> Objetivo: máximo impacto, 0€ invertido, solo tiempo + código  
> Principio: dinero real antes que perfección técnica, pero que el producto sea bueno y agrade.

---

## ⚠️ ANÁLISIS DE COHERENCIA — LEER ANTES DE EMPEZAR CUALQUIER SESIÓN

> Revisado 2026-04-21. Conflictos detectados y corregidos para que los chats futuros no metan la pata.

### CONFLICTOS REALES (ya corregidos en este doc)




**1. PASO 1.2 — Multi-SMTP va en el worker VPS, NO en el scraper viejo**
- El archivo original decía editar `ScrapperEmpresasBOE - copia/src/services/email.js`
- INCORRECTO: CLAUDE.md prohíbe extender el scraper copia in-place
- CORRECTO: La rotación multi-SMTP va en el módulo captación que se despliega en `/opt/captacion` del VPS
- El scraper copia es solo REFERENCIA de código a portar, no el lugar donde escribir features nuevas

**2. FASE 7 Videos — gateada en MRR, no antes**
- CLAUDE.md dice: "no construir productos nuevos hasta Radar BOE facture 3.000€/mes"
- Videos es herramienta de marketing, pero el pipeline completo (Remotion+ElevenLabs+APIs publicación) es una feature grande
- **Gate explícito: no empezar Sesión Videos 1 hasta tener 10+ clientes activos o 1.500€ MRR**
- Antes del gate: crear videos manualmente y publicar a mano (30 min cada uno) → misma cámara
- Antes de empezar Sesión Videos 1: instalar skill "Editor Pro Max" de tododeia.com — ya resuelve 80% del pipeline Remotion+FFmpeg

**3. Listmonk — útil pero no urgente**
- Listmonk es para newsletter broadcast masivo (18k leads de una vez)
- No compite con Brevo (alertas BOE) ni con multi-SMTP outbound (cold email personalizado)
- Instalar en VPS solo si se van a hacer newsletters semanales reales desde el mes 1
- Si no hay tiempo: Brevo gratuito aguanta las primeras newsletters mientras se valida el canal

**4. Falta de sincronía con estado real del repo (CLAUDE.md)**
- Chat A ✅ HECHO: Stripe, Vercel, Supabase configurados
- Chat C ✅ HECHO: Panel self-service cliente `/panel` funcionando
- Chat E ✅ HECHO: BOE-Worker como cron automático
- **PENDIENTE más urgente: Chat B — probar BOE-Worker con cliente real** → esto antes que cualquier FASE nueva

### SINERGIAS A EXPLOTAR

- **FASE 3 SEO + FASE 4 GitHub + skill "Claude SEO" (FASE 8)** → mismo sprint, semana 2. El README del repo GitHub indexa en Google, las páginas programáticas también. Hacer todo junto.
- **FASE 1 Multi-SMTP + FASE 2 VPS** → NO son dos fases separadas. Son un solo deployment. El multi-SMTP se configura durante el deploy VPS, no antes ni después.
- **FASE 5 LinkedIn + FASE 7 Videos** → Los clips de video son el contenido de los posts LinkedIn. Cuando llegue FASE 7, LinkedIn gets automated content.
- **Skill "Scrapling" (FASE 8 Tier 1)** → complementa el scraper propio para Google Maps. Instalar en paralelo con FASE 2 para enriquecer leads.

### ORDEN CORRECTO DE ATAQUE (consolidado, corrige el orden original)

```
AHORA MISMO (antes que cualquier fase):
  1. Chat B — probar BOE-Worker node src/index.js → cliente real recibe email ← BLOQUEANTE

SEMANA 1 (FASE 1+2 son UN solo bloque):
  2. Crear cuentas Resend + SendGrid (2h)
  3. Deploy VPS: Node22 + Chrome + código captación + PM2 (3h)
  4. Multi-SMTP en el worker captación del VPS (2h) ← NO en scraper copia
  5. Importar 18k leads → SQLite → primer envío real (2h)
  6. Listmonk en VPS si hay tiempo (2h, no bloqueante)

SEMANA 2 (FASE 3+4 juntas):
  7. next-seo + páginas /radar-boe/[vertical] (4h)
  8. Sitemap + Google Search Console (1h)
  9. GitHub repo público radar-boe-demo + README SEO (1h)
  10. Skill "Claude SEO" de tododeia.com para auditar las páginas (1h)

SEMANA 3 (FASE 5):
  11. LinkedIn perfil optimizado + rutina 10 DMs/día

CUANDO MRR ≥ 1.500€ o ≥ 10 clientes:
  12. FASE 7 Videos — primero instalar skill "Editor Pro Max" de tododeia.com, luego Sesión Videos 1
```

---

## ESTADO DEL CÓDIGO HOY — `nuevo-proyecto/` (2026-04-21)

> IA que empiece aquí: lee esto. No hace falta leer CLAUDE.md para saber qué hay hecho y qué falta.

### Estructura del repo (solo tocar `nuevo-proyecto/`)

```
MAVIE_BOE_WEB/
├── nuevo-proyecto/              ← STACK PRODUCTIVO. Todo código nuevo va aquí
│   ├── CLAUDE.md                ← referencia técnica complementaria
│   ├── JOSEPH.md                ← este archivo — fuente de verdad principal
│   ├── web-app/                 ← Next.js 14 + Supabase (Mavie + panel admin + panel cliente)
│   ├── BOE-Worker/              ← Node.js worker — Radar BOE multi-tenant
│   └── database/schema.sql      ← esquema Supabase
├── ScrapperEmpresasBOE - copia/ ← scraper FUNCIONAL — REFERENCIA para portar, NO extender
├── referencia-boe/              ← histórico BOE — solo consulta
└── referencia-web-mavie/        ← web antigua — solo referencia visual
```

**Regla única:** Todo código nuevo va en `nuevo-proyecto/`. El scraper copia es fuente para LEER y PORTAR a `nuevo-proyecto/captacion-worker/` (aún no existe — de momento se despliega al VPS como `/opt/captacion`). No extender el scraper copia in-place.

### Qué ESTÁ HECHO en `nuevo-proyecto/web-app/`

| Módulo | Ruta | Estado |
|--------|------|--------|
| Landing Mavie pública | `app/page.tsx` | ✅ Deployada mavieautomations.com |
| Landing Radar BOE + precios | `app/soluciones/boe/page.tsx` | ✅ 79/179/399€, CTAs Stripe |
| Onboarding público BOE | `app/onboarding/boe/` + `actions/submitOnboarding.ts` | ✅ Honeypot + captcha + crea cliente |
| Auth admin (Josep) | `middleware.ts` + `lib/auth.ts` | ✅ ADMIN_EMAILS fail-closed |
| Dashboard admin CRM | `app/(admin)/dashboard/` | ✅ 9 páginas (clientes, leads, BOE, emails…) |
| Auth cliente self-service | `app/acceso/page.tsx` + `lib/auth.ts:requireClienteAuth()` | ✅ Login Supabase Auth → /panel |
| Panel cliente `/panel` | `app/(cliente)/panel/` + `actions/clienteActions.ts` | ✅ Dashboard + keywords + destinatarios |
| Stripe Checkout | `app/api/stripe/checkout/route.ts` | ✅ 3 planes → Stripe hosted checkout |
| Stripe Webhook | `app/api/stripe/webhook/route.ts` | ✅ 4 eventos — activa/cancela/cambia plan/fallo pago |
| Stripe Portal | `app/api/stripe/portal/route.ts` | ✅ Billing Portal auth-protected |
| Página post-pago `/gracias` | `app/gracias/page.tsx` | ✅ Confirmación + pasos + link portal |
| BOE cron Vercel | `app/api/boe/cron/route.ts` | ✅ 08:00 AM automático |
| Brevo API routes | `app/api/brevo/` | ✅ 4 endpoints auth-protected |

### Qué ESTÁ HECHO en `nuevo-proyecto/BOE-Worker/`

| Módulo | Ruta | Estado |
|--------|------|--------|
| Pipeline multi-tenant completo | `src/index.js` + `src/scrapers/` + `src/services/` | ✅ Fetch BOE → filtrar keywords → email digest → log Supabase |

### Qué FALTA (orden de prioridad)

| # | Tarea | Dónde | Impacto |
|---|-------|-------|---------|
| 1 | **Chat B: probar BOE-Worker con cliente real** | `nuevo-proyecto/BOE-Worker/` → `node src/index.js` | 🔴 BLOQUEANTE |
| 2 | **Chat D: playbook outbound despachos abogados** | `ScrapperEmpresasBOE - copia/src/cli.js` (fuente referencia) | 🔴 ALTO |
| 3 | **Deploy captación worker en VPS** | Ver FASE 1+2 abajo | 🔴 ALTO |
| 4 | **SEO páginas programáticas** | `nuevo-proyecto/web-app/app/radar-boe/` | 🟡 MEDIO |
| 5 | **Sistema videos** (gateado ≥10 clientes) | `nuevo-proyecto/` (módulo nuevo) | 🟢 BAJO |

### Configuración externa hecha (no repetir)
- ✅ Stripe: 3 productos, price IDs en .env.local, webhook registrado, Billing Portal activo
- ✅ Supabase: migraciones 01-08 aplicadas, RLS activado
- ✅ Vercel: STRIPE_*, SUPABASE_*, BREVO_*, ADMIN_EMAILS, NEXT_PUBLIC_SITE_URL configuradas
- ✅ Secrets rotados (post-exposición 2026-04-20)
- ⏳ Crear usuario Supabase Auth para cliente existente: Dashboard → Authentication → Users → Invite user

---

## QUIÉN ERES Y QUÉ TIENES YA

- 22 años, full-stack + automatización + IA
- **1 cliente real pagando** Radar BOE → prueba social validada
- **~18.678 leads** en CSVs listos para enviar
- **VPS Contabo** funcionando
- **Brevo** SMTP gratuito (300/día)
- Stack: Next.js 14, Node.js, Supabase, Docker, Cloudflare
- Dominio: mavieautomations.com (en Vercel)

Lo que tienes es más que suficiente para generar 1.000-3.000€/mes. El problema no es el producto — es el volumen de contacto y la distribución.

---

## MAPA DEL ECOSISTEMA COMPLETO

```
┌─────────────────────────────────────────────────────────┐
│                    MAVIE ECOSYSTEM                       │
│                                                          │
│  CAPTACIÓN (leads entran)                                │
│  ├── Scraper Google Maps → SQLite (ya funciona)          │
│  ├── Multi-SMTP: 1.100 emails/día GRATIS                │
│  ├── Listmonk self-hosted (newsletters ilimitadas)       │
│  └── LinkedIn manual (0€, 10×CTR vs email frío)         │
│                                                          │
│  CONVERSIÓN (leads se convierten)                        │
│  ├── Landing Radar BOE (79/179/399€/mes)                 │
│  ├── Landing "Automatización a medida" (2.500-5.000€)    │
│  ├── Stripe self-serve ✅ (3 planes, webhook 4 eventos, portal)          │
│  └── Panel cliente self-service ✅ (`/acceso` → `/panel`)               │
│                                                          │
│  RETENCIÓN (clientes se quedan y pagan más)              │
│  ├── Panel /panel con keywords/destinatarios             │
│  ├── Weekly digest IA por cliente                        │
│  └── Onboarding call 15min post-pago                     │
│                                                          │
│  SEO (tráfico pasivo 24/7)                               │
│  ├── 60+ páginas programáticas /radar-boe-[vertical]     │
│  ├── GitHub repo público → Google indexa                 │
│  └── Blog técnico → casos reales anonimizados            │
└─────────────────────────────────────────────────────────┘
```

---

## FASE 1 — MÁQUINA DE EMAIL (semana 1, 0€)

### Objetivo: pasar de 300/día a 1.100/día sin pagar nada

#### PASO 1.1 — Crear cuentas SMTP gratuitas (2 horas total)

**A) Resend (100/día gratis):**
1. Ir a resend.com → Sign up gratis
2. Settings → API Keys → Create API Key
3. Domains → Add Domain → `mail.mavieautomations.com`
4. Añadir los registros DNS que te da en Cloudflare
5. Guardar: `RESEND_SMTP_PASS=re_xxx` (la API key sirve como password SMTP)
6. SMTP: host `smtp.resend.com`, puerto `465`, user `resend`, pass = API key

**B) SendGrid (100/día gratis):**
1. Ir a sendgrid.com → Sign up gratis
2. Settings → API Keys → Create API Key (full access)
3. Settings → Sender Authentication → Authenticate Domain → `send.mavieautomations.com`
4. Añadir DNS records en Cloudflare
5. Guardar: `SENDGRID_API_KEY=SG.xxx`
6. SMTP: host `smtp.sendgrid.net`, puerto `587`, user `apikey`, pass = API key

**C) Gmail SMTP dedicado (500/día — calentar gradual):**
1. Crear cuenta Google nueva dedicada para outreach
2. Activar verificación 2 pasos (obligatorio para app passwords)
3. Security → App Passwords → Mail → copiar contraseña 16 caracteres
4. SMTP: host `smtp.gmail.com`, puerto `587`, user = tu gmail, pass = app password
5. ⚠️ Primera semana: máximo 20/día → semana 2: 50/día → semana 3: 100/día → semana 4: 200/día

**Stack de email resultante:**
| Proveedor | Emails/día | Dominio remitente |
|-----------|-----------|-------------------|
| Brevo (ya tienes) | 300 | jose@mavieautomations.com |
| Resend | 100 | hola@mail.mavieautomations.com |
| SendGrid | 100 | info@send.mavieautomations.com |
| Gmail dedicado | 200 (warm-up) | cuenta_outreach@gmail.com |
| **TOTAL** | **~700 hoy → 1.100 en mes 2** | — |

---

#### PASO 1.2 — Añadir rotación SMTP al worker captación del VPS

> ⚠️ IMPORTANTE: Este código va en `/opt/captacion/src/services/email.js` del VPS (el código portado en FASE 2), NO en `ScrapperEmpresasBOE - copia/`. El scraper copia es solo referencia. CLAUDE.md prohíbe extenderlo in-place.

Añadir al `.env` de `/opt/captacion/` (después de rotar los que ya tienes):
```env
# SMTP principal (Brevo — rotada)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=tu_smtp_user_brevo
SMTP_PASS=tu_smtp_pass_ROTADA

# Proveedores adicionales (NUEVOS)
RESEND_SMTP_PASS=re_tu_api_key_resend
SENDGRID_API_KEY=SG.tu_api_key_sendgrid
GMAIL_SMTP_USER=tu_cuenta@gmail.com
GMAIL_SMTP_PASS=xxxx_xxxx_xxxx_xxxx

# OpenAI (rotada)
OPENAI_API_KEY=sk-proj-...nueva_rotada...
OPENAI_MODEL=gpt-4o-mini

# Rate limits por día (ajustar según warm-up)
MAX_PER_DAY=219
MAX_PER_HOUR=56
SEND_DELAY_MS=72000

# Servidor HTTP
PORT=3002
CRON_SECRET=el_mismo_que_en_vercel
```

Lógica de rotación en email.js:
```js
const SMTP_PROVIDERS = [
  {
    name: 'brevo',
    host: process.env.SMTP_HOST,
    port: 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    dailyLimit: 280,
  },
  {
    name: 'resend',
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: { user: 'resend', pass: process.env.RESEND_SMTP_PASS },
    dailyLimit: 90,
  },
  {
    name: 'sendgrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
    dailyLimit: 90,
  },
];

const _counts = {}; // reinicia con el proceso cada día (PM2 restart diario)

function getProvider() {
  const today = new Date().toDateString();
  for (const p of SMTP_PROVIDERS) {
    const k = `${p.name}_${today}`;
    _counts[k] = _counts[k] || 0;
    if (_counts[k] < p.dailyLimit) {
      _counts[k]++;
      return p;
    }
  }
  return null; // todos agotados
}
```

---

#### PASO 1.3 — Instalar Listmonk en VPS (newsletter ilimitada, 0€)

Listmonk = Mailchimp open source. Newsletters ilimitadas usando tus SMTPs gratis.

**En el VPS:**
```bash
ssh root@TU_IP_VPS

# Crear directorio
mkdir -p /opt/listmonk && cd /opt/listmonk

# Descargar configuración oficial
curl -Lo docker-compose.yml https://raw.githubusercontent.com/knadh/listmonk/master/docker-compose.yml

# Crear config
cat > listmonk-config.toml << 'EOF'
[app]
address = "0.0.0.0:9000"
admin_username = "admin"
admin_password = "PON_PASSWORD_FUERTE_AQUI"

[db]
host = "listmonk_db"
port = 5432
user = "listmonk"
password = "listmonk_db_pass"
database = "listmonk"
EOF

# Arrancar
docker-compose up -d

# Verificar (esperar 30s para que arranque)
sleep 30
curl http://localhost:9000/health
```

**Abrir puerto:**
```bash
ufw allow 9000/tcp
```

**Acceder:** Ir a `http://TU_IP_VPS:9000` → admin / tu password

**Configurar SMTP en Listmonk:**
- Settings → SMTP → añadir Brevo como primario (host, puerto, usuario, pass)
- Create List → "Leads España B2B"
- Subscribers → Import → subir `All_Spain_Leads.csv`

**Usar para:**
- Newsletter semanal "Automatización B2B Spain" (gratis para siempre)
- Secuencias de nurturing para leads que no compraron inmediatamente
- Anuncios de nuevos productos a toda la lista

---

## FASE 2 — VPS CAPTACIÓN 24/7 (semana 1-2)

### Checklist completo en orden (ver CAPTACION-DEPLOY.md para detalle)

```bash
# ── ANTES DE TOCAR EL VPS ──────────────────────────────────
# 1. Rotar SMTP_PASS en Brevo dashboard
# 2. Rotar OPENAI_API_KEY en platform.openai.com
# 3. Actualizar .env local con las nuevas keys
# ──────────────────────────────────────────────────────────

ssh root@TU_IP_VPS

# 4. Node 22 (obligatorio — el scraper usa node:sqlite built-in)
apt-get remove -y nodejs
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt-get install -y nodejs
node --version   # debe ser v22.x.x

# 5. Dependencias Chrome para Puppeteer
apt-get install -y ca-certificates fonts-liberation libappindicator3-1 \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libcairo2 libcups2 \
  libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 \
  libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 wget xdg-utils
```

```bash
# ── DESDE TU MÁQUINA WINDOWS (Git Bash) ──────────────────
# 6. Subir código del scraper al VPS
# NOTA: Este scp sube el scraper copia como deploy inicial. Es correcto para ahora.
# Futuro: crear nuevo-proyecto/captacion-worker/ en el repo y deployar desde ahí.
scp -r "C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB\ScrapperEmpresasBOE - copia" root@TU_IP_VPS:/opt/captacion

# 7. Subir los leads CSV
scp "C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB\ScrapperEmpresasBOE - copia\All_Spain_Leads.csv" root@TU_IP_VPS:/opt/captacion/
scp "C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB\ScrapperEmpresasBOE - copia\All_Spain_Leads_2.csv" root@TU_IP_VPS:/opt/captacion/
scp "C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB\ScrapperEmpresasBOE - copia\Faltantes_por_enviar.csv" root@TU_IP_VPS:/opt/captacion/
```

```bash
# ── DE VUELTA EN EL VPS ────────────────────────────────────
cd /opt/captacion

# 8. Instalar dependencias
npm install

# 9. Crear .env con TODAS las variables (incluyendo multi-SMTP)
nano /opt/captacion/.env
chmod 600 /opt/captacion/.env

# 10. Importar leads a SQLite
node src/cli.js import --file All_Spain_Leads.csv
node src/cli.js import --file All_Spain_Leads_2.csv
node src/cli.js import --file Faltantes_por_enviar.csv
node src/cli.js stats   # verificar: debe mostrar ~18.678 leads

# 11. Test en seco (no envía emails reales)
node src/cli.js send-all --dry-run --limit 5

# 12. Test real con 3 emails (usa tu propio email para verificar)
node src/cli.js send-all --limit 3

# 13. Si OK, arrancar con PM2
npm install -g pm2
pm2 start src/server.js --name captacion-worker
pm2 status
curl http://localhost:3002/health   # → {"ok":true}
pm2 save
pm2 startup
# ← ejecutar el comando sudo que devuelve este último

# 14. Crontab para scraping semanal (nuevos leads automáticos)
crontab -e
# Añadir esta línea:
# 0 2 * * 1 cd /opt/captacion && node src/cli.js scrape-spain --limit 500 >> /var/log/captacion-scrape.log 2>&1

# 15. Abrir puertos necesarios
ufw allow 3001/tcp   # BOE Worker
ufw allow 3002/tcp   # Captación Worker
ufw allow 9000/tcp   # Listmonk
ufw status
```

**En Vercel (último paso):**
- Settings → Environment Variables → añadir `CAPTACION_WORKER_URL=http://TU_IP_VPS:3002`
- Deployments → Redeploy

### Arquitectura resultante:
```
08:00 AM → Vercel cron → /api/boe/cron → VPS:3001 → BOE Worker → emails alertas clientes
09:00 AM → Vercel cron → /api/captacion/cron → VPS:3002 → 219 emails captación automáticos
Lunes 02:00 AM → crontab VPS → Puppeteer scraping → 500 leads nuevos al SQLite
PM2 mantiene ambos workers 24/7, reinicia si caen
```

---

## FASE 3 — SEO PROGRAMÁTICO (semana 2-3, 4 horas)

### Objetivo: tráfico pasivo que trae clientes mientras duermes

#### PASO 3.1 — Instalar next-seo

```bash
cd nuevo-proyecto/web-app
npm install next-seo
```

#### PASO 3.2 — Crear páginas programáticas

Crear archivo `web-app/app/radar-boe/[vertical]/page.tsx`:

```tsx
export const VERTICALES = [
  { slug: 'despachos-abogados', nombre: 'Despachos de Abogados', keywords: 'licitación contratación pública subvenciones normativa' },
  { slug: 'consultoras-subvenciones', nombre: 'Consultoras de Subvenciones', keywords: 'ayudas convocatorias fondos europeos BDNS' },
  { slug: 'empresas-licitacion', nombre: 'Empresas de Licitación Pública', keywords: 'contratos públicos PLACSP adjudicaciones' },
  { slug: 'gestorias-asesorias', nombre: 'Gestorías y Asesorías', keywords: 'cambios normativos fiscales laborales IRPF' },
  { slug: 'asociaciones-profesionales', nombre: 'Asociaciones Profesionales', keywords: 'normativa sectorial circulares boletines' },
  { slug: 'constructoras', nombre: 'Empresas Constructoras', keywords: 'licitaciones obras públicas concursos' },
  { slug: 'sector-farmaceutico', nombre: 'Sector Farmacéutico', keywords: 'autorizaciones medicamentos AEMPS normativa sanitaria' },
  { slug: 'sector-inmobiliario', nombre: 'Sector Inmobiliario', keywords: 'normativa urbanística vivienda alquiler' },
  { slug: 'exportadoras', nombre: 'Empresas Exportadoras', keywords: 'normativa comercio exterior aranceles ICEX' },
  { slug: 'startups-tecnologia', nombre: 'Startups y Tecnología', keywords: 'subvenciones I+D fondos CDTI Neotec' },
  { slug: 'clinicas-hospitales', nombre: 'Clínicas y Hospitales', keywords: 'normativa sanitaria conciertos contratos salud' },
  { slug: 'colegios-profesionales', nombre: 'Colegios Profesionales', keywords: 'normativa regulatoria colegios profesiones' },
];

export async function generateStaticParams() {
  return VERTICALES.map(v => ({ vertical: v.slug }));
}

export async function generateMetadata({ params }: { params: { vertical: string } }) {
  const v = VERTICALES.find(x => x.slug === params.vertical);
  return {
    title: `Radar BOE para ${v?.nombre} — Alertas automáticas | Mavie`,
    description: `Monitorización del BOE especializada para ${v?.nombre}. Alertas automáticas sobre ${v?.keywords}. Desde 79€/mes.`,
  };
}

export default function VerticalPage({ params }: { params: { vertical: string } }) {
  const v = VERTICALES.find(x => x.slug === params.vertical);
  return (
    <main>
      <h1>Radar BOE para {v?.nombre}</h1>
      <p>Nunca pierdas una publicación relevante sobre {v?.keywords}.</p>
      {/* CTA a /soluciones/boe */}
    </main>
  );
}
```

También crear `web-app/app/radar-boe/ciudad/[ciudad]/page.tsx` con 20 ciudades principales.

**Resultado:** 32+ páginas con URLs únicas, meta tags optimizados, indexadas por Google en 2-4 semanas.

#### PASO 3.3 — Sitemap automático

Crear `web-app/app/sitemap.ts`:
```ts
import { MetadataRoute } from 'next';
import { VERTICALES } from './radar-boe/[vertical]/page';

const CIUDADES = ['madrid','barcelona','valencia','sevilla','bilbao','malaga','zaragoza','murcia','palma','las-palmas','alicante','cordoba','valladolid','vigo','gijon','granada','vitoria','santander','pamplona','donostia'];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mavieautomations.com';
  return [
    { url: base, priority: 1.0 },
    { url: `${base}/soluciones/boe`, priority: 0.95 },
    { url: `${base}/sobre-nosotros`, priority: 0.6 },
    ...VERTICALES.map(v => ({
      url: `${base}/radar-boe/${v.slug}`,
      lastModified: new Date(),
      priority: 0.85,
    })),
    ...CIUDADES.map(c => ({
      url: `${base}/radar-boe/ciudad/${c}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
  ];
}
```

Después: Google Search Console → Sitemaps → `https://mavieautomations.com/sitemap.xml`

---

## FASE 4 — GITHUB COMO SEO Y CREDIBILIDAD (1-2 horas)

### Por qué: Google indexa GitHub. Decisores buscan herramientas antes de comprar.

#### Crear repo público: `github.com/Ahs301/radar-boe-demo`

README.md del repo (este texto atrae búsquedas):
```markdown
# Radar BOE — Monitorización inteligente del BOE para empresas

Sistema de alertas automáticas para el Boletín Oficial del Estado.
Filtra por keywords, genera resúmenes con IA, envía notificaciones por email.

## ¿Quieres el servicio sin montar nada? → mavieautomations.com

## ¿Qué hace?
- Scraping diario BOE + boletines autonómicos
- Filtrado por keywords y antikeywords por cliente
- Resúmenes IA con GPT-4o-mini
- Alertas email en tiempo real
- Multi-tenant: N clientes en una instancia

## Casos de uso reales
- Despacho de abogados: detecta licitaciones en su especialidad
- Consultora subvenciones: alerta de nuevas convocatorias BDNS
- Empresa constructora: seguimiento contratos obras públicas
- Gestoría: cambios normativos fiscales laborales

## Stack técnico
Node.js · Supabase · Next.js 14 · Brevo SMTP · Vercel · VPS

## Versión SaaS → mavieautomations.com/soluciones/boe (desde 79€/mes)
```

Topics del repo en GitHub: `boe`, `spain`, `automatizacion`, `nodejs`, `nextjs`, `saas`, `boletín-oficial`, `web-scraping`, `alertas-email`, `multi-tenant`

Perfil GitHub (`github.com/Ahs301`):
- Bio: "Full-stack · Automatización B2B · Fundador Mavie Automations"
- Website: `https://mavieautomations.com`
- Pin: radar-boe-demo como repo destacado

---

## FASE 5 — LINKEDIN CAPTACIÓN (0€, rutina 30min/día)

### Por qué LinkedIn y no solo email: CTR 10× más alto en B2B, decisores están ahí

**Perfil Josep (optimizar antes de empezar):**
- Headline: `Automatización B2B · Fundador Mavie Automations · Radar BOE para despachos y consultoras`
- About: "Ayudo a despachos de abogados y consultoras a no perderse ninguna publicación relevante del BOE. Tenemos un cliente que detectó 3 licitaciones en su nicho el mes pasado que no habría visto manualmente. → mavieautomations.com"
- URL limpia: `linkedin.com/in/josef-cervera`

**Rutina diaria (30 minutos):**
1. 10 solicitudes de conexión a: perfiles con título "socio", "director", "gerente" en despachos abogados / consultoras subvenciones / España
2. DM a nuevas conexiones (mensaje abajo)
3. 1 post por semana (resultado concreto, no teoría)

**Plantilla DM para nuevas conexiones:**
```
Hola [Nombre],

Gracias por conectar. Trabajo con despachos especializados en 
licitación/subvenciones para que no pierdan ninguna convocatoria del BOE.

Un cliente nuestro detectó 3 licitaciones en su nicho el mes pasado 
que no habría visto con el sistema manual.

¿Tendría sentido mostrarte cómo funciona en 15 minutos esta semana?

Josep | mavieautomations.com
```

**Posts LinkedIn (1/semana, rotar estos temas):**
- "Esta semana el Radar BOE detectó X convocatorias para [sector]"
- "Automaticé el seguimiento del BOE para un despacho. Así funciona."
- "3 publicaciones del BOE que los despachos pierden cada semana"
- "Por qué los abogados de licitación necesitan automatización (caso real)"

---

## UPSELLS Y SERVICIOS (cuando tengas 3+ clientes)

| Producto | Precio | Entrega | Tiempo build |
|----------|--------|---------|--------------|
| Radar BOE SaaS | 79-399€/mes | acceso panel + alertas | 0h (hecho) |
| White-label Radar BOE | 3.000€ + 299€/mes | clon para otro boletín | 3 días |
| Automatización captación B2B | 2.500€ + 400€/mes | scraper + emailing + seguimiento | 1 semana |
| Auditoría automatización | 500€ | diagnóstico + roadmap 90min | 3h |
| Sistema prospección a medida | 1.500-4.000€ | build completo para su nicho | 1-2 semanas |

**El upsell más fácil:** cliente Radar BOE mes 2 → "Puedo montarte el sistema de captación que usamos nosotros internamente" → 2.500€ + 400€/mes. Ya confía en ti, ya paga.

**Boletines adicionales (mismo pipeline, 3 días cada uno):**
- Radar Licitaciones (PLACSP) → constructoras, ingeniería civil
- Radar Subvenciones (BDNS) → gestorías, startups, I+D
- Radar DOUE → empresas que trabajan con normativa europea

---

## PROYECCIÓN ECONÓMICA REALISTA

### Mes 1 (ejecutando Fases 1-3):
- 219 emails/día × 30 días = 6.570 contactos
- Tasa respuesta outbound B2B realista: 1-2%
- Reuniones: 65-130 → cierres al 10-15%: **6-19 clientes nuevos**
- MRR mínimo esperado: 6 × 79€ = **474€** nuevos
- Total MRR con cliente actual: **~600-800€**

### Mes 2-3 (pipeline + SEO empieza):
- LinkedIn activo + primeros rankings orgánicos
- 10-20 clientes activos Radar BOE
- 1-2 servicios puntuales (1.500-3.000€ cada uno)
- MRR: **1.500-3.000€** + ingresos puntuales

### Mes 6 (SEO maduro + referidos + upsells):
- 30-50 clientes SaaS
- 3-5 servicios/mes
- Algunos white-labels
- MRR: **4.000-8.000€**

---

## ORDEN DE ATAQUE — PRÓXIMOS 30 DÍAS

| Semana | Tarea | Horas estimadas |
|--------|-------|-----------------|
| **1** | Crear cuentas Resend + SendGrid (PASO 1.1) | 2h |
| **1** | VPS: Node22 + Chrome deps + código subido | 3h |
| **1** | VPS: PM2 arriba + primer envío real | 2h |
| **1** | Listmonk instalado + leads importados | 2h |
| **2** | Rotación SMTP en email.js (PASO 1.2) | 2h |
| **2** | Páginas programáticas SEO (PASO 3.2) | 4h |
| **2** | Sitemap + Google Search Console | 1h |
| **2** | GitHub repo público radar-boe-demo | 1h |
| **3** | Perfil LinkedIn optimizado | 1h |
| **3** | Rutina DMs LinkedIn (10/día) | 30min/día |
| **3** | Primer post LinkedIn (caso cliente real) | 1h |
| **4** | Revisar stats → ajustar copy si tasa apertura <20% | 1h |
| **4** | Seguimiento reuniones → cerrar clientes | variable |

**Total: ~22 horas en 30 días para montar el sistema completo.**  
Después: 30 minutos/día de gestión. El resto trabaja solo.

---

## COMANDOS OPERACIÓN DIARIA (copiar-pegar en VPS)

```bash
# Estado de todo de un vistazo
pm2 status

# Logs captación (últimos 50)
pm2 logs captacion-worker --lines 50

# Logs BOE Worker
pm2 logs boe-worker --lines 50

# Stats pipeline captación (cuántos enviados, pendientes, respondidos)
curl http://localhost:3002/stats -H "Authorization: Bearer TU_CRON_SECRET"

# Trigger manual envío hoy (si quieres lanzarlo ya sin esperar al cron)
curl -X POST http://localhost:3002/trigger/send \
  -H "Authorization: Bearer TU_CRON_SECRET"

# Trigger follow-up (a los que abrieron pero no respondieron)
curl -X POST http://localhost:3002/trigger/followup \
  -H "Authorization: Bearer TU_CRON_SECRET"

# Trigger scraping manual (nuevos leads ya)
curl -X POST http://localhost:3002/trigger/scrape \
  -H "Authorization: Bearer TU_CRON_SECRET"

# Panel Listmonk
# → Abrir navegador: http://TU_IP_VPS:9000
```

---

## CHECKLIST GLOBAL — TODO LISTO CUANDO ESTÉ EN VERDE

### Infraestructura
- [ ] VPS: Node 22 instalado (`node --version` = v22.x.x)
- [ ] VPS: Chrome deps instaladas
- [ ] VPS: Scraper en `/opt/captacion` con `pm2 status` = online
- [ ] VPS: BOE Worker en `/opt/boe-worker` con `pm2 status` = online
- [ ] VPS: Listmonk en `/opt/listmonk` accesible en puerto 9000
- [ ] VPS: puertos 3001, 3002, 9000 abiertos en UFW
- [ ] Vercel: crons BOE (08:00) + Captación (09:00) activos
- [ ] Vercel: `CAPTACION_WORKER_URL` configurada

### Email stack
- [ ] Brevo SMTP funcionando (300/día)
- [ ] Resend cuenta + dominio verificado (100/día)
- [ ] SendGrid cuenta + dominio verificado (100/día)
- [ ] Gmail dedicado + app password (200/día warm-up)
- [ ] Rotación SMTP en código

### Producto (ya hecho)
- [x] Radar BOE pipeline multi-tenant
- [x] Stripe checkout + webhook + 3 planes
- [x] Panel cliente `/panel` + keywords + destinatarios
- [x] Landing `/soluciones/boe` precios y CTAs
- [x] Vercel cron BOE

### SEO
- [ ] next-seo instalado
- [ ] Mínimo 10 páginas `/radar-boe/[vertical]`
- [ ] Sitemap generado y registrado en Google Search Console
- [ ] GitHub repo público `radar-boe-demo` con README SEO

### Captación activa
- [ ] 18k leads importados en SQLite
- [ ] Copy email actualizado (usar caso cliente real como prueba social)
- [ ] Dry-run OK
- [ ] Primer envío real OK (3-5 emails de prueba)
- [ ] Perfil LinkedIn optimizado
- [ ] Rutina 10 DMs/día activa

---

**Cuando todos los checks estén en verde:**  
Tienes una máquina de captación + conversión que trabaja 24/7 con 0€/mes.  
Tu único trabajo: revisar stats, contestar respuestas, cerrar reuniones.

---

## FASE 7 — SISTEMA DE VIDEOS AUTOMÁTICO (sesiones futuras)

> ⚠️ GATE: No empezar esta fase hasta tener 10+ clientes activos o ≥ 1.500€ MRR. Antes del gate: crear videos manualmente con las escenas HTML existentes y publicar a mano.
>
> ⚠️ ANTES DE CODIFICAR: Instalar skill "Editor Pro Max" de tododeia.com. Ya incluye pipeline Remotion+FFmpeg+templates. Evita construir desde cero lo que ya existe.
>
> Contexto para la IA que retome esto: Josep ya tiene un sistema de reels animados en React (HTML+JSX) en `videosMavie/`. El objetivo es convertirlo en un pipeline completo: guión → voz → video MP4 → publicación automática en RRSS, todo gestionable desde el panel Mavie `/dashboard/videos`.

### Decisiones ya tomadas
- **GPU en VPS:** NO. CPU solo → ~2 min/video de renderizado. Aceptado.
- **Voz:** ElevenLabs voz clonada de Josep (no voz genérica). Josep graba 1 min de voz → ElevenLabs crea su clon → todos los videos suenan como él.
- **Integración:** nueva sección `/dashboard/videos` en el panel Mavie existente (Next.js, ya deployado en Vercel).

### Stack decidido

| Pieza | Tool | Coste | Estado |
|-------|------|-------|--------|
| React scenes → MP4 | **Remotion** (open source) | 0€ | ⏳ pendiente |
| Voz clonada Josep | **ElevenLabs** (free 10k chars/mes) | 0€ | ⏳ pendiente — Josep graba muestra |
| Generación guión | **OpenAI GPT-4o-mini** (ya tienen key) | ~0.01€/video | ⏳ pendiente |
| Mezcla audio+video | **FFmpeg** en VPS | 0€ | ⏳ pendiente |
| Música fondo | **Pixabay/Mixkit API** royalty-free | 0€ | ⏳ pendiente |
| Subida YouTube | YouTube Data API | 0€ | ⏳ pendiente |
| Subida LinkedIn | LinkedIn API | 0€ | ⏳ pendiente |
| Subida Instagram | Meta Graph API | 0€ | ❌ bloqueado — requiere revisión Meta (semanas) |
| Subida TikTok | TikTok Developer API | 0€ | ❌ bloqueado — requiere revisión TikTok |
| Panel gestión | `/dashboard/videos` Next.js | 0€ | ⏳ pendiente |

### Arquitectura del pipeline

```
Panel Mavie /dashboard/videos
  │
  ├── Josep define: tema + tono + duración + plataforma destino
  │
  ▼
[Sesión 1 — Generación]
  OpenAI GPT-4o-mini
    → guión estructurado por escenas (JSON)
    → cada escena: texto, timing, mood
  OpenAI TTS / ElevenLabs (voz Josep)
    → MP3 por escena
  Pixabay API
    → descarga música de fondo (royalty-free por mood)

[Sesión 2 — Renderizado]
  Remotion en VPS (CPU, ~2min/video)
    → toma scenes JSX existentes en videosMavie/
    → inyecta guión + timings dinámicos
    → exporta MP4 sin audio (1080x1920 9:16)
  FFmpeg en VPS
    → mezcla MP4 + voz MP3 + música fondo
    → ajusta volúmenes (voz 100%, música 30%)
    → exporta video final MP4

[Sesión 3 — Publicación]
  Panel preview → Josep aprueba en 30 segundos
  → YouTube Data API → sube con título/descripción/tags generados por GPT
  → LinkedIn API → sube con copy adaptado a LinkedIn
  → Instagram → MANUAL hasta que Meta apruebe la app (aviso en panel)
  → TikTok → MANUAL hasta que TikTok apruebe la app
```

### Lo que existe ya (base de trabajo)

- `videosMavie/animations.jsx` → sistema Stage/Sprite/Easing completo ✅
- `videosMavie/scenes.jsx` → reel 30s Radar BOE completo ✅
- `videosMavie/scenes-promo-20s.jsx` → reel 20s Mavie general ✅
- `videosMavie/Mavie Reel 30s.html` → preview en browser ✅
- `videosMavie/Mavie Promo 20s.html` → preview en browser ✅
- Assets en `videosMavie/assets/` → logos Mavie ✅

### Plan de sesiones

#### Sesión Videos 1 — Remotion + TTS + FFmpeg (~8h código)
**Objetivo:** guión → voz → video MP4 final funcionando en VPS

Pasos:
1. Instalar Remotion en VPS: `npm install @remotion/renderer remotion`
2. Convertir `scenes-promo-20s.jsx` a componente Remotion compatible
3. Endpoint `POST /api/videos/generate` en web-app:
   - Recibe: `{ tema, tono, duracion }`
   - Llama VPS worker → genera guión GPT → TTS ElevenLabs → renderiza MP4 → mezcla FFmpeg
   - Devuelve: URL del video generado
4. Página `/dashboard/videos` básica:
   - Formulario: tema + tono + plataforma
   - Estado: generando / listo
   - Preview del video
   - Botón descargar

#### Sesión Videos 2 — YouTube + LinkedIn auto-upload (~4h código)
**Objetivo:** botón "Publicar" en panel → sube automáticamente

Pasos:
1. Google OAuth en web-app → YouTube Data API v3
2. `POST /api/videos/publish/youtube` → sube MP4 + metadata
3. LinkedIn OAuth → LinkedIn Video Upload API
4. `POST /api/videos/publish/linkedin` → sube + post
5. Panel: estado de publicación por plataforma

#### Sesión Videos 3 — Instagram + TikTok (cuando aprueben)
**Objetivo:** publicación completa en todas las plataformas

- Meta Business App → Instagram Graph API → reels upload
- TikTok for Developers → Content Posting API
- Ambos requieren revisión manual de las plataformas (días o semanas)

### Antes de empezar Sesión Videos 1 — Josep hace esto

1. **Clonar voz en ElevenLabs** (15 min):
   - elevenvoices.com → Sign up gratis
   - Voices → Add Voice → Instant Voice Cloning
   - Grabar o subir 1-2 minutos de audio de Josep hablando claro
   - Copiar `ELEVENLABS_VOICE_ID` y `ELEVENLABS_API_KEY`
   - Añadir a `.env.local` de web-app

2. **Instalar FFmpeg en VPS**:
   ```bash
   apt-get install -y ffmpeg
   ffmpeg -version  # verificar
   ```

3. **Instalar Remotion en VPS**:
   ```bash
   cd /opt/boe-worker  # o crear /opt/video-worker
   npm install @remotion/renderer remotion react react-dom
   ```

### Formatos de video por plataforma

| Plataforma | Formato | Duración ideal | Resolución |
|------------|---------|----------------|------------|
| Instagram Reels | 9:16 MP4 | 15-30s | 1080×1920 |
| TikTok | 9:16 MP4 | 15-60s | 1080×1920 |
| LinkedIn | 16:9 o 1:1 | 30-90s | 1920×1080 |
| YouTube Shorts | 9:16 MP4 | hasta 60s | 1080×1920 |
| YouTube normal | 16:9 MP4 | 5-15min | 1920×1080 |

Los reels React actuales son 1080×1920 (9:16) → perfectos para Instagram/TikTok/Shorts.  
Para LinkedIn/YouTube normal → crear variante Stage `width={1920} height={1080}`.

### Ideas de videos a generar (contenido que convierte)

1. **"¿Qué es el Radar BOE?"** — explicación 20s + CTA → `/soluciones/boe`
2. **"Caso cliente real"** — cómo el cliente detectó 3 licitaciones (anonimizado)
3. **"3 cosas que el BOE publica hoy"** → viral, educativo, engagement
4. **"Antes vs después de automatizar"** → contraste visual, emocional
5. **"¿Cuánto te cuesta NO automatizar?"** → hook numérico como el reel 30s
6. **"Tutorial: cómo configurar alertas BOE"** → SEO YouTube long-tail

---

## CHECKLIST GLOBAL ACTUALIZADO

### Infraestructura core
- [ ] VPS: Node 22 + Chrome deps + Scraper PM2 + BOE Worker PM2
- [ ] VPS: Listmonk Docker + puertos abiertos
- [ ] VPS: FFmpeg instalado
- [ ] VPS: Remotion instalado (`npm i @remotion/renderer`)
- [ ] Vercel: todos los crons + env vars

### Email stack
- [ ] Brevo + Resend + SendGrid + Gmail rotación activa

### Producto (ya hecho — actualizado 2026-04-21)
- [x] Radar BOE pipeline multi-tenant
- [x] Stripe checkout + webhook (4 eventos, portal, página /gracias)
- [x] Panel cliente `/panel` + keywords + destinatarios (Chat C ✅)
- [x] Auth self-service `/acceso` (Supabase Auth cliente)
- [x] Landing precios + CTAs (79/179/399€)
- [x] BOE-Worker como cron automático Vercel (Chat E ✅)
- [ ] **URGENTE: Probar BOE-Worker con cliente real** (Chat B — SIGUIENTE)

### SEO
- [ ] next-seo + páginas programáticas + sitemap
- [ ] Skill "Claude SEO" de tododeia.com instalado (hacerlo junto con las páginas)

### Captación activa
- [ ] 18k leads en SQLite + envío automático activo
- [ ] Multi-SMTP rotación en worker captación VPS (NO en scraper copia)
- [ ] LinkedIn DMs rutina

### Sistema de videos (gate: ≥10 clientes o ≥1.500€ MRR)
- [ ] Skill "Editor Pro Max" de tododeia.com instalado (antes de codificar nada)
- [ ] ElevenLabs: voz Josep clonada + API key en .env
- [ ] FFmpeg en VPS
- [ ] Remotion en VPS
- [ ] Sesión Videos 1: pipeline generación completo
- [ ] Sesión Videos 2: YouTube + LinkedIn auto-upload
- [ ] `/dashboard/videos` en panel Mavie

---

**Cuando todos los checks estén en verde:**  
Tienes captación 24/7 + conversión automática + videos que se generan y publican solos.  
Tu único trabajo diario: revisar stats, aprobar videos, cerrar reuniones.

---

*Josep Cervera · Mavie Automations · mavieautomations.com*  
*Actualizado: 2026-04-21*

---

## FASE 8 — RECURSOS TODODEIA.COM (contexto para IAs futuras)

> Fuente: https://www.tododeia.com/community/proyectos-activos  
> Todos estos proyectos son open source / gratis. Instalar según fase activa.  
> Instrucción para la IA: antes de construir algo desde cero, revisar si alguno de estos proyectos lo resuelve.

---

### TIER 1 — Desbloquean MRR directo (instalar esta semana)

| Proyecto | Tags clave | Para qué sirve en Mavie |
|----------|-----------|------------------------|
| **Protege Tu App** | supabase, RLS, CORS, security-headers | Activar RLS + headers HTTP antes de aceptar pagos reales. Supabase ya en uso. |
| **Instant Landing** | landing, nextjs, ui | Regenerar `/soluciones/boe` completa con precios 79/179/399€ en una ejecución. |
| **The Architect** | arquitectura, blueprint, claude-code | Genera plano de 16 secciones antes de construir Stripe, auth panel o nueva feature. Evita reescribir. |
| **Scrapling** | leads, scraping, google-maps, mcp | Extrae emails + teléfonos de Google Maps y directorios. Despachos de abogados → outbound Fase 1. |
| **All Deploy** | vercel, railway, vps, docker, rollback | Deploy automático de web-app a Vercel o BOE-Worker al VPS con rollback listo. |

---

### TIER 2 — Útiles en semanas 2-4

| Proyecto | Tags clave | Para qué sirve en Mavie |
|----------|-----------|------------------------|
| **Cyber Neo** | seguridad, OWASP, agente, open-source | Escanea 11 dominios de seguridad antes de ir a producción con pagos reales. |
| **Auto-CRM** | crm, local, kanban, ventas | CRM local para gestionar pipeline outbound despachos de abogados. 100% gratis. |
| **Claude SEO** | seo, skill, auditoría, 13 comandos | 13 comandos SEO para auditar y optimizar `/soluciones/boe` y las 32+ páginas programáticas. Usar tras Fase 3 SEO. |
| **Navega y Automatiza** | firecrawl, playwright, scraping, web | Da ojos a Claude: navega, lee y automatiza webs. Útil para enriquecer leads del scraper. |
| **4 Superpoderes Claude** | supadata, apify, playwright, scraping | Apify para scraping de directorios B2B España. Complementa Scrapling. |

---

### TIER 3 — Fase 7 Videos (cuando Fase 1-3 completadas)

| Proyecto | Tags clave | Para qué sirve en Mavie |
|----------|-----------|------------------------|
| **Editor Pro Max** | video, remotion, ffmpeg, whisper, templates | Pipeline guión→MP4 con Remotion. Base de la Sesión Videos 1. 25+ componentes, 9 templates. |
| **Animaciones** | motion, video, assets, remotion | Pipeline de animaciones listas con Remotion. Complementa `videosMavie/animations.jsx` ya existente. |
| **Viral Script Combo** | viral, guiones, voz, claude | Guiones virales + clonación de voz. Para los 6 tipos de video de Fase 7. |
| **Open Carrusel** | carruseles, instagram, agente, branding | Genera carruseles Instagram desde Claude. Canal RRSS alternativo mientras Meta/TikTok revisan la app. |
| **Humanízalo** | humanizer, escritura, 40+ patrones | Reescribe copy generado por IA para que suene como Josep. Para emails de captación y copy landing. |

---

### TIER 4 — Referencia / instalar si se necesita

| Proyecto | Para qué sirve |
|----------|---------------|
| **Claude Web Builder** | No-code landing Next.js + deploy Vercel. Overlap con Instant Landing — usar solo si Instant Landing no cubre. |
| **Arquitecto de Ingresos** | Prompt para planes de monetización. Pricing ya decidido (79/179/399€) → usar solo para upsells o nuevos productos. |
| **The Architect** | Blueprint antes de features grandes. Siempre usar antes de sesiones de código largas. |
| **Claude SEO** | Activar cuando tengamos tráfico en las páginas programáticas (Fase 3). |
| **Skill Vault** | Organiza y analiza skills instalados. Útil si se acumulan muchos skills. |
| **Gbrain** | Memoria permanente para Claude. Alternativa al sistema de memoria actual si falla. |

---

### NO instalar (fuera de scope Mavie hasta 10 clientes)

- Game Studios, Blender, Trading, WhatsApp Agent → no relacionados con BOE/captación
- Todos los tutoriales de principiantes (Claude Chat, Trabajar con Claude, Artefactos, etc.)
- Apps móviles, ecommerce, Shopify → fuera de scope
- Herramientas de diseño (Stitch, Magic UI, Awesome Design MD) → perfeccionar UI es Fase 3+

---

### Cómo instalar desde Claude Code

La mayoría se instalan con un prompt en Claude Code:
```
npx skills.sh install <nombre-skill>
```
O clonando el repo y siguiendo el README. Pedir a Claude: "instala el skill [nombre] de tododeia.com".

**Fuente original:** https://www.tododeia.com/community/proyectos-activos  
**Actualizado:** 2026-04-21

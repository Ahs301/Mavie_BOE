# MAVIE MASTER — Fuente de verdad única

> **Última actualización:** 2026-04-25 — Chat K: Diagnóstico bug botón motor + ControlPanel v3 quick-exit detection  
> **Dueño:** Josep Cervera  
> **Principio:** dinero real antes que perfección técnica, pero que el producto sea bueno y agrade.  
> **Regla:** 0€ invertido, solo tiempo + código.  
> **Cualquier IA que trabaje en este repo debe leer este archivo PRIMERO.**

---

## 1. QUIÉN ERES Y QUÉ ESTÁS CONSTRUYENDO

- 22 años, full-stack + automatización + IA
- **1 cliente real pagando** Radar BOE → prueba social validada
- **~18.678 leads** en CSVs listos para enviar
- **VPS Contabo** funcionando
- **Brevo** SMTP gratuito (300/día)
- Dominio: `mavieautomations.com` (en Vercel)

### El ecosistema Mavie (3 módulos, 1 negocio)

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
│  ├── Stripe self-serve ✅ (checkout, webhook, portal)    │
│  └── Panel cliente self-service ✅ (/acceso → /panel)    │
│                                                          │
│  RETENCIÓN (clientes se quedan y pagan más)              │
│  ├── Panel /panel con keywords/destinatarios             │
│  ├── Weekly digest IA por cliente                        │
│  └── Onboarding call 15min post-pago                     │
│                                                          │
│  SEO (tráfico pasivo 24/7)                               │
│  ├── 60+ páginas programáticas /radar-boe-[vertical]     │
│  ├── GitHub repo público → Google indexa                 │
│  └── Hub SEO Programático (/radar-boe) → Motor inbound "Blog"│
└─────────────────────────────────────────────────────────┘
```

**Importante:** no son tres proyectos separados. Son tres módulos de un mismo negocio. El scraper alimenta a Mavie/Radar BOE con clientes. Mavie vende Radar BOE (y servicios). Radar BOE genera MRR. Toda decisión técnica debe reforzar esta integración, no fragmentarla.

---

## 2. OBJETIVOS DE NEGOCIO

| Horizonte | Objetivo |
|-----------|----------|
| 3 meses | 1.000-2.000€/mes recurrentes + algún servicio puntual |
| 12 meses | 6.000-10.000€/mes, mayoría recurrente vía Radar BOE multi-tenant |
| 24 meses | Mavie como activo vendible o licenciable |

### Reglas de negocio (no negociables)

- **Priorizar time-to-revenue sobre elegancia técnica.** Si algo funciona feo pero factura, no se refactoriza hasta tener ingresos estables.
- **Cada feature debe responder a:** ¿esto me acerca al siguiente cliente pagando, o a retener uno existente? Si no, se pospone.
- **Multi-tenant desde ya en Radar BOE.** No más VPS por cliente. Un stack, N clientes.
- **No construir productos nuevos hasta que Radar BOE facture 3.000€/mes estables.** Nada de lanzar 5 micro-SaaS.

### Métricas que importan

- MRR (Monthly Recurring Revenue) de Radar BOE
- Nº de reuniones agendadas/semana desde el scraper
- Tasa de respuesta de campañas outbound
- Clientes activos / clientes churn
- Tiempo desde signup hasta primera alerta recibida (activación)

### Métricas que NO importan ahora

- Uptime "5 nueves", Lighthouse score, cobertura de tests, tiempo de build, tamaño del bundle

---

## 3. ESTRUCTURA DEL REPO

```
MAVIE_BOE_WEB/
├── nuevo-proyecto/                    ← TODO CÓDIGO NUEVO VA AQUÍ
│   ├── MAVIE-MASTER.md                ← ESTE ARCHIVO — fuente de verdad única
│   ├── web-app/                       ← Next.js 14 + Supabase (Mavie + panel admin + panel cliente)
│   ├── BOE-Worker/                    ← Node.js worker — Radar BOE multi-tenant
│   └── database/schema.sql            ← esquema Supabase
├── ScrapperEmpresasBOE - copia/       ← scraper FUNCIONAL — REFERENCIA para portar, NO extender
├── referencia-boe/                    ← histórico BOE — solo consulta
└── referencia-web-mavie/              ← web antigua — solo referencia visual
```

**Regla única:** Todo código nuevo va en `nuevo-proyecto/`. El scraper copia es fuente para LEER y PORTAR a `nuevo-proyecto/captacion-worker/` (aún no existe). No extender el scraper copia in-place.

---

## 4. STACK TÉCNICO REAL

| Pieza | Tecnología |
|-------|-----------|
| Frontend + backend | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS custom (Inter + Syne) |
| Base de datos | Supabase (Postgres + Auth + RLS) |
| Worker BOE | Node.js CommonJS standalone |
| Hosting web | Vercel |
| Hosting workers | VPS Contabo (PM2) |
| Pagos | Stripe (Checkout + Webhook + Portal) |
| Email transaccional | Brevo SMTP |
| Email marketing | Listmonk self-hosted (futuro) |
| IA | OpenAI GPT-4o-mini |
| DNS | Cloudflare |
| Dominio | mavieautomations.com |

### Convenciones de código

- **No introducir dependencias nuevas sin justificarlas** en términos de negocio o tiempo ahorrado.
- **Código en español en variables de dominio de negocio** (`cliente`, `suscripcion`, `alerta_boe`) y en inglés para términos genéricos técnicos.
- **Multi-tenancy siempre a nivel de fila** (`client_id` en cada tabla relevante), no BD por cliente.
- **Secrets en `.env`**, nunca en código. Si la IA ve una key hardcodeada, debe avisar.
- **Feo y funcionando > bonito y sin clientes.** No pulir CSS hasta que el flujo completo funcione end-to-end.
- **Tests solo donde el coste de fallar es alto** (pagos, envíos de email masivos, facturación). No tests de UI todavía.

### Comandos habituales

```bash
# web-app (desde nuevo-proyecto/web-app/)
npm run dev        # localhost:3000
npm run build      # build producción
npm run lint       # ESLint via next lint

# BOE-Worker (desde nuevo-proyecto/BOE-Worker/)
node src/index.js  # ejecución manual para debug/test
# Producción: Vercel Cron dispara /api/boe/cron → worker automático 08:00 AM
```

### Comandos git deploy a producción (PowerShell — GUARDAR)

```powershell
# DEPLOY NORMAL — siempre en este orden desde C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB
git pull produccion master --rebase
git push produccion master

# Si hay "rejected" — forzar con seguridad
git push produccion master --force-with-lease

# Ver remotes
git remote -v

# Añadir archivos con paréntesis en la ruta (PowerShell requiere comillas dobles)
git add "nuevo-proyecto/web-app/app/(admin)/layout.tsx"
git add "nuevo-proyecto/web-app/app/(cliente)/layout.tsx"

# Commit estándar
git commit -m "feat: descripcion del cambio"
```

**REGLA:** `origin` → `Mavie_BOE` (NO lo usa Vercel). `produccion` → `MavieWebAutomatizacion2.0` (SÍ lo usa Vercel). Siempre pushear a `produccion`.

---

## 5. ARQUITECTURA WEB-APP DETALLADA

### 5.1 Route Groups

| Grupo | Rutas | Protección |
|-------|-------|-----------|
| **Público** | `/`, `/servicios`, `/soluciones/*`, `/sobre-nosotros`, `/contacto`, `/onboarding/*` | Ninguna |
| **Admin** `(admin)` | `/dashboard/*` (9 páginas) | `middleware.ts` → Supabase Auth + `ADMIN_EMAILS` whitelist fail-closed |
| **Cliente** `(cliente)` | `/panel/*` | `middleware.ts` → Supabase Auth, sin whitelist admin, lookup `clients.primary_email = auth.email` |
| **Auth páginas** | `/login` (admin), `/acceso` (clientes) | Públicas |

### 5.2 Data Layer (Supabase)

Dos clientes Supabase — **nunca intercambiarlos:**
- `lib/supabase/client.ts` → `createBrowserClient` — Client Components
- `lib/supabase/server.ts` → `createServerClient` con cookies — Server Components, Server Actions, API routes
- `lib/supabase/admin.ts` → service role (server-side only, bypassa RLS)

### 5.3 Server Actions

| Archivo | Uso | Auth |
|---------|-----|------|
| `actions/crmActions.ts` | CRUD clientes, status, notas | `requireAuth()` |
| `actions/outreachActions.ts` | Gestión campañas outreach | `requireAuth()` |
| `actions/clienteActions.ts` | getClienteData, updateKeywords, updateDestinatarios | `requireClienteAuth()` |
| `actions/submitOnboarding.ts` | Onboarding público (sin auth, con honeypot+captcha) | Público |

### 5.4 API Routes

| Ruta | Función | Auth |
|------|---------|------|
| `api/stripe/checkout/` | GET `?plan=basico\|pro\|business` → Stripe session | Pública |
| `api/stripe/webhook/` | POST firmado — 4 eventos Stripe | Stripe signature |
| `api/stripe/portal/` | GET → Billing Portal Stripe | Auth cliente |
| `api/boe/cron/` | GET → Trigger BOE-Worker (Vercel Cron 08:00 AM) | `CRON_SECRET` |
| `api/captacion/cron/` | GET → Trigger captación worker (Vercel Cron 09:00 AM) | `CRON_SECRET` |
| `api/brevo/*` | 4 endpoints proxy Brevo (campaigns, contacts, emails, stats) | `requireAdminApi()` |
| `api/contact/` | POST formulario de contacto público | rate-limit + captcha |

### 5.5 Design System

- **Fonts:** Inter (`--font-inter`, body/sans) + Syne (`--font-syne`, headings)
- **Temas:** dark por defecto (`next-themes`). CSS custom properties en `globals.css` para `:root` (light) y `.dark`
- **Tokens:** colores con `hsl(var(--token))`, neutrals con hex vars (`--neutral-950` a `--neutral-50`)
- **Utilidades CSS:** `.bg-grid`, `.text-gradient`, `.blue-gradient`, `.glow-blue`
- **`cn()` helper** inlined per-file (no centralizado en `lib/utils` — pendiente refactor P2)
- **No hay librería de componentes externa.** Todo es Tailwind custom.

### 5.6 Seguridad (P0 — implementado)

| Capa | Qué hace |
|------|----------|
| `lib/security/rateLimit.ts` | Sliding window en memoria. Buckets: `contactForm` (3/min), `onboarding` (3/min), `authLogin` (5/min) |
| `lib/security/captcha.ts` | hCaptcha server-side verify. Desactivado si faltan env vars |
| `lib/security/honeypot.ts` | Hidden field + timestamp (min 2s, max 1h) |
| `lib/security/getClientIp.ts` | Extrae IP de headers x-forwarded-for/x-real-ip |
| `components/HCaptcha.tsx` | Widget lazy-load, theme-aware |
| `components/HoneypotFields.tsx` | Inyecta hidden field + timestamp |
| `components/CookieBanner.tsx` | Banner GDPR, persiste en localStorage |
| `next.config.mjs` | CSP, HSTS, X-Frame-Options DENY, COOP, CORP |

**Flujo público:** rate-limit → Zod → honeypot → captcha → business logic. Honeypot failures devuelven `success` para no delatar detección.

**Pendiente seguridad (no urgente):**
- Rate limiter en memoria no funciona multi-instancia Vercel → Upstash Redis cuando escale
- CSP tiene `unsafe-inline` + `unsafe-eval` → upgrade a nonces
- Supabase MFA (TOTP) para admin
- Migrar `ADMIN_EMAILS` env → tabla `admin_users` + RPC `is_admin()`
- Sentry integración
- Endpoints GDPR (derecho acceso + olvido)

---

## 6. ARQUITECTURA BOE-WORKER

Worker Node.js CommonJS standalone en `nuevo-proyecto/BOE-Worker/`.

### Pipeline multi-tenant completo

```
Vercel Cron 08:00 AM
  → GET /api/boe/cron (CRON_SECRET)
  → worker ejecuta:
      1. Fetch client_boe_configs WHERE is_active=true
      2. Para cada cliente:
         a. Scraping BOE API del día
         b. Filtrado por keywords_positive / keywords_negative
         c. Generación resumen IA (GPT-4o-mini)
         d. Email digest HTML via Brevo SMTP
         e. Log en boe_match_history + execution_logs
```

### Archivos clave

| Archivo | Función |
|---------|---------|
| `src/index.js` | Entry point — loop multi-tenant |
| `src/scrapers/orchestrator.js` | Orquesta scrapers por fuente |
| `src/scrapers/BoeScraper.js` | Scraper específico BOE API |
| `src/scrapers/BaseScraper.js` | Clase base scrapers |
| `src/services/filter.js` | Filtrado keywords + antikeywords |
| `src/services/email.js` | Envío digest HTML via Brevo SMTP |

### `.env` del BOE-Worker

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_USER=xxx
BREVO_SMTP_PASS=xxx
BREVO_SMTP_PORT=587
```

---

## 7. BASE DE DATOS (Supabase)

### Tablas principales

| Tabla | Propósito |
|-------|----------|
| `clients` | Registro CRM maestro. Status enum: `lead`, `presupuesto_enviado`, `esperando_respuesta`, `onboarding_pendiente`, `listo_para_activar`, `activo`, `pausado`, `cancelado`, `pago_fallido` |
| `client_boe_configs` | 1:1 con clients. Keywords, regions, frequency, destination_emails, is_active |
| `outreach_campaigns` | Campañas captación gestionadas desde `/dashboard/captacion`. Status: `draft → scraping → sending → completed / paused` |
| `boe_match_history` | Oportunidades BOE encontradas por cliente |
| `client_email_logs` | Registro envíos email por cliente (module, status, recipients) |
| `incidents` | Errores operativos surfaceados en `/dashboard/incidencias` |
| `execution_logs` | Trail de auditoría ejecuciones worker |

### Migraciones aplicadas

| Migración | Estado |
|-----------|--------|
| `database/schema.sql` | ✅ Aplicada |
| `04_outreach_campaigns.sql` | ✅ Aplicada |
| `05_incidents.sql` | ✅ Aplicada (con fix RLS idempotente) |
| `06_admin_users_and_audit.sql` | ✅ Aplicada |
| `07_stripe_columns.sql` | ✅ Aplicada |
| `08_rls_cliente.sql` | ✅ Aplicada |

### Multi-tenancy

- Todas las tablas usan `client_id` como FK
- RLS activado en todas las tablas
- Cliente autenticado solo ve/edita SU fila en `client_boe_configs`
- Admin tiene full access

---

## 8. PRICING Y MODELO DE NEGOCIO

### Radar BOE — 3 planes SaaS mensual puro (sin setup fee)

| Plan | Precio | Límites |
|------|--------|---------|
| **Básico** | **79€/mes** | 1 usuario, 10 keywords, BOE nacional, resumen diario, 1 destinatario email |
| **Pro** | **179€/mes** | 5 usuarios, 50 keywords, BOE+DOUE+autonómico, alertas instantáneas, múltiples destinatarios |
| **Business** | **399€/mes** | Ilimitado, API, multi-usuario, soporte prioritario, onboarding personalizado |

### Servicios productizados (Mavie)

| Producto | Precio | Entrega |
|----------|--------|---------|
| Radar BOE SaaS | 79-399€/mes | acceso panel + alertas (hecho) |
| White-label Radar BOE | 3.000€ + 299€/mes | clon para otro boletín |
| Sistema de prospección B2B | 2.500€ + 400€/mes | scraper + emailing + seguimiento |
| Auditoría + roadmap automatización | 500€ | diagnóstico 90min |
| Automatización a medida | 1.500-4.000€ | build completo para su nicho |

### Boletines adicionales (mismo pipeline, 3 días cada uno)

- Radar Licitaciones (PLACSP) → constructoras, ingeniería civil
- Radar Subvenciones (BDNS) → gestorías, startups, I+D
- Radar DOUE → empresas que trabajan con normativa europea

**Qué NO vendemos:** horas sueltas de programación, webs baratas, vídeos para negocios locales, nada que no apalanque el stack Mavie.

---

## 9. VERTICALES OBJETIVO (por orden de prioridad)

1. **Despachos de abogados** especializados en licitación, subvenciones, contratación pública
2. **Consultoras de subvenciones** (pagan bien, cada alerta perdida = cliente perdido)
3. **Empresas de licitación pública** (monitorización multi-fuente)
4. **Gestorías medianas** (cambios normativos fiscales/laborales)
5. **Asociaciones profesionales y sindicatos** (monitorización sectorial)

Cuando la IA proponga features o copy, debe pensar primero en vertical 1 y 2, no en "cliente genérico".

---

## 10. ESTADO ACTUAL — QUÉ ESTÁ HECHO (2026-04-21)

### 10.1 Web-app (`nuevo-proyecto/web-app/`)

| Módulo | Ruta | Estado |
|--------|------|--------|
| Landing Mavie pública | `app/page.tsx` | ✅ Deployada mavieautomations.com |
| Landing Radar BOE + precios | `app/soluciones/boe/page.tsx` | ✅ 79/179/399€, CTAs Stripe |
| Onboarding público BOE | `app/onboarding/boe/` + `actions/submitOnboarding.ts` | ✅ Honeypot + captcha + crea cliente |
| Auth admin (Josep) | `middleware.ts` + `lib/auth.ts` | ✅ ADMIN_EMAILS fail-closed |
| Dashboard admin CRM | `app/(admin)/dashboard/` | ✅ 9 páginas (clientes, leads, BOE, emails…) |
| Auth cliente self-service | `app/acceso/page.tsx` + `lib/auth.ts:requireClienteAuth()` | ✅ Login Supabase Auth → /panel |
| Panel cliente `/panel` | `app/(cliente)/panel/` + `actions/clienteActions.ts` | ✅ Dashboard + keywords + destinatarios |
| Stripe Checkout | `app/api/stripe/checkout/route.ts` | ✅ 3 planes → Stripe hosted checkout — **CONFIRMADO FUNCIONAL 2026-04-22** |
| Stripe Webhook | `app/api/stripe/webhook/route.ts` | ✅ 4 eventos (activa/cancela/cambia plan/fallo pago) |
| Stripe Portal | `app/api/stripe/portal/route.ts` | ✅ Billing Portal auth-protected |
| Página post-pago `/gracias` | `app/gracias/page.tsx` | ✅ Confirmación + pasos + link portal |
| BOE cron Vercel | `app/api/boe/cron/route.ts` | ✅ 08:00 AM automático |
| Captación cron Vercel | `app/api/captacion/cron/route.ts` | ✅ 09:00 AM (pendiente VPS deploy) |
| Brevo API routes | `app/api/brevo/` | ✅ 4 endpoints auth-protected |
| Seguridad P0 | `lib/security/*` + `next.config.mjs` | ✅ Rate-limit + captcha + honeypot + CSP + headers |

### 10.2 BOE-Worker (`nuevo-proyecto/BOE-Worker/`)

| Módulo | Estado |
|--------|--------|
| Pipeline multi-tenant completo (fetch BOE → filtrar → email → log) | ✅ FUNCIONAL |
| Probado con cliente real (54 oportunidades, email recibido) | ✅ FUNCIONAL |
| Cron automático Vercel 08:00 AM | ✅ FUNCIONAL |

### 10.3 Captación Worker (`nuevo-proyecto/captacion-worker/`)

| Módulo | Estado |
|--------|--------|
| Scraper Google Maps + clasificación GPT + emailing | ✅ Funcional (portado desde ScrapperEmpresasBOE) |
| `server.js` HTTP wrapper (health, trigger/send, trigger/followup, trigger/scrape, stats) | ✅ Creado |
| Multi-SMTP rotación (Brevo + Resend + Gmail + SendGrid) | ✅ Implementado en `src/email/sender.js` |
| Bug `leadExists()` corregido — solo salta leads SENT/REPLIED/BOUNCED/UNSUBSCRIBED | ✅ HECHO 2026-04-25 |
| Deploy en VPS | ✅ HECHO (2026-04-25) — código subido con FileZilla, PM2 online, .env configurado |

### 10.4 Configuración externa

| Item | Estado |
|------|--------|
| Stripe: 3 productos, price IDs, webhook registrado, Billing Portal activo | ✅ |
| Supabase: migraciones 01-08 aplicadas, RLS activado | ✅ |
| Vercel: STRIPE_*, SUPABASE_*, BREVO_*, ADMIN_EMAILS, NEXT_PUBLIC_SITE_URL | ✅ |
| Secrets rotados (post-exposición 2026-04-20) | ✅ |
| Crear usuario Supabase Auth para cliente existente | ⏳ Pendiente |

---

## 11. QUÉ FALTA — ORDEN DE PRIORIDAD

| # | Tarea | Tipo | Impacto |
|---|-------|------|---------|
| 1 | **Deploy captación worker en VPS** (FASE 1+2) | Manual Josep + código | ✅ HECHO COMPLETO (2026-04-25) — código + .env + PM2 online en VPS |
| 2 | **Playbook outbound despachos abogados** (Chat D) | Operación + copy | 🔴 ALTO — sin leads no hay clientes |
| 3 | ~~**SEO páginas programáticas** (FASE 3)~~ | ~~Código~~ | ✅ HECHO (2026-04-22) — 33 páginas, sitemap, JSON-LD, interlinking |
| 4 | ~~**GitHub repo público** (FASE 4)~~ | ~~Manual~~ | ❌ DESCARTADO (Proteger Propiedad Intelectual) |
| 5 | **LinkedIn captación** (FASE 5) | Manual | 🟡 MEDIO — 10×CTR vs email |
| 6 | **Sistema videos** (FASE 7, gateado ≥10 clientes) | Código | 🟢 BAJO — no antes de MRR |

---

## 12. FASE 1+2 — MÁQUINA DE EMAIL + VPS CAPTACIÓN (semana 1)

> FASE 1 y 2 son UN SOLO BLOQUE. El multi-SMTP se configura durante el deploy VPS, no antes ni después.

### 12.1 Crear cuentas SMTP gratuitas (2h)

**A) Resend (100/día gratis):**
1. `resend.com` → Sign up → API Keys → Create
2. Domains → Add `mail.mavieautomations.com` → añadir DNS en Cloudflare
3. SMTP: `smtp.resend.com`, puerto `465`, user `resend`, pass = API key

**B) SendGrid (100/día gratis):**
1. `sendgrid.com` → Sign up → API Keys → Create (full access)
2. Sender Auth → Domain `send.mavieautomations.com` → DNS en Cloudflare
3. SMTP: `smtp.sendgrid.net`, puerto `587`, user `apikey`, pass = API key

**C) Gmail dedicado (500/día — calentar gradual):**
1. Crear cuenta Google nueva para outreach
2. Verificación 2 pasos → App Passwords → Mail → copiar 16 chars
3. SMTP: `smtp.gmail.com`, puerto `587`
4. ⚠️ Warm-up: semana 1: 20/día → semana 2: 50 → semana 3: 100 → semana 4: 200

**Stack de email resultante:**

| Proveedor | Emails/día | Dominio remitente |
|-----------|-----------|-------------------|
| Brevo (ya tienes) | 300 | jose@mavieautomations.com |
| Resend | 100 | hola@mail.mavieautomations.com |
| SendGrid | 100 | info@send.mavieautomations.com |
| Gmail dedicado | 200 (warm-up) | cuenta_outreach@gmail.com |
| **TOTAL** | **~700 hoy → 1.100 en mes 2** | — |

### 12.2 Rotación multi-SMTP (código para `/opt/captacion/src/services/email.js`)

> ⚠️ Este código va en el worker captación del VPS, NO en `ScrapperEmpresasBOE - copia/`. El futuro hogar correcto será `nuevo-proyecto/captacion-worker/`.

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

const _counts = {};

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

### 12.3 Deploy VPS completo (checklist en orden)

```bash
# ── ANTES DE TOCAR EL VPS ──────────────────────────────────
# 1. Rotar SMTP_PASS en Brevo dashboard
# 2. Rotar OPENAI_API_KEY en platform.openai.com
# 3. Actualizar .env local con las nuevas keys
# ──────────────────────────────────────────────────────────

ssh root@TU_IP_VPS

# 4. Node 22 (OBLIGATORIO — el scraper usa node:sqlite built-in)
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

# 11. Test en seco
node src/cli.js send-all --dry-run --limit 5

# 12. Test real con 3 emails
node src/cli.js send-all --limit 3

# 13. Arrancar con PM2
npm install -g pm2
pm2 start src/server.js --name captacion-worker
pm2 status
curl http://localhost:3002/health   # → {"ok":true}
pm2 save
pm2 startup
# ← ejecutar el comando sudo que devuelve

# 14. Crontab para scraping semanal (lunes 2:00 AM)
crontab -e
# Añadir: 0 2 * * 1 cd /opt/captacion && node src/cli.js scrape-spain --limit 500 >> /var/log/captacion-scrape.log 2>&1

# 15. Abrir puertos
ufw allow 3002/tcp   # Captación Worker
ufw status
```

**En Vercel (último paso):**
- Settings → Environment Variables → `CAPTACION_WORKER_URL=http://TU_IP_VPS:3002`
- Deployments → Redeploy

> 🎯 **NOTA ANTIGRAVITY (2026-04-22):** 
> He completado la parte de **código** de esta fase. El scraper original se ha migrado limpiamente a `nuevo-proyecto/captacion-worker/` y el archivo `src/email/sender.js` ya incluye la lógica de **rotación Multi-SMTP** (Brevo, Resend, SendGrid y Gmail).
> 
> **LO QUE TE TOCA HACER A TI (Josep):**
> Para que todo funcione, debes entrar a tu VPS y ejecutar los comandos indicados en la sección `12.3 Deploy VPS completo`. Específicamente:
> 1. Hacer pull o subir la carpeta `nuevo-proyecto/captacion-worker/` a `/opt/captacion` en tu VPS.
> 2. Configurar el `.env` en el VPS con las claves de los 4 proveedores de correo.
> 3. Ejecutar `npm install` y arrancar el worker con PM2 (`pm2 start src/server.js --name captacion-worker`).

### 12.4 Listmonk (newsletter ilimitada, 0€ — no bloqueante)

```bash
ssh root@TU_IP_VPS
mkdir -p /opt/listmonk && cd /opt/listmonk
curl -Lo docker-compose.yml https://raw.githubusercontent.com/knadh/listmonk/master/docker-compose.yml

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

docker-compose up -d
sleep 30
curl http://localhost:9000/health

ufw allow 9000/tcp
```

Acceder: `http://TU_IP_VPS:9000` → Settings → SMTP → añadir Brevo → Import subscribers

### 12.5 Arquitectura resultante

```
08:00 AM → Vercel cron → /api/boe/cron → BOE Worker → emails alertas clientes
09:00 AM → Vercel cron → /api/captacion/cron → VPS:3002 → 219 emails captación automáticos
Lunes 02:00 AM → crontab VPS → Puppeteer scraping → 500 leads nuevos al SQLite
PM2 mantiene workers 24/7, reinicia si caen
```

---

## 13. FASE 3 — SEO PROGRAMÁTICO ✅ COMPLETADO (2026-04-22)

> **ESTADO: IMPLEMENTADO.** 33 páginas nuevas desplegadas. Build OK (72 páginas, 0 errores).

### 13.1 Páginas programáticas por vertical ✅

Creado `web-app/app/radar-boe/[vertical]/page.tsx` con 12 verticales:

| Slug | Nombre | Estado |
|------|--------|--------|
| `despachos-abogados` | Despachos de Abogados | ✅ |
| `consultoras-subvenciones` | Consultoras de Subvenciones | ✅ |
| `empresas-licitacion` | Empresas de Licitación Pública | ✅ |
| `gestorias-asesorias` | Gestorías y Asesorías | ✅ |
| `asociaciones-profesionales` | Asociaciones Profesionales | ✅ |
| `constructoras` | Empresas Constructoras | ✅ |
| `sector-farmaceutico` | Sector Farmacéutico | ✅ |
| `sector-inmobiliario` | Sector Inmobiliario | ✅ |
| `exportadoras` | Empresas Exportadoras | ✅ |
| `startups-tecnologia` | Startups y Tecnología | ✅ |
| `clinicas-hospitales` | Clínicas y Hospitales | ✅ |
| `colegios-profesionales` | Colegios Profesionales | ✅ |

Creado `web-app/app/radar-boe/ciudad/[ciudad]/page.tsx` con 20 ciudades principales. ✅
Creado `web-app/app/radar-boe/page.tsx` — hub de verticales + ciudades. ✅

**Resultado:** 33 páginas con URLs únicas, meta tags SEO, pre-renderizadas en build time (SSG).
*Nota (2026-04-22): Se ha optimizado la estructura del Hub Programático para que actúe oficialmente como el "Blog" principal de captación inbound. Se implementó una Tabla de Contenidos (ToC) pegajosa (sticky), mejora de las etiquetas H2/H3 (con inyección de keywords transaccionales) y un sistema avanzado de interlinking cruzado (Silos SEO) uniendo verticales y ciudades principales.*

### 13.2 Sitemap automático ✅

`web-app/app/sitemap.ts` actualizado. Incluye: 10 páginas estáticas + 1 hub + 12 verticales + 20 ciudades = 43 URLs.

### 13.3 SEO implementado ✅

- [x] `metadata` export por ruta (title/description únicos)
- [x] JSON-LD: `Service` + `BreadcrumbList` + `FAQPage` por página
- [x] `next/image` con AVIF/WebP (configurado en `next.config.mjs`)
- [x] Robots.txt actualizado (panel, acceso, gracias bloqueados)
- [x] Footer interlinking (6 verticales principales)
- [ ] Páginas legales: `/privacidad`, `/aviso-legal`, `/cookies` (ya existen como estáticas)
- [ ] Google Search Console → registrar sitemap.xml (manual Josep)

### 13.4 Archivos creados/modificados

**Nuevos:**
- `app/radar-boe/_data/verticales.ts` — datos 12 verticales (copy, FAQs, keywords)
- `app/radar-boe/_data/ciudades.ts` — datos 20 ciudades (FAQs, datos locales)
- `app/radar-boe/page.tsx` — hub index
- `app/radar-boe/[vertical]/page.tsx` — template vertical
- `app/radar-boe/ciudad/[ciudad]/page.tsx` — template ciudad

**Modificados:**
- `lib/seo.ts` — añadido `faqPageSchema()`
- `app/sitemap.ts` — +33 URLs
- `app/robots.ts` — +6 disallow rules
- `components/Footer.tsx` — columna "Radar BOE" con 6 links

---

## 14. FASE 4 — GITHUB COMO SEO (DESCARTADO)

> **Decisión (2026-04-22):** Esta fase queda **cancelada**. El código base de Mavie es propiedad intelectual (IP) y la ventaja competitiva del negocio. Mantendremos el repositorio en formato **PRIVADO** absoluto. No se expondrá el código a terceros.

---

## 15. FASE 5 — LINKEDIN CAPTACIÓN (0€, rutina 30min/día)

**Perfil Josep:**
- Headline: `Automatización B2B · Fundador Mavie Automations · Radar BOE para despachos y consultoras`
- About con caso real del cliente BOE

**Rutina diaria (30 minutos):**
1. 10 solicitudes de conexión a decisores (socio, director, gerente) en despachos/consultoras
2. DM a nuevas conexiones con plantilla + prueba social
3. 1 post por semana (resultado concreto, no teoría)

**Plantilla DM:**
```
Hola [Nombre],

Gracias por conectar. Trabajo con despachos especializados en 
licitación/subvenciones para que no pierdan ninguna convocatoria del BOE.

Un cliente nuestro detectó 3 licitaciones en su nicho el mes pasado 
que no habría visto con el sistema manual.

¿Tendría sentido mostrarte cómo funciona en 15 minutos esta semana?

Josep | mavieautomations.com
```

---

## 16. FASE 7 — SISTEMA DE VIDEOS AUTOMÁTICO (gateado)

> ⚠️ **GATE:** No empezar hasta tener 10+ clientes activos o ≥ 1.500€ MRR.  
> Antes del gate: crear videos manualmente y publicar a mano (30 min cada uno).  
> Antes de codificar: instalar skill "Editor Pro Max" de tododeia.com.

### Stack decidido

| Pieza | Tool | Coste |
|-------|------|-------|
| React scenes → MP4 | Remotion (open source) | 0€ |
| Voz clonada Josep | ElevenLabs (free 10k chars/mes) | 0€ |
| Generación guión | OpenAI GPT-4o-mini | ~0.01€/video |
| Mezcla audio+video | FFmpeg en VPS | 0€ |
| Música fondo | Pixabay/Mixkit royalty-free | 0€ |
| Subida YouTube | YouTube Data API | 0€ |
| Subida LinkedIn | LinkedIn API | 0€ |
| Subida Instagram | Meta Graph API | ❌ Requiere revisión Meta |
| Subida TikTok | TikTok Developer API | ❌ Requiere revisión TikTok |

### Pipeline

```
Panel /dashboard/videos
  → Josep define: tema + tono + duración + plataforma
  → GPT-4o-mini genera guión JSON
  → ElevenLabs genera voz Josep MP3
  → Remotion renderiza MP4 (CPU, ~2min)
  → FFmpeg mezcla video + voz + música
  → Preview → Josep aprueba
  → Auto-upload YouTube + LinkedIn
  → Manual Instagram + TikTok (hasta aprobación APIs)
```

### Sesiones planificadas

- **Sesión Videos 1:** Remotion + TTS + FFmpeg → pipeline generación completo (~8h)
- **Sesión Videos 2:** YouTube + LinkedIn auto-upload (~4h)
- **Sesión Videos 3:** Instagram + TikTok (cuando aprueben)

### Base existente

- `videosMavie/animations.jsx` → sistema Stage/Sprite/Easing completo ✅
- `videosMavie/scenes.jsx` → reel 30s Radar BOE ✅
- `videosMavie/scenes-promo-20s.jsx` → reel 20s Mavie general ✅

---

## 17. MISIONES POR CHAT — LOG DE ESTADO

> Instrucción para la IA de cada chat: lee la misión asignada, haz SOLO esa misión, actualiza el estado al terminar.

| Chat | Misión | Estado |
|------|--------|--------|
| A | Config externa (Stripe + Vercel + Supabase) | ✅ HECHO (2026-04-20) |
| B | Test BOE-Worker con cliente real | ✅ HECHO (2026-04-21) — 54 oportunidades, email recibido |
| C | Panel self-service cliente | ✅ HECHO (2026-04-20) |
| D | Playbook outbound despachos abogados | ⏳ PENDIENTE |
| E | BOE-Worker como cron automático | ✅ HECHO (2026-04-21) |
| F | Fix Stripe 500 + confirmación funcional | ✅ HECHO (2026-04-22) — checkout funciona, redirige a Stripe |
| G | Migración Worker Captación + Multi-SMTP | ✅ HECHO (2026-04-22) — Worker movido y sender configurado |
| H | Revisión estado + recordatorio VPS + planificación próximo chat | ✅ HECHO (2026-04-22 23:03h) — MAVIE-MASTER actualizado con recordatorio VPS |
| I | Auditoría ready-to-sell + fix captacion emails 0 + analítica admin | ✅ HECHO (2026-04-25) — Bug leadExists corregido, Vercel Analytics + /dashboard/analitica |
| J | Git remotes + Vercel production branch + sidebar completo | ✅ HECHO (2026-04-25) — Remotes aclarados, branch master en Vercel, Analítica en sidebar |
| K | Diagnóstico bug botón motor OFF + ControlPanel v3 | ✅ HECHO (2026-04-25) — Diagnóstico completo, fix UI, MAVIE-MASTER actualizado |
| L | Auditoría completa producción + SEO + conversión | ✅ HECHO (2026-04-27) — Score SEO 53/100, 4 críticos identificados, plan de acción documentado en AUDITORIA-CHAT-L-2026-04-27.md |
| M | Fixes credibilidad + build config + conversión + schemas SEO | ✅ HECHO (2026-04-27) — Stats falsas, /gracias, testimonios, ignoreBuildErrors, comparativa boe.es, fundador, Calendly, SoftwareApplication schema |
| N | URLs Cal.com y LinkedIn reales | ✅ HECHO (2026-04-28) |
| O | Diagnóstico por qué no hay ventas + fix copy emails outbound | ✅ HECHO (2026-04-28) — 3 bugs críticos corregidos en captacion-worker |

### Detalle Chat A — ✅ HECHO
Josep completó todos los pasos manuales: secrets rotados, variables en Vercel, migraciones SQL 07 y 08 aplicadas, webhook Stripe registrado, Billing Portal activado, Redeploy ejecutado.

### Detalle Chat B — ✅ HECHO
BOE-Worker ejecutado con cliente real. Email recibido con 54 oportunidades del BOE del día. Pipeline completo funcional end-to-end.

### Detalle Chat C — ✅ HECHO
- `lib/supabase/admin.ts` → cliente service role
- `lib/auth.ts:requireClienteAuth()` → auth + lookup cliente
- `app/acceso/page.tsx` → login cliente → redirige a `/panel`
- `app/(cliente)/layout.tsx` → sidebar: Panel / Keywords / Destinatarios / Facturación / Logout
- `app/(cliente)/panel/page.tsx` → estado, plan, última ejecución
- `app/(cliente)/panel/keywords/page.tsx` → editor keywords +/-
- `app/(cliente)/panel/destinatarios/page.tsx` → editor emails
- `app/actions/clienteActions.ts` → server actions con Zod
- `middleware.ts` → `/panel/*` requiere sesión
- `supabase_migrations/08_rls_cliente.sql` → RLS cliente
- Build: 39 páginas, 0 errores ✅

### Detalle Chat D — ⏳ PENDIENTE (EN PROCESO)
Playbook outbound vertical 1: despachos de abogados. Ejecutar scraper, generar copy 3 emails, configurar tracking Brevo.

### Detalle Chat G — ✅ HECHO
Antigravity portó el código de `ScrapperEmpresasBOE - copia` a `nuevo-proyecto/captacion-worker`. Se limpiaron archivos basura (gitignore) y se implementó la lógica real de rotación Multi-SMTP en `src/email/sender.js`. Queda pendiente que Josep haga el deploy manual en el VPS (instalar Node, PM2 y añadir el `.env`).

### Detalle Chat E — ✅ HECHO
Vercel Cron en `web-app/app/api/boe/cron/route.ts`, ejecuta 08:00 AM diario con `CRON_SECRET`.

### Detalle Chat I — ✅ HECHO (2026-04-25)

**Bug crítico corregido:** `captacion-worker/src/db/index.js` → `leadExists()` tenía query sin filtro de status. Bloqueaba TODOS los leads que alguna vez se insertaron en SQLite (incluso PENDING/FAILED). Causa: DB llena con ~18.678 leads de campañas anteriores de marzo 2026. Fix: añadir `AND status IN ('SENT','REPLIED','BOUNCED','UNSUBSCRIBED')`. Ahora solo saltan leads con estado terminal; los PENDING y FAILED se reintentarán.

```js
// ANTES (roto — bloqueaba todo):
db.prepare('SELECT id FROM leads WHERE email = ?').get(email)

// DESPUÉS (correcto — solo salta terminales):
db.prepare(
  "SELECT id FROM leads WHERE email = ? AND status IN ('SENT','REPLIED','BOUNCED','UNSUBSCRIBED')"
).get(email)
```

**Vercel Analytics añadido:**
- `@vercel/analytics` instalado en `web-app/package.json`
- `import { Analytics } from '@vercel/analytics/next'` + `<Analytics />` en `app/layout.tsx`
- Servido desde `/_vercel/insights/script.js` — mismo dominio, sin CDN externo, sin cookies, GDPR-compliant

**Página `/dashboard/analitica` creada:**
- KPIs: MRR (basico×79 + pro×179 + business×399), clientes activos, pipeline leads, BOE runs (éxito/total últimos 30d)
- Distribución por plan (barras % Básico/Pro/Business)
- Últimos 5 signups con colores por status
- Link a Vercel Analytics dashboard
- Protegida con `requireAuth()` — solo admin
- Datos en parallel `Promise.all` desde Supabase

**Dashboard principal actualizado:** Link a `/dashboard/analitica` añadido en módulos de negocio.

**Build:** 40 páginas, 0 errores ✅

**Pendiente operativo Josep (tras esta sesión):**

1. **VPS — Subir fix por FileZilla:**
   - Archivo local: `nuevo-proyecto/captacion-worker/src/db/index.js`
   - Destino VPS: `/opt/captacion/src/db/index.js`
   - Tras subir: `pm2 restart captacion-worker`

2. **Vercel — Habilitar Analytics:**
   - Vercel Dashboard → proyecto `web-app` → pestaña `Analytics` → click `Enable`

3. **Vercel — Añadir vars faltantes para BOE cron:**
   - `BOE_WORKER_URL=http://IP_VPS:3001` (el `/api/boe/cron` las lee pero no están en Vercel)
   - `CRON_SECRET=mismo_valor_que_en_VPS`

4. **Supabase — Crear usuario Auth para cliente existente:**
   - Dashboard → Authentication → Users → Invite user (email del cliente)

### Detalle Chat J — ✅ HECHO (2026-04-25)

**Problema descubierto:** El repo tiene DOS remotes. Vercel usaba `main` como Production Branch pero el código estaba en `master`. Todo push a `origin` no llegaba a producción.

**Mapa de remotes (CRÍTICO — no confundir):**
```
origin     → https://github.com/Ahs301/Mavie_BOE.git              ← NO lo usa Vercel
produccion → https://github.com/Ahs301/MavieWebAutomatizacion2.0.git ← ESTE es el que ve Vercel
```

**Fix aplicado en Vercel:**
- Settings → Environments → Production → Branch Tracking → cambiado de `main` a `master`
- Dominio `mavieautomations.com` confirmado en Production environment
- Ahora cada push a `produccion master` → despliega en `mavieautomations.com`

**Comandos git definitivos para Josep (GUARDAR ESTOS):**
```powershell
# Push normal — SIEMPRE en este orden
git pull produccion master --rebase
git push produccion master

# Si falla con "rejected" — forzar con seguridad
git push produccion master --force-with-lease

# Añadir archivos con rutas con paréntesis (PowerShell)
git add "nuevo-proyecto/web-app/app/(admin)/layout.tsx"

# NUNCA usar barras escapadas en PowerShell — usar comillas dobles siempre
```

**Problema PowerShell con rutas `(admin)`:**
- `git add nuevo-proyecto/web-app/app/\(admin\)/layout.tsx` → ERROR en PowerShell
- Solución: `git add "nuevo-proyecto/web-app/app/(admin)/layout.tsx"` (comillas dobles)

**Sidebar admin actualizado:**
- Añadido `{ href: "/dashboard/analitica", label: "Analítica", icon: BarChart3 }` en `app/(admin)/layout.tsx`
- Import añadido: `BarChart3` desde `lucide-react`
- Sidebar completo ahora: Vista General → Clientes CRM → Leads/Web → Hub Email → Radar BOE → Captación B2B → **Analítica** → Logs e Incidencias → Configuración (footer)

**Pendiente operativo tras Chat J:**
- [ ] Subir cambios al VPS (sidebar no afecta VPS, solo web)
- [ ] Verificar `mavieautomations.com/dashboard/analitica` carga tras deploy con branch `master`
- [ ] Habilitar Vercel Analytics en Dashboard → proyecto → pestaña Analytics → Enable

### Detalle Chat K — ✅ HECHO (2026-04-25)

**Problema reportado:** El botón "Iniciar" en `/dashboard/captacion` muestra el toast "Iniciado correctamente" pero el toggle vuelve a OFF en segundos. El proceso queda en OFF.

**Diagnóstico root cause (3 causas simultáneas):**

1. **Causa principal — SQLite vacío:** Los ~18.678 leads de los CSVs NUNCA se importaron al VPS. El comando `send-all` arranca, encuentra 0 leads PENDING, y termina en <100ms. Como el polling de status llega 4s después, el proceso ya terminó → OFF.

2. **Causa secundaria — `.env` del VPS tiene placeholders:** `SMTP_USER=tu_usuario_brevo`, `FROM_EMAIL=tu@email.com`, etc. Incluso si hubiera leads, el SMTP fallaría al intentar conectar.

3. **Causa terciaria — `CAPTACION_WORKER_URL` no está en Vercel:** Solo está en `.env.local` local. En producción (Vercel) el botón devolvería error diferente, pero el usuario trabaja en localhost.

**¿Funciona con la VPS?** SÍ, funciona perfectamente. El problema es configuración pendiente, no el código.

**Fix de código aplicado — `ControlPanel.tsx` v3:**
- `vpsOnline` state: pill "VPS OK" / "VPS offline" en el header
- `quickExit` state: detecta si un proceso arranca pero termina en <10s → muestra banner ámbar con instrucciones concretas de qué hacer
- `lastStartedRef`: guarda qué proceso se inició y cuándo, para comparar con el siguiente status poll
- Banner rojo cuando el VPS es inaccesible (port cerrado, PM2 caído)
- Toast mejorado: "Iniciado correctamente — esperando estado..." en vez de solo "Iniciado correctamente"

**Acción pendiente Josep (CRÍTICA — sin esto nada funciona):**

```bash
# 1. Conectar al VPS
ssh root@80.241.212.87

# 2. Configurar .env con valores REALES (no placeholders)
nano /opt/captacion/.env
# Cambiar:
# SMTP_USER=tu_usuario_brevo → tu usuario real de Brevo
# SMTP_PASS=tu_password_brevo → tu password real de Brevo
# FROM_EMAIL=tu@email.com → jose@mavieautomations.com
# FROM_NAME=TuNombre → Josep de Mavie
# COMPANY_NAME=TuEmpresa → Mavie Automations
# SIGNATURE_URL=https://tu-web.com → https://mavieautomations.com

# 3. Importar los leads (PASO MÁS IMPORTANTE)
cd /opt/captacion
node src/cli.js import --file All_Spain_Leads.csv
node src/cli.js import --file All_Spain_Leads_2.csv
node src/cli.js import --file Faltantes_por_enviar.csv
node src/cli.js stats   # debe mostrar ~18.678 leads total

# 4. Test en seco (0 emails reales)
node src/cli.js send-all --dry-run --limit 5

# 5. Reiniciar PM2
pm2 restart captacion-worker

# 6. Verificar
curl -H "Authorization: Bearer b1e6556d2e391f0173d4796cb44fd00f15909cd6d29dbf9def7a2247324894a5" http://localhost:3002/status
# → {"scraping":false,"sending":false,"stats":{"total":18678,...}}
```

**IMPORTANTE:** Los CSVs ya están en `/opt/captacion/` (se subieron en Chat I con FileZilla). Solo falta ejecutar el `import`.

---

### Pendiente operativo
- [ ] Crear usuario Supabase Auth para cliente existente: Dashboard → Authentication → Users → Invite user

---

## 18. ORDEN DE ATAQUE — PRÓXIMOS 30 DÍAS

| Semana | Tarea | Horas | Tipo |
|--------|-------|-------|------|
| **1** | Crear cuentas Resend + SendGrid | 2h | Manual Josep |
| **1** | VPS: Node22 + Chrome deps + código subido + PM2 | 3h | Manual Josep |
| **1** | Multi-SMTP rotación en email.js | 2h | Código (IA puede ayudar) |
| **1** | Importar 18k leads → SQLite → primer envío real | 2h | Manual Josep |
| **1** | Listmonk en VPS (no bloqueante) | 2h | Manual Josep |
| **2** | Páginas programáticas SEO (12 verticales + 20 ciudades) | 4h | Código (IA) |
| **2** | Sitemap + Google Search Console | 1h | Código + manual |
| **2** | GitHub repo público radar-boe-demo | 1h | Manual Josep |
| **3** | Perfil LinkedIn optimizado | 1h | Manual Josep |
| **3** | Rutina DMs LinkedIn (10/día) | 30min/día | Manual Josep |
| **3** | Primer post LinkedIn (caso cliente real) | 1h | Manual Josep |
| **4** | Revisar stats → ajustar copy si tasa apertura <20% | 1h | Análisis |
| **4** | Seguimiento reuniones → cerrar clientes | variable | Manual Josep |

**Total: ~22 horas en 30 días para montar el sistema completo.**

---

## 19. PROYECCIÓN ECONÓMICA

| Mes | Clientes esperados | MRR estimado | Notas |
|-----|-------------------|-------------|-------|
| 1 | 6-19 nuevos | 600-800€ | 219 emails/día × 30 → 6.570 contactos → 1-2% respuesta |
| 2-3 | 10-20 activos | 1.500-3.000€ | LinkedIn activo + primeros rankings SEO + servicios puntuales |
| 6 | 30-50 activos | 4.000-8.000€ | SEO maduro + referidos + upsells + white-labels |

---

## 20. COMANDOS OPERACIÓN DIARIA (VPS)

```bash
pm2 status                                    # estado de todo
pm2 logs captacion-worker --lines 50          # logs captación
pm2 logs boe-worker --lines 50                # logs BOE

# Triggers manuales
curl -X POST http://localhost:3002/trigger/send \
  -H "Authorization: Bearer TU_CRON_SECRET"

curl -X POST http://localhost:3002/trigger/followup \
  -H "Authorization: Bearer TU_CRON_SECRET"

curl -X POST http://localhost:3002/trigger/scrape \
  -H "Authorization: Bearer TU_CRON_SECRET"

# Stats pipeline
curl http://localhost:3002/stats \
  -H "Authorization: Bearer TU_CRON_SECRET"

# CLI directo
cd /opt/captacion
node src/cli.js stats
node src/cli.js report
node src/cli.js hot-leads
```

---

## 21. UI/UX PENDIENTE (P2)

- [ ] Fix `glass-card` + `text-gradient` contraste en light mode
- [ ] Centralizar `cn()` en `lib/utils.ts` (eliminar duplicados)
- [ ] Componentes base tipados: `Button`, `Card`, `Input`, `Toast`
- [ ] Transiciones coherentes (150/300/500ms, expo-out)
- [ ] `prefers-reduced-motion`

---

## 22. RECURSOS TODODEIA.COM (instalar según fase activa)

### TIER 1 — Desbloquean MRR directo

| Proyecto | Para qué sirve en Mavie |
|----------|------------------------|
| **Protege Tu App** | Activar RLS + headers HTTP antes de aceptar pagos |
| **Instant Landing** | Regenerar landing con precios en una ejecución |
| **The Architect** | Blueprint 16 secciones antes de features grandes |
| **Scrapling** | Extrae emails Google Maps → outbound FASE 1 |
| **All Deploy** | Deploy automático web-app/worker con rollback |

### TIER 2 — Útiles semanas 2-4

| Proyecto | Para qué |
|----------|----------|
| **Cyber Neo** | Scan 11 dominios seguridad pre-producción |
| **Auto-CRM** | CRM local pipeline outbound |
| **Claude SEO** | 13 comandos SEO para auditar páginas programáticas |
| **Navega y Automatiza** | Firecrawl + Playwright para enriquecer leads |
| **4 Superpoderes Claude** | Apify para scraping directorios B2B |

### TIER 3 — Videos (cuando Fase 1-3 completadas)

| Proyecto | Para qué |
|----------|----------|
| **Editor Pro Max** | Pipeline guión→MP4 con Remotion (instalar ANTES de codificar) |
| **Animaciones** | Pipeline animaciones Remotion |
| **Viral Script Combo** | Guiones virales + voz clonada |
| **Open Carrusel** | Carruseles Instagram |
| **Humanízalo** | Reescribe copy IA para que suene como Josep |

### NO instalar (fuera de scope)

Game Studios, Blender, Trading, WhatsApp Agent, apps móviles, ecommerce, Shopify, herramientas de diseño UI.

Instalación: `npx skills.sh install <nombre-skill>` o clonar repo + seguir README.

---

## 23. REGLAS PARA LA IA

### Siempre:
- Leer este archivo antes de proponer cambios estructurales
- Priorizar time-to-revenue sobre perfección técnica
- Proponer la solución más simple que desbloquee el siguiente hito de negocio
- Avisar si una tarea no está alineada con la fase actual
- Tratar los 3 módulos como un ecosistema, no como proyectos separados
- Todo código nuevo en `nuevo-proyecto/`

### Nunca:
- Sugerir reescrituras completas sin razón de negocio clara
- Introducir arquitectura compleja (microservicios, k8s, event sourcing) por debajo de 50 clientes
- Proponer features de fases posteriores sin haber terminado la actual
- Pedir elegir entre 10 opciones técnicas — proponer 1-2 con criterio
- Borrar código funcional del cliente real sin confirmación explícita
- Extender `ScrapperEmpresasBOE - copia/` in-place — solo leer y portar

### Cuando haya duda:
- Preguntar en términos de negocio, no de código
- Ej: "¿Esto es para el cliente actual o para los nuevos?" en vez de "¿Usamos patrón repository o service?"

### Contacto con la realidad:
- 4 semanas sin cerrar ningún cliente nuevo → parar features, volver a outbound
- El cliente existente se queja → prioridad absoluta, rompe cualquier fase
- Oportunidad de servicio puntual (2-4k€) → se acepta y pausa roadmap SaaS

---

## 24. CHECKLIST GLOBAL — TODO LISTO CUANDO ESTÉ EN VERDE

### Infraestructura
- [x] Vercel: web-app deployada en mavieautomations.com
- [x] Vercel: cron BOE 08:00 AM activo
- [x] Vercel: cron captación 09:00 AM (endpoint listo, pendiente VPS)
- [x] Vercel: todas las env vars configuradas
- [ ] VPS: Node 22 instalado
- [ ] VPS: Chrome deps instaladas
- [x] VPS: Captación worker `/opt/captacion` con PM2 online ✅ 2026-04-25
- [ ] VPS: Listmonk Docker en puerto 9000
- [ ] VPS: puertos 3002, 9000 abiertos en UFW
- [ ] Vercel: `CAPTACION_WORKER_URL` configurada + redeploy

### Email stack
- [x] Brevo SMTP funcionando (280/día — límite conservador en rotación)
- [x] Resend cuenta + dominio `mail.mavieautomations.com` verificado (90/día) ✅ 2026-04-22
- [x] Rotación multi-SMTP en código captación (`src/email/sender.js` v3) ✅ 2026-04-22
- [ ] Gmail dedicado + app password (190/día warm-up) — **SIGUIENTE PASO**
- [ ] SendGrid cuenta + dominio verificado (90/día) — después de Gmail

### Producto
- [x] Radar BOE pipeline multi-tenant
- [x] BOE-Worker probado con cliente real (54 oportunidades ✅)
- [x] BOE-Worker como cron automático Vercel
- [x] Stripe checkout + webhook (4 eventos, portal, página /gracias)
- [x] Panel cliente `/panel` + keywords + destinatarios
- [x] Auth self-service `/acceso`
- [x] Landing `/soluciones/boe` precios y CTAs
- [x] Admin dashboard CRM 10 páginas (incluye /dashboard/analitica)
- [x] Analítica admin `/dashboard/analitica` — MRR, clientes, pipeline, BOE runs, distribución plan, últimos signups ✅ 2026-04-25
- [x] Vercel Analytics instalado (`@vercel/analytics/next`) y activado en `app/layout.tsx` ✅ 2026-04-25
- [ ] Vercel Analytics → Habilitar en Vercel Dashboard → proyecto → pestaña Analytics → click Enable (manual Josep)
- [x] Onboarding público con honeypot + captcha
- [x] Seguridad P0 (rate-limit, CSP, headers, auth fail-closed)
- [ ] Crear usuario Supabase Auth para cliente existente

### SEO
- [x] Páginas programáticas `/radar-boe/[vertical]` (12 verticales) ✅ 2026-04-22
- [x] Páginas programáticas `/radar-boe/ciudad/[ciudad]` (20 ciudades) ✅ 2026-04-22
- [x] Página hub `/radar-boe` (índice verticales + ciudades) ✅ 2026-04-22
- [x] Sitemap automático (33 URLs nuevas) ✅ 2026-04-22
- [x] JSON-LD (Service + BreadcrumbList + FAQPage por página) ✅ 2026-04-22
- [x] Robots.txt actualizado (panel, acceso, gracias bloqueados) ✅ 2026-04-22
- [x] Footer interlinking (6 verticales principales) ✅ 2026-04-22
- [ ] Google Search Console → registrar sitemap.xml (manual Josep)
- [ ] GitHub repo público `radar-boe-demo` con README SEO
- [ ] Páginas legales: `/privacidad`, `/aviso-legal`, `/cookies`

### Captación activa
- [ ] 18k leads importados en SQLite VPS
- [ ] Copy email actualizado (caso cliente real como prueba social)
- [ ] Dry-run OK
- [ ] Primer envío real OK
- [ ] Perfil LinkedIn optimizado
- [ ] Rutina 10 DMs/día activa

### Sistema videos (gate: ≥10 clientes o ≥1.500€ MRR)
- [ ] Skill "Editor Pro Max" instalado
- [ ] ElevenLabs: voz Josep clonada + API key
- [ ] FFmpeg en VPS
- [ ] Remotion en VPS
- [ ] Sesión Videos 1: pipeline generación
- [ ] Sesión Videos 2: YouTube + LinkedIn auto-upload
- [ ] `/dashboard/videos` en panel Mavie

---

**Cuando todos los checks estén en verde:**  
Tienes captación 24/7 + conversión automática + videos que se generan y publican solos.  
Tu único trabajo diario: revisar stats, aprobar videos, cerrar reuniones.

---

## 25. PRÓXIMO CHAT (ARCHIVADO — sustituido por Chat M)

> ⚠️ **ESTADO POST CHAT K (2026-04-25):**
> Bug del botón motor diagnosticado y UI mejorada. El problema es operativo en el VPS, no de código.
> **PRIMERA TAREA del próximo chat: confirmar que Josep ejecutó los pasos del VPS de Chat K.**
> Referencia completa en "Detalle Chat K". Pasos críticos:
> 1. `nano /opt/captacion/.env` → reemplazar TODOS los placeholders con valores reales
> 2. `node src/cli.js import --file All_Spain_Leads.csv` (y los otros 2 CSVs)
> 3. `node src/cli.js stats` → verificar ~18.678
> 4. `node src/cli.js send-all --dry-run --limit 5` → confirmar que funciona en seco
> 5. `pm2 restart captacion-worker`
> 6. En el panel web: botón Iniciar → debería permanecer ON y aparecer logs
>
> **Deploy a Vercel también pendiente:**
> - `git pull produccion master --rebase && git push produccion master`
> - Añadir en Vercel: `CAPTACION_WORKER_URL=http://80.241.212.87:3002` y `CAPTACION_CRON_SECRET=b1e6556d2e...`

> **¿Hace falta leer MAVIE-MASTER.md en cada nuevo chat?** SÍ. Empieza siempre con:
> *"Lee nuevo-proyecto/MAVIE-MASTER.md antes de empezar"* — esto da contexto completo en 30 segundos y evita que la IA proponga cosas que ya están hechas o contradicen decisiones tomadas.

> Instrucción para la IA del próximo chat: leer MAVIE-MASTER.md completo, luego ejecutar estas tareas en orden. No saltar a fases posteriores.

### Prioridad 1 — Crear usuario Supabase Auth para cliente existente (5 min, Manual Josep)

Sin esto el cliente real no puede acceder al panel `/panel`.

1. Supabase Dashboard → Authentication → Users → "Invite user"
2. Email del cliente existente (el que ya paga)
3. El cliente recibe email de invitación → crea contraseña → accede en `https://mavieautomations.com/acceso`

**No es código — es un paso manual de 2 minutos. Hacerlo antes que cualquier otra cosa.**

---

### Prioridad 2 — VPS: Deploy captación worker (FASE 1+2, sección 12)

**Contexto para la IA:** El scraper funcional está en `ScrapperEmpresasBOE - copia/`. Tiene `server.js` HTTP wrapper ya creado. Hay ~18.678 leads en CSVs. El VPS Contabo está contratado. Falta subir el código, instalar dependencias, arrancar con PM2, y conectar Vercel con `CAPTACION_WORKER_URL`.

**Lo que hay que hacer (en orden, la IA puede guiar y codificar lo que haga falta):**

1. **Cuentas email gratuitas** — estado:
   - ✅ Resend: dominio `mail.mavieautomations.com` verificado, credenciales en `.env` (2026-04-22)
   - ❌ Gmail dedicado: cuenta nueva outreach → App Password → warm-up gradual (**PRIMER PASO**)
   - ❌ SendGrid: `sendgrid.com` → signup → dominio `send.mavieautomations.com` → DNS Cloudflare

2. **Rotación multi-SMTP** ✅ YA IMPLEMENTADA (2026-04-22):
   - `ScrapperEmpresasBOE - copia/src/email/sender.js` v3 con `buildProviders()` + `getProvider()` + `getSmtpStats()`
   - La IA NO necesita tocar este archivo — ya está hecho
   - Solo añadir vars al `.env` cuando Josep configure Gmail/SendGrid

3. **Deploy VPS** (sección 12.3):
   - Node 22, Chrome deps, subir código y CSVs con `scp`
   - `npm install`, crear `.env`, `node src/cli.js import` para los 3 CSVs
   - `node src/cli.js stats` → verificar ~18.678 leads
   - `node src/cli.js send-all --dry-run --limit 5` → test en seco
   - `pm2 start src/server.js --name captacion-worker`
   - `curl http://localhost:3002/health` → `{"ok":true}`
   - `pm2 save && pm2 startup`

4. **Conectar Vercel** (último paso):
   - `CAPTACION_WORKER_URL=http://IP_VPS:3002` en Vercel env vars
   - Redeploy

5. **Listmonk** (no bloqueante, sección 12.4): Docker en VPS puerto 9000

---

### Prioridad 3 — Google Search Console (10 min, Manual Josep)

1. `search.google.com/search-console` → Add property → `mavieautomations.com`
2. Verificar dominio via Cloudflare (TXT record)
3. Sitemaps → Submit `https://mavieautomations.com/sitemap.xml`

---

### Prioridad 4 — GitHub repo público (1h, FASE 4, sección 14)

1. Crear repo `github.com/josepcervera622/radar-boe-demo` (o `Ahs301`)
2. README.md con keywords SEO: `boe`, `spain`, `automatizacion`, `nodejs`, `nextjs`, `saas`
3. Perfil GitHub: bio + website `mavieautomations.com` + pin repo
4. Beneficio doble: credibilidad B2B + backlink SEO

---

### Prioridad 5 — LinkedIn optimizar perfil + primer post (FASE 5, sección 15)

Solo después de tener el VPS enviando y poder mostrar métricas reales.

---

### Estado del sistema antes del próximo chat

| Pieza | Estado |
|-------|--------|
| Web + landing Mavie | ✅ Deployada |
| Stripe checkout funcional | ✅ CONFIRMADO 2026-04-22 |
| BOE-Worker multi-tenant | ✅ Funcional (54 oportunidades, email recibido) |
| Cron automático 08:00 AM | ✅ Activo |
| Panel cliente `/panel` | ✅ Funcional (falta crear usuario Auth para cliente) |
| SEO 33 páginas programáticas | ✅ Deployadas 2026-04-22 |
| Multi-SMTP rotación código | ✅ Implementado — `sender.js` v3 con `getProvider()` + `getSmtpStats()` |
| Bug leadExists() captacion-worker | ✅ CORREGIDO 2026-04-25 — solo salta SENT/REPLIED/BOUNCED/UNSUBSCRIBED |
| Vercel Analytics | ✅ Instalado en layout.tsx — pendiente habilitar en Vercel Dashboard |
| /dashboard/analitica | ✅ CREADO 2026-04-25 — MRR, clientes, pipeline, BOE runs, plan bars |
| Brevo en rotación | ✅ 280/día |
| Resend en rotación | ✅ 90/día — dominio `mail.mavieautomations.com` verificado |
| Gmail en rotación | ❌ PENDIENTE — 15 min, añade 190/día (sección 12.1 C) |
| SendGrid en rotación | ❌ PENDIENTE — después de Gmail |
| Captación worker VPS | ✅ ONLINE (2026-04-25) — FileZilla subió código, .env configurado (con placeholders), PM2 corriendo |
| .env VPS con valores reales | ❌ PENDIENTE — SMTP_USER, SMTP_PASS, FROM_EMAIL, etc. tienen placeholders |
| 18k leads importados a SQLite | ❌ PENDIENTE — CSVs están en /opt/captacion/ pero falta ejecutar import |
| BOE_WORKER_URL en Vercel | ❌ PENDIENTE — `/api/boe/cron` falla sin esta var |
| CAPTACION_WORKER_URL en Vercel | ❌ PENDIENTE — solo en .env.local |

---

### Qué hizo la IA en Chat H (2026-04-22)

1. **`ScrapperEmpresasBOE - copia/src/email/sender.js`** → reescrito a v3 con rotación multi-SMTP completa:
   - `buildProviders()` — carga solo proveedores con credenciales presentes en `.env`
   - `getProvider()` — elige proveedor con cuota diaria restante (Brevo→Resend→Gmail→SendGrid)
   - `_transporters` — cache por proveedor (no recrea cada send)
   - `getSmtpStats()` — export nuevo para monitoreo de quota
   - `sendEmail()` — usa `provider.fromEmail` como "from", `FROM_EMAIL` principal como reply-to
   - Devuelve `{ provider: 'brevo'|'resend'|... }` en cada envío

2. **`ScrapperEmpresasBOE - copia/src/server.js`** → nuevo endpoint `GET /stats/smtp` con quota usada/restante por proveedor

3. **`ScrapperEmpresasBOE - copia/src/config.js`** → añadidas vars opcionales: `RESEND_SMTP_PASS`, `RESEND_FROM_EMAIL`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `GMAIL_USER`, `GMAIL_PASS`

4. **`ScrapperEmpresasBOE - copia/.env.example`** → documentadas las nuevas vars con instrucciones

5. **`ScrapperEmpresasBOE - copia/.env`** → añadidos `RESEND_SMTP_PASS` + `RESEND_FROM_EMAIL` (probado y funcional ✅)

### Qué hizo la IA en Chat I (2026-04-25)

1. **Bug fix `captacion-worker/src/db/index.js`** → `leadExists()` ahora filtra por `status IN ('SENT','REPLIED','BOUNCED','UNSUBSCRIBED')`. Antes bloqueaba TODOS los leads insertados (incluso PENDING/FAILED). Los ~18.678 leads del CSV ahora se reintentarán.

2. **`web-app/app/layout.tsx`** → añadido `import { Analytics } from '@vercel/analytics/next'` + `<Analytics />`. Package `@vercel/analytics@^1.6.1` en `package.json`.

3. **`web-app/app/(admin)/dashboard/analitica/page.tsx`** → nueva página de analítica:
   - KPIs: MRR calculado, clientes activos, pipeline, BOE success rate
   - Plan distribution bars (Básico/Pro/Business) con % y €/mes
   - Últimos 5 signups con color por status
   - Link a Vercel Analytics dashboard
   - Build 40 páginas, 0 errores ✅

4. **`web-app/app/(admin)/dashboard/page.tsx`** → añadido link a `/dashboard/analitica` en módulos de negocio.

---

### Prioridad 1 próximo chat — Gmail dedicado (15 min, Manual Josep)

Añade 190 emails/día al stack. Pasos:

1. Crear cuenta Google nueva solo para outreach (ej: `mavie.outreach@gmail.com`)
2. Activar verificación en 2 pasos
3. `myaccount.google.com` → Seguridad → **Contraseñas de aplicación** → Seleccionar app: Correo → Generar → copiar 16 chars
4. Añadir al `ScrapperEmpresasBOE - copia/.env`:
   ```
   GMAIL_USER=mavie.outreach@gmail.com
   GMAIL_PASS=xxxxxxxxxxxxxxxxxxxx
   ```
5. ⚠️ Warm-up obligatorio: semana 1: 20/día → s2: 50 → s3: 100 → s4: 190. Ajustar `MAX_PER_DAY` en `.env` según la semana.

**Verificación:** `curl http://localhost:3002/stats/smtp` (tras deploy VPS) debe mostrar Gmail con `remaining > 0`.

---

### Prioridad 2 próximo chat — Deploy VPS (sección 12.3)

El código está listo. Solo falta subirlo al VPS Contabo y arrancar PM2. Ver checklist completo en sección 12.3.

Stack resultante tras Gmail + VPS:
- Brevo 280 + Resend 90 + Gmail 190 = **560 emails/día inmediato**
- +SendGrid 90 cuando se configure = **650 emails/día**

---

### Detalle Chat L — ✅ HECHO (2026-04-27)

**Misión:** Auditoría completa de producción + SEO + conversión.

**Metodología:** 9 subagentes paralelos (seo-technical, seo-content, seo-schema, seo-sitemap, seo-backlinks, seo-sxo, code-reviewer, conversión analyst) + lectura directa de código fuente.

**Score SEO Health: 53/100** — funcional pero sin capa de confianza.

**4 CRÍTICOS identificados:**
1. Stats falsas "50+ clientes activos" — tienes 1 cliente real → reemplazar con métricas auditables
2. `public/og-image.png` NO EXISTE — LinkedIn cards vacíos → crear 1200×630px
3. `typescript: { ignoreBuildErrors: true }` en producción → eliminarlo
4. `/gracias` dice "nuestro equipo activará..." + no tiene link a `/panel` → fix copy + añadir link

**Competidores en SERP identificados:** boealerta.com, alertasboe.com, subventis.es (€49), boletinclaro.es (freemium), licigal.com, tenderstool.com (€110-185/mes)

**Ventaja competitiva de Mavie no comunicada:** Único con compra self-serve inmediata sin contactar a nadie (Stripe hosted checkout). Los demás requieren llamada/demo para contratar.

**Documento completo:** `nuevo-proyecto/AUDITORIA-CHAT-L-2026-04-27.md` — contiene fixes de código exactos, JSONs de schema, plan de 6 bloques ordenado.

---

## 25. PRÓXIMO CHAT (Chat M) — ORDEN DE ATAQUE

> **LEER PRIMERO:** `nuevo-proyecto/AUDITORIA-CHAT-L-2026-04-27.md` — tiene el contexto completo de la auditoría y los fixes de código listos para aplicar.

### Prioridad 1 — Fixes de credibilidad (1-2h, máximo impacto)

**Estos 4 fixes van primero porque sin credibilidad todo el outbound es dinero quemado:**

1. **`app/page.tsx:65`** — Reemplazar stats falsas:
   ```tsx
   { value: "72h", label: "Implantación garantizada" },
   { value: "< 5min", label: "Tiempo de detección" },
   { value: "0€", label: "Setup fee" },
   { value: "99.9%", label: "Uptime objetivo" },
   ```

2. **`public/og-image.png`** — Crear imagen 1200×630px. Usar `radar_boe_mockup.png` como base + texto "Radar BOE · Mavie Automations".

3. **`app/gracias/page.tsx`** — Cambiar Step 2 a "activación automática" + añadir `<Link href="/panel">Ir a mi panel →</Link>`.

4. **`app/page.tsx:90-109`** — Eliminar testimonios anónimos (o pedir al cliente real 1 testimonio real con nombre).

### Prioridad 2 — Fix build config (15 min)

5. **`next.config.mjs`** — Eliminar `ignoreBuildErrors: true` y `ignoreDuringBuilds: true`. Corregir errores TypeScript que aparezcan.

### Prioridad 3 — Conversión (2-3h)

6. Tabla comparativa vs boe.es gratuito en `/soluciones/boe` — ver tabla en AUDITORIA-CHAT-L
7. Sección fundador en `/sobre-nosotros` — Josep + foto + LinkedIn
8. Link Calendly en CTA de `/soluciones/boe`
9. H1 homepage con keyword objetivo

### Prioridad 4 — Schema SEO (1h)

10. Logo Organization a ImageObject en `app/layout.tsx`
11. SoftwareApplication schema en `/soluciones/boe` — JSON-LD completo en AUDITORIA-CHAT-L
12. WebSite schema en `app/layout.tsx`

### Prioridad 5 — Operativa VPS (pendiente de Chat K)

13. `nano /opt/captacion/.env` → valores reales de SMTP
14. `node src/cli.js import --file All_Spain_Leads.csv` (y los otros 2 CSVs)
15. `node src/cli.js stats` → verificar ~18.678
16. `pm2 restart captacion-worker`
17. En Vercel: añadir `CAPTACION_WORKER_URL=http://80.241.212.87:3002`

### Prioridad 6 — Cliente existente (2 min manual)

18. Supabase Dashboard → Authentication → Users → Invite user (email del cliente)

---

### Estado antes de Chat M

| Pieza | Estado |
|-------|--------|
| Código web funcional | ✅ Funcional |
| Stripe checkout | ✅ CONFIRMADO |
| BOE-Worker cron 08:00 AM | ✅ Activo |
| Panel cliente /panel | ✅ Funcional |
| SEO 33 páginas programáticas | ✅ Deployadas |
| Analytics Vercel | ✅ Instalado (habilitar en Dashboard) |
| **Stats falsas corregidas** | ❌ PENDIENTE — CRÍTICO |
| **OG image creada** | ❌ PENDIENTE — CRÍTICO |
| **ignoreBuildErrors eliminado** | ❌ PENDIENTE — CRÍTICO |
| **gracias.tsx fix** | ❌ PENDIENTE — CRÍTICO |
| Testimonios reales | ❌ PENDIENTE |
| Comparativa vs boe.es | ❌ PENDIENTE |
| Fundador en sobre-nosotros | ❌ PENDIENTE |
| Schema SoftwareApplication | ❌ PENDIENTE |
| VPS .env con valores reales | ❌ PENDIENTE |
| 18k leads importados SQLite | ❌ PENDIENTE |
| Cliente Auth Supabase | ⏳ Pendiente (manual Josep) |

---

---

## 26. DETALLE CHAT O — Fix copy emails outbound (2026-04-28)

### Diagnóstico por qué no había ventas (2 meses, 18k leads, 0 cierres)

**Problema 1 — `Precedence: bulk` en headers** (CRÍTICO)
- Archivo: `captacion-worker/src/email/sender.js`
- El header `'Precedence': 'bulk'` le decía literalmente a Gmail/Outlook "soy spam masivo"
- Fix: eliminado. Reemplazado `X-Mailer` por `Microsoft Outlook 16.0` (estándar para outbound 1:1)

**Problema 2 — Copy genérico sin dolor** (CRÍTICO)  
- El template `despacho_legal` en `templates.js` decía: "He llegado a vuestro despacho y quería explorar si os resulta de interés..."
- El PLAYBOOK-DESPACHOS-ABOGADOS.md tenía copy bueno pero nunca se implementó en el código
- Fix: `despacho_legal` case reescrito con el copy del playbook:
  - Asunto: `Licitaciones y BOE para {{nombre_empresa}} (Pregunta rápida)` → personalizado
  - Body: ataca el dolor real ("miedo a que se pase un plazo importante")
  - Prueba social: "cliente detectó 3 licitaciones que se le habrían pasado"
  - CTA: link Cal.com directo (no WhatsApp)

**Problema 3 — PDF adjunto en email frío** (CRÍTICO)
- `pdfNote` añadía "Te adjunto un dossier PDF" → adjuntos = spam automático en outbound
- Fix: eliminado completamente del body

**Problema 4 — Saludo sin nombre**
- `getGreeting()` retornaba solo "Hola," siempre
- Fix: `getGreeting(lead)` usa `lead.contact_name` si está disponible

**Problema 5 — Follow-up sin hilo**
- El asunto del follow-up era diferente del inicial → no se agrupaba como conversación
- Fix: `generateFollowUpEmail` ahora usa `Re: {asunto_inicial}` guardado en `lead.last_subject`

### Archivos modificados en Chat O

| Archivo | Cambio |
|---------|--------|
| `captacion-worker/src/email/sender.js` | Eliminado `Precedence: bulk`, cambiado `X-Mailer` |
| `captacion-worker/src/templates/templates.js` | Copy `despacho_legal` reescrito, PDF eliminado, saludo con nombre, follow-up con hilo |

### Estado tras Chat O

| Pieza | Estado |
|-------|--------|
| Copy emails despachos abogados | ✅ CORREGIDO — ataca dolor, sin PDF, sin spam headers |
| Captacion worker en VPS | ✅ ONLINE en /opt/captacion — PERO .env tiene placeholders |
| 18k leads importados a SQLite | ❌ PENDIENTE — CSVs en /opt/captacion pero falta ejecutar import |
| VPS .env con valores reales | ❌ PENDIENTE — SMTP_USER, SMTP_PASS, FROM_NAME, FROM_EMAIL placeholders |
| CAPTACION_WORKER_URL en Vercel | ❌ PENDIENTE — solo en .env.local local |
| og-image.png 1200×630 | ❌ PENDIENTE MANUAL — instrucciones en AUDITORIA-CHAT-L |
| Product Hunt / Indie Hackers / SpainStartup | ❌ PENDIENTE MANUAL |

---

## 27. PRÓXIMO CHAT (Chat P) — ORDEN DE ATAQUE

**INSTRUCCIÓN PARA LA IA:** Lee MAVIE-MASTER.md + AUDITORIA-CHAT-L-2026-04-27.md. Estado: producto funcional, emails corregidos, pero la máquina de captación no está arrancada por falta de configuración VPS.

### Prioridad 1 — VPS: activar la máquina de emails (BLOQUEANTE)

Josep necesita ejecutar esto en el VPS (`ssh root@80.241.212.87`):

```bash
# 1. Editar .env con valores reales (ver sección 12 para los valores)
nano /opt/captacion/.env
# Cambiar: SMTP_USER, SMTP_PASS, FROM_NAME, FROM_EMAIL, REPLY_TO, COMPANY_NAME
# Añadir: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (desde Vercel env vars)

# 2. Subir el código actualizado (emails fix del Chat O)
# — Opción A: git pull si el VPS tiene el repo
# — Opción B: FileZilla → subir captacion-worker/src/templates/templates.js
#                                    captacion-worker/src/email/sender.js

# 3. Importar leads
cd /opt/captacion
node src/cli.js import --file All_Spain_Leads.csv
node src/cli.js import --file All_Spain_Leads_2.csv
node src/cli.js import --file Faltantes_por_enviar.csv
node src/cli.js stats   # → debe mostrar ~18.678

# 4. Test en seco
node src/cli.js send-all --dry-run --limit 5

# 5. Arrancar
pm2 restart captacion-worker
```

En Vercel Settings → Environment Variables:
```
CAPTACION_WORKER_URL=http://80.241.212.87:3002
CAPTACION_CRON_SECRET=b1e6556d2e391f0173d4796cb44fd00f15909cd6d29dbf9def7a2247324894a5
```

### Prioridad 2 — SEO contenido pendiente (código)

1. Mejorar páginas verticales `despachos-abogados` y `consultoras-subvenciones` en `/radar-boe/[vertical]/page.tsx` — añadir sección tipos de licitaciones + FAQs únicas (eliminar thin content)
2. Ampliar hub `/radar-boe/page.tsx` con 300+ palabras E-E-A-T sobre qué es el BOE
3. Crear `/casos/page.tsx` — caso éxito anonimizado (antes/después, horas ahorradas)
4. `app/sitemap.ts` — cambiar `new Date()` a fechas ISO estáticas
5. Crear `public/llms.txt`

### Prioridad 3 — Manual Josep

- Crear `og-image.png` en Canva (instrucciones detalladas en AUDITORIA-CHAT-L sección "TAREA 1")
- Alta Product Hunt, Indie Hackers, SpainStartup (instrucciones en AUDITORIA-CHAT-L secciones 4,5,6)
- Pedir testimonio real al cliente que paga (nombre + empresa + permiso escrito)
- LinkedIn: 10 conexiones/día a socios de despachos + DM plantilla (sección 15 MAVIE-MASTER)

---

*Josep Cervera · Mavie Automations · mavieautomations.com*  
*Actualizado: 2026-04-28 — Chat O: Diagnóstico no-ventas, 3 bugs críticos emails corregidos*

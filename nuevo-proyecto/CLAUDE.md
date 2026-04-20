# CLAUDE.md

> Contexto maestro del proyecto. Cualquier IA que trabaje en este repo debe leer este archivo antes de proponer cambios, arquitectura o features. Las decisiones técnicas se toman en función del plan de negocio descrito aquí, no al revés.

---

## 1. Quién soy y qué estoy construyendo

Soy **Josep**, 22 años, perfil técnico (full-stack + automatización + IA). Este repo contiene **un único ecosistema bajo la marca Mavie Automations** con tres piezas que funcionan juntas:

1. **Mavie** → web pública + marca paraguas + futuro panel de cliente
2. **Radar BOE** → SaaS B2B de monitorización del BOE (y futuros boletines) con alertas inteligentes
3. **Scraper + Emailing** → motor de captación B2B (scraping de empresas, enriquecimiento, emails personalizados con IA vía Brevo)

**Importante:** no son tres proyectos separados. Son **tres módulos de un mismo negocio**. El scraper alimenta a Mavie/Radar BOE con clientes. Mavie vende Radar BOE (y servicios). Radar BOE genera MRR. Toda decisión técnica debe reforzar esta integración, no fragmentarla.

---

## 2. Objetivo de negocio (el "por qué" de cada línea de código)

**Objetivo 3 meses:** 1.000-2.000 €/mes recurrentes + algún servicio puntual.
**Objetivo 12 meses:** 6.000-10.000 €/mes, mayoría recurrente vía Radar BOE multi-tenant.
**Objetivo 24 meses:** Mavie como activo vendible o licenciable.

**Reglas que derivan de esto:**

- **Priorizar time-to-revenue sobre elegancia técnica.** Si algo funciona feo pero factura, no se refactoriza hasta tener ingresos estables.
- **Cada feature debe responder a:** ¿esto me acerca al siguiente cliente pagando, o a retener uno existente? Si no, se pospone.
- **Multi-tenant desde ya en Radar BOE.** No más VPS por cliente. Un stack, N clientes.
- **No construir productos nuevos hasta que Radar BOE facture 3.000 €/mes estables.** Nada de lanzar 5 micro-SaaS.

---

## 3. Estado actual real de cada módulo

### 3.1 Mavie (web pública)
- **Estado:** desplegada, sin tráfico, sin clientes entrando por aquí.
- **Diagnóstico:** es un folleto parado. Problema de distribución, no de producto.
- **Qué falta:** motor de captación (blog/casos/newsletter), CTAs claros hacia Radar BOE y servicios, tracking básico (PostHog o similar), formulario que dispare automatización de onboarding.

### 3.2 Radar BOE
- **Estado:** desplegado en VPS, **mono-cliente** (1 cliente real pagando, contento).
- **Qué hace:** revisa fuentes tipo BOE, filtra por keywords y antikeywords, detecta oportunidades, envía resúmenes/alertas por correo.
- **Qué falta para ser SaaS real:**
  - Multi-tenancy (tabla `tenants`, aislamiento de datos, keywords por cliente)
  - Sistema de auth (signup, login, recuperación)
  - Panel web donde el cliente gestiona sus keywords/fuentes/destinatarios sin tocarme a mí
  - Stripe para suscripción recurrente (planes 49 / 149 / 399 €/mes)
  - Onboarding automático post-pago
  - Página de estado / logs para el cliente
- **Qué NO falta (no tocar ahora):** más fuentes aparte del BOE, IA más sofisticada, app móvil, integraciones con Slack/Teams/CRM. Todo eso son upsells de mes 3+.

### 3.3 Scraper + Emailing
- **Estado:** funcional, probado para clientes, **intenté venderme a mí mismo con él y no cerré**.
- **Uso principal actual:** debe ser mi motor de captación para Mavie/Radar BOE, no (todavía) un producto vendible.
- **Qué falta:**
  - Un playbook de campaña repetible (nicho → scrape → copy → secuencia → tracking)
  - Tracking de respuestas y conversiones dentro del propio sistema
  - Plantillas de copy por vertical guardadas en BD
  - Idealmente: integrar con CRM interno de Mavie para no perder leads

---

## 4. Orden de ataque (prioridad absoluta)

**Cualquier IA que trabaje aquí debe respetar este orden salvo que yo indique lo contrario.**

### Fase 1 (semanas 1-3): Arreglar el scraper como máquina de venta MÍA
Sin leads no hay nada. El scraper es la palanca.
- Playbook de campaña: 1 vertical objetivo (empezamos por **despachos de abogados especialistas en licitación/subvenciones**), 500-1000 contactos scrapeados.
- Copy nuevo de secuencia (3 emails) basado en el caso real del cliente BOE actual como prueba social.
- Tracking de aperturas, respuestas, reuniones agendadas.
- Objetivo: 2-5 reuniones/semana.

### Fase 2 (semanas 2-6, en paralelo): Productizar Radar BOE a multi-tenant
- Refactor a multi-tenancy (ok rehacer partes, prioridad total).
- Auth + panel cliente mínimo viable (feo pero funcional).
- Stripe + 3 planes.
- Landing dedicada con precios públicos.
- Onboarding automático.
- Objetivo: cerrar 3-5 clientes nuevos de los leads que trae Fase 1.

### Fase 3 (semanas 6-12): Convertir Mavie en imán + escalar
- Blog/casos públicos (el del cliente BOE anonimizado el primero).
- Newsletter semanal de automatización B2B.
- SEO básico para "automatización BOE", "monitorización boletines oficiales", etc.
- Abrir segundo vertical en Radar BOE (licitaciones públicas o boletines autonómicos).
- Upsells: integración Slack/Teams, API, multi-usuario.

### Lo que NO se hace todavía (aunque apetezca)
- Apps móviles
- Productos nuevos fuera del eje Mavie/Radar/Scraper
- Rediseños bonitos sin impacto en conversión
- Integraciones fancy antes de tener 10 clientes pagando
- YouTube, ecommerce, dropshipping, afiliación → fuera del scope

---

## 5. Stack técnico y convenciones

**Lenguajes y herramientas que ya manejo y son la base del proyecto:**
- Backend: Node.js + Express, Python para scraping/IA
- Frontend: HTML/CSS/JS vanilla o framework ligero (evitar over-engineering)
- BBDD: MySQL (relacional principal) + MongoDB si hay datos no estructurados
- Infra: Docker, VPS, Cloudflare
- Automatización: n8n, Make, webhooks
- Emailing: Brevo
- IA: APIs de OpenAI/Anthropic para personalización y enriquecimiento

**Convenciones que la IA debe respetar:**
- **No introducir dependencias nuevas sin justificarlas** en términos de negocio o tiempo ahorrado.
- **Código en español en variables de dominio de negocio** (ej. `cliente`, `suscripcion`, `alerta_boe`) y en inglés para términos genéricos técnicos.
- **Multi-tenancy siempre a nivel de fila** (`tenant_id` en cada tabla relevante), no BD por cliente.
- **Secrets en `.env`**, nunca en código. Si la IA ve una key hardcodeada, debe avisarme.
- **Feo y funcionando > bonito y sin clientes.** No pulir CSS hasta que el flujo completo funcione end-to-end.
- **Tests solo donde el coste de fallar es alto** (pagos, envíos de email masivos, facturación). No tests de UI todavía.

---

## 6. Modelo de negocio y pricing (para que la IA entienda qué construir)

### Radar BOE — 3 planes
- **Básico 49 €/mes:** 1 usuario, 5 keywords, 1 destinatario de email, alertas diarias.
- **Pro 149 €/mes:** 5 usuarios, 25 keywords, múltiples destinatarios, boletines autonómicos, alertas configurables.
- **Business 399 €/mes:** multi-usuario, API, integración Slack/Teams, soporte prioritario, onboarding personalizado.

### Servicios productizados (Mavie)
- **Sistema de prospección B2B:** setup 2.500 € + 400 €/mes de mantenimiento. Réplica del scraper+emailing adaptado al nicho del cliente.
- **Automatización a medida:** 1.500-4.000 € por proyecto según alcance.
- **Auditoría + roadmap:** 500-800 € (puerta de entrada).

**Qué NO vendemos:** horas sueltas de programación, webs baratas, vídeos para negocios locales, nada que no apalanque el stack Mavie.

---

## 7. Verticales objetivo (por orden de prioridad de captación)

1. **Despachos de abogados** especializados en licitación, subvenciones, contratación pública.
2. **Consultoras de subvenciones** (pagan bien, cada alerta perdida = cliente perdido).
3. **Empresas de licitación pública** (monitorización multi-fuente).
4. **Gestorías medianas** (cambios normativos fiscales/laborales).
5. **Asociaciones profesionales y sindicatos** (monitorización sectorial).

Cuando la IA proponga features o copy, debe pensar primero en **vertical 1 y 2**, no en "cliente genérico".

---

## 8. Cómo debe comportarse la IA en este repo

**Siempre:**
- Leer este archivo antes de proponer cambios estructurales.
- Priorizar time-to-revenue sobre perfección técnica.
- Proponer la solución más simple que desbloquee el siguiente hito de negocio.
- Avisar si detecta que una tarea no está alineada con la fase actual del plan.
- Tratar los 3 módulos como un ecosistema, no como proyectos separados.

**Nunca:**
- Sugerir reescrituras completas sin razón de negocio clara.
- Introducir arquitectura compleja (microservicios, k8s, event sourcing) mientras estemos por debajo de 50 clientes.
- Proponer features de fases posteriores si no hemos terminado la actual.
- Pedirme que decida entre 10 opciones técnicas. Que proponga 1-2 con criterio y yo decido.
- Borrar o reescribir código funcional del cliente real de Radar BOE sin confirmación explícita.

**Cuando haya duda:**
- Preguntarme en términos de negocio, no de código. Ej: "¿Esto es para el cliente actual o para los nuevos multi-tenant?" en vez de "¿Usamos patrón repository o service?".

---

## 9. Métricas que importan (y las que no)

**Importan:**
- MRR (Monthly Recurring Revenue) de Radar BOE
- Nº de reuniones agendadas/semana desde el scraper
- Tasa de respuesta de campañas outbound
- Clientes activos / clientes churn
- Tiempo desde signup hasta primera alerta recibida (activación)

**No importan ahora:**
- Uptime "5 nueves"
- Lighthouse score de Mavie
- Cobertura de tests
- Tiempo de build
- Tamaño del bundle

---

## 10. Contacto con la realidad

Si en algún momento:
- Llevamos 4 semanas sin cerrar ningún cliente nuevo → parar features, volver a campañas outbound.
- El cliente existente de Radar BOE se queja de algo → prioridad absoluta, rompe cualquier fase.
- Una oportunidad de servicio puntual (2-4 k€) aparece → se acepta y pausa parte del roadmap SaaS.

El plan es una guía, no una biblia. Pero los principios (foco en Mavie/Radar/Scraper, time-to-revenue, multi-tenant, no dispersión) no se negocian.

---

## 11. Mapa técnico real del repo (actualizado 2026-04-19)

Este repo contiene cuatro raíces. Solo `nuevo-proyecto/` es el stack productivo actual.

```
MAVIE_BOE_WEB/
├── CLAUDE.md                          # este archivo (negocio + mapa)
├── nuevo-proyecto/                    # STACK ACTUAL (tocar aquí)
│   ├── CLAUDE.md                      # mapa técnico detallado del stack
│   ├── web-app/                       # Next.js 14 + Supabase (Mavie + panel admin)
│   ├── BOE-Worker/                    # Node.js cron — Radar BOE multi-tenant
│   └── database/schema.sql            # esquema Supabase base
├── ScrapperEmpresasBOE - copia/       # scraper viejo FUNCIONAL — fuente a portar
├── referencia-boe/                    # material histórico BOE (PDFs, n8n workflow)
└── referencia-web-mavie/              # web antigua Mavie (Next.js previo, referencia visual)
```

**Detalle técnico completo** → leer [nuevo-proyecto/CLAUDE.md](nuevo-proyecto/CLAUDE.md) antes de tocar código.

### 11.1 Estado real por módulo (código ↔ plan de negocio) — actualizado 2026-04-20

| Módulo | Código | Estado | Desbloquea |
|---|---|---|---|
| Mavie web pública | `web-app/app/page.tsx` + rutas públicas | ✅ Deployada, seguridad P0 parcheada | Fase 3 (imán) |
| Panel admin CRM | `web-app/app/(admin)/dashboard/` | ✅ Funcional — 9 páginas (clientes, leads, captación, BOE, emails, incidencias, config) | Gestión interna |
| Onboarding público | `web-app/app/onboarding/boe/` + `actions/submitOnboarding.ts` | ✅ Funcional — honeypot + captcha + crea `clients` status `listo_para_activar` | Entrada cliente |
| **BOE-Worker multi-tenant** | `BOE-Worker/src/index.js` + `src/scrapers/` + `src/services/` | ✅ **FUNCIONAL** — pipeline completo: fetch BOE → filtrar por keywords → email digest → log Supabase | **MRR directo** |
| Landing Radar BOE + precios | `web-app/app/soluciones/boe/page.tsx` | ✅ Completa — precios 79/179/399€, CTAs a Stripe Checkout | Conversión |
| Stripe Checkout + Webhook | `web-app/app/api/stripe/checkout/` + `webhook/` + `portal/` | ✅ Código completo — 4 eventos webhook, activación automática. **Pendiente: config externa** | MRR |
| Página post-pago `/gracias` | `web-app/app/gracias/page.tsx` | ✅ Existe | Funnel pago |
| Auth admin fail-closed | `web-app/middleware.ts` + `lib/auth.ts` | ✅ `ADMIN_EMAILS` whitelist, fail-closed. **Pendiente: configurar en Vercel** | Seguridad |
| Brevo API routes | `web-app/app/api/brevo/*` | ✅ 4 endpoints, todos protegidos con `requireAdminApi()` | Emailing admin |
| Scraper B2B captación | `ScrapperEmpresasBOE - copia/src/` | ✅ Funcional standalone (scraper/classify/email/tracking) | Fase 1 (leads) |
| **Auth self-service cliente** | `web-app/app/acceso/page.tsx` + `lib/auth.ts:requireClienteAuth()` | ✅ **FUNCIONAL** — login en `/acceso`, middleware protege `/panel/*` | **Fase 2 (SaaS)** |
| **Panel cliente `/panel`** | `web-app/app/(cliente)/panel/` + `actions/clienteActions.ts` | ✅ **FUNCIONAL** — panel + keywords + destinatarios. **Pendiente: crear usuario Supabase Auth para cliente** | **Fase 2 (SaaS)** |
| BOE-Worker como cron | — | ❌ Solo ejecución manual (`node src/index.js`) | Producción autónoma |

### 11.2 Bloqueadores directos de ingreso (orden de ataque) — actualizado 2026-04-20

1. ✅ ~~Portar scraping real al BOE-Worker~~ → HECHO. Pipeline multi-tenant completo en `BOE-Worker/src/`.
2. ✅ ~~Landing Radar BOE con precios públicos~~ → HECHO. `web-app/app/soluciones/boe/page.tsx` con precios 79/179/399€.
3. ✅ ~~Stripe Checkout + webhook~~ → HECHO en código. **Pendiente: configuración externa (ver Sesión Chat A abajo).**
4. ✅ **Auth self-service cliente + Panel** → HECHO. `/acceso` login, `/panel` + keywords + destinatarios. Ver Chat C.
5. ❌ **Playbook outbound vertical 1** → Operación, no código. Ver Chat D abajo.

### 11.3 Reglas de trabajo específicas de este repo

- **Tocar `nuevo-proyecto/`** por defecto. `ScrapperEmpresasBOE - copia/` = fuente de código a portar, no a extender in-situ.
- **No duplicar scraper** en dos sitios. Mover al worker, borrar copia cuando esté portado.
- **Multi-tenancy fila (`tenant_id`)** en todas las tablas nuevas. Ver `database/schema.sql`.
- **Secrets solo en `.env.local` / `.env`**. Nunca en código. Si IA detecta key hardcodeada → avisar.
- **Cliente real de Radar BOE facturando** → cualquier cambio que toque su flujo activo requiere confirmación explícita.
- **Código admin usa `requireAuth()` como primera línea.** Acciones públicas (contact, onboarding) pasan por `rate-limit → Zod → honeypot → captcha` antes de lógica.

### 11.4 Comandos habituales

```bash
# web-app (desde nuevo-proyecto/web-app/)
npm run dev        # localhost:3000
npm run build
npm run lint

# BOE-Worker (desde nuevo-proyecto/BOE-Worker/)
node src/index.js  # ejecución manual (aún no cron)

# Scraper viejo (desde "ScrapperEmpresasBOE - copia/")
node src/cli.js    # CLI outbound B2B
```

---

---

## 12. Pricing decidido — Radar BOE (actualizado 2026-04-19)

### Modelo elegido: SaaS mensual puro (sin setup fee)

El modelo anterior de la landing (`397€ setup + 40€/mes`) queda **eliminado**. Razones:
- Stripe self-serve necesita fricción mínima → setup fee frena la conversión
- Outbound en frío: "79€/mes, cancelas cuando quieras" cierra más
- Toda la competencia profesional usa suscripción pura
- Implementación Stripe más simple

### Investigación de competencia realizada (2026-04-19)
- **TendersTool** (España): 110€/mes básico, 185€/mes pro — enfocado en sector TIC
- **El Consultor eLICITA** (Aranzadi): precios ocultos, modelo enterprise, venta consultiva
- **BOE oficial** (boe.es/alertas): gratuito, sin filtros, sin resúmenes → es el baseline que justifica nuestro precio
- **Boletín Claro**: free plan existe, paid desconocido

### Planes definitivos Radar BOE

| Plan | Precio | Límites |
|------|--------|---------|
| **Básico** | **79€/mes** | 1 usuario, 10 keywords, BOE nacional, resumen diario, 1 destinatario email |
| **Pro** | **179€/mes** | 5 usuarios, 50 keywords, BOE+DOUE+autonómico, alertas instantáneas, múltiples destinatarios |
| **Business** | **399€/mes** | Ilimitado, API, multi-usuario, soporte prioritario, onboarding personalizado |

> **Nota para la IA:** estos precios reemplazan los 49/149/399€ del apartado 6. Actualizar landing y Stripe con estos valores.

---

## 13. Log de sesiones — qué se ha hecho y qué falta

### Sesión 2026-04-19 (primera)

**Hecho:**
- BOE-Worker portado a multi-tenant: `src/scrapers/orchestrator.js` + `BoeScraper.js` + `BaseScraper.js` + `services/filter.js` + `services/email.js` + `src/index.js`. Flujo completo: fetch BOE → filtrar por keywords cliente → email digest → log Supabase.
- Investigación de competencia de precios realizada.
- Modelo de pricing decidido: 79/179/399€/mes puro mensual, sin setup fee.

---

### Sesión 2026-04-19 (segunda) — Stripe implementado

**Hecho (código ya en repo):**
- `stripe` instalado en `nuevo-proyecto/web-app/package.json`.
- `nuevo-proyecto/web-app/app/api/stripe/checkout/route.ts` → GET `?plan=basico|pro|business` crea sesión Stripe y redirige al hosted checkout.
- `nuevo-proyecto/web-app/app/api/stripe/webhook/route.ts` → POST firmado con `STRIPE_WEBHOOK_SECRET`. On `checkout.session.completed`: upsert `clients` (status `activo`, `activation_date`, `stripe_customer_id`, `stripe_subscription_id`, `plan_activo`) + upsert `client_boe_configs` (`is_active=true`, frequency y regions según plan).
- `nuevo-proyecto/web-app/app/soluciones/boe/page.tsx` → precios actualizados a 79/179/399€, 3 planes en grid, CTAs apuntan directamente a `/api/stripe/checkout?plan=...`.
- `nuevo-proyecto/web-app/supabase_migrations/07_stripe_columns.sql` → añade columnas `stripe_customer_id`, `stripe_subscription_id`, `plan_activo` a `clients` + índice único en `primary_email`.
- `.env.local` → placeholders para todas las vars de Stripe añadidos.
- Build `npm run build` pasa limpio.

---

### Sesión 2026-04-19 (tercera) — Stripe listo para producción

**Hecho:**
- `.env.local` (web-app): configurados `STRIPE_PRICE_BASICO` (`price_1TNzyhIh4VV7YNOJqepFPBUc`), `STRIPE_PRICE_PRO` (`price_1TNzz5Ih4VV7YNOJqLBmilPw`), `STRIPE_PRICE_BUSINESS` (`price_1TO01MIh4VV7YNOJtOBUCW8C`), `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`.
- `.env` (BOE-Worker): configurados `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` reales.
- **`/gracias` page** → `app/gracias/page.tsx`. Página post-pago con: icono de confirmación, 3 pasos (email → configuración 24h → primer resumen 48h), enlace al portal Stripe de gestión, enlace a soporte. Sin esto el `success_url` de Stripe devolvía 404.
- **Webhook robusto** → `app/api/stripe/webhook/route.ts` reescrito. Ahora maneja 4 eventos:
  - `checkout.session.completed` → activa cliente + config BOE
  - `customer.subscription.deleted` → status `cancelado`, desactiva radar
  - `customer.subscription.updated` → detecta cambio de plan (upgrade/downgrade), actualiza limits
  - `invoice.payment_failed` → marca status `pago_fallido` (Stripe reintenta antes de cancelar)
- **Portal de gestión** → `app/api/stripe/portal/route.ts`. GET `?customer_id=cus_xxx` redirige al Billing Portal de Stripe (cancelar, cambiar tarjeta, facturas).
- **Checkout mejorado** → `app/api/stripe/checkout/route.ts`. try/catch, validación de price IDs, soporte para códigos promocionales (`allow_promotion_codes`), cancel_url al anchor `#precios`.
- **Migración SQL actualizada** → `07_stripe_columns.sql` añade índice `clients_stripe_customer_idx` para lookups rápidos en cancelaciones/pagos fallidos.
- Build `npm run build` pasa limpio (35 páginas, 0 errores).

**Pasos manuales pendientes (Josep — configuración externa):**
1. ✅ ~~Crear 3 productos en Stripe Dashboard~~ → HECHO
2. ✅ ~~Copiar price IDs a .env.local~~ → HECHO
3. ✅ ~~Copiar STRIPE_SECRET_KEY~~ → HECHO
4. ✅ ~~Copiar SUPABASE_SERVICE_ROLE_KEY~~ → HECHO
5. **Aplicar `07_stripe_columns.sql` en Supabase SQL Editor** → PENDIENTE
6. **Registrar webhook en Stripe Dashboard** → PENDIENTE
   - URL: `https://mavieautomations.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`
   - Copiar signing secret (`whsec_...`) a `STRIPE_WEBHOOK_SECRET` en `.env.local` y en variables de entorno de Vercel.
7. **Activar Billing Portal en Stripe** → Settings → Billing → Customer Portal → Activar. Sin esto `/api/stripe/portal` no funciona.
8. **Copiar variables de entorno a Vercel** → Las mismas de `.env.local` (excepto `NEXT_PUBLIC_SITE_URL` que debe ser `https://mavieautomations.com`).

**Pendiente (próxima sesión de código — en orden):**
1. **Probar BOE-Worker** con `.env` configurado → `node src/index.js` con cliente real.
2. **Auth self-service cliente** → route group `(cliente)`, Supabase Auth signup/login para no-admin, panel mínimo `/panel` donde el cliente ve su estado y puede modificar keywords/destinatarios.
3. **Playbook outbound vertical 1** → despachos de abogados, usar `ScrapperEmpresasBOE - copia/src/cli.js`, copy nuevo con caso cliente real BOE como prueba social.

**Regla para la próxima IA:** Stripe está **completo en código**. Lo único que falta es: (1) aplicar migración SQL, (2) registrar webhook en Dashboard, (3) activar Billing Portal, (4) copiar envs a Vercel. Son pasos manuales de Josep en 10 minutos. Próxima sesión de código: arrancar por test BOE-Worker o auth self-service.

---

### Sesión 2026-04-20 — Auditoría de seguridad + fixes críticos

**Contexto:** Josep expuso accidentalmente el webhook secret de Stripe en un chat. Se hizo auditoría completa del código.

**Pasos manuales URGENTES (Josep — hacer antes de cualquier sesión de código):**
1. **Rotar `STRIPE_WEBHOOK_SECRET`** → Stripe Dashboard → Webhooks → Roll secret → actualizar en `.env.local` + Vercel.
2. **Rotar `STRIPE_SECRET_KEY` (`sk_live_...`)** → Stripe Dashboard → Developers → API keys → Roll key.
3. **Rotar `SUPABASE_SERVICE_ROLE_KEY`** → Supabase → Settings → API → Regenerate.
4. **Rotar `BREVO_API_KEY`** → Brevo → Profile → SMTP & API → Delete + recrear.
5. **Añadir `ADMIN_EMAILS=xuso30118@gmail.com`** en Vercel env vars → sin esto el dashboard bloquea a todos.
6. **Cambiar `NEXT_PUBLIC_SITE_URL=https://mavieautomations.com`** en Vercel (actualmente apunta a localhost, los clientes de Stripe son redirigidos a un 404 post-pago).
7. **Aplicar en Supabase SQL Editor** (fix idempotente de la migración 05):
   ```sql
   DROP POLICY IF EXISTS "Admin full access incidents" ON public.incidents;
   CREATE POLICY "Admin full access incidents"
       ON public.incidents FOR ALL
       USING (auth.role() = 'authenticated')
       WITH CHECK (auth.role() = 'authenticated');
   ```

**Hecho en código (build ✅, 0 errores):**

| Fix | Archivo | Problema resuelto |
|-----|---------|------------------|
| `ADMIN_EMAILS` fail-closed | `lib/auth.ts`, `middleware.ts` | Sin la var, cualquier usuario auth'd era admin |
| `requireAdminApi()` nueva función | `lib/auth.ts` | Helper para API routes (devuelve 401, no redirect) |
| Auth en `/api/brevo/campaigns` | `app/api/brevo/campaigns/route.ts` | Era pública — cualquiera veía tus campañas |
| Auth en `/api/brevo/contacts` | `app/api/brevo/contacts/route.ts` | Era pública — cualquiera listaba todos tus leads |
| Auth en `/api/brevo/emails` | `app/api/brevo/emails/route.ts` | Era pública — historial de emails expuesto |
| Auth en `/api/brevo/stats` | `app/api/brevo/stats/route.ts` | Era pública — métricas expuestas |
| IDOR Stripe portal eliminado | `app/api/stripe/portal/route.ts` | Aceptaba `?customer_id=cus_xxx` sin auth → cualquiera abría portal de otro cliente |
| Migración SQL idempotente | `supabase_migrations/05_incidents.sql` | Error 42710 al re-ejecutar |

**Issues de seguridad restantes (no urgentes para código, pero a tener en cuenta):**
- Rate limiter en memoria no funciona en Vercel multi-instancia → necesita Upstash Redis cuando escale.
- CSP tiene `unsafe-inline` + `unsafe-eval` → upgrade a nonces cuando haya tiempo.
- Checkout Stripe por GET → mover a POST cuando haya panel de cliente.

**Estado de los pasos manuales anteriores (de sesión tercera):**
- ✅ Crear 3 productos en Stripe → HECHO
- ✅ Price IDs en .env.local → HECHO
- ✅ STRIPE_SECRET_KEY → HECHO (pero **debe rotarse** por exposición)
- ✅ SUPABASE_SERVICE_ROLE_KEY → HECHO (pero **debe rotarse**)
- ⏳ Aplicar `07_stripe_columns.sql` → PENDIENTE (aplicar también el fix del 05 de arriba)
- ⏳ Registrar webhook en Dashboard → PENDIENTE (con el **nuevo** whsec tras rotación)
- ⏳ Activar Billing Portal en Stripe → PENDIENTE
- ⏳ Copiar vars a Vercel → PENDIENTE (incluir ADMIN_EMAILS y URL correcta)

**Pendiente (próxima sesión de código — en orden):**
1. **Probar BOE-Worker** → `node src/index.js` desde `nuevo-proyecto/BOE-Worker/` con `.env` real configurado. Verificar que el scraping real llega al cliente existente.
2. **Auth self-service cliente** → route group `(cliente)`, Supabase Auth signup/login para no-admin, panel mínimo `/panel` donde el cliente ve estado, keywords y destinatarios.
3. **Playbook outbound vertical 1** → despachos de abogados, `ScrapperEmpresasBOE - copia/src/cli.js`, copy nuevo con caso real como prueba social.

**Regla para la próxima IA:** Seguridad crítica parcheada en código. Antes de tocar cualquier cosa, verificar que Josep haya rotado los 4 secretos y configurado `ADMIN_EMAILS` en Vercel (puntos 1-6 arriba). Sin eso, el sistema sigue expuesto. Las migraciones SQL 05 y 07 están pendientes de aplicar en Supabase.

---

---

## 14. Auditoría completa del estado real (2026-04-20, segunda sesión)

### 14.1 Inventario de lo que FUNCIONA en código (no tocar sin razón)

| Pieza | Archivos clave | Qué hace |
|---|---|---|
| BOE-Worker pipeline | `BOE-Worker/src/index.js`, `src/scrapers/orchestrator.js`, `src/scrapers/BoeScraper.js`, `src/scrapers/BaseScraper.js`, `src/services/filter.js`, `src/services/email.js` | Fetch BOE API → filtrar por keywords/antikeywords por cliente → email digest HTML vía Brevo SMTP → log en `boe_match_history` |
| Stripe Checkout | `web-app/app/api/stripe/checkout/route.ts` | GET `?plan=basico\|pro\|business` → crea Stripe session → redirige a hosted checkout |
| Stripe Webhook | `web-app/app/api/stripe/webhook/route.ts` | 4 eventos: `checkout.session.completed` (activa cliente), `subscription.deleted` (cancela), `subscription.updated` (cambia plan), `invoice.payment_failed` (marca fallo) |
| Stripe Portal | `web-app/app/api/stripe/portal/route.ts` | Auth-protected. Abre Billing Portal de Stripe para el cliente autenticado |
| Landing BOE + precios | `web-app/app/soluciones/boe/page.tsx` | 3 planes (79/179/399€), CTAs a Stripe, feature list por plan |
| Página post-pago | `web-app/app/gracias/page.tsx` | Confirmación de pago + 3 pasos + link a portal Stripe |
| Admin dashboard | `web-app/app/(admin)/dashboard/` | 9 páginas: clientes, clientes/[id], leads, captación, BOE, emails, configuracion, incidencias |
| Onboarding público | `web-app/app/onboarding/boe/page.tsx` + `actions/submitOnboarding.ts` | 2 pasos (empresa → keywords), honeypot + HCaptcha, crea `clients` con status `listo_para_activar` |
| Auth admin | `web-app/middleware.ts` + `web-app/lib/auth.ts` | `ADMIN_EMAILS` whitelist fail-closed. `requireAuth()` para páginas, `requireAdminApi()` para API routes |
| Brevo routes | `web-app/app/api/brevo/{campaigns,contacts,emails,stats}/route.ts` | 4 endpoints proxy a Brevo API, todos auth-protected |
| Homepage | `web-app/app/page.tsx` | Landing Mavie completa: hero, proceso, productos, social proof |
| DB schema | `database/schema.sql` + `supabase_migrations/07_stripe_columns.sql` | Multi-tenant via `client_id` FK en todas las tablas. RLS activado. Columnas Stripe añadidas |

### 14.2 Lo que FALTA en código

| Pieza | Impacto | Complejidad estimada |
|---|---|---|
| Panel cliente self-service `/panel` | Alto — sin esto Josep gestiona todo a mano | 1 chat de trabajo |
| Auth cliente (signup/login no-admin) | Alto — vinculado al panel | Incluido en lo anterior |
| BOE-Worker como cron automático | Medio — ahora es manual | 1 chat corto |

### 14.3 % de completitud real

- **Para vender el primer cliente nuevo (esta semana):** ~85% — falta solo configuración externa (Chat A)
- **Para SaaS self-service completo:** ~58% — falta panel cliente + cron
- **Para Fase 2 completada:** ~75% — falta panel cliente

---

## 15. Misiones para chats futuros — plan por pasos

> **Instrucción para la IA de cada chat:** Lee la misión asignada, haz SOLO esa misión, actualiza el estado en esta sección al terminar.

---

### CHAT A — Configuración externa (Josep lo hace solo, sin IA)
**Objetivo:** Dejar el sistema listo para recibir el primer pago real.
**Tipo:** Pasos manuales en dashboards externos. No requiere IA.

**Checklist (en orden):**
- [ ] 1. Rotar `STRIPE_WEBHOOK_SECRET` → Stripe Dashboard → Webhooks → Roll secret
- [ ] 2. Rotar `STRIPE_SECRET_KEY` → Stripe Dashboard → Developers → API keys → Roll key
- [ ] 3. Rotar `SUPABASE_SERVICE_ROLE_KEY` → Supabase → Settings → API → Regenerate
- [ ] 4. Rotar `BREVO_API_KEY` → Brevo → Profile → SMTP & API → Recrear
- [ ] 5. En Vercel → Settings → Environment Variables, añadir/actualizar:
  - `STRIPE_SECRET_KEY` (la nueva)
  - `STRIPE_WEBHOOK_SECRET` (la nueva — aún no existe, viene del paso 7)
  - `STRIPE_PRICE_BASICO=price_1TNzyhIh4VV7YNOJqepFPBUc`
  - `STRIPE_PRICE_PRO=price_1TNzz5Ih4VV7YNOJqLBmilPw`
  - `STRIPE_PRICE_BUSINESS=price_1TO01MIh4VV7YNOJtOBUCW8C`
  - `SUPABASE_URL` (la tuya de Supabase)
  - `SUPABASE_SERVICE_ROLE_KEY` (la nueva rotada)
  - `ADMIN_EMAILS=xuso30118@gmail.com`
  - `NEXT_PUBLIC_SITE_URL=https://mavieautomations.com`
- [ ] 6. En Supabase SQL Editor → ejecutar `supabase_migrations/07_stripe_columns.sql`
- [ ] 7. En Supabase SQL Editor → ejecutar también:
  ```sql
  DROP POLICY IF EXISTS "Admin full access incidents" ON public.incidents;
  CREATE POLICY "Admin full access incidents"
      ON public.incidents FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  ```
- [ ] 8. En Stripe Dashboard → Developers → Webhooks → Add endpoint:
  - URL: `https://mavieautomations.com/api/stripe/webhook`
  - Eventos: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`
  - Copiar `whsec_...` a Vercel como `STRIPE_WEBHOOK_SECRET`
- [ ] 9. En Stripe Dashboard → Settings → Billing → Customer Portal → Activar
- [ ] 10. En Vercel → Deployments → Redeploy (para que cojan las nuevas vars)

**Verificación:** Ir a `https://mavieautomations.com/soluciones/boe` → pulsar "Contratar Básico" → flujo de pago Stripe completo → redirige a `/gracias`.

**Estado:** ✅ HECHO (2026-04-20)

**Qué se hizo:** Josep completó todos los pasos manuales: secrets rotados, variables en Vercel (STRIPE_*, SUPABASE_*, BREVO_API_KEY, ADMIN_EMAILS, NEXT_PUBLIC_SITE_URL), migraciones SQL 07 y 08 aplicadas en Supabase, webhook Stripe registrado, Billing Portal activado, Redeploy ejecutado. Sistema listo para recibir pagos reales.

---

### CHAT B — Probar BOE-Worker con cliente real
**Objetivo:** Verificar que el worker scraping llega al cliente existente.
**Tipo:** Test local + debug. Requiere IA si hay errores.

**Contexto para la IA:**
- Worker en `nuevo-proyecto/BOE-Worker/`
- `.env` del worker necesita: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_SMTP_HOST`, `BREVO_SMTP_USER`, `BREVO_SMTP_PASS`, `BREVO_SMTP_PORT`
- Comando: `node src/index.js`
- El worker hace: fetch `client_boe_configs` donde `is_active=true` → para cada cliente, scraping BOE + filtrado + email

**Checklist:**
- [ ] Confirmar que `.env` del BOE-Worker tiene todas las vars reales
- [ ] Ejecutar `node src/index.js` desde `nuevo-proyecto/BOE-Worker/`
- [ ] Verificar logs: debe mostrar clientes encontrados, artículos scrapeados, emails enviados
- [ ] Verificar email llegado al destinatario del cliente real
- [ ] Si hay errores, debuggear en esa sesión

**Estado:** ⏳ PENDIENTE (hacer después de Chat A)

---

### CHAT C — Panel self-service cliente (pieza grande de código)
**Objetivo:** Que un cliente pueda hacer login, ver su estado y editar sus keywords/destinatarios sin que Josep intervenga.
**Tipo:** Nueva feature de código. 1 sesión de trabajo estimada.

**Contexto para la IA:**
- Stack: Next.js 14 App Router + Supabase Auth (ya configurado para admin)
- Auth actual en `web-app/middleware.ts`: protege `/dashboard/*` para ADMIN_EMAILS
- NO existe route group `(cliente)` ni rutas `/panel/*`
- Tablas relevantes: `clients` (email, status, plan_activo), `client_boe_configs` (keywords_positive, keywords_negative, destination_emails, is_active)
- Supabase Auth ya está instalado — `@supabase/ssr` ya en el proyecto

**Lo que hay que construir (mínimo viable):**
1. Route group `(cliente)` con layout propio (no el del admin)
2. `/panel` → página principal del cliente: estado suscripción, plan activo, próxima ejecución
3. `/panel/keywords` → editar `keywords_positive` y `keywords_negative` del cliente (textarea simple)
4. `/panel/destinatarios` → editar `destination_emails` (lista de emails)
5. Auth pages: `/login` para clientes (distinta del admin login) → Supabase Auth email+password
6. Middleware update: añadir regla para `/panel/*` → requiere sesión Supabase pero NO requiere ADMIN_EMAILS → solo que `clients.primary_email = auth.email`
7. RLS en Supabase: políticas para que el cliente autenticado solo vea/edite SU fila en `client_boe_configs`

**Reglas para esta misión:**
- Feo y funcional > bonito. No CSS personalizado hasta que fluya.
- No tocar middleware admin (`/dashboard/*` debe seguir igual).
- No tocar tabla `clients` directamente desde el panel cliente — solo `client_boe_configs`.
- El cliente NO puede cambiar su plan desde el panel → redirigir al portal Stripe.

**Estado:** ✅ HECHO (2026-04-20)

**Qué se hizo:**
- `lib/supabase/admin.ts` → cliente service role (server-side only)
- `lib/auth.ts:requireClienteAuth()` → auth + lookup cliente por email
- `app/acceso/page.tsx` → login cliente → redirige a `/panel`
- `app/(cliente)/layout.tsx` → sidebar: Panel / Keywords / Destinatarios / Facturación / Logout
- `app/(cliente)/panel/page.tsx` → estado, plan, última ejecución, acciones rápidas
- `app/(cliente)/panel/keywords/page.tsx` → editor keywords positivas/negativas
- `app/(cliente)/panel/destinatarios/page.tsx` → editor emails destinatarios
- `app/actions/clienteActions.ts` → getClienteData, updateKeywords, updateDestinatarios (Zod)
- `middleware.ts` → `/panel/*` requiere sesión, sin whitelist admin
- `supabase_migrations/08_rls_cliente.sql` → RLS cliente solo ve su fila
- Build: 39 páginas, 0 errores ✅

**Pasos manuales pendientes (Josep):**
1. Aplicar `supabase_migrations/08_rls_cliente.sql` en Supabase SQL Editor
2. Crear usuario Supabase Auth para el cliente: Dashboard → Authentication → Users → Invite user

---

### CHAT D — Playbook outbound vertical 1 (despachos de abogados)
**Objetivo:** Primera campaña de captación activa con el scraper existente.
**Tipo:** Operación + generación de copy. Sin código nuevo.

**Contexto para la IA:**
- Scraper funcional en `ScrapperEmpresasBOE - copia/src/cli.js`
- Vertical objetivo: **despachos de abogados especializados en licitación, subvenciones, contratación pública**
- Prueba social disponible: 1 cliente real de Radar BOE (despacho/consultora) — usar anonimizado
- Objetivo: 500-1000 contactos scrapeados → secuencia 3 emails → 2-5 reuniones/semana

**Lo que hay que producir:**
1. Revisar y ejecutar `ScrapperEmpresasBOE - copia/src/cli.js` para vertical despachos abogados
2. Generar copy secuencia 3 emails:
   - Email 1: introducción + prueba social (caso cliente real anonimizado)
   - Email 2: follow-up con demo/caso concreto
   - Email 3: cierre con urgencia suave
3. Configurar tracking en Brevo (aperturas, clics, respuestas)
4. Guardar plantillas de copy en el sistema (proponer dónde)

**Estado:** ⏳ PENDIENTE (puede hacerse en paralelo con Chat B/C)

---

### CHAT E — BOE-Worker como cron automático en producción
**Objetivo:** Que el worker ejecute solo cada día a las 8:00 AM sin intervención manual.
**Tipo:** Infraestructura + código corto.

**Opciones (en orden de preferencia para el stack actual):**
1. **Vercel Cron Jobs** (más simple si web-app ya está en Vercel) → añadir `vercel.json` con cron + endpoint `GET /api/boe/cron` que llame al worker
2. **Cron en VPS** con PM2 o crontab → `node src/index.js` a las 8:00

**Contexto para la IA:**
- BOE-Worker es Node.js standalone, no Next.js
- Si se usa Vercel Cron, el endpoint cron debe estar en `web-app/app/api/boe/cron/route.ts` y llamar a la lógica del worker o a un webhook que dispare el worker en el VPS
- Alternativa más simple: si hay VPS, añadir crontab `0 8 * * * node /ruta/BOE-Worker/src/index.js`

**Estado:** ⏳ PENDIENTE (hacer después de Chat B)

---

### Estado global de las misiones

| Chat | Misión | Estado |
|---|---|---|
| A | Config externa (Stripe + Vercel + Supabase) | ✅ HECHO (2026-04-20) |
| B | Test BOE-Worker con cliente real | ⏳ PENDIENTE — **SIGUIENTE CHAT** |
| C | Panel self-service cliente | ✅ HECHO (2026-04-20) |
| D | Playbook outbound despachos abogados | ⏳ PENDIENTE |
| E | BOE-Worker como cron automático | ⏳ PENDIENTE |

**Orden recomendado:** ~~A~~ ✅ → **B (siguiente chat)** → C ✅ → D (paralelo con B) → E

**Regla para cualquier IA futura:** Cuando termines tu misión, marca su estado como ✅ HECHO en esta tabla y añade una línea de lo que hiciste bajo el chat correspondiente.

---

**Última actualización:** 2026-04-20
**Dueño:** Josep
**Versión del plan:** v2.1 (Chat A completado — siguiente: Chat B)

---

## 16. Estado actual y pasos pendientes (actualizado 2026-04-20)

### 16.1 Pasos manuales — estado

#### ✅ COMPLETADO — Seguridad + configuración externa (hecho por Josep el 2026-04-20)
- [x] Rotar `STRIPE_WEBHOOK_SECRET`
- [x] Rotar `STRIPE_SECRET_KEY`
- [x] Rotar `SUPABASE_SERVICE_ROLE_KEY`
- [x] Rotar `BREVO_API_KEY`
- [x] Variables en Vercel (STRIPE_*, SUPABASE_*, BREVO_API_KEY, ADMIN_EMAILS, NEXT_PUBLIC_SITE_URL)
- [x] Migración `07_stripe_columns.sql` aplicada en Supabase
- [x] Fix RLS incidents aplicado en Supabase
- [x] Migración `08_rls_cliente.sql` aplicada en Supabase
- [x] Webhook Stripe registrado con los 4 eventos
- [x] Billing Portal Stripe activado
- [x] Redeploy Vercel ejecutado

#### 🟢 Panel cliente — pendiente operativo (Josep)
- [ ] Crear usuario Supabase Auth para el cliente existente: Supabase Dashboard → Authentication → Users → "Invite user" con el email del cliente real
- [ ] Decirle al cliente que acceda en `https://mavieautomations.com/acceso`

---

### 16.2 Qué se ha hecho en código (estado real del repo)

| Sesión | Qué se hizo | Estado |
|---|---|---|
| 2026-04-19 #1 | BOE-Worker multi-tenant completo (`orchestrator`, `BoeScraper`, `filter`, `email`) | ✅ |
| 2026-04-19 #2 | Stripe Checkout + Webhook básico + landing 79/179/399€ | ✅ |
| 2026-04-19 #3 | Webhook robusto (4 eventos), portal Stripe, página `/gracias`, checkout mejorado | ✅ |
| 2026-04-20 #1 | Auditoría seguridad: `ADMIN_EMAILS` fail-closed, `requireAdminApi()`, 4 rutas Brevo protegidas, IDOR Stripe eliminado | ✅ |
| 2026-04-20 #2 | **Chat C — Panel self-service cliente:** `/acceso` login, `/panel` dashboard, `/panel/keywords`, `/panel/destinatarios`, server actions, middleware extendido, migración RLS 08 | ✅ |

---

### 16.3 Qué falta para el siguiente chat (en orden de prioridad)

1. **Chat B — Probar BOE-Worker** (requiere que Chat A esté hecho):
   - Ejecutar `node src/index.js` desde `nuevo-proyecto/BOE-Worker/` con `.env` real
   - Verificar que el email llega al cliente existente
   - Debuggear si hay errores

2. **Chat D — Playbook outbound vertical 1** (puede hacerse en paralelo con B):
   - Ejecutar scraper para despachos de abogados (`ScrapperEmpresasBOE - copia/src/cli.js`)
   - Generar copy secuencia 3 emails con prueba social del cliente actual
   - Configurar tracking en Brevo

3. **Chat E — BOE-Worker como cron automático** (después de Chat B):
   - Opción A: Vercel Cron → endpoint `GET /api/boe/cron` en web-app que dispara el worker
   - Opción B: crontab en VPS → `0 8 * * * node /ruta/BOE-Worker/src/index.js`
   - Estimación: 1 chat corto


# MAVIE MASTER CONTEXT

## Contexto estratégico

Este proyecto pertenece a Josep y se llama Mavie Automations.

Mavie Automations es un ecosistema SaaS B2B centrado en automatizar vigilancia de boletines oficiales como BOE, DOUE y BDNS.

El producto principal actual es Radar BOE, orientado inicialmente a:

- Despachos de abogados.
- Consultoras de subvenciones.
- Gestorías.

## Objetivo económico

Objetivo en 3-12 meses:

- 3 meses: 1.000-2.000€/mes.
- 12 meses: 6.000-10.000€/mes.
- 24 meses: Mavie como activo vendible.

Principio principal:

> Dinero real > perfección técnica.

Si algo funciona feo pero factura, se deja así.

## Lo que ya funciona

### Web-app

La web-app usa Next.js 14 y Supabase.

Ya existe:

- Landing Mavie.
- Landing Radar BOE.
- Pricing con planes de 79€, 179€ y 399€.
- Stripe Checkout.
- Stripe Webhook.
- Stripe Portal.
- Panel cliente.
- Dashboard admin.
- Onboarding público.
- Honeypot.
- hCaptcha.
- Seguridad base: rate-limit, captcha, CSP y HSTS.

### BOE-Worker

El BOE-Worker usa Node.js.

Ya hace:

- Fetch BOE.
- Filtrado por keywords.
- Email digest.
- Prueba con cliente real y 54 oportunidades.
- Cron automático en Vercel a las 08:00.

### Scraper de captación

Existe scraper de captación con:

- Google Maps scraping.
- Rutas de contacto.
- Clasificación con GPT-4o-mini.
- Emails HTML.
- Tracking de aperturas y clics.
- Follow-ups en hilo.
- Anti-spam headers.
- Leads preparados.

### Infraestructura

Existe:

- VPS Contabo.
- Node 22.
- Chrome.
- PM2.
- Brevo SMTP.
- Vercel.
- Cloudflare.
- Supabase.
- Un cliente real pagando.

## Prioridades actuales

### Bloqueadores

1. Probar BOE-Worker con cliente real.
2. Crear usuario Supabase Auth para cliente.

### Prioridad alta

3. Deploy multi-SMTP en VPS.
4. Playbook outbound para despachos de abogados.

### Prioridad media

5. SEO programático con páginas para verticales.

### Prioridad baja

6. Sistema de vídeos solo cuando haya al menos 10 clientes o 3.000€/mes.

## Stack técnico obligatorio

No cambiar este stack salvo orden explícita de Josep:

- Frontend: Next.js 14 App Router.
- Hosting frontend: Vercel.
- Base de datos: Supabase Postgres + RLS.
- Pagos: Stripe.
- Email: Brevo SMTP y futuro Listmonk.
- Worker BOE: Node.js + Cron Vercel.
- Scraper: Puppeteer + cheerio + Google Maps.
- IA: OpenAI GPT-4o-mini.
- VPS: Contabo + PM2.
- Infraestructura: Vercel + Cloudflare.

## Reglas de oro

1. Time-to-revenue > perfección técnica.
2. 0€ invertido si se puede resolver con código y tiempo.
3. Multi-tenant desde ya mediante client_id.
4. Tocar solo `nuevo-proyecto/`.
5. `scraper-copia/` es referencia, no se modifica.
6. No lanzar productos nuevos hasta llegar a 3.000€/mes con Radar BOE.
7. Verticales prioritarios: abogados, consultoras y gestorías.
8. El cliente real actual debe usarse como prueba social.
9. Playbook repetible: nicho → scrape → copy → secuencia → tracking.
10. No duplicar lógica.
11. Portar código limpiamente.
12. Tests solo donde duele fallar: pagos, emails, auth y worker BOE.

## Estructura esperada

```txt
nuevo-proyecto/
├── web-app/
│   ├── app/
│   ├── actions/
│   ├── lib/
│   ├── components/
│   └── package.json
├── BOE-Worker/
│   ├── src/
│   └── package.json
└── database/
    └── schema.sql
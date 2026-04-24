# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```
nuevo-proyecto/
├── web-app/          # Next.js 14 (App Router) — primary web application
├── BOE-Worker/       # Node.js CommonJS scraper (runs as standalone cron)
└── database/         # Supabase SQL schema and migrations
```

---

## web-app — Commands

All commands run from `nuevo-proyecto/web-app/`:

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint via next lint
```

No test runner is configured.

### Environment

Copy `.env.example` → `.env.local` and fill:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_EMAILS=email1@domain.com,email2@domain.com   # comma-separated admin whitelist
# Brevo keys used by /api/brevo/* routes (not in .env.example yet)
```

---

## Architecture — web-app

### Route Groups

- **Public routes** — `/`, `/servicios`, `/soluciones/*`, `/sobre-nosotros`, `/contacto`, `/login`, `/onboarding/*`
- **Admin group** `(admin)` — maps to `/dashboard/*`. Protected by `middleware.ts` which checks Supabase auth AND the `ADMIN_EMAILS` whitelist. Unauthorized users are redirected to `/login?error=unauthorized`.

The `(admin)` route group has its own layout ([app/(admin)/layout.tsx](web-app/app/(admin)/layout.tsx)) with a fixed sidebar. The public layout ([app/layout.tsx](web-app/app/layout.tsx)) wraps with `Navbar` + `Footer`.

### Data Layer

Two Supabase clients — **never swap them**:
- `lib/supabase/client.ts` → `createBrowserClient` — use in Client Components
- `lib/supabase/server.ts` → `createServerClient` with cookie handling — use in Server Components, Server Actions, and API routes

### Server Actions

- `app/actions/crmActions.ts` — client CRUD, status updates, notes
- `app/actions/outreachActions.ts` — outreach campaign management
- `app/actions/submitOnboarding.ts` — **public** onboarding form handler; does NOT call `requireAuth()` (intentional — unauthenticated visitors fill this form). Creates a `clients` row with status `listo_para_activar`.

All admin actions call `requireAuth()` (`lib/auth.ts`) as first line. Input is validated with Zod before hitting Supabase.

### API Routes

`app/api/brevo/` exposes REST endpoints that proxy Brevo email marketing API (campaigns, contacts, emails, stats).

`app/api/contact/` handles the public contact form.

### Design System

No external component library. Everything is custom Tailwind.

- **Fonts**: Inter (`--font-inter`, body/sans) + Syne (`--font-syne`, headings)
- **Themes**: dark by default (`next-themes`, no system detection). CSS custom properties in `app/globals.css` define the full token set for both `:root` (light) and `.dark`.
- **Token naming**: colors use `hsl(var(--token))` for Tailwind integration; neutrals are direct hex vars (`--neutral-950` through `--neutral-50`). In dark mode the scale is inverted — `--neutral-950` is darkest, `--neutral-50` is lightest.
- **Utility classes**: `.bg-grid`, `.text-gradient`, `.blue-gradient`, `.glow-blue` defined in `globals.css`.
- **`cn()` helper** is inlined per-file (not from a shared `lib/utils`); `lib/utils.ts` exists but individual components repeat the pattern.

---

## Architecture — BOE-Worker

Standalone Node.js CommonJS script (`src/index.js`). Reads `client_boe_configs` from Supabase, filters active clients, and iterates over them. **The actual scraping logic is currently stubbed out** (`runScraperForClient` call is commented). Only the client-fetch loop and execution_log insert are functional.

Run manually: `node src/index.js` (from `BOE-Worker/`)

Requires `.env` in `BOE-Worker/` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Uses `service_role` key which bypasses RLS.

---





## Database Schema

Key tables (all in Supabase with RLS enabled, authenticated role has full access):

| Table | Purpose |
|---|---|
| `clients` | Master CRM record. Status enum (Postgres type): `lead`, `presupuesto_enviado`, `esperando_respuesta`, `onboarding_pendiente`, `listo_para_activar`, `activo`, `pausado`, `cancelado` |
| `client_boe_configs` | 1:1 with clients. Keywords, regions, frequency for BOE radar |
| `outreach_campaigns` | Prospect campaigns managed from `/dashboard/captacion`. Status: `draft → scraping → sending → completed / paused` |
| `boe_match_history` | BOE opportunities found per client |
| `client_email_logs` | Per-client email send records (module, status, recipients) |
| `incidents` | Operational errors surfaced in `/dashboard/incidencias` |
| `execution_logs` | Worker run audit trail |

Base schema: `database/schema.sql`. Additional migrations in `web-app/supabase_migrations/`:
- `04_outreach_campaigns.sql`
- `05_incidents.sql`
- `06_admin_users_and_audit.sql` — admin whitelist table + audit log (aplicar manualmente en Supabase)

---

## Security Stack (P0 — implemented 2026-04-15)

### Middleware layer ([lib/security/](web-app/lib/security/))

- `rateLimit.ts` — in-memory sliding window (upgrade path: Upstash Redis vía env vars). Buckets pre-configurados: `contactForm` (3/min), `onboarding` (3/min), `authLogin` (5/min).
- `captcha.ts` — hCaptcha server-side verify (`verifyCaptcha`). Disabled if env vars missing; dev-mode bypass.
- `honeypot.ts` — hidden field + timestamp (min 2s, max 1h).
- `getClientIp.ts` — extracts IP from `x-forwarded-for` / `x-real-ip` / `x-vercel-forwarded-for`.

### Public form hardening

Every public-facing entry point (contact API + onboarding server action) runs: **rate-limit → Zod → honeypot → captcha → business logic**. Honeypot failures return `success` to avoid leaking detection.

### Client components

- `components/HCaptcha.tsx` — lazy-loaded hCaptcha widget (theme-aware).
- `components/HoneypotFields.tsx` — injects hidden field + timestamp; import into any new public form.
- `components/CookieBanner.tsx` — GDPR banner, persists choice in localStorage.

### Required env vars (see `.env.example`)

- `HCAPTCHA_SECRET_KEY` + `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` — register at hcaptcha.com (free tier).
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — OPTIONAL, for multi-region rate limiting.

### Security headers ([next.config.mjs](web-app/next.config.mjs))

CSP (restricts scripts/styles/fonts/connect), HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera/mic/geo disabled), COOP same-origin, CORP same-site.

**Note:** `'unsafe-inline'` + `'unsafe-eval'` currently allowed for scripts (hCaptcha + Next.js inline). Upgrade to nonce-based CSP when time permits.

---

## Roadmap (priorizado)

### ✅ P0 — Seguridad crítica (done 2026-04-15)
- Headers seguridad + CSP en `next.config.mjs`.
- Rate limit + hCaptcha + honeypot en `/api/contact` + `submitOnboarding`.
- Cookie banner + consent explícito en formularios.
- Migración `admin_users` + `admin_audit_log` (aplicar en Supabase).

### 🔜 P1 — SEO + performance
- [ ] `metadata` export por ruta (title/description únicos).
- [ ] JSON-LD adicional: `Service` por solución, `BreadcrumbList`, `FAQPage`.
- [ ] Canonical + hreflang (cuando haya i18n).
- [ ] `next/image` con AVIF/WebP en todas las imágenes.
- [ ] Lighthouse CI. Objetivo: Perf ≥ 95, LCP < 2.5s, INP < 200ms, CLS < 0.1.
- [ ] Páginas legales: `/privacidad`, `/aviso-legal`, `/cookies`.
- [ ] i18n multi-idioma (es-ES + en) vía `next-intl` o similar.

### 🔜 P2 — UI/UX refinement
- [ ] Fix `glass-card` + `text-gradient` contraste en light mode.
- [ ] Centralizar `cn()` en `lib/utils.ts` (eliminar duplicados por archivo).
- [ ] Componentes base: `Button`, `Card`, `Input`, `Toast` tipados.
- [ ] Transiciones coherentes (150/300/500ms, expo-out).
- [ ] Revisar `prefers-reduced-motion`.

### 🔜 P3 — Hardening avanzado
- [ ] Supabase MFA (TOTP) para login admin.
- [ ] Migrar `ADMIN_EMAILS` env → consultas a tabla `admin_users` desde `middleware.ts` + `lib/auth.ts` (`is_admin()` RPC creada en migración 06).
- [ ] Triggers Postgres para `admin_audit_log` en `clients` / `outreach_campaigns` (INSERT/UPDATE/DELETE).
- [ ] Sentry integración (`@sentry/nextjs`).
- [ ] Export/delete endpoints GDPR (derecho acceso + olvido).
- [ ] Mover rate limiter a Upstash Redis si se despliega multi-región.

### Público objetivo confirmado
B2B empresas + B2C / autónomos. Multi-idioma (es-ES inicial + en).

# MAVIE MASTER PLAN — Josep
> Última actualización: 2026-04-21  
> Objetivo: máximo impacto, 0€ invertido, solo tiempo + código  
> Principio: dinero real antes que perfección técnica

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
│  ├── Stripe self-serve (ya funciona)                     │
│  └── Panel cliente self-service (ya funciona)            │
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

#### PASO 1.2 — Añadir rotación SMTP al scraper

Archivo: `ScrapperEmpresasBOE - copia/src/services/email.js`

Añadir al .env del scraper (después de rotar los que ya tienes):
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

*Josep Cervera · Mavie Automations · mavieautomations.com*  
*Actualizado: 2026-04-21*

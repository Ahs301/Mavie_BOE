# Mejoras Planificadas — Captacion Worker

> Auditoría: 2026-05-29. Estado actual: pipeline funcional, fuente única (Google Maps), sin verificación de emails, sin decisores reales.

---

## Problemas Críticos a Resolver

### 1. Email Verification (PRIORIDAD MÁX)
**Problema:** Se envían emails sin verificar. Bounces >5% queman el dominio en Brevo.
**Solución:** Verificar antes de insertar en DB y antes de enviar.
- Opción A (gratis): MX lookup + SMTP RCPT TO handshake sin enviar
- Opción B (pago, recomendada): ZeroBounce API (~0.004€/verificación) o NeverBounce
- Integrar en `cli.js` paso previo al `insertLead` → skip si invalid/risky

### 2. Auto-Detección de Replies (IMAP)
**Problema:** `mark-replied` es manual. Si alguien responde y no lo marcas → sigue recibiendo follow-ups.
**Solución:** Extender `bounce_handler.js` para parsear subject + In-Reply-To y cruzar con `sends.messageId`. Auto-marcar REPLIED si hay coincidencia.

### 3. Emails Genéricos (info@, contacto@)
**Problema:** Cuando no se encuentra email personal, se usa genérico. Tasas de respuesta ~3x peores.
**Solución:** Buscar decisor real antes de caer a genérico (ver BORME + Hunter.io abajo).

---

## Nuevas Fuentes de Datos

### FUENTE 1: BORME (Registro Mercantil) ⭐ MÁXIMO IMPACTO
**Qué es:** Base de datos oficial española de empresas. Gratis. API pública.
**URL:** `https://boe.es/datosabiertos/api/borme`
**Qué aporta:**
- Razón social, NIF, dirección
- **Nombres de administradores/representantes** → decisores reales, no info@
- Publicaciones diarias de nuevas empresas
**Implementación:** Nuevo archivo `src/scraper/borme.js`
- Buscar empresa por nombre o NIF
- Extraer nombres administradores
- Generar patrones email `nombre.apellido@dominio` + verificar con ZeroBounce
- Guardar `contact_name` en lead → personalization mucho mejor

### FUENTE 2: Páginas Amarillas
**Qué es:** Directorio con negocios que NO están en Google Maps.
**URL:** `paginasamarillas.es`
**Qué aporta:** +30-40% más cobertura de empresas. HTML más estable que Maps.
**Implementación:** Nuevo archivo `src/scraper/amarillas.js`
- Scraping con axios + cheerio (sin Puppeteer, más rápido)
- Campos: nombre, teléfono, web, categoría, dirección
- Integrar en `cli.js` como comando `scrape-amarillas`

### FUENTE 3: Hunter.io API
**Qué es:** API para encontrar emails profesionales por dominio.
**Pricing:** 25 búsquedas/mes gratis. 49$/mes para 500.
**Qué aporta:** Calidad de email muy superior al scraping de webs. Devuelve patrón + emails conocidos.
**Implementación:** Enriquecer leads con web conocida en `utils/hunterEnrich.js`
- Solo llamar para dominios donde no se encontró email personal
- Guardar confidence score

### FUENTE 4: BDNS (Base Datos Nacional Subvenciones)
**Qué es:** API oficial con empresas que han recibido/solicitado subvenciones.
**URL:** `https://www.infosubvenciones.es/bdnstrans/api`
**Qué aporta:** Leads CALIENTES — empresas que YA usan subvenciones = clientes perfectos para Radar BOE.
**Implementación:** Nuevo `src/scraper/bdns.js`
- Filtrar por CCAA, sector, tipo convocatoria
- Obtener NIF → cruzar con BORME para datos de contacto

### FUENTE 5: Bing Maps API
**Qué es:** API oficial de Bing (tiene free tier 125k/mes).
**Qué aporta:** Empresas diferentes a Google Maps. Sin Puppeteer, sin captchas. Más estable.
**Implementación:** `src/scraper/bing.js`
- Usar `Bing Maps Local Search API`
- Mismos campos que Google: nombre, web, teléfono, categoría
- Fusionar resultados con deduplicación existente

### FUENTE 6: Directorios Colegios Profesionales
**Qué es:** Listados públicos de colegiados (abogados, ingenieros, arquitectos).
**Qué aporta:** Emails verificados, decisores directos, segmento de alto valor.
**Implementación:** `src/scraper/colegios.js`
- ICAM (Ilustre Colegio Abogados Madrid)
- COAM (Arquitectos Madrid)
- Colegios autonómicos
- Scraping básico de listados públicos

---

## Mejoras de Calidad / Enrichment

### Decisor desde web (sin API)
Extender `utils/scraper.js` para parsear páginas "Quiénes somos" / "Equipo" / "Sobre nosotros":
- Extraer nombres propios + cargos (regex + heurística)
- Guardar `contact_name` y `contact_title` en lead
- GPT usa esto para generar mejor `openingLine`

### Enriquecimiento de descripción
Actualmente GPT solo tiene `nombre, categoría, ciudad`.
Añadir: descripción de la web (meta description o primer párrafo) → `openingLine` mucho más específica.

### Deduplicación cross-campaign
Actualmente la DB SQLite local evita duplicados, pero si la empresa tiene emails distintos en dos scrapers distintos, puede recibir doble email.
- Añadir tabla `blacklist_domains` + `blacklist_emails`
- Deduplicar por dominio, no solo por email

---

## Si se Vende el Servicio de Captación

### Templates nuevos (no Radar BOE)
Los emails actuales venden Radar BOE. Para vender captación como servicio:
- Nuevo templateKey `captacion_service`
- Copy: "Montamos el sistema de prospección que os trae X reuniones/mes"
- Caso real anonimizado como prueba social

### Portal Cliente Read-Only
Si se vende a terceros, el cliente necesita ver métricas sin acceder al servidor.
- Endpoint `/api/captacion/report?token=xxx` con stats básicas
- O conectar con Supabase y usar dashboard web-app panel admin ya existente

---

## Roadmap de Implementación

| Prioridad | Tarea | Archivo | Estado |
|-----------|-------|---------|--------|
| 🔴 1 | Email verification (MX + SMTP RCPT TO) | `utils/emailVerifier.js` | ✅ HECHO |
| 🔴 2 | Auto-reply detection IMAP | `email/bounce_handler.js` | ✅ HECHO |
| 🟠 3 | BORME scraper + decisores | `scraper/borme.js` | ✅ HECHO |
| 🟠 4 | Páginas Amarillas scraper | `scraper/amarillas.js` | ✅ HECHO |
| 🟡 5 | Hunter.io enrichment | `utils/hunterEnrich.js` | ✅ HECHO |
| 🟡 6 | BDNS scraper | `scraper/bdns.js` | ✅ HECHO |
| 🟡 7 | Bing Maps API | `scraper/bing.js` | ✅ HECHO |
| 🟢 8 | Web description + decisor desde web | `utils/decisionMaker.js` | ✅ HECHO |
| 🟢 9 | Templates para vender captación | `templates/templates.js` | ✅ HECHO |
| 🟢 10 | Deduplicación cross-campaign (blacklist) | `db/index.js` + `migrations.js` | ✅ HECHO |
| 🟢 11 | Colegios profesionales scraper | `scraper/colegios.js` | ⏳ Bajo impacto, pospuesto |

## Variables de entorno necesarias para nuevas funciones

```env
# Hunter.io (opcional, 25 búsquedas/mes gratis)
HUNTER_API_KEY=tu_key_aqui

# Bing Maps (opcional, 125k req/mes gratis)
# Registro en: https://www.bingmapsportal.com/
BING_MAPS_KEY=tu_key_aqui
```

## Comandos nuevos disponibles

```bash
# BORME — empresas del Registro Mercantil + administrador
node src/cli.js scrape-borme                          # hoy
node src/cli.js scrape-borme --days 5                 # últimos 5 días hábiles
node src/cli.js scrape-borme --query "asesoría"       # por texto
node src/cli.js scrape-borme --hunter                 # + enriquecer con Hunter.io

# Bing Maps — empresas sin captchas (necesita BING_MAPS_KEY)
node src/cli.js scrape-bing -n "asesoría" -l "Madrid"

# BDNS — leads calientes que ya gestionan subvenciones
node src/cli.js scrape-bdns -q "asesoría" --hunter

# Blacklist — nunca volver a enviar a un email/dominio
node src/cli.js blacklist-add -e email@empresa.com
node src/cli.js blacklist-domain -d empresa.com
node src/cli.js blacklist-remove -e email@empresa.com
node src/cli.js blacklist-list

# Mega campaña (todas las fuentes en paralelo)
node src/cli.js scrape-dual -n "asesoría" -l "Madrid"  # Google Maps + Amarillas
```

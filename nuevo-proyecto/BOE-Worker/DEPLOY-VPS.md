# Deploy BOE-Worker en VPS — Guía paso a paso

> Proveedor recomendado: **Contabo VPS S** (€4.99/mes, 4 vCPU, 8 GB) o **DigitalOcean Droplet** ($6/mes).
> OS a elegir: **Ubuntu 22.04 LTS**.

---

## PARTE 1 — Contratar VPS

### Opción A: Contabo
1. Ir a contabo.com → VPS → VPS S (€4.99/mes)
2. Elegir región: Alemania o cualquiera (da igual para este uso)
3. OS: Ubuntu 22.04
4. Pago con tarjeta normal — no pide VAT obligatorio
5. Recibirás email con IP, usuario `root` y contraseña

### Opción B: DigitalOcean (si Contabo da problemas)
1. Ir a digitalocean.com → Create Droplet
2. Región: Frankfurt (más cerca)
3. OS: Ubuntu 22.04
4. Plan: Basic Shared CPU, 1 GB RAM ($6/mes) — suficiente para el worker
5. Auth: elige Password (más simple)
6. Recibirás email con IP del droplet

---

## PARTE 2 — Primer acceso y seguridad básica

Conectar desde tu terminal (Windows: usar PowerShell o instalar Windows Terminal):

```bash
ssh root@TU_IP_VPS
```

Actualizar sistema:

```bash
apt update && apt upgrade -y
```

Crear usuario no-root (buena práctica):

```bash
adduser mavie
contraseña PacoElMejor11
usermod -aG sudo mavie
```

Configurar firewall:

```bash
ufw allow OpenSSH
ufw allow 3001/tcp
ufw enable
```

> Puerto 3001 es donde escucha el BOE-Worker. Solo Vercel lo llamará.

---

## PARTE 3 — Instalar Node.js 20 y PM2

```bash
# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Verificar versión
node --version   # debe ser v20.x.x
npm --version

# Instalar PM2 globalmente
npm install -g pm2
```

---

## PARTE 4 — Subir el código del BOE-Worker

**Desde tu máquina (Windows PowerShell o Git Bash):**

```bash
# Subir toda la carpeta BOE-Worker al VPS
scp -r "C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB\nuevo-proyecto\BOE-Worker" root@TU_IP_VPS:/opt/boe-worker
```

> Si no tienes `scp` en Windows, instala Git for Windows — incluye scp. O usa WinSCP (GUI).

**En el VPS:**

```bash
cd /opt/boe-worker
npm install
```

---

## PARTE 5 — Configurar variables de entorno

```bash
cd /opt/boe-worker
nano .env
```

Pega esto y rellena los valores reales:

```env
# Supabase
SUPABASE_URL=https://XXXX.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Brevo SMTP
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=tu_email_brevo
BREVO_SMTP_PASS=tu_smtp_key_brevo

# Seguridad — mismo valor que pondrás en Vercel
CRON_SECRET=

# Puerto del servidor
PORT=3001
```

> Para generar CRON_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` — ejecuta en cualquier terminal con Node.

Guardar en nano: `Ctrl+O` → Enter → `Ctrl+X`

Proteger el archivo:

```bash
chmod 600 .env
```

---

## PARTE 6 — Arrancar con PM2

```bash
cd /opt/boe-worker

# Arrancar el servidor
pm2 start src/server.js --name boe-worker

# Ver que está corriendo
pm2 status

# Ver logs en tiempo real
pm2 logs boe-worker

# Guardar configuración PM2
pm2 save

# Configurar auto-start al reiniciar el VPS
pm2 startup
# → PM2 te devuelve un comando sudo. EJECÚTALO tal cual.
```

**Verificar que funciona:**

```bash
curl http://localhost:3001/health
# Debe devolver: {"ok":true}
```

---

## PARTE 7 — Configurar Vercel para que dispare el cron

Ir a Vercel → tu proyecto → Settings → Environment Variables.

Añadir estas dos variables:

| Variable | Valor |
|---|---|
| `BOE_WORKER_URL` | `http://TU_IP_VPS:3001` |
| `CRON_SECRET` | el mismo valor que pusiste en el `.env` del VPS |

Luego en Vercel → Deployments → redeploy (para que coja las nuevas vars).

El `vercel.json` ya está configurado en el repo para llamar a `/api/boe/cron` cada día a las 8:00 AM.

---

## PARTE 8 — Test manual del flujo completo

**Test 1 — Worker directo desde VPS:**

```bash
# En el VPS
curl -X POST http://localhost:3001/trigger \
  -H "Authorization: Bearer TU_CRON_SECRET" \
  -H "Content-Type: application/json"

# Debe devolver: {"ok":true,"message":"Worker iniciado"}
# Revisar logs: pm2 logs boe-worker
```

**Test 2 — Desde exterior (simular Vercel):**

```bash
# Desde tu máquina local
curl -X POST http://TU_IP_VPS:3001/trigger \
  -H "Authorization: Bearer TU_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Test 3 — Cron de Vercel:**
Ir a Vercel → tu proyecto → Settings → Cron Jobs → ejecutar manualmente el job `/api/boe/cron`.

---

## PARTE 9 — Comandos PM2 útiles del día a día

```bash
pm2 status              # ver estado de todos los procesos
pm2 logs boe-worker     # logs en tiempo real
pm2 logs boe-worker --lines 100  # últimas 100 líneas
pm2 restart boe-worker  # reiniciar (tras cambios de código)
pm2 stop boe-worker     # parar
pm2 delete boe-worker   # borrar de PM2
```

---

## PARTE 10 — Actualizar código en el futuro

Cuando hagas cambios en BOE-Worker:

```bash
# Desde tu máquina — subir solo los archivos src/
scp -r "C:\Users\Maste\Desktop\Proyectos2026\MAVIE_BOE_WEB\nuevo-proyecto\BOE-Worker\src" root@TU_IP_VPS:/opt/boe-worker/

# En el VPS — reiniciar
pm2 restart boe-worker
pm2 logs boe-worker
```

---

## Checklist final

- [ ] VPS contratado, IP conocida
- [ ] SSH funciona: `ssh root@TU_IP`
- [ ] Node 20 instalado: `node --version`
- [ ] PM2 instalado: `pm2 --version`
- [ ] Código subido: `/opt/boe-worker/src/server.js` existe
- [ ] `.env` rellenado con valores reales
- [ ] `pm2 start` ejecutado, status `online`
- [ ] `curl http://localhost:3001/health` devuelve `{"ok":true}`
- [ ] `BOE_WORKER_URL` y `CRON_SECRET` añadidos en Vercel
- [ ] Test trigger manual OK
- [ ] Email llega al cliente real

---

## Resumen de arquitectura final

```
08:00 AM
  → Vercel Cron dispara GET /api/boe/cron
  → Vercel llama POST http://VPS:3001/trigger (con CRON_SECRET)
  → BOE-Worker ejecuta pipeline completo:
      fetch BOE → filtrar keywords por cliente → enviar email digest
  → PM2 mantiene el servidor 24/7, reinicia si cae
```

**Coste total infraestructura:**
- Vercel (web-app): gratis (plan hobby)
- VPS BOE-Worker: €4.99/mes
- Supabase: gratis (plan free)
- Brevo: gratis hasta 300 emails/día

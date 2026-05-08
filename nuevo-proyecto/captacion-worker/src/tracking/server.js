// src/tracking/server.js – servidor HTTP mínimo para tracking de aperturas y clics
import http from 'http';
import { URL } from 'url';
import { getDB, recordOpen, recordClick, markUnsubscribed, getLead } from '../db/index.js';
import getConfig from '../config.js';
import logger from '../utils/logger.js';
import nodemailer from 'nodemailer';

function sendHotLeadAlert(config, lead, trigger) {
    const alertTo = config.ALERT_EMAIL || config.SMTP_USER;
    if (!alertTo) return;
    const transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
    });
    const googleLink = `https://www.google.com/search?q=${encodeURIComponent((lead.name || lead.email) + ' linkedin')}`;
    const subject = `🔥 Hot lead: ${lead.name || lead.email} (${trigger})`;
    const text = `Hot lead detectado:\n\nEmpresa: ${lead.name || '-'}\nEmail: ${lead.email}\nSector: ${lead.type || '-'}\nCiudad: ${lead.city || '-'}\nTrigger: ${trigger}\nAperturas: ${lead.open_count}\nClics: ${lead.click_count}\n\nBuscar en LinkedIn: ${googleLink}\n\nActúa en <1 hora para mayor conversión.`;
    transporter.sendMail({
        from: config.FROM_EMAIL,
        to: alertTo,
        subject,
        text,
    }).catch(err => logger.warn(`Alert email failed: ${err.message}`));
}

// Imagen transparente 1x1 GIF
const TRANSPARENT_GIF = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

function getClientIp(req) {
    return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}

/**
 * Arranca el servidor de tracking.
 * Rutas:
 *  GET /open?id=LEAD_ID           → Pixel 1x1, registra apertura
 *  GET /click?id=LEAD_ID&url=URL  → Redirige y registra clic
 *  GET /unsub?id=LEAD_ID          → Desuscripción y confirmación HTML
 *  GET /health                    → Estado del servidor
 */
export function startTrackingServer() {
    const config = getConfig();
    const db = getDB(config.DB_PATH);
    const port = parseInt(process.env.TRACKING_PORT || '3456', 10);

    const server = http.createServer((req, res) => {
        const parsedUrl = new URL(req.url, `http://localhost:${port}`);
        const pathname = parsedUrl.pathname;
        const leadId = parsedUrl.searchParams.get('id');
        const ip = getClientIp(req);
        const ua = req.headers['user-agent'] || '';

        try {
            // ── /health ──────────────────────────────────────────────
            if (pathname === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', ts: new Date().toISOString() }));
                return;
            }

            // ── /open  ───────────────────────────────────────────────
            if (pathname === '/open') {
                if (leadId) {
                    recordOpen(db, leadId, ip, ua);
                    logger.info(`👁️  Apertura registrada: lead=${leadId} ip=${ip}`);
                    // Alerta en 2ª apertura (interés real, no solo preview)
                    const lead = getLead(db, leadId);
                    if (lead && lead.open_count === 2) {
                        sendHotLeadAlert(config, lead, '2ª apertura');
                    }
                }
                res.writeHead(200, {
                    'Content-Type': 'image/gif',
                    'Content-Length': TRANSPARENT_GIF.length,
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache',
                });
                res.end(TRANSPARENT_GIF);
                return;
            }

            // ── /click ───────────────────────────────────────────────
            if (pathname === '/click') {
                const targetUrl = parsedUrl.searchParams.get('url') || '/';
                if (leadId) {
                    recordClick(db, leadId, targetUrl, ip, ua);
                    logger.info(`🖱️  Clic registrado: lead=${leadId} url=${targetUrl}`);
                    // Alerta en cualquier clic = intent máximo
                    const lead = getLead(db, leadId);
                    if (lead) sendHotLeadAlert(config, lead, 'clic en CTA');
                }
                res.writeHead(302, { 'Location': targetUrl });
                res.end();
                return;
            }

            // ── /unsub ───────────────────────────────────────────────
            if (pathname === '/unsub') {
                if (leadId) {
                    markUnsubscribed(db, leadId);
                    logger.info(`🚫 Desuscripción: lead=${leadId}`);
                }
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Desuscrito</title>
<style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f4f6f9;}
.box{text-align:center;background:#fff;padding:40px;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08);max-width:420px;}</style>
</head><body><div class="box"><h2>✅ Te has desuscrito</h2>
<p>No recibirás más correos de nuestra parte.</p>
<p style="color:#6b7280;font-size:13px;">Si fue un error, puedes responder a cualquiera de nuestros emails.</p>
</div></body></html>`);
                return;
            }

            // 404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');

        } catch (err) {
            logger.error(`Error en tracking server: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error interno');
        }
    });

    server.listen(port, '0.0.0.0', () => {
        logger.info(`🛰️  Tracking server escuchando en http://0.0.0.0:${port}`);
        logger.info(`   Pixel:  ${config.TRACKING_URL || `http://localhost:${port}`}/open?id=<leadId>`);
        logger.info(`   Click:  ${config.TRACKING_URL || `http://localhost:${port}`}/click?id=<leadId>&url=<url>`);
        logger.info(`   Unsub:  ${config.TRACKING_URL || `http://localhost:${port}`}/unsub?id=<leadId>`);
    });

    process.on('SIGINT', () => {
        server.close();
        logger.info('Tracking server detenido.');
        process.exit(0);
    });

    return server;
}

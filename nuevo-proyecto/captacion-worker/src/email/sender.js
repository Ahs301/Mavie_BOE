// src/email/sender.js – multi-SMTP rotation + envío HTML anti-spam (v3)
import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';
import getConfig from '../config.js';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/throttle.js';
import { appendSignature, buildHtmlEmail } from '../templates/templates.js';

// ─── Proveedores SMTP ─────────────────────────────────────────────────────────
// Orden de prioridad: Brevo primero (más reputación), luego Resend, SendGrid, Gmail.
// Cada proveedor solo se activa si tiene sus env vars configuradas.

function buildProviders() {
    const cfg = getConfig();

    const providers = [
        {
            name: 'brevo',
            host: cfg.SMTP_HOST,
            port: cfg.SMTP_PORT,
            secure: cfg.SMTP_SECURE,
            auth: { user: cfg.SMTP_USER, pass: cfg.SMTP_PASS },
            fromEmail: cfg.FROM_EMAIL,
            dailyLimit: 280,
        },
    ];

    if (cfg.RESEND_SMTP_PASS) {
        providers.push({
            name: 'resend',
            host: 'smtp.resend.com',
            port: 465,
            secure: true,
            auth: { user: 'resend', pass: cfg.RESEND_SMTP_PASS },
            fromEmail: cfg.RESEND_FROM_EMAIL || cfg.FROM_EMAIL,
            dailyLimit: 90,
        });
    }

    if (cfg.SENDGRID_API_KEY) {
        providers.push({
            name: 'sendgrid',
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: { user: 'apikey', pass: cfg.SENDGRID_API_KEY },
            fromEmail: cfg.SENDGRID_FROM_EMAIL || cfg.FROM_EMAIL,
            dailyLimit: 90,
        });
    }

    if (cfg.GMAIL_USER && cfg.GMAIL_PASS) {
        providers.push({
            name: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user: cfg.GMAIL_USER, pass: cfg.GMAIL_PASS },
            fromEmail: cfg.GMAIL_USER,
            dailyLimit: 190,
        });
    }

    return providers;
}

// Contadores diarios por proveedor — se resetean automáticamente al cambiar de día
const _counts = {};

function getDailyKey(providerName) {
    return `${providerName}_${new Date().toDateString()}`;
}

function getProvider() {
    const providers = buildProviders();
    for (const p of providers) {
        const key = getDailyKey(p.name);
        _counts[key] = _counts[key] || 0;
        if (_counts[key] < p.dailyLimit) {
            return p;
        }
    }
    return null; // todos los proveedores agotados hoy
}

function incrementCount(providerName) {
    const key = getDailyKey(providerName);
    _counts[key] = (_counts[key] || 0) + 1;
}

// ─── Transporters cacheados por proveedor ────────────────────────────────────

const _transporters = {};

function getTransporterForProvider(provider) {
    if (_transporters[provider.name]) return _transporters[provider.name];

    const isGmail = provider.name === 'gmail';

    const transportConfig = {
        host: provider.host,
        port: provider.port,
        secure: provider.secure,
        auth: provider.auth,
        ignoreTLS: false,
        requireTLS: !provider.secure,
        tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
        connectionTimeout: 20000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    };

    // Gmail necesita forzar IPv4 para evitar ETIMEOUT
    if (isGmail) {
        transportConfig.lookup = (hostname, options, callback) => {
            import('dns').then(dns => {
                dns.resolve4(hostname, (err, addresses) => {
                    if (err) return callback(err);
                    callback(null, addresses[0], 4);
                });
            });
        };
    }

    _transporters[provider.name] = nodemailer.createTransport(transportConfig);
    return _transporters[provider.name];
}

// ─── API pública ──────────────────────────────────────────────────────────────

export function getTransporter() {
    const provider = getProvider();
    if (!provider) return null;
    return getTransporterForProvider(provider);
}

export function getSmtpStats() {
    const providers = buildProviders();
    return providers.map(p => ({
        name: p.name,
        used: _counts[getDailyKey(p.name)] || 0,
        limit: p.dailyLimit,
        remaining: p.dailyLimit - (_counts[getDailyKey(p.name)] || 0),
    }));
}

export async function verifySMTP() {
    try {
        const cfg = getConfig();
        const primary = nodemailer.createTransport({
            host: cfg.SMTP_HOST,
            port: cfg.SMTP_PORT,
            secure: cfg.SMTP_SECURE,
            auth: { user: cfg.SMTP_USER, pass: cfg.SMTP_PASS },
        });
        await primary.verify();
        logger.info('✅ Conexión SMTP (Brevo) verificada.');
        return true;
    } catch (error) {
        logger.error(`❌ Error en conexión SMTP: ${error.message}`);
        return false;
    }
}

/**
 * Envía un email con HTML profesional, rotación multi-SMTP, reintentos y cabeceras anti-spam.
 *
 * @param {string}  to
 * @param {string}  subject
 * @param {string}  body          - texto plano (sin firma)
 * @param {Array}   attachments   - adjuntos nodemailer (opcional)
 * @param {object}  opts
 * @param {string}  opts.trackingPixelUrl
 * @param {string}  opts.unsubscribeUrl
 * @param {string}  opts.inReplyTo
 * @param {string}  opts.references
 * @param {string}  opts.ctaLink
 * @returns {Promise<{ success: boolean, messageId: string, provider: string }>}
 */
export async function sendEmail(to, subject, body, attachments = [], opts = {}) {
    const { FROM_NAME, FROM_EMAIL, REPLY_TO, COMPANY_NAME } = getConfig();

    const provider = getProvider();
    if (!provider) {
        logger.error('🚨 Todos los proveedores SMTP agotaron su límite diario.');
        throw new Error('SMTP_DAILY_LIMIT_REACHED');
    }

    const transporter = getTransporterForProvider(provider);
    const finalTextBody = appendSignature(body);
    const messageId = `<${randomUUID()}@${FROM_EMAIL.split('@')[1]}>`;

    const htmlBody = buildHtmlEmail(
        body,
        opts.ctaLink || 'https://wa.me/34633448806',
        opts.trackingPixelUrl || '',
        opts.unsubscribeUrl || ''
    );

    const mailOptions = {
        from: `"${FROM_NAME}" <${provider.fromEmail}>`,
        to,
        subject,
        text: finalTextBody,
        html: htmlBody,
        // Reply-to siempre apunta al email principal independientemente del proveedor
        replyTo: REPLY_TO || FROM_EMAIL,
        attachments,
        messageId,
        headers: {
            'X-Mailer': 'Microsoft Outlook 16.0',
            'X-Priority': '3',
            'List-Unsubscribe': opts.unsubscribeUrl
                ? `<${opts.unsubscribeUrl}>`
                : `<mailto:${FROM_EMAIL}?subject=unsubscribe>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            ...(opts.inReplyTo ? { 'In-Reply-To': opts.inReplyTo } : {}),
            ...(opts.references ? { 'References': opts.references } : {}),
        },
    };

    try {
        await withRetry(async () => {
            await transporter.sendMail(mailOptions);
        }, 2, 5000);

        incrementCount(provider.name);
        logger.info(`📧 Email enviado a: ${to} [${provider.name}] [${messageId}]`);
        return { success: true, messageId, provider: provider.name };

    } catch (error) {
        logger.error(`🚨 Fallo enviando a ${to} via ${provider.name}: ${error.message}`);
        throw error;
    }
}

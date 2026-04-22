// src/email/bounce_handler.js – gestión automática de rebotes por IMAP
import logger from '../utils/logger.js';
import { markBounced } from '../db/index.js';

// Expresiones para detectar emails en mensajes de rebote
const EMAIL_IN_BOUNCE_REGEX = /(?:failed|undelivered|rejected|unknown user)[\s\S]{0,300}?([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
const FINAL_RECIPIENT_REGEX = /Final-Recipient:.*?rfc822;\s*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i;
const ORIGINAL_RECIPIENT_REGEX = /Original-Recipient:.*?rfc822;\s*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i;

/**
 * Extrae el email rebotado de un mensaje de bounce DSN.
 * @param {string} rawMessage - texto completo del email de bounce
 * @returns {string|null}
 */
export function extractBouncedEmail(rawMessage) {
    // 1. Método más preciso: cabeceras DSN estándar
    const finalMatch = FINAL_RECIPIENT_REGEX.exec(rawMessage);
    if (finalMatch) return finalMatch[1].toLowerCase();

    const originalMatch = ORIGINAL_RECIPIENT_REGEX.exec(rawMessage);
    if (originalMatch) return originalMatch[1].toLowerCase();

    // 2. Fallback: buscar el email en el cuerpo del mensaje
    const bodyMatch = EMAIL_IN_BOUNCE_REGEX.exec(rawMessage);
    if (bodyMatch) return bodyMatch[1].toLowerCase();

    return null;
}

/**
 * Procesa una lista de mensajes de bounce y marca los leads en la DB.
 * @param {object} db  - instancia de la base de datos
 * @param {string[]} rawMessages - lista de emails raw (texto completo)
 * @returns {{ processed: number, bounced: number }}
 */
export async function processBounces(db, rawMessages) {
    let processed = 0;
    let bounced = 0;

    for (const raw of rawMessages) {
        processed++;
        const email = extractBouncedEmail(raw);
        if (email) {
            const changes = markBounced(db, email);
            if (changes > 0) {
                bounced++;
                logger.info(`🚫 Bounce registrado: ${email}`);
            }
        }
    }

    logger.info(`📫 Bounces procesados: ${processed} mensajes | ${bounced} rebotes marcados en DB`);
    return { processed, bounced };
}

/**
 * Lee los bounces del buzón IMAP y los registra en la DB.
 * Requiere: imapflow (npm install imapflow)
 * Configuración en .env: IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASS
 */
export async function fetchAndProcessBounces(db) {
    const { IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASS } = process.env;

    if (!IMAP_HOST || !IMAP_USER || !IMAP_PASS) {
        logger.warn('⚠️  IMAP no configurado. Saltando lectura de bounces. (Añade IMAP_HOST/IMAP_USER/IMAP_PASS a .env)');
        return { processed: 0, bounced: 0 };
    }

    let ImapFlow;
    try {
        const mod = await import('imapflow');
        ImapFlow = mod.ImapFlow;
    } catch {
        logger.warn('⚠️  Módulo imapflow no instalado. Ejecuta: npm install imapflow');
        return { processed: 0, bounced: 0 };
    }

    const client = new ImapFlow({
        host: IMAP_HOST,
        port: parseInt(IMAP_PORT || '993', 10),
        secure: true,
        auth: { user: IMAP_USER, pass: IMAP_PASS },
        logger: false,
    });

    const rawMessages = [];

    try {
        await client.connect();
        await client.mailboxOpen('INBOX');

        // Buscar emails no leídos con asunto típico de bounce/NDR
        const searchResult = await client.search({
            unseen: true,
            or: [
                { subject: 'Undelivered Mail' },
                { subject: 'Delivery Status Notification' },
                { subject: 'Mail delivery failed' },
                { subject: 'Mailer-Daemon' },
                { from: 'MAILER-DAEMON' },
                { from: 'postmaster' },
            ]
        });

        logger.info(`📬 ${searchResult.length} emails de bounce encontrados en bandeja de entrada`);

        for await (const msg of client.fetch(searchResult, { source: true })) {
            const raw = msg.source.toString('utf8');
            rawMessages.push(raw);
        }

        await client.logout();
    } catch (err) {
        logger.error(`Error leyendo IMAP: ${err.message}`);
        try { await client.logout(); } catch (_) { }
    }

    return processBounces(db, rawMessages);
}

// src/utils/hunterEnrich.js — Enriquecimiento de emails con Hunter.io
// API gratis: 25 búsquedas/mes. Pago: 49$/mes → 500 búsquedas.
// Requiere: HUNTER_API_KEY en .env
// Úsalo solo para dominios donde no se encontró email personal.

import logger from './logger.js';
import { sleep } from './throttle.js';

const HUNTER_BASE = 'https://api.hunter.io/v2';

/**
 * Busca emails para un dominio via Hunter.io.
 * @param {string} domain   - Dominio (sin http://, sin www)
 * @param {string} [apiKey] - Key de Hunter (por defecto lee HUNTER_API_KEY)
 * @returns {Promise<{ email: string|null, confidence: number, pattern: string|null, rateLimited?: boolean }>}
 */
export async function enrichDomainWithHunter(domain, apiKey = null) {
    const key = apiKey || process.env.HUNTER_API_KEY;
    if (!key) {
        logger.debug('Hunter.io: HUNTER_API_KEY no configurada');
        return { email: null, confidence: 0, pattern: null };
    }

    const cleanDomain = domain
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
        .toLowerCase()
        .trim();

    if (!cleanDomain || cleanDomain.length < 4) {
        return { email: null, confidence: 0, pattern: null };
    }

    try {
        const url = `${HUNTER_BASE}/domain-search?domain=${encodeURIComponent(cleanDomain)}&api_key=${key}&limit=10`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

        if (res.status === 429) {
            logger.warn('Hunter.io: rate limit — 25/mes en plan gratis');
            return { email: null, confidence: 0, pattern: null, rateLimited: true };
        }
        if (!res.ok) {
            logger.warn(`Hunter.io HTTP ${res.status} para ${cleanDomain}`);
            return { email: null, confidence: 0, pattern: null };
        }

        const json = await res.json();
        const data = json.data || {};
        const emails = data.emails || [];
        const pattern = data.pattern || null;

        // Preferir email personal con mayor confidence
        const personal = emails
            .filter(e => e.type === 'personal' && e.confidence >= 50)
            .sort((a, b) => b.confidence - a.confidence);

        const best = personal[0] || emails.sort((a, b) => b.confidence - a.confidence)[0] || null;

        if (best) {
            logger.info(`Hunter.io: ${best.value} (${best.confidence}% confianza) para ${cleanDomain}`);
            return { email: best.value, confidence: best.confidence, pattern };
        }

        return { email: null, confidence: 0, pattern };

    } catch (err) {
        logger.warn(`Hunter.io error para ${cleanDomain}: ${err.message}`);
        return { email: null, confidence: 0, pattern: null };
    }
}

/**
 * Enriquece un array de leads con Hunter.io.
 * Solo procesa leads con website pero sin email personal.
 * Respeta el rate limit (1 req/seg).
 *
 * @param {object[]} leads
 * @param {object} options
 * @param {number} options.maxEnrich - Máx leads a procesar (plan gratis: 25/mes)
 * @returns {Promise<object[]>}
 */
export async function enrichLeadsWithHunter(leads, { maxEnrich = 20 } = {}) {
    const apiKey = process.env.HUNTER_API_KEY;
    if (!apiKey) {
        logger.info('Hunter.io: HUNTER_API_KEY no configurada — sin enriquecimiento');
        return leads;
    }

    const GENERIC_PREFIXES = ['info@', 'contacto@', 'hola@', 'contact@', 'hello@', 'admin@', 'soporte@'];
    const enriched = [...leads];
    let count = 0;

    for (const lead of enriched) {
        if (count >= maxEnrich) break;

        const hasGeneric = lead.email && GENERIC_PREFIXES.some(p => lead.email.startsWith(p));
        const noEmail = !lead.email;
        if (!noEmail && !hasGeneric) continue;
        if (!lead.website) continue;

        const domain = lead.website
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0];
        if (!domain) continue;

        const result = await enrichDomainWithHunter(domain, apiKey);
        if (result.rateLimited) {
            logger.warn('Hunter.io: rate limit alcanzado, deteniendo enriquecimiento');
            break;
        }

        if (result.email) {
            lead.email = result.email;
            lead.hunterConfidence = result.confidence;
        }

        count++;
        await sleep(1100); // ~1 req/seg
    }

    logger.info(`Hunter.io: ${count} dominios procesados`);
    return enriched;
}

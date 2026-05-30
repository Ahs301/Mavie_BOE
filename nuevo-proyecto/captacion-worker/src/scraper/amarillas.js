// src/scraper/amarillas.js — Páginas Amarillas scraper v1
// Usa fetch nativo (Node 20+) + cheerio para parsing HTML.
// Sin Puppeteer: más rápido, menos recursos, sin captchas de Google Maps.
// Requiere: npm install cheerio

import logger from '../utils/logger.js';
import { sleep } from '../utils/throttle.js';
import { fetchEmailFromWebsite } from '../utils/scraper.js';

const BASE_URL = 'https://www.paginasamarillas.es';
const REQUEST_DELAY_MS = 2000; // pausa entre peticiones para no ser bloqueado
const MAX_PAGES = 8;           // ~25 resultados/página → ~200 max por búsqueda

const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xhtml+xml,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
};

// ─── HTTP helper ──────────────────────────────────────────────────────────────
async function fetchHtml(url) {
    try {
        const res = await fetch(url, { headers: FETCH_HEADERS, signal: AbortSignal.timeout(15000) });
        if (!res.ok) {
            logger.warn(`Amarillas HTTP ${res.status} → ${url}`);
            return null;
        }
        return res.text();
    } catch (err) {
        logger.warn(`Amarillas fetch error: ${err.message} → ${url}`);
        return null;
    }
}

// ─── URL builder ─────────────────────────────────────────────────────────────
function buildUrl(query, location, page = 1) {
    // PA acepta query y location en la URL como segmentos slug
    const q   = encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'));
    const loc = encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'));
    const pg  = page > 1 ? `?pg=${page}` : '';
    // Formato: /search/{query}/{location}/
    return `${BASE_URL}/search/${q}/${loc}/${pg}`;
}

// ─── Parser HTML ──────────────────────────────────────────────────────────────
async function parseListings(html) {
    // Import dinámico de cheerio para no fallar si no está instalado
    let load;
    try {
        const mod = await import('cheerio');
        load = mod.load;
    } catch {
        logger.error('⚠️  cheerio no instalado. Ejecuta: npm install cheerio');
        return [];
    }

    const $ = load(html);
    const results = [];

    // PA usa artículos .listitem o .listing como contenedor de cada empresa
    const containers = $('article.listitem, article.listing, .listing-item, [class*="list-item"]');

    if (containers.length === 0) {
        // Fallback: buscar cualquier artículo con h2 dentro
        $('article').each((_, el) => {
            const $el = $(el);
            const name = $el.find('h2, h3').first().text().trim();
            if (name.length > 2) {
                results.push(extractFromElement($el, $, name));
            }
        });
    } else {
        containers.each((_, el) => {
            const $el = $(el);
            // Nombre — varias alternativas de selectores
            const name = (
                $el.find('.title-h2 a, h2 a, h3 a, [class*="name"] a, [class*="title"] a').first().text() ||
                $el.find('.title-h2, h2, h3, [class*="name"], [class*="title"]').first().text()
            ).trim();

            if (!name || name.length < 2) return;
            results.push(extractFromElement($el, $, name));
        });
    }

    return results;
}

function extractFromElement($el, $, name) {
    // Teléfono
    const phoneRaw = (
        $el.find('.phone-row a, [class*="phone"] a, [itemprop="telephone"], a[href^="tel:"]').first().text() ||
        $el.find('[class*="phone"]').first().text()
    ).trim();
    const phone = phoneRaw.replace(/[^\d+\s]/g, '').replace(/\s+/g, ' ').trim();

    // Dirección
    const address = (
        $el.find('.address-element, [class*="address"], [itemprop="address"], [class*="location"]').first().text() ||
        $el.find('[class*="street"], [class*="city"]').first().text()
    ).replace(/\s+/g, ' ').trim();

    // Categoría
    const category = (
        $el.find('.category, [class*="categor"], [class*="sector"], .label').first().text()
    ).replace(/\s+/g, ' ').trim();

    // Website — buscar link externo (no PA ni Google)
    let website = '';
    $el.find('a[href^="http"]').each((_, a) => {
        const href = $(a).attr('href') || '';
        const skipDomains = ['paginasamarillas', 'google', 'facebook', 'instagram', 'twitter', 'bing'];
        if (!skipDomains.some(d => href.includes(d)) && !website) {
            website = href;
        }
    });

    // Fallback: link de tipo /web/ que PA usa para redirecciones
    if (!website) {
        const redirectHref = $el.find('a[href*="/web/"]').first().attr('href');
        if (redirectHref) website = redirectHref.startsWith('http') ? redirectHref : `${BASE_URL}${redirectHref}`;
    }

    return { name, phone, website, address, category, email: '', source: 'amarillas' };
}

function hasMorePages(html) {
    // PA muestra "Siguiente" o un link rel="next"
    return html.includes('rel="next"') ||
           html.includes('siguiente') ||
           html.includes('class="next"') ||
           /pg=\d+/.test(html);
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Scrapea Páginas Amarillas para un nicho y localización.
 *
 * @param {string} query     - Búsqueda (ej. "asesoría")
 * @param {string} location  - Ciudad o provincia (ej. "Madrid")
 * @param {number} maxLeads  - Límite máximo de resultados con email
 * @returns {Promise<{ leads: object[], reviewLeads: object[] }>}
 */
export async function scrapeAmarillas(query, location, maxLeads = 200) {
    logger.info(`🟡 Páginas Amarillas: "${query}" en "${location}"`);

    const rawLeads = [];
    const seen = new Set();

    for (let page = 1; page <= MAX_PAGES; page++) {
        const url = buildUrl(query, location, page);
        logger.info(`  ↳ Página ${page}: ${url}`);

        const html = await fetchHtml(url);
        if (!html) break;

        const listings = await parseListings(html);

        if (listings.length === 0) {
            logger.info(`  ↳ Página ${page}: 0 resultados — fin de paginación`);
            break;
        }

        let added = 0;
        for (const lead of listings) {
            const key = `${lead.name.toLowerCase()}|${lead.phone}`;
            if (!seen.has(key)) {
                seen.add(key);
                rawLeads.push({ ...lead, sourceQuery: `${query} en ${location}` });
                added++;
            }
        }

        logger.info(`  ↳ +${added} nuevos | Total: ${rawLeads.length}`);

        if (!hasMorePages(html)) break;
        await sleep(REQUEST_DELAY_MS + Math.random() * 1000);
    }

    if (rawLeads.length === 0) {
        logger.warn(`Amarillas: sin resultados para "${query}" en "${location}". Los selectores pueden haber cambiado.`);
        return { leads: [], reviewLeads: [] };
    }

    // ─── Extracción de emails ─────────────────────────────────────────────────
    logger.info(`📧 Buscando emails en ${rawLeads.length} empresas...`);
    const leadsWithEmail  = [];
    const leadsToReview   = [];

    for (const lead of rawLeads) {
        if (leadsWithEmail.length >= maxLeads) {
            leadsToReview.push(lead);
            continue;
        }

        if (lead.website && !lead.website.includes('paginasamarillas')) {
            const result = await fetchEmailFromWebsite(lead.website);
            if (result?.email) {
                lead.email = result.email;
                leadsWithEmail.push(lead);
            } else {
                leadsToReview.push(lead);
            }
        } else {
            leadsToReview.push(lead);
        }
        await sleep(300);
    }

    logger.info(`✅ Amarillas: 🟢 ${leadsWithEmail.length} con email | 🟡 ${leadsToReview.length} sin email`);
    return { leads: leadsWithEmail, reviewLeads: leadsToReview };
}

/**
 * Scrape Amarillas con múltiples variantes de búsqueda.
 * Igual que scrapeGoogleMapsMultiQuery pero usando PA.
 */
export async function scrapeAmarillasMultiQuery(keyword, location, maxLeads = 200) {
    // Variantes básicas para aumentar cobertura
    const variants = [
        keyword,
        `${keyword} empresa`,
        `${keyword} despacho`,
        `${keyword} consultora`,
    ].filter((v, i, arr) => arr.indexOf(v) === i); // dedup

    const allLeads    = [];
    const allReviews  = [];
    const globalSeen  = new Set();

    for (const variant of variants) {
        const { leads, reviewLeads } = await scrapeAmarillas(variant, location, maxLeads);

        for (const l of leads) {
            const key = l.email || `${l.name.toLowerCase()}|${l.phone}`;
            if (!globalSeen.has(key)) {
                globalSeen.add(key);
                allLeads.push(l);
            }
        }
        for (const l of reviewLeads) {
            const key = `${l.name.toLowerCase()}|${l.phone}`;
            if (!globalSeen.has(key)) {
                globalSeen.add(key);
                allReviews.push(l);
            }
        }

        if (allLeads.length >= maxLeads) break;
        await sleep(2000);
    }

    return { leads: allLeads, reviewLeads: allReviews };
}

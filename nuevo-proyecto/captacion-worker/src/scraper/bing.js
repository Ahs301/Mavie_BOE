// src/scraper/bing.js — Bing Maps Local Business Search
// API oficial Microsoft: 125.000 peticiones/mes gratis.
// Sin Puppeteer, sin captchas. Más estable que Google Maps.
// Requiere: BING_MAPS_KEY en .env
// Registro gratuito: https://www.bingmapsportal.com/

import logger from '../utils/logger.js';
import { sleep } from '../utils/throttle.js';
import { fetchEmailFromWebsite } from '../utils/scraper.js';

const BING_LOCAL_SEARCH = 'https://dev.virtualearth.net/REST/v1/LocalSearch/';
const REQUEST_DELAY_MS = 800;

// Coords de ciudades principales de España
const CITY_COORDS = {
    madrid: '40.4168,-3.7038',
    barcelona: '41.3851,2.1734',
    valencia: '39.4699,-0.3763',
    sevilla: '37.3891,-5.9845',
    bilbao: '43.2630,-2.9350',
    zaragoza: '41.6488,-0.8891',
    malaga: '36.7213,-4.4216',
    murcia: '37.9922,-1.1307',
    palma: '39.5696,2.6502',
    alicante: '38.3452,-0.4815',
    cordoba: '37.8882,-4.7794',
    valladolid: '41.6523,-4.7245',
    vigo: '42.2406,-8.7207',
    gijon: '43.5453,-5.6619',
    granada: '37.1773,-3.5986',
    burgos: '42.3439,-3.6970',
    santander: '43.4623,-3.8099',
    castellon: '39.9864,-0.0513',
    pamplona: '42.8188,-1.6436',
    logrono: '42.4650,-2.4489',
    tarragona: '41.1189,1.2445',
    lleida: '41.6176,0.6200',
    girona: '41.9794,2.8214',
    salamanca: '40.9701,-5.6635',
    cadiz: '36.5271,-6.2886',
    huelva: '37.2614,-6.9447',
    badajoz: '38.8794,-6.9706',
    albacete: '38.9942,-1.8564',
    cuenca: '40.0704,-2.1374',
    default: '40.4168,-3.7038',
};

function getCityCoords(location) {
    const normalized = location.toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z\s]/g, '')
        .trim();

    for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (normalized.includes(city) || city.includes(normalized)) {
            return coords;
        }
    }
    return CITY_COORDS.default;
}

// ─── Petición a Bing Local Search ─────────────────────────────────────────────
async function queryBingLocal(query, userLocation, maxResults, apiKey) {
    const url = new URL(BING_LOCAL_SEARCH);
    url.searchParams.set('query', query);
    url.searchParams.set('userLocation', userLocation);
    url.searchParams.set('maxResults', Math.min(maxResults, 25).toString());
    url.searchParams.set('key', apiKey);
    url.searchParams.set('culture', 'es-ES');
    url.searchParams.set('output', 'json');

    try {
        const res = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(15000),
        });

        if (res.status === 401) {
            logger.error('Bing Maps: API key inválida (401)');
            return [];
        }
        if (!res.ok) {
            logger.warn(`Bing Maps HTTP ${res.status} para "${query}"`);
            return [];
        }

        const json = await res.json();
        return json.resourceSets?.[0]?.resources || [];
    } catch (err) {
        logger.warn(`Bing Maps error: ${err.message}`);
        return [];
    }
}

function mapResource(resource) {
    const addr = resource.Address || {};
    return {
        name: (resource.name || resource.entityName || '').trim(),
        phone: (resource.PhoneNumber || '').replace(/[^\d+\s]/g, '').trim(),
        website: resource.Website || '',
        address: [addr.addressLine, addr.locality, addr.adminDistrict].filter(Boolean).join(', '),
        city: addr.locality || addr.adminDistrict || '',
        category: (resource.type || resource.entityType || '').replace(/_/g, ' '),
        email: '',
        source: 'bing',
    };
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Scrapea Bing Maps Local Search para un nicho y localización.
 * Complementa Google Maps con resultados distintos (sin captchas).
 *
 * @param {string} query    - Búsqueda (ej. "asesoría contable")
 * @param {string} location - Ciudad (ej. "Madrid")
 * @param {number} maxLeads - Máximo leads con email
 * @returns {Promise<{ leads: object[], reviewLeads: object[] }>}
 */
export async function scrapeBing(query, location, maxLeads = 100) {
    const apiKey = process.env.BING_MAPS_KEY;
    if (!apiKey) {
        logger.warn('Bing Maps: BING_MAPS_KEY no configurada en .env — saltar');
        return { leads: [], reviewLeads: [] };
    }

    logger.info(`🔵 Bing Maps: "${query}" en "${location}"`);
    const userLocation = getCityCoords(location);
    const rawLeads = [];
    const seen = new Set();

    // Bing devuelve máx 25 por petición → múltiples variantes
    const variants = [
        query,
        `${query} ${location}`,
        `${query} empresa`,
    ];

    for (const variant of variants) {
        const resources = await queryBingLocal(variant, userLocation, 25, apiKey);
        logger.info(`  Bing: "${variant}" → ${resources.length} resultados`);

        for (const r of resources) {
            const lead = mapResource(r);
            if (!lead.name || lead.name.length < 2) continue;

            const key = `${lead.name.toLowerCase()}|${lead.phone}`;
            if (!seen.has(key)) {
                seen.add(key);
                rawLeads.push({ ...lead, sourceQuery: `${query} en ${location}` });
            }
        }

        await sleep(REQUEST_DELAY_MS);
    }

    logger.info(`Bing: ${rawLeads.length} negocios únicos. Extrayendo emails...`);

    const leadsWithEmail = [];
    const leadsToReview = [];

    for (const lead of rawLeads) {
        if (leadsWithEmail.length >= maxLeads) {
            leadsToReview.push(lead);
            continue;
        }
        if (lead.website) {
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

    logger.info(`✅ Bing: 🟢 ${leadsWithEmail.length} con email | 🟡 ${leadsToReview.length} sin email`);
    return { leads: leadsWithEmail, reviewLeads: leadsToReview };
}

/**
 * Scrapea Bing con múltiples variantes de keyword. Misma interfaz que scrapeGoogleMapsMultiQuery.
 */
export async function scrapeBingMultiQuery(keyword, location, maxLeads = 150) {
    const variants = [keyword, `${keyword} empresa`, `${keyword} consultora`]
        .filter((v, i, a) => a.indexOf(v) === i);

    const allLeads = [];
    const allReviews = [];
    const globalSeen = new Set();

    for (const variant of variants) {
        const { leads, reviewLeads } = await scrapeBing(variant, location, maxLeads);

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
        await sleep(1000);
    }

    return { leads: allLeads, reviewLeads: allReviews };
}

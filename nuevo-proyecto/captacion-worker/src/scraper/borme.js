// src/scraper/borme.js — BORME (Registro Mercantil) scraper
// API pública y gratuita: https://www.boe.es/datosabiertos/api/borme
// Sin Puppeteer, sin auth. Devuelve empresas nuevas + nombre del administrador.
// Máximo impacto: contacto directo al decisor real, no a info@.

import logger from '../utils/logger.js';
import { sleep } from '../utils/throttle.js';

const BORME_API = 'https://www.boe.es/datosabiertos/api/borme';
const REQUEST_DELAY_MS = 1000;

const HEADERS = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (compatible; captacion-worker/2.0)',
};

// Tipos de acto que generan leads útiles
const TIPOS_INTERES = new Set([
    'Constitución',
    'Nombramiento',
    'Cambio de objeto social',
    'Modificaciones estatutarias',
    'Fusión',
    'Escisión',
]);

// Roles de decisor (primer match gana)
const ROLES_DECISION = [
    'Administrador único',
    'Administrador solidario',
    'Administrador mancomunado',
    'Consejero delegado',
    'Gerente',
    'Director general',
    'Presidente',
    'Socio',
    'Apoderado',
];

async function fetchJson(url) {
    try {
        const res = await fetch(url, {
            headers: HEADERS,
            signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) {
            logger.warn(`BORME HTTP ${res.status} → ${url}`);
            return null;
        }
        return res.json();
    } catch (err) {
        logger.warn(`BORME fetch error: ${err.message}`);
        return null;
    }
}

// ─── Sumario diario ───────────────────────────────────────────────────────────
async function fetchDailySummary(dateStr) {
    const url = `${BORME_API}/sumario/${dateStr}`;
    logger.info(`BORME: sumario ${dateStr}...`);
    const json = await fetchJson(url);
    if (!json?.data?.sumario) {
        logger.warn(`BORME: sin datos para ${dateStr}`);
        return [];
    }

    const diario = json.data.sumario.diario;
    if (!diario) return [];

    const secciones = Array.isArray(diario.seccion) ? diario.seccion : [diario.seccion].filter(Boolean);
    const actoIds = [];

    for (const seccion of secciones) {
        const anuncios = Array.isArray(seccion?.anuncio)
            ? seccion.anuncio
            : (seccion?.anuncio ? [seccion.anuncio] : []);
        for (const a of anuncios) {
            if (a?.id) actoIds.push(a.id);
        }
    }

    logger.info(`BORME: ${actoIds.length} actos en ${dateStr}`);
    return actoIds;
}

// ─── Detalle de un acto ───────────────────────────────────────────────────────
async function fetchActo(id) {
    const json = await fetchJson(`${BORME_API}/acto/${id}`);
    return json?.data?.acto ?? null;
}

// ─── Extraer lead de un acto ──────────────────────────────────────────────────
function extractLead(acto) {
    if (!acto) return null;

    const tipo = acto.tipoActo || acto.tipo || '';
    if (!TIPOS_INTERES.has(tipo)) return null;

    const name = (acto.denominacion || acto.razonSocial || '').trim();
    if (!name) return null;

    // Buscar decisor entre cargos
    let contactName = null;
    let contactTitle = null;
    const rawCargos = acto.cargos?.cargo;
    const cargos = Array.isArray(rawCargos) ? rawCargos : (rawCargos ? [rawCargos] : []);

    for (const roleKey of ROLES_DECISION) {
        const match = cargos.find(c => (c.tipoCargo || '').toLowerCase().includes(roleKey.toLowerCase()));
        if (match) {
            contactName = match.nombre || null;
            contactTitle = match.tipoCargo || roleKey;
            break;
        }
    }
    // Fallback: primer cargo disponible
    if (!contactName && cargos.length > 0) {
        contactName = cargos[0].nombre || null;
        contactTitle = cargos[0].tipoCargo || null;
    }

    const dom = acto.domicilio || {};
    const city = dom.municipio || dom.provincia || null;
    const address = [dom.calle, dom.municipio, dom.provincia].filter(Boolean).join(', ');

    return {
        name,
        email: '',
        phone: '',
        website: '',
        address,
        city,
        category: tipo,
        description: `BORME: ${tipo}${acto.nif ? ` — NIF: ${acto.nif}` : ''}`,
        contact_name: contactName,
        contact_title: contactTitle,
        nif: acto.nif || null,
        source: 'borme',
        sourceQuery: `BORME ${new Date().toISOString().slice(0, 10)}`,
    };
}

// ─── Búsqueda por texto en BORME ──────────────────────────────────────────────
// Alternativa: búsqueda web del BORME por texto (sin API oficial de búsqueda)
async function searchBormeByText(query, maxResults = 50) {
    // El buscador oficial BORME devuelve HTML — parseamos los IDs de actos
    const url = `https://www.boe.es/buscar/borme.php?texto=${encodeURIComponent(query)}&seccion=&departamento=&submit=Buscar`;
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'text/html',
            },
            signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return [];
        const html = await res.text();

        // Extraer IDs de actos del HTML (patrón: BORME-A-YYYY-NNN-NNNNN)
        const matches = html.match(/BORME-[A-Z]-\d{4}-\d+-\d+/g) || [];
        const unique = [...new Set(matches)].slice(0, maxResults);
        logger.info(`BORME búsqueda "${query}": ${unique.length} actos encontrados`);
        return unique;
    } catch (err) {
        logger.warn(`BORME búsqueda error: ${err.message}`);
        return [];
    }
}

// ─── Función principal (por fecha) ───────────────────────────────────────────

/**
 * Scrapea nuevas empresas del BORME en los últimos N días hábiles.
 * Ideal para encontrar empresas recién constituidas: decision-makers con tiempo libre.
 *
 * @param {object} options
 * @param {number} options.days         - Días hábiles atrás a mirar (0 = hoy)
 * @param {number} options.maxLeads     - Máximo de leads a devolver
 * @param {string} options.filterText   - Filtrar por texto en nombre/categoría (opcional)
 * @returns {Promise<object[]>}
 */
export async function scrapeBorme({ days = 0, maxLeads = 200, filterText = '' } = {}) {
    logger.info(`📋 BORME: scrapeando ${days + 1} días (máx ${maxLeads} empresas)...`);

    const results = [];
    const seen = new Set();

    for (let offset = 0; offset <= days; offset++) {
        if (results.length >= maxLeads) break;

        const date = new Date();
        date.setDate(date.getDate() - offset);
        const dow = date.getDay();
        if (dow === 0 || dow === 6) continue; // sin fines de semana

        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const actoIds = await fetchDailySummary(dateStr);

        for (const id of actoIds) {
            if (results.length >= maxLeads) break;
            await sleep(REQUEST_DELAY_MS);

            const acto = await fetchActo(id);
            const lead = extractLead(acto);
            if (!lead) continue;

            if (filterText) {
                const lower = filterText.toLowerCase();
                const haystack = `${lead.name} ${lead.category} ${lead.description}`.toLowerCase();
                if (!haystack.includes(lower)) continue;
            }

            const key = lead.name.toLowerCase().trim();
            if (seen.has(key)) continue;
            seen.add(key);

            results.push(lead);
            const quien = lead.contact_name ? ` → ${lead.contact_name} (${lead.contact_title})` : '';
            logger.info(`BORME: +1 ${lead.name}${quien}`);
        }

        if (results.length < maxLeads && offset < days) await sleep(2000);
    }

    logger.info(`✅ BORME: ${results.length} empresas`);
    return results;
}

/**
 * Busca en BORME por texto (nombre de empresa, sector, tipo).
 * Útil para encontrar empresas de un nicho concreto.
 *
 * @param {string} query   - Término de búsqueda
 * @param {number} maxLeads
 * @returns {Promise<object[]>}
 */
export async function scrapeBormeByQuery(query, maxLeads = 100) {
    logger.info(`📋 BORME búsqueda: "${query}"...`);

    const actoIds = await searchBormeByText(query, maxLeads * 2);
    const results = [];
    const seen = new Set();

    for (const id of actoIds) {
        if (results.length >= maxLeads) break;
        await sleep(REQUEST_DELAY_MS);

        const acto = await fetchActo(id);
        const lead = extractLead(acto);
        if (!lead) continue;

        const key = lead.name.toLowerCase().trim();
        if (seen.has(key)) continue;
        seen.add(key);

        results.push(lead);
        const quien = lead.contact_name ? ` → ${lead.contact_name}` : '';
        logger.info(`BORME: +1 ${lead.name}${quien}`);
    }

    logger.info(`✅ BORME búsqueda "${query}": ${results.length} empresas`);
    return results;
}

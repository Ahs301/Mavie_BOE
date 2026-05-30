// src/scraper/bdns.js — BDNS (Base Datos Nacional Subvenciones)
// API pública: https://www.infosubvenciones.es/bdnstrans/api
// Sin auth, JSON REST. Leads CALIENTES: empresas que ya gestionan subvenciones.
// Cruza con BORME para obtener NIF → decisor real.

import logger from '../utils/logger.js';
import { sleep } from '../utils/throttle.js';

const BDNS_API = 'https://www.infosubvenciones.es/bdnstrans/api';
const REQUEST_DELAY_MS = 1000;
const MAX_PAGES = 5;
const PAGE_SIZE = 25;

const HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (compatible; captacion-worker/2.0)',
};

async function fetchJson(url) {
    try {
        const res = await fetch(url, {
            headers: HEADERS,
            signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) {
            logger.warn(`BDNS HTTP ${res.status} → ${url}`);
            return null;
        }
        return res.json();
    } catch (err) {
        logger.warn(`BDNS fetch error: ${err.message}`);
        return null;
    }
}

// ─── Buscar convocatorias ─────────────────────────────────────────────────────
async function searchConvocatorias(query, page = 1) {
    const url = `${BDNS_API}/GE/es/convocatorias/busqueda?texto=${encodeURIComponent(query)}&pagina=${page}&rows=${PAGE_SIZE}`;
    return fetchJson(url);
}

// ─── Buscar beneficiarios ─────────────────────────────────────────────────────
async function searchBeneficiarios(query, page = 1) {
    const url = `${BDNS_API}/GE/es/beneficiarios/busqueda?texto=${encodeURIComponent(query)}&pagina=${page}&rows=${PAGE_SIZE}`;
    return fetchJson(url);
}

// ─── Extraer lead de un item BDNS ─────────────────────────────────────────────
function extractLead(item, query) {
    const name = (
        item.nombreBeneficiario || item.entidadConvocante ||
        item.denominacion || item.nombre || item.razonSocial || ''
    ).trim();

    if (!name || name.length < 2) return null;

    // Filtrar entidades públicas (administraciones, ministerios, etc.)
    const publicKeywords = ['ayuntamiento', 'diputación', 'ministerio', 'consejería', 'junta de', 'generalitat', 'xunta'];
    if (publicKeywords.some(k => name.toLowerCase().includes(k))) return null;

    return {
        name,
        email: '',
        phone: '',
        website: '',
        address: item.localidad || item.municipio || '',
        city: item.provincia || item.localidad || '',
        category: item.sector || item.nombreConvocatoria || 'Subvenciones/BDNS',
        description: [
            item.codigoBDNS || item.id ? `BDNS ${item.codigoBDNS || item.id}` : null,
            item.objeto || item.nombreConvocatoria || null,
        ].filter(Boolean).join(' — ') || `BDNS: ${query}`,
        nif: item.nifBeneficiario || item.nif || null,
        source: 'bdns',
        sourceQuery: `BDNS: ${query}`,
    };
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Busca empresas en BDNS por sector/nicho.
 * Devuelve leads CALIENTES: ya conocen y gestionan subvenciones.
 *
 * @param {string} query   - Término (ej. "asesoría", "consultora digitalización")
 * @param {object} options
 * @param {number} options.maxLeads - Máximo leads
 * @param {'beneficiarios'|'convocatorias'|'both'} options.mode - Fuente a usar
 * @returns {Promise<object[]>}
 */
export async function scrapeBdns(query, { maxLeads = 100, mode = 'beneficiarios' } = {}) {
    logger.info(`📋 BDNS: buscando "${query}" (modo: ${mode}, máx ${maxLeads})...`);

    const leads = [];
    const seen = new Set();
    const modes = mode === 'both' ? ['beneficiarios', 'convocatorias'] : [mode];

    for (const m of modes) {
        if (leads.length >= maxLeads) break;

        for (let page = 1; page <= MAX_PAGES; page++) {
            if (leads.length >= maxLeads) break;

            const searchFn = m === 'beneficiarios' ? searchBeneficiarios : searchConvocatorias;
            const data = await searchFn(query, page);
            if (!data) break;

            // BDNS puede devolver varias estructuras según endpoint
            const items = data.content || data.results || data.data || data.items
                || (Array.isArray(data) ? data : []);

            if (!items || items.length === 0) {
                logger.info(`BDNS: sin más resultados en página ${page}`);
                break;
            }

            for (const item of items) {
                if (leads.length >= maxLeads) break;

                const lead = extractLead(item, query);
                if (!lead) continue;

                const key = lead.name.toLowerCase().trim();
                if (seen.has(key)) continue;
                seen.add(key);

                leads.push(lead);
                logger.info(`BDNS: +1 ${lead.name} (${lead.city || 'N/A'})`);
            }

            const totalPages = data.totalPages || data.totalPaginas
                || Math.ceil((data.total || data.totalElements || 0) / PAGE_SIZE);
            if (page >= totalPages) break;

            await sleep(REQUEST_DELAY_MS);
        }
    }

    logger.info(`✅ BDNS: ${leads.length} empresas para "${query}"`);
    return leads;
}

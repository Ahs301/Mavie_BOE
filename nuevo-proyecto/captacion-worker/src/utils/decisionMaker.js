// src/utils/decisionMaker.js — Extrae decisores desde webs corporativas
// Sin API ni dependencias externas. Solo fetch + regex.
// Busca en páginas "quiénes somos", "equipo", "sobre nosotros".
// También extrae meta description para enriquecer el contexto de la IA.

import logger from './logger.js';
import { sleep } from './throttle.js';

// Rutas donde suele estar el equipo directivo
const TEAM_PATHS = [
    '/quienes-somos', '/quien-somos', '/nosotros', '/sobre-nosotros',
    '/equipo', '/team', '/about', '/about-us', '/aboutus',
    '/empresa', '/la-empresa', '/the-team', '/direccion',
    '/management', '/management-team', '/nuestra-empresa',
];

// Patrones regex para nombre + cargo (orden: más específico primero)
const NAME_PATTERNS = [
    // "Josep Cervera, CEO"  |  "Josep Cervera — Director General"
    /([A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+(?:\s+[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+){1,3})\s*[,\-–—:]\s*(CEO|CTO|CFO|COO|Director\s*General|Directora\s*General|Gerente|Fundador[a]?|Co-?fundador[a]?|Presidente[a]?|Socio\s*Director[a]?|Managing\s*Partner|Managing\s*Director)/gi,
    // "CEO: Josep Cervera"  |  "Gerente — Maria Lopez"
    /(CEO|CTO|CFO|COO|Director\s*General|Directora\s*General|Gerente|Fundador[a]?|Presidente[a]?|Socio\s*Director[a]?)\s*[:\-–—]\s*([A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+(?:\s+[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+){1,3})/gi,
];

const TITLE_KEYWORDS = ['CEO', 'CTO', 'CFO', 'COO', 'Director', 'Directora', 'Gerente', 'Fundador', 'Fundadora', 'Presidente', 'Presidenta', 'Socio', 'Managing'];

async function fetchPage(url, timeoutMs = 8000) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html',
            },
            signal: AbortSignal.timeout(timeoutMs),
        });
        if (!res.ok) return null;
        return res.text();
    } catch {
        return null;
    }
}

function stripHtml(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function extractMetaDescription(html) {
    const match = (
        html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{10,300})["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']{10,300})["'][^>]+name=["']description["']/i)
    );
    return match ? match[1].replace(/\s+/g, ' ').trim() : null;
}

function extractNamesFromText(text) {
    const found = [];
    const seen = new Set();

    for (const pattern of NAME_PATTERNS) {
        let match;
        pattern.lastIndex = 0;
        while ((match = pattern.exec(text)) !== null) {
            const g1 = (match[1] || '').trim();
            const g2 = (match[2] || '').trim();

            let name, title;
            // Determinar cuál grupo es el cargo y cuál el nombre
            if (TITLE_KEYWORDS.some(t => g1.toLowerCase().startsWith(t.toLowerCase()))) {
                title = g1;
                name = g2;
            } else {
                name = g1;
                title = g2;
            }

            // Validar: nombre mínimo 2 palabras, sin números, longitud razonable
            if (!name || name.length < 5 || name.length > 60) continue;
            if (/\d/.test(name)) continue;
            if (seen.has(name.toLowerCase())) continue;
            seen.add(name.toLowerCase());

            found.push({ name, title: title || 'Directivo' });
        }
    }

    return found;
}

/**
 * Busca el decisor principal en la web de una empresa.
 * También extrae meta description para enriquecer el openingLine de la IA.
 *
 * @param {string} websiteUrl - URL base de la empresa (ej. "https://empresa.es")
 * @returns {Promise<{ name: string|null, title: string|null, description: string|null }>}
 */
export async function findDecisionMaker(websiteUrl) {
    if (!websiteUrl) return { name: null, title: null, description: null };

    const base = websiteUrl.replace(/\/$/, '');
    let description = null;

    // 1. Extraer meta description de la homepage
    try {
        const homeHtml = await fetchPage(base, 8000);
        if (homeHtml) {
            description = extractMetaDescription(homeHtml);
            // Intentar también en la homepage por si tiene info del equipo
            const text = stripHtml(homeHtml);
            const found = extractNamesFromText(text);
            if (found.length > 0) {
                logger.debug(`DecisionMaker: ${found[0].name} (${found[0].title}) en homepage ${base}`);
                return { name: found[0].name, title: found[0].title, description };
            }
        }
    } catch {}

    // 2. Buscar en páginas de equipo
    for (const teamPath of TEAM_PATHS) {
        const url = `${base}${teamPath}`;
        const html = await fetchPage(url, 8000);
        if (!html) continue;

        const text = stripHtml(html);
        const found = extractNamesFromText(text);

        if (found.length > 0) {
            logger.debug(`DecisionMaker: ${found[0].name} (${found[0].title}) en ${url}`);
            return { name: found[0].name, title: found[0].title, description };
        }

        await sleep(500);
    }

    return { name: null, title: null, description };
}

/**
 * Enriquece un array de leads buscando el decisor en su web.
 * Solo procesa leads con website. Respeta rate limits.
 *
 * @param {object[]} leads
 * @param {object} options
 * @param {number} options.maxEnrich - Máx leads a procesar (caro en tiempo: ~5s/lead)
 * @returns {Promise<object[]>}
 */
export async function enrichLeadsWithDecisionMaker(leads, { maxEnrich = 50 } = {}) {
    const enriched = [...leads];
    let count = 0;

    for (const lead of enriched) {
        if (count >= maxEnrich) break;
        if (!lead.website) continue;
        if (lead.contact_name) continue; // ya tiene decisor (ej. de BORME)

        const { name, title, description } = await findDecisionMaker(lead.website);

        if (name) {
            lead.contact_name = name;
            lead.contact_title = title;
            logger.info(`DecisionMaker: ${lead.name} → ${name} (${title})`);
        }
        if (description && !lead.description) {
            lead.description = description;
        }

        count++;
        await sleep(800);
    }

    const found = enriched.filter(l => l.contact_name).length;
    logger.info(`DecisionMaker: ${found} decisores encontrados de ${count} leads procesados`);
    return enriched;
}

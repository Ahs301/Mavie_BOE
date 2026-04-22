// src/csv/reader.js – lectura robusta de CSV con normalización de columnas
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import logger from '../utils/logger.js';

// Mapa de aliases de columnas (español/inglés, case-insensitive)
const COLUMN_ALIASES = {
    name: ['name', 'nombre', 'business_name', 'empresa', 'razonsocial', 'razon_social', 'company'],
    email: ['email', 'emails', 'e-mail', 'correo', 'correos', 'mail', 'emailaddress'],
    phone: ['phone', 'telefono', 'teléfono', 'tel', 'móvil', 'movil'],
    website: ['website', 'web', 'url', 'sitio', 'sitioweb', 'sitio_web'],
    address: ['address', 'direccion', 'dirección', 'domicilio'],
    city: ['city', 'ciudad', 'localidad', 'municipio', 'poblacion', 'población'],
    category: ['category', 'categoria', 'categoría', 'sector', 'tipo', 'actividad'],
    description: ['description', 'descripcion', 'descripción', 'desc', 'actividad', 'objeto'],
};

/**
 * Normaliza el encabezado de una columna a minúsculas sin espacios ni acentos.
 */
function normalizeHeader(header) {
    return header
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // eliminar acentos
        .replace(/[^a-z0-9_]/g, '');    // solo alfanumérico y _
}

/**
 * Dado el objeto de encabezados del CSV, construye un mapa fieldName -> columnKey.
 */
function buildColumnMap(rawHeaders) {
    const normalized = rawHeaders.map(h => ({ raw: h, norm: normalizeHeader(h) }));
    const map = {};

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
        for (const alias of aliases) {
            const found = normalized.find(h => h.norm === normalizeHeader(alias));
            if (found) {
                map[field] = found.raw;
                break;
            }
        }
    }
    return map;
}

/**
 * Extrae el dominio de una URL.
 */
export function extractDomain(url) {
    if (!url) return null;
    try {
        const u = url.startsWith('http') ? url : `https://${url}`;
        return new URL(u).hostname.replace(/^www\./, '').toLowerCase();
    } catch {
        return null;
    }
}

/**
 * Valida un email básico.
 */
export function isValidEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const LeadSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
});

/**
 * Lee un CSV y devuelve un array de leads normalizados.
 * @param {string} filePath
 * @returns {Promise<Array>}
 */
export async function readCSV(filePath) {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
        throw new Error(`Fichero CSV no encontrado: ${absPath}`);
    }

    const raw = fs.readFileSync(absPath);
    const records = await new Promise((resolve, reject) => {
        parse(raw, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true,
        }, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });

    if (!records.length) {
        logger.warn('CSV vacío o sin registros.');
        return [];
    }

    const headers = Object.keys(records[0]);
    const colMap = buildColumnMap(headers);

    logger.info(`CSV leído: ${records.length} filas. Mapeo de columnas: ${JSON.stringify(colMap)}`);

    const leads = [];
    for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const raw = {};
        for (const [field, colKey] of Object.entries(colMap)) {
            raw[field] = colKey ? (row[colKey] || '').trim() : '';
        }

        const parsed = LeadSchema.safeParse(raw);
        if (!parsed.success) {
            logger.warn(`Fila ${i + 2}: validación fallida, omitida.`);
            continue;
        }

        const lead = parsed.data;
        if (lead.email) {
            lead.email = lead.email.split(',')[0].toLowerCase().trim();
        } else {
            lead.email = '';
        }
        lead.website = lead.website ? lead.website.toLowerCase().trim() : '';
        lead.domain = extractDomain(lead.website);

        leads.push(lead);
    }

    logger.info(`Leads válidos tras normalización: ${leads.length}`);
    return leads;
}

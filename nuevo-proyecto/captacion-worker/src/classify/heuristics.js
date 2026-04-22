// src/classify/heuristics.js – clasificación por palabras clave
import logger from '../utils/logger.js';

// ─── TIPOS DE EMPRESA ────────────────────────────────────────────────────────
const TYPE_RULES = [
    {
        type: 'consultora_tech',
        keywords: [
            'consultor', 'technology', 'tecnolog', 'software', 'digital', 'inform',
            ' it ', 'tic', 'transformacion digital', 'automatizacion', 'automatización',
            'inteligencia artificial', ' ia ', ' ai ', 'desarrollo', 'programmer',
            'ciberseguridad', 'cloud', 'erp', 'crm', 'datos', 'data',
        ],
    },
    {
        type: 'asesoria',
        keywords: [
            'asesor', 'gestor', 'gestoría', 'contabilidad', 'fiscal', 'laboral',
            'administrativ', 'contable', 'hacienda', 'irpf', 'tributar',
        ],
    },
    {
        type: 'despacho_legal',
        keywords: [
            'abogad', 'legal', 'jurídic', 'juridic', 'notari', 'procurador',
            'litigación', 'despacho', 'bufete',
        ],
    },
    {
        type: 'ingenieria',
        keywords: [
            'ingeniería', 'ingenieria', 'ingenier', 'arquitectura', 'arquitect',
            'obra', 'construccion', 'construcción', 'proyecto', 'industrial',
            'estructur', 'civil', 'mecanic', 'electrica', 'eléctric',
        ],
    },
    {
        type: 'asociacion_cluster',
        keywords: [
            'asociación', 'asociacion', 'clúster', 'cluster', 'federación', 'camara',
            'cámara', 'gremio', 'fundación', 'fundacion', 'confederación',
            'confederacion', 'colegio profesional', 'patronal',
        ],
    },
];

/**
 * Extrae texto combinado de los campos más ricos del lead.
 */
function getSearchText(lead) {
    return ' ' + [
        lead.name || '',
        lead.category || '',
        lead.description || '',
        lead.website || '',
    ]
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') + ' ';
}

/**
 * Clasifica un lead usando reglas heurísticas.
 * @returns {{ type: string, sector: string|null, confidence: number }}
 */
export function classifyByHeuristics(lead) {
    const text = getSearchText(lead);

    for (const rule of TYPE_RULES) {
        const hits = rule.keywords.filter(kw => text.includes(kw));
        if (hits.length > 0) {
            const sector = inferSector(lead, text);
            logger.info(`Heurística: ${lead.name} → ${rule.type} (Hits: ${hits.join(',')})`);
            return {
                type: rule.type,
                sector,
                confidence: Math.min(hits.length / 3, 1),
                method: 'heuristics',
            };
        }
    }

    // Fallback: empresa sectorial (intenta extraer sector de categoría)
    const sector = inferSector(lead, text);
    return {
        type: sector ? 'empresa_sectorial' : 'otro',
        sector,
        confidence: 0.2,
        method: 'heuristics',
    };
}

/**
 * Intenta inferir el sector de negocio a partir de la categoría o descripción.
 */
function inferSector(lead, text) {
    // Si la categoría existe, usarla directamente
    if (lead.category && lead.category.length > 2) {
        return lead.category.trim();
    }

    // Algunos sectores comunes
    const SECTOR_HINTS = [
        ['hostelería', ['hostelería', 'hosteleria', 'restaurant', 'hotel', 'alojamiento']],
        ['salud', ['salud', 'clinica', 'clínica', 'medic', 'farmac', 'dental']],
        ['educacion', ['educacion', 'educación', 'formacion', 'formación', 'instituto', 'colegio', 'academia']],
        ['agricultura', ['agricultur', 'agro', 'ganadería', 'ganaderia', 'campo']],
        ['logística', ['logístic', 'logistic', 'transporte', 'almacen', 'almacén', 'distribuc']],
        ['industria', ['industria', 'manufactur', 'fabrica', 'fábrica', 'produccion']],
        ['comercio', ['comercio', 'venta', 'retail', 'tienda', 'distribuidor']],
        ['turismo', ['turismo', 'turístic', 'touroperador', 'viajes', 'agencia de viajes']],
        ['energía', ['energía', 'energia', 'solar', 'renovable', 'eólica', 'fotovoltaica']],
    ];

    for (const [sector, hints] of SECTOR_HINTS) {
        if (hints.some(h => text.includes(h))) return sector;
    }

    return null;
}

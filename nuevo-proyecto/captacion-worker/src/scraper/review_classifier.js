/**
 * src/scraper/review_classifier.js
 * ─────────────────────────────────────────────────────────────────
 * Clasifica el motivo por el que no se encontró email en un lead.
 * Generar una descripción útil para revisión manual.
 * ─────────────────────────────────────────────────────────────────
 */

export const REVIEW_REASONS = {
    SIN_WEB: 'Sin web – Buscar en redes sociales o directorio del sector',
    WEB_SIN_EMAIL: 'Web sin email visible – Revisar formulario de contacto manualmente',
    WEB_CAIDA: 'Web caída o inaccesible – Verificar si sigue operativa',
    RED_SOCIAL: 'Solo red social (Instagram/Facebook) – Contactar por DM o buscar email en bio',
    SOLO_TELEFONO: 'Solo teléfono – Llamar y pedir email de contacto',
    FORMULARIO: 'Solo formulario de contacto – No tiene email público visible',
    ENCODING: 'Email posiblemente ofuscado – Revisar web manualmente',
    DESCONOCIDO: 'Motivo desconocido – Revisar manualmente',
};

const SOCIAL_DOMAINS = ['instagram.com', 'facebook.com', 'twitter.com', 'x.com', 'tiktok.com', 'linkedin.com', 'youtube.com'];
const FORM_KEYWORDS = ['formulario', 'contact-form', 'contactform', 'wpcf7', 'gravityforms'];

/**
 * Clasifica el motivo por el que un lead no tiene email.
 *
 * @param {Object} lead - El objeto del lead con sus datos
 * @param {string|null} emailStatus - Estado devuelto por el scraper de email
 * @returns {{ code: string, label: string, suggestion: string }}
 */
export function classifyNoEmailReason(lead, emailStatus = null) {
    const website = (lead.website || '').toLowerCase().trim();
    const phone = (lead.phone || '').trim();

    // Sin web en absoluto
    if (!website) {
        if (phone) {
            return {
                code: 'SOLO_TELEFONO',
                label: REVIEW_REASONS.SOLO_TELEFONO,
                suggestion: `Llamar al ${phone} para solicitar email`
            };
        }
        return {
            code: 'SIN_WEB',
            label: REVIEW_REASONS.SIN_WEB,
            suggestion: 'Buscar en Google: "' + (lead.name || '') + ' contacto email"'
        };
    }

    // La "web" es en realidad una red social
    const isSocial = SOCIAL_DOMAINS.some(d => website.includes(d));
    if (isSocial) {
        const network = SOCIAL_DOMAINS.find(d => website.includes(d)) || 'red social';
        return {
            code: 'RED_SOCIAL',
            label: REVIEW_REASONS.RED_SOCIAL,
            suggestion: `Perfil en ${network}: ${lead.website} – Contactar por DM o buscar email en biografía`
        };
    }

    // Web caída
    if (emailStatus === 'WEB_CAIDA' || emailStatus === 'ERROR') {
        return {
            code: 'WEB_CAIDA',
            label: REVIEW_REASONS.WEB_CAIDA,
            suggestion: `Web: ${lead.website} – Verificar si está operativa manualmente`
        };
    }

    // Formulario de contacto detectado
    if (emailStatus === 'FORMULARIO' || FORM_KEYWORDS.some(k => (emailStatus || '').includes(k))) {
        return {
            code: 'FORMULARIO',
            label: REVIEW_REASONS.FORMULARIO,
            suggestion: `Usar el formulario de contacto en: ${lead.website}`
        };
    }

    // Email ofuscado (visto en el scraper pero no extraíble)
    if (emailStatus === 'ENCODING') {
        return {
            code: 'ENCODING',
            label: REVIEW_REASONS.ENCODING,
            suggestion: `El email puede estar ofuscado – Abrir ${lead.website} y buscar en /contacto`
        };
    }

    // Web existe pero sin email
    return {
        code: 'WEB_SIN_EMAIL',
        label: REVIEW_REASONS.WEB_SIN_EMAIL,
        suggestion: `Visitar ${lead.website}/contacto y buscar email o formulario`
    };
}

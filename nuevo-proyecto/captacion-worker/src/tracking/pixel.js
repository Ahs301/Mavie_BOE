// src/tracking/pixel.js – helpers para tracking de aperturas y clics
import getConfig from '../config.js';

/**
 * Genera la URL del pixel de seguimiento para un lead.
 * @param {string} leadId
 * @returns {string}
 */
export function buildPixelUrl(leadId) {
    const { TRACKING_URL } = getConfig();
    if (!TRACKING_URL) return '';
    return `${TRACKING_URL}/open?id=${encodeURIComponent(leadId)}`;
}

/**
 * Envuelve un enlace en una URL de tracking de clic.
 * @param {string} leadId
 * @param {string} targetUrl
 * @returns {string}
 */
export function buildClickUrl(leadId, targetUrl) {
    const { TRACKING_URL } = getConfig();
    if (!TRACKING_URL) return targetUrl;
    return `${TRACKING_URL}/click?id=${encodeURIComponent(leadId)}&url=${encodeURIComponent(targetUrl)}`;
}

/**
 * Genera la URL de unsubscribe para un lead.
 * @param {string} leadId
 * @returns {string}
 */
export function buildUnsubscribeUrl(leadId) {
    const { TRACKING_URL } = getConfig();
    if (!TRACKING_URL) return '';
    return `${TRACKING_URL}/unsub?id=${encodeURIComponent(leadId)}`;
}

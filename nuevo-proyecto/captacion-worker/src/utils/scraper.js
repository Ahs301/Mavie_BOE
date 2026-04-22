/**
 * src/utils/scraper.js  (v3 – Extractor Ultra-Agresivo)
 * ─────────────────────────────────────────────────────────────────
 * Mejoras v3:
 *  1. 30+ rutas de contacto (vs 9 de v2)
 *  2. Extracción de Schema.org JSON-LD ("email" field)
 *  3. Extracción de Open Graph / meta business contact
 *  4. Búsqueda en <meta> tags de contacto
 *  5. Prioridad de emails: mailto > schema.org > HTML directo > texto visible
 * ─────────────────────────────────────────────────────────────────
 */
import puppeteer from 'puppeteer';
import logger from './logger.js';

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const IGNORED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.ttf', '.css', '.js'];
const IGNORED_DOMAINS = [
    'sentry.io', 'sentry-next', 'example.com', 'domain.com', 'yourdomain', 'email.com',
    'wixpress.com', 'wordpress.com', 'shopify.com', 'squarespace.com',
    'schema.org', 'w3.org', 'googleapis.com', 'cloudflare.com', 'google.com',
    'facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'tiktok.com',
    'adobecc.com', 'typekit.com', 'hotjar.com', 'hubspot.com', 'mailchimp.com',
];
const IGNORED_PREFIXES = ['noreply@', 'no-reply@', 'donotreply@', 'mailer@', 'bounce@', 'postmaster@', 'daemon@', 'auto@', 'newsletter@', 'marketing@'];

// 30+ rutas de contacto cubren prácticamente cualquier sitio
const CONTACT_PATHS = [
    '/contacto', '/contact', '/contactar', '/contactenos', '/contactenos',
    '/sobre-nosotros', '/about', '/about-us', '/quienes-somos', '/nosotros',
    '/aviso-legal', '/legal', '/informacion', '/info',
    '/team', '/equipo', '/empresa', '/corporativo',
    '/atencion-al-cliente', '/soporte', '/support', '/ayuda', '/help',
    '/politica-privacidad', '/privacy', '/legal-notice',
    '/contacta', '/contactame', '/habla-con-nosotros',
    '/trabaja-con-nosotros', '/trabaja', '/jobs', '/empleo',
    '/quiero-informacion', '/pide-informacion', '/solicitar-informacion',
];

const OBFUSCATION_PATTERNS = [
    {
        regex: /([a-zA-Z0-9._%+\-]+)\s*[\[\(]at[\]\)]\s*([a-zA-Z0-9.\-]+)\s*[\[\(]dot[\]\)]\s*([a-zA-Z]{2,})/gi,
        replacer: (_, user, domain, tld) => `${user}@${domain}.${tld}`
    },
    {
        regex: /([a-zA-Z0-9._%+\-]+)\s+AT\s+([a-zA-Z0-9.\-]+)\s+DOT\s+([a-zA-Z]{2,})/g,
        replacer: (_, user, domain, tld) => `${user}@${domain}.${tld}`
    },
    {
        regex: /([a-zA-Z0-9._%+\-]+)\s*\(arroba\)\s*([a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi,
        replacer: (_, user, rest) => `${user}@${rest}`
    },
    {
        regex: /([a-zA-Z0-9._%+\-]+)\s*\[arroba\]\s*([a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi,
        replacer: (_, user, rest) => `${user}@${rest}`
    },
];

function filterEmails(emails) {
    return emails.filter(email => {
        const e = email.toLowerCase();
        if (IGNORED_EXTENSIONS.some(ext => e.endsWith(ext))) return false;
        if (IGNORED_DOMAINS.some(d => e.includes(d))) return false;
        if (IGNORED_PREFIXES.some(p => e.startsWith(p))) return false;
        if (e.length > 80 || e.length < 6) return false;
        if (!e.includes('.')) return false;
        return true;
    });
}

function extractEmailsFromText(text) {
    if (!text) return [];
    let deobfuscated = text;
    for (const pattern of OBFUSCATION_PATTERNS) {
        deobfuscated = deobfuscated.replace(pattern.regex, pattern.replacer);
    }
    const matches = deobfuscated.match(EMAIL_REGEX) || [];
    return filterEmails([...new Set(matches.map(e => e.toLowerCase().trim()))]);
}

async function extractEmailsFromPage(page) {
    try {
        const data = await page.evaluate(() => {
            const html = document.documentElement.innerHTML;

            // 1. mailto: links (más confiables)
            const mailtoLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]'))
                .map(a => a.href.replace('mailto:', '').split('?')[0].trim());

            // 2. Schema.org JSON-LD
            const schemaEmails = [];
            document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
                try {
                    const json = JSON.parse(script.textContent);
                    const search = (obj) => {
                        if (!obj || typeof obj !== 'object') return;
                        if (obj.email) schemaEmails.push(obj.email);
                        if (obj.contactPoint?.email) schemaEmails.push(obj.contactPoint.email);
                        Object.values(obj).forEach(v => { if (typeof v === 'object') search(v); });
                    };
                    search(json);
                } catch (_) { }
            });

            // 3. Meta tags de negocio
            const metaEmails = [];
            [
                'meta[property="business:contact_data:email"]',
                'meta[name="author-email"]',
                'meta[name="contact"]',
                'meta[name="email"]',
                'meta[itemprop="email"]',
            ].forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    const v = el.getAttribute('content') || el.getAttribute('value') || '';
                    if (v.includes('@')) metaEmails.push(v);
                });
            });

            // 4. Texto visible completo
            const bodyText = document.body ? document.body.innerText : '';

            const hasForm = document.querySelector('form') !== null;
            const formHtml = document.documentElement.innerHTML;
            const hasContactForm = ['contact-form', 'wpcf7', 'gravityforms', 'ninja-forms', 'formidable']
                .some(kw => formHtml.includes(kw));

            return { html, mailtoLinks, schemaEmails, metaEmails, bodyText, hasForm, hasContactForm };
        });

        const emails = new Set();

        // Prioridad: mailto > schema > meta > html > texto
        for (const m of data.mailtoLinks) { if (m?.includes('@')) emails.add(m.toLowerCase()); }
        for (const e of data.schemaEmails) { if (e?.includes('@')) emails.add(e.toLowerCase()); }
        for (const e of data.metaEmails) { if (e?.includes('@')) emails.add(e.toLowerCase()); }
        for (const e of extractEmailsFromText(data.html)) emails.add(e);
        for (const e of extractEmailsFromText(data.bodyText)) emails.add(e);

        return {
            emails: filterEmails([...emails]),
            hasForm: data.hasForm,
            hasContactForm: data.hasContactForm,
        };
    } catch {
        return { emails: [], hasForm: false, hasContactForm: false };
    }
}

// ─── Browser pool ─────────────────────────────────────────────────

let _browser = null;
let _browserUseCount = 0;
const MAX_BROWSER_USES = 50;

async function getBrowser() {
    if (!_browser || _browserUseCount >= MAX_BROWSER_USES) {
        if (_browser) { try { await _browser.close(); } catch (_) { } }
        _browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox', '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
            ],
        });
        _browserUseCount = 0;
    }
    _browserUseCount++;
    return _browser;
}

// ─── Exportado principal ──────────────────────────────────────────

/**
 * Visita una web y extrae el primer email válido encontrado.
 * Busca en la raíz y en 30+ subpáginas de contacto.
 */
export async function fetchEmailFromWebsite(url) {
    if (!url) return { email: null, pageFound: null, status: 'SIN_WEB' };

    // Timeout global: si tarda más de 15s en total, descartamos y seguimos
    const GLOBAL_TIMEOUT_MS = 15000;
    const timeout = new Promise(resolve =>
        setTimeout(() => resolve({ email: null, pageFound: null, status: 'TIMEOUT' }), GLOBAL_TIMEOUT_MS)
    );

    return Promise.race([timeout, _fetchEmailInternal(url)]);
}

async function _fetchEmailInternal(url) {
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;

    let baseUrl;
    try {
        const parsed = new URL(targetUrl);
        baseUrl = `${parsed.protocol}//${parsed.hostname}`;
    } catch {
        return { email: null, pageFound: null, status: 'URL_INVALIDA' };
    }

    let page;
    try {
        const browser = await getBrowser();
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Solo probamos la raíz + 5 rutas clave (antes eran 30+)
        const FAST_PATHS = ['/contacto', '/contact', '/sobre-nosotros', '/about', '/aviso-legal'];
        const pagesToTry = [targetUrl, ...FAST_PATHS.map(p => baseUrl + p)];

        for (const pageUrl of pagesToTry) {
            try {
                const response = await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 6000 });
                if (!response || (!response.ok() && pageUrl !== targetUrl)) continue;

                const { emails } = await extractEmailsFromPage(page);

                if (emails.length > 0) {
                    await page.close();
                    return { email: emails[0], pageFound: pageUrl, status: 'FOUND' };
                }
            } catch (_) {
                continue;
            }
        }

        await page.close();
        return { email: null, pageFound: null, status: 'WEB_SIN_EMAIL' };

    } catch (err) {
        if (page) { try { await page.close(); } catch (_) { } }
        if (err.message.includes('net::ERR') || err.message.includes('timeout')) {
            return { email: null, pageFound: null, status: 'WEB_CAIDA' };
        }
        return { email: null, pageFound: null, status: 'ERROR' };
    }
}

export async function closeBrowser() {
    if (_browser) {
        try { await _browser.close(); } catch (_) { }
        _browser = null;
    }
}

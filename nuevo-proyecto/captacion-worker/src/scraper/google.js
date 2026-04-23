/**
 * src/scraper/google.js  (v2 – Multi-Query + Fichas individuales)
 * ─────────────────────────────────────────────────────────────────
 * Estrategia para conseguir 400+ resultados:
 *  1. Para cada variante de búsqueda del nicho, abre Maps y hace scroll.
 *  2. Extrae la URL de cada ficha (/maps/place/…).
 *  3. Entra en cada ficha para obtener datos completos (web, tel, dir, cat).
 *  4. Deduplica globalmente por nombre+teléfono.
 *  5. Extrae email de cada web con el scraper agresivo.
 * ─────────────────────────────────────────────────────────────────
 */
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteerExtra.use(StealthPlugin());
import cliProgress from 'cli-progress';
import logger from '../utils/logger.js';
import { fetchEmailFromWebsite } from '../utils/scraper.js';
import { getSearchVariants } from './niches.js';
import { classifyNoEmailReason } from './review_classifier.js';
import { sleep } from '../utils/throttle.js';

// ─── Helpers ─────────────────────────────────────────────────────

/** Scroll del panel lateral de Maps hasta el fondo */
async function autoScrollFeed(page, containerSelector) {
    await page.evaluate(async (selector) => {
        await new Promise((resolve) => {
            const wrapper = document.querySelector(selector);
            if (!wrapper) { resolve(); return; }

            let lastHeight = wrapper.scrollHeight;
            let unchanged = 0;

            const timer = setInterval(() => {
                wrapper.scrollBy(0, 1000);
                const h = wrapper.scrollHeight;
                if (h === lastHeight) {
                    unchanged++;
                    if (unchanged >= 8) { clearInterval(timer); resolve(); }
                } else {
                    unchanged = 0;
                    lastHeight = h;
                }
            }, 700);
        });
    }, containerSelector);
}

/** Extrae todas las URLs de fichas del panel lateral */
async function extractPlaceUrls(page) {
    return page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        if (!feed) return [];
        const links = Array.from(feed.querySelectorAll('a[href*="/maps/place/"]'));
        const urls = links.map(a => a.href).filter(Boolean);
        // Deduplica por URL
        return [...new Set(urls)];
    });
}

/**
 * Limpia una URL de maps/place quitando query strings raros para
 * que sea más rápida la navegación.
 */
function cleanMapsUrl(url) {
    try {
        const u = new URL(url);
        // Mantener solo el path (no los params)
        return `https://www.google.com${u.pathname}`;
    } catch {
        return url;
    }
}

/** Extrae los datos completos de una ficha individual de Google Maps */
async function extractPlaceDetails(page, url) {
    try {
        await page.goto(cleanMapsUrl(url), { waitUntil: 'domcontentloaded', timeout: 25000 });
        // Esperar a que aparezca el h1 del lugar
        await page.waitForSelector('h1', { timeout: 8000 }).catch(() => { });

        return page.evaluate(() => {
            const getText = (sel) => {
                const el = document.querySelector(sel);
                return el ? el.innerText.trim() : '';
            };

            // Nombre
            const name = getText('h1') || getText('[data-item-id="title"]');

            // Teléfono: buscar en todos los botones/links con data-item-id
            const phoneEl = document.querySelector('[data-item-id^="phone:"]') ||
                document.querySelector('button[aria-label*="Llamar"]') ||
                document.querySelector('button[aria-label*="llamar"]');
            let phone = '';
            if (phoneEl) {
                const label = phoneEl.getAttribute('aria-label') || phoneEl.innerText || '';
                const match = label.match(/(?:\+34|0034)?[\s-]?[6789](?:[\s-]?\d){8}/);
                phone = match ? match[0].replace(/[\s-]/g, '') : '';
            }

            // Web: buscar el link externo (no google.com)
            const allLinks = Array.from(document.querySelectorAll('a[data-item-id="authority"]'));
            let website = '';
            if (allLinks.length > 0) {
                website = allLinks[0].href || '';
            }
            if (!website) {
                // Fallback: buscar cualquier link externo
                const externalLinks = Array.from(document.querySelectorAll('a[href^="http"]'))
                    .filter(a => !a.href.includes('google.com') && !a.href.includes('goo.gl'));
                website = externalLinks.length > 0 ? externalLinks[0].href : '';
            }

            // Categoría: suele estar en el primer span después del h1
            let category = '';
            const categoryEl = document.querySelector('[jsan*="t-tzOjILlHPc"]') ||
                document.querySelector('button[jsaction*="category"]');
            if (categoryEl) category = categoryEl.innerText.trim();

            // Dirección
            const addrEl = document.querySelector('[data-item-id="address"]') ||
                document.querySelector('[aria-label*="Dirección"]') ||
                document.querySelector('[aria-label*="dirección"]');
            const address = addrEl ? (addrEl.getAttribute('aria-label') || addrEl.innerText || '').replace(/^Dirección:\s*/i, '').trim() : '';

            return { name, phone, website, category, address };
        });
    } catch (err) {
        return null;
    }
}

// ─── Función principal ────────────────────────────────────────────

/**
 * Scrapea Google Maps usando múltiples variantes de búsqueda para
 * obtener el mayor número de leads posible.
 *
 * @param {string} keyword   - Nicho de búsqueda (ej. "peluquería")
 * @param {string} location  - Localización (ej. "Valencia")
 * @param {number} limit     - Límite máximo de leads con email
 * @param {boolean} useVariants - Si true, usa variantes del diccionario de nichos
 * @returns {Promise<{ leads: Object[], reviewLeads: Object[] }>}
 */
export async function scrapeGoogleMapsMultiQuery(keyword, location, limit = 200, useVariants = true) {
    const variants = useVariants ? getSearchVariants(keyword) : [keyword];
    logger.info(`🔍 Buscando "${keyword}" en ${location} con ${variants.length} variante(s): ${variants.join(', ')}`);

    const browser = await puppeteerExtra.launch({
        headless: true,
        executablePath: process.env.CHROME_PATH || undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1366,768',
            '--lang=es-ES',
        ]
    });

    // Mapa global de deduplicación: key = normalizar(nombre+tel)
    const seenKeys = new Set();
    // URLs de fichas ya procesadas
    const seenUrls = new Set();

    const allPlaceUrls = [];

    // ─── FASE 1: Recopilar URLs de fichas para cada variante ─────
    logger.info('📋 Fase 1: Recopilando URLs de fichas...');
    const searchPage = await browser.newPage();
    await searchPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await searchPage.setExtraHTTPHeaders({ 'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8' });
    await searchPage.setViewport({ width: 1366, height: 768 });

    // Pre-aceptar cookies de Google para evitar la página de consent
    await searchPage.setCookie(
        { name: 'SOCS', value: 'CAESHAgBEhJnd3NfMjAyNTExMTItMF9SQzEaAmVzIAEaBgiAo8O5Bg', domain: '.google.com', path: '/' },
        { name: 'NID', value: '511=bypass', domain: '.google.com', path: '/' },
    );

    // Aceptar cookies una sola vez
    let cookiesAccepted = false;

    for (const variant of variants) {
        try {
            const query = encodeURIComponent(`${variant} en ${location}`);
            const url = `https://www.google.com/maps/search/${query}`;
            logger.info(`  ↳ Buscando: "${variant} en ${location}"`);

            await searchPage.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Manejar página de consent en cualquier idioma
            if (searchPage.url().includes('consent.google.com')) {
                try {
                    // Esperar a que los botones carguen
                    await searchPage.waitForSelector('button', { timeout: 5000 }).catch(() => {});

                    // Click por texto — funciona en DE/ES/EN/FR/IT
                    const clicked = await searchPage.evaluate(() => {
                        const acceptKeywords = ['akzept', 'accept', 'aceptar', 'accepter', 'accetta', 'todo', 'all', 'alle'];
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const btn = buttons.find(b => {
                            const t = (b.textContent || '').toLowerCase();
                            return acceptKeywords.some(k => t.includes(k));
                        });
                        if (btn) { btn.click(); return true; }
                        // Fallback: último botón del último form (Google siempre pone "Aceptar" al final)
                        const forms = document.querySelectorAll('form');
                        const lastForm = forms[forms.length - 1];
                        if (lastForm) {
                            const btns = lastForm.querySelectorAll('button');
                            const last = btns[btns.length - 1];
                            if (last) { last.click(); return true; }
                        }
                        return false;
                    });

                    if (clicked) {
                        await searchPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
                        cookiesAccepted = true;
                        logger.info(`  ↳ Consent aceptado → ${searchPage.url()}`);
                    } else {
                        logger.warn(`  ↳ No se encontró botón de consent`);
                    }
                } catch (_) { }
            } else if (!cookiesAccepted) {
                try {
                    const btn = await searchPage.$('button[aria-label="Aceptar todo"]') ||
                                await searchPage.$('button[aria-label="Accept all"]');
                    if (btn) { await btn.click(); await sleep(1500); cookiesAccepted = true; }
                } catch (_) { }
            }

            // Debug: loguear URL y título reales tras navegación
            const finalUrl = searchPage.url();
            const pageTitle = await searchPage.title();
            logger.info(`  ↳ [DEBUG] URL: ${finalUrl}`);
            logger.info(`  ↳ [DEBUG] Título: ${pageTitle}`);

            // Screenshot para diagnóstico (solo primera variante)
            if (!cookiesAccepted) {
                try {
                    await searchPage.screenshot({ path: `/tmp/maps_debug_${Date.now()}.png`, fullPage: false });
                    logger.info(`  ↳ [DEBUG] Screenshot guardado en /tmp/`);
                } catch (_) {}
            }

            // Esperar feed
            const feedSelector = 'div[role="feed"]';
            try {
                await searchPage.waitForSelector(feedSelector, { timeout: 12000 });
                await autoScrollFeed(searchPage, feedSelector);
            } catch (_) {
                // Loguear HTML del body para diagnóstico
                const bodySnippet = await searchPage.evaluate(() => document.body?.innerText?.slice(0, 300) ?? '').catch(() => '');
                logger.warn(`  ↳ No se encontró el feed para: ${variant}`);
                logger.warn(`  ↳ [DEBUG] Body snippet: ${bodySnippet.replace(/\n/g, ' ')}`);
                continue;
            }

            const urls = await extractPlaceUrls(searchPage);
            logger.info(`  ↳ ${urls.length} fichas encontradas para "${variant}"`);

            for (const u of urls) {
                const baseUrl = cleanMapsUrl(u);
                if (!seenUrls.has(baseUrl)) {
                    seenUrls.add(baseUrl);
                    allPlaceUrls.push(baseUrl);
                }
            }

            // Pausa entre variantes para no ser baneado
            await sleep(Math.floor(Math.random() * 2000) + 1500);
        } catch (err) {
            logger.warn(`Error buscando variante "${variant}": ${err.message}`);
        }
    }

    await searchPage.close();
    logger.info(`📊 Total fichas únicas encontradas: ${allPlaceUrls.length}`);

    // ─── FASE 2: Entrar en cada ficha y extraer datos ────────────
    logger.info('🏪 Fase 2: Extrayendo datos de fichas individuales...');
    const detailPage = await browser.newPage();
    await detailPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await detailPage.setViewport({ width: 1366, height: 768 });

    const rawLeads = [];
    const barDetails = new cliProgress.SingleBar({
        format: '  Fichas |{bar}| {value}/{total} | {percentage}%',
        barCompleteChar: '█', barIncompleteChar: '░', hideCursor: true
    }, cliProgress.Presets.shades_grey);
    barDetails.start(allPlaceUrls.length, 0);

    for (const placeUrl of allPlaceUrls) {
        const details = await extractPlaceDetails(detailPage, placeUrl);
        barDetails.increment();

        if (!details || !details.name) continue;

        // Clave de deduplicación
        const dedupeKey = `${details.name.toLowerCase().replace(/\s+/g, '')}|${(details.phone || '').replace(/[\s-]/g, '')}`;
        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);

        rawLeads.push({
            ...details,
            sourceQuery: `${keyword} en ${location}`,
            mapsUrl: placeUrl,
            email: '',
            emailStatus: '',
        });

        // Pequeña pausa para no saturar Maps
        await sleep(300);
    }

    barDetails.stop();
    await detailPage.close();
    logger.info(`✅ ${rawLeads.length} empresas únicas extraídas. Buscando emails...`);

    // ─── FASE 3: Extraer emails de las webs ─────────────────────
    logger.info('📧 Fase 3: Extrayendo emails de webs...');
    const barEmails = new cliProgress.SingleBar({
        format: '  Emails |{bar}| {value}/{total} | Con email: {emailCount}',
        barCompleteChar: '█', barIncompleteChar: '░', hideCursor: true
    }, cliProgress.Presets.shades_grey);
    barEmails.start(rawLeads.length, 0, { emailCount: 0 });

    let emailCount = 0;
    const leadsWithEmail = [];
    const leadsToReview = [];

    for (let i = 0; i < rawLeads.length; i++) {
        const lead = rawLeads[i];

        if (lead.website) {
            const result = await fetchEmailFromWebsite(lead.website);
            if (result && result.email) {
                lead.email = result.email;
                lead.emailStatus = result.status || 'FOUND';
                lead.pageFound = result.pageFound || '/';
                emailCount++;
                leadsWithEmail.push(lead);
            } else {
                lead.emailStatus = result?.status || 'WEB_SIN_EMAIL';
                const reason = classifyNoEmailReason(lead, lead.emailStatus);
                lead.reviewCode = reason.code;
                lead.reviewLabel = reason.label;
                lead.reviewSuggestion = reason.suggestion;
                leadsToReview.push(lead);
            }
        } else {
            lead.emailStatus = 'SIN_WEB';
            const reason = classifyNoEmailReason(lead, 'SIN_WEB');
            lead.reviewCode = reason.code;
            lead.reviewLabel = reason.label;
            lead.reviewSuggestion = reason.suggestion;
            leadsToReview.push(lead);
        }

        barEmails.update(i + 1, { emailCount });
    }

    barEmails.stop();
    await browser.close();

    logger.info(`\n🏁 SCRAPING COMPLETADO`);
    logger.info(`   ✅ Con email:       ${leadsWithEmail.length}`);
    logger.info(`   ⚠️  Para revisar:   ${leadsToReview.length}`);
    logger.info(`   📊 Total:           ${rawLeads.length}`);

    return { leads: leadsWithEmail, reviewLeads: leadsToReview };
}

// ─── Backwards-compat wrapper ────────────────────────────────────
/**
 * Wrapper para mantener compatibilidad con el código antiguo que
 * usaba scrapeGoogleMaps(keyword, location, limit).
 * Devuelve solo el array plano de leads (como antes).
 */
export async function scrapeGoogleMaps(keyword, location, limit = 50) {
    const { leads, reviewLeads } = await scrapeGoogleMapsMultiQuery(keyword, location, limit, false);
    // Unir ambas listas y devolver aplanado (compatibilidad)
    return [...leads, ...reviewLeads].slice(0, limit);
}

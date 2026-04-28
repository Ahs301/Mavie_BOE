// src/cli.js – CLI principal v2 (Professional Sales Platform)
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import getConfig from './config.js';
import logger from './utils/logger.js';
import { readCSV, isValidEmail } from './csv/reader.js';
import { classifyLead } from './classify/openai.js';
import { generateInitialEmail, generateFollowUpEmail, appendSignature } from './templates/templates.js';
import {
    getDB, leadExists, insertLead, updateLeadStatus, insertSend,
    getLeadsForFollowup, markReplied, getStats, getDetailedStats,
    getUnrepliedLeads, getHotLeads, markBounced, getLeadMessageId, getAbTestingStats,
} from './db/index.js';
import { sendEmail, verifySMTP } from './email/sender.js';
import { sleep, HourlyRateLimiter, DailyWarmupLimiter } from './utils/throttle.js';
import { fetchEmailFromWebsite } from './utils/scraper.js';
import { scrapeGoogleMaps, scrapeGoogleMapsMultiQuery } from './scraper/google.js';
import { scrapeAllSpain, scrapeAllSpainV2 } from './scraper/bulk_spain.js';
import { writeScrapedLeadsToCSV, writeReviewLeadsToCSV } from './csv/writer.js';
import { closeBrowser } from './utils/scraper.js';
import { buildPixelUrl, buildClickUrl, buildUnsubscribeUrl } from './tracking/pixel.js';
import { fetchAndProcessBounces } from './email/bounce_handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── ADJUNTO PDF ──────────────────────────────────────────────────────────────
const PDF_PATH = path.resolve('BOE Radar Inteligente.pdf');
const PDF_ATTACHMENT = fs.existsSync(PDF_PATH) ? [{ filename: 'BOE Radar Inteligente.pdf', path: PDF_PATH }] : [];

if (PDF_ATTACHMENT.length === 0) {
    logger.warn('⚠️  PDF no encontrado en la raíz del proyecto. Los emails se enviarán sin adjunto.');
}

// ─── CLI SETUP ────────────────────────────────────────────────────────────────
const program = new Command();
program
    .name('boe-radar')
    .description('BOE Radar Inteligente – Plataforma Profesional de Outreach B2B')
    .version('2.0.0');

// ─── 1. PREVIEW ──────────────────────────────────────────────────────────────
program
    .command('preview')
    .description('Previsualiza N emails sin enviarlos a partir de un CSV')
    .requiredOption('-f, --file <path>', 'Ruta al fichero CSV')
    .option('-l, --limit <number>', 'Límite de leads a previsualizar', '5')
    .action(async (options) => {
        logger.info(`🔍 PREVIEW: ${options.file}`);
        const limit = parseInt(options.limit, 10);
        const leads = await readCSV(options.file);
        let count = 0;

        for (const lead of leads) {
            if (count >= limit) break;

            if (!lead.email && lead.website) {
                const result = await fetchEmailFromWebsite(lead.website);
                if (result?.email) lead.email = result.email;
            }

            if (!isValidEmail(lead.email)) {
                logger.warn(`Saltando sin email: ${lead.name || lead.email}`);
                continue;
            }

            logger.info(`Clasificando: ${lead.name || lead.email}...`);
            const classification = await classifyLead(lead);
            const fullLead = { ...lead, ...classification };
            const { subject, body } = generateInitialEmail(fullLead);

            console.log(`\n${'='.repeat(60)}`);
            console.log(`[LEAD]    ${fullLead.name || 'Sin Nombre'} (${fullLead.email})`);
            console.log(`[TIPO]    ${fullLead.type} | [SECTOR] ${fullLead.sector || 'N/A'}`);
            if (fullLead.openingLine) console.log(`[OPENING] ${fullLead.openingLine}`);
            console.log(`[SUBJECT] ${subject}`);
            console.log(`${'-'.repeat(60)}`);
            console.log(appendSignature(body));
            console.log(`${'='.repeat(60)}\n`);
            count++;
        }
        logger.info('Previsualización finalizada.');
    });

// ─── 2. SEND (core) ──────────────────────────────────────────────────────────
async function sendAction(options) {
    const isDryRun = options.dryRun || options.dry_run;
    logger.info(`🚀 CAMPAÑA: ${options.file} (Dry-run: ${!!isDryRun})`);

    const config = getConfig();
    const db = getDB(config.DB_PATH);

    if (!isDryRun && !(await verifySMTP())) {
        logger.error('No se puede iniciar el envío: Fallo SMTP.');
        process.exit(1);
    }

    const { SEND_DELAY_MS, MAX_PER_HOUR, MAX_PER_DAY, DOMAIN_SETUP_DATE, ENABLE_WARMUP } = config;
    const rateLimiter = new HourlyRateLimiter(MAX_PER_HOUR);

    // Warmup: limita emails/día en primeras 2 semanas
    const warmupLimiter = ENABLE_WARMUP
        ? new DailyWarmupLimiter(DOMAIN_SETUP_DATE)
        : null;

    if (warmupLimiter && !isDryRun) {
        logger.info(`🌡️  ${warmupLimiter.getStatus()}`);
    }

    const leads = await readCSV(options.file);
    const sourceFileName = path.basename(options.file);

    let sent = 0, skipped = 0, errors = 0;

    for (const lead of leads) {
        lead.sourceFile = sourceFileName;

        if (!lead.email && lead.website) {
            logger.info(`Buscando email en web para ${lead.name || lead.website}...`);
            const result = await fetchEmailFromWebsite(lead.website);
            if (result?.email) {
                lead.email = result.email;
                logger.info(`✅ Email encontrado: ${lead.email}`);
            } else {
                logger.warn(`❌ Sin email en ${lead.website}`);
            }
        }

        if (!isValidEmail(lead.email)) { skipped++; continue; }

        const exists = leadExists(db, lead);
        if (exists) {
            logger.info(`Duplicado (${exists.reason}): ${lead.email}`);
            skipped++;
            continue;
        }

        if (!isDryRun) {
            await rateLimiter.waitIfNeeded();
            if (warmupLimiter) await warmupLimiter.waitIfNeeded();
        }

        // 🛑 Límite diario estricto (Brevo)
        if (!isDryRun && sent >= MAX_PER_DAY) {
            logger.warn(`🛑 LÍMITE DIARIO ALCANZADO: ${MAX_PER_DAY} emails. Deteniendo ejecución para no bloquear Brevo.`);
            break;
        }

        logger.info(`Clasificando: ${lead.email}...`);
        const classification = await classifyLead(lead);
        const fullLead = { ...lead, ...classification, status: 'PENDING' };
        const { subject, body, templateKey, abVariant } = generateInitialEmail(fullLead);
        fullLead.templateKey = templateKey;
        fullLead.abVariant = abVariant;

        const leadId = insertLead(db, fullLead);

        if (isDryRun) {
            logger.info(`(DRY-RUN) PENDING: ${fullLead.email}`);
            continue;
        }

        try {
            // Construir URLs de tracking
            const trackingPixelUrl = buildPixelUrl(leadId);
            const unsubscribeUrl = buildUnsubscribeUrl(leadId);
            const ctaLink = buildClickUrl(leadId, `https://wa.me/34633448806`);

            const result = await sendEmail(fullLead.email, subject, body, PDF_ATTACHMENT, {
                trackingPixelUrl, unsubscribeUrl, ctaLink,
            });

            const now = new Date().toISOString();
            updateLeadStatus(db, leadId, 'SENT', { sentAt: now, messageId: result.messageId });
            insertSend(db, { leadId, kind: 'INITIAL', subject, body, status: 'SENT', messageId: result.messageId });

            rateLimiter.record();
            if (warmupLimiter) warmupLimiter.record();
            sent++;
            logger.info(`✅ Enviado a ${fullLead.email}. Esperando ${SEND_DELAY_MS / 1000}s...`);
            await sleep(SEND_DELAY_MS);
        } catch (err) {
            updateLeadStatus(db, leadId, 'FAILED', { lastError: err.message });
            insertSend(db, { leadId, kind: 'INITIAL', subject, body, status: 'FAILED', error: err.message });
            errors++;
        }
    }

    logger.info(`🏁 FINALIZADO. Enviados: ${sent} | Omitidos: ${skipped} | Errores: ${errors}`);
}

program
    .command('send')
    .description('Procesa CSV, clasifica con IA, envía emails HTML con PDF adjunto y registra en DB')
    .requiredOption('-f, --file <path>', 'Ruta al fichero CSV')
    .option('--dry-run', 'Modo simulado: no envía.')
    .action(sendAction);

// ─── 3. FOLLOWUP PREVIEW ─────────────────────────────────────────────────────
program
    .command('followup-preview')
    .description('Previsualiza los emails de seguimiento a enviar')
    .option('-d, --days <number>', 'Días desde el envío inicial', '4')
    .option('-l, --limit <number>', 'Límite', '5')
    .action(async (options) => {
        const db = getDB(getConfig().DB_PATH);
        const limit = parseInt(options.limit, 10);
        const days = parseInt(options.days, 10);
        const pending = getLeadsForFollowup(db, days);
        logger.info(`🔍 PREVIEW FOLLOW-UP (>${days} días): ${pending.length} leads`);

        let count = 0;
        for (const lead of pending) {
            if (count >= limit) break;
            const { subject, body } = generateFollowUpEmail(lead);
            console.log(`\n=== FOLLOWUP: ${lead.email} ===`);
            console.log(`[SUBJECT] ${subject}`);
            console.log('-'.repeat(50));
            console.log(appendSignature(body));
            console.log('='.repeat(50) + '\n');
            count++;
        }
    });

// ─── 4. FOLLOWUP SEND ────────────────────────────────────────────────────────
program
    .command('followup-send')
    .description('Ejecuta el envío de follow-ups en hilo (In-Reply-To del email original)')
    .option('-d, --days <number>', 'Días desde el envío inicial', '4')
    .action(async (options) => {
        const config = getConfig();
        const db = getDB(config.DB_PATH);

        if (!(await verifySMTP())) { logger.error('Fallo SMTP. Saliendo.'); process.exit(1); }

        const { SEND_DELAY_MS, MAX_PER_HOUR, MAX_PER_DAY } = config;
        const rateLimiter = new HourlyRateLimiter(MAX_PER_HOUR);
        const days = parseInt(options.days, 10);
        const pending = getLeadsForFollowup(db, days);

        logger.info(`🚀 FOLLOW-UP (>${days} días) para ${pending.length} leads`);
        let sent = 0, errors = 0;

        for (const lead of pending) {
            // 🛑 Límite diario estricto (Brevo)
            if (sent >= MAX_PER_DAY) {
                logger.warn(`🛑 LÍMITE DIARIO ALCANZADO: ${MAX_PER_DAY} follow-ups hoy. Deteniendo ejecución.`);
                break;
            }

            await rateLimiter.waitIfNeeded();
            const { subject, body } = generateFollowUpEmail(lead);

            // Obtener message_id del email original para threading
            const originalMessageId = getLeadMessageId(db, lead.id);
            const trackingPixelUrl = buildPixelUrl(lead.id);
            const unsubscribeUrl = buildUnsubscribeUrl(lead.id);
            const ctaLink = buildClickUrl(lead.id, `https://wa.me/34633448806`);

            try {
                const result = await sendEmail(lead.email, subject, body, PDF_ATTACHMENT, {
                    trackingPixelUrl, unsubscribeUrl, ctaLink,
                    inReplyTo: originalMessageId || undefined,
                    references: originalMessageId || undefined,
                });

                insertSend(db, { leadId: lead.id, kind: 'FOLLOWUP', subject, body, status: 'SENT', messageId: result.messageId });
                rateLimiter.record();
                sent++;
                logger.info(`📧 Follow-up a ${lead.email} (en hilo). Esperando ${SEND_DELAY_MS / 1000}s...`);
                await sleep(SEND_DELAY_MS);
            } catch (err) {
                insertSend(db, { leadId: lead.id, kind: 'FOLLOWUP', subject, body, status: 'FAILED', error: err.message });
                logger.error(`Error follow-up a ${lead.email}: ${err.message}`);
                errors++;
            }
        }
        logger.info(`🏁 FOLLOW-UPS. Enviados: ${sent} | Errores: ${errors}`);
    });

// ─── 5. MARK REPLIED ─────────────────────────────────────────────────────────
program
    .command('mark-replied')
    .description('Marca un lead como REPLIED para detener follow-ups')
    .requiredOption('-e, --email <string>', 'Email que ha contestado')
    .action((options) => {
        const db = getDB(getConfig().DB_PATH);
        const changes = markReplied(db, options.email);
        if (changes > 0) {
            logger.info(`✅ ${options.email} marcado como REPLIED.`);
        } else {
            logger.warn(`⚠️  No se encontró: ${options.email}`);
        }
    });

// ─── 6. UNREPLIED ────────────────────────────────────────────────────────────
program
    .command('unreplied')
    .description('Lista los leads que no han contestado')
    .action(() => {
        const db = getDB(getConfig().DB_PATH);
        const leads = getUnrepliedLeads(db);

        if (leads.length === 0) {
            logger.info('✅ ¡Todos los leads han contestado!');
            return;
        }

        console.log(`\n📥 SIN RESPUESTA: ${leads.length} leads`);
        console.log('='.repeat(70));
        console.log(`${'#'.padEnd(4)} ${'Email'.padEnd(40)} ${'Nombre'.padEnd(26)} ${'Enviado'.padEnd(12)} 👁 🖱`);
        console.log('-'.repeat(70));
        leads.forEach((l, i) => {
            const sent = l.sent_at ? new Date(l.sent_at).toLocaleDateString('es-ES') : 'N/A';
            const name = (l.name || 'Sin nombre').substring(0, 24);
            const opens = l.open_count || 0;
            const clicks = l.click_count || 0;
            console.log(`${String(i + 1).padEnd(4)} ${(l.email || '').padEnd(40)} ${name.padEnd(26)} ${sent.padEnd(12)} ${opens}  ${clicks}`);
        });
        console.log('='.repeat(70));
        console.log(`💡 Follow-up:     node src/cli.js followup-send`);
        console.log(`💡 Leads calientes: node src/cli.js hot-leads\n`);
    });

// ─── 7. HOT LEADS ────────────────────────────────────────────────────────────
program
    .command('hot-leads')
    .description('Lista los leads que abrieron o hicieron clic en el email (alta intención de compra)')
    .action(() => {
        const db = getDB(getConfig().DB_PATH);
        const leads = getHotLeads(db);

        if (leads.length === 0) {
            logger.info('🥶 No hay leads calientes aún. ¡Espera a que abran los emails!');
            return;
        }

        console.log(`\n🔥 LEADS CALIENTES: ${leads.length} (han abierto o clicado)`);
        console.log('='.repeat(75));
        console.log(`${'#'.padEnd(4)} ${'Email'.padEnd(40)} ${'Nombre'.padEnd(24)} ${'👁 Apert'.padEnd(10)} ${'🖱 Clics'}`);
        console.log('-'.repeat(75));
        leads.forEach((l, i) => {
            const name = (l.name || 'Sin nombre').substring(0, 22);
            console.log(`${String(i + 1).padEnd(4)} ${(l.email || '').padEnd(40)} ${name.padEnd(24)} ${String(l.open_count || 0).padEnd(10)} ${l.click_count || 0}`);
        });
        console.log('='.repeat(75));
        console.log(`\n💡 ACCIÓN: Llama o escribe primero a estos leads — ya saben quién eres.\n`);
    });

// ─── 8. STATS ────────────────────────────────────────────────────────────────
program
    .command('stats')
    .description('Estadísticas globales de la base de datos')
    .action(() => {
        const db = getDB(getConfig().DB_PATH);
        const stats = getStats(db);
        console.log('\n📊 ESTADÍSTICAS');
        console.log('='.repeat(38));
        let total = 0;
        for (const [status, count] of Object.entries(stats)) {
            console.log(`  ${status.padEnd(22)}: ${count}`);
            total += count;
        }
        console.log('-'.repeat(38));
        console.log(`  ${'TOTAL'.padEnd(22)}: ${total}\n`);
    });

// ─── 9. REPORT ───────────────────────────────────────────────────────────────
program
    .command('report')
    .description('Reporte ejecutivo completo del pipeline de ventas')
    .action(() => {
        const db = getDB(getConfig().DB_PATH);
        const s = getDetailedStats(db);

        const bar = (pct) => {
            const filled = Math.round(pct / 5);
            return '[' + '█'.repeat(filled) + '░'.repeat(20 - filled) + `] ${pct}%`;
        };

        console.log('\n');
        console.log('╔══════════════════════════════════════════════════════╗');
        console.log('║       📊  BOE RADAR — REPORTE EJECUTIVO              ║');
        console.log('╚══════════════════════════════════════════════════════╝');
        console.log(`\n  🗓️  Generado: ${new Date().toLocaleString('es-ES')}\n`);
        console.log('  ── FUNNEL ─────────────────────────────────────────────');
        console.log(`  📋  Total leads en DB      : ${s.total}`);
        console.log(`  📤  Total enviados          : ${s.sent}`);
        console.log(`  👁️  Aperturas               : ${s.opened}  ${bar(s.openRate)}`);
        console.log(`  🖱️  Clics en CTA            : ${s.clicked}  ${bar(s.clickRate)}`);
        console.log(`  💬  Respuestas              : ${s.replied}  ${bar(s.replyRate)}`);
        console.log('');
        console.log('  ── SALUD DEL DOMINIO ──────────────────────────────────');
        console.log(`  📩  Bounces (rebotados)     : ${s.bounced}  ${s.bounceRate > 3 ? '⚠️  ALERTA >3%' : '✅ OK'}`);
        console.log(`  🚫  Desuscripciones         : ${s.unsub}`);
        console.log('');
        console.log('  ── OPORTUNIDADES ──────────────────────────────────────');
        console.log(`  🔥  Leads calientes         : ${s.hot}`);
        console.log('       (han abierto/clicado sin contestar — llama hoy)');
        console.log('\n  Comandos útiles:');
        console.log('  → node src/cli.js hot-leads       Ver leads calientes');
        console.log('  → node src/cli.js followup-send   Enviar follow-ups');
        console.log('  → node src/cli.js unreplied       Ver todos sin respuesta');
        console.log('═'.repeat(56) + '\n');
    });

// ─── 9b. A/B TESTING REPORT ──────────────────────────────────────────────────
program
    .command('ab-report')
    .description('Análisis A/B Testing: tasa de apertura por variante de asunto')
    .action(() => {
        const db = getDB(getConfig().DB_PATH);
        const abStats = getAbTestingStats(db);

        if (abStats.length === 0) {
            logger.info('📊 Sin datos A/B aún. Envía al menos 10 emails para analizar.');
            return;
        }

        console.log('\n');
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║          📊  A/B TESTING — ANÁLISIS DE VARIANTES       ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log(`\n  Generado: ${new Date().toLocaleString('es-ES')}\n`);
        console.log('  ┌─────────────────────────────────────────────────────┐');
        console.log('  │ Variante │ Enviados │ Apertura │ Clics │ Respuestas │');
        console.log('  ├─────────────────────────────────────────────────────┤');

        // Determinar mejor variante
        let bestVariant = null;
        let bestRate = -1;

        abStats.forEach(v => {
            const openBar = '█'.repeat(Math.round(v.openRate / 5)) + '░'.repeat(20 - Math.round(v.openRate / 5));
            const variantName = `Variante ${v.variant}`;
            console.log(`  │ ${variantName.padEnd(9)} │ ${String(v.sent).padEnd(8)} │ ${`${v.openRate}%`.padEnd(8)} │ ${`${v.clickRate}%`.padEnd(5)} │ ${`${v.replyRate}%`.padEnd(9)} │`);

            if (v.openRate > bestRate) {
                bestRate = v.openRate;
                bestVariant = v.variant;
            }
        });

        console.log('  └─────────────────────────────────────────────────────┘');
        console.log('');
        if (bestVariant !== null) {
            console.log(`  🏆 Ganadora: Variante ${bestVariant} con ${bestRate}% de apertura`);
        }
        console.log('\n  💡 Tip: Continúa A/B testing con al menos 30-50 emails por variante.');
        console.log('═'.repeat(57) + '\n');
    });

// ─── 10. SCRAPE ──────────────────────────────────────────────────────────────
program
    .command('scrape')
    .description('Scrapea Google Maps con múltiples variantes del nicho (v3 – ultra-agresivo)')
    .requiredOption('-n, --niche <string>', 'Nicho (ej. "asesoria", "consultora")')
    .requiredOption('-l, --location <string>', 'Localización (ej. "Valencia")')
    .option('--limit <number>', 'Límite máximo de resultados', '300')
    .option('--no-variants', 'Desactivar variantes automáticas')
    .action(async (options) => {
        try {
            const limit = parseInt(options.limit, 10);
            const useVariants = options.variants !== false;
            const safeNiche = options.niche.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_');
            const safeLocation = options.location.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_');

            logger.info(`\n🚀 SCRAPER v3 – "${options.niche}" en "${options.location}"`);
            logger.info(`   Variantes: ${useVariants ? '✅' : '❌'} | Límite: ${limit}\n`);

            const { leads, reviewLeads } = await scrapeGoogleMapsMultiQuery(options.niche, options.location, limit, useVariants);
            const timestamp = new Date().toISOString().slice(0, 10);

            if (leads.length > 0) {
                const mainFile = `Leads_${safeNiche}_${safeLocation}_${timestamp}.csv`;
                writeScrapedLeadsToCSV(leads, mainFile);
                logger.info(`📨 Listo: npm run outreach:send -- --file "${mainFile}"`);
            }
            if (reviewLeads.length > 0) {
                writeReviewLeadsToCSV(reviewLeads, `Revisar_${safeNiche}_${safeLocation}_${timestamp}.csv`);
            }

            const total = leads.length + reviewLeads.length;
            const pctEmail = total > 0 ? Math.round((leads.length / total) * 100) : 0;
            console.log(`\n📊 RESUMEN: 🟢 ${leads.length} con email | 🟡 ${reviewLeads.length} sin email | 📌 ${pctEmail}% tasa\n`);

            await closeBrowser();
        } catch (error) {
            logger.error(`Error en scraping: ${error.message}`);
            await closeBrowser();
        }
    });

// ─── 11. SCRAPE SPAIN ────────────────────────────────────────────────────────
program
    .command('scrape-spain')
    .description('Scrapea todas las ciudades principales de España (God Mode)')
    .option('--limit <number>', 'Límite por ciudad y nicho', '40')
    .action(async (options) => {
        try {
            await scrapeAllSpain(parseInt(options.limit, 10));
        } catch (error) {
            logger.error(`Error en Scrape Spain: ${error.message}`);
        }
    });

// ─── 11b. SCRAPE SPAIN V2 ────────────────────────────────────────────────────
program
    .command('scrape-spain-v2')
    .description('Scrapea 20 nuevos sectores por toda España — sin solapamiento con los 18k existentes. Escribe a Spain_Leads_Nuevos.csv (se puede ejecutar en paralelo con send-all).')
    .option('--limit <number>', 'Límite por ciudad y nicho', '40')
    .action(async (options) => {
        try {
            await scrapeAllSpainV2(parseInt(options.limit, 10));
        } catch (error) {
            logger.error(`Error en Scrape Spain V2: ${error.message}`);
        }
    });

// ─── 12. SEND ALL ────────────────────────────────────────────────────────────
program
    .command('send-all')
    .description('Envía a todo All_Spain_Leads.csv automáticamente')
    .option('--dry-run', 'Modo simulado')
    .action(async (options) => {
        const file = 'All_Spain_Leads.csv';
        if (!fs.existsSync(file)) {
            logger.error(`No existe ${file}. Ejecuta scrape-spain primero.`);
            return;
        }
        logger.info('🚀 SEND ALL — archivo maestro de España...');
        await sendAction({ file, dryRun: options.dryRun });
    });

// ─── 12b. SEND NEW ───────────────────────────────────────────────────────────
program
    .command('send-new')
    .description('Envía a Spain_Leads_Nuevos.csv (leads de los 20 nuevos sectores). Ejecutar después de scrape-spain-v2.')
    .option('--dry-run', 'Modo simulado')
    .action(async (options) => {
        const file = 'Spain_Leads_Nuevos.csv';
        if (!fs.existsSync(file)) {
            logger.error(`No existe ${file}. Ejecuta scrape-spain-v2 primero.`);
            return;
        }
        logger.info('🚀 SEND NEW — nuevos sectores V2...');
        await sendAction({ file, dryRun: options.dryRun });
    });

// ─── 13. SCRAPE-AND-SEND ─────────────────────────────────────────────────────
program
    .command('scrape-and-send')
    .description('Scrapea un nicho y envía emails automáticamente en la misma sesión')
    .requiredOption('-n, --niche <string>', 'Nicho a buscar')
    .requiredOption('-l, --location <string>', 'Localización')
    .option('--limit <number>', 'Límite de leads a scrappear', '100')
    .option('--no-variants', 'Desactivar variantes')
    .option('--dry-run', 'Modo simulado')
    .action(async (options) => {
        const isDryRun = options.dryRun;
        const limit = parseInt(options.limit, 10);
        const useVariants = options.variants !== false;

        logger.info(`\n🤖 SCRAPE-AND-SEND: "${options.niche}" en "${options.location}" | Dry-run: ${!!isDryRun}\n`);

        try {
            logger.info('📡 FASE 1: Scrapeando leads...');
            const { leads: scrapedLeads, reviewLeads } = await scrapeGoogleMapsMultiQuery(
                options.niche, options.location, limit, useVariants
            );
            logger.info(`✅ ${scrapedLeads.length} con email | ${reviewLeads.length} sin email`);

            if (scrapedLeads.length === 0) {
                logger.warn('⚠️  Sin leads con email. Terminando.');
                await closeBrowser();
                return;
            }

            const timestamp = new Date().toISOString().slice(0, 10);
            const safeNiche = options.niche.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_');
            const safeLocation = options.location.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_');
            const mainFile = `Leads_${safeNiche}_${safeLocation}_${timestamp}.csv`;
            writeScrapedLeadsToCSV(scrapedLeads, mainFile);
            if (reviewLeads.length > 0) writeReviewLeadsToCSV(reviewLeads, `Revisar_${safeNiche}_${safeLocation}_${timestamp}.csv`);

            await closeBrowser();

            logger.info(`\n📧 FASE 2: Enviando a ${scrapedLeads.length} leads...`);
            await sendAction({ file: mainFile, dryRun: isDryRun });

        } catch (error) {
            logger.error(`Error en scrape-and-send: ${error.message}`);
            await closeBrowser();
        }
    });

// ─── 14. TRACKING SERVER ─────────────────────────────────────────────────────
program
    .command('tracking-server')
    .description('Arranca el servidor de tracking de aperturas y clics (puerto 3456)')
    .action(async () => {
        const { startTrackingServer } = await import('./tracking/server.js');
        startTrackingServer();
        logger.info('🛰️  Tracking server activo. Pulsa Ctrl+C para detener.');
    });

// ─── 15. CHECK BOUNCES ───────────────────────────────────────────────────────
program
    .command('check-bounces')
    .description('Lee el buzón IMAP y marca automáticamente los emails rebotados en la DB')
    .action(async () => {
        const db = getDB(getConfig().DB_PATH);
        logger.info('📫 Comprobando bounces en bandeja de entrada...');
        const result = await fetchAndProcessBounces(db);
        logger.info(`✅ Bounces: ${result.bounced} marcados de ${result.processed} emails procesados.`);
    });

// ─── 16. MARK BOUNCED (manual) ───────────────────────────────────────────────
program
    .command('mark-bounced')
    .description('Marca manualmente un email como BOUNCED (rebotado)')
    .requiredOption('-e, --email <string>', 'Email rebotado')
    .action((options) => {
        const db = getDB(getConfig().DB_PATH);
        const changes = markBounced(db, options.email);
        if (changes > 0) {
            logger.info(`✅ ${options.email} marcado como BOUNCED.`);
        } else {
            logger.warn(`⚠️  No encontrado: ${options.email}`);
        }
    });

program.parse(process.argv);

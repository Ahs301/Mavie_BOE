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
    incrementFollowupCount,
} from './db/index.js';
import { sendEmail, verifySMTP } from './email/sender.js';
import { sleep, HourlyRateLimiter, DailyWarmupLimiter } from './utils/throttle.js';
import { fetchEmailFromWebsite } from './utils/scraper.js';
import { verifyEmail, shouldSkipEmail } from './utils/emailVerifier.js';
import { scrapeGoogleMaps, scrapeGoogleMapsMultiQuery } from './scraper/google.js';
import { scrapeAmarillasMultiQuery } from './scraper/amarillas.js';
import { scrapeBorme, scrapeBormeByQuery } from './scraper/borme.js';
import { scrapeBdns } from './scraper/bdns.js';
import { scrapeBingMultiQuery } from './scraper/bing.js';
import { enrichLeadsWithHunter } from './utils/hunterEnrich.js';
import { enrichLeadsWithDecisionMaker } from './utils/decisionMaker.js';
import { scrapeAllSpain, scrapeAllSpainV2 } from './scraper/bulk_spain.js';
import { writeScrapedLeadsToCSV, writeReviewLeadsToCSV } from './csv/writer.js';
import { closeBrowser, isGenericEmail, isPersonalEmail } from './utils/scraper.js';
import { scrapeTodo } from './scraper/todo.js';
import { buildPixelUrl, buildClickUrl, buildUnsubscribeUrl } from './tracking/pixel.js';
import { fetchAndProcessBounces, fetchAndProcessReplies } from './email/bounce_handler.js';
import {
    isBlacklisted, addToBlacklistEmail, addToBlacklistDomain,
    removeFromBlacklistEmail, removeFromBlacklistDomain, getBlacklist,
} from './db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── ADJUNTO PDF ──────────────────────────────────────────────────────────────
// El PDF NO va en el email inicial — dispara filtros antispam y parece newsletter.
// Solo se adjunta en follow-ups (cuando ya hay contexto previo).
const PDF_PATH = path.resolve('BOE Radar Inteligente.pdf');
const PDF_ATTACHMENT = fs.existsSync(PDF_PATH) ? [{ filename: 'BOE Radar Inteligente.pdf', path: PDF_PATH }] : [];

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
    const skipVerify = options.skipVerify || process.env.DISABLE_EMAIL_VERIFY === 'true';
    logger.info(`🚀 CAMPAÑA: ${options.file} (Dry-run: ${!!isDryRun})`);

    const config = getConfig();
    const db = getDB(config.DB_PATH);

    if (!isDryRun && !(await verifySMTP())) {
        logger.error('No se puede iniciar el envío: Fallo SMTP.');
        process.exit(1);
    }

    let { SEND_DELAY_MS, MAX_PER_HOUR, MAX_PER_DAY, DOMAIN_SETUP_DATE, ENABLE_WARMUP } = config;
    if (options.fastMode) {
      SEND_DELAY_MS = 10000;
      MAX_PER_HOUR = 60;
      MAX_PER_DAY = 300;
    }
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

        if (lead.website) {
            const hasGenericEmail = lead.email && isGenericEmail(lead.email);
            if (!lead.email || hasGenericEmail) {
                const label = hasGenericEmail ? `mejorando email genérico ${lead.email}` : `buscando email`;
                logger.info(`🔍 ${label} para ${lead.name || lead.website}...`);
                const result = await fetchEmailFromWebsite(lead.website);
                if (result?.email) {
                    if (!hasGenericEmail || isPersonalEmail(result.email)) {
                        lead.email = result.email;
                        logger.info(`✅ Email encontrado: ${result.email}`);
                    } else {
                        logger.info(`ℹ️ Solo se encontró genérico: ${result.email}, manteniendo original: ${lead.email}`);
                    }
                } else if (!hasGenericEmail) {
                    logger.warn(`❌ Sin email en ${lead.website}`);
                } else {
                    logger.info(`ℹ️ No se encontró mejor email para ${lead.website}, usando ${lead.email}`);
                }
            }
        }

        if (!isValidEmail(lead.email)) { skipped++; continue; }

        const exists = leadExists(db, lead);
        if (exists) {
            logger.info(`Duplicado (${exists.reason}): ${lead.email}`);
            skipped++;
            continue;
        }

        // ─── Blacklist check ──────────────────────────────────────────────────
        const domain = lead.email ? lead.email.split('@')[1] : null;
        const blacklisted = isBlacklisted(db, lead.email, domain);
        if (blacklisted) {
            logger.info(`🚫 Blacklist (${blacklisted.reason}): ${lead.email}`);
            skipped++;
            continue;
        }

        // ─── Verificación email (MX + SMTP) ──────────────────────────────────
        if (!skipVerify && !isDryRun) {
            const v = await verifyEmail(lead.email);
            if (shouldSkipEmail(v)) {
                logger.info(`🚫 Email inválido: ${lead.email} — ${v.reason}`);
                skipped++;
                continue;
            }
            if (v.result === 'risky') {
                logger.warn(`⚠️  ${lead.email}: SMTP no verificable (${v.reason}) — enviando igualmente`);
            } else if (v.result !== 'valid') {
                logger.debug(`ℹ️  ${lead.email}: ${v.result} — ${v.reason}`);
            }
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
            const calUrl = config.CALENDLY_URL || `https://wa.me/34633448806`;
            const trackingPixelUrl = buildPixelUrl(leadId);
            const unsubscribeUrl = buildUnsubscribeUrl(leadId);
            const ctaLink = buildClickUrl(leadId, calUrl);

            // Sin adjunto en primer contacto: PDF en email inicial = señal spam
            const result = await sendEmail(fullLead.email, subject, body, [], {
                trackingPixelUrl, unsubscribeUrl, ctaLink,
            });

            const now = new Date().toISOString();
            updateLeadStatus(db, leadId, 'SENT', { sentAt: now, messageId: result.messageId, lastSubject: subject });
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
    .option('--skip-verify', 'Omitir verificación SMTP (más rápido, mayor riesgo de bounces)')
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
        const pending = getLeadsForFollowup(db, days, 3);

        logger.info(`🚀 FOLLOW-UP (>${days} días, <3 FUs) para ${pending.length} leads`);
        let sent = 0, errors = 0;

        for (const lead of pending) {
            // 🛑 Límite diario estricto (Brevo)
            if (sent >= MAX_PER_DAY) {
                logger.warn(`🛑 LÍMITE DIARIO ALCANZADO: ${MAX_PER_DAY} follow-ups hoy. Deteniendo ejecución.`);
                break;
            }

            await rateLimiter.waitIfNeeded();
            const fuNumber = (lead.followup_count || 0) + 1;
            const { subject, body } = generateFollowUpEmail(lead, fuNumber);

            // Obtener message_id del email original para threading
            const originalMessageId = getLeadMessageId(db, lead.id);
            const trackingPixelUrl = buildPixelUrl(lead.id);
            const unsubscribeUrl = buildUnsubscribeUrl(lead.id);
            const calUrl = getConfig().CALENDLY_URL || `https://wa.me/34633448806`;
            const ctaLink = buildClickUrl(lead.id, calUrl);

            try {
                const result = await sendEmail(lead.email, subject, body, PDF_ATTACHMENT, {
                    trackingPixelUrl, unsubscribeUrl, ctaLink,
                    inReplyTo: originalMessageId || undefined,
                    references: originalMessageId || undefined,
                });

                insertSend(db, { leadId: lead.id, kind: 'FOLLOWUP', subject, body, status: 'SENT', messageId: result.messageId });
                incrementFollowupCount(db, lead.id, subject);
                rateLimiter.record();
                sent++;
                logger.info(`📧 FU${fuNumber} a ${lead.email} (en hilo). Esperando ${SEND_DELAY_MS / 1000}s...`);
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

// ─── 10b. SCRAPE AMARILLAS ───────────────────────────────────────────────────
program
    .command('scrape-amarillas')
    .description('Scrapea Páginas Amarillas (sin Puppeteer) — complementa Google Maps con empresas distintas')
    .requiredOption('-n, --niche <string>', 'Nicho (ej. "asesoría")')
    .requiredOption('-l, --location <string>', 'Localización (ej. "Madrid")')
    .option('--limit <number>', 'Límite de leads con email', '200')
    .option('--no-variants', 'Desactivar variantes de búsqueda')
    .action(async (options) => {
        try {
            const limit = parseInt(options.limit, 10);
            const useVariants = options.variants !== false;
            const safeNiche    = options.niche.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_');
            const safeLocation = options.location.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_');

            logger.info(`\n🟡 SCRAPER AMARILLAS — "${options.niche}" en "${options.location}" (variantes: ${useVariants ? '✅' : '❌'})\n`);

            const { leads, reviewLeads } = await scrapeAmarillasMultiQuery(
                options.niche, options.location, limit
            );

            const timestamp = new Date().toISOString().slice(0, 10);

            if (leads.length > 0) {
                const mainFile = `Amarillas_${safeNiche}_${safeLocation}_${timestamp}.csv`;
                writeScrapedLeadsToCSV(leads, mainFile);
                logger.info(`📨 Listo: node src/cli.js send --file "${mainFile}"`);
            }
            if (reviewLeads.length > 0) {
                writeReviewLeadsToCSV(reviewLeads, `Revisar_Amarillas_${safeNiche}_${safeLocation}_${timestamp}.csv`);
            }

            const total = leads.length + reviewLeads.length;
            const pctEmail = total > 0 ? Math.round((leads.length / total) * 100) : 0;
            console.log(`\n📊 AMARILLAS: 🟢 ${leads.length} con email | 🟡 ${reviewLeads.length} sin email | 📌 ${pctEmail}% tasa\n`);
        } catch (err) {
            logger.error(`Error en scrape-amarillas: ${err.message}`);
        }
    });

// ─── 10c. SCRAPE DUAL (Google Maps + Amarillas en paralelo) ──────────────────
program
    .command('scrape-dual')
    .description('Scrapea Google Maps Y Páginas Amarillas en paralelo — máxima cobertura de empresas')
    .requiredOption('-n, --niche <string>', 'Nicho')
    .requiredOption('-l, --location <string>', 'Localización')
    .option('--limit <number>', 'Límite por fuente', '150')
    .action(async (options) => {
        try {
            const limit = parseInt(options.limit, 10);
            const safeNiche    = options.niche.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_');
            const safeLocation = options.location.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_');
            const timestamp    = new Date().toISOString().slice(0, 10);

            logger.info(`\n⚡ SCRAPE DUAL — "${options.niche}" en "${options.location}" (${limit} por fuente)\n`);

            // Ejecutar ambos scrapers en paralelo
            const [gmaps, amarillas] = await Promise.all([
                scrapeGoogleMapsMultiQuery(options.niche, options.location, limit, true),
                scrapeAmarillasMultiQuery(options.niche, options.location, limit),
            ]);

            // Fusionar y deduplicar por email (o nombre+teléfono)
            const emailSeen  = new Set();
            const keySeen    = new Set();
            const combined   = [];
            const combined_r = [];

            for (const lead of [...gmaps.leads, ...amarillas.leads]) {
                const dedupeKey = lead.email
                    ? lead.email.toLowerCase()
                    : `${(lead.name || '').toLowerCase()}|${(lead.phone || '').replace(/\s/g, '')}`;
                if (!emailSeen.has(dedupeKey)) {
                    emailSeen.add(dedupeKey);
                    combined.push(lead);
                }
            }
            for (const lead of [...gmaps.reviewLeads, ...amarillas.reviewLeads]) {
                const key = `${(lead.name || '').toLowerCase()}|${(lead.phone || '').replace(/\s/g, '')}`;
                if (!keySeen.has(key)) {
                    keySeen.add(key);
                    combined_r.push(lead);
                }
            }

            if (combined.length > 0) {
                const mainFile = `Dual_${safeNiche}_${safeLocation}_${timestamp}.csv`;
                writeScrapedLeadsToCSV(combined, mainFile);
                logger.info(`📨 Listo: node src/cli.js send --file "${mainFile}"`);
            }
            if (combined_r.length > 0) {
                writeReviewLeadsToCSV(combined_r, `Revisar_Dual_${safeNiche}_${safeLocation}_${timestamp}.csv`);
            }

            await closeBrowser();
            console.log(`\n📊 DUAL TOTAL:`);
            console.log(`   Google Maps : 🟢 ${gmaps.leads.length} con email | 🟡 ${gmaps.reviewLeads.length} sin email`);
            console.log(`   Amarillas   : 🟢 ${amarillas.leads.length} con email | 🟡 ${amarillas.reviewLeads.length} sin email`);
            console.log(`   COMBINADO   : 🟢 ${combined.length} únicos con email (+${combined.length - gmaps.leads.length} extra de Amarillas)\n`);
        } catch (err) {
            logger.error(`Error en scrape-dual: ${err.message}`);
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

// ─── 15b. CHECK REPLIES ──────────────────────────────────────────────────────
program
    .command('check-replies')
    .description('Lee la bandeja IMAP y marca automáticamente los leads que han respondido (REPLIED)')
    .action(async () => {
        const db = getDB(getConfig().DB_PATH);
        logger.info('💬 Buscando replies en bandeja de entrada...');
        const result = await fetchAndProcessReplies(db);
        logger.info(`✅ Replies: ${result.replied} nuevos marcados de ${result.processed} emails revisados.`);
    });

// ─── 16. SEND TODO (Scraper Total leads) ─────────────────────────────────────
program
    .command('send-todo')
    .description('Envía los leads del Scraper Total (Todo_Leads.csv)')
    .option('--dry-run', 'Modo simulado')
    .option('--fast', 'Modo rápido: 10s entre emails, 60/hora (para batch diario)')
    .action(async (options) => {
        const file = 'Todo_Leads.csv';
        if (!fs.existsSync(file)) {
            logger.error(`No existe ${file}. Ejecuta scrape-todo primero.`);
            return;
        }
        logger.info('🚀 SEND TODO — leads del Scraper Total...');
        const opts = { file, dryRun: options.dryRun };
        if (options.fast) {
            opts.fastMode = true;
            logger.info('⚡ Modo rápido activado — 10s entre emails, 60/hora');
        }
        await sendAction(opts);
    });

// ─── 17. MARK BOUNCED (manual) ───────────────────────────────────────────────
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

// ─── 17. SCRAPE TODO (una ejecución) ─────────────────────────────────────────
program
    .command('scrape-todo')
    .description('Scrapea TODAS las combinaciones nicho×ubicación (150k+) — 1 ciclo')
    .option('--limit <number>', 'Límite de leads por combo', '40')
    .action(async (options) => {
        try {
            await scrapeTodo({ limitPerCombo: parseInt(options.limit, 10), infiniteLoop: false });
        } catch (error) {
            logger.error(`Error en scrape-todo: ${error.message}`);
            await closeBrowser();
        }
    });

// ─── 18. SCRAPE TODO + SEND (una ejecución secuencial) ───────────────────────
program
    .command('scrape-todo-send')
    .description('Scrapea TODO en 1 ciclo + envía los leads encontrados automáticamente')
    .option('--limit <number>', 'Límite de leads por combo', '40')
    .action(async (options) => {
        logger.info('🤖 SCRAPE-TODO-SEND: scrapea 1 ciclo, luego envía los leads.');
        try {
            await scrapeTodo({ limitPerCombo: parseInt(options.limit, 10), infiniteLoop: false });
            const file = 'Todo_Leads.csv';
            if (fs.existsSync(file)) {
                logger.info('\n📧 FASE 2: Enviando leads del Scraper Total...');
                await sendAction({ file, dryRun: false });
            }
        } catch (error) {
            logger.error(`Error: ${error.message}`);
            await closeBrowser();
        }
    });

// ─── 19. SCRAPE TODO INFINITO ────────────────────────────────────────────────
program
    .command('scrape-todo-start')
    .description('Scrapea TODO en bucle infinito — cuando termina un ciclo, arranca otro')
    .option('--limit <number>', 'Límite de leads por combo', '40')
    .action(async (options) => {
        logger.info('♻️  SCRAPE TODO INFINITO — bucle sin fin hasta Ctrl+C o SIGTERM');
        try {
            await scrapeTodo({ limitPerCombo: parseInt(options.limit, 10), infiniteLoop: true });
        } catch (error) {
            logger.error(`Error en scrape-todo infinito: ${error.message}`);
            await closeBrowser();
        }
    });

// ─── 20. SCRAPE BORME ────────────────────────────────────────────────────────
program
    .command('scrape-borme')
    .description('Scrapea BORME (Registro Mercantil): nuevas empresas + nombre del administrador')
    .option('--days <number>', 'Días hábiles atrás a mirar', '0')
    .option('--limit <number>', 'Máximo de empresas', '200')
    .option('--query <text>', 'Buscar por texto en nombre/sector (en lugar de por fecha)')
    .option('--hunter', 'Enriquecer emails con Hunter.io (gasta cuota del plan gratis)')
    .option('--decision-maker', 'Buscar decisor en la web de cada empresa (lento)')
    .action(async (options) => {
        try {
            const maxLeads = parseInt(options.limit, 10);
            const days = parseInt(options.days, 10);
            const timestamp = new Date().toISOString().slice(0, 10);

            let leads;
            if (options.query) {
                logger.info(`\n📋 BORME búsqueda: "${options.query}"\n`);
                leads = await scrapeBormeByQuery(options.query, maxLeads);
            } else {
                logger.info(`\n📋 BORME: últimos ${days} días hábiles\n`);
                leads = await scrapeBorme({ days, maxLeads });
            }

            if (leads.length === 0) {
                logger.warn('BORME: sin resultados');
                return;
            }

            // Enriquecer con Hunter.io si se pide
            if (options.hunter) {
                logger.info('🎯 Enriqueciendo con Hunter.io...');
                leads = await enrichLeadsWithHunter(leads);
            }

            // Buscar decisor en web si se pide
            if (options.decisionMaker) {
                logger.info('👤 Buscando decisores en webs...');
                leads = await enrichLeadsWithDecisionMaker(leads);
            }

            const leadsWithEmail = leads.filter(l => l.email);
            const leadsToReview = leads.filter(l => !l.email);

            if (leadsWithEmail.length > 0) {
                const file = `BORME_${timestamp}.csv`;
                writeScrapedLeadsToCSV(leadsWithEmail, file);
                logger.info(`📨 Listo: node src/cli.js send --file "${file}"`);
            }
            if (leadsToReview.length > 0) {
                writeReviewLeadsToCSV(leadsToReview, `Revisar_BORME_${timestamp}.csv`);
            }

            const contactosConocidos = leads.filter(l => l.contact_name).length;
            console.log(`\n📊 BORME:`);
            console.log(`   🟢 ${leadsWithEmail.length} con email`);
            console.log(`   🟡 ${leadsToReview.length} sin email (revisar manualmente)`);
            console.log(`   👤 ${contactosConocidos} con nombre de administrador\n`);
        } catch (err) {
            logger.error(`Error en scrape-borme: ${err.message}`);
        }
    });

// ─── 21. SCRAPE BING ─────────────────────────────────────────────────────────
program
    .command('scrape-bing')
    .description('Scrapea Bing Maps Local Search — complementa Google Maps sin captchas (requiere BING_MAPS_KEY)')
    .requiredOption('-n, --niche <string>', 'Nicho (ej. "asesoría")')
    .requiredOption('-l, --location <string>', 'Localización (ej. "Madrid")')
    .option('--limit <number>', 'Límite de leads con email', '150')
    .action(async (options) => {
        try {
            const limit = parseInt(options.limit, 10);
            const safeNiche = options.niche.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_');
            const safeLocation = options.location.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_');
            const timestamp = new Date().toISOString().slice(0, 10);

            logger.info(`\n🔵 SCRAPER BING — "${options.niche}" en "${options.location}"\n`);

            const { leads, reviewLeads } = await scrapeBingMultiQuery(options.niche, options.location, limit);

            if (leads.length > 0) {
                const file = `Bing_${safeNiche}_${safeLocation}_${timestamp}.csv`;
                writeScrapedLeadsToCSV(leads, file);
                logger.info(`📨 Listo: node src/cli.js send --file "${file}"`);
            }
            if (reviewLeads.length > 0) {
                writeReviewLeadsToCSV(reviewLeads, `Revisar_Bing_${safeNiche}_${safeLocation}_${timestamp}.csv`);
            }

            const total = leads.length + reviewLeads.length;
            const pct = total > 0 ? Math.round((leads.length / total) * 100) : 0;
            console.log(`\n📊 BING: 🟢 ${leads.length} con email | 🟡 ${reviewLeads.length} sin email | 📌 ${pct}% tasa\n`);
        } catch (err) {
            logger.error(`Error en scrape-bing: ${err.message}`);
        }
    });

// ─── 22. SCRAPE BDNS ─────────────────────────────────────────────────────────
program
    .command('scrape-bdns')
    .description('Scrapea BDNS (Base Datos Nacional Subvenciones) — leads calientes que ya gestionan ayudas')
    .requiredOption('-q, --query <string>', 'Término de búsqueda (ej. "asesoría subvenciones")')
    .option('--limit <number>', 'Máximo de leads', '100')
    .option('--mode <mode>', 'beneficiarios | convocatorias | both', 'beneficiarios')
    .option('--hunter', 'Enriquecer emails con Hunter.io')
    .action(async (options) => {
        try {
            const maxLeads = parseInt(options.limit, 10);
            const timestamp = new Date().toISOString().slice(0, 10);

            logger.info(`\n📋 BDNS: "${options.query}" (modo: ${options.mode})\n`);

            let leads = await scrapeBdns(options.query, { maxLeads, mode: options.mode });

            if (leads.length === 0) {
                logger.warn('BDNS: sin resultados');
                return;
            }

            if (options.hunter) {
                logger.info('🎯 Enriqueciendo con Hunter.io...');
                leads = await enrichLeadsWithHunter(leads);
            }

            const leadsWithEmail = leads.filter(l => l.email);
            const leadsToReview = leads.filter(l => !l.email);
            const safeQuery = options.query.replace(/[^a-z0-9à-üÀ-Ü ]/gi, '_').replace(/\s+/g, '_').slice(0, 20);

            if (leadsWithEmail.length > 0) {
                const file = `BDNS_${safeQuery}_${timestamp}.csv`;
                writeScrapedLeadsToCSV(leadsWithEmail, file);
                logger.info(`📨 Listo: node src/cli.js send --file "${file}"`);
            }
            if (leadsToReview.length > 0) {
                writeReviewLeadsToCSV(leadsToReview, `Revisar_BDNS_${safeQuery}_${timestamp}.csv`);
            }

            console.log(`\n📊 BDNS: 🟢 ${leadsWithEmail.length} con email | 🟡 ${leadsToReview.length} sin email\n`);
        } catch (err) {
            logger.error(`Error en scrape-bdns: ${err.message}`);
        }
    });

// ─── 23. BLACKLIST ───────────────────────────────────────────────────────────
program
    .command('blacklist-add')
    .description('Añade un email a la blacklist (nunca se le enviará más nada)')
    .requiredOption('-e, --email <string>', 'Email a blacklistear')
    .option('-r, --reason <string>', 'Motivo', 'manual')
    .action((options) => {
        const db = getDB(getConfig().DB_PATH);
        addToBlacklistEmail(db, options.email, options.reason);
        logger.info(`✅ ${options.email} añadido a blacklist_emails`);
    });

program
    .command('blacklist-domain')
    .description('Añade un dominio completo a la blacklist (nadie de ese dominio recibirá emails)')
    .requiredOption('-d, --domain <string>', 'Dominio a blacklistear (ej. empresa.com)')
    .option('-r, --reason <string>', 'Motivo', 'manual')
    .action((options) => {
        const db = getDB(getConfig().DB_PATH);
        addToBlacklistDomain(db, options.domain, options.reason);
        logger.info(`✅ ${options.domain} añadido a blacklist_domains`);
    });

program
    .command('blacklist-remove')
    .description('Elimina un email de la blacklist')
    .requiredOption('-e, --email <string>', 'Email a eliminar de la blacklist')
    .action((options) => {
        const db = getDB(getConfig().DB_PATH);
        const changes = removeFromBlacklistEmail(db, options.email);
        if (changes > 0) logger.info(`✅ ${options.email} eliminado de blacklist`);
        else logger.warn(`⚠️  No encontrado: ${options.email}`);
    });

program
    .command('blacklist-list')
    .description('Muestra todos los emails y dominios en blacklist')
    .action(() => {
        const db = getDB(getConfig().DB_PATH);
        const { emails, domains } = getBlacklist(db);

        console.log(`\n🚫 BLACKLIST`);
        console.log(`${'='.repeat(55)}`);
        console.log(`\n📧 Emails bloqueados: ${emails.length}`);
        emails.forEach(e => console.log(`  • ${e.email} — ${e.reason || 'sin motivo'}`));
        console.log(`\n🌐 Dominios bloqueados: ${domains.length}`);
        domains.forEach(d => console.log(`  • ${d.domain} — ${d.reason || 'sin motivo'}`));
        console.log('');
    });

program.parse(process.argv);

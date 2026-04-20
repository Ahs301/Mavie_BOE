'use strict';

const { supabase } = require('../config/supabase');
const { BoeScraper } = require('./BoeScraper');
const { filterItems } = require('../services/filter');
const { initEmailService, sendDigest } = require('../services/email');

/**
 * Flujo completo del Radar BOE multi-tenant.
 *
 * 1. Inicializa email (SMTP)
 * 2. Fetch BOE (una sola llamada, resultado compartido)
 * 3. Para cada cliente activo: filtra por sus keywords → envía email → registra logs
 */
async function runWorker() {
  const startedAt = new Date().toISOString();
  console.log(`\n=== Radar BOE Worker — ${startedAt} ===`);

  // --- 1. Init email ---
  try {
    initEmailService();
  } catch (err) {
    console.error('[Worker] SMTP no configurado:', err.message);
    console.error('[Worker] Revisa SMTP_HOST / SMTP_USER / SMTP_PASS en .env');
    process.exit(1);
  }

  // --- 2. Fetch BOE (una vez para todos los clientes) ---
  const scraper = new BoeScraper();
  const allItems = await scraper.fetchItems();

  if (allItems.length === 0) {
    console.log('[Worker] Sin items BOE hoy. Finalizando.');
    await logExecution({ startedAt, status: 'success', totalClients: 0 });
    return;
  }

  // --- 3. Obtener clientes activos con config BOE ---
  const { data: configs, error: configError } = await supabase
    .from('client_boe_configs')
    .select(`
      id, client_id, frequency, destination_emails,
      keywords_positive, keywords_negative, regions,
      clients ( id, company_name, contact_name, status )
    `)
    .eq('is_active', true);

  if (configError) {
    console.error('[Worker] Error leyendo client_boe_configs:', configError.message);
    await logExecution({ startedAt, status: 'error', totalClients: 0 });
    return;
  }

  const activeConfigs = (configs || []).filter(c => c.clients?.status === 'activo');
  console.log(`[Worker] ${activeConfigs.length} clientes activos para procesar`);

  let processedCount = 0;

  for (const config of activeConfigs) {
    const clientName = config.clients.company_name;
    console.log(`\n[Worker] Procesando cliente: ${clientName}`);

    try {
      await processClient(config, allItems);
      processedCount++;
    } catch (err) {
      console.error(`[Worker] Error procesando ${clientName}:`, err.message);
      await logIncident(config.client_id, err);
    }
  }

  await logExecution({ startedAt, status: 'success', totalClients: processedCount });
  console.log(`\n=== Ciclo finalizado. ${processedCount}/${activeConfigs.length} clientes procesados ===`);
}

/**
 * Procesa un cliente: filtra → envía email → guarda historial
 */
async function processClient(config, allItems) {
  const clientId = config.client_id;
  const clientName = config.clients.company_name;

  // Filter por keywords del cliente
  const matched = filterItems(
    allItems,
    config.keywords_positive,
    config.keywords_negative
  );

  console.log(`[${clientName}] ${matched.length} items coinciden`);

  if (matched.length === 0) {
    console.log(`[${clientName}] Sin matches, skip email`);
    return;
  }

  // Enviar email
  const sent = await sendDigest(config, matched);

  // Guardar historial de matches en boe_match_history
  const matchRows = matched.map(item => ({
    client_id: clientId,
    opportunity_title: item.title,
    opportunity_url: item.url || null,
    publication_date: formatDate(item.publication_date),
    source: 'BOE',
  }));

  const { error: historyError } = await supabase
    .from('boe_match_history')
    .insert(matchRows);

  if (historyError) {
    console.warn(`[${clientName}] Error guardando boe_match_history:`, historyError.message);
  }

  // Registrar email log
  const { error: logError } = await supabase
    .from('client_email_logs')
    .insert({
      client_id: clientId,
      subject: `Radar BOE — ${matched.length} oportunidad${matched.length !== 1 ? 'es' : ''}`,
      sent_to: config.destination_emails,
      module: 'boe_radar',
      status: sent ? 'sent' : 'error',
      sent_at: new Date().toISOString(),
    });

  if (logError) {
    console.warn(`[${clientName}] Error guardando client_email_logs:`, logError.message);
  }
}

async function logExecution({ startedAt, status, totalClients }) {
  const { error } = await supabase
    .from('execution_logs')
    .insert({
      worker_name: 'boe_radar',
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      status,
      total_processed_clients: totalClients,
    });
  if (error) console.warn('[Worker] Error guardando execution_log:', error.message);
}

async function logIncident(clientId, err) {
  const { error } = await supabase
    .from('incidents')
    .insert({
      client_id: clientId,
      module: 'boe_radar',
      incident_type: 'worker_error',
      description: err.message,
      full_error_stack: err.stack,
      status: 'open',
    });
  if (error) console.warn('[Worker] Error guardando incident:', error.message);
}

// Convierte YYYYMMDD → YYYY-MM-DD para Postgres DATE
function formatDate(dateStr) {
  if (!dateStr) return null;
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return dateStr;
}

module.exports = { runWorker };

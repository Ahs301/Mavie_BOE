// src/server.js — HTTP wrapper para VPS/PM2
// Puerto 3002 (BOE-Worker usa 3001). Protegido con CRON_SECRET.

import 'dotenv/config';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getDB } from './db/index.js';
import { getSmtpStats } from './email/sender.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, 'cli.js');

const PORT = parseInt(process.env.PORT || '3002', 10);
const CRON_SECRET = process.env.CRON_SECRET;

// Supabase client — solo si están las vars configuradas
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('[Supabase] Cliente inicializado');
} else {
  console.warn('[Supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no configuradas — stats no se sincronizarán');
}

function checkAuth(req) {
  const auth = req.headers['authorization'];
  return Boolean(CRON_SECRET && auth === `Bearer ${CRON_SECRET}`);
}

function getStats() {
  const db = getDB();
  const row = (sql) => db.prepare(sql).get();
  return {
    total:   row("SELECT COUNT(*) as n FROM leads").n,
    pending: row("SELECT COUNT(*) as n FROM leads WHERE status='PENDING'").n,
    sent:    row("SELECT COUNT(*) as n FROM leads WHERE status='SENT'").n,
    replied: row("SELECT COUNT(*) as n FROM leads WHERE status='REPLIED'").n,
    bounced: row("SELECT COUNT(*) as n FROM leads WHERE status='BOUNCED'").n,
    opened:  row("SELECT COUNT(*) as n FROM leads WHERE open_count > 0").n,
    clicked: row("SELECT COUNT(*) as n FROM leads WHERE click_count > 0").n,
  };
}

async function syncCampaignToSupabase(campaignId, exitCode, statsBefore) {
  if (!supabase || !campaignId) return;
  try {
    const statsAfter = getStats();
    const leadsFound = Math.max(0, statsAfter.total - (statsBefore?.total ?? statsAfter.total));
    const emailsSent = Math.max(0, statsAfter.sent - (statsBefore?.sent ?? statsAfter.sent));
    const status = exitCode === 0 ? 'completed' : 'error';

    const { error } = await supabase
      .from('outreach_campaigns')
      .update({ status, total_leads_found: leadsFound, emails_sent: emailsSent })
      .eq('id', campaignId);

    if (error) {
      console.error(`[Supabase] Error actualizando campaña ${campaignId}:`, error.message);
    } else {
      console.log(`[Supabase] Campaña ${campaignId} → status=${status}, leads=${leadsFound}, sent=${emailsSent}`);
    }
  } catch (err) {
    console.error('[Supabase] syncCampaignToSupabase falló:', err.message);
  }
}

function spawnCLI(args, campaignId = null) {
  console.log(`[Captacion] Spawning: node cli.js ${args.join(' ')}`);
  let statsBefore = null;
  try { statsBefore = getStats(); } catch (_) {}

  const child = spawn('node', [CLI_PATH, ...args], {
    cwd: path.resolve(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });
  child.stdout.on('data', d => process.stdout.write(`[CLI] ${d}`));
  child.stderr.on('data', d => process.stderr.write(`[CLI] error: ${d}`));
  child.on('exit', async (code) => {
    console.log(`[CLI] Salió con código ${code}`);
    if (campaignId) await syncCampaignToSupabase(campaignId, code, statsBefore);
  });
}

const server = createServer((req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  if (req.method === 'GET' && req.url === '/health') {
    return send(200, { ok: true });
  }

  if (!checkAuth(req)) {
    return send(401, { error: 'Unauthorized' });
  }

  if (req.method === 'POST' && req.url === '/trigger/send') {
    send(202, { ok: true, message: 'Campaña de envío iniciada' });
    spawnCLI(['send-all']);
    return;
  }

  if (req.method === 'POST' && req.url === '/trigger/followup') {
    send(202, { ok: true, message: 'Follow-up iniciado (días >= 4)' });
    spawnCLI(['followup-send', '--days', '4']);
    return;
  }

  if (req.method === 'POST' && req.url === '/trigger/scrape') {
    send(202, { ok: true, message: 'Scraping España iniciado (puede tardar horas)' });
    spawnCLI(['scrape-spain', '--limit', '500']);
    return;
  }

  if (req.method === 'POST' && req.url === '/trigger/custom-campaign') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.niche || !payload.location) {
          return send(400, { error: 'Faltan parámetros: niche y location' });
        }
        send(202, { ok: true, message: `Campaña iniciada: ${payload.niche} en ${payload.location}` });
        const limitStr = payload.limit ? payload.limit.toString() : '50';
        spawnCLI(['scrape-and-send', '-n', payload.niche, '-l', payload.location, '--limit', limitStr], payload.campaign_id ?? null);
      } catch (err) {
        send(400, { error: 'Invalid JSON body' });
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/stats') {
    try {
      return send(200, { ok: true, stats: getStats() });
    } catch (err) {
      return send(500, { error: err.message });
    }
  }

  if (req.method === 'GET' && req.url === '/stats/smtp') {
    try {
      const smtp = getSmtpStats();
      return send(200, { ok: true, smtp, totalRemaining: smtp.reduce((acc, p) => acc + p.remaining, 0) });
    } catch (err) {
      return send(500, { error: err.message });
    }
  }

  send(404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`[Captacion Server] Puerto ${PORT} — listo en la vps`);
  if (!CRON_SECRET) console.warn('[Captacion Server] ADVERTENCIA: CRON_SECRET no configurado');
});

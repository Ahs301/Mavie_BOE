// src/server.js — HTTP wrapper para VPS/PM2
// Puerto 3002 (BOE-Worker usa 3001). Protegido con CRON_SECRET.

import 'dotenv/config';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { getDB } from './db/index.js';
import { getSmtpStats } from './email/sender.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, 'cli.js');
const ENV_PATH = path.resolve(__dirname, '..', '.env');

const PORT = parseInt(process.env.PORT || '3002', 10);
const CRON_SECRET = process.env.CAPTACION_CRON_SECRET || process.env.CRON_SECRET;

// ─── Supabase ─────────────────────────────────────────────────────────────────
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('[Supabase] Cliente inicializado');
} else {
  console.warn('[Supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no configuradas');
}

// ─── Process registry + Log buffer ───────────────────────────────────────────
const procs = { scrape: null, send: null };
const logBuffer = []; // { ts, source, line }

function addLog(source, text) {
  for (const line of text.toString().split('\n')) {
    if (!line.trim()) continue;
    logBuffer.push({ ts: Date.now(), source, line: line.trim() });
  }
  if (logBuffer.length > 500) logBuffer.splice(0, logBuffer.length - 500);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function checkAuth(req) {
  const auth = req.headers['authorization'];
  return Boolean(CRON_SECRET && auth === `Bearer ${CRON_SECRET}`);
}

// ─── Stats ────────────────────────────────────────────────────────────────────
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

// ─── .env helpers ─────────────────────────────────────────────────────────────
const EDITABLE_KEYS = ['MAX_PER_DAY', 'MAX_PER_HOUR', 'SEND_DELAY_MS', 'ENABLE_WARMUP', 'FROM_NAME', 'FROM_EMAIL'];

function readEnvConfig() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const result = {};
  for (const line of fs.readFileSync(ENV_PATH, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && EDITABLE_KEYS.includes(m[1])) result[m[1]] = m[2];
  }
  return result;
}

function writeEnvConfig(updates) {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';
  for (const [key, value] of Object.entries(updates)) {
    if (!EDITABLE_KEYS.includes(key)) continue;
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(content)) {
      content = content.replace(re, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
    // También actualiza process.env para que los nuevos spawns hereden el valor
    process.env[key] = value;
  }
  fs.writeFileSync(ENV_PATH, content);
}

// ─── Supabase sync helpers ─────────────────────────────────────────────────────
async function syncProgressToSupabase(campaignId, statsBefore) {
  if (!supabase || !campaignId) return;
  try {
    const now = getStats();
    const leadsFound  = Math.max(0, now.total   - (statsBefore?.total   ?? now.total));
    const emailsSent  = Math.max(0, now.sent     - (statsBefore?.sent    ?? now.sent));
    const emailsOpen  = Math.max(0, now.opened   - (statsBefore?.opened  ?? now.opened));
    const emailsClick = Math.max(0, now.clicked  - (statsBefore?.clicked ?? now.clicked));
    await supabase
      .from('outreach_campaigns')
      .update({ total_leads_found: leadsFound, emails_sent: emailsSent, emails_opened: emailsOpen, emails_clicked: emailsClick })
      .eq('id', campaignId);
    addLog('supabase', `Progress: leads=${leadsFound}, sent=${emailsSent}, open=${emailsOpen}`);
  } catch (err) {
    addLog('supabase:err', `Progress sync error: ${err.message}`);
  }
}

async function syncCampaignToSupabase(campaignId, exitCode, statsBefore) {
  if (!supabase || !campaignId) return;
  try {
    const after = getStats();
    const leadsFound  = Math.max(0, after.total   - (statsBefore?.total   ?? after.total));
    const emailsSent  = Math.max(0, after.sent     - (statsBefore?.sent    ?? after.sent));
    const emailsOpen  = Math.max(0, after.opened   - (statsBefore?.opened  ?? after.opened));
    const emailsClick = Math.max(0, after.clicked  - (statsBefore?.clicked ?? after.clicked));
    const status = exitCode === 0 ? 'completed' : 'error';
    const { error } = await supabase
      .from('outreach_campaigns')
      .update({ status, total_leads_found: leadsFound, emails_sent: emailsSent, emails_opened: emailsOpen, emails_clicked: emailsClick })
      .eq('id', campaignId);
    if (error) addLog('supabase:err', `Error actualizando campaña ${campaignId}: ${error.message}`);
    else addLog('supabase', `Final: ${campaignId} → status=${status}, leads=${leadsFound}, sent=${emailsSent}`);
  } catch (err) {
    addLog('supabase:err', `syncCampaignToSupabase falló: ${err.message}`);
  }
}

// ─── Process spawner ──────────────────────────────────────────────────────────
function spawnProc(key, args, campaignId = null) {
  if (procs[key]) return { ok: false, error: `${key} ya está corriendo` };

  let statsBefore = null;
  try { statsBefore = getStats(); } catch (_) {}

  addLog(key, `--- Iniciando: node cli.js ${args.join(' ')} ---`);

  const child = spawn('node', [CLI_PATH, ...args], {
    cwd: path.resolve(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  procs[key] = child;

  child.stdout.on('data', d => addLog(key, d.toString()));
  child.stderr.on('data', d => addLog(`${key}:err`, d.toString()));

  let syncInterval = null;
  if (campaignId && key === 'send') {
    syncInterval = setInterval(() => syncProgressToSupabase(campaignId, statsBefore), 30_000);
  }

  child.on('exit', async (code) => {
    if (syncInterval) clearInterval(syncInterval);
    procs[key] = null;
    addLog(key, `--- Proceso terminado (código ${code}) ---`);
    if (campaignId && key === 'send') await syncCampaignToSupabase(campaignId, code, statsBefore);
  });

  return { ok: true };
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost`);
  const pathname = url.pathname;

  const send = (status, body) => {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(body));
  };

  const readBody = () => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => { body += c.toString(); });
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON')); } });
  });

  // ── Health (sin auth) ──
  if (req.method === 'GET' && pathname === '/health') {
    return send(200, { ok: true });
  }

  // ── Auth check para todo lo demás ──
  if (!checkAuth(req)) return send(401, { error: 'Unauthorized' });

  // ── Status ──
  if (req.method === 'GET' && pathname === '/status') {
    let stats = null;
    try { stats = getStats(); } catch (_) {}
    return send(200, {
      scraping: procs.scrape !== null,
      sending:  procs.send   !== null,
      stats,
    });
  }

  // ── Logs (polling) ──
  if (req.method === 'GET' && pathname === '/logs') {
    const since = parseInt(url.searchParams.get('since') || '0', 10);
    const lines = since > 0 ? logBuffer.filter(l => l.ts > since) : logBuffer.slice(-100);
    return send(200, { logs: lines, now: Date.now() });
  }

  // ── Stop all ──
  if (req.method === 'POST' && pathname === '/stop') {
    let stopped = 0;
    for (const [key, child] of Object.entries(procs)) {
      if (child) { child.kill('SIGTERM'); procs[key] = null; stopped++; addLog('control', `${key} detenido manualmente`); }
    }
    return send(200, { ok: true, stopped });
  }

  // ── Config GET ──
  if (req.method === 'GET' && pathname === '/config') {
    return send(200, { config: readEnvConfig() });
  }

  // ── Config POST ──
  if (req.method === 'POST' && pathname === '/config') {
    readBody().then(body => {
      writeEnvConfig(body);
      addLog('control', `Config actualizada: ${JSON.stringify(body)}`);
      send(200, { ok: true, config: readEnvConfig() });
    }).catch(err => send(400, { error: err.message }));
    return;
  }

  // ── Trigger: scrape ──
  if (req.method === 'POST' && pathname === '/trigger/scrape') {
    const result = spawnProc('scrape', ['scrape-spain', '--limit', '500']);
    return send(result.ok ? 202 : 409, result);
  }

  // ── Trigger: send ──
  if (req.method === 'POST' && pathname === '/trigger/send') {
    const result = spawnProc('send', ['send-all']);
    return send(result.ok ? 202 : 409, result);
  }

  // ── Trigger: followup ──
  if (req.method === 'POST' && pathname === '/trigger/followup') {
    const result = spawnProc('send', ['followup-send', '--days', '4']);
    return send(result.ok ? 202 : 409, result);
  }

  // ── Trigger: parallel (scrape + send al mismo tiempo) ──
  if (req.method === 'POST' && pathname === '/trigger/parallel') {
    const r1 = spawnProc('scrape', ['scrape-spain', '--limit', '500']);
    const r2 = spawnProc('send',   ['send-all']);
    return send(202, { scrape: r1, send: r2 });
  }

  // ── Trigger: custom campaign ──
  if (req.method === 'POST' && pathname === '/trigger/custom-campaign') {
    readBody().then(payload => {
      if (!payload.niche || !payload.location) {
        return send(400, { error: 'Faltan parámetros: niche y location' });
      }
      const limitStr = (payload.limit || 50).toString();
      const result = spawnProc('scrape', ['scrape-and-send', '-n', payload.niche, '-l', payload.location, '--limit', limitStr], payload.campaign_id ?? null);
      send(result.ok ? 202 : 409, result);
    }).catch(err => send(400, { error: err.message }));
    return;
  }

  // ── Stats ──
  if (req.method === 'GET' && pathname === '/stats') {
    try { return send(200, { ok: true, stats: getStats() }); }
    catch (err) { return send(500, { error: err.message }); }
  }

  // ── SMTP stats ──
  if (req.method === 'GET' && pathname === '/stats/smtp') {
    try {
      const smtp = getSmtpStats();
      return send(200, { ok: true, smtp, totalRemaining: smtp.reduce((acc, p) => acc + p.remaining, 0) });
    } catch (err) { return send(500, { error: err.message }); }
  }

  send(404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`[Captacion Server] Puerto ${PORT} — listo en la vps`);
  if (!CRON_SECRET) console.warn('[Captacion Server] ADVERTENCIA: CRON_SECRET no configurado');
});

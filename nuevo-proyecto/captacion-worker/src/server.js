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

function checkAuth(req) {
  const auth = req.headers['authorization'];
  return Boolean(CRON_SECRET && auth === `Bearer ${CRON_SECRET}`);
}

function spawnCLI(args) {
  console.log(`[Captacion] Spawning: node cli.js ${args.join(' ')}`);
  const child = spawn('node', [CLI_PATH, ...args], {
    cwd: path.resolve(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });
  child.stdout.on('data', d => process.stdout.write(`[CLI] ${d}`));
  child.stderr.on('data', d => process.stderr.write(`[CLI] ${d}`));
  child.on('exit', code => console.log(`[CLI] Salió con código ${code}`));
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

  // POST /trigger/send — enviar a todos los leads pendientes
  if (req.method === 'POST' && req.url === '/trigger/send') {
    send(202, { ok: true, message: 'Campaña de envío iniciada' });
    spawnCLI(['send-all']);
    return;
  }

  // POST /trigger/followup — follow-up a los enviados hace 4+ días
  if (req.method === 'POST' && req.url === '/trigger/followup') {
    send(202, { ok: true, message: 'Follow-up iniciado (días >= 4)' });
    spawnCLI(['followup-send', '--days', '4']);
    return;
  }

  // POST /trigger/scrape — scraping de toda España (overnight)
  if (req.method === 'POST' && req.url === '/trigger/scrape') {
    send(202, { ok: true, message: 'Scraping España iniciado (puede tardar horas)' });
    spawnCLI(['scrape-spain', '--limit', '500']);
    return;
  }

  // GET /stats — métricas del pipeline para Mavie admin
  if (req.method === 'GET' && req.url === '/stats') {
    try {
      const stats = getStats();
      return send(200, { ok: true, stats });
    } catch (err) {
      return send(500, { error: err.message });
    }
  }

  // GET /stats/smtp — quota de cada proveedor SMTP hoy
  if (req.method === 'GET' && req.url === '/stats/smtp') {
    try {
      const smtp = getSmtpStats();
      const totalRemaining = smtp.reduce((acc, p) => acc + p.remaining, 0);
      return send(200, { ok: true, smtp, totalRemaining });
    } catch (err) {
      return send(500, { error: err.message });
    }
  }

  send(404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`[Captacion Server] Puerto ${PORT} — listo`);
  if (!CRON_SECRET) console.warn('[Captacion Server] ADVERTENCIA: CRON_SECRET no configurado');
});

'use strict';
require('dotenv').config();
const http = require('http');
const { runWorker } = require('./scrapers/orchestrator');

const PORT = process.env.PORT || 3001;
const CRON_SECRET = process.env.CRON_SECRET;

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === 'POST' && req.url === '/trigger') {
    const auth = req.headers['authorization'];
    if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    // Respond immediately, run async
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, message: 'Worker iniciado' }));
    runWorker().catch(err => console.error('[Server] Error worker:', err.message));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`[BOE-Worker Server] Puerto ${PORT} — listo`);
});

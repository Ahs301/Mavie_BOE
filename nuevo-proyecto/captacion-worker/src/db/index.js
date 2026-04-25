// src/db/index.js – inicialización y operaciones de base de datos (v2)
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { runMigrations } from './migrations.js';
import logger from '../utils/logger.js';

let _db = null;

export function getDB(dbPath = './data/outreach.sqlite') {
  if (_db) return _db;
  const absPath = path.resolve(dbPath);
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Directorio de base de datos creado: ${dir}`);
  }
  _db = new Database(absPath);
  _db.exec('PRAGMA journal_mode = WAL');
  _db.exec('PRAGMA foreign_keys = ON');
  runMigrations(_db);
  logger.info(`Base de datos conectada: ${absPath}`);
  return _db;
}

// ─── LEADS ────────────────────────────────────────────────────────────────────

export function leadExists(db, { email, domain }) {
  if (email && email.trim() !== '') {
    const row = db.prepare(
      "SELECT id FROM leads WHERE email = ? AND status IN ('SENT','REPLIED','BOUNCED','UNSUBSCRIBED')"
    ).get(email);
    if (row) return { id: row.id, reason: 'email' };
  }
  return null;
}

export function insertLead(db, lead) {
  const now = new Date().toISOString();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO leads (
      id, name, email, website, domain, city, category, description,
      type, sector, personalization, opening_line, status, created_at, updated_at,
      source_file, template_key, ab_variant
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    lead.name || null,
    lead.email || null,
    lead.website || null,
    lead.domain || null,
    lead.city || null,
    lead.category || null,
    lead.description || null,
    lead.type || 'otro',
    lead.sector || null,
    lead.personalization || null,
    lead.openingLine || null,
    lead.status || 'PENDING',
    now, now,
    lead.sourceFile || null,
    lead.templateKey || null,
    lead.abVariant || 0
  );
  return id;
}

export function updateLeadStatus(db, id, status, extra = {}) {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE leads SET
      status       = ?,
      updated_at   = ?,
      sent_at      = COALESCE(?, sent_at),
      replied_at   = COALESCE(?, replied_at),
      last_error   = COALESCE(?, last_error),
      template_key = COALESCE(?, template_key),
      message_id   = COALESCE(?, message_id)
    WHERE id = ?
  `).run(
    status, now,
    extra.sentAt || null,
    extra.repliedAt || null,
    extra.lastError || null,
    extra.templateKey || null,
    extra.messageId || null,
    id
  );
}

export function getLeadsForFollowup(db, days = 4) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  return db.prepare(`
    SELECT * FROM leads
    WHERE status = 'SENT'
      AND sent_at <= ?
      AND bounced_at IS NULL
      AND unsubscribed_at IS NULL
    ORDER BY sent_at ASC
  `).all(cutoff);
}

export function getUnrepliedLeads(db) {
  return db.prepare(`
    SELECT id, name, email, city, type, sent_at, open_count, click_count
    FROM leads
    WHERE status = 'SENT'
      AND bounced_at IS NULL
      AND unsubscribed_at IS NULL
    ORDER BY sent_at ASC
  `).all();
}

export function getHotLeads(db) {
  return db.prepare(`
    SELECT id, name, email, city, type, sent_at, open_count, click_count, opened_at, clicked_at
    FROM leads
    WHERE status = 'SENT'
      AND (open_count > 0 OR click_count > 0)
      AND bounced_at IS NULL
      AND unsubscribed_at IS NULL
    ORDER BY click_count DESC, open_count DESC
  `).all();
}

export function markReplied(db, email) {
  const now = new Date().toISOString();
  const result = db.prepare(`
    UPDATE leads SET status = 'REPLIED', replied_at = ?, updated_at = ?
    WHERE email = ?
  `).run(now, now, email.toLowerCase().trim());
  return result.changes;
}

export function markUnsubscribed(db, leadId) {
  const now = new Date().toISOString();
  db.prepare(`UPDATE leads SET unsubscribed_at = ?, updated_at = ? WHERE id = ?`).run(now, now, leadId);
}

export function markBounced(db, email) {
  const now = new Date().toISOString();
  const result = db.prepare(`
    UPDATE leads SET status = 'BOUNCED', bounced_at = ?, updated_at = ?
    WHERE email = ? AND bounced_at IS NULL
  `).run(now, now, email.toLowerCase().trim());
  return result.changes;
}

export function getStats(db) {
  const rows = db.prepare(`SELECT status, COUNT(*) as count FROM leads GROUP BY status`).all();
  return rows.reduce((acc, { status, count }) => { acc[status] = count; return acc; }, {});
}

export function getDetailedStats(db) {
  const total = db.prepare(`SELECT COUNT(*) as c FROM leads`).get().c;
  const sent = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE status IN ('SENT','REPLIED','BOUNCED')`).get().c;
  const opened = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE open_count > 0`).get().c;
  const clicked = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE click_count > 0`).get().c;
  const replied = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE status = 'REPLIED'`).get().c;
  const bounced = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE bounced_at IS NOT NULL`).get().c;
  const unsub = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE unsubscribed_at IS NOT NULL`).get().c;
  const hot = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE (open_count > 0 OR click_count > 0) AND status = 'SENT'`).get().c;

  return {
    total, sent, opened, clicked, replied, bounced, unsub, hot,
    openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
    replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
    bounceRate: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
  };
}

export function getAbTestingStats(db) {
  // Estadísticas de A/B Testing por variante
  const variants = db.prepare(`
    SELECT
      ab_variant,
      COUNT(*) as total,
      SUM(CASE WHEN status IN ('SENT','REPLIED','BOUNCED') THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN open_count > 0 THEN 1 ELSE 0 END) as opened,
      SUM(CASE WHEN click_count > 0 THEN 1 ELSE 0 END) as clicked,
      SUM(CASE WHEN status = 'REPLIED' THEN 1 ELSE 0 END) as replied,
      SUM(open_count) as totalOpens,
      SUM(click_count) as totalClicks
    FROM leads
    WHERE status IN ('SENT','REPLIED','BOUNCED')
    GROUP BY ab_variant
    ORDER BY ab_variant
  `).all();

  return variants.map(v => ({
    variant: v.ab_variant,
    total: v.total || 0,
    sent: v.sent || 0,
    opened: v.opened || 0,
    clicked: v.clicked || 0,
    replied: v.replied || 0,
    openRate: v.sent > 0 ? Math.round((v.opened / v.sent) * 100) : 0,
    clickRate: v.sent > 0 ? Math.round((v.clicked / v.sent) * 100) : 0,
    replyRate: v.sent > 0 ? Math.round((v.replied / v.sent) * 100) : 0,
  }));
}

// ─── TRACKING ─────────────────────────────────────────────────────────────────

export function recordOpen(db, leadId, ip = '', ua = '') {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE leads SET
      opened_at  = COALESCE(opened_at, ?),
      open_count = open_count + 1,
      updated_at = ?
    WHERE id = ?
  `).run(now, now, leadId);

  db.prepare(`
    INSERT INTO events (id, lead_id, type, ip, user_agent, created_at)
    VALUES (?, ?, 'OPEN', ?, ?, ?)
  `).run(uuidv4(), leadId, ip, ua, now);
}

export function recordClick(db, leadId, url = '', ip = '', ua = '') {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE leads SET
      clicked_at  = COALESCE(clicked_at, ?),
      click_count = click_count + 1,
      updated_at  = ?
    WHERE id = ?
  `).run(now, now, leadId);

  db.prepare(`
    INSERT INTO events (id, lead_id, type, url, ip, user_agent, created_at)
    VALUES (?, ?, 'CLICK', ?, ?, ?, ?)
  `).run(uuidv4(), leadId, url, ip, ua, now);
}

// ─── SENDS ────────────────────────────────────────────────────────────────────

export function insertSend(db, { leadId, kind, subject, body, status, error, messageId }) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO sends (id, lead_id, kind, subject, body, status, error, message_id, sent_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), leadId, kind, subject, body, status, error || null, messageId || null, now);
}

export function getLeadMessageId(db, leadId) {
  const row = db.prepare(`SELECT message_id FROM leads WHERE id = ?`).get(leadId);
  return row?.message_id || null;
}

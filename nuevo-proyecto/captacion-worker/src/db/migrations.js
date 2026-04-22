// src/db/migrations.js – creación y actualización del esquema SQLite
import logger from '../utils/logger.js';

export function runMigrations(db) {
  logger.info('Ejecutando migraciones de base de datos…');

  // ── Tabla principal de leads ───────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id              TEXT PRIMARY KEY,
      name            TEXT,
      email           TEXT,
      website         TEXT,
      domain          TEXT,
      city            TEXT,
      category        TEXT,
      description     TEXT,
      type            TEXT,
      sector          TEXT,
      personalization TEXT,
      opening_line    TEXT,
      status          TEXT NOT NULL DEFAULT 'PENDING',
      last_error      TEXT,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL,
      sent_at         TEXT,
      replied_at      TEXT,
      opened_at       TEXT,
      clicked_at      TEXT,
      open_count      INTEGER DEFAULT 0,
      click_count     INTEGER DEFAULT 0,
      bounced_at      TEXT,
      unsubscribed_at TEXT,
      source_file     TEXT,
      template_key    TEXT,
      message_id      TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_leads_email    ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_domain   ON leads(domain);
    CREATE INDEX IF NOT EXISTS idx_leads_status   ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_msg_id   ON leads(message_id);

    CREATE TABLE IF NOT EXISTS sends (
      id         TEXT PRIMARY KEY,
      lead_id    TEXT NOT NULL,
      kind       TEXT NOT NULL,       -- INITIAL | FOLLOWUP
      subject    TEXT,
      body       TEXT,
      status     TEXT NOT NULL,       -- SENT | FAILED
      error      TEXT,
      message_id TEXT,
      sent_at    TEXT NOT NULL,
      FOREIGN KEY(lead_id) REFERENCES leads(id)
    );

    CREATE INDEX IF NOT EXISTS idx_sends_lead_id ON sends(lead_id);

    CREATE TABLE IF NOT EXISTS events (
      id         TEXT PRIMARY KEY,
      lead_id    TEXT NOT NULL,
      type       TEXT NOT NULL,       -- OPEN | CLICK | BOUNCE | UNSUBSCRIBE
      url        TEXT,
      ip         TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(lead_id) REFERENCES leads(id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_lead_id ON events(lead_id);
    CREATE INDEX IF NOT EXISTS idx_events_type    ON events(type);
  `);

  // ── Columnas opcionales añadidas en versiones posteriores ──────
  // (ALTER TABLE solo si la columna no existe)
  const existingCols = db.prepare(`PRAGMA table_info(leads)`).all().map(r => r.name);

  const newCols = [
    { name: 'opening_line', def: 'TEXT' },
    { name: 'opened_at', def: 'TEXT' },
    { name: 'clicked_at', def: 'TEXT' },
    { name: 'open_count', def: 'INTEGER DEFAULT 0' },
    { name: 'click_count', def: 'INTEGER DEFAULT 0' },
    { name: 'bounced_at', def: 'TEXT' },
    { name: 'unsubscribed_at', def: 'TEXT' },
    { name: 'message_id', def: 'TEXT' },
    { name: 'ab_variant', def: 'INTEGER DEFAULT 0' },
  ];

  for (const col of newCols) {
    if (!existingCols.includes(col.name)) {
      db.exec(`ALTER TABLE leads ADD COLUMN ${col.name} ${col.def}`);
      logger.info(`  ↳ Columna añadida: leads.${col.name}`);
    }
  }

  logger.info('Migraciones completadas.');
}

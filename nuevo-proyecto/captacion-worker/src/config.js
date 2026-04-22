// src/config.js – centraliza y valida toda la configuración desde .env (v2)
import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '..', '.env') });

const ConfigSchema = z.object({
  // SMTP (salida)
  SMTP_HOST: z.string().min(1, 'SMTP_HOST requerido'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.string().transform(v => v === 'true').default('false'),
  SMTP_USER: z.string().min(1, 'SMTP_USER requerido'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS requerido'),

  // Remitente
  FROM_NAME: z.string().default('Josep'),
  FROM_EMAIL: z.string().email('FROM_EMAIL inválido'),
  REPLY_TO: z.string().optional(),

  // Empresa / Firma
  COMPANY_NAME: z.string().default('BOE Radar Inteligente'),
  SIGNATURE_URL: z.string().optional(),
  SIGNATURE_LINKEDIN: z.string().optional(),
  DEFAULT_DEMO_LINK: z.string().optional(),

  // OpenAI (clasificación IA)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // DB
  DB_PATH: z.string().default('./data/outreach.sqlite'),

  // Throttling (anti-spam Gmail / Outlook)
  SEND_DELAY_MS: z.coerce.number().default(180000), // 3 min entre emails
  MAX_PER_HOUR: z.coerce.number().default(15),
  MAX_PER_DAY: z.coerce.number().default(300), // Limite diario (ej. 300 para Brevo gratis)

  // Warmup (protección reputación dominio)
  DOMAIN_SETUP_DATE: z.string().optional(), // ej: '2024-03-01' o null = hoy
  ENABLE_WARMUP: z.string().transform(v => v !== 'false').default('true'),

  // Logs
  LOG_DIR: z.string().default('./logs'),

  // Tracking servidor
  TRACKING_URL: z.string().optional(), // ej: https://tu-servidor.com/track
  TRACKING_PORT: z.coerce.number().default(3456),

  // IMAP (lectura de bounces) — opcionales
  IMAP_HOST: z.string().optional(),
  IMAP_PORT: z.coerce.number().default(993),
  IMAP_USER: z.string().optional(),
  IMAP_PASS: z.string().optional(),

  // Multi-SMTP rotación — opcionales (se activan solo si están presentes)
  RESEND_SMTP_PASS: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  GMAIL_USER: z.string().email().optional(),
  GMAIL_PASS: z.string().optional(),
});

function loadConfig() {
  const parsed = ConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    const errors = parsed.error.errors.map(e => `  ${e.path.join('.')}: ${e.message}`).join('\n');
    console.error(`❌ Error de configuración (.env):\n${errors}`);
    process.exit(1);
  }
  return parsed.data;
}

let _cfg = null;
export function getConfig() {
  if (!_cfg) _cfg = loadConfig();
  return _cfg;
}

export default getConfig;

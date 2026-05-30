// src/utils/emailVerifier.js — verificación MX + SMTP RCPT TO (sin enviar)
// Sin dependencias externas: usa dns/promises y net de Node.js stdlib.
//
// Resultados posibles:
//   valid    → MX existe + SMTP aceptó RCPT TO + no es catch-all
//   catchall → servidor acepta cualquier dirección (no se puede verificar individualmente)
//   invalid  → MX no existe O SMTP devolvió 5xx permanente
//   risky    → timeout / conexión rechazada (común en VPS con puerto 25 bloqueado)
//   unknown  → no se pudo determinar (error DNS transitorio, etc.)

import dns from 'node:dns/promises';
import net from 'node:net';
import logger from './logger.js';

const TIMEOUT_MS = 7000;
const MX_CACHE    = new Map(); // domain → { mxHost: string|null, ts: number }
const CA_CACHE    = new Map(); // domain → boolean (catch-all)
const MX_TTL      = 30 * 60 * 1000; // 30 min

// Dominios personales/grandes: siempre devuelven 250 → no verificar SMTP
const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'hotmail.es', 'live.com', 'live.es', 'msn.com',
  'yahoo.com', 'yahoo.es',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me',
  'tutanota.com',
]);

// Dominios desechables conocidos
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'yopmail.com',
  'sharklasers.com', 'trashmail.com', 'dispostable.com', 'fakeinbox.com',
  'maildrop.cc', 'spam4.me', 'throwam.com', 'discard.email',
]);

// ─── MX lookup (con cache) ────────────────────────────────────────────────────
async function getMxHost(domain) {
  const cached = MX_CACHE.get(domain);
  if (cached && Date.now() - cached.ts < MX_TTL) return cached.mxHost;

  try {
    const records = await dns.resolveMx(domain);
    if (!records || records.length === 0) {
      MX_CACHE.set(domain, { mxHost: null, ts: Date.now() });
      return null;
    }
    records.sort((a, b) => a.priority - b.priority);
    const mxHost = records[0].exchange;
    MX_CACHE.set(domain, { mxHost, ts: Date.now() });
    return mxHost;
  } catch {
    MX_CACHE.set(domain, { mxHost: null, ts: Date.now() });
    return null;
  }
}

// ─── Conexión SMTP (EHLO → MAIL FROM → RCPT TO) ───────────────────────────────
function smtpCheck(mxHost, email) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: mxHost, port: 25 });
    let buf = '';
    let step = 0;
    let settled = false;

    const done = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { socket.destroy(); } catch (_) {}
      resolve(result);
    };

    const timer = setTimeout(() => done('risky'), TIMEOUT_MS);

    socket.on('data', (chunk) => {
      buf += chunk.toString();

      let idx;
      while ((idx = buf.indexOf('\r\n')) !== -1) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

        if (line.length < 3) continue;
        const code = parseInt(line.slice(0, 3), 10);
        if (isNaN(code)) continue;

        // Línea de continuación (250-xxx) → ignorar hasta la final
        if (line[3] === '-') continue;

        switch (step) {
          case 0: // banner 220
            if (code === 220) {
              step = 1;
              socket.write('EHLO mavie.outreach\r\n');
            } else {
              done('risky');
            }
            break;

          case 1: // respuesta EHLO
            if (code === 250) {
              step = 2;
              socket.write('MAIL FROM:<>\r\n');
            } else {
              done('risky');
            }
            break;

          case 2: // respuesta MAIL FROM
            if (code === 250) {
              step = 3;
              socket.write(`RCPT TO:<${email}>\r\n`);
            } else if (code >= 500) {
              done('invalid');
            } else if (code >= 400) {
              done('risky');
            }
            break;

          case 3: // respuesta RCPT TO — la clave
            socket.write('QUIT\r\n');
            if (code >= 200 && code < 300) {
              done('valid');
            } else if (code >= 500) {
              done('invalid');
            } else {
              done('unknown'); // 4xx temporal
            }
            break;
        }
      }
    });

    socket.on('error', () => done('risky'));
    socket.on('close', () => done('unknown'));
  });
}

// ─── Detección catch-all (cache por dominio) ──────────────────────────────────
async function checkCatchAll(mxHost, domain) {
  if (CA_CACHE.has(domain)) return CA_CACHE.get(domain);
  const canary = `zzz-no-existe-${Date.now()}@${domain}`;
  const result = await smtpCheck(mxHost, canary);
  const isCA = result === 'valid'; // si acepta un email inventado → catch-all
  CA_CACHE.set(domain, isCA);
  return isCA;
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Verifica si un email es válido mediante MX lookup + handshake SMTP.
 *
 * @param {string} email
 * @returns {Promise<{ result: 'valid'|'catchall'|'invalid'|'risky'|'unknown', reason: string }>}
 */
export async function verifyEmail(email) {
  if (!email || typeof email !== 'string') {
    return { result: 'invalid', reason: 'email vacío' };
  }

  const lower = email.toLowerCase().trim();
  if (!lower.includes('@')) {
    return { result: 'invalid', reason: 'formato inválido (sin @)' };
  }

  const [, domain] = lower.split('@');
  if (!domain || !domain.includes('.')) {
    return { result: 'invalid', reason: 'dominio inválido' };
  }

  if (DISPOSABLE.has(domain)) {
    return { result: 'invalid', reason: 'email desechable' };
  }

  if (PERSONAL_DOMAINS.has(domain)) {
    // MX existe pero SMTP no verifica → asumir válido si pasa DNS
    const mxHost = await getMxHost(domain);
    if (!mxHost) return { result: 'invalid', reason: 'sin MX (dominio personal)' };
    return { result: 'catchall', reason: 'proveedor personal (no verificable por SMTP)' };
  }

  const mxHost = await getMxHost(domain);
  if (!mxHost) {
    return { result: 'invalid', reason: 'sin registros MX — dominio no recibe email' };
  }

  const smtpResult = await smtpCheck(mxHost, lower);

  if (smtpResult === 'risky') {
    return { result: 'risky', reason: 'SMTP no respondió (timeout/bloqueado — habitual en VPS con puerto 25 cerrado)' };
  }
  if (smtpResult === 'invalid') {
    return { result: 'invalid', reason: 'SMTP rechazó la dirección (5xx permanente)' };
  }
  if (smtpResult === 'unknown') {
    return { result: 'unknown', reason: 'SMTP respondió con error temporal (4xx)' };
  }

  // smtpResult === 'valid' → comprobar catch-all
  const isCA = await checkCatchAll(mxHost, domain);
  if (isCA) {
    return { result: 'catchall', reason: 'servidor acepta cualquier dirección (catch-all)' };
  }

  return { result: 'valid', reason: 'MX + SMTP verificados ✓' };
}

/**
 * Devuelve true si el email debe ser saltado (no enviar).
 * Solo salta 'invalid'. Los demás (catchall, risky, unknown) se envían igualmente.
 * Razón: risky suele ser VPS con puerto 25 bloqueado, no email inválido.
 *
 * @param {{ result: string }} v
 * @returns {boolean}
 */
export function shouldSkipEmail(v) {
  return v.result === 'invalid';
}

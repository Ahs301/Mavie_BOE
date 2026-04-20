export const HONEYPOT_FIELD = "hp_website"
export const TIMESTAMP_FIELD = "hp_ts"
const MIN_FILL_MS = 2_000
const MAX_FILL_MS = 60 * 60 * 1000

export interface HoneypotInput {
  honeypot?: string | null
  timestamp?: string | null
}

export function checkHoneypot({ honeypot, timestamp }: HoneypotInput): { ok: boolean; reason?: string } {
  if (honeypot && honeypot.trim().length > 0) {
    return { ok: false, reason: "bot_honeypot" }
  }

  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || ts <= 0) {
    return { ok: false, reason: "missing_timestamp" }
  }

  const elapsed = Date.now() - ts
  if (elapsed < MIN_FILL_MS) return { ok: false, reason: "too_fast" }
  if (elapsed > MAX_FILL_MS) return { ok: false, reason: "stale_form" }

  return { ok: true }
}

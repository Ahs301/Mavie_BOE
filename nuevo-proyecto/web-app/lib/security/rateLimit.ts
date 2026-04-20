type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 5000

function cleanup(now: number): void {
  if (buckets.size < MAX_BUCKETS) return
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key)
  })
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

export interface RateLimitOptions {
  key: string
  windowMs: number
  max: number
}

export function rateLimit({ key, windowMs, max }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  cleanup(now)

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: max - 1, resetAt, retryAfterSeconds: 0 }
  }

  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return {
    allowed: true,
    remaining: max - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  }
}

export const RATE_LIMITS = {
  contactForm: { windowMs: 60_000, max: 3 },
  onboarding: { windowMs: 60_000, max: 3 },
  authLogin: { windowMs: 60_000, max: 5 },
} as const

import { headers } from "next/headers"

export function getClientIpFromHeaders(req?: Request): string {
  const hdrs = req ? req.headers : headers()
  const getH = (key: string): string | null => {
    if (req) return (req.headers as Headers).get(key)
    return (hdrs as Headers).get(key)
  }

  const forwarded = getH("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]!.trim()

  const real = getH("x-real-ip")
  if (real) return real.trim()

  const vercel = getH("x-vercel-forwarded-for")
  if (vercel) return vercel.split(",")[0]!.trim()

  return "anonymous"
}

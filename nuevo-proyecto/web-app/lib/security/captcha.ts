interface HCaptchaResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  "error-codes"?: string[]
  score?: number
}

export async function verifyCaptcha(token: string | null | undefined, remoteIp?: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY
  if (!secret) {
    console.warn("[Captcha] HCAPTCHA_SECRET_KEY not set — skipping verification (dev mode only).")
    return process.env.NODE_ENV !== "production"
  }
  if (!token) return false

  try {
    const params = new URLSearchParams({ secret, response: token })
    if (remoteIp) params.append("remoteip", remoteIp)

    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("[Captcha] hCaptcha HTTP error:", res.status)
      return false
    }

    const data = (await res.json()) as HCaptchaResponse
    if (!data.success) {
      console.warn("[Captcha] hCaptcha rejected:", data["error-codes"])
    }
    return Boolean(data.success)
  } catch (err) {
    console.error("[Captcha] Verification error:", err)
    return false
  }
}

export function captchaEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && process.env.HCAPTCHA_SECRET_KEY)
}

import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, RATE_LIMITS } from "@/lib/security/rateLimit"
import { verifyCaptcha, captchaEnabled } from "@/lib/security/captcha"
import { checkHoneypot, HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/security/honeypot"
import { getClientIpFromHeaders } from "@/lib/security/getClientIp"

const contactSchema = z.object({
  company_name: z.string().max(150).optional().nullable(),
  contact_name: z.string().min(2, "Nombre demasiado corto").max(100),
  email: z.string().email("Email inválido").max(254),
  phone: z.string().max(30).optional().nullable(),
  service_interest: z.enum(["boe", "outreach", "scraping", "automation", "consulting", "other"]).default("other"),
  message: z.string().min(10, "Mensaje demasiado corto").max(2000),
  captchaToken: z.string().optional().nullable(),
  [HONEYPOT_FIELD]: z.string().optional().nullable(),
  [TIMESTAMP_FIELD]: z.union([z.string(), z.number()]).optional().nullable(),
  consent: z.literal(true, { message: "Debes aceptar la política de privacidad" }),
})

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request)

  const limit = rateLimit({ key: `contact:${ip}`, ...RATE_LIMITS.contactForm })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos."
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const data = parsed.data

  const hp = checkHoneypot({
    honeypot: data[HONEYPOT_FIELD] ?? null,
    timestamp: data[TIMESTAMP_FIELD] != null ? String(data[TIMESTAMP_FIELD]) : null,
  })
  if (!hp.ok) {
    console.warn("[Contact] Honeypot rejected:", hp.reason, "ip=", ip)
    return NextResponse.json({ success: true })
  }

  if (captchaEnabled()) {
    const ok = await verifyCaptcha(data.captchaToken, ip !== "anonymous" ? ip : undefined)
    if (!ok) {
      return NextResponse.json({ error: "Verificación antispam fallida. Recarga la página." }, { status: 400 })
    }
  }

  try {
    const supabase = createClient()
    const { error: dbError } = await supabase.from("leads").insert([
      {
        company_name: data.company_name ?? null,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone ?? null,
        service_interest: data.service_interest,
        message: data.message,
        source: "web_contact_form",
        status: "new",
      },
    ])

    if (dbError) {
      console.error("[API/contact] Supabase error:", dbError)
    }

    const brevoKey = process.env.BREVO_API_KEY
    if (brevoKey) {
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "api-key": brevoKey,
          },
          body: JSON.stringify({
            sender: { name: "Mavie Web Form", email: "noreply@mavieautomations.com" },
            to: [{ email: "contacto@mavieautomations.com", name: "Mavie Automations" }],
            subject: `[Lead Web] ${escapeHtml(data.company_name || data.contact_name)} — ${escapeHtml(data.service_interest)}`,
            htmlContent: `
              <h2>Nueva solicitud de contacto</h2>
              <table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
                <tr><td style="padding: 8px; font-weight: bold; color: #666;">Empresa</td><td style="padding: 8px;">${escapeHtml(data.company_name || "No indicada")}</td></tr>
                <tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold; color: #666;">Contacto</td><td style="padding: 8px;">${escapeHtml(data.contact_name)}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #666;">Email</td><td style="padding: 8px;">${escapeHtml(data.email)}</td></tr>
                <tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold; color: #666;">Teléfono</td><td style="padding: 8px;">${escapeHtml(data.phone || "No indicado")}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #666;">Servicio</td><td style="padding: 8px;">${escapeHtml(data.service_interest)}</td></tr>
                <tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold; color: #666;">Mensaje</td><td style="padding: 8px;">${escapeHtml(data.message)}</td></tr>
              </table>
            `,
          }),
        })
      } catch (emailErr) {
        console.error("[API/contact] Brevo notification error:", emailErr)
      }
    }

    return NextResponse.json({ success: true, message: "Solicitud recibida correctamente." })
  } catch (err) {
    console.error("[API/contact] Unexpected error:", err)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}

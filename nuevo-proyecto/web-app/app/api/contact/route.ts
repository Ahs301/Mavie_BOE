import { NextResponse } from "next/server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
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

const serviceLabels: Record<string, string> = {
  boe: "Radar BOE / DOUE",
  outreach: "Captación B2B AI",
  scraping: "Scraping / Leads",
  automation: "Automatización",
  consulting: "Consultoría",
  other: "Otro",
}

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
    // Admin client (service role) bypasses RLS — necesario para inserts desde rutas públicas
    const supabase = createAdminClient()
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
      return NextResponse.json({ error: "Error al guardar la solicitud. Inténtalo de nuevo." }, { status: 500 })
    }

    const brevoKey = process.env.BREVO_API_KEY
    const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ?? "mavie.contact.dev@gmail.com"

    if (brevoKey) {
      try {
        const serviceLabel = serviceLabels[data.service_interest] ?? data.service_interest
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "api-key": brevoKey,
          },
          body: JSON.stringify({
            sender: { name: "Mavie Web Form", email: "noreply@mavieautomations.com" },
            to: [{ email: adminEmail, name: "Josep" }],
            subject: `[LEAD WEB] ${escapeHtml(data.company_name || data.contact_name)} — ${serviceLabel}`,
            htmlContent: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                <div style="background:#1e3a5f;padding:20px;border-radius:8px 8px 0 0">
                  <h2 style="color:#ffffff;margin:0">Nuevo lead desde mavieautomations.com</h2>
                  <p style="color:#93c5fd;margin:4px 0 0;font-size:14px">Formulario de contacto web</p>
                </div>
                <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
                  <table style="border-collapse:collapse;width:100%;font-size:14px">
                    <tr><td style="padding:10px 0;color:#6b7280;width:130px">Empresa</td><td style="padding:10px 0;font-weight:600">${escapeHtml(data.company_name || "—")}</td></tr>
                    <tr style="border-top:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280">Contacto</td><td style="padding:10px 0;font-weight:600">${escapeHtml(data.contact_name)}</td></tr>
                    <tr style="border-top:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280">Email</td><td style="padding:10px 0"><a href="mailto:${escapeHtml(data.email)}" style="color:#2563eb">${escapeHtml(data.email)}</a></td></tr>
                    <tr style="border-top:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280">Teléfono</td><td style="padding:10px 0">${escapeHtml(data.phone || "—")}</td></tr>
                    <tr style="border-top:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280">Servicio</td><td style="padding:10px 0"><span style="background:#dbeafe;color:#1d4ed8;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600">${escapeHtml(serviceLabel)}</span></td></tr>
                    <tr style="border-top:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280;vertical-align:top">Mensaje</td><td style="padding:10px 0;font-style:italic;color:#374151">"${escapeHtml(data.message)}"</td></tr>
                  </table>
                  <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb;display:flex;gap:12px">
                    <a href="mailto:${escapeHtml(data.email)}?subject=Mavie Automations - Tu solicitud" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">Responder ahora</a>
                    <a href="https://mavieautomations.com/dashboard/leads" style="background:#f3f4f6;color:#374151;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">Ver en dashboard</a>
                  </div>
                </div>
              </div>
            `,
          }),
        })
      } catch (emailErr) {
        // El lead ya está guardado en DB — el email es secundario
        console.error("[API/contact] Brevo notification error:", emailErr)
      }
    }

    return NextResponse.json({ success: true, message: "Solicitud recibida correctamente." })
  } catch (err) {
    console.error("[API/contact] Unexpected error:", err)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}

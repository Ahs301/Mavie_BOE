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
    const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0]?.trim()

    if (!adminEmail) {
      console.error("[API/contact] ADMIN_EMAILS env var no configurada — alerta no enviada")
    }

    if (brevoKey && adminEmail) {
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
            htmlContent: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background:#1e3a5f;padding:20px 24px;border-radius:8px 8px 0 0;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">Nuevo lead — mavieautomations.com</p>
      <p style="margin:4px 0 0;font-size:13px;color:#93c5fd;">Formulario de contacto web</p>
    </td>
  </tr>
  <tr>
    <td style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
        <tr><td style="padding:8px 0;color:#6b7280;width:120px;border-bottom:1px solid #f3f4f6;">Empresa</td><td style="padding:8px 0;font-weight:600;color:#111827;border-bottom:1px solid #f3f4f6;">${escapeHtml(data.company_name || "—")}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Contacto</td><td style="padding:8px 0;font-weight:600;color:#111827;border-bottom:1px solid #f3f4f6;">${escapeHtml(data.contact_name)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;"><a href="mailto:${escapeHtml(data.email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(data.email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Teléfono</td><td style="padding:8px 0;color:#374151;border-bottom:1px solid #f3f4f6;">${escapeHtml(data.phone || "—")}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Servicio</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;"><span style="background:#dbeafe;color:#1d4ed8;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">${escapeHtml(serviceLabel)}</span></td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Mensaje</td><td style="padding:8px 0;font-style:italic;color:#374151;">"${escapeHtml(data.message)}"</td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb;">
        <tr>
          <td style="padding:4px;">
            <a href="mailto:${escapeHtml(data.email)}?subject=Re%3A%20Tu%20solicitud%20en%20Mavie%20Automations" style="display:inline-block;background:#2563eb;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">Responder ahora</a>
          </td>
          <td style="padding:4px;">
            <a href="https://cal.com/josep-ndwyo3/30min" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">Reservar llamada</a>
          </td>
          <td style="padding:4px;">
            <a href="https://mavieautomations.com/dashboard/leads" style="display:inline-block;background:#f3f4f6;color:#374151;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">Ver dashboard</a>
          </td>
          <td style="padding:4px;">
            <a href="https://mavieautomations.com" style="display:inline-block;background:#f3f4f6;color:#374151;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">Web</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`,
          }),
        })
      } catch (emailErr) {
        // El lead ya está guardado en DB — el email es secundario
        console.error("[API/contact] Brevo notification error:", emailErr)
      }

      // Email de confirmación al lead (cierra cita mientras está caliente)
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "api-key": brevoKey,
          },
          body: JSON.stringify({
            sender: { name: "Josep — Mavie Automations", email: "jose@mavieautomations.com" },
            replyTo: { email: "jose@mavieautomations.com", name: "Josep" },
            to: [{ email: data.email, name: data.contact_name }],
            subject: `Hemos recibido tu solicitud — Mavie Automations`,
            htmlContent: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background:#1e3a5f;padding:24px;border-radius:8px 8px 0 0;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">Gracias por escribirnos, ${escapeHtml(data.contact_name)}.</p>
      <p style="margin:6px 0 0;font-size:14px;color:#93c5fd;">Tu solicitud ya está en nuestra bandeja.</p>
    </td>
  </tr>
  <tr>
    <td style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;font-size:14px;color:#374151;line-height:1.6;">
      <p>He recibido tu mensaje y te responderé personalmente en menos de 24 horas.</p>
      <p>Si quieres agilizarlo, puedes reservar 30 minutos directamente en mi calendario:</p>
      <table cellpadding="0" cellspacing="0" style="margin:20px auto;">
        <tr>
          <td>
            <a href="https://cal.com/josep-ndwyo3/30min" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Reservar llamada de 30 min</a>
          </td>
        </tr>
      </table>
      <p style="margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px;font-size:13px;color:#6b7280;">
        Josep — Fundador, Mavie Automations<br/>
        <a href="https://mavieautomations.com" style="color:#2563eb;text-decoration:none;">mavieautomations.com</a>
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`,
          }),
        })
      } catch (confirmErr) {
        console.error("[API/contact] Confirmation email error:", confirmErr)
      }
    }

    return NextResponse.json({ success: true, message: "Solicitud recibida correctamente." })
  } catch (err) {
    console.error("[API/contact] Unexpected error:", err)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}

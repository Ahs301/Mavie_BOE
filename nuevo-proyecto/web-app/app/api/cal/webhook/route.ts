import { NextResponse } from "next/server"
import { createHmac } from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"

function escapeHtml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function POST(request: Request) {
  const body = await request.text()

  const calSecret = process.env.CAL_WEBHOOK_SECRET
  if (calSecret) {
    const signature = request.headers.get("X-Cal-Signature-256") ?? ""
    const expected = `sha256=${createHmac("sha256", calSecret).update(body).digest("hex")}`
    if (signature !== expected) {
      console.warn("[Cal Webhook] Firma inválida")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  if (event.triggerEvent !== "BOOKING_CREATED") {
    return NextResponse.json({ ok: true })
  }

  const booking = event.payload as Record<string, unknown>
  const attendees = booking?.attendees as Array<{ email: string; name?: string }> | undefined
  const attendee = attendees?.[0]

  if (!attendee?.email) {
    return NextResponse.json({ error: "No hay asistente en la reserva" }, { status: 400 })
  }

  const name = attendee.name ?? attendee.email
  const email = attendee.email
  const startTime = String(booking.startTime ?? "")
  const eventType = String(booking.type ?? "llamada")
  const description = String(booking.description ?? "")

  const messageLines = [
    `Reserva de llamada vía Cal.com`,
    `Fecha: ${startTime}`,
    `Evento: ${eventType}`,
  ]
  if (description) messageLines.push(`Notas del cliente: ${description}`)

  try {
    const supabase = createAdminClient()

    const { error: dbError } = await supabase.from("leads").insert([
      {
        contact_name: name,
        email,
        message: messageLines.join("\n"),
        source: "cal_booking",
        status: "new",
        service_interest: "consulting",
      },
    ])

    if (dbError) {
      console.error("[Cal Webhook] Supabase error:", dbError.message)
    }

    const brevoKey = process.env.BREVO_API_KEY
    const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0] ?? "mavie.contact.dev@gmail.com"

    if (brevoKey) {
      const startFormatted = startTime
        ? new Date(startTime).toLocaleString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Madrid",
          })
        : startTime

      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": brevoKey,
        },
        body: JSON.stringify({
          sender: { name: "Mavie Reservas", email: "noreply@mavieautomations.com" },
          to: [{ email: adminEmail, name: "Josep" }],
          subject: `[CITA RESERVADA] ${escapeHtml(name)} — ${escapeHtml(startFormatted)}`,
          htmlContent: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background:#1a1a2e;padding:20px 24px;border-radius:8px 8px 0 0;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">Nueva cita reservada</p>
      <p style="margin:4px 0 0;font-size:13px;color:#a78bfa;">via Cal.com &rarr; Mavie Automations</p>
    </td>
  </tr>
  <tr>
    <td style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
        <tr><td style="padding:8px 0;color:#6b7280;width:120px;border-bottom:1px solid #f3f4f6;">Nombre</td><td style="padding:8px 0;font-weight:600;color:#111827;border-bottom:1px solid #f3f4f6;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Fecha/Hora</td><td style="padding:8px 0;font-weight:600;color:#059669;border-bottom:1px solid #f3f4f6;">${escapeHtml(startFormatted)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Tipo</td><td style="padding:8px 0;color:#374151;border-bottom:1px solid #f3f4f6;">${escapeHtml(eventType)}</td></tr>
        ${description ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Notas</td><td style="padding:8px 0;color:#374151;">${escapeHtml(description)}</td></tr>` : ""}
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb;">
        <tr>
          <td style="padding:4px;">
            <a href="mailto:${escapeHtml(email)}?subject=Re%3A%20Tu%20cita%20con%20Mavie%20Automations" style="display:inline-block;background:#2563eb;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">Responder</a>
          </td>
          <td style="padding:4px;">
            <a href="https://cal.com/josep-ndwyo3/30min" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">Cal.com</a>
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
      }).catch((e) => console.error("[Cal Webhook] Error email:", e))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[Cal Webhook] Error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

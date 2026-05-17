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
          htmlContent: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#1a1a2e;padding:20px;border-radius:8px 8px 0 0">
                <h2 style="color:#ffffff;margin:0">Nueva cita reservada</h2>
                <p style="color:#6b7280;margin:4px 0 0">vía Cal.com → Mavie Automations</p>
              </div>
              <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
                <table style="border-collapse:collapse;width:100%">
                  <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:120px">Nombre</td><td style="padding:8px 0;font-weight:600">${escapeHtml(name)}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Email</td><td style="padding:8px 0"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb">${escapeHtml(email)}</a></td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Fecha/Hora</td><td style="padding:8px 0;font-weight:600;color:#059669">${escapeHtml(startFormatted)}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Tipo</td><td style="padding:8px 0">${escapeHtml(eventType)}</td></tr>
                  ${description ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;vertical-align:top">Notas</td><td style="padding:8px 0">${escapeHtml(description)}</td></tr>` : ""}
                </table>
                <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb">
                  <a href="https://mavieautomations.com/dashboard/leads" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Ver en el dashboard →</a>
                </div>
              </div>
            </div>
          `,
        }),
      }).catch((e) => console.error("[Cal Webhook] Error email:", e))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[Cal Webhook] Error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

function escapeHtml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, contact_name, email, company_name, service_interest, created_at, source")
    .eq("status", "new")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[Leads Cron] Supabase error:", error.message)
    return NextResponse.json({ error: "DB error" }, { status: 500 })
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ ok: true, alerted: 0 })
  }

  const brevoKey = process.env.BREVO_API_KEY
  const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0] ?? "mavie.contact.dev@gmail.com"

  if (brevoKey) {
    const serviceLabels: Record<string, string> = {
      boe: "Radar BOE",
      outreach: "Captación B2B",
      scraping: "Scraping",
      automation: "Automatización",
      consulting: "Consultoría",
      other: "Otro",
      cal_booking: "Cita Cal.com",
    }

    const rows = leads
      .map((l) => {
        const hoursAgo = Math.round((Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60))
        const urgencyColor = hoursAgo > 24 ? "#dc2626" : "#d97706"
        const dateStr = new Date(l.created_at).toLocaleString("es-ES", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
        return `
          <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:10px 8px;font-weight:600">${escapeHtml(l.contact_name)}</td>
            <td style="padding:10px 8px"><a href="mailto:${escapeHtml(l.email)}" style="color:#2563eb">${escapeHtml(l.email)}</a></td>
            <td style="padding:10px 8px;color:#6b7280">${escapeHtml(l.company_name || "—")}</td>
            <td style="padding:10px 8px"><span style="background:#f3f4f6;padding:2px 8px;border-radius:4px;font-size:12px">${serviceLabels[l.service_interest] ?? l.service_interest}</span></td>
            <td style="padding:10px 8px;color:${urgencyColor};font-weight:600">Hace ${hoursAgo}h<br/><span style="font-weight:400;color:#6b7280;font-size:12px">${dateStr}</span></td>
          </tr>
        `
      })
      .join("")

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": brevoKey,
      },
      body: JSON.stringify({
        sender: { name: "Mavie Alertas", email: "noreply@mavieautomations.com" },
        to: [{ email: adminEmail, name: "Josep" }],
        subject: `[ALERTA] ${leads.length} lead${leads.length > 1 ? "s" : ""} sin contactar — más de 12h esperando`,
        htmlContent: `
          <div style="font-family:sans-serif;max-width:700px;margin:0 auto">
            <div style="background:#7c3aed;padding:20px;border-radius:8px 8px 0 0">
              <h2 style="color:#ffffff;margin:0">Leads sin contactar</h2>
              <p style="color:#ddd6fe;margin:4px 0 0">Llevan más de 12 horas esperando respuesta</p>
            </div>
            <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
              <table style="border-collapse:collapse;width:100%;font-size:14px">
                <thead>
                  <tr style="background:#f3f4f6">
                    <th style="padding:10px 8px;text-align:left;color:#374151">Nombre</th>
                    <th style="padding:10px 8px;text-align:left;color:#374151">Email</th>
                    <th style="padding:10px 8px;text-align:left;color:#374151">Empresa</th>
                    <th style="padding:10px 8px;text-align:left;color:#374151">Servicio</th>
                    <th style="padding:10px 8px;text-align:left;color:#374151">Tiempo</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
              <div style="margin-top:24px">
                <a href="https://mavieautomations.com/dashboard/leads" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Gestionar leads ahora →</a>
              </div>
            </div>
          </div>
        `,
      }),
    }).catch((e) => console.error("[Leads Cron] Error email:", e))
  }

  return NextResponse.json({ ok: true, alerted: leads.length })
}

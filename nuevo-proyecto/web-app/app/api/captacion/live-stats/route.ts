import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const result = await requireAdminApi()
  if (result instanceof NextResponse) return result

  const supabase = createClient()

  // Datos históricos de campañas desde Supabase
  const { data: campaigns } = await supabase
    .from("outreach_campaigns")
    .select("id, name, status, total_leads_found, emails_sent, emails_opened, emails_clicked, created_at")
    .order("created_at", { ascending: true })
    .limit(20)

  const list = campaigns ?? []
  const totalLeads   = list.reduce((a, c) => a + (c.total_leads_found || 0), 0)
  const totalSent    = list.reduce((a, c) => a + (c.emails_sent      || 0), 0)
  const totalOpened  = list.reduce((a, c) => a + (c.emails_opened    || 0), 0)
  const totalClicked = list.reduce((a, c) => a + (c.emails_clicked   || 0), 0)

  // Stats en tiempo real del VPS (SQLite del worker)
  let vpsLive: Record<string, number> | null = null
  const workerUrl    = process.env.CAPTACION_WORKER_URL
  const workerSecret = process.env.CAPTACION_CRON_SECRET
  if (workerUrl && workerSecret) {
    try {
      const normalizedUrl = workerUrl.replace(/\/$/, '')
      const r = await fetch(`${normalizedUrl}/stats`, {
        headers: { Authorization: `Bearer ${workerSecret}` },
        signal: AbortSignal.timeout(4_000),
      })
      if (r.ok) {
        const d = await r.json()
        vpsLive = d.stats ?? null
      }
    } catch {
      // VPS inaccesible — no bloqueamos la respuesta
    }
  }

  return NextResponse.json({
    campaigns: list,
    totals: { leads: totalLeads, sent: totalSent, opened: totalOpened, clicked: totalClicked },
    vpsLive,   // null si VPS offline, o { total, pending, sent, replied, bounced, opened, clicked }
    updatedAt: new Date().toISOString(),
  })
}

import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { TrendingUp, Database } from "lucide-react"
import { NewCampaignModal } from "./components/NewCampaignModal"
import { WorkerStats } from "./components/WorkerStats"
import { CampaignTable } from "./components/CampaignTable"
import { LiveMetrics } from "./components/LiveMetrics"
import { ControlPanel } from "./components/ControlPanel"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "Outreach Engine — Mavie Admin",
  robots: { index: false, follow: false },
}

export default async function CaptacionDashboard() {
  await requireAuth()
  const supabase = createClient()

  const { data: campaigns } = await supabase
    .from("outreach_campaigns")
    .select("id, name, status, total_leads_found, emails_sent, emails_opened, emails_clicked, created_at, updated_at")
    .order("created_at", { ascending: true })

  const list = campaigns ?? []
  const totalLeads   = list.reduce((a, c) => a + (c.total_leads_found || 0), 0)
  const totalSent    = list.reduce((a, c) => a + (c.emails_sent      || 0), 0)
  const totalOpened  = list.reduce((a, c) => a + (c.emails_opened    || 0), 0)
  const totalClicked = list.reduce((a, c) => a + (c.emails_clicked   || 0), 0)

  const initial = {
    campaigns: list,
    totals: { leads: totalLeads, sent: totalSent, opened: totalOpened, clicked: totalClicked },
    vpsLive: null,
    updatedAt: new Date().toISOString(),
  }

  // campaigns sorted desc for the table
  const campaignsDesc = [...list].reverse()

  return (
    <div className="p-6 xl:p-8 max-w-[1400px] space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" /> Motor de Captación B2B
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestor central de campañas. El motor VPS leerá esta cola automáticamente.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-950/30 border border-blue-900/40 px-3 py-2 rounded-lg font-medium">
            <Database className="w-4 h-4" /> CRM DB Activa
          </div>
          <WorkerStats />
          <NewCampaignModal />
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

        {/* Left — Campaign queue */}
        <div className="bg-card border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-foreground">Cola de Campañas</h2>
            <span className="text-xs text-neutral-500 bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
              {campaignsDesc.length} campañas totales
            </span>
          </div>
          <div className="min-h-[320px]">
            <CampaignTable campaigns={campaignsDesc} />
          </div>
        </div>

        {/* Right — Live analytics + control panel */}
        <div className="flex flex-col gap-6">
          <LiveMetrics initial={initial} />
          <ControlPanel />
        </div>

      </div>
    </div>
  )
}

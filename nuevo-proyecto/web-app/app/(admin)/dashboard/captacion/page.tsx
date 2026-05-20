import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
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
    .select("id, name, status, target_audience, total_leads_found, emails_sent, emails_opened, emails_clicked, created_at, updated_at")
    .order("created_at", { ascending: true })

  const list = campaigns ?? []
  const campaignsDesc = [...list].reverse()

  const totalLeads   = list.reduce((a, c) => a + (c.total_leads_found || 0), 0)
  const totalSent    = list.reduce((a, c) => a + (c.emails_sent      || 0), 0)
  const totalOpened  = list.reduce((a, c) => a + (c.emails_opened    || 0), 0)
  const totalClicked = list.reduce((a, c) => a + (c.emails_clicked   || 0), 0)

  return (
    <div className="p-3 sm:p-6 xl:p-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Motor de Captación B2B
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Scraper Total 24/7 + Envío en paralelo
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
          <WorkerStats />
          <NewCampaignModal />
        </div>
      </div>

      {/* KPIs — full width */}
      <LiveMetrics initial={{
        campaigns: list,
        totals: { leads: totalLeads, sent: totalSent, opened: totalOpened, clicked: totalClicked },
        vpsLive: null,
        updatedAt: new Date().toISOString(),
      }} />

      {/* 2-column layout: Left = Control, Right = Campaigns */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">

        {/* LEFT — Control panel (Scraper Total + V1/V2 + Logs) */}
        <div className="flex flex-col gap-5">
          <ControlPanel />
        </div>

        {/* RIGHT — Campaign monitoring */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-foreground">Campañas</h2>
              <span className="text-[11px] text-neutral-500 bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800 whitespace-nowrap">
                {campaignsDesc.length} total
              </span>
            </div>
            <CampaignTable campaigns={campaignsDesc} />
          </div>
        </div>

      </div>
    </div>
  )
}

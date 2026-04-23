import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { TrendingUp, Mail, MousePointerClick, RefreshCcw, Database } from "lucide-react"
import { NewCampaignModal } from "./components/NewCampaignModal"
import { WorkerStats } from "./components/WorkerStats"
import { CampaignTable } from "./components/CampaignTable"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "Outreach Engine — Mavie Admin",
  robots: { index: false, follow: false },
}

export default async function CaptacionDashboard() {
  await requireAuth() // 🔐
  const supabase = createClient()

  // Leer campañas de la base de datos (ignora error si la tabla no existe aún durante el dev)
  const { data: campaigns } = await supabase
    .from("outreach_campaigns")
    .select("*")
    .order("created_at", { ascending: false })

  const totalLeads = campaigns?.reduce((acc, c) => acc + (c.total_leads_found || 0), 0) ?? 0
  const totalSent = campaigns?.reduce((acc, c) => acc + (c.emails_sent || 0), 0) ?? 0

  return (
    <div className="p-8 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" /> Motor de Captación B2B
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestor central de campañas. El motor VPS leerá esta cola automáticamente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-950/30 border border-blue-900/40 px-3 py-2 rounded-lg font-medium">
            <Database className="w-4 h-4" /> CRM DB Activa
          </div>
          <WorkerStats />
          <NewCampaignModal />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-400">Leads Encontrados</span>
            <Database className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{totalLeads}</div>
          <div className="text-xs text-neutral-600">Por motor de scraping</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-400">Total Enviados</span>
            <Mail className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{totalSent}</div>
          <div className="text-xs text-neutral-600">Sincronizado vía Brevo</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-400">Avg. Open Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">--%</div>
          <div className="text-xs text-neutral-600">Próximamente</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-400">Bounces</span>
            <RefreshCcw className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">--</div>
          <div className="text-xs text-neutral-600">Filtro de seguridad activo</div>
        </div>
      </div>

      {/* Campañas Activas */}
      <div className="bg-card border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-foreground">Cola de Campañas</h2>
          <span className="text-xs text-neutral-500 bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
            {campaigns?.length || 0} campañas totales
          </span>
        </div>

        <div className="min-h-[300px]">
          <CampaignTable campaigns={campaigns ?? []} />
        </div>
      </div>
    </div>
  )
}

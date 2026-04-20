import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { TrendingUp, Mail, MousePointerClick, RefreshCcw, Database, Play, Eye } from "lucide-react"
import { NewCampaignModal } from "./components/NewCampaignModal"
import Link from "next/link"

export const dynamic = 'force-dynamic'

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

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 bg-neutral-800/20 border-b border-neutral-800 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre & Target</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Progreso</th>
                <th className="px-6 py-4 font-medium">Performance</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {(!campaigns || campaigns.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <TrendingUp className="w-10 h-10 text-neutral-700 mx-auto mb-4" />
                    <p className="text-neutral-400 font-medium mb-1">No hay campañas configuradas.</p>
                    <p className="text-neutral-600 text-xs">Crea tu primera campaña para alimentar el motor de scraping de tu VPS.</p>
                  </td>
                </tr>
              ) : (
                campaigns.map(camp => (
                  <tr key={camp.id} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground mb-0.5">{camp.name}</div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                        <Database className="w-3 h-3" /> {camp.target_audience}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                        camp.status === 'draft' ? "bg-neutral-800/50 text-neutral-400 border-neutral-700" :
                        camp.status === 'scraping' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        camp.status === 'sending' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        camp.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        "bg-neutral-800/50 text-neutral-400 border-neutral-700"
                      }`}>
                        {camp.status === 'scraping' || camp.status === 'sending' ? (
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${camp.status==='sending' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                        ) : null}
                        {camp.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-neutral-400">
                          <span>{camp.emails_sent} leads extraídos</span>
                          <span>{camp.total_leads_found}</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: camp.total_leads_found > 0 ? `${(camp.emails_sent / camp.total_leads_found) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Mail className="w-3 h-3" /> {camp.emails_opened}
                        </div>
                        <div className="flex items-center gap-1 text-purple-400">
                          <MousePointerClick className="w-3 h-3" /> {camp.emails_clicked}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Fake interaction for now to show capabilities */}
                      <button className="inline-flex items-center justify-center p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors" title="Ver Log de ejecución VPS">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Activity, Users, AlertCircle, MailCheck, TrendingUp, CheckCircle } from "lucide-react"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Dashboard — Mavie Admin",
  robots: { index: false, follow: false },
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: "green" | "red" | "amber" | "blue" | "default"
}) {
  const colors = {
    green: "text-emerald-400",
    red: "text-red-400",
    amber: "text-amber-400",
    blue: "text-blue-400",
    default: "text-neutral-200",
  }
  const iconColors = {
    green: "text-emerald-500",
    red: "text-red-500",
    amber: "text-amber-500",
    blue: "text-blue-500",
    default: "text-neutral-500",
  }
  const color = colors[accent ?? "default"]
  const iconColor = iconColors[accent ?? "default"]

  return (
    <div className="rounded-xl border border-neutral-800 bg-card p-6 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-400">{label}</span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className={`text-3xl font-bold tracking-tight ${color}`}>{value}</div>
      {sub && <div className="text-xs text-neutral-600">{sub}</div>}
    </div>
  )
}

export default async function DashboardPage() {
  await requireAuth() // 🔐

  const supabase = createClient()

  // ─── Parallel fetching from all ERP modules ───
  const [
    { count: totalClients },
    { count: totalLeads },
    { count: activeRadarClients },
    { data: outreachCampaigns },
    { data: recentIncidents },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "activo"),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("client_boe_configs").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("outreach_campaigns").select("emails_sent, emails_opened"),
    supabase.from("incidents").select("id, status, module, created_at, description").order("created_at", { ascending: false }).limit(15),
  ])

  // Aggregate outreach metrics safely
  const totalEmailsSent = outreachCampaigns ? outreachCampaigns.reduce((acc, c) => acc + (c.emails_sent || 0), 0) : 0
  
  // Incidents
  const openIncidentsCount = recentIncidents ? recentIncidents.filter(i => i.status === "open").length : 0
  const recentLogs = recentIncidents ? recentIncidents.slice(0, 6) : []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Mavie <span className="text-blue-500 font-light">Ecosystem</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Centro de Control Operativo. {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-3 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Sistemas estables
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Clientes Activos (CRM)"
          value={totalClients ?? 0}
          sub="Servicios en curso"
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Total Leads (Web)"
          value={totalLeads ?? 0}
          sub="Base de datos de interesados"
          icon={Activity}
          accent="amber"
        />
        <StatCard
          label="Radares BOE Activos"
          value={activeRadarClients ?? 0}
          sub="Monitorización diaria automatizada"
          icon={CheckCircle}
          accent="green"
        />
        <StatCard
          label="Impacto Prospección"
          value={totalEmailsSent}
          sub="Emails B2B enviados (Brevo API)"
          icon={MailCheck}
          accent="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── System Status & Incidents ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-neutral-500" /> Estado Operativo y Logs
              </h2>
              {openIncidentsCount === 0 ? (
                <span className="text-xs text-emerald-500 font-medium border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded">
                  0 Alertas Activas
                </span>
              ) : (
                <span className="text-xs text-red-400 font-medium bg-red-400/10 px-2 py-0.5 rounded border border-red-500/20">
                  {openIncidentsCount} Alertas Críticas
                </span>
              )}
            </div>

            <div className="space-y-4">
              {(!recentLogs || recentLogs.length === 0) ? (
                <div className="text-sm text-neutral-500 italic py-4 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-xl p-8">
                  <CheckCircle className="w-8 h-8 text-neutral-800 mb-2" />
                  El registro de sistema está limpio.
                </div>
              ) : (
                recentLogs.map(inc => (
                  <div key={inc.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-neutral-800/20 transition-colors border border-transparent hover:border-neutral-800">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${inc.status === 'open' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : inc.status === 'in_progress' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground capitalize truncate">{inc.module}</span>
                        <span className="text-xs text-neutral-500 shrink-0">
                          {new Date(inc.created_at).toLocaleDateString("es-ES", {month:"short", day:"numeric"})} · {new Date(inc.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{inc.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-neutral-800 text-right">
              <a href="/dashboard/incidencias" className="text-xs text-blue-500 hover:text-blue-400 transition-colors font-medium">Ver todos los logs →</a>
            </div>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-card p-6 shadow-sm h-full">
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2">Módulos de Negocio</h2>
            
            <div className="space-y-3">
              <a href="/dashboard/clientes" className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800/60 hover:border-neutral-700 transition-all group">
                <span className="text-sm font-medium text-foreground flex items-center gap-3">
                  <span className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md group-hover:bg-blue-500/20 transition-colors"><Users className="w-4 h-4"/></span> 
                  CRM Central
                </span>
                <span className="text-neutral-500 group-hover:text-blue-400 transition-colors">→</span>
              </a>

              <a href="/dashboard/leads" className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800/60 hover:border-neutral-700 transition-all group">
                <span className="text-sm font-medium text-foreground flex items-center gap-3">
                  <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-md group-hover:bg-amber-500/20 transition-colors"><Activity className="w-4 h-4"/></span> 
                  Gestión Leads Web
                </span>
                <span className="text-neutral-500 group-hover:text-amber-400 transition-colors">→</span>
              </a>

              <a href="/dashboard/captacion" className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800/60 hover:border-neutral-700 transition-all group">
                <span className="text-sm font-medium text-foreground flex items-center gap-3">
                  <span className="p-1.5 bg-purple-500/10 text-purple-500 rounded-md group-hover:bg-purple-500/20 transition-colors"><TrendingUp className="w-4 h-4"/></span> 
                  Outreach Engine
                </span>
                <span className="text-neutral-500 group-hover:text-purple-400 transition-colors">→</span>
              </a>

              <a href="/dashboard/boe" className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800/60 hover:border-neutral-700 transition-all group">
                <span className="text-sm font-medium text-foreground flex items-center gap-3">
                  <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md group-hover:bg-emerald-500/20 transition-colors"><CheckCircle className="w-4 h-4"/></span> 
                  Control Radar BOE
                </span>
                <span className="text-neutral-500 group-hover:text-emerald-400 transition-colors">→</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

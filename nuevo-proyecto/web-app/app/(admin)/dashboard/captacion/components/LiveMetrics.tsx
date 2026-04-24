"use client"

import { useState, useEffect } from "react"
import { Database, Mail, Eye, MousePointerClick, RefreshCw, Activity, Zap } from "lucide-react"
import { CaptacionChart } from "./CaptacionChart"

type Campaign = {
  id: string
  name: string
  status: string
  total_leads_found: number
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  created_at: string
}

type VpsLive = {
  total: number
  pending: number
  sent: number
  replied: number
  bounced: number
  opened: number
  clicked: number
} | null

type Stats = {
  campaigns: Campaign[]
  totals: { leads: number; sent: number; opened: number; clicked: number }
  vpsLive: VpsLive
  updatedAt: string
}

const STATUS_DOT: Record<string, string> = {
  completed: "bg-emerald-400",
  sending:   "bg-blue-400 animate-pulse",
  scraping:  "bg-purple-400 animate-pulse",
  error:     "bg-red-400",
  paused:    "bg-orange-400",
  init:      "bg-yellow-400 animate-pulse",
  draft:     "bg-neutral-600",
}

const STATUS_LABEL: Record<string, string> = {
  completed: "Completada",
  sending:   "Enviando",
  scraping:  "Scraping",
  error:     "Error",
  paused:    "Pausada",
  init:      "Iniciando",
  draft:     "Borrador",
}

export function LiveMetrics({ initial }: { initial: Stats }) {
  const [stats, setStats]     = useState<Stats>(initial)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let active = true
    const poll = async () => {
      setSyncing(true)
      try {
        const res = await fetch("/api/captacion/live-stats")
        if (res.ok && active) setStats(await res.json())
      } finally {
        if (active) setSyncing(false)
      }
    }
    const id = setInterval(poll, 10_000)
    return () => { active = false; clearInterval(id) }
  }, [])

  const { totals, campaigns, vpsLive } = stats

  // Si VPS está online y tiene datos, usamos sus números en tiempo real
  const leadsDisplay  = vpsLive ? vpsLive.total   : totals.leads
  const sentDisplay   = vpsLive ? vpsLive.sent     : totals.sent
  const openedDisplay = vpsLive ? vpsLive.opened   : totals.opened

  const openRate  = sentDisplay > 0
    ? ((openedDisplay / sentDisplay) * 100).toFixed(1) + "%"
    : "--"
  const replyRate = vpsLive && vpsLive.sent > 0
    ? ((vpsLive.replied / vpsLive.sent) * 100).toFixed(1) + "%"
    : "--"

  const lastUpdate = new Date(stats.updatedAt).toLocaleTimeString("es-ES", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  })

  const recent = [...campaigns].reverse().slice(0, 5)
  const vpsOnline = vpsLive !== null

  return (
    <div className="flex flex-col gap-4">

      {/* VPS status pill */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium ${
        vpsOnline
          ? "border-emerald-900/40 bg-emerald-500/5 text-emerald-400"
          : "border-neutral-800 bg-neutral-900/50 text-neutral-600"
      }`}>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${vpsOnline ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
          {vpsOnline ? "VPS Contabo — datos en tiempo real" : "VPS offline — mostrando Supabase"}
        </div>
        {syncing && <RefreshCw className="w-3 h-3 animate-spin opacity-50" />}
      </div>

      {/* KPI 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        <Kpi
          label="Leads Captados"
          value={leadsDisplay}
          sub={vpsLive ? `${vpsLive.pending} pendientes` : undefined}
          icon={<Database className="w-3.5 h-3.5 text-emerald-400" />}
          accent="emerald"
          live={vpsOnline}
        />
        <Kpi
          label="Emails Enviados"
          value={sentDisplay}
          sub={vpsLive ? `${vpsLive.bounced} bounces` : undefined}
          icon={<Mail className="w-3.5 h-3.5 text-blue-400" />}
          accent="blue"
          live={vpsOnline}
        />
        <Kpi
          label="Open Rate"
          value={openRate}
          sub={vpsLive ? `${openedDisplay} abiertos` : undefined}
          icon={<Eye className="w-3.5 h-3.5 text-purple-400" />}
          accent="purple"
          live={vpsOnline}
        />
        <Kpi
          label="Reply Rate"
          value={replyRate}
          sub={vpsLive ? `${vpsLive.replied} respuestas` : undefined}
          icon={<MousePointerClick className="w-3.5 h-3.5 text-orange-400" />}
          accent="orange"
          live={vpsOnline}
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-neutral-500" /> Leads vs Enviados
          </span>
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Leads
            <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block ml-1" /> Enviados
          </div>
        </div>
        <div className="p-3">
          <CaptacionChart campaigns={campaigns} />
        </div>
      </div>

      {/* Activity feed */}
      <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Campañas recientes</span>
          <span className="text-[10px] text-neutral-700 tabular-nums">{lastUpdate}</span>
        </div>
        {recent.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-neutral-700">
            Sin actividad aún.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800/40">
            {recent.map(c => (
              <li key={c.id} className="px-4 py-3 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[c.status] ?? "bg-neutral-600"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-[10px] text-neutral-600 mt-0.5">
                    {c.total_leads_found} leads · {c.emails_sent} enviados ·{" "}
                    <span className="text-neutral-500">{STATUS_LABEL[c.status] ?? c.status}</span>
                  </p>
                </div>
                {c.emails_opened > 0 && (
                  <div className="flex items-center gap-0.5 text-[10px] text-emerald-500 shrink-0">
                    <Eye className="w-3 h-3" /> {c.emails_opened}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}

function Kpi({ label, value, sub, icon, accent, live }: {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
  accent: "emerald" | "blue" | "purple" | "orange"
  live?: boolean
}) {
  const border: Record<string, string> = {
    emerald: "border-emerald-900/40",
    blue:    "border-blue-900/40",
    purple:  "border-purple-900/40",
    orange:  "border-orange-900/40",
  }
  return (
    <div className={`rounded-xl border ${border[accent]} bg-card p-4 relative`}>
      {live && (
        <span className="absolute top-2 right-2">
          <Zap className="w-2.5 h-2.5 text-emerald-600" />
        </span>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</div>
      {sub && <div className="text-[10px] text-neutral-600 mt-1">{sub}</div>}
    </div>
  )
}

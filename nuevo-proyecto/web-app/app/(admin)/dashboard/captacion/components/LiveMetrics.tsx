"use client"

import { useState, useEffect } from "react"
import {
  Database, Mail, Eye, MessageSquareReply,
  CheckCircle2, AlertCircle, RefreshCw, Zap,
} from "lucide-react"

type Campaign = {
  id: string; name: string; status: string
  total_leads_found: number; emails_sent: number
  emails_opened: number; emails_clicked: number; created_at: string
}

type VpsLive = {
  total: number; pending: number; sent: number
  replied: number; bounced: number; opened: number; clicked: number
} | null

type Stats = {
  campaigns: Campaign[]
  totals: { leads: number; sent: number; opened: number; clicked: number }
  vpsLive: VpsLive
  updatedAt: string
}

type BrevoAgg = {
  delivered?: number; opens?: number; clicks?: number
  softBounces?: number; hardBounces?: number; requests?: number
}

export function LiveMetrics({ initial }: { initial: Stats }) {
  const [stats, setStats]     = useState<Stats>(initial)
  const [brevo, setBrevo]     = useState<BrevoAgg | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetch("/api/brevo/stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setBrevo(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    const poll = async () => {
      setSyncing(true)
      try {
        const [vpsRes, brevoRes] = await Promise.all([
          fetch("/api/captacion/live-stats"),
          fetch("/api/brevo/stats"),
        ])
        if (vpsRes.ok && active)   setStats(await vpsRes.json())
        if (brevoRes.ok && active) setBrevo(await brevoRes.json())
      } finally {
        if (active) setSyncing(false)
      }
    }
    const id = setInterval(poll, 10_000)
    return () => { active = false; clearInterval(id) }
  }, [])

  const { totals, vpsLive } = stats
  const vpsOnline = vpsLive !== null

  const leadsDisplay   = vpsLive ? vpsLive.total   : totals.leads
  const sentDisplay    = vpsLive ? vpsLive.sent    : totals.sent
  const openedDisplay  = vpsLive ? vpsLive.opened  : totals.opened
  const repliedDisplay = vpsLive?.replied ?? 0

  const openRate  = sentDisplay > 0
    ? ((openedDisplay / sentDisplay) * 100).toFixed(1) + "%"
    : "0.0%"
  const replyRate = vpsLive && vpsLive.sent > 0
    ? ((vpsLive.replied / vpsLive.sent) * 100).toFixed(1) + "%"
    : "0.0%"

  const brevoDelivered = brevo?.delivered ?? 0
  const brevoBounces   = (brevo?.softBounces ?? 0) + (brevo?.hardBounces ?? 0)

  return (
    <div className="flex flex-col gap-2">

      {/* Source + sync indicator */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${
          vpsOnline
            ? "border-emerald-900/40 bg-emerald-500/5 text-emerald-400"
            : "border-neutral-800 bg-neutral-900/50 text-neutral-500"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${vpsOnline ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
          {vpsOnline ? "VPS Contabo — datos en tiempo real" : "Supabase — VPS offline"}
        </div>
        {syncing && <RefreshCw className="w-3.5 h-3.5 text-neutral-600 animate-spin" />}
      </div>

      {/* 6-metric KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi
          label="Leads Captados"
          value={leadsDisplay.toLocaleString("es-ES")}
          sub={vpsLive ? `${vpsLive.pending} pendientes` : undefined}
          icon={<Database className="w-3.5 h-3.5 text-emerald-400" />}
          accent="emerald"
          live={vpsOnline}
        />
        <Kpi
          label="Enviados"
          value={sentDisplay.toLocaleString("es-ES")}
          sub={vpsLive ? `${vpsLive.bounced} rebotes VPS` : undefined}
          icon={<Mail className="w-3.5 h-3.5 text-blue-400" />}
          accent="blue"
          live={vpsOnline}
        />
        <Kpi
          label="Open Rate"
          value={openRate}
          sub={`${openedDisplay} abiertos`}
          icon={<Eye className="w-3.5 h-3.5 text-purple-400" />}
          accent="purple"
          live={vpsOnline}
        />
        <Kpi
          label="Reply Rate"
          value={replyRate}
          sub={`${repliedDisplay} respuestas`}
          icon={<MessageSquareReply className="w-3.5 h-3.5 text-orange-400" />}
          accent="orange"
          live={vpsOnline}
        />
        <Kpi
          label="Entregados Brevo"
          value={brevoDelivered > 0 ? brevoDelivered.toLocaleString("es-ES") : "--"}
          sub={brevo ? `de ${(brevo.requests ?? 0).toLocaleString("es-ES")} enviados` : "Cargando..."}
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
          accent="teal"
        />
        <Kpi
          label="Bounces Brevo"
          value={brevoBounces > 0 ? brevoBounces.toLocaleString("es-ES") : "0"}
          sub={brevoBounces > 50 ? "⚠ Dominio en riesgo" : "Sin rebotes críticos"}
          icon={<AlertCircle className="w-3.5 h-3.5 text-red-400" />}
          accent={brevoBounces > 50 ? "red" : "neutral"}
        />
      </div>

    </div>
  )
}

function Kpi({ label, value, sub, icon, accent, live }: {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
  accent: "emerald" | "blue" | "purple" | "orange" | "teal" | "red" | "neutral"
  live?: boolean
}) {
  const border: Record<string, string> = {
    emerald: "border-emerald-900/40",
    blue:    "border-blue-900/40",
    purple:  "border-purple-900/40",
    orange:  "border-orange-900/40",
    teal:    "border-teal-900/40",
    red:     "border-red-900/40",
    neutral: "border-neutral-800",
  }
  return (
    <div className={`rounded-xl border ${border[accent]} bg-card p-4 relative`}>
      {live && <Zap className="absolute top-2 right-2 w-2.5 h-2.5 text-emerald-600" />}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wide leading-tight">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</div>
      {sub && <div className="text-[10px] text-neutral-600 mt-1">{sub}</div>}
    </div>
  )
}

"use client"

import { useMemo } from "react"
import {
  TrendingUp, Mail, Eye, MousePointerClick,
  MessageSquareReply, Users, ArrowRight,
} from "lucide-react"

type Campaign = {
  id: string
  name: string
  total_leads_found: number
  emails_sent: number
  emails_opened?: number
  emails_clicked?: number
}

/* ─── helpers ────────────────────────────────────────────────── */
function pct(num: number, den: number) {
  if (!den) return 0
  return Math.min(100, (num / den) * 100)
}
function fmtPct(num: number, den: number) {
  if (!den) return "—"
  return pct(num, den).toFixed(1) + "%"
}

/* ─── Funnel step ────────────────────────────────────────────── */
function FunnelStep({
  label, value, rate, color, icon, isLast = false,
}: {
  label: string
  value: number
  rate?: string
  color: string
  icon: React.ReactNode
  isLast?: boolean
}) {
  const barPct = typeof rate === "string" && rate !== "—"
    ? parseFloat(rate)
    : 100

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`flex items-center justify-center w-6 h-6 rounded-lg ${color} bg-opacity-20`}>
            {icon}
          </span>
          <span className="text-xs text-neutral-300 font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-bold text-foreground tabular-nums">
            {value.toLocaleString("es-ES")}
          </span>
          {rate && (
            <span className={`text-[11px] font-semibold tabular-nums w-14 text-right ${
              rate === "—" ? "text-neutral-600" : "text-emerald-400"
            }`}>
              {rate}
            </span>
          )}
        </div>
      </div>

      {/* progress bar */}
      <div className="relative h-2 bg-neutral-800/70 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${color.replace("text-", "bg-")}`}
          style={{ width: `${Math.max(barPct, value > 0 ? 2 : 0)}%` }}
        />
      </div>

      {!isLast && (
        <div className="flex justify-start pl-2.5">
          <ArrowRight className="w-3 h-3 text-neutral-700 rotate-90" />
        </div>
      )}
    </div>
  )
}

/* ─── Per-campaign mini-table ────────────────────────────────── */
function CampaignRow({ camp, maxLeads }: { camp: Campaign; maxLeads: number }) {
  const sent    = camp.emails_sent || 0
  const leads   = camp.total_leads_found || 0
  const opened  = camp.emails_opened || 0
  const clicked = camp.emails_clicked || 0
  const sendRate = pct(sent, leads)
  const openRate = pct(opened, sent)

  return (
    <div className="grid grid-cols-[1fr_56px_56px_56px] gap-x-2 items-center py-2 border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/20 transition-colors rounded px-2">
      {/* Name + send bar */}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[11px] font-medium text-neutral-300 truncate">
          {camp.name.length > 22 ? camp.name.slice(0, 21) + "…" : camp.name}
        </span>
        <div className="relative h-1 bg-neutral-800 rounded-full overflow-hidden" style={{ width: `${Math.max(10, (leads / maxLeads) * 100)}%` }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-emerald-600/60"
            style={{ width: `${sendRate}%` }}
          />
        </div>
      </div>

      {/* Leads */}
      <div className="text-center">
        <span className="text-[11px] text-neutral-400 tabular-nums">{leads.toLocaleString("es-ES")}</span>
      </div>

      {/* Enviados */}
      <div className="text-center">
        <span className="text-[11px] text-blue-400 tabular-nums font-medium">{sent.toLocaleString("es-ES")}</span>
      </div>

      {/* Open rate */}
      <div className="text-center">
        <span className={`text-[11px] tabular-nums font-medium ${openRate > 0 ? "text-purple-400" : "text-neutral-700"}`}>
          {sent > 0 ? openRate.toFixed(0) + "%" : "—"}
        </span>
      </div>
    </div>
  )
}

/* ─── Main export ────────────────────────────────────────────── */
export function CaptacionChart({ campaigns }: { campaigns: Campaign[] }) {
  const totals = useMemo(() => ({
    leads:   campaigns.reduce((a, c) => a + (c.total_leads_found || 0), 0),
    sent:    campaigns.reduce((a, c) => a + (c.emails_sent       || 0), 0),
    opened:  campaigns.reduce((a, c) => a + (c.emails_opened     || 0), 0),
    clicked: campaigns.reduce((a, c) => a + (c.emails_clicked    || 0), 0),
  }), [campaigns])

  const maxLeads = useMemo(
    () => Math.max(1, ...campaigns.map(c => c.total_leads_found || 0)),
    [campaigns]
  )

  /* delivery score 0-100 */
  const score = totals.sent > 0
    ? Math.round(pct(totals.sent, totals.leads))
    : 0

  const scoreColor =
    score >= 70 ? "text-emerald-400" :
    score >= 40 ? "text-yellow-400"  :
    "text-red-400"

<<<<<<< HEAD
  const yTicks = [0, Math.round(maxVal / 2), maxVal]

  const allZero = campaigns.every(c => !c.total_leads_found && !c.emails_sent)

  if (n === 0 || allZero) {
=======
  if (campaigns.length === 0) {
>>>>>>> 3d1d3a2 (feat: funnel de captacion y lectura de emails imap)
    return (
      <div className="flex flex-col items-center justify-center h-44 gap-3 text-neutral-700">
        <TrendingUp className="w-8 h-8 opacity-40" />
        <p className="text-xs">Sin campañas. El motor actualizará al procesar.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Conversion funnel ─────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-neutral-500 font-medium uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Funnel de conversión
          </span>
          {/* delivery score pill */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold bg-neutral-900 border border-neutral-800 rounded-full px-2.5 py-1">
            <span className="text-neutral-500">Envío</span>
            <span className={scoreColor}>{score}%</span>
          </div>
        </div>

        <FunnelStep
          label="Leads captados"
          value={totals.leads}
          color="text-emerald-500"
          icon={<Users className="w-3.5 h-3.5" />}
        />
        <FunnelStep
          label="Emails enviados"
          value={totals.sent}
          rate={fmtPct(totals.sent, totals.leads)}
          color="text-blue-500"
          icon={<Mail className="w-3.5 h-3.5" />}
        />
        <FunnelStep
          label="Abiertos"
          value={totals.opened}
          rate={fmtPct(totals.opened, totals.sent)}
          color="text-purple-500"
          icon={<Eye className="w-3.5 h-3.5" />}
        />
        <FunnelStep
          label="Clicks"
          value={totals.clicked}
          rate={fmtPct(totals.clicked, totals.sent)}
          color="text-orange-500"
          icon={<MousePointerClick className="w-3.5 h-3.5" />}
          isLast
        />
      </div>

      {/* ── Per-campaign breakdown ─────────────────────── */}
      {campaigns.length > 0 && (
        <div className="flex flex-col gap-0">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_56px_56px_56px] gap-x-2 px-2 pb-1.5 border-b border-neutral-800">
            <span className="text-[10px] text-neutral-600 uppercase tracking-wide">Campaña</span>
            <span className="text-[10px] text-neutral-600 uppercase tracking-wide text-center">Leads</span>
            <span className="text-[10px] text-neutral-600 uppercase tracking-wide text-center">Env.</span>
            <span className="text-[10px] text-neutral-600 uppercase tracking-wide text-center">Open%</span>
          </div>
          {/* Rows */}
          <div className="max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            {campaigns.map(c => (
              <CampaignRow key={c.id} camp={c} maxLeads={maxLeads} />
            ))}
          </div>
        </div>
      )}

      {/* ── Reply signal ──────────────────────────────── */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-900/30 text-[10px] text-yellow-500/80">
        <MessageSquareReply className="w-3 h-3 shrink-0" />
        Las respuestas se contabilizan en <span className="font-semibold ml-1">Actividad Brevo →</span>
      </div>

    </div>
  )
}

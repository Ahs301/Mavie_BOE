"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2, X, Database, AlertCircle, Loader2,
  RefreshCw, Eye, TrendingUp,
} from "lucide-react"
import { deleteOutreachCampaignAction } from "@/app/actions/outreachActions"

type Campaign = {
  id: string
  name: string
  target_audience: string
  status: string
  total_leads_found: number
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  created_at: string
  updated_at: string
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "draft"
  const map: Record<string, string> = {
    draft:    "bg-neutral-800/50 text-neutral-400 border-neutral-700",
    init:     "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    scraping: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    sending:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    error:    "bg-red-500/10 text-red-400 border-red-500/20",
    paused:   "bg-orange-500/10 text-orange-400 border-orange-500/20",
  }
  const dotMap: Record<string, string> = { sending: "bg-blue-400", scraping: "bg-purple-400" }
  const cls = map[s] ?? map.draft
  const pulse = s === "scraping" || s === "sending"
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${cls}`}>
      {pulse && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotMap[s]}`} />}
      {s.toUpperCase()}
    </span>
  )
}

function OpenRateBadge({ sent, opened }: { sent: number; opened: number }) {
  if (sent === 0) return <span className="text-xs text-neutral-700">—</span>
  const pct = (opened / sent) * 100
  const label = pct.toFixed(1) + "%"
  const color = pct >= 25 ? "text-emerald-400" : pct >= 12 ? "text-yellow-400" : "text-red-400"
  return <span className={`text-xs font-semibold tabular-nums ${color}`}>{label}</span>
}

function CtrBadge({ sent, clicked }: { sent: number; clicked: number }) {
  if (sent === 0) return <span className="text-xs text-neutral-700">—</span>
  const pct = (clicked / sent) * 100
  return <span className="text-xs font-medium tabular-nums text-purple-400">{pct.toFixed(1)}%</span>
}

function DetailModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const created = new Date(campaign.created_at).toLocaleString("es-ES")
  const updated = new Date(campaign.updated_at).toLocaleString("es-ES")
  const openRate = campaign.emails_sent > 0
    ? ((campaign.emails_opened / campaign.emails_sent) * 100).toFixed(1) + "%"
    : "—"
  const ctr = campaign.emails_sent > 0
    ? ((campaign.emails_clicked / campaign.emails_sent) * 100).toFixed(1) + "%"
    : "—"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-neutral-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Detalle campaña
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-foreground p-1.5 rounded-lg hover:bg-neutral-800/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Performance summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 text-center">
            <div className="text-lg font-bold text-foreground">{campaign.emails_sent}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Enviados</div>
          </div>
          <div className="rounded-lg border border-emerald-900/40 bg-emerald-500/5 p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">{openRate}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Open Rate</div>
          </div>
          <div className="rounded-lg border border-purple-900/40 bg-purple-500/5 p-3 text-center">
            <div className="text-lg font-bold text-purple-400">{ctr}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">CTR</div>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <Row label="Nombre" value={campaign.name} />
          <Row label="Target" value={campaign.target_audience} />
          <Row label="Estado" value={<StatusBadge status={campaign.status} />} />
          <Row label="Leads encontrados" value={campaign.total_leads_found} />
          <Row label="Emails enviados" value={campaign.emails_sent} />
          <Row label="Aperturas" value={`${campaign.emails_opened} (${openRate})`} />
          <Row label="Clics" value={`${campaign.emails_clicked} (${ctr})`} />
          <Row label="Creada" value={created} />
          <Row label="Actualizada" value={updated} />
          <Row label="ID" value={<span className="font-mono text-xs text-neutral-500 break-all">{campaign.id}</span>} />
        </div>

        {(campaign.status === "init" || campaign.status === "error") && (
          <div className="mt-4 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {campaign.status === "error"
                ? "El VPS no pudo procesarla. Verifica que el captacion-worker esté corriendo y que CAPTACION_WORKER_URL y CAPTACION_CRON_SECRET estén en Vercel."
                : "Campaña en cola. El VPS la procesará cuando esté disponible."}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-neutral-500 shrink-0">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  )
}

export function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const hasActive = campaigns.some(c =>
    c.status === "scraping" || c.status === "sending" || c.status === "init"
  )

  useEffect(() => {
    if (!hasActive) return
    const interval = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(interval)
  }, [hasActive, router])

  const handleDelete = (camp: Campaign) => {
    if (!confirm(`¿Eliminar campaña "${camp.name}"? Esta acción no se puede deshacer.`)) return
    setDeleting(camp.id)
    startTransition(async () => {
      await deleteOutreachCampaignAction(camp.id)
      setDeleting(null)
    })
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <Database className="w-10 h-10 text-neutral-700 mx-auto mb-4" />
        <p className="text-neutral-400 font-medium mb-1">No hay campañas configuradas.</p>
        <p className="text-neutral-600 text-xs">
          Crea tu primera campaña para alimentar el motor de scraping de tu VPS.
        </p>
      </div>
    )
  }

  return (
    <>
      {selected && <DetailModal campaign={selected} onClose={() => setSelected(null)} />}

      {hasActive && (
        <div className="px-6 py-2 border-b border-neutral-800 flex items-center gap-2 text-xs text-purple-400">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Actualizando en tiempo real...
        </div>
      )}

      {/* Mobile view (cards) */}
      <div className="md:hidden divide-y divide-neutral-800/50">
        {campaigns.map(camp => {
          const openRate = camp.emails_sent > 0
            ? ((camp.emails_opened / camp.emails_sent) * 100).toFixed(1) + "%"
            : "—"
          return (
            <div key={camp.id} className="p-4 flex flex-col gap-3 hover:bg-neutral-800/10 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-sm truncate">{camp.name}</div>
                  <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5 truncate">
                    <Database className="w-3 h-3 shrink-0" /> {camp.target_audience}
                  </div>
                </div>
                <StatusBadge status={camp.status} />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>{camp.emails_sent} enviados</span>
                  <span>{camp.total_leads_found} leads</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: camp.total_leads_found > 0 ? `${Math.min(100, (camp.emails_sent / camp.total_leads_found) * 100)}%` : "0%" }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex flex-col">
                    <span className="text-neutral-600 text-[10px]">Open</span>
                    <OpenRateBadge sent={camp.emails_sent} opened={camp.emails_opened} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-neutral-600 text-[10px]">CTR</span>
                    <CtrBadge sent={camp.emails_sent} clicked={camp.emails_clicked} />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelected(camp)}
                    className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(camp)}
                    disabled={deleting === camp.id || isPending}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === camp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop view (table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-neutral-500 bg-neutral-800/20 border-b border-neutral-800 uppercase">
            <tr>
              <th className="px-5 py-3.5 font-medium">Campaña</th>
              <th className="px-5 py-3.5 font-medium">Estado</th>
              <th className="px-5 py-3.5 font-medium">Progreso</th>
              <th className="px-5 py-3.5 font-medium">Open</th>
              <th className="px-5 py-3.5 font-medium">CTR</th>
              <th className="px-5 py-3.5 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {campaigns.map(camp => (
              <tr key={camp.id} className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-semibold text-foreground mb-0.5 max-w-[200px] truncate">{camp.name}</div>
                  <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <Database className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[160px]">{camp.target_audience}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={camp.status} />
                </td>
                <td className="px-5 py-4 min-w-[140px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-neutral-400 tabular-nums">
                      <span>{camp.emails_sent.toLocaleString("es-ES")} / {camp.total_leads_found.toLocaleString("es-ES")}</span>
                      <span className="text-neutral-600">
                        {camp.total_leads_found > 0
                          ? Math.round((camp.emails_sent / camp.total_leads_found) * 100) + "%"
                          : "0%"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: camp.total_leads_found > 0 ? `${Math.min(100, (camp.emails_sent / camp.total_leads_found) * 100)}%` : "0%" }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <OpenRateBadge sent={camp.emails_sent} opened={camp.emails_opened} />
                </td>
                <td className="px-5 py-4">
                  <CtrBadge sent={camp.emails_sent} clicked={camp.emails_clicked} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSelected(camp)}
                      className="inline-flex items-center justify-center p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(camp)}
                      disabled={deleting === camp.id || isPending}
                      className="inline-flex items-center justify-center p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                      title="Eliminar campaña"
                    >
                      {deleting === camp.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

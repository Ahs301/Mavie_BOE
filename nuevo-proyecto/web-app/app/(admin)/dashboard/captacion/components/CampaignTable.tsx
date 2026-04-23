"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, MousePointerClick, Eye, Trash2, X, Database, AlertCircle, Loader2, RefreshCw } from "lucide-react"
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
  const cls = map[s] ?? map.draft
  const pulse = s === "scraping" || s === "sending"
  const dotCls = s === "sending" ? "bg-blue-400" : "bg-purple-400"
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${cls}`}>
      {pulse && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotCls}`} />}
      {s.toUpperCase()}
    </span>
  )
}

function DetailModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const created = new Date(campaign.created_at).toLocaleString("es-ES")
  const updated = new Date(campaign.updated_at).toLocaleString("es-ES")
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-neutral-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" /> Detalle de campaña
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-foreground p-1.5 rounded-lg hover:bg-neutral-800/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <Row label="Nombre" value={campaign.name} />
          <Row label="Target" value={campaign.target_audience} />
          <Row label="Estado" value={<StatusBadge status={campaign.status} />} />
          <Row label="Leads encontrados" value={campaign.total_leads_found} />
          <Row label="Emails enviados" value={campaign.emails_sent} />
          <Row label="Aperturas" value={campaign.emails_opened} />
          <Row label="Clics" value={campaign.emails_clicked} />
          <Row label="Creada" value={created} />
          <Row label="Actualizada" value={updated} />
          <Row label="ID" value={<span className="font-mono text-xs text-neutral-500 break-all">{campaign.id}</span>} />
        </div>

        {(campaign.status === "init" || campaign.status === "error") && (
          <div className="mt-4 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {campaign.status === "error"
                ? "El VPS no pudo procesarla. Verifica que el captacion-worker esté corriendo en el VPS y que CAPTACION_WORKER_URL y CAPTACION_CRON_SECRET estén en Vercel."
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

  const hasActive = campaigns.some(c => c.status === "scraping" || c.status === "sending" || c.status === "init")

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
        <p className="text-neutral-600 text-xs">Crea tu primera campaña para alimentar el motor de scraping de tu VPS.</p>
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-neutral-500 bg-neutral-800/20 border-b border-neutral-800 uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre & Target</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium">Progreso</th>
              <th className="px-6 py-4 font-medium">Performance</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {campaigns.map(camp => (
              <tr key={camp.id} className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-foreground mb-0.5">{camp.name}</div>
                  <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <Database className="w-3 h-3" /> {camp.target_audience}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={camp.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>{camp.emails_sent} enviados</span>
                      <span>{camp.total_leads_found} leads</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: camp.total_leads_found > 0 ? `${(camp.emails_sent / camp.total_leads_found) * 100}%` : "0%" }}
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
                <td className="px-6 py-4">
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

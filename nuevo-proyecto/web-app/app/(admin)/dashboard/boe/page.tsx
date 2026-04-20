import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Radar, Activity, CheckCircle, XCircle, Search, Clock } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Radar BOE — Mavie Admin",
  robots: { index: false, follow: false },
}

export default async function BoePage() {
  await requireAuth()
  const supabase = createClient()

  // Get all BOE configs with client data
  const { data: configs } = await supabase
    .from("client_boe_configs")
    .select(`
      *,
      clients (
        id,
        company_name,
        primary_email,
        status
      )
    `)
    .order("created_at", { ascending: false })

  const totalConfigs = configs?.length ?? 0
  const activeCount = configs?.filter(c => c.is_active).length ?? 0
  const inactiveCount = configs?.filter(c => !c.is_active).length ?? 0

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Radar className="w-6 h-6 text-blue-500" /> Centro de Control BOE
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Estado de todos los radares BOE/DOUE configurados por cliente
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {activeCount} radar{activeCount !== 1 ? "es" : ""} activo{activeCount !== 1 ? "s" : ""}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-card p-5">
          <div className="text-2xl font-bold text-foreground mb-1">{totalConfigs}</div>
          <div className="text-xs text-neutral-500">Radares configurados</div>
        </div>
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
          <div className="text-2xl font-bold text-emerald-400 mb-1">{activeCount}</div>
          <div className="text-xs text-neutral-500">Activos y monitorizando</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-card p-5">
          <div className="text-2xl font-bold text-neutral-500 mb-1">{inactiveCount}</div>
          <div className="text-xs text-neutral-500">Pausados</div>
        </div>
      </div>

      {/* Config cards */}
      {!configs || configs.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-card p-16 text-center">
          <Radar className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay radares configurados</h3>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto">
            Los radares BOE se configuran desde la ficha de cada cliente en el CRM.
          </p>
          <Link
            href="/dashboard/clientes"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Ir al CRM de Clientes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {configs.map(config => {
            const client = config.clients as { id: string; company_name: string; primary_email: string; status: string } | null
            const keywords = config.keywords ?? []
            const negKeywords = config.negative_keywords ?? []

            return (
              <div
                key={config.id}
                className={`rounded-xl border bg-card p-6 transition-colors hover:border-neutral-700 ${config.is_active ? "border-neutral-800" : "border-neutral-800/50 opacity-70"}`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {config.is_active ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <Activity className="w-3 h-3" /> Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 bg-neutral-800/50 border border-neutral-700 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Pausado
                        </span>
                      )}
                      <span className="text-xs text-neutral-600 capitalize">· {config.frequency ?? "diario"}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {client?.company_name ?? "Cliente eliminado"}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{client?.primary_email}</p>
                  </div>
                  {client && (
                    <Link
                      href={`/dashboard/clientes/${client.id}`}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Ver cliente →
                    </Link>
                  )}
                </div>

                {/* Keywords */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
                      <Search className="w-3 h-3" /> Keywords positivas ({keywords.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {keywords.length === 0 ? (
                        <span className="text-xs text-neutral-600 italic">Sin keywords configuradas</span>
                      ) : (
                        keywords.slice(0, 8).map((kw: string) => (
                          <span key={kw} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            {kw}
                          </span>
                        ))
                      )}
                      {keywords.length > 8 && (
                        <span className="text-xs text-neutral-600 px-2 py-0.5">+{keywords.length - 8} más</span>
                      )}
                    </div>
                  </div>

                  {negKeywords.length > 0 && (
                    <div>
                      <div className="text-xs text-neutral-500 mb-2">Keywords negativas ({negKeywords.length})</div>
                      <div className="flex flex-wrap gap-1.5">
                        {negKeywords.slice(0, 5).map((kw: string) => (
                          <span key={kw} className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                            {kw}
                          </span>
                        ))}
                        {negKeywords.length > 5 && (
                          <span className="text-xs text-neutral-600">+{negKeywords.length - 5}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Destination emails */}
                {config.destination_emails && config.destination_emails.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-800">
                    <div className="text-xs text-neutral-500 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Alertas enviadas a:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {config.destination_emails.map((em: string) => (
                        <span key={em} className="text-xs bg-neutral-800/50 text-neutral-400 px-2 py-0.5 rounded-md">
                          {em}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last update */}
                {config.updated_at && (
                  <div className="mt-3 text-xs text-neutral-600">
                    Última modificación: {new Date(config.updated_at).toLocaleDateString("es-ES")}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Quick status legend */}
      <div className="flex items-center gap-6 text-xs text-neutral-600 pt-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Radar activo: escaneando BOE cada día
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-neutral-600" /> Pausado: no procesa nuevas alertas
        </div>
      </div>
    </div>
  )
}

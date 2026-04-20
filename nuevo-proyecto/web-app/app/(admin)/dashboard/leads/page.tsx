import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { UserPlus, Mail, Building2, Calendar, ArrowRight, CheckCircle, Clock, XCircle, Loader } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { ConvertLeadBtn } from "./components/ConvertLeadBtn"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Leads — Mavie Admin",
  robots: { index: false, follow: false },
}

const statusConfig: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  new:          { label: "Nuevo",       class: "bg-blue-500/10 text-blue-400 border-blue-500/20",     icon: Loader },
  contacted:    { label: "Contactado",  class: "bg-amber-500/10 text-amber-400 border-amber-500/20",  icon: Clock },
  qualified:    { label: "Calificado",  class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  disqualified: { label: "Descartado", class: "bg-neutral-500/10 text-neutral-500 border-neutral-700", icon: XCircle },
}

const serviceLabels: Record<string, string> = {
  boe:        "Radar BOE / DOUE",
  outreach:   "Captación B2B AI",
  scraping:   "Scraping / Leads",
  automation: "Automatización",
  consulting: "Consultoría",
  other:      "Otro",
}

export default async function LeadsPage() {
  await requireAuth()
  const supabase = createClient()

  const { data: leads, count } = await supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  const newCount = leads?.filter(l => l.status === "new").length ?? 0
  const qualifiedCount = leads?.filter(l => l.status === "qualified").length ?? 0

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-500" /> Leads & Contactos Web
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Solicitudes recibidas desde el formulario de contacto de mavieautomations.com
          </p>
        </div>
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {newCount} nuevo{newCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total leads", value: count ?? 0, color: "text-foreground" },
          { label: "Nuevos", value: newCount, color: "text-blue-400" },
          { label: "Calificados", value: qualifiedCount, color: "text-emerald-400" },
          {
            label: "Tasa calificación",
            value: count ? `${Math.round((qualifiedCount / count) * 100)}%` : "—",
            color: "text-amber-400",
          },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-neutral-800 bg-card p-5">
            <div className={`text-2xl font-bold mb-1 ${k.color}`}>{k.value}</div>
            <div className="text-xs text-neutral-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Leads table */}
      <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Todas las solicitudes</h2>
          <span className="text-xs text-neutral-500">{count ?? 0} registros</span>
        </div>

        {!leads || leads.length === 0 ? (
          <div className="text-center py-20">
            <UserPlus className="w-10 h-10 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500 text-sm mb-1">Aún no hay leads registrados.</p>
            <p className="text-neutral-600 text-xs">Cuando alguien rellene el formulario de /contacto aparecerá aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 bg-neutral-800/20 border-b border-neutral-800 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Contacto / Empresa</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Servicio</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Fecha</th>
                  <th className="px-6 py-3 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {leads.map(lead => {
                  const st = statusConfig[lead.status] ?? statusConfig.new
                  const StatusIcon = st.icon
                  return (
                    <tr key={lead.id} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{lead.contact_name}</div>
                        {lead.company_name && (
                          <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                            <Building2 className="w-3 h-3" />{lead.company_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline text-sm">
                          {lead.email}
                        </a>
                        {lead.phone && <div className="text-xs text-neutral-500 mt-0.5">{lead.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-neutral-400 bg-neutral-800/50 px-2 py-1 rounded-md">
                          {serviceLabels[lead.service_interest] ?? lead.service_interest}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${st.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(lead.created_at).toLocaleDateString("es-ES", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`mailto:${lead.email}?subject=Mavie Automations - Respuesta a tu solicitud`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-800 bg-background hover:bg-neutral-800/40 text-neutral-400 hover:text-foreground transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" /> Contactar
                          </a>
                          {lead.converted_client_id ? (
                            <Link
                              href={`/dashboard/clientes/${lead.converted_client_id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            >
                              Ver ficha CRM <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <ConvertLeadBtn leadId={lead.id} />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details panel: Last lead message */}
      {leads && leads.length > 0 && leads.find(l => l.status === "new") && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
          <h3 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" /> Último lead sin contactar
          </h3>
          {(() => {
            const lead = leads.find(l => l.status === "new")!
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-500">De:</span>
                  <span className="text-foreground font-medium">{lead.contact_name}</span>
                  {lead.company_name && <span className="text-neutral-500">({lead.company_name})</span>}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-500">Email:</span>
                  <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline">{lead.email}</a>
                </div>
                <div className="mt-3 p-3 bg-background rounded-lg border border-neutral-800 text-sm text-neutral-400 italic">
                  &ldquo;{lead.message}&rdquo;
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

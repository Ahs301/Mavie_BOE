import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Phone, Mail, Calendar, Target, AlertTriangle, ShieldCheck } from "lucide-react"
import { BoeToggleBtn, ClientStatusDropdown } from "../components/ClientActions"
import { NotesPanel } from "../components/NotesPanel"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Detalle de Cliente — Mavie Admin",
  robots: { index: false, follow: false },
}

export default async function DetalleClientePage({ params }: { params: { id: string } }) {
  await requireAuth()
  const supabase = createClient()

  // Fetch client combined with boe config
  const { data: client, error } = await supabase
    .from("clients")
    .select(`
      *,
      client_boe_configs (*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !client) {
    notFound()
  }

  // Handle relationship properly whether it is array or object
  const boeConfig = Array.isArray(client.client_boe_configs) 
    ? client.client_boe_configs[0] 
    : client.client_boe_configs
    
  const hasBoeConfig = !!boeConfig
  const boeIsActive = hasBoeConfig && boeConfig.is_active

  return (
    <div className="p-8 pb-20 max-w-5xl">
      {/* Back button */}
      <Link 
        href="/dashboard/clientes"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a Clientes
      </Link>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{client.company_name}</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-800/50 text-neutral-500">
              ID: {client.id.split("-")[0]}
            </span>
          </div>
          <p className="text-neutral-500 flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            Alta: {new Date(client.created_at).toLocaleDateString("es-ES")}
            <span className="text-neutral-700 mx-2">|</span>
            Origen: {client.lead_source}
          </p>
        </div>
        
        {/* Actions panel */}
        <div className="flex items-center gap-4 bg-card p-2 rounded-xl border border-neutral-800 shadow-sm">
          <ClientStatusDropdown clientId={client.id} currentStatus={client.status} />
          {hasBoeConfig && (
            <BoeToggleBtn configId={boeConfig.id} isActive={boeIsActive} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Detalles del cliente */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-neutral-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest mb-6">Datos de contacto</h2>
            <div className="space-y-5">
              <div>
                <span className="block text-xs text-neutral-500 mb-1">Nombre Comercial</span>
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <Building2 className="w-4 h-4 text-neutral-500 shrink-0" />
                  {client.company_name}
                </div>
              </div>
              <div>
                <span className="block text-xs text-neutral-500 mb-1">Email Principal</span>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                  <a href={`mailto:${client.primary_email}`} className="text-blue-400 hover:underline">{client.primary_email}</a>
                </div>
              </div>
              <div>
                <span className="block text-xs text-neutral-500 mb-1">Teléfono</span>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                  {client.phone ? (
                    <a href={`tel:${client.phone}`} className="hover:text-neutral-500 transition-colors">{client.phone}</a>
                  ) : (
                    <span className="text-neutral-600 italic">No especificado</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-neutral-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest mb-4 flex justify-between items-center">
              Notas Internas
              <span className="text-xs text-neutral-600 normal-case">Solo admin</span>
            </h2>
            <NotesPanel clientId={client.id} initialNotes={client.notes ?? ""} />
          </div>
        </div>

        {/* Columna Central y Derecha: Configuración y Automatizaciones */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Configuración Radar BOE
              </h2>
              {hasBoeConfig ? (
                boeIsActive 
                  ? <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20"><ShieldCheck className="w-3.5 h-3.5" /> Monitorizando</span>
                  : <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium px-2 py-1 bg-amber-500/10 rounded-md border border-amber-500/20"><AlertTriangle className="w-3.5 h-3.5" /> Pausado</span>
              ) : (
                <span className="text-xs text-neutral-500 border border-neutral-800 px-2 py-1 rounded-md">No configurado</span>
              )}
            </div>

            {hasBoeConfig ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-xl p-4 border border-neutral-800">
                    <span className="block text-xs text-neutral-500 mb-2">Frecuencia de escaneo</span>
                    <span className="text-sm font-medium text-foreground capitalize">{boeConfig.frequency}</span>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-neutral-800">
                    <span className="block text-xs text-neutral-500 mb-2">Emails de Recepción BOE</span>
                    <div className="flex flex-col gap-1">
                      {boeConfig.destination_emails?.map((email: string) => (
                        <span key={email} className="text-sm text-foreground">{email}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-neutral-500 mb-2">Keywords Positivas (Disparan alerta)</span>
                  <div className="flex flex-wrap gap-2">
                    {boeConfig.keywords_positive?.map((kw: string) => (
                      <span key={kw} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-sm">
                        {kw}
                      </span>
                    ))}
                    {(!boeConfig.keywords_positive || boeConfig.keywords_positive.length === 0) && (
                      <span className="text-sm text-neutral-600 italic">No hay keywords positivas.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-neutral-500 mb-2">Keywords Negativas (Descartan alerta)</span>
                  <div className="flex flex-wrap gap-2">
                    {boeConfig.keywords_negative?.map((kw: string) => (
                      <span key={kw} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-sm">
                        {kw}
                      </span>
                    ))}
                    {(!boeConfig.keywords_negative || boeConfig.keywords_negative.length === 0) && (
                      <span className="text-sm text-neutral-600 italic">No hay keywords negativas.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-background rounded-xl border border-neutral-800 border-dashed">
                <Target className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                <p className="text-sm text-neutral-400 mb-1">Este cliente no tiene configurado un Radar BOE.</p>
                <p className="text-xs text-neutral-600">Puedes crearlo desde la base de datos o API.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

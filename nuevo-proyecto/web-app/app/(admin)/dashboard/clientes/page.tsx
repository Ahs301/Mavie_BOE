import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { NewClientModal } from "./components/NewClientModal";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Clientes — Mavie Admin",
  robots: { index: false, follow: false },
}

export default async function ClientesPage() {
  // 🔐 Verificación server-side directa (doble protección)
  await requireAuth()
  const supabase = createClient();
  
  // Fetch real data from Supabase DB
  const { data: clients, error } = await supabase
    .from("clients")
    .select(`
      *,
      client_boe_configs (
        is_active, frequency
      )
    `)
    .order('created_at', { ascending: false });

  // Log error if any (to terminal)
  if (error) console.error("Error fetching clients:", error);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-neutral-400 text-sm mt-1">Control de estados, configuración y ejecución del Radar BOE.</p>
        </div>
        <NewClientModal />
      </div>

      <div className="bg-card border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-background/50">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Buscar por empresa o contacto..." 
              className="w-full bg-background border border-neutral-800 rounded-md h-10 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 text-foreground"
            />
          </div>
          <select className="bg-background w-full sm:w-auto border border-neutral-800 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 text-foreground">
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="pending">Pendientes / Leads</option>
            <option value="paused">Pausados</option>
          </select>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 bg-neutral-800/20 border-b border-neutral-800 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Empresa / Contacto</th>
                <th className="px-6 py-4 font-medium">Estado CRM</th>
                <th className="px-6 py-4 font-medium">Radar BOE</th>
                <th className="px-6 py-4 font-medium">Última Actividad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(!clients || clients.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No hay clientes registrados en la base de datos todavía.
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const boeConfig = Array.isArray(client.client_boe_configs)
                    ? client.client_boe_configs[0]
                    : client.client_boe_configs
                  const hasBoeConfig = !!boeConfig
                  const boeIsActive = hasBoeConfig && boeConfig.is_active

                  return (
                    <tr key={client.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          <Link href={`/dashboard/clientes/${client.id}`} className="hover:text-blue-400 transition-colors">
                            {client.company_name}
                          </Link>
                        </div>
                        <div className="text-neutral-500">{client.primary_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          client.status === 'activo' ? 'border-emerald-900/50 bg-emerald-900/20 text-emerald-400' :
                          client.status === 'onboarding_pendiente' ? 'border-amber-900/50 bg-amber-900/20 text-amber-400' :
                          'border-neutral-700 bg-neutral-800 text-neutral-300'
                        }`}>
                          {client.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {hasBoeConfig ? (
                          boeIsActive ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                              Activo ({boeConfig.frequency})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-500">
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                              Pausado
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-neutral-500">
                            <div className="h-1.5 w-1.5 rounded-full bg-neutral-500"></div>
                            No Configurado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-neutral-400">
                        {new Date(client.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/dashboard/clientes/${client.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-background hover:bg-neutral-800/40 text-neutral-500 hover:text-foreground text-xs font-semibold rounded-lg border border-neutral-800 transition-all"
                        >
                          Ver Detalles <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

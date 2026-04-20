import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type { Metadata } from "next";
import { ResolveIncidentBtn } from "./components/ResolveIncidentBtn";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Incidencias — Mavie Admin",
  robots: { index: false, follow: false },
}

export default async function IncidenciasPage() {
  // 🔐 Doble protección server-side
  await requireAuth()
  const supabase = createClient();
  
  const { data: incidents, error } = await supabase
    .from('incidents')
    .select(`
      *,
      clients ( company_name )
    `)
    .order('created_at', { ascending: false });

  if (error) console.error("Error fetching incidents:", error);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Logs e Incidencias</h1>
        <p className="text-neutral-400">Monitorización de errores y operaciones del Worker.</p>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-400 bg-neutral-900 border-b border-neutral-800 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Módulo</th>
                <th className="px-6 py-4 font-medium">Descripción</th>
                <th className="px-6 py-4 font-medium text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(!incidents || incidents.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No hay incidencias registradas en el sistema. Todo funciona correctamente.
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4 text-neutral-400 whitespace-nowrap">
                      {new Date(incident.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {incident.clients ? incident.clients.company_name : "General (Sistema)"}
                    </td>
                    <td className="px-6 py-4">
                      {incident.module}
                    </td>
                    <td className="px-6 py-4 max-w-md truncate" title={incident.description}>
                      {incident.description}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                       {incident.status === 'open' && (
                         <span className="inline-flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded-md text-xs">
                           <AlertTriangle className="w-3 h-3" /> Abierta
                         </span>
                       )}
                       {incident.status === 'in_progress' && (
                         <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md text-xs">
                           <Clock className="w-3 h-3" /> En Progreso
                         </span>
                       )}
                       <ResolveIncidentBtn incidentId={incident.id} isResolved={incident.status === 'resolved'} />
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

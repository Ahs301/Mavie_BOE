import { requireAuth } from "@/lib/auth"
import type { Metadata } from "next"
import { Settings, Shield, Bell, Key } from "lucide-react"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Configuración — Mavie Admin",
  robots: { index: false, follow: false },
}

export default async function ConfiguracionPage() {
  await requireAuth()

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-neutral-500" />
          Configuración
        </h1>
        <p className="text-neutral-500 mt-2">Ajustes globales del sistema, seguridad y accesos del Administrador.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seguridad Panel */}
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-white">Seguridad Activa</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-950/50 rounded-lg border border-neutral-800">
              <div>
                <p className="text-sm font-medium text-white">Doble Barricada SSR</p>
                <p className="text-xs text-neutral-500">Middleware + Server Verification activo</p>
              </div>
              <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                ON
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-neutral-950/50 rounded-lg border border-neutral-800">
              <div>
                <p className="text-sm font-medium text-white">Row Level Security (Supabase)</p>
                <p className="text-xs text-neutral-500">Base de datos bloqueada a accesos anónimos</p>
              </div>
              <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                ON
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones Panel */}
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-white">Alertas</h2>
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            Sistema de notificaciones por email en construcción. Próximamente.
          </p>
          <button disabled className="w-full py-2 bg-neutral-800 text-neutral-500 text-sm font-medium rounded-lg cursor-not-allowed">
            Próximamente
          </button>
        </div>

        {/* API Panel */}
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-white">Claves de API</h2>
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            Gestión de Webhooks para integraciones con Make o N8N.
          </p>
          <button disabled className="w-full py-2 bg-neutral-800 text-neutral-500 text-sm font-medium rounded-lg cursor-not-allowed">
            Próximamente
          </button>
        </div>
      </div>
    </div>
  )
}

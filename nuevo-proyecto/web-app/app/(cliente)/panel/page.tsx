import { getClienteData } from "@/app/actions/clienteActions"
import Link from "next/link"
import { CheckCircle, AlertCircle, Clock, Key, Mail, CreditCard } from "lucide-react"

const PLAN_LABELS: Record<string, string> = {
  basico: "Básico · 79€/mes",
  pro: "Pro · 179€/mes",
  business: "Business · 399€/mes",
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  activo: { label: "Activo", color: "text-green-400" },
  cancelado: { label: "Cancelado", color: "text-red-400" },
  pago_fallido: { label: "Pago fallido", color: "text-yellow-400" },
  listo_para_activar: { label: "Pendiente de activación", color: "text-blue-400" },
  pausado: { label: "Pausado", color: "text-neutral-400" },
}

export default async function PanelPage() {
  const { cliente, config, lastRun } = await getClienteData()

  const statusInfo = STATUS_LABELS[cliente.status ?? ""] ?? { label: cliente.status ?? "—", color: "text-neutral-400" }
  const planLabel = PLAN_LABELS[cliente.plan_activo ?? ""] ?? (cliente.plan_activo ?? "Sin plan")

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{cliente.company_name}</h1>
        <p className="text-neutral-500 text-sm mt-1">{cliente.primary_email}</p>
      </div>

      {/* Estado del servicio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Estado</p>
          <p className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.label}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Plan</p>
          <p className="text-sm font-semibold text-white">{planLabel}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Última ejecución</p>
          <p className="text-sm font-semibold text-white">
            {lastRun?.started_at
              ? new Date(lastRun.started_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
              : "Sin datos"}
          </p>
        </div>
      </div>

      {/* Configuración resumen */}
      {config && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Configuración actual</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400 flex items-center gap-2">
                <Key className="w-4 h-4" /> Keywords activas
              </span>
              <span className="text-white font-medium">
                {(config.keywords_positive?.length ?? 0)} positivas · {(config.keywords_negative?.length ?? 0)} negativas
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Destinatarios
              </span>
              <span className="text-white font-medium">{config.destination_emails?.length ?? 0} email(s)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Frecuencia
              </span>
              <span className="text-white font-medium capitalize">{config.frequency ?? "diario"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400 flex items-center gap-2">
                {config.is_active ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-yellow-400" />}
                Radar BOE
              </span>
              <span className={config.is_active ? "text-green-400 font-medium" : "text-yellow-400 font-medium"}>
                {config.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/panel/keywords"
          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl p-4 transition-colors group"
        >
          <Key className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">Gestionar Keywords</p>
          <p className="text-xs text-neutral-500 mt-0.5">Editar términos de búsqueda en el BOE</p>
        </Link>
        <Link
          href="/panel/destinatarios"
          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl p-4 transition-colors group"
        >
          <Mail className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">Gestionar Destinatarios</p>
          <p className="text-xs text-neutral-500 mt-0.5">Añadir o quitar emails de las alertas</p>
        </Link>
        <a
          href="/api/stripe/portal"
          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl p-4 transition-colors group sm:col-span-2"
        >
          <CreditCard className="w-5 h-5 text-neutral-400 mb-2" />
          <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">Facturación y suscripción</p>
          <p className="text-xs text-neutral-500 mt-0.5">Gestionar pago, cambiar plan o cancelar</p>
        </a>
      </div>
    </div>
  )
}

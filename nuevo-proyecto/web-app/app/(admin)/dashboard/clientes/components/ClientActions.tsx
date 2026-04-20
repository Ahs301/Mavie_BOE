"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Pause, ChevronDown, CheckCircle, Clock, XCircle, Edit } from "lucide-react"
import { toggleBoeConfigAction, updateClientStatusAction, addClientNoteAction } from "@/app/actions/crmActions"

export function BoeToggleBtn({ configId, isActive }: { configId: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    const res = await toggleBoeConfigAction(configId, !isActive)
    setLoading(false)
    if (!res.success) alert(res.error)
    else router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
        isActive 
          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20" 
          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
      }`}
    >
      {loading ? (
        <span className="w-3 h-3 rounded-full border-2 border-currentColor border-t-transparent animate-spin" />
      ) : isActive ? (
        <Pause className="w-3.5 h-3.5" />
      ) : (
        <Play className="w-3.5 h-3.5" />
      )}
      {isActive ? "Pausar Radar" : "Activar Radar"}
    </button>
  )
}

export function ClientStatusDropdown({ clientId, currentStatus }: { clientId: string, currentStatus: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const statuses = [
    { id: "listo_para_activar", label: "Listo para activar", icon: Clock, color: "text-amber-400" },
    { id: "activo", label: "Activo", icon: CheckCircle, color: "text-emerald-400" },
    { id: "pausado", label: "Pausado", icon: Pause, color: "text-neutral-400" },
    { id: "baja", label: "Baja / Cancelado", icon: XCircle, color: "text-red-400" },
  ]

  const active = statuses.find(s => s.id === currentStatus) || statuses[2]

  const handleSelect = async (statusId: string) => {
    setOpen(false)
    if (statusId === currentStatus) return
    setLoading(true)
    await updateClientStatusAction(clientId, statusId)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center justify-between min-w-[140px] px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm hover:bg-neutral-800 transition-colors"
      >
        <span className={`flex items-center gap-2 ${active.color} font-medium`}>
          <active.icon className="w-4 h-4" />
          {active.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
            {statuses.map(s => (
              <button
                key={s.id}
                onClick={() => handleSelect(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-800 transition-colors ${s.id === currentStatus ? "bg-neutral-800/50" : ""}`}
              >
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-neutral-300 font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

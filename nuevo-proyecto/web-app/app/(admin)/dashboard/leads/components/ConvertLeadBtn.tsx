"use client"

import { useState, useTransition } from "react"
import { convertLeadToClientAction } from "@/app/actions/crmActions"
import { ArrowRight, Loader2, UserCheck } from "lucide-react"

export function ConvertLeadBtn({ leadId, disabled }: { leadId: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(disabled)

  const handleConvert = () => {
    if (disabled || done) return
    startTransition(async () => {
      const res = await convertLeadToClientAction(leadId)
      if (res.success) {
        setDone(true)
      } else {
        alert(res.error || "Error al convertir el lead.")
      }
    })
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-500">
        <UserCheck className="w-3.5 h-3.5" /> Convertido
      </span>
    )
  }

  return (
    <button
      onClick={handleConvert}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Convirtiendo...</>
      ) : (
        <><ArrowRight className="w-3.5 h-3.5" /> Convertir a CRM</>
      )}
    </button>
  )
}

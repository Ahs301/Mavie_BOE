"use client"

import { useState, useTransition } from "react"
import { resolveIncidentAction } from "@/app/actions/crmActions"
import { CheckCircle, Loader2 } from "lucide-react"

export function ResolveIncidentBtn({ incidentId, isResolved }: { incidentId: string; isResolved: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [resolved, setResolved] = useState(isResolved)

  const handleResolve = () => {
    if (resolved || isPending) return

    startTransition(async () => {
      const res = await resolveIncidentAction(incidentId)
      if (res.success) {
        setResolved(true)
      } else {
        alert(res.error)
      }
    })
  }

  if (resolved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md text-xs font-medium cursor-default">
        <CheckCircle className="w-3.5 h-3.5" /> Resuelta
      </span>
    )
  }

  return (
    <button
      onClick={handleResolve}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md border border-emerald-500/20 text-emerald-400 bg-transparent hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> ...</>
      ) : (
        <><CheckCircle className="w-3.5 h-3.5" /> Marcar Resuelta</>
      )}
    </button>
  )
}

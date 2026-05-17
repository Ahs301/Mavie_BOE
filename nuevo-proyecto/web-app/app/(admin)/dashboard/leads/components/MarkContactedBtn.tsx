"use client"

import { useState, useTransition } from "react"
import { markLeadContactedAction } from "@/app/actions/crmActions"
import { Phone, Loader2, CheckCircle } from "lucide-react"

export function MarkContactedBtn({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-amber-400">
        <CheckCircle className="w-3.5 h-3.5" /> Marcado
      </span>
    )
  }

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const res = await markLeadContactedAction(leadId)
          if (res.success) setDone(true)
        })
      }
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
        </>
      ) : (
        <>
          <Phone className="w-3.5 h-3.5" /> Contactado
        </>
      )}
    </button>
  )
}

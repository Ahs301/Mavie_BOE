"use client"

import { useEffect, useState } from "react"
import { Server, Loader2 } from "lucide-react"

export function WorkerStats() {
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/captacion/health")
      .then(r => r.json())
      .then(d => setOnline(d.online === true))
      .catch(() => setOnline(false))
  }, [])

  if (online === null) {
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Conectando...
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border ${
      online
        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        : "text-red-400 bg-red-500/10 border-red-500/20"
    }`}>
      <Server className="w-4 h-4" />
      {online ? "VPS online" : "VPS offline"}
    </div>
  )
}

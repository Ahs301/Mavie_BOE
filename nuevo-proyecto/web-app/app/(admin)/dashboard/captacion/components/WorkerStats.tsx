"use client"

import { useEffect, useState } from "react"
import { Database, Server, Loader2 } from "lucide-react"

interface WorkerStats {
  total: number
  pending: number
  sent: number
  replied: number
  bounced: number
  opened: number
  clicked: number
}

export function WorkerStats() {
  const [stats, setStats] = useState<WorkerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/captacion/stats")
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setStats(data.stats)
      })
      .catch(err => setError("Error de conexión"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Conectando al VPS...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-400">
        <Server className="w-4 h-4" /> VPS offline
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5 text-emerald-400">
        <Server className="w-3.5 h-3.5" />
        <span className="font-medium">{stats?.sent || 0}</span>
        <span className="text-neutral-500">enviados</span>
      </div>
      <div className="flex items-center gap-1.5 text-blue-400">
        <Database className="w-3.5 h-3.5" />
        <span className="font-medium">{stats?.total || 0}</span>
        <span className="text-neutral-500">leads</span>
      </div>
      <div className="flex items-center gap-1.5 text-purple-400">
        <span className="font-medium">{stats?.opened || 0}</span>
        <span className="text-neutral-500">aperturas</span>
      </div>
    </div>
  )
}
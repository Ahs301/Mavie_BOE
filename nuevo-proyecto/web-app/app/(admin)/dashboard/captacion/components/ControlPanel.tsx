"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play, Square, Zap, Settings, Terminal,
  RefreshCw, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react"

type ProcessStatus = { scraping: boolean; sending: boolean; stats: Record<string, number> | null }
type LogEntry      = { ts: number; source: string; line: string }
type Config        = Record<string, string>

const API = (action: string, extra = "") =>
  `/api/captacion/control?action=${action}${extra}`

async function vpsPost(action: string, payload?: unknown) {
  const r = await fetch("/api/captacion/control", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  })
  return r.json()
}

// ─── Source badge colours ─────────────────────────────────────────────────────
function logColor(source: string) {
  if (source.includes("err"))    return "text-red-400"
  if (source === "send")         return "text-blue-400"
  if (source === "scrape")       return "text-emerald-400"
  if (source === "supabase")     return "text-purple-400"
  if (source === "control")      return "text-yellow-400"
  return "text-neutral-400"
}

// ─── ProcessCard ─────────────────────────────────────────────────────────────
function ProcessCard({
  label, running, color, onStart, onStop, loading,
}: {
  label: string; running: boolean; color: string
  onStart: () => void; onStop: () => void; loading: boolean
}) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${
      running ? `border-${color}-900/50 bg-${color}-500/5` : "border-neutral-800 bg-card"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${running ? `bg-${color}-400 animate-pulse` : "bg-neutral-600"}`} />
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
          running
            ? `text-${color}-400 bg-${color}-500/10 border-${color}-900/40`
            : "text-neutral-600 bg-neutral-900 border-neutral-800"
        }`}>
          {running ? "CORRIENDO" : "PARADO"}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          disabled={running || loading}
          onClick={onStart}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {loading && !running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          Iniciar
        </button>
        <button
          disabled={!running || loading}
          onClick={onStop}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/80 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          <Square className="w-3 h-3" />
          Parar
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ControlPanel() {
  const [status, setStatus]       = useState<ProcessStatus | null>(null)
  const [logs, setLogs]           = useState<LogEntry[]>([])
  const [sinceTs, setSinceTs]     = useState(0)
  const [config, setConfig]       = useState<Config>({})
  const [configEdit, setConfigEdit] = useState<Config>({})
  const [configOpen, setConfigOpen] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)
  const [customOpen, setCustomOpen] = useState(false)
  const [niche, setNiche]         = useState("")
  const [location, setLocation]   = useState("")
  const logsRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // Poll status every 5s
  useEffect(() => {
    const poll = async () => {
      try {
        const d = await fetch(API("status")).then(r => r.json())
        setStatus(d)
      } catch {}
    }
    poll()
    const id = setInterval(poll, 5_000)
    return () => clearInterval(id)
  }, [])

  // Poll logs every 3s
  useEffect(() => {
    const poll = async () => {
      try {
        const d = await fetch(API("logs", `&since=${sinceTs}`)).then(r => r.json())
        if (d.logs?.length) {
          setLogs(prev => [...prev, ...d.logs].slice(-300))
          setSinceTs(d.now)
        }
      } catch {}
    }
    poll()
    const id = setInterval(poll, 3_000)
    return () => clearInterval(id)
  }, [sinceTs])

  // Auto-scroll logs
  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight
  }, [logs])

  // Load config once
  useEffect(() => {
    fetch(API("config")).then(r => r.json()).then(d => {
      setConfig(d.config ?? {})
      setConfigEdit(d.config ?? {})
    }).catch(() => {})
  }, [])

  const action = async (act: string, payload?: unknown) => {
    setLoading(true)
    try {
      const d = await vpsPost(act, payload)
      if (d.error) showToast(d.error, false)
      else showToast(act === "stop" ? "Procesos detenidos" : "Iniciado correctamente")
      // Refresh status
      const s = await fetch(API("status")).then(r => r.json())
      setStatus(s)
    } catch {
      showToast("Error contactando VPS", false)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setLoading(true)
    try {
      const d = await vpsPost("config", configEdit)
      setConfig(d.config ?? configEdit)
      showToast("Configuración guardada")
      setConfigOpen(false)
    } catch {
      showToast("Error guardando config", false)
    } finally {
      setLoading(false)
    }
  }

  const running = status?.scraping || status?.sending

  return (
    <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400" /> Control del Motor
        </span>
        <div className="flex items-center gap-2">
          {status === null && <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-600" />}
          <button
            onClick={() => setConfigOpen(o => !o)}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Toast */}
        {toast && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
            toast.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-900/40"
                     : "bg-red-500/10 text-red-400 border border-red-900/40"
          }`}>
            {toast.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {toast.msg}
          </div>
        )}

        {/* Process cards */}
        <div className="grid grid-cols-2 gap-3">
          <ProcessCard
            label="Scraping"
            running={status?.scraping ?? false}
            color="emerald"
            loading={loading}
            onStart={() => action("scrape")}
            onStop={() => action("stop")}
          />
          <ProcessCard
            label="Envío de Emails"
            running={status?.sending ?? false}
            color="blue"
            loading={loading}
            onStart={() => action("send")}
            onStop={() => action("stop")}
          />
        </div>

        {/* Parallel + custom */}
        <div className="flex flex-col gap-2">
          <button
            disabled={loading || (status?.scraping && status?.sending)}
            onClick={() => action("parallel")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Scraping + Envío en Paralelo
          </button>

          <button
            disabled={loading}
            onClick={() => action("followup")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-neutral-700 hover:border-neutral-600 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Enviar Follow-ups (+4 días)
          </button>

          <button
            onClick={() => setCustomOpen(o => !o)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-neutral-700 hover:border-neutral-600 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <Play className="w-3 h-3" />
            Campaña personalizada (nicho + ciudad)
          </button>
        </div>

        {/* Custom campaign form */}
        {customOpen && (
          <div className="flex flex-col gap-2 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50">
            <input
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="Nicho (ej: abogados)"
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-foreground placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
            />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ciudad (ej: Madrid)"
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-foreground placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
            />
            <button
              disabled={loading || !niche || !location}
              onClick={() => { action("custom", { niche, location, limit: 100 }); setCustomOpen(false) }}
              className="w-full px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
            >
              Lanzar campaña
            </button>
          </div>
        )}

        {/* Config editor */}
        {configOpen && (
          <div className="flex flex-col gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">Configuración del motor</p>
            {[
              { key: "MAX_PER_DAY",   label: "Máx emails/día",    hint: "Límite Brevo" },
              { key: "MAX_PER_HOUR",  label: "Máx emails/hora",   hint: "Anti-spam" },
              { key: "SEND_DELAY_MS", label: "Delay entre emails (ms)", hint: "180000 = 3 min" },
              { key: "FROM_NAME",     label: "Nombre remitente",  hint: "" },
              { key: "FROM_EMAIL",    label: "Email remitente",   hint: "" },
              { key: "ENABLE_WARMUP", label: "Warmup activado",   hint: "true/false" },
            ].map(({ key, label, hint }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-[10px] text-neutral-500">
                  {label} {hint && <span className="text-neutral-700">— {hint}</span>}
                </label>
                <input
                  value={configEdit[key] ?? ""}
                  onChange={e => setConfigEdit(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-foreground focus:outline-none focus:border-neutral-500"
                />
              </div>
            ))}
            <button
              disabled={loading}
              onClick={saveConfig}
              className="w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-medium transition-colors"
            >
              {loading ? "Guardando..." : "Guardar configuración"}
            </button>
          </div>
        )}

        {/* Live logs terminal */}
        <div className="rounded-lg border border-neutral-800 overflow-hidden">
          <div className="px-3 py-2 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-neutral-500 flex items-center gap-1.5 uppercase tracking-wide">
              <Terminal className="w-3 h-3" /> Logs en vivo
            </span>
            <button
              onClick={() => setLogs([])}
              className="text-[10px] text-neutral-700 hover:text-neutral-500 transition-colors"
            >
              limpiar
            </button>
          </div>
          <div
            ref={logsRef}
            className="h-48 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed bg-neutral-950 flex flex-col gap-0.5"
          >
            {logs.length === 0 ? (
              <span className="text-neutral-700">Esperando actividad del motor...</span>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="flex gap-2 min-w-0">
                  <span className="text-neutral-700 shrink-0 tabular-nums">
                    {new Date(l.ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className={`shrink-0 ${logColor(l.source)}`}>[{l.source}]</span>
                  <span className="text-neutral-300 break-all">{l.line}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stop all */}
        {running && (
          <button
            disabled={loading}
            onClick={() => action("stop")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-red-900/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            Detener todo
          </button>
        )}

      </div>
    </div>
  )
}

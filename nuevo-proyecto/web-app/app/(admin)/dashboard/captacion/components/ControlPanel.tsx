"use client"
import { useState, useEffect, useRef } from "react"
import {
  Play, Square, Zap, Settings, Terminal,
  RefreshCw, AlertCircle, CheckCircle2, Loader2,
  WifiOff, Wifi, TriangleAlert, Layers,
} from "lucide-react"

type ProcessStatus = { scraping: boolean; sending: boolean; scrapeCmd: string | null; sendCmd: string | null; stats: Record<string, number> | null }
type LogEntry      = { ts: number; source: string; line: string }
type Config        = Record<string, string>

const API = (action: string, extra = "") => `/api/captacion/control?action=${action}${extra}`

async function vpsPost(action: string, payload?: unknown) {
  const r = await fetch("/api/captacion/control", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  })
  return r.json()
}

function logColor(source: string) {
  if (source.includes("err"))    return "text-red-400"
  if (source === "send")         return "text-blue-400"
  if (source === "scrape")       return "text-emerald-400"
  if (source === "supabase")     return "text-purple-400"
  if (source === "control")      return "text-yellow-400"
  return "text-neutral-400"
}

function ProcessCard({
  label, running, color, onStart, onStop, loading, compact,
}: {
  label: string; running: boolean; color: string
  onStart: () => void; onStop: () => void; loading: boolean; compact?: boolean
}) {
  return (
    <div className={`rounded-lg border px-2.5 py-2 flex items-center justify-between gap-2 ${
      running ? `border-${color}-900/50 bg-${color}-500/5` : "border-neutral-800 bg-card"
    }`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${running ? `bg-${color}-400 animate-pulse` : "bg-neutral-600"}`} />
        <span className={`${compact ? "text-[10px]" : "text-xs"} font-semibold text-foreground truncate`}>{label}</span>
      </div>
      <div className="flex gap-1 shrink-0">
        <button disabled={running || loading} onClick={onStart}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {loading && !running ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
          Iniciar
        </button>
        <button disabled={!running || loading} onClick={onStop}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-red-600/80 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          <Square className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  )
}

export function ControlPanel() {
  const [status, setStatus]       = useState<ProcessStatus | null>(null)
  const [vpsOnline, setVpsOnline] = useState<boolean | null>(null)
  const [vpsError, setVpsError]   = useState<string | null>(null)
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
  const lastStartedRef = useRef<{ key: string; ts: number } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const poll = async () => {
      try {
        const d = await fetch(API("status")).then(r => r.json())
        if (d.error) { setVpsError(d.error); setVpsOnline(false); setStatus(null); return }
        setVpsError(null); setVpsOnline(true)
        if (lastStartedRef.current) {
          const { key, ts } = lastStartedRef.current
          const elapsed = Date.now() - ts
          const wasRunning = key === "scrape" ? d.scraping : d.sending
          if (!wasRunning && elapsed < 10_000) {
            lastStartedRef.current = null
          } else if (wasRunning) {
            lastStartedRef.current = null
          }
        }
        setStatus(d)
      } catch { setVpsOnline(false); setStatus(null) }
    }
    poll(); const id = setInterval(poll, 15_000); return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const poll = async () => {
      try {
        const d = await fetch(API("logs", `&since=${sinceTs}`)).then(r => r.json())
        if (d.logs?.length) { setLogs(prev => [...prev, ...d.logs].slice(-300)); setSinceTs(d.now) }
      } catch {}
    }
    poll(); const id = setInterval(poll, 10_000); return () => clearInterval(id)
  }, [sinceTs])

  useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight }, [logs])

  useEffect(() => {
    fetch(API("config")).then(r => r.json()).then(d => { setConfig(d.config ?? {}); setConfigEdit(d.config ?? {}) }).catch(() => {})
  }, [])

  const action = async (act: string, payload?: unknown) => {
    setLoading(true)
    try {
      const d = await vpsPost(act, payload)
      if (d.error) { showToast(d.error, false) }
      else if (act === "stop") { showToast("Procesos detenidos"); lastStartedRef.current = null }
      else { const key = act.includes("scrape") ? "scrape" : "send"; lastStartedRef.current = { key, ts: Date.now() }; showToast("Iniciado") }
      const s = await fetch(API("status")).then(r => r.json()); setStatus(s)
    } catch { showToast("Error contactando VPS", false); setVpsOnline(false) }
    finally { setLoading(false) }
  }

  const saveConfig = async () => {
    setLoading(true)
    try {
      const d = await vpsPost("config", configEdit); setConfig(d.config ?? configEdit); showToast("Config guardada"); setConfigOpen(false)
    } catch { showToast("Error guardando config", false) }
    finally { setLoading(false) }
  }

  const running = status?.scraping || status?.sending
  const scrapeTodoRunning = Boolean(status?.scraping && status?.scrapeCmd === "scrape-todo-start")

  return (
    <div className="flex flex-col gap-4">

      {/* VPS offline banner */}
      {vpsOnline === false && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-900/40">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>VPS no accesible — {vpsError || "error de conexión"}</span>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
          toast.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-900/40" : "bg-red-500/10 text-red-400 border border-red-900/40"
        }`}>
          {toast.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {toast.msg}
        </div>
      )}

      {/* ════════ SCRAPER TOTAL — Hero section ════════ */}
      <div className="rounded-xl border border-amber-900/40 bg-amber-500/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-amber-900/30 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Scraper Total — 165k combos
          </span>
          <div className="flex items-center gap-2">
            {scrapeTodoRunning && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-900/40 px-2 py-0.5 rounded-full">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Infinito ON
              </span>
            )}
            <button onClick={() => setConfigOpen(o => !o)} className="p-1 rounded hover:bg-amber-900/30 text-amber-500/60 hover:text-amber-400 transition-colors">
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="p-3 sm:p-4 flex flex-col gap-3">
          <p className="text-[10px] text-amber-400/60 leading-relaxed">
            <Layers className="w-3 h-3 inline-block mr-1" />
            550 tipos de nicho × 300 ubicaciones = 165k combinaciones. En infinito, cuando acaba un ciclo,
            espera 60s y empieza otro (Google Maps cambia cada día). Los leads se guardan en <code className="bg-amber-950/40 px-1 rounded">Todo_Leads.csv</code>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ProcessCard
              label="Scraper Total Infinito"
              running={scrapeTodoRunning}
              color="amber"
              loading={loading}
              onStart={() => action("scrape-todo-start")}
              onStop={() => action("stop")}
              compact
            />
            <button disabled={loading || status?.scraping} onClick={() => action("scrape-todo")}
              className="flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            ><Play className="w-2.5 h-2.5" /> 1 Ciclo</button>
            <button disabled={loading} onClick={() => action("send-todo")}
              className="flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            ><Play className="w-2.5 h-2.5" /> Enviar leads Todo</button>
            <button disabled={loading || running} onClick={() => action("parallel-todo")}
              className="flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-semibold bg-gradient-to-r from-amber-600 to-blue-600 hover:from-amber-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            ><Zap className="w-2.5 h-2.5" /> Scrape Infinito + Envío</button>
            <button disabled={loading || status?.scraping} onClick={() => action("scrape-todo-send")}
              className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-semibold bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            ><Zap className="w-2.5 h-2.5" /> 1 Ciclo Scrape + Envío automático</button>
          </div>
        </div>
      </div>

      {/* ════════ V1 — leads existentes ════════ */}
      <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Base actual (~18k leads)</span>
          <span className="text-[9px] text-neutral-600">gestorías, consultoras, licitaciones</span>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <ProcessCard
              label="Scraping V1"
              running={!!(status?.scraping && status?.scrapeCmd === "scrape-spain")}
              color="emerald" loading={loading}
              onStart={() => action("scrape")} onStop={() => action("stop")} compact
            />
            <ProcessCard
              label="Envío V1"
              running={!!(status?.sending && status?.sendCmd === "send-all")}
              color="blue" loading={loading}
              onStart={() => action("send")} onStop={() => action("stop")} compact
            />
            <button disabled={loading || (status?.scraping || status?.sending)} onClick={() => action("parallel")}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            ><Zap className="w-2.5 h-2.5" /> Paralelo</button>
          </div>
        </div>
      </div>

      {/* ════════ V2 — nuevos sectores ════════ */}
      <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Nuevos sectores (20 campañas)</span>
          <span className="text-[9px] text-neutral-600">clínicas, hoteles, industria</span>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <ProcessCard
              label="Scraping V2"
              running={!!(status?.scraping && status?.scrapeCmd === "scrape-spain-v2")}
              color="emerald" loading={loading}
              onStart={() => action("scrape-v2")} onStop={() => action("stop")} compact
            />
            <ProcessCard
              label="Envío V2"
              running={!!(status?.sending && status?.sendCmd === "send-new")}
              color="purple" loading={loading}
              onStart={() => action("send-new")} onStop={() => action("stop")} compact
            />
            <button disabled={loading || (status?.scraping || status?.sending)} onClick={() => action("parallel-v2")}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] font-semibold bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            ><Zap className="w-2.5 h-2.5" /> Paralelo</button>
          </div>
        </div>
      </div>

      {/* ════════ Acciones comunes ════════ */}
      <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Acciones comunes</span>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button disabled={loading} onClick={() => action("followup")}
              className="flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-medium border border-neutral-700 hover:border-neutral-600 text-neutral-400 hover:text-neutral-200 transition-colors"
            ><RefreshCw className="w-2.5 h-2.5" /> Follow-ups (+4 días)</button>
            <button onClick={() => setCustomOpen(o => !o)}
              className="flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-medium border border-neutral-700 hover:border-neutral-600 text-neutral-400 hover:text-neutral-200 transition-colors"
            ><Play className="w-2.5 h-2.5" /> Campaña personalizada</button>
          </div>
          {customOpen && (
            <div className="flex flex-col gap-2 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <input value={niche} onChange={e => setNiche(e.target.value)}
                placeholder="Nicho (ej: abogados)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-foreground placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
              />
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Ciudad (ej: Madrid)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-foreground placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
              />
              <button disabled={loading || !niche || !location} onClick={() => { action("custom", { niche, location, limit: 100 }); setCustomOpen(false) }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
              >Lanzar campaña</button>
            </div>
          )}
        </div>
      </div>

      {/* ════════ Config editor ════════ */}
      {configOpen && (
        <div className="rounded-xl border border-amber-900/40 bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-amber-900/30">
            <span className="text-[10px] font-semibold text-amber-400">Configuración del motor</span>
          </div>
          <div className="p-3 flex flex-col gap-2.5">
            {[
              { key: "MAX_PER_DAY", label: "Máx emails/día", hint: "Límite Brevo" },
              { key: "MAX_PER_HOUR", label: "Máx emails/hora", hint: "Anti-spam" },
              { key: "SEND_DELAY_MS", label: "Delay entre emails (ms)", hint: "180000 = 3 min" },
              { key: "FROM_NAME", label: "Nombre remitente", hint: "" },
              { key: "FROM_EMAIL", label: "Email remitente", hint: "" },
              { key: "ENABLE_WARMUP", label: "Warmup activado", hint: "true/false" },
            ].map(({ key, label, hint }) => (
              <div key={key} className="flex flex-col gap-0.5">
                <label className="text-[9px] text-neutral-500">{label} {hint && <span className="text-neutral-700">— {hint}</span>}</label>
                <input value={configEdit[key] ?? ""}
                  onChange={e => setConfigEdit(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-foreground focus:outline-none focus:border-neutral-500"
                />
              </div>
            ))}
            <button disabled={loading} onClick={saveConfig}
              className="w-full px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-medium transition-colors"
            >{loading ? "Guardando..." : "Guardar configuración"}</button>
          </div>
        </div>
      )}

      {/* ════════ Live Logs (siempre visible) ════════ */}
      <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
            <Terminal className="w-3 h-3" /> Logs en vivo {logs.length > 0 && `(${logs.length})`}
          </span>
          <button onClick={() => setLogs([])} className="text-[9px] text-neutral-700 hover:text-neutral-500 transition-colors">limpiar</button>
        </div>
        <div ref={logsRef} className="h-48 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed bg-neutral-950 flex flex-col gap-0.5">
          {logs.length === 0 ? (
            <span className="text-neutral-700">Esperando actividad del motor...</span>
          ) : logs.map((l, i) => (
            <div key={i} className="flex gap-2 min-w-0">
              <span className="text-neutral-700 shrink-0 tabular-nums">{new Date(l.ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
              <span className={`shrink-0 ${logColor(l.source)}`}>[{l.source}]</span>
              <span className="text-neutral-300 break-all">{l.line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stop all */}
      {running && (
        <button disabled={loading} onClick={() => action("stop")}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-red-900/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
        >
          <Square className="w-3.5 h-3.5" /> Detener todo
        </button>
      )}
    </div>
  )
}

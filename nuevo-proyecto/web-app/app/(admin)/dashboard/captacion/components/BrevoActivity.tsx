"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Mail, Eye, MousePointerClick, RefreshCw, MessageSquareReply,
  Send, AlertCircle, CheckCircle2, Clock, Loader2, TrendingUp,
  ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react"

// ─── Types from Brevo API ─────────────────────────────────────────────────────
type BrevoEvent = {
  name: string   // "requests" | "delivered" | "opened" | "clicks" | "softBounces" | "hardBounces" | "unsubscribes"
  time: string
}

type BrevoEmail = {
  email: string
  subject: string
  date: string
  messageId?: string
  uuid?: string
  from?: string
  tags?: string[]
  events?: BrevoEvent[]
}

type FlatEvent = {
  email: string
  subject: string
  event: string
  date: string
}

type BrevoAggregated = {
  delivered?: number
  opens?: number
  clicks?: number
  bounces?: number
  softBounces?: number
  hardBounces?: number
  unsubscribes?: number
  spamReports?: number
  requests?: number
  uniqueClicks?: number
  uniqueViews?: number
}

type TabKey = "actividad" | "respuestas"

// ─── Event metadata ───────────────────────────────────────────────────────────
const EVENT_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  delivered:   { label: "Entregado",   color: "text-emerald-400 bg-emerald-500/10 border-emerald-900/40", icon: <CheckCircle2 className="w-3 h-3" /> },
  opened:      { label: "Abierto",     color: "text-blue-400 bg-blue-500/10 border-blue-900/40",          icon: <Eye className="w-3 h-3" /> },
  clicks:      { label: "Clicado",     color: "text-purple-400 bg-purple-500/10 border-purple-900/40",    icon: <MousePointerClick className="w-3 h-3" /> },
  click:       { label: "Clicado",     color: "text-purple-400 bg-purple-500/10 border-purple-900/40",    icon: <MousePointerClick className="w-3 h-3" /> },
  requests:    { label: "Enviado",     color: "text-neutral-400 bg-neutral-800 border-neutral-700",       icon: <Send className="w-3 h-3" /> },
  sent:        { label: "Enviado",     color: "text-neutral-400 bg-neutral-800 border-neutral-700",       icon: <Send className="w-3 h-3" /> },
  hardbounces: { label: "Hard bounce", color: "text-red-400 bg-red-500/10 border-red-900/40",             icon: <AlertCircle className="w-3 h-3" /> },
  softbounces: { label: "Soft bounce", color: "text-orange-400 bg-orange-500/10 border-orange-900/40",   icon: <AlertCircle className="w-3 h-3" /> },
  bounced:     { label: "Rebotado",    color: "text-red-400 bg-red-500/10 border-red-900/40",             icon: <AlertCircle className="w-3 h-3" /> },
  unsubscribes:{ label: "Baja",        color: "text-neutral-500 bg-neutral-900 border-neutral-800",       icon: <AlertCircle className="w-3 h-3" /> },
  reply:       { label: "Respuesta",   color: "text-yellow-400 bg-yellow-500/10 border-yellow-900/40",    icon: <MessageSquareReply className="w-3 h-3" /> },
}

function EventBadge({ event }: { event: string }) {
  const key = event.toLowerCase()
  const meta = EVENT_META[key] ?? {
    label: event,
    color: "text-neutral-400 bg-neutral-800 border-neutral-700",
    icon: <Mail className="w-3 h-3" />,
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${meta.color}`}>
      {meta.icon}
      {meta.label}
    </span>
  )
}

function fmtDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("es-ES", {
      day: "2-digit", month: "2-digit",
      hour: "2-digit", minute: "2-digit",
    })
  } catch { return dateStr }
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function StatKpi({
  label, value, sub, icon, accent,
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
  accent: "emerald" | "blue" | "purple" | "orange" | "neutral"
}) {
  const colors: Record<string, string> = {
    emerald: "border-emerald-900/40",
    blue:    "border-blue-900/40",
    purple:  "border-purple-900/40",
    orange:  "border-orange-900/40",
    neutral: "border-neutral-800",
  }
  return (
    <div className={`rounded-xl border ${colors[accent]} bg-card p-3`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] uppercase tracking-wide text-neutral-500">{label}</span>
        {icon}
      </div>
      <div className="text-xl font-bold text-foreground tabular-nums">{value}</div>
      {sub && <div className="text-[10px] text-neutral-600 mt-0.5">{sub}</div>}
    </div>
  )
}

// ─── Funnel bar ───────────────────────────────────────────────────────────────
function FunnelBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="relative h-1.5 bg-neutral-800 rounded-full overflow-hidden w-full">
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function BrevoActivity() {
  const [tab, setTab]               = useState<TabKey>("actividad")
  const [flatEvents, setFlatEvents] = useState<FlatEvent[]>([])
  const [agg, setAgg]               = useState<BrevoAggregated | null>(null)
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [updatedAt, setUpdatedAt]   = useState<Date | null>(null)
  const [showAll, setShowAll]       = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const [evRes, aggRes] = await Promise.all([
        fetch("/api/brevo/emails?limit=100&sort=desc"),
        fetch("/api/brevo/stats"),
      ])

      if (evRes.ok) {
        const d = await evRes.json()
        const raw: FlatEvent[] = d.events ?? []
        setFlatEvents(raw)
      } else {
        const err = await evRes.json().catch(() => ({}))
        setError(err?.error || err?.message || "No se pudo conectar con Brevo.")
      }

      if (aggRes.ok) {
        const d = await aggRes.json()
        setAgg(d)
      }

      setUpdatedAt(new Date())
    } catch {
      setError("Error de red al conectar con Brevo.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  // Auto-refresh each 2 minutes
  useEffect(() => {
    const id = setInterval(() => load(true), 120_000)
    return () => clearInterval(id)
  }, [load])

  // ── Replies: events whose event=reply or subject starts with "Re:" ────────
  const replies = flatEvents.filter(e =>
    e.event?.toLowerCase() === "reply" ||
    (e.subject ?? "").toLowerCase().startsWith("re:")
  )

  // ── Compute local counts from flat events (fallback if agg null) ──────────
  const localDelivered = flatEvents.filter(e => e.event === "delivered").length
  const localOpens     = flatEvents.filter(e => e.event === "opened").length
  const localClicks    = flatEvents.filter(e => ["clicks","click"].includes(e.event)).length

  const displayDelivered = agg?.delivered ?? localDelivered
  const displayOpens     = agg?.opens     ?? localOpens
  const displayClicks    = agg?.clicks    ?? localClicks
  const displayBounces   = (agg?.softBounces ?? 0) + (agg?.hardBounces ?? 0)

  const openPct  = displayDelivered > 0 ? (displayOpens / displayDelivered) * 100 : 0
  const clickPct = displayDelivered > 0 ? (displayClicks / displayDelivered) * 100 : 0

  const openRate  = displayDelivered > 0 ? openPct.toFixed(1) + "%" : "--"
  const clickRate = displayDelivered > 0 ? clickPct.toFixed(1) + "%" : "--"

  const visibleFeed = showAll ? flatEvents : flatEvents.slice(0, 5)

  return (
    <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-blue-400" />
          Actividad Brevo
          {!error && agg && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-900/40 px-1.5 py-0.5 rounded-full ml-1">
              Live
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {updatedAt && (
            <span className="text-[10px] text-neutral-700 tabular-nums flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {updatedAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => load(true)}
            disabled={loading || refreshing}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <a
            href="https://app.brevo.com/transactional/logs"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors"
            title="Ver en Brevo"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Error */}
        {error && (
          <div className="flex flex-col gap-1 px-3 py-2.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-900/40">
            <span className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Error al conectar con Brevo
            </span>
            <span className="text-red-400/70 text-[10px]">{error}</span>
            <span className="text-red-400/50 text-[10px]">
              ¿Tienes <code className="bg-red-950/40 px-1 rounded">BREVO_API_KEY</code> en Vercel env vars?
            </span>
          </div>
        )}

        {/* KPIs */}
        {loading && !agg ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <StatKpi
                label="Entregados"
                value={displayDelivered.toLocaleString("es-ES")}
                sub={`de ${(agg?.requests ?? flatEvents.length).toLocaleString("es-ES")} enviados`}
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                accent="emerald"
              />
              <StatKpi
                label="Abiertos"
                value={displayOpens.toLocaleString("es-ES")}
                sub={`Open rate ${openRate}`}
                icon={<Eye className="w-3.5 h-3.5 text-blue-400" />}
                accent="blue"
              />
              <StatKpi
                label="Clics"
                value={displayClicks.toLocaleString("es-ES")}
                sub={`CTR ${clickRate}`}
                icon={<MousePointerClick className="w-3.5 h-3.5 text-purple-400" />}
                accent="purple"
              />
              <StatKpi
                label="Respuestas"
                value={replies.length}
                sub={replies.length > 0 ? "¡Interesados detectados!" : "Ninguna aún"}
                icon={<MessageSquareReply className="w-3.5 h-3.5 text-yellow-400" />}
                accent="orange"
              />
            </div>

            {/* Bounces warning */}
            {displayBounces > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] bg-red-500/5 border border-red-900/30 text-red-400/70">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {displayBounces} bounces (rebotes) — Brevo los ha bloqueado automáticamente por seguridad para proteger tu dominio.
              </div>
            )}

            {/* Funnel */}
            {displayDelivered > 0 && (
              <div className="flex flex-col gap-2 p-3 rounded-lg border border-neutral-800 bg-neutral-900/40">
                <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Embudo de conversión
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500">Entregados</span>
                    <span className="text-emerald-400 font-medium">{displayDelivered.toLocaleString("es-ES")}</span>
                  </div>
                  <FunnelBar pct={100} color="bg-emerald-600/60" />

                  <div className="flex items-center justify-between text-[10px] mt-0.5">
                    <span className="text-neutral-500">Abiertos</span>
                    <span className="text-blue-400 font-medium">{openRate}</span>
                  </div>
                  <FunnelBar pct={openPct} color="bg-blue-500" />

                  <div className="flex items-center justify-between text-[10px] mt-0.5">
                    <span className="text-neutral-500">Clicados</span>
                    <span className="text-purple-400 font-medium">{clickRate}</span>
                  </div>
                  <FunnelBar pct={clickPct} color="bg-purple-500" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 -mx-4 px-4 gap-1">
          {([
            { key: "actividad" as TabKey, label: "Actividad reciente", count: flatEvents.length },
            { key: "respuestas" as TabKey, label: "Respuestas", count: replies.length, highlight: replies.length > 0 },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  t.highlight ? "bg-yellow-500/20 text-yellow-400" : "bg-neutral-800 text-neutral-500"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Actividad */}
        {tab === "actividad" && (
          <div className="flex flex-col -mx-4">
            {loading && flatEvents.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
              </div>
            ) : flatEvents.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-neutral-700">
                No hay actividad reciente en Brevo.
              </div>
            ) : (
              <>
                <div className="divide-y divide-neutral-800/40">
                  {visibleFeed.map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-800/20 transition-colors"
                    >
                      <EventBadge event={ev.event} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground truncate font-medium">{ev.email}</p>
                        <p className="text-[10px] text-neutral-600 truncate mt-0.5">{ev.subject}</p>
                      </div>
                      <span className="text-[10px] text-neutral-700 shrink-0 tabular-nums whitespace-nowrap">
                        {fmtDate(ev.date)}
                      </span>
                    </div>
                  ))}
                </div>
                {flatEvents.length > 5 && (
                  <button
                    onClick={() => setShowAll(p => !p)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-[10px] text-neutral-500 hover:text-neutral-300 border-t border-neutral-800 transition-colors"
                  >
                    {showAll
                      ? <><ChevronUp className="w-3 h-3" /> Mostrar menos</>
                      : <><ChevronDown className="w-3 h-3" /> Ver {flatEvents.length - 5} más</>
                    }
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Respuestas */}
        {tab === "respuestas" && (
          <div className="flex flex-col gap-2">
            {replies.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquareReply className="w-8 h-8 text-neutral-800 mx-auto mb-2" />
                <p className="text-xs text-neutral-600">Sin respuestas detectadas aún.</p>
                <p className="text-[10px] text-neutral-700 mt-1">
                  Los emails respondidos (asunto "Re:...") aparecerán aquí.
                </p>
              </div>
            ) : (
              replies.map((em, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 px-3 py-2.5 rounded-lg border border-yellow-900/40 bg-yellow-500/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-yellow-400 flex items-center gap-1.5 truncate">
                      <MessageSquareReply className="w-3.5 h-3.5 shrink-0" />
                      {em.email}
                    </span>
                    <span className="text-[10px] text-neutral-600 tabular-nums shrink-0">
                      {fmtDate(em.date)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 truncate">{em.subject}</p>
                  <p className="text-[10px] text-neutral-600">
                    Dominio: <span className="text-neutral-400">{em.email.split("@")[1]}</span>
                  </p>
                  <a
                    href={`mailto:${em.email}`}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Mail className="w-3 h-3" /> Responder ahora
                  </a>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}

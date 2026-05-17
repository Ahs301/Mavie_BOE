"use client"

import * as React from "react"
import Link from "next/link"
import {
  Inbox,
  RefreshCw,
  Mail,
  MailOpen,
  ExternalLink,
  User,
  ArrowRight,
  AlertCircle,
  Settings,
} from "lucide-react"

interface GmailMessage {
  uid: number
  seq: number
  from: string
  fromEmail: string
  subject: string
  date: string
  snippet: string
  isUnread: boolean
  isLead: boolean
  leadId: string | null
  leadName: string | null
  leadStatus: string | null
}

interface EmailDetail {
  subject: string
  from: string
  date: string
  html: string | null
  text: string | null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `hace ${mins}m`
  if (hours < 24) return `hace ${hours}h`
  return `hace ${days}d`
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}

export default function InboxPage() {
  const [messages, setMessages] = React.useState<GmailMessage[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [configured, setConfigured] = React.useState(true)
  const [selected, setSelected] = React.useState<GmailMessage | null>(null)
  const [detail, setDetail] = React.useState<EmailDetail | null>(null)
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [filter, setFilter] = React.useState<"all" | "leads" | "unread">("all")

  const fetchMessages = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/gmail")
      const data = await res.json()
      if (!data.configured) {
        setConfigured(false)
        return
      }
      if (data.error) throw new Error(data.error)
      setMessages(data.messages ?? [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchMessages() }, [fetchMessages])

  const loadDetail = async (msg: GmailMessage) => {
    setSelected(msg)
    setDetail(null)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/gmail/${msg.uid}`)
      const data = await res.json()
      setDetail(data)
      // Mark as read locally
      setMessages(prev => prev.map(m => m.uid === msg.uid ? { ...m, isUnread: false } : m))
    } catch {
      setDetail({ subject: msg.subject, from: msg.from, date: msg.date, html: null, text: msg.snippet })
    } finally {
      setDetailLoading(false)
    }
  }

  const filtered = messages.filter(m => {
    if (filter === "leads") return m.isLead
    if (filter === "unread") return m.isUnread
    return true
  })

  const unreadCount = messages.filter(m => m.isUnread).length
  const leadCount = messages.filter(m => m.isLead).length

  if (!configured) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Inbox className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-foreground">Bandeja de Gmail</h1>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-300 mb-3">Gmail no configurado</p>
              <p className="text-sm text-neutral-400 mb-4">
                Añade estas variables en <strong>Vercel → Settings → Environment Variables</strong> y haz Redeploy:
              </p>
              <div className="bg-neutral-950 rounded-lg p-4 font-mono text-sm space-y-1 border border-neutral-800">
                <div><span className="text-blue-400">GMAIL_USER</span><span className="text-neutral-500">=mavie.contact.dev@gmail.com</span></div>
                <div><span className="text-blue-400">GMAIL_APP_PASSWORD</span><span className="text-neutral-500">=xxxx xxxx xxxx xxxx</span></div>
              </div>
              <p className="text-xs text-neutral-500 mt-3">
                Para obtener el App Password: Gmail → Cuenta Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicación → Correo → Otro
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — email list */}
      <div className="w-96 shrink-0 border-r border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Inbox className="w-5 h-5 text-blue-400" />
              Bandeja Gmail
              {unreadCount > 0 && (
                <span className="text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1">
            {([
              { key: "all", label: "Todos", count: messages.length },
              { key: "leads", label: "Leads", count: leadCount },
              { key: "unread", label: "No leídos", count: unreadCount },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "flex-1 text-xs font-medium py-1.5 rounded-md transition-colors",
                  filter === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                )}
              >
                {tab.label} {tab.count > 0 && <span className="opacity-70">({tab.count})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-5 h-5 animate-spin text-neutral-500" />
              <span className="ml-2 text-sm text-neutral-500">Cargando Gmail…</span>
            </div>
          )}

          {error && (
            <div className="m-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">Error al conectar Gmail</p>
                  <p className="text-xs text-neutral-500 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16">
              <Inbox className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">No hay mensajes</p>
            </div>
          )}

          {!loading && filtered.map(msg => (
            <button
              key={msg.uid}
              onClick={() => loadDetail(msg)}
              className={cn(
                "w-full text-left px-4 py-3.5 border-b border-neutral-800/50 transition-colors hover:bg-neutral-800/30",
                selected?.uid === msg.uid && "bg-blue-950/20 border-l-2 border-l-blue-500",
                msg.isUnread && "bg-neutral-800/10"
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {msg.isUnread
                    ? <Mail className="w-4 h-4 text-blue-400" />
                    : <MailOpen className="w-4 h-4 text-neutral-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={cn("text-sm truncate", msg.isUnread ? "font-semibold text-foreground" : "text-neutral-400")}>
                      {msg.from.split("<")[0].trim() || msg.fromEmail}
                    </span>
                    <span className="text-xs text-neutral-600 shrink-0">{timeAgo(msg.date)}</span>
                  </div>
                  <p className={cn("text-xs truncate mb-1", msg.isUnread ? "text-neutral-300" : "text-neutral-500")}>
                    {msg.subject}
                  </p>
                  {msg.isLead && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                      <User className="w-2.5 h-2.5" /> {msg.leadName || "Lead"}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel — email detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Inbox className="w-12 h-12 text-neutral-700 mb-4" />
            <p className="text-neutral-500 text-sm">Selecciona un email para leerlo</p>
            <p className="text-neutral-700 text-xs mt-1">Los emails de leads aparecen marcados en verde</p>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Detail header */}
            <div className="px-6 py-4 border-b border-neutral-800 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-foreground truncate">{selected.subject}</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    De: <span className="text-neutral-300">{selected.from}</span>
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {new Date(selected.date).toLocaleString("es-ES", {
                      weekday: "short", day: "2-digit", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selected.isLead && selected.leadId && (
                    <Link
                      href={`/dashboard/leads`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    >
                      <User className="w-3 h-3" /> Ver lead <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  <a
                    href={`mailto:${selected.fromEmail}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="w-3 h-3" /> Responder
                  </a>
                  <a
                    href={`https://mail.google.com/mail/u/0/#inbox`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors"
                    title="Abrir en Gmail"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Email body */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-5 h-5 animate-spin text-neutral-500" />
                  <span className="ml-2 text-sm text-neutral-500">Cargando…</span>
                </div>
              ) : detail ? (
                detail.html ? (
                  <div
                    className="prose prose-invert prose-sm max-w-none text-neutral-300 text-sm leading-relaxed"
                    // Email HTML can contain style tags — render in a sandboxed way
                    dangerouslySetInnerHTML={{
                      __html: detail.html
                        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                        .replace(/on\w+="[^"]*"/gi, ""),
                    }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-300 leading-relaxed">
                    {detail.text || selected.snippet || "(sin contenido)"}
                  </pre>
                )
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-300 leading-relaxed">
                  {selected.snippet}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

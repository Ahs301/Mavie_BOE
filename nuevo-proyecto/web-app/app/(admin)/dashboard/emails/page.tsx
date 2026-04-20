"use client"

import { useEffect, useState } from "react"
import { Mail, Send, TrendingUp, MousePointerClick, AlertTriangle, BarChart2, Inbox, RefreshCw, ExternalLink, Clock } from "lucide-react"

type Tab = "transaccionales" | "campañas" | "contactos"

interface BrevoStats {
  requests?: number
  delivered?: number
  hardBounces?: number
  softBounces?: number
  clicks?: number
  uniqueClicks?: number
  opens?: number
  uniqueOpens?: number
  spamReports?: number
  blocked?: number
  invalid?: number
  unsubscribed?: number
}

interface BrevoEmail {
  messageId?: string
  email?: string
  subject?: string
  date?: string
  event?: string
  tags?: string[]
}

interface BrevoCampaign {
  id: number
  name: string
  subject: string
  status: string
  statistics?: {
    campaignStats?: Array<{
      delivered?: number
      uniqueClicks?: number
      uniqueOpens?: number
      unsubscriptions?: number
    }>
  }
  scheduledAt?: string
  sentDate?: string
}

interface BrevoContact {
  id: number
  email: string
  emailBlacklisted?: boolean
  smsBlacklisted?: boolean
  createdAt?: string
  attributes?: Record<string, unknown>
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-card p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} bg-current/10`}>
        <Icon className="w-5 h-5 text-current" style={{ color: "inherit" }} />
      </div>
      <div>
        <div className="text-xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-neutral-500">{label}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    opened: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    clicked: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    bounced: "bg-red-500/10 text-red-400 border-red-500/20",
    "hard_bounce": "bg-red-500/10 text-red-400 border-red-500/20",
    "soft_bounce": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    spam: "bg-red-500/10 text-red-400 border-red-500/20",
    unsubscribed: "bg-neutral-500/10 text-neutral-500 border-neutral-700",
  }
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${map[status] ?? "bg-neutral-500/10 text-neutral-400 border-neutral-700"}`}>
      {status}
    </span>
  )
}

export default function EmailsPage() {
  const [tab, setTab] = useState<Tab>("transaccionales")
  const [stats, setStats] = useState<BrevoStats | null>(null)
  const [emails, setEmails] = useState<BrevoEmail[]>([])
  const [campaigns, setCampaigns] = useState<BrevoCampaign[]>([])
  const [contacts, setContacts] = useState<BrevoContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [statsRes, emailsRes, campaignsRes, contactsRes] = await Promise.all([
        fetch("/api/brevo/stats"),
        fetch("/api/brevo/emails?limit=50"),
        fetch("/api/brevo/campaigns?limit=20"),
        fetch("/api/brevo/contacts?limit=50"),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (emailsRes.ok) {
        const d = await emailsRes.json()
        setEmails(d.transactionalEmails ?? d ?? [])
      }
      if (campaignsRes.ok) {
        const d = await campaignsRes.json()
        setCampaigns(d.campaigns ?? d ?? [])
      }
      if (contactsRes.ok) {
        const d = await contactsRes.json()
        setContacts(d.contacts ?? d ?? [])
      }
      setLastRefresh(new Date())
    } catch {
      setError("Error al conectar con la API de Brevo. Verifica tu BREVO_API_KEY.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const openRate = stats ? (stats.uniqueOpens && stats.delivered ? Math.round((stats.uniqueOpens / stats.delivered) * 100) : 0) : 0
  const clickRate = stats ? (stats.uniqueClicks && stats.delivered ? Math.round((stats.uniqueClicks / stats.delivered) * 100) : 0) : 0
  const bounceRate = stats ? (((stats.hardBounces ?? 0) + (stats.softBounces ?? 0)) && stats.requests ? Math.round(((stats.hardBounces ?? 0) + (stats.softBounces ?? 0)) / stats.requests * 100) : 0) : 0

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-500" /> Hub de Email — Brevo
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Estadísticas, campañas y emails transaccionales en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-neutral-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastRefresh.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-foreground hover:bg-neutral-800/40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Solicitados" value={stats.requests ?? 0} icon={Send} color="text-blue-500" />
          <StatCard label="Entregados" value={stats.delivered ?? 0} icon={Mail} color="text-emerald-500" />
          <StatCard label="Abiertos únicos" value={stats.uniqueOpens ?? 0} icon={Inbox} color="text-violet-500" />
          <StatCard label="Clicks únicos" value={stats.uniqueClicks ?? 0} icon={MousePointerClick} color="text-amber-500" />
          <StatCard label="Open Rate" value={`${openRate}%`} icon={TrendingUp} color="text-cyan-500" />
          <StatCard label="Bounce Rate" value={`${bounceRate}%`} icon={AlertTriangle} color="text-red-500" />
        </div>
      )}

      {loading && !stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-card p-5 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex border-b border-neutral-800 gap-1 mb-6">
          {(["transaccionales", "campañas", "contactos"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-blue-500 text-foreground"
                  : "border-transparent text-neutral-500 hover:text-foreground"
              }`}
            >
              {t}{" "}
              {t === "campañas" && campaigns.length > 0 && (
                <span className="ml-1 bg-neutral-800 text-neutral-400 text-xs px-1.5 py-0.5 rounded-full">{campaigns.length}</span>
              )}
              {t === "contactos" && contacts.length > 0 && (
                <span className="ml-1 bg-neutral-800 text-neutral-400 text-xs px-1.5 py-0.5 rounded-full">{contacts.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* --- TRANSACCIONALES TAB --- */}
        {tab === "transaccionales" && (
          <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-foreground">Emails Transaccionales</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Últimos 50 emails enviados individualmente (notificaciones, formularios...)</p>
            </div>
            {loading ? (
              <div className="p-8 text-center text-neutral-600 text-sm animate-pulse">Cargando datos de Brevo...</div>
            ) : emails.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No hay emails transaccionales registrados en los últimos 30 días.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-neutral-500 bg-neutral-800/20 border-b border-neutral-800 uppercase">
                    <tr>
                      <th className="px-6 py-3 font-medium">Destinatario</th>
                      <th className="px-6 py-3 font-medium">Asunto</th>
                      <th className="px-6 py-3 font-medium">Estado</th>
                      <th className="px-6 py-3 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {emails.map((email, idx) => (
                      <tr key={idx} className="hover:bg-neutral-800/20 transition-colors">
                        <td className="px-6 py-3 text-foreground">{email.email ?? "—"}</td>
                        <td className="px-6 py-3 text-neutral-400 max-w-xs truncate">{email.subject ?? "—"}</td>
                        <td className="px-6 py-3"><StatusBadge status={email.event ?? "sent"} /></td>
                        <td className="px-6 py-3 text-xs text-neutral-500">
                          {email.date ? new Date(email.date).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- CAMPAÑAS TAB --- */}
        {tab === "campañas" && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center text-neutral-600 animate-pulse">Cargando campañas...</div>
            ) : campaigns.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-card p-12 text-center">
                <BarChart2 className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No se encontraron campañas en Brevo.</p>
                <a href="https://app.brevo.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline mt-3">
                  Crear campaña en Brevo <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              campaigns.map(c => {
                const stats = c.statistics?.campaignStats?.[0]
                return (
                  <div key={c.id} className="rounded-xl border border-neutral-800 bg-card p-6 hover:border-neutral-700 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{c.name}</h3>
                        <p className="text-sm text-neutral-500 mt-0.5">{c.subject}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    {stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Entregados", value: stats.delivered ?? "—" },
                          { label: "Abiertos únicos", value: stats.uniqueOpens ?? "—" },
                          { label: "Clicks únicos", value: stats.uniqueClicks ?? "—" },
                          { label: "Bajas", value: stats.unsubscriptions ?? "—" },
                        ].map(s => (
                          <div key={s.label} className="bg-background rounded-lg p-3 border border-neutral-800 text-center">
                            <div className="text-lg font-bold text-foreground">{s.value}</div>
                            <div className="text-xs text-neutral-500">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 text-xs text-neutral-600">
                      {c.sentDate ? `Enviada: ${new Date(c.sentDate).toLocaleDateString("es-ES")}` : c.scheduledAt ? `Programada: ${new Date(c.scheduledAt).toLocaleDateString("es-ES")}` : "Sin fecha"}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* --- CONTACTOS TAB --- */}
        {tab === "contactos" && (
          <div className="rounded-xl border border-neutral-800 bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Contactos en Brevo</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Últimos 50 contactos de tu cuenta Brevo</p>
              </div>
              <a href="https://app.brevo.com/contacts/index" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline">
                Ver en Brevo <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {loading ? (
              <div className="p-8 text-center text-neutral-600 animate-pulse">Cargando contactos...</div>
            ) : contacts.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-sm">No se encontraron contactos en Brevo.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-neutral-500 bg-neutral-800/20 border-b border-neutral-800 uppercase">
                    <tr>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">ID Brevo</th>
                      <th className="px-6 py-3 font-medium">Estado</th>
                      <th className="px-6 py-3 font-medium">Creado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {contacts.map(c => (
                      <tr key={c.id} className="hover:bg-neutral-800/20 transition-colors">
                        <td className="px-6 py-3 text-foreground">{c.email}</td>
                        <td className="px-6 py-3 text-neutral-500 font-mono text-xs">#{c.id}</td>
                        <td className="px-6 py-3">
                          {c.emailBlacklisted ? (
                            <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Bloqueado</span>
                          ) : (
                            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Activo</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-xs text-neutral-500">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("es-ES") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

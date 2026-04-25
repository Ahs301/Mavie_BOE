import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { BarChart2, Users, TrendingUp, Euro, ExternalLink, Activity, Mail, Eye } from "lucide-react"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Analítica — Mavie Admin",
  robots: { index: false, follow: false },
}

async function getMetrics() {
  const supabase = createClient()

  const [
    { count: totalClientes },
    { count: activosCount },
    { data: porPlan },
    { count: totalLeads },
    { data: recentSignups },
    { data: boeStats },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'activo'),
    supabase.from('clients').select('plan_activo').eq('status', 'activo'),
    supabase.from('clients').select('*', { count: 'exact', head: true }).in('status', ['lead', 'listo_para_activar']),
    supabase.from('clients').select('company_name, status, plan_activo, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('execution_logs').select('status, started_at').order('started_at', { ascending: false }).limit(30),
  ])

  const planCounts: Record<string, number> = { basico: 0, pro: 0, business: 0 }
  ;(porPlan ?? []).forEach(c => {
    const p = c.plan_activo as string
    if (p in planCounts) planCounts[p]++
  })

  const mrr =
    planCounts.basico * 79 +
    planCounts.pro * 179 +
    planCounts.business * 399

  const boeRuns = (boeStats ?? []).length
  const boeOk = (boeStats ?? []).filter(r => r.status === 'success').length

  return {
    totalClientes: totalClientes ?? 0,
    activosCount: activosCount ?? 0,
    totalLeads: totalLeads ?? 0,
    mrr,
    planCounts,
    recentSignups: recentSignups ?? [],
    boeRuns,
    boeOk,
  }
}

const PLAN_COLORS: Record<string, string> = {
  basico: 'bg-blue-500',
  pro: 'bg-purple-500',
  business: 'bg-amber-500',
}

const STATUS_COLORS: Record<string, string> = {
  activo: 'text-emerald-400',
  cancelado: 'text-red-400',
  pago_fallido: 'text-yellow-400',
  listo_para_activar: 'text-blue-400',
  lead: 'text-neutral-400',
}

export default async function AnaliticaPage() {
  await requireAuth()
  const m = await getMetrics()

  const vercelProjectId = process.env.VERCEL_PROJECT_ID ?? ''
  const vercelAnalyticsUrl = vercelProjectId
    ? `https://vercel.com/mavie/web-app/analytics`
    : 'https://vercel.com'

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mavie Ecosystem — Analítica</h1>
          <p className="text-neutral-400 text-sm mt-1">Métricas de negocio en tiempo real y tráfico web.</p>
        </div>
        <a
          href={vercelAnalyticsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 border border-blue-900/40 bg-blue-950/20 px-4 py-2 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver tráfico web en Vercel
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-neutral-800 border-l-[3px] border-l-emerald-500/70 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">MRR</span>
            <div className="w-8 h-8 rounded-lg border bg-emerald-950/40 border-emerald-900/50 flex items-center justify-center">
              <Euro className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold tabular-nums text-emerald-400">{m.mrr.toLocaleString('es-ES')}€</div>
          <p className="text-xs text-neutral-500 mt-1">mensual recurrente</p>
        </div>

        <div className="rounded-xl border border-neutral-800 border-l-[3px] border-l-blue-500/70 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Clientes activos</span>
            <div className="w-8 h-8 rounded-lg border bg-blue-950/40 border-blue-900/50 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold tabular-nums text-blue-400">{m.activosCount}</div>
          <p className="text-xs text-neutral-500 mt-1">de {m.totalClientes} totales en CRM</p>
        </div>

        <div className="rounded-xl border border-neutral-800 border-l-[3px] border-l-amber-500/70 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pipeline</span>
            <div className="w-8 h-8 rounded-lg border bg-amber-950/40 border-amber-900/50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold tabular-nums text-amber-400">{m.totalLeads}</div>
          <p className="text-xs text-neutral-500 mt-1">leads y pendientes</p>
        </div>

        <div className="rounded-xl border border-neutral-800 border-l-[3px] border-l-purple-500/70 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">BOE runs (30d)</span>
            <div className="w-8 h-8 rounded-lg border bg-purple-950/40 border-purple-900/50 flex items-center justify-center">
              <Activity className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold tabular-nums text-purple-400">{m.boeOk}/{m.boeRuns}</div>
          <p className="text-xs text-neutral-500 mt-1">exitosos / total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Distribución por plan */}
        <div className="rounded-xl border border-neutral-800 bg-card p-6">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest mb-5 border-b border-neutral-800 pb-2">
            Clientes activos por plan
          </h2>
          <div className="space-y-4">
            {(['basico', 'pro', 'business'] as const).map(plan => {
              const count = m.planCounts[plan]
              const price = plan === 'basico' ? 79 : plan === 'pro' ? 179 : 399
              const pct = m.activosCount > 0 ? Math.round((count / m.activosCount) * 100) : 0
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="capitalize font-medium text-neutral-300">{plan}</span>
                    <span className="text-neutral-500">{count} cliente{count !== 1 ? 's' : ''} · {(count * price).toLocaleString('es-ES')}€/mes</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${PLAN_COLORS[plan]} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {m.activosCount === 0 && (
              <p className="text-sm text-neutral-600 italic text-center py-4">Sin clientes activos aún</p>
            )}
          </div>
        </div>

        {/* Últimos registros */}
        <div className="rounded-xl border border-neutral-800 bg-card p-6">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest mb-5 border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Últimos 5 registros
          </h2>
          <div className="space-y-3">
            {m.recentSignups.length === 0 && (
              <p className="text-sm text-neutral-600 italic text-center py-4">Sin registros</p>
            )}
            {m.recentSignups.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 shrink-0">
                    {(c.company_name as string)?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-neutral-300 truncate">{c.company_name as string ?? '—'}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium ${STATUS_COLORS[c.status as string] ?? 'text-neutral-400'}`}>
                    {c.plan_activo as string ?? c.status as string}
                  </span>
                  <span className="text-xs text-neutral-600">
                    {new Date(c.created_at as string).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vercel Analytics info box */}
      <div className="rounded-xl border border-blue-900/30 bg-blue-950/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-900/30 flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">Tráfico web — Vercel Analytics</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Pageviews, visitantes únicos, países, dispositivos y páginas más vistas de <strong>mavieautomations.com</strong>.
              Sin cookies, sin GDPR, datos 100% first-party en la infraestructura de Vercel.
            </p>
            <a
              href={vercelAnalyticsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Abrir dashboard de tráfico
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

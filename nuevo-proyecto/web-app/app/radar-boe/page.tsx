import Link from "next/link"
import { ArrowRight, ChevronRight, MapPin, Building2 } from "lucide-react"
import type { Metadata } from "next"
import { VERTICALES } from "./_data/verticales"
import { CIUDADES } from "./_data/ciudades"
import { breadcrumbSchema, jsonLdScript, SITE_URL } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Radar BOE por Sector y Ciudad — Alertas automáticas del BOE",
  description:
    "Monitorización automática del BOE adaptada a tu sector y ciudad. Alertas de licitaciones, subvenciones y normativa para despachos, consultoras, constructoras, startups y más. 12 verticales, 20 ciudades.",
  keywords: [
    "radar BOE",
    "alertas BOE",
    "monitorización BOE",
    "licitaciones automáticas",
    "subvenciones BOE",
    "BOE despachos",
    "BOE consultoras",
    "BOE constructoras",
  ],
  alternates: { canonical: `${SITE_URL}/radar-boe` },
  openGraph: {
    title: "Radar BOE por Sector y Ciudad — Mavie Automations",
    description:
      "Alertas automáticas del BOE adaptadas a tu sector y ubicación. Licitaciones, subvenciones y normativa filtradas por IA.",
    type: "website",
    url: `${SITE_URL}/radar-boe`,
  },
}

const breadcrumbs = breadcrumbSchema([
  { name: "Inicio", path: "/" },
  { name: "Radar BOE", path: "/radar-boe" },
])

export default function RadarBoeHubPage() {
  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ data: breadcrumbs })} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 md:py-28 px-6 border-b border-neutral-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,120,220,0.08),transparent)]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-500 mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-neutral-400">Radar BOE</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {VERTICALES.length} sectores · {CIUDADES.length} ciudades
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gradient">
              Radar BOE adaptado<br />a tu sector y ciudad
            </h1>

            <p className="text-xl text-neutral-400 leading-relaxed mb-8 max-w-2xl">
              Monitorización automática del Boletín Oficial del Estado para cada vertical de negocio y cada ciudad de España. Licitaciones, subvenciones y normativa filtradas por inteligencia artificial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contacto" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors">
                Solicitar demo gratuita <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/soluciones/boe" className="inline-flex h-12 items-center gap-2 rounded-lg border border-neutral-800 px-6 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors">
                Ver planes y precios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Verticales ── */}
      <section className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Por sector</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Radar BOE para<br />
              <span className="blue-gradient">cada vertical de negocio</span>
            </h2>
            <p className="text-neutral-400">
              Cada sector tiene sus propias necesidades de monitorización. Hemos configurado keywords, filtros y copy específico para las 12 verticales más demandadas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VERTICALES.map((v) => (
              <Link
                key={v.slug}
                href={`/radar-boe/${v.slug}`}
                className="group rounded-xl border border-neutral-800 bg-neutral-950/50 p-6 hover:border-blue-900/40 hover:bg-blue-950/10 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 group-hover:border-blue-900/50 group-hover:bg-blue-950/20 transition-all">
                    <Building2 className="w-4 h-4 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors pt-1">
                    {v.nombre}
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
                  {v.descripcion}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver detalle <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ciudades ── */}
      <section className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Por ciudad</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Radar BOE en<br />
              <span className="blue-gradient">las 20 principales ciudades</span>
            </h2>
            <p className="text-neutral-400">
              Monitorización del BOE adaptada al tejido empresarial de cada ciudad. Desde Madrid hasta Elche, cubrimos los principales centros de negocio de España.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CIUDADES.map((c) => (
              <Link
                key={c.slug}
                href={`/radar-boe/ciudad/${c.slug}`}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 hover:border-blue-900/40 hover:bg-blue-950/10 hover:-translate-y-0.5 transition-all text-center"
              >
                <MapPin className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 transition-colors mx-auto mb-2" />
                <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {c.nombre}
                </div>
                <div className="text-[10px] text-neutral-600 mt-1">{c.comunidad}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿No encuentras tu sector o ciudad?
          </h2>
          <p className="text-neutral-400 mb-8">
            Radar BOE es completamente personalizable. Configura las keywords que necesites para cualquier sector, administración o tipo de publicación.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacto" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-8 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors">
              Solicitar demo personalizada <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/soluciones/boe" className="inline-flex h-12 items-center gap-2 rounded-lg border border-neutral-800 px-8 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors">
              Ver planes desde 79€/mes
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

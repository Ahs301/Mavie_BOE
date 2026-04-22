import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowRight, CheckCircle, ChevronRight, ChevronDown,
  AlertTriangle, Target, Clock, Mail, Shield, Bell,
} from "lucide-react"
import type { Metadata } from "next"
import { VERTICALES, getVerticalBySlug, getAllVerticalSlugs } from "../_data/verticales"
import { CIUDADES } from "../_data/ciudades"
import {
  serviceSchema, breadcrumbSchema, faqPageSchema, jsonLdScript, SITE_URL,
} from "@/lib/seo"

/* ── Static generation ─────────────────────────────── */

export function generateStaticParams() {
  return getAllVerticalSlugs().map((vertical) => ({ vertical }))
}

/* ── Metadata ──────────────────────────────────────── */

interface PageProps {
  params: { vertical: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const v = getVerticalBySlug(params.vertical)
  if (!v) return {}

  const title = `Radar BOE para ${v.nombre} — Alertas automáticas del BOE`
  const description = v.descripcion

  return {
    title,
    description,
    keywords: v.keywords,
    alternates: { canonical: `${SITE_URL}/radar-boe/${v.slug}` },
    openGraph: {
      title: `Radar BOE ${v.nombre} — Mavie Automations`,
      description,
      type: "website",
      url: `${SITE_URL}/radar-boe/${v.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `Radar BOE ${v.nombre}`,
      description,
    },
  }
}

/* ── Pricing (same as /soluciones/boe) ─────────────── */

const pricing = [
  {
    name: "Básico",
    price: "79",
    period: "mes",
    features: ["BOE nacional", "10 keywords", "Resumen diario", "1 destinatario", "Soporte email"],
    plan: "basico",
    highlight: false,
  },
  {
    name: "Pro",
    price: "179",
    period: "mes",
    features: ["BOE + DOUE + autonómico", "50 keywords", "Alertas instantáneas", "Múltiples destinatarios", "Soporte prioritario"],
    plan: "pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "399",
    period: "mes",
    features: ["Todo de Pro, sin límites", "Acceso API", "Multi-usuario", "Onboarding 1:1", "Soporte directo"],
    plan: "business",
    highlight: false,
  },
]

/* ── Page ──────────────────────────────────────────── */

export default function VerticalPage({ params }: PageProps) {
  const v = getVerticalBySlug(params.vertical)
  if (!v) notFound()

  const schema = serviceSchema({
    name: `Radar BOE para ${v.nombre}`,
    description: v.descripcion,
    path: `/radar-boe/${v.slug}`,
    serviceType: `Monitorización BOE para ${v.nombre}`,
    areaServed: ["ES", "EU"],
    audience: v.nombre,
    offers: pricing.map((p) => ({ name: p.name, price: p.price, description: p.features.join(", ") })),
  })

  const breadcrumbs = breadcrumbSchema([
    { name: "Inicio", path: "/" },
    { name: "Radar BOE", path: "/radar-boe" },
    { name: v.nombre, path: `/radar-boe/${v.slug}` },
  ])

  const faqSchema = faqPageSchema(v.faqs)

  // Other verticals for interlinking
  const otherVerticals = VERTICALES.filter((ov) => ov.slug !== v.slug).slice(0, 4)
  // Top cities for interlinking
  const topCiudades = CIUDADES.slice(0, 8)

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ data: schema })} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ data: breadcrumbs })} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ data: faqSchema })} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 md:py-28 px-6 border-b border-neutral-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,120,220,0.08),transparent)]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            {/* Breadcrumb nav */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-500 mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/radar-boe" className="hover:text-foreground transition-colors">Radar BOE</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-neutral-400">{v.nombre}</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Sistema activo — monitorizando ahora
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gradient whitespace-pre-line">
              {v.heroTitle}
            </h1>

            <p className="text-xl text-neutral-400 leading-relaxed mb-8 max-w-2xl">
              {v.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contacto" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors">
                {v.ctaTexto} <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#precios" className="inline-flex h-12 items-center gap-2 rounded-lg border border-neutral-800 px-6 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors">
                Ver precios
              </a>
            </div>

            <div className="flex flex-wrap gap-6 mt-10">
              {["Sin intervención manual", "Implantación en 72h", "Sin IT compleja", "Cancelación mensual"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-neutral-500">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabla de Contenidos (SEO) ── */}
      <div className="bg-neutral-950/80 border-b border-neutral-800 sticky top-16 z-40 hidden md:block backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#problema" className="hover:text-white transition-colors">El Reto</a>
            <a href="#proceso" className="hover:text-white transition-colors">Cómo Funciona</a>
            <a href="#casos" className="hover:text-white transition-colors">Qué Detectamos</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
            <a href="#faqs" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
          </nav>
        </div>
      </div>

      {/* ── Pain Points ── */}
      <section id="problema" className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">El problema</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Los retos de monitorización que enfrentan<br />
              <span className="blue-gradient">{v.nombre.toLowerCase()}</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {v.painPoints.map((pp) => (
              <div key={pp.titulo} className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-6 hover:border-neutral-700 hover:-translate-y-0.5 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-5 group-hover:border-orange-900/50 group-hover:bg-orange-950/20 transition-all">
                  <AlertTriangle className="w-5 h-5 text-neutral-400 group-hover:text-orange-400 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{pp.titulo}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{pp.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="proceso" className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Proceso</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cómo funciona Radar BOE para {v.nombre.toLowerCase()}<br />
              <span className="blue-gradient">En marcha en 72 horas.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", icon: Target, title: "Configuramos juntos", desc: `Reunión de 30 minutos. Definimos las keywords y fuentes específicas para ${v.nombre.toLowerCase()}.` },
              { num: "02", icon: Bell, title: "El sistema monitoriza", desc: "Infraestructura serverless operando 365 días al año. Escaneo diario del BOE, DOUE y autonómicos." },
              { num: "03", icon: Mail, title: "Recibes solo lo relevante", desc: "Resumen ejecutivo diario en tu email con las oportunidades filtradas. Sin ruido, sin falsos positivos." },
            ].map((step) => (
              <div key={step.num} className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8 hover:border-neutral-700 hover:-translate-y-1 transition-all group">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold tracking-[0.2em] text-blue-500">{step.num}</span>
                  <div className="flex-1 h-px bg-neutral-800" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-5 group-hover:border-blue-900/60 group-hover:bg-blue-950/30 transition-colors">
                  <step.icon className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Casos de uso ── */}
      <section id="casos" className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Casos de uso</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Qué oportunidades detecta Radar BOE para<br />
              <span className="blue-gradient">{v.nombre.toLowerCase()}</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {v.useCases.map((uc) => (
              <div key={uc.titulo} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 hover:border-blue-900/40 hover:bg-blue-950/10 hover:-translate-y-0.5 transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mb-4" />
                <h3 className="text-sm font-semibold text-white mb-3">{uc.titulo}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{uc.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precios ── */}
      <section id="precios" className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Planes y precios del servicio de alertas BOE</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">Suscripción mensual pura. Sin setup fee, sin permanencia, cancelas cuando quieras.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((item) => (
              <div key={item.name} className={`rounded-2xl border p-8 flex flex-col ${item.highlight ? "border-blue-800/60 bg-gradient-to-b from-blue-950/20 to-neutral-950" : "border-neutral-800 bg-neutral-900/40"}`}>
                {item.highlight && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-900/30 border border-blue-800/40 px-2.5 py-1 text-xs font-semibold text-blue-400 mb-4 w-fit">Más popular</div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{item.price}€</span>
                  <span className="text-sm text-neutral-500 ml-2">/{item.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-400">
                      <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <a href={`/api/stripe/checkout?plan=${item.plan}`} className={`flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition-colors ${item.highlight ? "bg-white text-black hover:bg-neutral-100" : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"}`}>
                  Contratar {item.name} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Preguntas frecuentes sobre el rastreo del BOE para {v.nombre.toLowerCase()}</h2>
            <p className="text-neutral-400">Resolvemos tus dudas operativas</p>
          </div>
          <div className="space-y-4">
            {v.faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-neutral-800 bg-neutral-950/50 overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-sm font-semibold text-white hover:bg-neutral-900/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {faq.pregunta}
                  <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0 ml-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-5 text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/50 pt-4">
                  {faq.respuesta}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Otras verticales ── */}
      <section className="py-16 px-6 border-b border-neutral-800 bg-neutral-950/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6">Radar BOE para otros sectores</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherVerticals.map((ov) => (
              <Link key={ov.slug} href={`/radar-boe/${ov.slug}`} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 hover:border-blue-900/40 hover:bg-blue-950/10 hover:-translate-y-0.5 transition-all group">
                <div className="text-sm font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{ov.nombre}</div>
                <p className="text-xs text-neutral-500 line-clamp-2">{ov.descripcion}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/radar-boe" className="text-sm text-blue-500 hover:text-blue-400 transition-colors">
              Ver todos los sectores para Radar BOE →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ciudades relacionadas ── */}
      <section className="py-16 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6">Radar BOE en las principales ciudades</h2>
          <div className="flex flex-wrap gap-3">
            {topCiudades.map((c) => (
              <Link key={c.slug} href={`/radar-boe/ciudad/${c.slug}`} className="rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-400 hover:border-blue-900/40 hover:text-white transition-colors">
                Radar BOE en {c.nombre}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            La próxima oportunidad que se te escapa<br />es ingresos que pierdes.
          </h2>
          <p className="text-neutral-400 mb-8">Agenda una llamada técnica de 30 minutos. Sin compromiso.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacto" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-8 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors">
              {v.ctaTexto} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/soluciones/boe" className="inline-flex h-12 items-center gap-2 rounded-lg border border-neutral-800 px-8 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors">
              Ver Radar BOE detalle
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

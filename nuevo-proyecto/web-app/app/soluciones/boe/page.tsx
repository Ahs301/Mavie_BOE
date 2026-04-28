import Link from "next/link"
import {
  Bell, Filter, ArrowRight, CheckCircle, ChevronRight,
  Clock, Mail, RefreshCcw, Target
} from "lucide-react"
import type { Metadata } from "next"
import { serviceSchema, breadcrumbSchema, jsonLdScript } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Radar Estratégico BOE/DOUE — Detección automática de oportunidades",
  description: "Monitorización automática 24/7 del Boletín Oficial del Estado y Diario Oficial de la UE. Alertas instantáneas de licitaciones, ayudas y subvenciones filtradas por tus keywords. Implantado en menos de 72h.",
  openGraph: {
    title: "Radar BOE/DOUE — Mavie Automations",
    description: "Tu sistema de inteligencia sobre oportunidades públicas. Licitaciones, ayudas y subvenciones directamente en tu email, filtradas y clasificadas.",
    type: "website",
  },
}

const features = [
  { icon: Bell, title: "Alertas en tiempo real", desc: "En cuanto el BOE o DOUE publica algo relevante para tu empresa, recibes el aviso. Tiempo medio de detección: menos de 5 minutos." },
  { icon: Filter, title: "Filtrado inteligente", desc: "Configura keywords positivas y negativas. El sistema analiza relevancia semántica y descarta el ruido. Solo lo que importa." },
  { icon: Mail, title: "Resumen ejecutivo diario", desc: "Email diario con todas las oportunidades clasificadas por tipo y relevancia. Listo para revisar en 2 minutos." },
  { icon: RefreshCcw, title: "Monitoreo 24/7 y 365", desc: "Never sleeps. El sistema funciona en producción los 365 días del año, incluyendo festivos nacionales y autonómicos." },
  { icon: Target, title: "Cobertura total", desc: "BOE nacional, DOUE europeo y publicaciones autonómicas. Configuramos las fuentes según tu sector y geografía." },
  { icon: Clock, title: "72h de implantación", desc: "Desde la reunión técnica hasta el primer radar activo: menos de 72 horas. Sin integración compleja ni cambios en tu IT." },
]

const useCases = [
  { type: "Consultoras y asesorías", desc: "Detectan licitaciones públicas relevantes antes de que la competencia se entere. Primera ventaja en la presentación de ofertas." },
  { type: "Despachos legales", desc: "Monitorizan normativa y resoluciones de impacto directo en sus clientes VIP. Alertas antes de que los afectados lo sepan." },
  { type: "Empresas tecnológicas", desc: "Rastrean concursos públicos de transformación digital, digitalización y modernización de administraciones." },
  { type: "Startups y pymes", desc: "Nunca vuelven a perder una convocatoria de ayudas, subvenciones o financiación pública por detectarla tarde." },
]

const pricing = [
  {
    name: "Básico",
    price: "79",
    period: "mes · cancela cuando quieras",
    desc: "1 usuario · 10 keywords · BOE nacional · resumen diario",
    features: ["Monitoreo del BOE nacional", "Hasta 10 keywords configurables", "Resumen diario por email", "1 destinatario", "Soporte por email"],
    cta: "Contratar Básico",
    plan: "basico",
    highlight: false,
  },
  {
    name: "Pro",
    price: "179",
    period: "mes · cancela cuando quieras",
    desc: "5 usuarios · 50 keywords · BOE+DOUE+autonómico · alertas instantáneas",
    features: ["BOE + DOUE + boletines autonómicos", "Hasta 50 keywords (positivas + negativas)", "Alertas instantáneas en minutos", "Múltiples destinatarios", "Soporte prioritario"],
    cta: "Contratar Pro",
    plan: "pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "399",
    period: "mes · cancela cuando quieras",
    desc: "Ilimitado · API · multi-usuario · soporte prioritario",
    features: ["Todo de Pro, sin límites", "Acceso API para integrar en tu sistema", "Multi-usuario y permisos", "Onboarding personalizado 1:1", "Soporte prioritario directo"],
    cta: "Contratar Business",
    plan: "business",
    highlight: false,
  },
]

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Radar Estratégico BOE / DOUE',
  url: 'https://mavieautomations.com/soluciones/boe',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: [
    { '@type': 'Offer', name: 'Básico', price: '79', priceCurrency: 'EUR', priceSpecification: { '@type': 'UnitPriceSpecification', price: '79', priceCurrency: 'EUR', billingDuration: 1, unitCode: 'MON' } },
    { '@type': 'Offer', name: 'Pro', price: '179', priceCurrency: 'EUR', priceSpecification: { '@type': 'UnitPriceSpecification', price: '179', priceCurrency: 'EUR', billingDuration: 1, unitCode: 'MON' } },
    { '@type': 'Offer', name: 'Business', price: '399', priceCurrency: 'EUR', priceSpecification: { '@type': 'UnitPriceSpecification', price: '399', priceCurrency: 'EUR', billingDuration: 1, unitCode: 'MON' } },
  ],
}

const schema = serviceSchema({
  name: "Radar Estratégico BOE / DOUE",
  description:
    "Monitorización automática 24/7 del Boletín Oficial del Estado y Diario Oficial de la UE. Alertas instantáneas de licitaciones, ayudas y subvenciones filtradas por keywords del cliente.",
  path: "/soluciones/boe",
  serviceType: "Inteligencia competitiva y detección de oportunidades públicas",
  areaServed: ["ES", "EU"],
  offers: pricing.map((item) => ({
    name: item.name,
    price: item.price,
    description: item.desc,
  })),
})

const breadcrumbs = breadcrumbSchema([
  { name: "Inicio", path: "/" },
  { name: "Soluciones", path: "/soluciones" },
  { name: "Radar BOE/DOUE", path: "/soluciones/boe" },
])

export default function RadarBOEPage() {
  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ data: schema })} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ data: breadcrumbs })} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 px-6 border-b border-neutral-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,120,220,0.08),transparent)]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Sistema activo — monitorizando ahora
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gradient">
              Radar Estratégico<br />BOE / DOUE
            </h1>
            <p className="text-xl text-neutral-400 leading-relaxed mb-8 max-w-2xl">
              Detectamos licitaciones, ayudas y subvenciones públicas relevantes para tu empresa — automáticamente, 24 horas al día, filtradas por tus criterios exactos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://cal.eu/josep-mes2ul/demo-radar-boe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors"
              >
                Reservar demo en 30 segundos <ArrowRight className="w-4 h-4" />
              </a>
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

      {/* Casos de uso */}
      <section className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white">¿Quién usa el Radar?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((uc) => (
              <div key={uc.type} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 hover:border-blue-900/40 hover:bg-blue-950/10 hover:-translate-y-0.5 transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mb-4" />
                <h3 className="text-sm font-semibold text-white mb-3">{uc.type}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">Cómo funciona el sistema</h2>
            <p className="text-neutral-400">Infraestructura serverless que monitoriza, filtra y entrega. Sin intervención humana, sin errores por cansancio.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl border border-neutral-800 bg-neutral-950/50 p-6 hover:border-neutral-700 hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-5 group-hover:border-blue-900/50 group-hover:bg-blue-950/20 icon-glow-hover transition-all">
                  <f.icon className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativa vs BOE gratuito */}
      <section className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-3">¿Por qué no basta con boe.es?</h2>
            <p className="text-neutral-400">Las alertas gratuitas de boe.es te mandan texto crudo sin filtrar. Llegas cuando ya llegaron todos.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 pr-6 text-neutral-500 font-medium w-1/3"></th>
                  <th className="py-3 px-4 text-neutral-500 font-medium text-center">BOE.es gratuito</th>
                  <th className="py-3 px-4 text-emerald-400 font-semibold text-center bg-emerald-950/20 rounded-t-lg">Radar BOE Mavie</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Alertas de publicación", "✓ Texto crudo", "✓ Resumen ejecutivo IA"],
                  ["Filtrado semántico", "✗", "✓ Keywords positivas/negativas"],
                  ["Cobertura", "Solo BOE", "BOE + DOUE + autonómico"],
                  ["Tiempo de alerta", "Manual (tú revisas)", "< 5 minutos automático"],
                  ["Falsos positivos", "Muchos (sin filtro)", "Eliminados por motor IA"],
                  ["Resumen diario", "✗", "✓ Email ejecutivo"],
                  ["Panel de gestión", "✗", "✓ Auto-servicio"],
                ].map(([feature, free, mavie], i) => (
                  <tr key={i} className="border-b border-neutral-800/50">
                    <td className="py-3 pr-6 text-neutral-400">{feature}</td>
                    <td className="py-3 px-4 text-neutral-500 text-center">{free}</td>
                    <td className="py-3 px-4 text-neutral-200 text-center bg-emerald-950/10">{mavie}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="py-20 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Precios claros y directos</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">Suscripción mensual pura. Sin setup fee, sin permanencia, cancelas cuando quieras.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((item) => (
              <div key={item.name} className={`rounded-2xl border p-8 flex flex-col ${item.highlight ? "border-blue-800/60 bg-gradient-to-b from-blue-950/20 to-neutral-950" : "border-neutral-800 bg-neutral-900/40"}`}>
                {item.highlight && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-900/30 border border-blue-800/40 px-2.5 py-1 text-xs font-semibold text-blue-400 mb-4 w-fit">Más popular</div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                <p className="text-sm text-neutral-500 mb-6">{item.desc}</p>
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
                  {item.cta} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">La próxima licitación que se te escapa<br />es ingresos que pierdes.</h2>
          <p className="text-neutral-400 mb-8">Agenda una llamada técnica de 30 minutos. Sin compromiso.</p>
          <a
            href="https://cal.eu/josep-mes2ul/demo-radar-boe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-8 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors"
          >
            Reservar demo en 30 segundos <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  )
}

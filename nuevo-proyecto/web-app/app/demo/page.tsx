import Link from "next/link"
import { ArrowRight, CheckCircle, Calendar, MessageSquare, Clock } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demo gratuita — Radar BOE en acción | Mavie Automations",
  description: "Ve cómo el Radar BOE detecta licitaciones, ayudas y subvenciones relevantes para tu despacho o consultora. Demo de 15 minutos sin compromiso.",
  robots: { index: false }, // no indexar — es página de conversión
}

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL

const whatYoullSee = [
  "Cómo configuramos las keywords exactas de tu área de práctica o sector",
  "Un resumen real de las oportunidades detectadas esta semana en el BOE",
  "Cuánto tiempo te ahorras vs revisar boletines manualmente (estimación real)",
]

const proofNumbers = [
  { value: "54", label: "oportunidades detectadas en un día real" },
  { value: "15'", label: "para configurar el radar desde cero" },
  { value: "0€", label: "de setup fee — cancelas cuando quieras" },
]

export default function DemoPage() {
  const calendlyUrl = CALENDLY_URL

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 px-6 border-b border-neutral-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(0,120,220,0.07),transparent)]" />
        <div className="max-w-4xl mx-auto relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            1 despacho activo en España — 0 convocatorias perdidas desde que empezaron
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 text-gradient">
            Ve el Radar BOE<br />en acción — 15 minutos
          </h1>
          <p className="text-lg text-neutral-400 leading-relaxed mb-10 max-w-2xl mx-auto">
            Una llamada sin compromiso donde te enseñamos exactamente qué detecta el sistema
            para tu área concreta. Sin PowerPoints — con datos reales del BOE de hoy.
          </p>

          {/* CTA principal */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {calendlyUrl ? (
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-13 items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Reservar mi demo de 15 min
              </a>
            ) : (
              <Link
                href="/contacto"
                className="inline-flex h-13 items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Pedir demo gratuita
              </Link>
            )}
            <a
              href="https://wa.me/34633448806"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 items-center gap-2 rounded-lg border border-neutral-700 px-8 py-3.5 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp directo
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-6 justify-center">
            {["Sin compromiso", "15 minutos exactos", "Con datos reales del BOE"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-neutral-500">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qué verás */}
      <section className="py-16 px-6 border-b border-neutral-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Qué vemos en esos 15 minutos</h2>
          <div className="space-y-4">
            {whatYoullSee.map((item, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
                <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800/50 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Números reales */}
      <section className="py-16 px-6 border-b border-neutral-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Resultados reales</h2>
          <p className="text-neutral-500 text-center text-sm mb-10">Datos de un despacho de contratación pública que lleva varios meses con el sistema</p>
          <div className="grid grid-cols-3 gap-4">
            {proofNumbers.map((item) => (
              <div key={item.label} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{item.value}</div>
                <div className="text-xs text-neutral-500 leading-snug">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O empieza directamente con trial */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs text-neutral-500 mb-4">
            <Clock className="w-3.5 h-3.5" />
            ¿Prefieres probar directamente sin llamada?
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">14 días gratis, sin riesgo</h2>
          <p className="text-neutral-400 text-sm mb-8 max-w-lg mx-auto">
            Activa el Radar BOE hoy. Si en 14 días no ves valor real, cancelas antes del cobro y no se te cobra nada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/api/stripe/checkout?plan=basico&trial=1"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-6 text-sm font-semibold text-white transition-colors"
            >
              Empezar 14 días gratis — Plan Básico <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/soluciones/boe#precios"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-neutral-700 px-6 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Ver todos los planes
            </Link>
          </div>
          <p className="text-xs text-neutral-600 mt-4">Necesitas tarjeta de crédito. Sin cargo hasta el día 15.</p>
        </div>
      </section>
    </div>
  )
}

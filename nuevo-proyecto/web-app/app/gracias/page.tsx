import Link from "next/link"
import { CheckCircle, Mail, Settings, Clock, ArrowRight, Shield } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "¡Suscripción confirmada! — Radar BOE",
  description: "Tu suscripción a Radar BOE está activa. Aquí tienes los próximos pasos para empezar a recibir alertas de licitaciones y oportunidades.",
  robots: { index: false, follow: false },
}

const steps = [
  {
    icon: Mail,
    title: "Revisa tu email",
    desc: "En los próximos minutos recibirás un email de confirmación de Stripe con los detalles de tu suscripción y factura.",
    time: "Inmediato",
  },
  {
    icon: Settings,
    title: "Configuramos tu radar",
    desc: "Nuestro equipo activará tus keywords y fuentes en menos de 24h. Recibirás un email cuando todo esté listo.",
    time: "< 24 horas",
  },
  {
    icon: Clock,
    title: "Primer resumen en tu bandeja",
    desc: "Una vez activo, recibirás tu primer resumen diario de oportunidades del BOE filtradas por tus criterios. Sin ruido, solo lo relevante.",
    time: "< 48 horas",
  },
]

export default function GraciasPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(16,185,129,0.08),transparent)]" />
        <div className="max-w-3xl mx-auto relative text-center">
          {/* Success icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-950/40 border border-emerald-800/40 mb-8 animate-fade-in-up">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gradient animate-fade-in-up delay-100">
            ¡Suscripción confirmada!
          </h1>
          <p className="text-lg text-neutral-400 leading-relaxed mb-4 animate-fade-in-up delay-200 max-w-xl mx-auto">
            Tu Radar BOE ya está en proceso de activación. Gracias por confiar en Mavie Automations.
          </p>

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/40 bg-emerald-950/20 px-4 py-2 text-sm text-emerald-400 animate-fade-in-up delay-300">
            <Shield className="w-4 h-4" />
            Pago seguro procesado por Stripe
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">Próximos pasos</h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="flex gap-5 p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-emerald-900/40 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${(i + 1) * 150}ms` }}
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700">
                    <step.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 rounded-full px-2.5 py-0.5">
                      Paso {i + 1}
                    </span>
                    <span className="text-xs text-neutral-500">{step.time}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info / FAQ */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gestión de suscripción */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-base font-semibold text-white mb-3">Gestión de tu suscripción</h3>
              <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
                Puedes cancelar, cambiar de plan o actualizar tu método de pago en cualquier momento desde el portal de cliente.
              </p>
              <a
                href="/api/stripe/portal"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Gestionar suscripción <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Soporte */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-base font-semibold text-white mb-3">¿Necesitas ayuda?</h3>
              <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
                Estamos aquí para asegurar que tu radar funciona perfectamente. Escríbenos y respondemos en menos de 2 horas.
              </p>
              <a
                href="mailto:contacto@mavieautomations.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                contacto@mavieautomations.com <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA volver */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-neutral-500 mb-6">Mientras activamos tu radar, explora nuestra web o vuelve a la página de inicio.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-700 px-6 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              Volver al inicio
            </Link>
            <Link
              href="/soluciones/boe"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors"
            >
              Ver detalles del Radar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

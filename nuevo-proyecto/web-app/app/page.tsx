import Link from "next/link";
import {
  ArrowRight, Bell, Filter, Zap, Database, Activity,
  Shield, Clock, ChevronRight, Settings2, Send, CalendarDays,
} from "lucide-react";
import type { Metadata } from "next";
import { ParticleBackground } from "@/components/ParticleBackground";
import { faqPageSchema, jsonLdScript } from "@/lib/seo";

const CAL_URL = process.env.NEXT_PUBLIC_CAL_BOOKING_URL || "https://cal.com/josep-ndwyo3/30min"

export const metadata: Metadata = {
  title: "Mavie Automations | Radar BOE Automático y Captación de Leads B2B",
  description: "Detecta subvenciones, licitaciones y oportunidades del BOE de forma automática. Prospección B2B automatizada para consultoras y despachos. Implantación en 72h.",
  keywords: [
    'radar BOE', 'alertas BOE automáticas', 'monitorización BOE',
    'subvenciones automáticas', 'licitaciones BOE', 'captación leads B2B',
    'automatización consultoras', 'automatización despachos abogados',
    'boe abogados', 'ayudas públicas automáticas', 'Mavie Automations',
  ],
  alternates: {
    canonical: 'https://mavieautomations.com',
  },
};

const homeFaqs = faqPageSchema([
  {
    pregunta: "¿Qué es el Radar BOE de Mavie Automations?",
    respuesta: "El Radar BOE es un sistema de monitorización automática del Boletín Oficial del Estado (BOE), el Diario Oficial de la UE (DOUE) y boletines autonómicos. Detecta licitaciones, subvenciones y cambios normativos relevantes para tu empresa y te los envía por email en menos de 5 minutos desde su publicación.",
  },
  {
    pregunta: "¿Cuánto tiempo tarda la implantación del sistema?",
    respuesta: "Menos de 72 horas. Realizamos una reunión técnica de 30 minutos para configurar tus keywords y destinatarios, y al día siguiente ya recibes tus primeras alertas. Sin instalación de software ni cambios en tu IT.",
  },
  {
    pregunta: "¿Para qué tipo de empresas está pensado?",
    respuesta: "Principalmente para consultoras, despachos de abogados, gestorías, asesorías y cualquier empresa B2B que necesite estar al día con oportunidades públicas o captar clientes de forma automatizada. También para startups que buscan financiación pública y empresas que licitan.",
  },
  {
    pregunta: "¿Cuánto cuesta el servicio de Radar BOE?",
    respuesta: "Desde 79€/mes sin permanencia para el plan Básico (BOE nacional, 10 keywords). El plan Pro cuesta 179€/mes e incluye BOE, DOUE y autonómicos con alertas instantáneas. Puedes cancelar cuando quieras, sin costes de setup.",
  },
  {
    pregunta: "¿Puedo cancelar el servicio en cualquier momento?",
    respuesta: "Sí. No hay permanencia ni penalización por cancelación. Pagas mes a mes y puedes cancelar cuando quieras desde tu panel de cliente sin necesidad de contactar con nadie.",
  },
  {
    pregunta: "¿Cómo funciona la prospección B2B automatizada?",
    respuesta: "Nuestro sistema identifica y filtra empresas que encajan con el perfil de tu cliente ideal, y gestiona el envío de emails de captación de forma automatizada. Tu equipo solo interviene para cerrar la venta en la llamada. Llenamos tu calendario de reuniones cualificadas.",
  },
]);

const features = [
  {
    icon: Database,
    color: "blue",
    title: "Gestión de Clientes Eficiente",
    desc: "Centralizamos toda tu operativa comercial en una única plataforma fácil de usar. Gestiona tus clientes sin pagar costosas licencias de software.",
  },
  {
    icon: Filter,
    color: "violet",
    title: "Captación de Leads 24/7",
    desc: "Llenamos tu calendario. Buscamos y filtramos automáticamente a los clientes exactos que necesitan los servicios de tu despacho o consultoría.",
  },
  {
    icon: Activity,
    color: "amber",
    title: "Reuniones de Ventas Cerradas",
    desc: "La máquina envía los correos, hace seguimiento y calienta al cliente. Tu equipo humano solo interviene para cerrar la venta en la llamada.",
  },
  {
    icon: Zap,
    color: "emerald",
    title: "Ahorro de Horas Administrativas",
    desc: "Eliminamos el trabajo manual. Conectamos tus herramientas para que todo fluya solo: desde facturas automáticas hasta avisos a clientes.",
  },
  {
    icon: Shield,
    color: "indigo",
    title: "Protección Total de Datos",
    desc: "Garantizamos la privacidad y seguridad. Tus listas de clientes son 100% tuyas, bajo bases de datos seguras e independientes (cumpliendo GDPR).",
  },
  {
    icon: Clock,
    color: "cyan",
    title: "Soporte Técnico Directo",
    desc: "Nos aseguramos de que el sistema nunca falle. Monitoreamos tu negocio en tiempo real para que tú solo te preocupes de vender.",
  },
]

const featureIconStyles: Record<string, { wrap: string; icon: string }> = {
  blue:    { wrap: "group-hover:bg-blue-950/30 group-hover:border-blue-900/50",    icon: "group-hover:text-blue-400" },
  violet:  { wrap: "group-hover:bg-violet-950/30 group-hover:border-violet-900/50", icon: "group-hover:text-violet-400" },
  amber:   { wrap: "group-hover:bg-amber-950/30 group-hover:border-amber-900/50",  icon: "group-hover:text-amber-400" },
  emerald: { wrap: "group-hover:bg-emerald-950/30 group-hover:border-emerald-900/50", icon: "group-hover:text-emerald-400" },
  indigo:  { wrap: "group-hover:bg-indigo-950/30 group-hover:border-indigo-900/50", icon: "group-hover:text-indigo-400" },
  cyan:    { wrap: "group-hover:bg-cyan-950/30 group-hover:border-cyan-900/50",    icon: "group-hover:text-cyan-400" },
}

const stats = [
  { value: "72h", label: "Implantación garantizada" },
  { value: "< 5min", label: "Tiempo de detección" },
  { value: "0€", label: "Setup fee" },
  { value: "99.9%", label: "Uptime objetivo" },
]

const steps = [
  {
    number: "01",
    icon: Settings2,
    title: "Configuramos juntos",
    desc: "Reunión técnica de 30 minutos. Definimos keywords, fuentes y destinatarios. Sin IT compleja ni integración.",
  },
  {
    number: "02",
    icon: Bell,
    title: "El sistema monitoriza",
    desc: "Infraestructura serverless operando 365 días al año. Escaneo cada hora del BOE, DOUE y autonómicos.",
  },
  {
    number: "03",
    icon: Send,
    title: "Recibes solo lo relevante",
    desc: "Alerta instantánea + resumen ejecutivo diario en tu email. Filtrado semántico sin ruido innecesario.",
  },
]


export default function Home() {
  // Inicializamos la vista principal de la landing page (Deploy Trigger)
  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ data: homeFaqs })} />

      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background pointer-events-none" />
        {/* Blue glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-blue-600/5 blur-[160px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-violet-600/4 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-4 py-1.5 text-xs font-medium text-neutral-400 mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistema activo · Escaneando el BOE ahora
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 text-gradient animate-fade-in-up">
              Consigue ayudas y<br />
              clientes antes que<br />
              tu competencia.
            </h1>

            <p className="text-xl text-neutral-400 leading-relaxed mb-10 max-w-2xl animate-fade-in-up delay-100">
              Automatizamos la captación de subvenciones del BOE y la prospección de ventas para que tu despacho de consultoría facture más, trabajando menos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
              <Link
                href="/soluciones/boe"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-8 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors"
              >
                Ver Radar BOE <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={CAL_URL}
                target={CAL_URL.startsWith("http") ? "_blank" : undefined}
                rel={CAL_URL.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-700/50 bg-emerald-950/40 px-8 text-sm font-medium text-emerald-300 hover:bg-emerald-900/50 hover:text-white transition-colors"
              >
                <CalendarDays className="w-4 h-4" /> Reserva una llamada gratis
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-10 animate-fade-in-up delay-300">
              {["Sin permanencias", "Implantación en 72h", "Datos bajo RLS privada", "Sin revisión manual"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-y-8 md:gap-y-0 md:grid-cols-4 md:divide-x divide-neutral-200 dark:divide-neutral-800">
            {stats.map(s => (
              <div key={s.label} className="text-center px-6 first:pl-0 last:pr-0">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1 tabular-nums" style={{ fontFamily: 'var(--font-syne)' }}>{s.value}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CÓMO FUNCIONA (3 pasos) ── */}
      <section className="py-24 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">Proceso</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              En marcha en 72 horas.<br />
              <span className="blue-gradient">Sin complejidad técnica.</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
              Tres pasos desde la reunión inicial hasta el primer radar activo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 p-8 hover:border-blue-200 dark:hover:border-neutral-700 hover:-translate-y-1 transition-all duration-300 group shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold tracking-[0.2em] text-blue-500">{step.number}</span>
                  <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-5 group-hover:border-blue-200 dark:group-hover:border-blue-900/60 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 transition-colors">
                  <step.icon className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTO DESTACADO ── */}
      <section className="py-24 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">Producto estrella</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-900 dark:bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Disponible ahora
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Aumenta tu facturación con el<br />
                <span className="blue-gradient">Radar BOE Automático</span>
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg">
                Deja de perder horas leyendo el Boletín Oficial del Estado. Te enviamos directamente al correo las subvenciones exactas que necesitan tus clientes para que puedas cobrar por gestionarlas antes que nadie.
              </p>
              <ul className="space-y-3">
                {[
                  "Te avisamos de nuevas ayudas en menos de 5 minutos",
                  "Filtramos solo lo que interesa a tus clientes (tu sector y ciudad)",
                  "Recibe un resumen listo para reenviar a tus clientes",
                  "Cubre BOE, DOUE y boletines autonómicos",
                  "Vende más servicios de tramitación sin esfuerzo",
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 pt-2">
                <Link
                  href="/soluciones/boe"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-6 text-sm font-semibold text-white transition-colors"
                >
                  Ver detalles <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contacto"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-800 px-6 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  Solicitar demo
                </Link>
              </div>
            </div>

            {/* Dashboard Mockup — inline terminal UI */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.10)] relative w-full">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900 border-b border-neutral-800">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-xs text-neutral-400 ml-2 font-mono truncate hidden sm:block">mavie — radar-boe · monitor</span>
                <span className="text-xs text-neutral-400 ml-2 font-mono truncate sm:hidden">radar-boe</span>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 font-mono shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  activo
                </div>
              </div>

              {/* Log entries */}
              <div className="p-4 sm:p-5 space-y-2 font-mono text-xs overflow-x-auto">
                <div className="flex gap-3 items-start">
                  <span className="text-neutral-600 shrink-0 pt-px">08:02:11</span>
                  <span className="text-blue-400 shrink-0 pt-px font-semibold">SCAN</span>
                  <span className="text-neutral-400">BOE-A-2026 · 143 entradas procesadas</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-neutral-600 shrink-0 pt-px">08:02:14</span>
                  <span className="text-emerald-400 shrink-0 pt-px font-semibold">MATCH</span>
                  <span className="text-neutral-300">Convocatoria subvención digitalización PYMES · <span className="bg-blue-900/50 text-blue-300 px-1 rounded">digitalización</span></span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-neutral-600 shrink-0 pt-px">08:02:14</span>
                  <span className="text-emerald-400 shrink-0 pt-px font-semibold">MATCH</span>
                  <span className="text-neutral-300">Licitación servicios jurídicos contratación pública · <span className="bg-blue-900/50 text-blue-300 px-1 rounded">licitación</span></span>
                </div>
                <div className="flex gap-3 items-start opacity-35">
                  <span className="text-neutral-600 shrink-0 pt-px">08:02:15</span>
                  <span className="text-neutral-600 shrink-0 pt-px font-semibold">SKIP</span>
                  <span className="text-neutral-600">Resolución nombramiento personal funcionario interino…</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-neutral-600 shrink-0 pt-px">08:02:15</span>
                  <span className="text-emerald-400 shrink-0 pt-px font-semibold">MATCH</span>
                  <span className="text-neutral-300">Ayudas I+D empresas innovación tecnológica 2026 · <span className="bg-blue-900/50 text-blue-300 px-1 rounded">ayudas</span></span>
                </div>
                <div className="flex gap-3 items-start opacity-35">
                  <span className="text-neutral-600 shrink-0 pt-px">08:02:16</span>
                  <span className="text-neutral-600 shrink-0 pt-px font-semibold">SKIP</span>
                  <span className="text-neutral-600">Orden ministerial regulación horarios comerciales…</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-neutral-600 shrink-0 pt-px">08:02:16</span>
                  <span className="text-emerald-400 shrink-0 pt-px font-semibold">MATCH</span>
                  <span className="text-neutral-300">Concurso público consultoría estratégica sector público · <span className="bg-blue-900/50 text-blue-300 px-1 rounded">consultoría</span></span>
                </div>
              </div>

              {/* Summary footer */}
              <div className="mx-4 sm:mx-5 mb-5 mt-1 rounded-xl border border-neutral-800 bg-neutral-900 px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-xs text-neutral-400 font-mono mb-1">resultados hoy</div>
                  <div className="text-2xl font-bold text-foreground">4 <span className="text-emerald-400 text-sm font-normal">coincidencias</span></div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs text-neutral-400 font-mono mb-1">próximo escaneo</div>
                  <div className="text-sm text-neutral-300 font-mono">en 43 min</div>
                </div>
                <div className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white text-xs font-semibold cursor-default text-center">
                  Ver resumen →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">Capacidades</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tecnología que trabaja<br />mientras tu equipo no puede.
            </h2>
            <p className="text-neutral-400 text-lg">
              Sistemas robustos diseñados para entornos B2B que requieren precisión, velocidad y disponibilidad total.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => {
              const s = featureIconStyles[f.color] ?? featureIconStyles.blue
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-6 hover:border-neutral-700 hover:-translate-y-0.5 transition-all duration-200 group cursor-default"
                >
                  <div className={`w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-5 ${s.wrap} transition-all duration-200`}>
                    <f.icon className={`w-5 h-5 text-neutral-400 ${s.icon} transition-colors duration-200`} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">Preguntas frecuentes</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas saber
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
            {[
              { q: "¿Qué es el Radar BOE de Mavie?", a: "Un sistema que monitoriza el BOE, el DOUE y boletines autonómicos automáticamente 24/7, detecta licitaciones y subvenciones relevantes para tu empresa y te las manda por email en menos de 5 minutos." },
              { q: "¿Cuánto tarda la implantación?", a: "Menos de 72 horas. Una reunión de 30 minutos para configurar tus keywords y al día siguiente ya recibes alertas. Sin instalación de software." },
              { q: "¿Para qué empresas está pensado?", a: "Consultoras, despachos de abogados, gestorías, asesorías y cualquier B2B que necesite detectar oportunidades públicas o captar clientes de forma automatizada." },
              { q: "¿Cuánto cuesta?", a: "Desde 79€/mes sin permanencia. Plan Pro a 179€/mes con BOE + DOUE + autonómicos. Sin setup fee, cancelas cuando quieras." },
              { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Sin permanencia ni penalización. Pagas mes a mes y cancelas desde tu panel de cliente cuando quieras." },
              { q: "¿Cómo funciona la prospección B2B?", a: "Identificamos empresas que encajan con tu cliente ideal y gestionamos el envío de emails automatizados. Tu equipo solo interviene para cerrar la venta." },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">{faq.q}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-neutral-800 p-10 md:p-16 text-center relative overflow-hidden gradient-border glow-blue-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/25 via-transparent to-violet-950/20 rounded-2xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 mb-6 mx-auto">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                ¿Preparado para automatizar?
              </h2>
              <p className="text-neutral-400 mb-8 max-w-xl mx-auto leading-relaxed">
                Diagnóstico gratuito en 30 minutos. Te decimos exactamente qué podemos automatizar y qué resultado esperar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={CAL_URL}
                  target={CAL_URL.startsWith("http") ? "_blank" : undefined}
                  rel={CAL_URL.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-8 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors"
                >
                  <CalendarDays className="w-4 h-4" /> Reserva tu diagnóstico gratuito
                </Link>
                <Link
                  href="/soluciones"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-neutral-800 px-8 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                >
                  Ver todas las soluciones
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

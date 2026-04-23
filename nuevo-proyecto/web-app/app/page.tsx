import Link from "next/link";
import {
  ArrowRight, Bell, Filter, Zap, Database, Activity,
  Shield, Clock, ChevronRight, Settings2, Send, BarChart3,
} from "lucide-react";
import type { Metadata } from "next";
import { ParticleBackground } from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: "Mavie Automations | Radar BOE Automático y Automatización Empresarial",
  description: "Sistemas de detección automática de oportunidades públicas, scraping B2B y automatización de procesos para consultoras, despachos y empresas tecnológicas.",
};

const features = [
  {
    icon: Database,
    color: "blue",
    title: "Sistemas Core (CRM & ERP)",
    desc: "Desarrollo de cuadros de mando y paneles operativos desde cero. Conectamos toda tu operativa en una interfaz única, rápida y sin licenciamientos tóxicos.",
  },
  {
    icon: Filter,
    color: "violet",
    title: "Pipelines de Extracción",
    desc: "Bases de datos autogeneradas. Rastreamos la web, directorios o registros públicos buscando clientes o competidores, 24/7.",
  },
  {
    icon: Activity,
    color: "amber",
    title: "Motores de Outreach",
    desc: "Secuencias frías totalmente orquestadas (Brevo, Outlook). La máquina prospecta, filtra y entrega el lead templado a tu equipo humano.",
  },
  {
    icon: Zap,
    color: "emerald",
    title: "Automatización n8n/Make",
    desc: "Adiós al copiar y pegar. Tu ecosistema se hablará de forma nativa vía APIs y Webhooks; desde la factura hasta el onboarding.",
  },
  {
    icon: Shield,
    color: "indigo",
    title: "Arquitectura Privada",
    desc: "Datos encriptados bajo RLS (Row Level Security). Tus bases de clientes no se comparten en plataformas de terceros genéricas.",
  },
  {
    icon: Clock,
    color: "cyan",
    title: "Soporte DevOps B2B",
    desc: "Nuestras construcciones incluyen alertas de fallos en Slack/Discord y monitorización de scripts para un uptime impecable.",
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
  { value: "24/7", label: "Monitoreo continuo" },
  { value: "< 5min", label: "Tiempo de alerta" },
  { value: "50+", label: "Clientes activos" },
  { value: "99.9%", label: "Uptime garantizado" },
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

const testimonials = [
  {
    quote: "Antes revisábamos el BOE manualmente cada mañana. Con Mavie, recibimos directamente lo relevante. Ahora presentamos ofertas antes que la competencia.",
    author: "Directora de Desarrollo de Negocio",
    company: "Consultora jurídica, Madrid",
    icon: BarChart3,
  },
  {
    quote: "El Radar BOE nos ha abierto un canal de captación que no teníamos. Detectamos convocatorias de digitalización que antes perdíamos por llegar tarde.",
    author: "CEO",
    company: "Empresa tecnológica, Barcelona",
    icon: Zap,
  },
  {
    quote: "La implantación fue en menos de 48 horas. Sin tocar nada de nuestros sistemas. El nivel de personalización del filtrado es lo que nos convenció.",
    author: "Responsable de Operaciones",
    company: "Asesoría tributaria, Valencia",
    icon: Shield,
  },
]

export default function Home() {
  return (
    <div className="flex flex-col">

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
              Tu empresa,<br />
              trabajando en<br />
              automático.
            </h1>

            <p className="text-xl text-neutral-400 leading-relaxed mb-10 max-w-2xl animate-fade-in-up delay-100">
              Detectamos licitaciones, ayudas y oportunidades públicas en el BOE antes que tu competencia. Automatización B2B que opera 24/7 sin margen de error.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
              <Link
                href="/soluciones/boe"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-8 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors"
              >
                Ver Radar BOE <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contacto"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950/50 px-8 text-sm font-medium text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                Hablar con un experto
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-10 animate-fade-in-up delay-300">
              {["Sin permanencias", "Implantación en 72h", "Datos bajo RLS privada", "Sin revisión manual"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-neutral-500">
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
                <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide">{s.label}</div>
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
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Proceso</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              En marcha en 72 horas.<br />
              <span className="blue-gradient">Sin complejidad técnica.</span>
            </h2>
            <p className="text-neutral-500 text-lg leading-relaxed">
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
                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
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
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Producto estrella</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-900 dark:bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Disponible ahora
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Radar Estratégico<br />
                <span className="blue-gradient">BOE / DOUE</span>
              </h2>
              <p className="text-neutral-500 leading-relaxed text-lg">
                Monitorización automática del Boletín Oficial del Estado y Diario Oficial de la UE. Filtrado inteligente por keywords, alertas instantáneas y resumen ejecutivo en tu bandeja de entrada cada mañana.
              </p>
              <ul className="space-y-3">
                {[
                  "Detección en menos de 5 minutos",
                  "Filtros positivos y negativos configurables",
                  "Alertas por email con resumen ejecutivo",
                  "Cobertura BOE nacional + autonómico",
                  "Sin revisión manual del boletín",
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-neutral-500">
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
                <span className="text-xs text-neutral-500 ml-2 font-mono truncate hidden sm:block">mavie — radar-boe · monitor</span>
                <span className="text-xs text-neutral-500 ml-2 font-mono truncate sm:hidden">radar-boe</span>
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
                  <span className="text-neutral-500">BOE-A-2026 · 143 entradas procesadas</span>
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
                  <div className="text-xs text-neutral-500 font-mono mb-1">resultados hoy</div>
                  <div className="text-2xl font-bold text-foreground">4 <span className="text-emerald-400 text-sm font-normal">coincidencias</span></div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs text-neutral-500 font-mono mb-1">próximo escaneo</div>
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
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Capacidades</span>
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
                  <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / TESTIMONIALS ── */}
      <section className="py-24 px-6 border-b border-neutral-800 bg-neutral-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Clientes</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Lo que dicen quienes<br />ya automatizan con nosotros.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-7 flex flex-col gap-5 hover:border-neutral-700 transition-all duration-200 group relative overflow-hidden"
              >
                <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-blue-600/5 blur-2xl pointer-events-none" />

                {/* Stars */}
                <div className="flex gap-0.5 relative">
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-neutral-800/80">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 group-hover:border-blue-900/50 group-hover:bg-blue-950/20 transition-colors duration-200">
                    <t.icon className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 transition-colors duration-200" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{t.author}</div>
                    <div className="text-xs text-neutral-500">{t.company}</div>
                  </div>
                </div>
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
                  href="/contacto"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-8 text-sm font-semibold text-black hover:bg-neutral-100 transition-colors"
                >
                  Solicitar diagnóstico gratuito <ArrowRight className="w-4 h-4" />
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

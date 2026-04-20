import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Bell, Filter, Zap, Database, Activity,
  Shield, Clock, ChevronRight, Settings2, Send, BarChart3,
  Quote,
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
    title: "Sistemas Core (CRM & ERP)",
    desc: "Desarrollo de cuadros de mando y paneles operativos desde cero. Conectamos toda tu operativa en una interfaz única, rápida y sin licenciamientos tóxicos.",
  },
  {
    icon: Filter,
    title: "Pipelines de Extracción",
    desc: "Bases de datos autogeneradas. Rastreamos la web, directorios o registros públicos buscando clientes o competidores, 24/7.",
  },
  {
    icon: Activity,
    title: "Motores de Outreach",
    desc: "Secuencias frías totalmente orquestadas (Brevo, Outlook). La máquina prospecta, filtra y entrega el lead templado a tu equipo humano.",
  },
  {
    icon: Zap,
    title: "Automatización n8n/Make",
    desc: "Adiós al copiar y pegar. Tu ecosistema se hablará de forma nativa vía APIs y Webhooks; desde la factura hasta el onboarding.",
  },
  {
    icon: Shield,
    title: "Arquitectura Privada",
    desc: "Datos encriptados bajo RLS (Row Level Security). Tus bases de clientes no se comparten en plataformas de terceros genéricas.",
  },
  {
    icon: Clock,
    title: "Soporte DevOps B2B",
    desc: "Nuestras construcciones incluyen alertas de fallos en Slack/Discord y monitorización de scripts para un uptime impecable.",
  },
]

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

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 text-gradient animate-fade-in-up">
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
      <div className="border-y border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-foreground mb-0.5" style={{ fontFamily: 'var(--font-syne)' }}>{s.value}</div>
                <div className="text-xs text-neutral-500">{s.label}</div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.666%+24px)] right-[calc(16.666%+24px)] h-px bg-gradient-to-r from-neutral-800 via-blue-900/50 to-neutral-800" />

            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8 hover:border-neutral-700 hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Step number */}
                <div className="absolute -top-3.5 left-6 text-xs font-bold tracking-widest text-blue-500 bg-background px-2">
                  {step.number}
                </div>
                <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 mt-2 group-hover:border-blue-900/60 group-hover:bg-blue-950/30 transition-colors icon-glow-hover">
                  <step.icon className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
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

            {/* Dashboard Mockup */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.12)] relative aspect-[4/3] w-full group glow-blue-sm hover:glow-blue-md transition-all duration-500">
              <Image
                src="/radar_boe_mockup.png"
                alt="Mavie Automations Ecosystem Dashboard"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none" />
              <div className="absolute inset-0 ring-1 ring-inset ring-neutral-700/50 rounded-2xl pointer-events-none" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 border border-white/10 bg-black/50 backdrop-blur-md rounded-xl glass-card">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-neutral-300 font-medium">Bandeja de Entrada Sincronizada</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-6 hover:border-neutral-700 hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-5 group-hover:border-blue-900/50 group-hover:bg-blue-950/20 transition-all icon-glow-hover">
                  <f.icon className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8 flex flex-col gap-6 hover:border-neutral-700 transition-all group relative overflow-hidden"
              >
                {/* Subtle gradient top-left corner */}
                <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-blue-600/5 blur-2xl pointer-events-none" />

                <Quote className="w-6 h-6 text-blue-900 shrink-0" />

                <p className="text-sm text-neutral-400 leading-relaxed flex-1 italic">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-neutral-800">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 group-hover:border-blue-900/50 group-hover:bg-blue-950/20 transition-colors">
                    <t.icon className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 transition-colors" />
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

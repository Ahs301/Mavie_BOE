import Link from "next/link";
import { ShieldCheck, Workflow, Database, LineChart, ArrowRight, Server, Code2, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecosistema y Precios | Mavie Automations",
  description: "Desarrollo de CRMs a medida, pipelines de scraping y motores de automatización B2B. Conoce nuestra metodología de Setup + Mantenimiento.",
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6 text-center border-b border-neutral-800 bg-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-neutral-950 to-neutral-950"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 mb-8">
            <Server className="w-4 h-4 mr-2" /> Infraestructura B2B Dedicada
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            No vendemos software genérico.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-300 to-white">Construimos tu Ecosistema Operativo.</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Desde la extracción masiva de datos (Scraping) hasta centrales CRM a medida e integraciones con tu ERP actual. Soluciones de ingeniería diseñadas para empresas que quieren escalar agresivamente sin inflar su coste de nóminas.
          </p>
        </div>
      </section>

      {/* ── Capacidades CORE (Bento Grid) ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-sm font-bold tracking-widest text-neutral-500 uppercase mb-12 text-center">Nuestras Capacidades Core</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Grandes Datos */}
            <div className="md:col-span-2 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
              <Database className="h-10 w-10 text-blue-400 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-3 text-white relative z-10">Data Scraping & Estructuración (ETL)</h3>
              <p className="text-neutral-400 leading-relaxed relative z-10 max-w-lg">
                Desplegamos motores de extracción en servidores VPS dedicados para rastrear el BOE, DOUE, Google Maps, o portales B2B. Limpiamos, cruzamos y volcamos miles de datos diarios directamente en tus bases de datos propietarias.
              </p>
            </div>

            {/* Card 2: CRM */}
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-8 rounded-2xl relative overflow-hidden">
              <Code2 className="h-10 w-10 text-emerald-400 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-3 text-white">Dashboards y CRM a Medida</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                Construimos centros de control. Nada de Excels rotos ni SaaS sobrepreciados; desarrollamos paneles web privados (Next.js + SQL) adaptados 100% a tus flujos de validación y ventas.
              </p>
            </div>

            {/* Card 3: Outreach */}
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-8 rounded-2xl relative overflow-hidden">
              <LineChart className="h-10 w-10 text-purple-400 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-3 text-white">Outreach Engines</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                Sistemas autónomos que conectan nuestra prospección con IA (personalización de mensajes) y herramientas como Brevo. Tu equipo comercial solo entra en escena cuando el lead ya está templado.
              </p>
            </div>

            {/* Card 4: Automatización */}
            <div className="md:col-span-2 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-8 rounded-2xl relative overflow-hidden group">
              <Workflow className="h-10 w-10 text-amber-400 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-3 text-white relative z-10">Automatización de Procesos (n8n / APIs)</h3>
              <p className="text-neutral-400 leading-relaxed relative z-10 max-w-lg">
                Auditamos cómo se mueve la información en tu empresa. Reemplazamos tareas de &ldquo;copiar y pegar&rdquo; por flujos automatizados (webhooks, APIs) que operan 24/7 sin fatiga ni latencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modelo de Negocio / Pricing ── */}
      <section className="py-24 px-6 border-t border-neutral-800 bg-neutral-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Metodología y Precios</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">Trabajamos como de tu departamento de operaciones externo. La calidad de ingeniería exige un compromiso real de ambas partes.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            
            {/* Setup */}
            <div className="border border-neutral-800 bg-neutral-950 rounded-2xl p-8 lg:p-12 relative flex flex-col">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">Fase 1: Setup e Implementación</h3>
                <div className="text-neutral-500 mb-6 text-sm font-medium">Pago único al iniciar</div>
                <div className="text-4xl font-black text-white mb-8">Desde 1.200€ <span className="text-lg font-medium text-neutral-500">/proyecto</span></div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
                    <span className="text-neutral-400 text-sm">Auditoría técnica profunda de tus cuellos de botella.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
                    <span className="text-neutral-400 text-sm">Programación a medida del pipeline o CRM base.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
                    <span className="text-neutral-400 text-sm">Despliegue inicial e integraciones con tu stack.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Retainer */}
            <div className="border border-blue-500/30 bg-blue-900/5 rounded-2xl p-8 lg:p-12 relative flex flex-col shadow-[0_0_40px_rgba(59,130,246,0.05)]">
               <div className="absolute top-0 right-0 py-1.5 px-4 bg-blue-600 text-white text-xs font-bold rounded-bl-xl rounded-tr-xl">
                 RECURRENTE
               </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-blue-100 mb-2">Fase 2: Licencia y Mantenimiento</h3>
                <div className="text-blue-400/60 mb-6 text-sm font-medium">Fee operativo mensual</div>
                <div className="text-4xl font-black text-white mb-8">Desde 300€ <span className="text-lg font-medium text-blue-500/50">/mes</span></div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-neutral-300 text-sm">Costes de servidores VPS y bases de datos incuídos.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-neutral-300 text-sm">Resolución de tickets, caídas de scraping o fallos API.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-neutral-300 text-sm">Acuérdalo como tener un ingeniero DATO/DevOps en nómina, pero 10x más barato.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          <div className="mt-16 bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center flex flex-col items-center">
            <h3 className="text-xl font-bold mb-3">¿Tu ecosistema es más complejo?</h3>
            <p className="text-neutral-400 text-sm max-w-xl mb-6">Si necesitas un ERP gigantesco integrado con múltiples flujos de Inteligencia Artificial y múltiples motores de extracción asíncronos, los presupuestos son 100% personalizados.</p>
            <Link href="/contacto" className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-bold text-black transition-all hover:bg-neutral-200 hover:scale-105 shadow-xl">
              Solicitar Auditoría y Llamada Técnica
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}

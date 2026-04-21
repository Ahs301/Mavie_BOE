import Link from "next/link";
import { MoveRight, Cpu, LineChart, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Sobre Mavie | Ingeniería de Automatización y Datos B2B",
  description: "Conoce la visión de Mavie Automations. Transformamos procesos manuales ineficientes en ecosistemas digitales autónomos para empresas tecnológicas y consultoras.",
  keywords: ["automatización B2B", "datos B2B", "ingeniería de datos", "ecosistemas digitales", "Mavie Automations", "procesos ineficientes"],
  openGraph: {
    title: "Sobre Mavie | Ingeniería de Automatización y Datos B2B",
    description: "Transformamos procesos manuales ineficientes en ecosistemas digitales autónomos.",
    type: "website",
  },
};

export default function SobreMaviePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 flex flex-col items-center justify-center text-center border-b border-neutral-800 bg-neutral-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-neutral-900/40 via-neutral-950 to-neutral-950"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-sm font-medium text-neutral-300 mb-8">
            Nuestra Visión
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            La automatización no es el futuro. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-white">
              Es el estándar mínimo hoy.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Mavie Automations nace con una premisa técnica innegociable: si un proceso digital en tu empresa es repetitivo, es un cuello de botella que podemos y debemos eliminar.
          </p>
        </div>
      </section>

      {/* Manifesto / Por qué existimos */}
      <section className="py-24 px-6 bg-neutral-950 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-neutral-800 max-w-[40px]" />
              <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">El Problema</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">El fin del <span className="text-neutral-500 italic font-normal">"trabajo en la sombra"</span></h2>
            <div className="space-y-6 text-neutral-400 text-lg leading-relaxed">
              <p>
                Asesorías perdiendo horas rastreando boletines. Departamentos comerciales actualizando CRMs de forma manual. Operaciones colapsando bajo el peso de copiar y pegar datos entre plataformas inconexas.
              </p>
              <p>
                Mavie Automations existe para extirpar la fricción operativa. No vendemos "humo tecnológico" ni tendencias de inteligencia artificial vacías de casos de uso reales. 
              </p>
              <p className="font-medium text-neutral-200 border-l-2 border-blue-500 pl-4">
                Diseñamos e implementamos ecosistemas de datos, scraping avanzado y alertas automatizadas que devuelven a las empresas el recurso más caro que existe: el tiempo de su talento humano.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 p-8 rounded-2xl hover:bg-neutral-800/50 transition-colors">
              <Cpu className="w-8 h-8 mb-4 text-emerald-400" />
              <h3 className="text-xl font-bold mb-2 text-white">Ingeniería Robusta</h3>
              <p className="text-sm text-neutral-400">Despliegues en arquitecturas serverless y servidores VPS dedicados para cargas de datos pesadas.</p>
            </div>
            <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 p-8 rounded-2xl hover:bg-neutral-800/50 transition-colors sm:translate-y-8">
              <LineChart className="w-8 h-8 mb-4 text-blue-400" />
              <h3 className="text-xl font-bold mb-2 text-white">Métricas Reales</h3>
              <p className="text-sm text-neutral-400">Las automatizaciones se auditan por horas de plantilla ahorradas y leads facturables conseguidos.</p>
            </div>
            <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 p-8 rounded-2xl hover:bg-neutral-800/50 transition-colors">
              <ShieldCheck className="w-8 h-8 mb-4 text-purple-400" />
              <h3 className="text-xl font-bold mb-2 text-white">Privacidad RLS</h3>
              <p className="text-sm text-neutral-400">Bases de datos relacionales blindadas por políticas de Row Level Security (RLS) en Supabase.</p>
            </div>
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 p-8 rounded-2xl sm:translate-y-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
              <div className="relative z-10">
                <div className="text-4xl font-black text-white mb-4 tracking-tighter">24/7</div>
                <h3 className="text-xl font-bold mb-2 text-white">Monitorización</h3>
                <p className="text-sm text-neutral-400">Tus agentes de extracción y consolidación no duermen ni cometen errores por fatiga visual.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metodología de Trabajo */}
      <section className="py-24 px-6 border-t border-b border-neutral-800 bg-neutral-900/20 relative">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-6">
            Nuestra Metodología
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Tratamos los desafíos de negocio como problemas de ingeniería.</h2>
          <p className="text-lg text-neutral-400">Sin reuniones innecesarias. Solo auditoría, arquitectura y despliegue rápido.</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-background border border-neutral-800 rounded-3xl p-10 relative overflow-hidden group hover:border-neutral-700 transition-all">
            <span className="absolute top-6 right-8 text-7xl font-bold text-neutral-900/50 group-hover:text-neutral-800/80 transition-colors">1</span>
            <div className="relative z-10 mt-12">
              <h3 className="text-2xl font-bold mb-4 text-white">Auditoría Quirúrgica</h3>
              <p className="text-neutral-400 leading-relaxed">Examinamos el flujo de trabajo actual e identificamos cuellos de botella exactos, evaluando la viabilidad técnica de su automatización (coste vs impacto).</p>
            </div>
          </div>
          <div className="bg-background border border-neutral-800 rounded-3xl p-10 relative overflow-hidden group hover:border-neutral-700 transition-all">
            <span className="absolute top-6 right-8 text-7xl font-bold text-neutral-900/50 group-hover:text-neutral-800/80 transition-colors">2</span>
            <div className="relative z-10 mt-12">
              <h3 className="text-2xl font-bold mb-4 text-white">Diseño Arquitectónico</h3>
              <p className="text-neutral-400 leading-relaxed">Seleccionamos el stack correcto. Integramos bases de datos con módulos de extracción asíncrona y paneles Next.js para garantizar la escalabilidad.</p>
            </div>
          </div>
          <div className="bg-background border border-neutral-800 rounded-3xl p-10 relative overflow-hidden group hover:border-neutral-700 transition-all border-b-4 hover:border-b-blue-500">
            <span className="absolute top-6 right-8 text-7xl font-bold text-neutral-900/50 group-hover:text-neutral-800/80 transition-colors">3</span>
            <div className="relative z-10 mt-12">
              <h3 className="text-2xl font-bold mb-4 text-white">Despliegue ERP</h3>
              <p className="text-neutral-400 leading-relaxed">Entregamos la solución operativa, alojada y conectada a tus sistemas actuales. Monitorizamos los logs técnicos del bot en tu panel privado en tiempo real.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 bg-blue-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">Delega tus operaciones a las máquinas.</h2>
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">Agenda una sesión técnica con nosotros. Exploraremos la infraestructura de tu negocio y cotizaremos tu centro de automatización.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacto" className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-black transition-colors hover:bg-neutral-200">
              Solicitar Presupuesto Técnico
            </Link>
            <Link href="/soluciones" className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-800 bg-transparent px-8 text-sm font-medium text-white transition-colors hover:bg-neutral-800 gap-2">
              Ver Catálogo de Soluciones <MoveRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

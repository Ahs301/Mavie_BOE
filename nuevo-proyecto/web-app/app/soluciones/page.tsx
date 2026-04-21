import Link from "next/link";
import { MoveRight, Zap, Target, Search, Database } from "lucide-react";

export const metadata = {
  title: "Catálogo de Soluciones | Mavie Automations",
  description: "Explora nuestros productos de automatización empaquetados y soluciones a medida para empresas y consultoras B2B.",
  keywords: ["soluciones automatización", "B2B", "captación B2B", "Radar BOE", "Extracción de datos", "CRM automático"],
  openGraph: {
    title: "Catálogo de Soluciones | Mavie Automations",
    description: "Nuestros productos de automatización empaquetados y soluciones a medida para empresas B2B.",
    type: "website",
  },
};

export default function SolucionesPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
      
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Ecosistema de Soluciones
        </h1>
        <p className="text-xl text-neutral-400 max-w-3xl">
          Sistemas empaquetados listos para desplegar en tu empresa y arquitectura a medida para problemas complejos de extracción de datos y automatización comercial.
        </p>
      </div>

      {/* Solución Destacada: Radar BOE */}
      <section className="mb-24">
        <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-300">Producto Estrella Disponible</h2>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col md:flex-row group">
          <div className="p-10 md:w-3/5 flex flex-col justify-center">
            <div className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-white mb-6 w-fit scale-95 origin-left">
              B2B Inteligencia Competitiva
            </div>
            <h3 className="text-3xl font-bold mb-4">Radar Estratégico BOE/DOUE</h3>
            <p className="text-neutral-400 mb-8 max-w-xl">
              Monitorización 24/7 de ayudas, subvenciones, licitaciones y contratos públicos autonómicos cruzados con tus keywords y excluyentes mediante heurística. Todo reportado al instante a tu email.
            </p>
            <div className="flex gap-4">
              <Link href="/soluciones/boe" className="inline-flex h-10 items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-neutral-200">
                Ver Detalles Funcionales
              </Link>
            </div>
          </div>
          <div className="bg-neutral-950 md:w-2/5 p-10 border-t md:border-t-0 md:border-l border-neutral-800 flex flex-col justify-center">
            <h4 className="font-medium text-neutral-300 mb-4 text-sm">Casos de Uso Ideales</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-neutral-400">
                <Target className="w-5 h-5 text-neutral-500 shrink-0" />
                <span>Consultoras captando licitaciones a primera hora de la mañana.</span>
              </li>
              <li className="flex gap-3 text-sm text-neutral-400">
                <Search className="w-5 h-5 text-neutral-500 shrink-0" />
                <span>Despachos analizando normativa de impacto directo en sus clientes VIP.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Catálogo Futuro */}
      <section>
        <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
          <div className="h-2 w-2 bg-neutral-600 rounded-full"></div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-400">Próximos Packs de Automatización</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-neutral-800 rounded-xl p-8 bg-neutral-950/50 relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-xs font-medium bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-md text-neutral-500">
              Próximamente
            </div>
            <Zap className="w-8 h-8 text-neutral-600 mb-6" />
            <h3 className="text-lg font-bold text-neutral-300 mb-3">Enriquecimiento de Leads</h3>
            <p className="text-sm text-neutral-500">
              Sistema de scraping de empresas locales. Encuentra los datos de contacto y cargos decisores a partir de un listado simple de URLs y cruza datos de registros públicos.
            </p>
          </div>

          <div className="border border-neutral-800 rounded-xl p-8 bg-neutral-950/50 relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-xs font-medium bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-md text-neutral-500">
              Próximamente
            </div>
            <Database className="w-8 h-8 text-neutral-600 mb-6" />
            <h3 className="text-lg font-bold text-neutral-300 mb-3">CRM Sync Automático</h3>
            <p className="text-sm text-neutral-500">
              Integración bidireccional inteligente. Conecta de forma silenciosa la contabilidad, el soporte y ventas evitando copiado humano y alertando de inconsistencias.
            </p>
          </div>

          <div className="border border-neutral-800 rounded-xl p-8 bg-neutral-900/10 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-bold text-neutral-300 mb-3">Arquitectura a Medida</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Si tu desafío de datos no encaja en productos estandarizados, creamos la infraestructura desde cero.
            </p>
            <Link href="/contacto" className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700">
              Hablar con Ingeniería
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

import { Metadata } from 'next'
import { Rocket, Target, Mail, BarChart3, ArrowRight, Bot, Search, Users } from 'lucide-react'
import Link from 'next/link'
import { serviceSchema, breadcrumbSchema, jsonLdScript } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Outreach B2B Inteligente | Prospección Automatizada',
  description: 'Automatiza la captación B2B con tecnología combinada de Scraping, Inteligencia Artificial y Cold Emailing con alta entregabilidad.',
  alternates: { canonical: 'https://mavieautomations.com/soluciones/prospeccion' },
}

const schema = serviceSchema({
  name: 'Prospección B2B Automatizada',
  description:
    'Sistema de captación B2B que combina scraping de empresas, análisis con IA y cold emailing hiper-personalizado con alta entregabilidad.',
  path: '/soluciones/prospeccion',
  serviceType: 'Automatización de prospección y outreach comercial',
  areaServed: ['ES', 'EU'],
})

const breadcrumbs = breadcrumbSchema([
  { name: 'Inicio', path: '/' },
  { name: 'Soluciones', path: '/soluciones' },
  { name: 'Prospección B2B', path: '/soluciones/prospeccion' },
])

export default function ProspeccionB2BPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ data: schema })} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ data: breadcrumbs })} />
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">

        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium border border-blue-500/20">
            <Rocket className="w-4 h-4" /> Lanzamiento Exclusivo
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white font-heading">
            Máquina de Prospección B2B Automatizada
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400">
            Encuentra empresas calientes en Google, analízalas con IA y contáctalas por email de forma hiper-personalizada. Sin contratar más comerciales.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Link href="/contacto" className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors">
              Pide tu Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Features Core */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <Search className="w-10 h-10 text-blue-500 mb-5" />
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Detección Láser</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Barremos bases de datos y Google Maps masivamente buscando el tipo exacto de empresa B2B que necesita tus servicios.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <Bot className="w-10 h-10 text-emerald-500 mb-5" />
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Clasificación IA</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Nuestro motor de OpenAI escanea cada web en milisegundos, descarta a los que no aplican y redacta una línea inicial perfecta.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <Target className="w-10 h-10 text-purple-500 mb-5" />
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Envío Perforador</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Evitamos el SPAM con rotación de protocolos IMAP y delays matemáticos. Seguimientos automáticos en el mismo hilo de correo.
            </p>
          </div>
        </div>

        {/* Tracking Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white font-heading">
              Toma de decisiones basada en Píxeles de Rastreo
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-neutral-900 dark:text-white">Pixel Invisible (Apertura)</h4>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">Sabemos exactamente quién y cuántas veces abre el correo, detectando el grado de &ldquo;ansiedad&rdquo; del cliente potencial.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-neutral-900 dark:text-white">Tracking de Enlaces Multi-rutas</h4>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">Analizamos el interés real monitoreando clics. Descubre quién fue al dossier PDF de precios y quién a la web principal.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-neutral-900 dark:text-white">Extracción Hot Leads</h4>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">El sistema cruza datos y te extrae una lista de las 10 personas más calientes del día para que les llames por teléfono de inmediato.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square md:aspect-auto md:h-[500px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative p-8 flex flex-col justify-center gap-4">
               {/* UI Mockup del tracker */}
               <div className="w-full bg-white dark:bg-black rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                    <div>
                      <div className="h-3 w-24 bg-neutral-300 dark:bg-neutral-700 rounded mb-2" />
                      <div className="h-2 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <span className="px-2 py-1 bg-green-100 dark:bg-emerald-500/20 text-green-700 dark:text-emerald-400 text-xs rounded font-bold">Apertura Detectada</span>
                  </div>
               </div>
               
               <div className="w-full bg-white dark:bg-black rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                    <div>
                      <div className="h-3 w-24 bg-neutral-300 dark:bg-neutral-700 rounded mb-2" />
                      <div className="h-2 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <span className="px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs rounded font-bold">Clic Registrado</span>
                  </div>
               </div>

               <div className="absolute -right-4 top-10 bg-blue-500/20 border border-blue-500 text-blue-600 dark:text-blue-400 text-xs px-3 py-1 font-bold rounded-l-lg shadow-xl shadow-blue-500/10">HOT LEAD</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

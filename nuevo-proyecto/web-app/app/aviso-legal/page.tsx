import type { Metadata } from "next"
import Link from "next/link"

const LAST_UPDATED = "15 de abril de 2026"

export const metadata: Metadata = {
  title: "Aviso Legal",
  description:
    "Información legal del titular del sitio web Mavie Automations conforme a la LSSI-CE.",
  alternates: { canonical: "https://mavieautomations.com/aviso-legal" },
  robots: { index: true, follow: true },
}

export default function AvisoLegalPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
      <header className="mb-12 border-b border-neutral-800 pb-8">
        <p className="text-sm text-neutral-500 mb-3">Última actualización: {LAST_UPDATED}</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Aviso Legal</h1>
        <p className="text-lg text-neutral-400">
          Información legal en cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE).
        </p>
      </header>

      <article className="space-y-10 text-neutral-300 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. Titularidad del sitio</h2>
          <ul className="space-y-1.5 text-sm">
            <li><span className="text-neutral-500">Denominación:</span> Mavie Automations</li>
            <li><span className="text-neutral-500">NIF:</span> [pendiente de completar]</li>
            <li><span className="text-neutral-500">Domicilio:</span> Valencia, España</li>
            <li><span className="text-neutral-500">Email:</span> <a href="mailto:contacto@mavieautomations.com" className="text-blue-400 hover:text-blue-300">contacto@mavieautomations.com</a></li>
            <li><span className="text-neutral-500">Teléfono:</span> +34 633 448 806</li>
            <li><span className="text-neutral-500">Dominio:</span> mavieautomations.com</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Objeto</h2>
          <p>
            El presente aviso legal regula el uso del sitio web mavieautomations.com, propiedad de Mavie Automations (en adelante, &quot;el Titular&quot;). El acceso al sitio implica la aceptación de las condiciones aquí reflejadas. Si no las aceptas, abstente de utilizar el sitio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. Condiciones de uso</h2>
          <p className="mb-3">El Usuario se compromete a utilizar el sitio conforme a la ley, la moral y el orden público. En particular, queda prohibido:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li>Utilizar el sitio con fines fraudulentos o lesivos de derechos de terceros.</li>
            <li>Introducir virus informáticos, código malicioso o realizar ataques que degraden el servicio.</li>
            <li>Reproducir, copiar, distribuir o transformar los contenidos sin autorización escrita del Titular.</li>
            <li>Realizar scraping masivo automatizado del sitio sin consentimiento previo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Propiedad intelectual e industrial</h2>
          <p>
            Todos los contenidos del sitio —textos, código, diseños, logotipos, marcas, fotografías y software— son titularidad del Titular o de terceros que han autorizado su uso. Quedan reservados todos los derechos conforme al Real Decreto Legislativo 1/1996. La marca Mavie Automations y sus signos distintivos están protegidos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">5. Limitación de responsabilidad</h2>
          <p className="mb-3">El Titular no se hace responsable de:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li>Interrupciones, errores o fallos técnicos ajenos a su control razonable.</li>
            <li>Daños derivados del uso indebido del sitio por parte del Usuario.</li>
            <li>Contenidos de sitios externos enlazados. Los enlaces se facilitan a título informativo.</li>
            <li>Decisiones empresariales tomadas únicamente sobre la base de las alertas del servicio Radar BOE; el cliente debe verificar la información antes de actuar.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">6. Protección de datos</h2>
          <p>
            El tratamiento de datos personales se regula en nuestra <Link href="/privacidad" className="text-blue-400 hover:text-blue-300">Política de Privacidad</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">7. Legislación aplicable y jurisdicción</h2>
          <p>
            Este aviso legal se rige por la legislación española. Para cualquier controversia derivada del uso del sitio, las partes se someten a los juzgados y tribunales de Valencia (España), con renuncia expresa a cualquier otro fuero que pudiera corresponderles, salvo que el Usuario sea consumidor y la normativa aplicable imponga otro fuero.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">8. Modificaciones</h2>
          <p>
            El Titular se reserva el derecho a modificar este aviso legal en cualquier momento. La versión vigente es la publicada en esta página en la fecha de acceso.
          </p>
        </section>
      </article>
    </div>
  )
}

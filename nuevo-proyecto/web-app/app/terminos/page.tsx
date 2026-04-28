import type { Metadata } from "next"
import Link from "next/link"

const LAST_UPDATED = "15 de abril de 2026"

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso del servicio Radar BOE de Mavie Automations. Suscripción, pagos, cancelación y responsabilidades.",
  alternates: { canonical: "https://mavieautomations.com/terminos" },
  robots: { index: true, follow: true },
}

export default function TerminosPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
      <header className="mb-12 border-b border-neutral-800 pb-8">
        <p className="text-sm text-neutral-500 mb-3">Última actualización: {LAST_UPDATED}</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Términos y Condiciones</h1>
        <p className="text-lg text-neutral-400">
          El acceso y uso de los servicios de Mavie Automations implica la aceptación de los presentes términos. Léelos antes de contratar.
        </p>
      </header>

      <article className="prose prose-invert prose-neutral max-w-none space-y-10 text-neutral-300 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. Identificación del prestador</h2>
          <ul className="space-y-1.5 text-sm">
            <li><span className="text-neutral-500">Titular:</span> Mavie Automations</li>
            <li><span className="text-neutral-500">Domicilio:</span> Valencia, España</li>
            <li><span className="text-neutral-500">NIF:</span> [pendiente de completar]</li>
            <li><span className="text-neutral-500">Email:</span> <a href="mailto:contacto@mavieautomations.com" className="text-blue-400 hover:text-blue-300">contacto@mavieautomations.com</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Objeto del servicio</h2>
          <p>
            Mavie Automations proporciona el servicio <strong className="text-foreground">Radar BOE</strong>: monitorización automática del Boletín Oficial del Estado (BOE), Diario Oficial de la Unión Europea (DOUE) y boletines autonómicos, con filtrado inteligente por keywords y envío de alertas y resúmenes por email al equipo del cliente.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. Planes y precios</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-neutral-800 rounded-lg overflow-hidden">
              <thead className="bg-neutral-900/70 text-neutral-400">
                <tr>
                  <th className="text-left p-3 font-medium">Plan</th>
                  <th className="text-left p-3 font-medium">Precio</th>
                  <th className="text-left p-3 font-medium">Usuarios</th>
                  <th className="text-left p-3 font-medium">Keywords</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                <tr>
                  <td className="p-3">Básico</td>
                  <td className="p-3">79&euro;/mes</td>
                  <td className="p-3">1</td>
                  <td className="p-3">10</td>
                </tr>
                <tr>
                  <td className="p-3">Pro</td>
                  <td className="p-3">179&euro;/mes</td>
                  <td className="p-3">5</td>
                  <td className="p-3">50</td>
                </tr>
                <tr>
                  <td className="p-3">Business</td>
                  <td className="p-3">399&euro;/mes</td>
                  <td className="p-3">Ilimitados</td>
                  <td className="p-3">Ilimitadas</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm mt-3 text-neutral-400">
            Todos los precios incluyen IVA cuando aplica. Los precios pueden modificarse con 30 días de preaviso por email.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Facturación y pago</h2>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>La suscripción se cobra mensualmente de forma recurrente mediante Stripe.</li>
            <li>El cargo se realiza en la fecha de contratación y se renueva automáticamente cada mes.</li>
            <li>En caso de impago, el servicio se suspende tras el periodo de gracia de Stripe (generalmente 7 días).</li>
            <li>No se realizan reembolsos por periodos parciales salvo error imputable a Mavie Automations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cancelación</h2>
          <p>
            Puedes cancelar tu suscripción en cualquier momento desde el <Link href="/panel" className="text-blue-400 hover:text-blue-300">panel de cliente</Link> o a través del portal de facturación de Stripe. La cancelación tiene efecto al final del periodo mensual en curso. No hay penalización ni permanencia mínima.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">6. Obligaciones del cliente</h2>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Proporcionar datos de contacto y facturación verídicos.</li>
            <li>Usar el servicio para fines lícitos y dentro de los límites del plan contratado.</li>
            <li>No compartir credenciales de acceso con terceros no autorizados.</li>
            <li>No intentar acceder a datos de otros clientes ni a partes no autorizadas del sistema.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">7. Nivel de servicio y disponibilidad</h2>
          <p>
            Mavie Automations se compromete a mantener el servicio disponible con un objetivo de uptime del 99,9% mensual. Los avisos de publicación en el BOE se procesan en un tiempo objetivo inferior a 5 minutos desde la publicación oficial. Estos objetivos no constituyen una garantía contractual vinculante y pueden verse afectados por causas ajenas a nuestro control (fallos de la API del BOE, eventos de fuerza mayor, mantenimientos planificados comunicados con antelación).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitación de responsabilidad</h2>
          <p>
            Mavie Automations no es responsable de las decisiones empresariales tomadas en base a las alertas recibidas. El servicio es una herramienta de monitorización informativa. La información del BOE es pública y oficial; Mavie Automations actúa como intermediario de procesamiento, no como fuente primaria. La responsabilidad máxima de Mavie Automations frente al cliente en ningún caso superará el importe pagado en los últimos 3 meses de servicio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">9. Propiedad intelectual</h2>
          <p>
            El software, diseño, algoritmos de filtrado y contenidos del sitio son propiedad exclusiva de Mavie Automations. El cliente obtiene una licencia de uso no exclusiva, intransferible y limitada al plan contratado. Queda prohibida la reproducción, distribución o ingeniería inversa del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">10. Privacidad y datos personales</h2>
          <p>
            El tratamiento de datos personales se rige por nuestra <Link href="/privacidad" className="text-blue-400 hover:text-blue-300">Política de Privacidad</Link>, conforme al RGPD y la LOPDGDD.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">11. Modificaciones de los términos</h2>
          <p>
            Mavie Automations puede modificar estos términos con 30 días de preaviso por email. El uso continuado del servicio tras ese plazo implica la aceptación de los nuevos términos. Si no estás de acuerdo, puedes cancelar sin penalización antes de que entren en vigor.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">12. Legislación y jurisdicción</h2>
          <p>
            Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de Valencia, renunciando a cualquier otro fuero que pudiera corresponderles.
          </p>
        </section>

        <section className="text-sm text-neutral-500">
          <p>
            ¿Tienes preguntas? <a href="mailto:contacto@mavieautomations.com" className="text-blue-400 hover:text-blue-300">contacto@mavieautomations.com</a>
          </p>
        </section>
      </article>
    </div>
  )
}

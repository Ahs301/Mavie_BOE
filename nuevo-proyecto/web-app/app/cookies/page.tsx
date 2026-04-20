import type { Metadata } from "next"
import Link from "next/link"

const LAST_UPDATED = "15 de abril de 2026"

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Información sobre el uso de cookies en mavieautomations.com conforme a la LSSI-CE y la guía de la AEPD.",
  alternates: { canonical: "https://mavieautomations.com/cookies" },
  robots: { index: true, follow: true },
}

export default function CookiesPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
      <header className="mb-12 border-b border-neutral-800 pb-8">
        <p className="text-sm text-neutral-500 mb-3">Última actualización: {LAST_UPDATED}</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Política de Cookies</h1>
        <p className="text-lg text-neutral-400">
          Información sobre el uso de cookies y tecnologías similares en este sitio, de acuerdo con el art. 22.2 de la LSSI-CE y las directrices de la AEPD.
        </p>
      </header>

      <article className="space-y-10 text-neutral-300 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. ¿Qué es una cookie?</h2>
          <p>
            Una cookie es un pequeño fichero de texto que los sitios web almacenan en tu dispositivo para recordar información sobre tu visita: idioma preferido, estado de sesión, consentimiento otorgado, etc. No son programas ejecutables ni contienen virus.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Cookies utilizadas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-neutral-800 rounded-lg overflow-hidden">
              <thead className="bg-neutral-900/70 text-neutral-400">
                <tr>
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Titular</th>
                  <th className="text-left p-3 font-medium">Finalidad</th>
                  <th className="text-left p-3 font-medium">Tipo</th>
                  <th className="text-left p-3 font-medium">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                <tr>
                  <td className="p-3 font-mono text-xs">mavie_cookie_consent_v1</td>
                  <td className="p-3">Mavie Automations</td>
                  <td className="p-3">Recordar la decisión de consentimiento del usuario.</td>
                  <td className="p-3">Técnica (localStorage)</td>
                  <td className="p-3">Persistente</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">sb-*-auth-token</td>
                  <td className="p-3">Supabase</td>
                  <td className="p-3">Autenticación de usuarios admin del panel.</td>
                  <td className="p-3">Técnica</td>
                  <td className="p-3">Sesión</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">hcaptcha</td>
                  <td className="p-3">Intuition Machines, Inc.</td>
                  <td className="p-3">Protección anti-bot en formularios públicos.</td>
                  <td className="p-3">Técnica</td>
                  <td className="p-3">Sesión</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">theme</td>
                  <td className="p-3">Mavie Automations</td>
                  <td className="p-3">Persistir tema claro/oscuro elegido.</td>
                  <td className="p-3">Preferencia (localStorage)</td>
                  <td className="p-3">1 año</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-neutral-400">
            Actualmente no utilizamos cookies analíticas ni publicitarias. Si las incorporamos en el futuro, se solicitará consentimiento expreso previo y se actualizará esta política.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. Base legal</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li><strong className="text-foreground">Cookies técnicas:</strong> exentas del requisito de consentimiento conforme al art. 22.2 LSSI-CE (necesarias para la prestación del servicio).</li>
            <li><strong className="text-foreground">Cookies analíticas, de preferencia o marketing:</strong> requieren consentimiento previo, informado e inequívoco del usuario.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cómo gestionar tus preferencias</h2>
          <p className="mb-3">Puedes gestionar o revocar tu consentimiento en cualquier momento:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li>Eliminando el valor <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded">mavie_cookie_consent_v1</code> de tu almacenamiento local para volver a ver el banner.</li>
            <li>Desde la configuración de tu navegador: <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Chrome</a>, <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Firefox</a>, <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Safari</a>, <a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Edge</a>.</li>
            <li>Activando el modo de navegación privada de tu navegador.</li>
          </ul>
          <p className="mt-3 text-sm text-neutral-400">
            Deshabilitar cookies técnicas puede afectar al correcto funcionamiento del sitio y del panel de administración.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">5. Transferencias internacionales</h2>
          <p>
            hCaptcha implica transferencia a Estados Unidos. La transferencia se ampara en las cláusulas contractuales tipo aprobadas por la Comisión Europea. Supabase opera con servidores en la Unión Europea.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">6. Más información</h2>
          <p>
            Para más información sobre el tratamiento de datos personales derivado del uso de cookies, consulta nuestra <Link href="/privacidad" className="text-blue-400 hover:text-blue-300">Política de Privacidad</Link>.
          </p>
        </section>
      </article>
    </div>
  )
}

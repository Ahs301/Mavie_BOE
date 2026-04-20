import type { Metadata } from "next"
import Link from "next/link"

const LAST_UPDATED = "15 de abril de 2026"

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de Mavie Automations: tratamiento de datos personales conforme al RGPD y la LOPDGDD.",
  alternates: { canonical: "https://mavieautomations.com/privacidad" },
  robots: { index: true, follow: true },
}

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
      <header className="mb-12 border-b border-neutral-800 pb-8">
        <p className="text-sm text-neutral-500 mb-3">Última actualización: {LAST_UPDATED}</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Política de Privacidad</h1>
        <p className="text-lg text-neutral-400">
          Esta política describe cómo Mavie Automations recoge, utiliza y protege tus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
        </p>
      </header>

      <article className="prose prose-invert prose-neutral max-w-none space-y-10 text-neutral-300 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. Responsable del tratamiento</h2>
          <ul className="space-y-1.5 text-sm">
            <li><span className="text-neutral-500">Titular:</span> Mavie Automations</li>
            <li><span className="text-neutral-500">Domicilio:</span> Valencia, España</li>
            <li><span className="text-neutral-500">NIF:</span> [pendiente de completar]</li>
            <li><span className="text-neutral-500">Email:</span> <a href="mailto:contacto@mavieautomations.com" className="text-blue-400 hover:text-blue-300">contacto@mavieautomations.com</a></li>
            <li><span className="text-neutral-500">Teléfono:</span> +34 633 448 806</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Datos que recabamos</h2>
          <p className="mb-3">Tratamos únicamente los datos que nos facilitas a través de los formularios del sitio o en el curso de la relación contractual:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong className="text-foreground">Formulario de contacto:</strong> nombre, email, empresa, teléfono opcional, mensaje.</li>
            <li><strong className="text-foreground">Formulario de onboarding BOE:</strong> datos de empresa, sector, keywords, destinatarios de alertas, configuración del radar.</li>
            <li><strong className="text-foreground">Datos técnicos:</strong> dirección IP, tipo de navegador, páginas visitadas (cookies técnicas).</li>
            <li><strong className="text-foreground">Datos de facturación:</strong> razón social, NIF y dirección si formalizas contrato.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. Finalidad y base jurídica</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-neutral-800 rounded-lg overflow-hidden">
              <thead className="bg-neutral-900/70 text-neutral-400">
                <tr>
                  <th className="text-left p-3 font-medium">Finalidad</th>
                  <th className="text-left p-3 font-medium">Base jurídica</th>
                  <th className="text-left p-3 font-medium">Plazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                <tr>
                  <td className="p-3">Responder consultas del formulario</td>
                  <td className="p-3">Consentimiento (art. 6.1.a RGPD)</td>
                  <td className="p-3">12 meses</td>
                </tr>
                <tr>
                  <td className="p-3">Prestación del servicio Radar BOE</td>
                  <td className="p-3">Contrato (art. 6.1.b RGPD)</td>
                  <td className="p-3">Vigencia + 5 años</td>
                </tr>
                <tr>
                  <td className="p-3">Facturación y obligaciones fiscales</td>
                  <td className="p-3">Obligación legal (art. 6.1.c RGPD)</td>
                  <td className="p-3">6 años (Código de Comercio)</td>
                </tr>
                <tr>
                  <td className="p-3">Seguridad y prevención de fraude</td>
                  <td className="p-3">Interés legítimo (art. 6.1.f RGPD)</td>
                  <td className="p-3">12 meses</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Destinatarios y encargados</h2>
          <p className="mb-3">No cedemos datos a terceros salvo obligación legal. Utilizamos los siguientes encargados de tratamiento con contrato conforme al art. 28 RGPD:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong className="text-foreground">Supabase Inc.</strong> — base de datos y autenticación (servidores en UE).</li>
            <li><strong className="text-foreground">Vercel Inc.</strong> — hosting del sitio web.</li>
            <li><strong className="text-foreground">Brevo (Sendinblue SAS)</strong> — envío transaccional y marketing (Francia, UE).</li>
            <li><strong className="text-foreground">hCaptcha (Intuition Machines, Inc.)</strong> — protección anti-bot (transferencia a EE. UU. bajo cláusulas contractuales tipo).</li>
          </ul>
          <p className="mt-3 text-sm text-neutral-400">
            Las transferencias internacionales fuera del EEE se amparan en cláusulas contractuales tipo aprobadas por la Comisión Europea.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">5. Derechos del interesado</h2>
          <p className="mb-3">Puedes ejercitar los siguientes derechos en cualquier momento:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li>Acceso, rectificación, supresión y oposición.</li>
            <li>Limitación del tratamiento.</li>
            <li>Portabilidad de los datos.</li>
            <li>Retirada del consentimiento sin efectos retroactivos.</li>
            <li>Presentar reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Agencia Española de Protección de Datos</a>.</li>
          </ul>
          <p className="mt-4 text-sm">
            Envía tu solicitud a <a href="mailto:contacto@mavieautomations.com" className="text-blue-400 hover:text-blue-300">contacto@mavieautomations.com</a> acompañada de copia de documento identificativo. Responderemos en un máximo de 30 días.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">6. Medidas de seguridad</h2>
          <p>
            Aplicamos medidas técnicas y organizativas adecuadas: cifrado TLS 1.3 en tránsito, cifrado en reposo en la base de datos, control de acceso basado en roles, registro de auditoría de operaciones admin, política de contraseñas robustas y separación entre entornos de desarrollo y producción.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies</h2>
          <p>
            Consulta el detalle completo en nuestra <Link href="/cookies" className="text-blue-400 hover:text-blue-300">Política de Cookies</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cambios en esta política</h2>
          <p>
            Podemos actualizar esta política para reflejar cambios legales o de servicio. Publicaremos la versión vigente con la fecha de actualización en el encabezado. Los cambios sustanciales se comunicarán por email a usuarios activos.
          </p>
        </section>
      </article>
    </div>
  )
}

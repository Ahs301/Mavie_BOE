import Link from "next/link"
import { Mail, Phone, ArrowRight, ExternalLink } from "lucide-react"
import { MavieLogo } from "@/components/MavieLogo"

const footerLinks = {
  soluciones: [
    { href: "/soluciones", label: "Ver todas las soluciones" },
    { href: "/soluciones/boe", label: "Radar BOE / DOUE" },
    { href: "/soluciones", label: "Outreach B2B AI" },
  ],
  empresa: [
    { href: "/servicios", label: "Servicios" },
    { href: "/sobre-nosotros", label: "Sobre Nosotros" },
    { href: "/contacto", label: "Contacto" },
  ],
  legal: [
    { href: "/privacidad", label: "Política de Privacidad" },
    { href: "/aviso-legal", label: "Aviso Legal" },
    { href: "/cookies", label: "Política de Cookies" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" aria-label="Mavie Automations">
              <MavieLogo size={28} showWordmark />
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              Ingeniería de datos y automatización B2B. Sistemas que detectan oportunidades y optimizan procesos 24/7.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:mavie.contact.dev@gmail.com"
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                mavie.contact.dev@gmail.com
              </a>
              <a
                href="tel:+34633448806"
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-foreground transition-colors"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                +34 633 448 806
              </a>
              <a
                href="https://www.linkedin.com/company/mavie-automations"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                LinkedIn
              </a>
            </div>
          </div>

          {/* Soluciones */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Soluciones</h4>
            <ul className="space-y-2.5">
              {footerLinks.soluciones.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-neutral-500 hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Empresa</h4>
            <ul className="space-y-2.5">
              {footerLinks.empresa.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-neutral-500 hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA + Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">¿Hablamos?</h4>
            <p className="text-sm text-neutral-500 mb-4">Diagnóstico gratuito en 30 min. Sin compromiso.</p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors group"
            >
              Solicitar reunión
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="mt-8">
              <h4 className="mb-3 text-sm font-semibold text-neutral-500">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-neutral-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Mavie Automations · Valencia, España
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 border border-emerald-900/40 bg-emerald-950/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Todos los sistemas operativos
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

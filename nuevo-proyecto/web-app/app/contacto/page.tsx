import type { Metadata } from "next"
import { SITE_URL } from "@/lib/seo"
import ContactForm from "./ContactForm"

export const metadata: Metadata = {
  title: "Contacto — Solicita tu diagnóstico gratuito | Mavie Automations",
  description: "Habla con un especialista en automatización B2B. Diagnóstico gratuito en 30 minutos. Te decimos exactamente qué podemos automatizar y qué resultado esperar para tu empresa.",
  keywords: [
    "contacto Mavie Automations", "diagnóstico automatización gratuito",
    "consultoría automatización B2B", "presupuesto radar BOE",
    "demo radar BOE", "automatización empresarial Valencia",
  ],
  alternates: {
    canonical: `${SITE_URL}/contacto`,
  },
  openGraph: {
    title: "Contacto — Diagnóstico gratuito en 30 min | Mavie Automations",
    description: "Habla con un especialista en automatización B2B. Sin compromiso. Analizamos tu caso y te decimos exactamente qué podemos hacer.",
    type: "website",
    url: `${SITE_URL}/contacto`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | Mavie Automations",
    description: "Diagnóstico gratuito de automatización B2B en 30 minutos.",
  },
}

export default function ContactPage() {
  return <ContactForm />
}

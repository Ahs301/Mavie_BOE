"use client"

import { useCallback, useState } from "react"
import { useTheme } from "next-themes"
import { Send, CheckCircle, Loader2 } from "lucide-react"
import { HCaptcha } from "@/components/HCaptcha"
import { HoneypotFields } from "@/components/HoneypotFields"
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/security/honeypot"

const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY)

type Status = "idle" | "submitting" | "success" | "error"

export default function ContactPage() {
  const { resolvedTheme } = useTheme()
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [captchaToken, setCaptchaToken] = useState("")
  const [consent, setConsent] = useState(false)

  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    service_interest: "boe",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onCaptchaVerify = useCallback((token: string) => setCaptchaToken(token), [])
  const onCaptchaExpire = useCallback(() => setCaptchaToken(""), [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")

    if (!consent) {
      setStatus("error")
      setErrorMsg("Debes aceptar la política de privacidad.")
      return
    }
    if (captchaEnabled && !captchaToken) {
      setStatus("error")
      setErrorMsg("Completa la verificación antispam.")
      return
    }

    const fd = new FormData(e.currentTarget)
    const honeypot = String(fd.get(HONEYPOT_FIELD) ?? "")
    const timestamp = String(fd.get(TIMESTAMP_FIELD) ?? "")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          captchaToken: captchaToken || null,
          [HONEYPOT_FIELD]: honeypot,
          [TIMESTAMP_FIELD]: timestamp,
          consent: true,
        }),
      })

      const payload = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error || "Error al enviar el formulario")
      }
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Hubo un problema al enviar tu solicitud.")
    }
  }

  const inputClass =
    "w-full bg-background border border-neutral-300 dark:border-neutral-800 rounded-lg h-12 px-4 text-foreground placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all text-sm"

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-foreground">Inicia tu transformación</h1>
        <p className="text-lg text-neutral-500 text-center mb-12">
          Déjanos tus datos y un especialista técnico analizará tu caso{" "}
          <strong className="text-foreground font-semibold">sin compromiso en menos de 24h.</strong>
        </p>

        {status === "success" ? (
          <div className="bg-card border border-neutral-200 dark:border-neutral-800 p-10 rounded-2xl text-center">
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-5" />
            <h3 className="text-2xl font-bold mb-3 text-foreground">¡Solicitud recibida!</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">
              Gracias por contactar con Mavie Automations. Un especialista técnico se pondrá en contacto contigo en menos de 24 horas.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl space-y-5 shadow-sm" noValidate>
            <HoneypotFields />

            {errorMsg && (
              <div role="alert" className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="company_name" className="text-sm font-medium text-foreground/80">Nombre de la Empresa *</label>
                <input id="company_name" required type="text" name="company_name" value={formData.company_name} onChange={handleChange} className={inputClass} placeholder="Ej: TechSoluciones Madrid" maxLength={150} autoComplete="organization" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact_name" className="text-sm font-medium text-foreground/80">Persona de Contacto *</label>
                <input id="contact_name" required type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} className={inputClass} placeholder="Ej: María García" maxLength={100} autoComplete="name" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Corporativo *</label>
                <input id="email" required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="nombre@tuempresa.com" maxLength={254} autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-foreground/80">Teléfono (Opcional)</label>
                <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+34 6XX XXX XXX" maxLength={30} autoComplete="tel" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="service_interest" className="text-sm font-medium text-foreground/80">Servicio de Interés *</label>
              <select id="service_interest" name="service_interest" value={formData.service_interest} onChange={handleChange} className={inputClass}>
                <option value="boe">Radar Estratégico BOE / DOUE</option>
                <option value="outreach">Captación B2B con IA (Outreach)</option>
                <option value="scraping">Scraping / Generación de Leads</option>
                <option value="automation">Automatización de Procesos a Medida</option>
                <option value="consulting">Consultoría Tecnológica</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="text-sm font-medium text-foreground/80">Cuéntanos sobre tu caso *</label>
              <textarea id="message" required rows={4} name="message" value={formData.message} onChange={handleChange} className={`${inputClass} h-auto py-3 resize-none`} placeholder="¿Qué proceso quieres automatizar? ¿Qué problema buscas resolver?" minLength={10} maxLength={2000} />
            </div>

            <label className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
              <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500" />
              <span>
                He leído y acepto la{" "}
                <a href="/privacidad" className="underline hover:text-blue-600 transition-colors">política de privacidad</a> y el tratamiento de mis datos para ser contactado.
              </span>
            </label>

            {captchaEnabled && (
              <HCaptcha onVerify={onCaptchaVerify} onExpire={onCaptchaExpire} theme={resolvedTheme === "light" ? "light" : "dark"} />
            )}

            <button type="submit" disabled={status === "submitting"} className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all disabled:opacity-70 shadow-sm">
              {status === "submitting" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando solicitud...</>
              ) : (
                <>Enviar Solicitud <Send className="h-4 w-4" /></>
              )}
            </button>

            <p className="text-xs text-neutral-500 text-center">Nunca compartiremos tus datos con terceros. Puedes ejercer tus derechos GDPR desde la página de privacidad.</p>
          </form>
        )}
      </div>
    </div>
  )
}

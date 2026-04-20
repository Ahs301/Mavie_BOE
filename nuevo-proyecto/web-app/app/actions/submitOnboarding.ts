"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, RATE_LIMITS } from "@/lib/security/rateLimit"
import { verifyCaptcha, captchaEnabled } from "@/lib/security/captcha"
import { checkHoneypot, HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/security/honeypot"
import { getClientIpFromHeaders } from "@/lib/security/getClientIp"

const onboardingSchema = z.object({
  companyName: z.string().min(2, "Nombre de empresa demasiado corto").max(100).trim(),
  phone: z.string().max(20).optional(),
  emails: z.string().email("Email inválido").max(500),
  keywords: z.string().min(1, "Debes incluir al menos una keyword").max(2000),
  antiKeywords: z.string().max(2000).optional(),
  captchaToken: z.string().optional(),
  honeypot: z.string().optional(),
  timestamp: z.string().optional(),
  consent: z.literal("on", { message: "Debes aceptar la política de privacidad" }),
})

export type OnboardingResult = { success: true } | { success: false; error: string }

export async function submitOnboarding(formData: FormData): Promise<OnboardingResult> {
  const ip = getClientIpFromHeaders()
  const limit = rateLimit({ key: `onboarding:${ip}`, ...RATE_LIMITS.onboarding })
  if (!limit.allowed) {
    return { success: false, error: "Demasiados intentos. Espera un momento." }
  }

  const raw = {
    companyName: formData.get("companyName"),
    phone: formData.get("phone"),
    emails: formData.get("emails"),
    keywords: formData.get("keywords"),
    antiKeywords: formData.get("antiKeywords"),
    captchaToken: formData.get("captchaToken"),
    honeypot: formData.get(HONEYPOT_FIELD),
    timestamp: formData.get(TIMESTAMP_FIELD),
    consent: formData.get("consent"),
  }

  const parsed = onboardingSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos"
    console.warn("[Onboarding] Validación fallida:", parsed.error.flatten())
    return { success: false, error: firstError }
  }

  const data = parsed.data

  const hp = checkHoneypot({ honeypot: data.honeypot ?? null, timestamp: data.timestamp ?? null })
  if (!hp.ok) {
    console.warn("[Onboarding] Honeypot rejected:", hp.reason, "ip=", ip)
    return { success: true }
  }

  if (captchaEnabled()) {
    const ok = await verifyCaptcha(data.captchaToken, ip !== "anonymous" ? ip : undefined)
    if (!ok) {
      return { success: false, error: "Verificación antispam fallida. Recarga la página." }
    }
  }

  const supabase = createClient()

  try {
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        company_name: data.companyName,
        phone: data.phone ?? null,
        primary_email: data.emails.split(",")[0]!.trim(),
        status: "listo_para_activar",
        lead_source: "Web Onboarding",
      })
      .select()
      .single()

    if (clientError) throw clientError

    const destination_emails = data.emails.split(",").map((e) => e.trim()).filter(Boolean)
    const keywords_positive = data.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    const keywords_negative = data.antiKeywords
      ? data.antiKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : []

    const { error: configError } = await supabase
      .from("client_boe_configs")
      .insert({
        client_id: client.id,
        is_active: false,
        frequency: "diario",
        destination_emails,
        keywords_positive,
        keywords_negative,
      })

    if (configError) throw configError

    revalidatePath("/dashboard/clientes")
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido"
    console.error("[Onboarding] Error en base de datos:", msg)
    return { success: false, error: "Error al guardar los datos. Inténtalo de nuevo." }
  }
}

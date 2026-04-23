"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"

export async function createOutreachCampaignAction(formData: FormData) {
  await requireAuth()
  console.log("[ACTION] createOutreachCampaignAction called")

  const name = formData.get("name")?.toString()
  const target_audience = formData.get("target_audience")?.toString()
  console.log("[ACTION] name:", name, "target:", target_audience)

  if (!name || !target_audience) {
    return { success: false, error: "Nombre y audiencia son obligatorios." }
  }

  const supabase = createClient()
  
  // 1. Guardar campaña en Supabase
  const { data: campaign, error } = await supabase
    .from("outreach_campaigns")
    .insert([{ name, target_audience, status: "init" }])
    .select()
    .single()

  if (error) {
    console.error("[DB] Error:", error.message)
    return { success: false, error: `Error DB: ${error.message}` }
  }

  console.log(`[DB] Campaña creado: ${campaign.id} - ${name}`)

  // 2. Disparar al VPS de forma segura
  const workerUrl = process.env.CAPTACION_WORKER_URL
  const cronSecret = process.env.CAPTACION_CRON_SECRET

  console.log(`[DEBUG] workerUrl: "${workerUrl}", cronSecret: "${cronSecret ? 'SET' : 'NOT SET'}"`)

  if (!workerUrl || !cronSecret) {
    console.error("[Worker] Variables no configuradas en Vercel")
    await supabase.from("outreach_campaigns").update({ status: "error" }).eq("id", campaign.id)
    return { success: false, error: "ERROR: Variables CAPTACION_WORKER_URL y/o CAPTACION_CRON_SECRET no configuradas en Vercel." }
  }

  // Extraer nicho y ubicación del target_audience
  const parts = target_audience.split(" ").slice(0, 2).join(" ")
  const niche = parts || name
  const location = target_audience.split(" ").pop()?.toLowerCase() || "españa"

  try {
    console.log(`[Worker] Disparando a ${workerUrl}/trigger/custom-campaign`)

    const res = await fetch(`${workerUrl}/trigger/custom-campaign`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ niche, location, limit: 50 }),
      signal: AbortSignal.timeout(60_000),
    })

    if (res.ok) {
      await supabase
        .from("outreach_campaigns")
        .update({ status: "scraping" })
        .eq("id", campaign.id)
      console.log(`[Worker] Campaña "${name}" iniciada - scraping en progreso`)
      return { success: true, message: `Campaña "${name}" iniciada en VPS (${workerUrl})` }
    } else {
      const errorText = await res.text()
      console.error("[Worker] Error:", errorText)
      await supabase.from("outreach_campaigns").update({ status: "error" }).eq("id", campaign.id)
      return { success: false, error: `VPS respondió: ${res.status} - ${errorText}` }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Error de conexión"
    console.error("[Worker] Error conectando:", errorMsg)
    await supabase.from("outreach_campaigns").update({ status: "error" }).eq("id", campaign.id)
    return { success: false, error: `ERROR CONEXIÓN: No se pudo conectar al VPS (${workerUrl}). cause: ${errorMsg}. Verifica que el worker está corriendo en el VPS.` }
  }
}

export async function updateCampaignStatusAction(campaignId: string, status: string) {
  await requireAuth()
  
  const supabase = createClient()
  const { error } = await supabase
    .from("outreach_campaigns")
    .update({ status })
    .eq("id", campaignId)

  if (error) return { success: false, error: "Error al actualizar la campaña." }

  revalidatePath("/dashboard/captacion")
  return { success: true }
}

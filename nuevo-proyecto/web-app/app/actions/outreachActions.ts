"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"

export async function createOutreachCampaignAction(formData: FormData) {
  await requireAuth()

  const name = formData.get("name")?.toString()
  const target_audience = formData.get("target_audience")?.toString()

  if (!name || !target_audience) {
    return { success: false, error: "Nombre y audiencia son obligatorios." }
  }

  const supabase = createClient()
  
  // 1. Guardar campaña en Supabase
  const { data: campaign, error } = await supabase
    .from("outreach_campaigns")
    .insert([{ name, target_audience, status: "pending" }])
    .select()
    .single()

  if (error) {
    console.error("[Create Campaign Error]:", error.message)
    return { success: false, error: "Error al crear la campaña en la base de datos." }
  }

  // 2. Disparar al VPS de forma segura
  const workerUrl = process.env.CAPTACION_WORKER_URL
  const cronSecret = process.env.CAPTACION_CRON_SECRET

  if (workerUrl && cronSecret) {
    // Extraer nicho y ubicación del target_audience
    // Formato esperado: "Despachos abogados Madrid" -> nicho="despachos abogados", location="madrid"
    const parts = target_audience.split(" ").slice(0, 2).join(" ")
    const niche = parts || name
    const location = target_audience.split(" ").pop()?.toLowerCase() || "españa"

    try {
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
        // Actualizar estado a scraping
        await supabase
          .from("outreach_campaigns")
          .update({ status: "scraping" })
          .eq("id", campaign.id)
      } else {
        console.error("[Worker] Error:", await res.text())
      }
    } catch (err) {
      console.error("[Worker] Error conectando al VPS:", err)
    }
  }

  revalidatePath("/dashboard/captacion")
  return { success: true }
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

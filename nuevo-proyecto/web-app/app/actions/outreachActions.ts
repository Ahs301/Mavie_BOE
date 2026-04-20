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
  
  const { error } = await supabase
    .from("outreach_campaigns")
    .insert([{ name, target_audience }])

  if (error) {
    console.error("[Create Campaign Error]:", error.message)
    return { success: false, error: "Error al crear la campaña en la base de datos." }
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

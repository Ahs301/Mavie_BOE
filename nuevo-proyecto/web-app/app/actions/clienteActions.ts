"use server"

import { requireClienteAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"

export async function getClienteData() {
  const { cliente } = await requireClienteAuth()
  const adminDb = createAdminClient()

  const { data: config } = await adminDb
    .from('client_boe_configs')
    .select('is_active, frequency, destination_emails, keywords_positive, keywords_negative, regions')
    .eq('client_id', cliente.id)
    .single()

  const { data: lastRun } = await adminDb
    .from('execution_logs')
    .select('started_at, status')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  return { cliente, config, lastRun }
}

const keywordsSchema = z.object({
  keywords_positive: z.array(z.string().min(1).max(100)).max(100),
  keywords_negative: z.array(z.string().min(1).max(100)).max(100),
})

export async function updateKeywords(rawPositive: string, rawNegative: string) {
  const { cliente } = await requireClienteAuth()

  const keywords_positive = rawPositive.split('\n').map(k => k.trim()).filter(Boolean)
  const keywords_negative = rawNegative.split('\n').map(k => k.trim()).filter(Boolean)

  const parsed = keywordsSchema.safeParse({ keywords_positive, keywords_negative })
  if (!parsed.success) return { error: "Formato de keywords inválido." }

  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('client_boe_configs')
    .update({ keywords_positive, keywords_negative })
    .eq('client_id', cliente.id)

  if (error) return { error: "Error al guardar. Inténtalo de nuevo." }
  return { success: true }
}

const emailsSchema = z.array(z.string().email()).min(1).max(20)

export async function updateDestinatarios(rawEmails: string) {
  const { cliente } = await requireClienteAuth()

  const emails = rawEmails.split('\n').map(e => e.trim()).filter(Boolean)
  const parsed = emailsSchema.safeParse(emails)
  if (!parsed.success) return { error: "Uno o más emails no son válidos." }

  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('client_boe_configs')
    .update({ destination_emails: emails })
    .eq('client_id', cliente.id)

  if (error) return { error: "Error al guardar. Inténtalo de nuevo." }
  return { success: true }
}

"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

// ─── Schemas de validación ───────────────────────────────────────────────────

const CreateClientSchema = z.object({
  company_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(120),
  primary_email: z.string().email("Email inválido"),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["lead", "onboarding_pendiente", "activo", "pausado", "perdido"]).default("lead"),
  notes: z.string().max(2000).optional(),
  lead_source: z.string().default("admin"),
})

const UpdateNoteSchema = z.object({
  clientId: z.string().uuid(),
  note: z.string().min(1).max(2000),
})

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function createClientAction(formData: FormData) {
  const user = await requireAuth() // 🔐 Solo admin autenticado y autorizado

  const raw = {
    company_name: formData.get("company_name"),
    primary_email: formData.get("primary_email"),
    contact_name: formData.get("contact_name") || undefined,
    phone: formData.get("phone") || undefined,
    status: formData.get("status") || "lead",
    notes: formData.get("notes") || undefined,
    lead_source: "admin_manual",
  }

  const parsed = CreateClientSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.errors.map(e => e.message).join(", ")
    return { success: false, error: msg }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("clients")
    .insert([parsed.data])
    .select("id")
    .single()

  if (error) {
    console.error("[createClientAction] Supabase error:", error.message)
    return { success: false, error: "Error al crear el cliente en la base de datos." }
  }

  revalidatePath("/dashboard/clientes")
  return { success: true, clientId: data.id }
}

export async function deleteClientAction(clientId: string) {
  await requireAuth() // 🔐

  if (!clientId || !/^[0-9a-f-]{36}$/i.test(clientId)) {
    return { success: false, error: "ID de cliente inválido." }
  }

  const supabase = createClient()
  const { error } = await supabase.from("clients").delete().eq("id", clientId)

  if (error) {
    console.error("[deleteClientAction] Supabase error:", error.message)
    return { success: false, error: "Error al eliminar el cliente." }
  }

  revalidatePath("/dashboard/clientes")
  return { success: true }
}

export async function toggleBoeConfigAction(configId: string, isActive: boolean) {
  await requireAuth() // 🔐
  const supabase = createClient()

  const { error } = await supabase
    .from("client_boe_configs")
    .update({ is_active: isActive })
    .eq("id", configId)

  if (error) {
    console.error("[CRM Action] Error toggling BOE:", error.message)
    return { success: false, error: "Hubo un error al actualizar el radar." }
  }

  revalidatePath(`/dashboard/clientes`)
  return { success: true }
}

export async function updateClientStatusAction(clientId: string, status: string) {
  await requireAuth() // 🔐
  const supabase = createClient()

  const VALID_STATUSES = ["lead", "onboarding_pendiente", "activo", "pausado", "perdido"]
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: "Estado inválido." }
  }

  const { error } = await supabase
    .from("clients")
    .update({ status })
    .eq("id", clientId)

  if (error) {
    console.error("[CRM Action] Error status:", error.message)
    return { success: false, error: "Error al cambiar estado." }
  }

  revalidatePath(`/dashboard/clientes`)
  revalidatePath(`/dashboard/clientes/${clientId}`)
  return { success: true }
}

export async function addClientNoteAction(clientId: string, note: string) {
  await requireAuth() // 🔐

  const parsed = UpdateNoteSchema.safeParse({ clientId, note })
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos." }
  }

  const supabase = createClient()
  const { data: client, error: fetchErr } = await supabase
    .from("clients")
    .select("notes")
    .eq("id", clientId)
    .single()

  if (fetchErr) return { success: false, error: "Error obteniendo notas." }

  const oldNotes = client.notes ? client.notes + "\n\n" : ""
  const dateStr = new Date().toLocaleString("es-ES")
  const newNotes = `${oldNotes}[${dateStr}] ${parsed.data.note}`

  const { error: updateErr } = await supabase
    .from("clients")
    .update({ notes: newNotes })
    .eq("id", clientId)

  if (updateErr) return { success: false, error: "Error guardando nota." }

  revalidatePath(`/dashboard/clientes/${clientId}`)
  return { success: true }
}

export async function convertLeadToClientAction(leadId: string) {
  await requireAuth() // 🔐
  
  const supabase = createClient()
  
  // 1. Obtener el lead
  const { data: lead, error: fetchErr } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single()
    
  if (fetchErr || !lead) {
    return { success: false, error: "No se encontró el lead." }
  }
  
  if (lead.converted_client_id) {
    return { success: false, error: "Este lead ya fue convertido a cliente." }
  }

  // 2. Crear el cliente en la tabla clients
  const { data: newClient, error: insertErr } = await supabase
    .from("clients")
    .insert([{
      company_name: lead.company_name || lead.contact_name || "Sin Nombre",
      primary_email: lead.email,
      contact_name: lead.contact_name,
      phone: lead.phone,
      status: "lead", // Entra al CRM en la fase más temprana
      lead_source: `Formulario Web (${lead.service_interest || 'General'})`,
      notes: lead.message ? `[Mensaje desde Formulario Web]\n${lead.message}` : null
    }])
    .select("id")
    .single()
    
  if (insertErr) {
    console.error("[Convert Lead] Insert Error:", insertErr.message)
    return { success: false, error: "Error creando el cliente en el CRM." }
  }
  
  // 3. Marcar el lead como convertido
  const { error: updateErr } = await supabase
    .from("leads")
    .update({ 
      converted_client_id: newClient.id,
      status: "qualified" 
    })
    .eq("id", leadId)
    
  if (updateErr) {
    console.error("[Convert Lead] Update Error:", updateErr.message)
    // No bloqueamos porque el cliente ya se creó
  }

  revalidatePath(`/dashboard/leads`)
  revalidatePath(`/dashboard/clientes`)
  
  return { success: true, newClientId: newClient.id }
}

export async function resolveIncidentAction(incidentId: string) {
  await requireAuth() // 🔐
  
  const supabase = createClient()
  
  const { error: updateErr } = await supabase
    .from("incidents")
    .update({ 
      status: "resolved" 
    })
    .eq("id", incidentId)
    
  if (updateErr) {
    console.error("[Resolve Incident] Update Error:", updateErr.message)
    return { success: false, error: "Error marcando incidencia como resuelta." }
  }

  revalidatePath(`/dashboard/incidencias`)
  revalidatePath(`/dashboard`)
  
  return { success: true }
}


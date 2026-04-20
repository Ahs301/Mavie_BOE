import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

function isAdminEmail(email: string): boolean {
  const adminEmailsEnv = process.env.ADMIN_EMAILS
  // Fail closed: if ADMIN_EMAILS is not set, deny access
  if (!adminEmailsEnv) return false
  const allowedEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase())
  return allowedEmails.includes(email.toLowerCase())
}

/**
 * Para Server Components y Server Actions.
 * Redirige si no hay sesión o no es admin.
 */
export async function requireAuth() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  if (!user.email || !isAdminEmail(user.email)) {
    redirect("/login?error=unauthorized")
  }

  return user
}

/**
 * Para Server Components y Server Actions del panel de cliente.
 * Solo requiere sesión válida — sin whitelist de admin.
 * Devuelve el user + el registro de clients (o redirige si no existe).
 */
export async function requireClienteAuth() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user?.email) {
    redirect("/acceso")
  }

  const adminDb = createAdminClient()
  const { data: cliente } = await adminDb
    .from('clients')
    .select('id, company_name, contact_name, primary_email, status, plan_activo, activation_date')
    .eq('primary_email', user.email)
    .single()

  if (!cliente) {
    redirect("/acceso?error=no_client")
  }

  return { user, cliente }
}

/**
 * Para API Route handlers (no pueden usar redirect()).
 * Devuelve null si autorizado, o NextResponse 401/403 si no.
 */
export async function requireAdminApi(): Promise<{ user: Awaited<ReturnType<typeof requireAuth>> } | NextResponse> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!user.email || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return { user }
}

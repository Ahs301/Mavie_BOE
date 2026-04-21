import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/stripe/portal
// Abre el Billing Portal de Stripe para el cliente autenticado.
// El customer_id se obtiene de la BD — nunca se acepta desde la URL.
export async function GET(_req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user?.email) {
    return NextResponse.redirect(`${baseUrl}/acceso?redirect=/panel`, 303)
  }

  const { data: client, error: dbError } = await supabase
    .from('clients')
    .select('stripe_customer_id')
    .eq('primary_email', user.email)
    .single()

  if (dbError || !client?.stripe_customer_id) {
    return NextResponse.redirect(`${baseUrl}/acceso?error=no_subscription`, 303)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' as any })

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: client.stripe_customer_id,
      return_url: `${baseUrl}/soluciones/boe`,
    })

    return NextResponse.redirect(portalSession.url, 303)
  } catch (err) {
    console.error('[stripe/portal] Error creando sesión:', err)
    return NextResponse.redirect(`${baseUrl}/contacto`, 303)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// GET /api/stripe/portal
// Abre el Billing Portal de Stripe para el cliente autenticado.
// El customer_id se obtiene de la BD — nunca se acepta desde la URL.
export async function GET(_req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey || (!stripeKey.startsWith('sk_live_') && !stripeKey.startsWith('sk_test_'))) {
    console.error('[stripe/portal] STRIPE_SECRET_KEY no configurada')
    return NextResponse.json({ error: 'Error de configuración del sistema de pago' }, { status: 500 })
  }

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: client, error: dbError } = await supabase
    .from('clients')
    .select('stripe_customer_id')
    .eq('primary_email', user.email)
    .single()

  if (dbError || !client?.stripe_customer_id) {
    return NextResponse.json({ error: 'No se encontró suscripción activa para este usuario' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' })

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

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) throw new Error('[webhook] STRIPE_SECRET_KEY no configurada')
  return new Stripe(key, { apiVersion: '2024-09-30.acacia' })
}

// Service role client — bypasses RLS, safe only in server-side webhook
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const PLAN_LIMITS: Record<string, { frequency: string; regions: string[] }> = {
  basico:   { frequency: 'diario',     regions: ['BOE'] },
  pro:      { frequency: 'instantaneo', regions: ['BOE', 'DOUE', 'autonómico'] },
  business: { frequency: 'instantaneo', regions: ['BOE', 'DOUE', 'autonómico'] },
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Sin firma Stripe' }, { status: 400 })
  }

  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error verificación'
    console.error('[webhook] Verificación fallida:', msg)
    return NextResponse.json({ error: `Webhook inválido: ${msg}` }, { status: 400 })
  }

  console.log(`[webhook] Evento recibido: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`[webhook] Evento no manejado: ${event.type}`)
    }
  } catch (err) {
    console.error(`[webhook] Error procesando ${event.type}:`, err)
    // Retornar 200 igualmente para que Stripe no reintente indefinidamente
    // El error ya está logueado
  }

  return NextResponse.json({ received: true })
}

// ─── checkout.session.completed ───────────────────────────
// Cliente nuevo ha pagado → crear/activar en BD
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient()

  const email = session.customer_details?.email
  const company = session.customer_details?.name ?? ''
  const plan = (session.metadata?.plan ?? 'basico') as keyof typeof PLAN_LIMITS
  const stripeCustomerId = session.customer as string
  const stripeSubscriptionId = session.subscription as string

  if (!email) {
    console.error('[webhook] checkout.session.completed sin email')
    return
  }

  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.basico

  // Upsert cliente — si ya existe por email lo activa, si no lo crea
  const { data: cliente, error: clienteError } = await supabase
    .from('clients')
    .upsert(
      {
        primary_email: email,
        company_name: company || email,
        status: 'activo',
        activation_date: new Date().toISOString(),
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        plan_activo: plan,
        lead_source: 'stripe_checkout',
      },
      { onConflict: 'primary_email', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  if (clienteError || !cliente) {
    console.error('[webhook] Error upsert cliente:', clienteError)
    return
  }

  // Upsert config BOE — activa y con valores por plan
  const { error: configError } = await supabase
    .from('client_boe_configs')
    .upsert(
      {
        client_id: cliente.id,
        is_active: true,
        frequency: limits.frequency,
        destination_emails: [email],
        regions: limits.regions,
        keywords_positive: [],
        keywords_negative: [],
      },
      { onConflict: 'client_id', ignoreDuplicates: false }
    )

  if (configError) {
    console.error('[webhook] Error upsert boe_config:', configError)
  }

  console.log(`[webhook] ✅ Cliente activado: ${email} — plan: ${plan}`)
}

// ─── customer.subscription.deleted ────────────────────────
// Suscripción cancelada → desactivar cliente y radar
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const supabase = createServiceClient()
  const stripeCustomerId = subscription.customer as string

  // Buscar cliente por stripe_customer_id
  const { data: cliente, error } = await supabase
    .from('clients')
    .select('id, primary_email')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()

  if (error || !cliente) {
    console.error('[webhook] Cancelación: cliente no encontrado para', stripeCustomerId)
    return
  }

  // Desactivar cliente
  await supabase
    .from('clients')
    .update({
      status: 'cancelado',
      plan_activo: null,
      stripe_subscription_id: null,
    })
    .eq('id', cliente.id)

  // Desactivar radar BOE
  await supabase
    .from('client_boe_configs')
    .update({ is_active: false })
    .eq('client_id', cliente.id)

  console.log(`[webhook] ❌ Suscripción cancelada: ${cliente.primary_email}`)
}

// ─── customer.subscription.updated ────────────────────────
// Cambio de plan (upgrade/downgrade)
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createServiceClient()
  const stripeCustomerId = subscription.customer as string

  // Solo procesar si está activa
  if (subscription.status !== 'active') return

  // Buscar qué plan es por el price ID
  const priceId = subscription.items.data[0]?.price?.id
  let plan = 'basico'
  if (priceId === process.env.STRIPE_PRICE_PRO) plan = 'pro'
  else if (priceId === process.env.STRIPE_PRICE_BUSINESS) plan = 'business'
  else if (priceId === process.env.STRIPE_PRICE_BASICO) plan = 'basico'

  const limits = PLAN_LIMITS[plan]

  const { data: cliente } = await supabase
    .from('clients')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()

  if (!cliente) return

  await supabase
    .from('clients')
    .update({ plan_activo: plan, status: 'activo' })
    .eq('id', cliente.id)

  await supabase
    .from('client_boe_configs')
    .update({
      frequency: limits.frequency,
      regions: limits.regions,
    })
    .eq('client_id', cliente.id)

  console.log(`[webhook] 🔄 Plan actualizado: ${plan} para customer ${stripeCustomerId}`)
}

// ─── invoice.payment_failed ───────────────────────────────
// Fallo de cobro → marcar como moroso pero no desactivar aún (Stripe reintenta)
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = createServiceClient()
  const stripeCustomerId = invoice.customer as string

  const { data: cliente } = await supabase
    .from('clients')
    .select('id, primary_email')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()

  if (!cliente) {
    console.error('[webhook] Fallo pago: cliente no encontrado para', stripeCustomerId)
    return
  }

  // Marcar como moroso — Stripe reintentará, si falla 3 veces cancela y llega subscription.deleted
  await supabase
    .from('clients')
    .update({ status: 'pago_fallido' })
    .eq('id', cliente.id)

  console.log(`[webhook] ⚠️ Pago fallido: ${cliente.primary_email}`)
}

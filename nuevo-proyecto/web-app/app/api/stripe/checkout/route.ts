import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const PLAN_KEYS: Record<string, string> = {
  basico: 'STRIPE_PRICE_BASICO',
  pro: 'STRIPE_PRICE_PRO',
  business: 'STRIPE_PRICE_BUSINESS',
}

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get('plan')

  if (!plan || !(plan in PLAN_KEYS)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey || (!stripeKey.startsWith('sk_live_') && !stripeKey.startsWith('sk_test_'))) {
    console.error('[stripe/checkout] STRIPE_SECRET_KEY no configurada o formato inválido')
    return NextResponse.json({ error: 'Error de configuración del sistema de pago' }, { status: 500 })
  }

  const priceId = process.env[PLAN_KEYS[plan]]?.trim()
  if (!priceId || priceId.startsWith('price_RELLENAR')) {
    console.error(`[stripe/checkout] ${PLAN_KEYS[plan]} no configurado`)
    return NextResponse.json({ error: 'Plan no configurado en el sistema' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const stripe = new Stripe(stripeKey, { apiVersion: '2026-03-25.dahlia' as const })

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan },
      success_url: `${baseUrl}/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/soluciones/boe#precios`,
      locale: 'es',
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      subscription_data: { metadata: { plan } },
    })

    if (!session.url) {
      console.error('[stripe/checkout] Sesión creada sin URL')
      return NextResponse.json({ error: 'Error creando sesión de pago' }, { status: 500 })
    }

    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const errType = (err as { type?: string })?.type ?? 'unknown'
    console.error(`[stripe/checkout] Error tipo=${errType}:`, msg)

    if (errType === 'StripeAuthenticationError') {
      console.error('[stripe/checkout] STRIPE_SECRET_KEY revocada — actualizar .env.local y Vercel env vars')
    }

    return NextResponse.json(
      { error: 'Error al crear la sesión de pago. Inténtalo de nuevo o contacta con soporte.', detail: msg },
      { status: 500 }
    )
  }
}

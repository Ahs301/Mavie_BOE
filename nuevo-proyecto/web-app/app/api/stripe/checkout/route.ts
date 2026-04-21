import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const PRICE_IDS: Record<string, string | undefined> = {
  basico: process.env.STRIPE_PRICE_BASICO,
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
}

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get('plan')

  if (!plan || !PRICE_IDS[plan]) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const priceId = PRICE_IDS[plan]
  if (!priceId || priceId.startsWith('price_RELLENAR')) {
    return NextResponse.json({ error: 'Plan no configurado en el sistema' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' as any })

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
      subscription_data: {
        metadata: { plan },
      },
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Error creando sesión de pago' }, { status: 500 })
    }

    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    console.error('[stripe/checkout] Error:', err)
    return NextResponse.json(
      { error: 'Error interno al crear la sesión de pago. Inténtalo de nuevo o contacta con soporte.' },
      { status: 500 }
    )
  }
}

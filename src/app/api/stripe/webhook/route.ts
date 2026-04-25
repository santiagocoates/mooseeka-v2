import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Necesitamos el raw body para verificar la firma de Stripe
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Sin firma' }, { status: 400 })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] firma inválida:', err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { productId, buyerId } = session.metadata ?? {}

    if (!productId || !buyerId) {
      console.error('[webhook] metadata incompleta:', session.metadata)
      return NextResponse.json({ error: 'Metadata incompleta' }, { status: 400 })
    }

    // Usamos service role para bypassear RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { error } = await supabase.from('purchases').upsert({
      product_id:        productId,
      buyer_id:          buyerId,
      stripe_session_id: session.id,
      amount_paid_usd:   session.amount_total ? session.amount_total / 100 : null,
      status:            'completed',
    }, { onConflict: 'stripe_session_id' })

    if (error) {
      console.error('[webhook] error insertando compra:', error)
      return NextResponse.json({ error: 'Error guardando compra' }, { status: 500 })
    }

    console.log(`[webhook] compra registrada: product=${productId} buyer=${buyerId}`)
  }

  return NextResponse.json({ received: true })
}

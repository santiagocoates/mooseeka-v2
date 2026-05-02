import { NextRequest, NextResponse } from 'next/server'
import MercadoPago, { Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[mp-webhook] notification:', JSON.stringify(body))

    // MP envía notificaciones de tipo "payment"
    const paymentId = body.data?.id
    if (!paymentId || body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const client = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: paymentId })

    console.log('[mp-webhook] payment status:', payment.status, 'id:', paymentId)

    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true })
    }

    const productId = payment.metadata?.product_id
    const buyerId   = payment.metadata?.buyer_id

    if (!productId || !buyerId) {
      console.error('[mp-webhook] metadata incompleta:', payment.metadata)
      return NextResponse.json({ error: 'Metadata incompleta' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { error } = await supabase.from('purchases').upsert({
      product_id:        productId,
      buyer_id:          buyerId,
      stripe_session_id: `mp_${paymentId}`,
      amount_paid_usd:   payment.transaction_amount ?? null,
      status:            'completed',
    }, { onConflict: 'stripe_session_id' })

    if (error) {
      console.error('[mp-webhook] error insertando compra:', error)
      return NextResponse.json({ error: 'Error guardando compra' }, { status: 500 })
    }

    console.log(`[mp-webhook] compra registrada: product=${productId} buyer=${buyerId}`)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[mp-webhook] error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json()
    if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Verificar que el producto existe y está publicado
    const { data: product, error } = await supabase
      .from('products')
      .select('id, slug, title, price_usd, cover_url, published')
      .eq('id', productId)
      .eq('published', true)
      .single()

    if (error || !product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    // Verificar que no lo haya comprado ya
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('product_id', productId)
      .eq('buyer_id', user.id)
      .eq('status', 'completed')
      .maybeSingle()

    if (existing) return NextResponse.json({ error: 'Ya compraste este producto' }, { status: 400 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(Number(product.price_usd) * 100),
            product_data: {
              name: product.title,
              ...(product.cover_url ? { images: [product.cover_url] } : {}),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId: product.id,
        buyerId: user.id,
      },
      success_url: `${baseUrl}/products/${product.slug || product.id}?success=true`,
      cancel_url: `${baseUrl}/products/${product.slug || product.id}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

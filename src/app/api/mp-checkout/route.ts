import { NextRequest, NextResponse } from 'next/server'
import MercadoPago, { Preference } from 'mercadopago'
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

    const client = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: [
          {
            id: product.id,
            title: product.title,
            quantity: 1,
            unit_price: Number(product.price_usd),
            currency_id: 'USD',
          },
        ],
        metadata: {
          product_id: product.id,
          buyer_id: user.id,
        },
        back_urls: {
          success: `${baseUrl}/products/${product.slug || product.id}?success=true`,
          failure: `${baseUrl}/products/${product.slug || product.id}`,
          pending: `${baseUrl}/products/${product.slug || product.id}`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/mp-webhook`,
      },
    })

    return NextResponse.json({ url: result.init_point })
  } catch (err) {
    console.error('[mp-checkout] error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

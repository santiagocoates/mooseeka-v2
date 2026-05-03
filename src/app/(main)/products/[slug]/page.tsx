'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { ShoppingCart, Play, Lock, CheckCircle, ChevronLeft, Loader2, BookOpen, Music, Package } from 'lucide-react'

interface Product {
  id: string
  slug: string | null
  title: string
  description: string | null
  price_usd: number
  cover_url: string | null
  type: string
  seller_id: string
  profile: {
    name: string
    username: string
    avatar_url: string | null
  }
}

interface ProductItem {
  id: string
  title: string
  type: string
  is_preview: boolean
  order_index: number
  duration_seconds: number | null
  url: string
}

const TYPE_LABELS: Record<string, string> = {
  course:       'Curso',
  beat:         'Beat',
  sample_pack:  'Sample Pack',
  preset_pack:  'Preset Pack',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  course:       <BookOpen size={16} />,
  beat:         <Music size={16} />,
  sample_pack:  <Package size={16} />,
  preset_pack:  <Package size={16} />,
}

function formatDuration(secs: number | null) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function ProductPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const currentUser  = useCurrentUser()
  const slug         = params.slug as string

  const [product,   setProduct]   = useState<Product | null>(null)
  const [items,     setItems]     = useState<ProductItem[]>([])
  const [purchased, setPurchased] = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [buying,    setBuying]    = useState(false)
  const [success,   setSuccess]   = useState(searchParams.get('success') === 'true')
  const autoBuyFired              = useRef(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Soportar tanto slug legible como UUID (links viejos)
      const isUUID = UUID_RE.test(slug)
      const query  = supabase
        .from('products')
        .select('*, profile:profiles!products_seller_id_fkey(name, username, avatar_url)')
        .eq('published', true)

      const { data: prod } = await (isUUID ? query.eq('id', slug) : query.eq('slug', slug)).single()

      if (!prod) { setLoading(false); return }
      setProduct(prod as Product)

      const { data: its } = await supabase
        .from('product_items')
        .select('*')
        .eq('product_id', prod.id)
        .order('order_index')

      setItems((its ?? []) as ProductItem[])

      // Verificar compra si hay usuario logueado
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        const { data: purchase } = await supabase
          .from('purchases')
          .select('id')
          .eq('product_id', prod.id)
          .eq('buyer_id', session.user.id)
          .eq('status', 'completed')
          .maybeSingle()
        if (purchase) setPurchased(true)
      }

      setLoading(false)
    }
    load()
  }, [slug, currentUser?.id])

  // Si viene de success y no se registró aún, refetch cada 2s hasta que aparezca
  useEffect(() => {
    if (!success || purchased || !product) return
    const interval = setInterval(async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) return
      const { data } = await supabase
        .from('purchases')
        .select('id')
        .eq('product_id', product.id)
        .eq('buyer_id', session.user.id)
        .eq('status', 'completed')
        .maybeSingle()
      if (data) { setPurchased(true); clearInterval(interval) }
    }, 2000)
    return () => clearInterval(interval)
  }, [success, purchased, product])

  // Auto-trigger checkout si viene de login con ?buy=1
  useEffect(() => {
    if (
      searchParams.get('buy') === '1' &&
      !loading && currentUser && !purchased && !buying && !autoBuyFired.current
    ) {
      autoBuyFired.current = true
      handleBuy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, currentUser, purchased])

  async function handleBuy() {
    if (!currentUser) {
      router.push(`/login?next=${encodeURIComponent(`/products/${slug}?buy=1`)}`)
      return
    }
    setBuying(true)
    try {
      const res  = await fetch('/api/mp-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product?.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Error al procesar el pago')
    } catch {
      alert('Error de conexión')
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin" style={{ color: '#8B3FFF' }} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-white text-lg font-bold mb-2">Producto no encontrado</p>
        <Link href="/market" className="text-sm" style={{ color: '#8B3FFF' }}>← Volver al market</Link>
      </div>
    )
  }

  const previewItem = items.find(i => i.is_preview)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back */}
      <Link href="/market" className="inline-flex items-center gap-1.5 text-sm mb-5 transition-opacity hover:opacity-70"
        style={{ color: '#C0A8D8' }}>
        <ChevronLeft size={16} /> Volver al market
      </Link>

      {/* Success banner */}
      {success && purchased && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-5"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)' }}>
          <CheckCircle size={20} style={{ color: '#10b981' }} />
          <div>
            <p className="text-white font-bold text-sm">¡Compra exitosa!</p>
            <p className="text-xs" style={{ color: '#C0A8D8' }}>Ya tienes acceso completo al contenido.</p>
          </div>
        </div>
      )}

      {/* Cover + info */}
      <div className="rounded-2xl overflow-hidden mb-6"
        style={{ background: 'rgba(25,0,50,0.7)', border: '1px solid rgba(123,47,255,0.2)' }}>
        {product.cover_url ? (
          <img src={product.cover_url} alt={product.title}
            className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(139,63,255,0.3), rgba(255,26,140,0.3))' }}>
            <span className="text-6xl">🎵</span>
          </div>
        )}

        <div className="p-6">
          {/* Type badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'rgba(139,63,255,0.15)', border: '1px solid rgba(139,63,255,0.4)', color: '#C0A8D8' }}>
            {TYPE_ICONS[product.type]}
            {TYPE_LABELS[product.type] ?? product.type}
          </div>

          <h1 className="text-2xl font-black text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
            {product.title}
          </h1>

          {product.description && (
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#C0A8D8' }}>
              {product.description}
            </p>
          )}

          {/* Seller */}
          <Link href={`/${product.profile.username}`}
            className="inline-flex items-center gap-2 mb-5 hover:opacity-80 transition-opacity">
            {product.profile.avatar_url ? (
              <img src={product.profile.avatar_url} alt={product.profile.name}
                className="w-7 h-7 rounded-full object-cover"
                style={{ border: '1px solid rgba(123,47,255,0.4)' }} />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                {product.profile.name[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium" style={{ color: '#C0A8D8' }}>
              {product.profile.name}
            </span>
          </Link>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-white">
              ${Number(product.price_usd).toLocaleString('es-AR')}
              <span className="text-base font-medium ml-1" style={{ color: '#7A6890' }}>ARS</span>
            </p>

            {purchased ? (
              <Link href={`/products/${product?.slug || product?.id}/watch`}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 gradient-magenta glow-btn">
                <Play size={16} fill="white" />
                Ver {product.type === 'course' ? 'curso' : 'contenido'}
              </Link>
            ) : (
              <button onClick={handleBuy} disabled={buying}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 gradient-magenta glow-btn">
                {buying
                  ? <Loader2 size={16} className="animate-spin" />
                  : <ShoppingCart size={16} />
                }
                {buying ? 'Procesando...' : `Comprar $${Number(product.price_usd).toLocaleString('es-AR')}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview video */}
      {previewItem && previewItem.type === 'video' && !purchased && (
        <div className="rounded-2xl overflow-hidden mb-6"
          style={{ background: 'rgba(25,0,50,0.7)', border: '1px solid rgba(123,47,255,0.2)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'rgba(123,47,255,0.15)' }}>
            <p className="text-white font-bold text-sm">👀 Vista previa gratuita</p>
          </div>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={previewItem.url.replace('watch?v=', 'embed/')}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}

      {/* Contenido del producto */}
      {items.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(25,0,50,0.7)', border: '1px solid rgba(123,47,255,0.2)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'rgba(123,47,255,0.15)' }}>
            <p className="text-white font-bold">
              Contenido · {items.length} {product.type === 'course' ? 'clases' : 'archivos'}
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(123,47,255,0.1)' }}>
            {items.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-xs font-mono w-5 shrink-0" style={{ color: '#7A6890' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.duration_seconds && (
                    <span className="text-xs" style={{ color: '#7A6890' }}>
                      {formatDuration(item.duration_seconds)}
                    </span>
                  )}
                  {item.is_preview
                    ? <Play size={14} style={{ color: '#10b981' }} />
                    : <Lock size={14} style={{ color: '#7A6890' }} />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

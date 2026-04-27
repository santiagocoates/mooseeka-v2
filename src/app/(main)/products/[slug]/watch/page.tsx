'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Loader2, Play, Lock } from 'lucide-react'

interface ProductItem {
  id: string
  title: string
  type: string
  url: string
  order_index: number
  is_preview: boolean
  duration_seconds: number | null
}

interface Product {
  id: string
  slug: string | null
  title: string
  type: string
}

function formatDuration(secs: number | null) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function getEmbedUrl(url: string): string {
  // YouTube
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&autoplay=1`
  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`
  // Si ya es embed, devolver directo
  return url
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function WatchPage() {
  const params  = useParams()
  const router  = useRouter()
  const slug    = params.slug as string

  const [product,  setProduct]  = useState<Product | null>(null)
  const [items,    setItems]    = useState<ProductItem[]>([])
  const [current,  setCurrent]  = useState<ProductItem | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [denied,   setDenied]   = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user?.id) { router.replace(`/products/${slug}`); return }

      // Resolver producto por slug o UUID
      const isUUID = UUID_RE.test(slug)
      const q = supabase.from('products').select('id, title, type, slug')
      const { data: prod } = await (isUUID ? q.eq('id', slug) : q.eq('slug', slug)).single()

      if (!prod) { router.replace(`/products/${slug}`); return }

      // Verificar compra
      const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('product_id', prod.id)
        .eq('buyer_id', session.user.id)
        .eq('status', 'completed')
        .maybeSingle()

      if (!purchase) { setDenied(true); setLoading(false); return }

      const { data: its } = await supabase
        .from('product_items').select('*').eq('product_id', prod.id).order('order_index')

      setProduct(prod as Product)
      const itemsList = (its ?? []) as ProductItem[]
      setItems(itemsList)
      if (itemsList.length > 0) setCurrent(itemsList[0])
      setLoading(false)
    }
    load()
  }, [slug, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin" style={{ color: '#8B3FFF' }} />
      </div>
    )
  }

  if (denied) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <p className="text-white font-bold text-lg mb-2">Acceso restringido</p>
        <p className="text-sm mb-6" style={{ color: '#C0A8D8' }}>
          Necesitás comprar este producto para ver el contenido.
        </p>
        <Link href={`/products/${product?.slug || slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold gradient-magenta glow-btn hover:opacity-90 transition-all">
          Ver producto
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-screen">
      {/* Sidebar de contenido */}
      <aside className="lg:w-72 shrink-0 order-2 lg:order-1"
        style={{ background: 'rgba(14,0,32,0.95)', borderRight: '1px solid rgba(123,47,255,0.15)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(123,47,255,0.15)' }}>
          <Link href={`/products/${product?.slug || slug}`}
            className="inline-flex items-center gap-1.5 text-xs mb-3 transition-opacity hover:opacity-70"
            style={{ color: '#C0A8D8' }}>
            <ChevronLeft size={14} /> Volver
          </Link>
          {product && (
            <p className="text-white font-bold text-sm leading-tight">{product.title}</p>
          )}
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {items.map((item, idx) => {
            const isActive = current?.id === item.id
            return (
              <button key={item.id} onClick={() => setCurrent(item)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-b"
                style={{
                  borderColor: 'rgba(123,47,255,0.1)',
                  background: isActive ? 'rgba(139,63,255,0.15)' : 'transparent',
                }}>
                <span className="text-xs font-mono mt-0.5 shrink-0 w-5" style={{ color: isActive ? '#8B3FFF' : '#7A6890' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight"
                    style={{ color: isActive ? '#fff' : '#C0A8D8' }}>
                    {item.title}
                  </p>
                  {item.duration_seconds && (
                    <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>
                      {formatDuration(item.duration_seconds)}
                    </p>
                  )}
                </div>
                {isActive
                  ? <Play size={14} fill="#FF1A8C" style={{ color: '#FF1A8C' }} className="shrink-0 mt-0.5" />
                  : <Lock size={12} style={{ color: '#7A6890' }} className="shrink-0 mt-1" />
                }
              </button>
            )
          })}
        </div>
      </aside>

      {/* Player */}
      <main className="flex-1 order-1 lg:order-2 flex flex-col">
        {current ? (
          <>
            {current.type === 'video' ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%', background: '#000' }}>
                <iframe
                  key={current.id}
                  src={getEmbedUrl(current.url)}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64"
                style={{ background: 'rgba(25,0,50,0.8)' }}>
                <div className="text-center">
                  <p className="text-white font-bold mb-3">{current.title}</p>
                  <a href={current.url} download
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-sm gradient-magenta hover:opacity-90 transition-all">
                    Descargar archivo
                  </a>
                </div>
              </div>
            )}

            <div className="p-6">
              <p className="text-white font-bold text-lg mb-1">{current.title}</p>
              {current.duration_seconds && (
                <p className="text-sm" style={{ color: '#7A6890' }}>
                  {formatDuration(current.duration_seconds)}
                </p>
              )}

              {/* Navegación */}
              <div className="flex gap-3 mt-5">
                {items.findIndex(i => i.id === current.id) > 0 && (
                  <button
                    onClick={() => setCurrent(items[items.findIndex(i => i.id === current.id) - 1])}
                    className="px-5 py-2.5 rounded-full text-sm font-bold transition-all"
                    style={{ background: 'rgba(123,47,255,0.2)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.3)' }}>
                    ← Anterior
                  </button>
                )}
                {items.findIndex(i => i.id === current.id) < items.length - 1 && (
                  <button
                    onClick={() => setCurrent(items[items.findIndex(i => i.id === current.id) + 1])}
                    className="px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all hover:opacity-90 gradient-magenta">
                    Siguiente →
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 min-h-64">
            <p style={{ color: '#7A6890' }}>Seleccioná una clase para comenzar</p>
          </div>
        )}
      </main>
    </div>
  )
}

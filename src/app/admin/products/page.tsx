'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Eye, EyeOff, BookOpen, Music, Package, Loader2, Pencil } from 'lucide-react'

interface Product {
  id: string
  title: string
  type: string
  price_usd: number
  published: boolean
  cover_url: string | null
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  course:       'Curso',
  beat:         'Beat',
  sample_pack:  'Sample Pack',
  preset_pack:  'Preset Pack',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  course:       <BookOpen size={14} />,
  beat:         <Music size={14} />,
  sample_pack:  <Package size={14} />,
  preset_pack:  <Package size={14} />,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('products')
        .select('id, title, type, price_usd, published, cover_url, created_at')
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false })

      setProducts((data ?? []) as Product[])
      setLoading(false)
    }
    load()
  }, [])

  async function togglePublished(product: Product) {
    setToggling(product.id)
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ published: !product.published })
      .eq('id', product.id)

    if (!error) {
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, published: !p.published } : p
      ))
    }
    setToggling(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Productos digitales</h1>
          <p className="text-sm mt-1" style={{ color: '#7A6890' }}>Gestioná tus cursos, beats y sample packs</p>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-sm gradient-magenta glow-btn hover:opacity-90 transition-all">
          <Plus size={16} />
          Nuevo producto
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: '#8B3FFF' }} />
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="rounded-2xl p-14 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(123,47,255,0.2)' }}>
          <p className="text-3xl mb-3">📦</p>
          <p className="text-white font-bold mb-1">No tienes productos todavía</p>
          <p className="text-sm mb-5" style={{ color: '#7A6890' }}>
            Crea tu primer curso, beat o sample pack.
          </p>
          <Link href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-sm gradient-magenta hover:opacity-90 transition-all">
            <Plus size={15} /> Crear producto
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="flex flex-col gap-3">
          {products.map(product => (
            <div key={product.id}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(123,47,255,0.15)' }}>
              {/* Cover */}
              <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden"
                style={{ background: 'linear-gradient(135deg,rgba(139,63,255,0.3),rgba(255,26,140,0.3))' }}>
                {product.cover_url
                  ? <img src={product.cover_url} alt={product.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">🎵</div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: 'rgba(123,47,255,0.15)', color: '#C0A8D8' }}>
                    {TYPE_ICONS[product.type]}
                    {TYPE_LABELS[product.type] ?? product.type}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    product.published
                      ? 'text-emerald-400'
                      : 'text-[#7A6890]'
                  }`} style={{ background: product.published ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)' }}>
                    {product.published ? '● Publicado' : '○ Borrador'}
                  </span>
                </div>
                <p className="text-white font-bold truncate">{product.title}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: '#8B3FFF' }}>
                  ${Number(product.price_usd).toFixed(2)} USD
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/products/${product.id}`}
                  className="p-2 rounded-xl transition-all hover:bg-white/5"
                  style={{ color: '#7A6890' }} title="Ver página">
                  <Eye size={16} />
                </Link>
                <Link href={`/admin/products/${product.id}/edit`}
                  className="p-2 rounded-xl transition-all hover:bg-white/5"
                  style={{ color: '#7A6890' }} title="Editar">
                  <Pencil size={16} />
                </Link>
                <button onClick={() => togglePublished(product)} disabled={toggling === product.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={product.published
                    ? { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
                    : { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
                  }>
                  {toggling === product.id
                    ? <Loader2 size={13} className="animate-spin" />
                    : product.published ? <EyeOff size={13} /> : <Eye size={13} />
                  }
                  {product.published ? 'Despublicar' : 'Publicar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

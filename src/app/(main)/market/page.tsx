'use client'

import { useState, useEffect } from 'react'
import { Search, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Music, Package, Loader2 } from 'lucide-react'

interface Product {
  id: string
  slug: string | null
  title: string
  type: string
  price_usd: number
  cover_url: string | null
  profile: {
    name: string
    username: string
    avatar_url: string | null
  }
}

const TYPE_FILTERS = [
  { id: 'all',          label: 'Todos'        },
  { id: 'course',       label: 'Cursos'       },
  { id: 'beat',         label: 'Beats'        },
  { id: 'sample_pack',  label: 'Sample Packs' },
  { id: 'preset_pack',  label: 'Presets'      },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  course:       <BookOpen size={13} />,
  beat:         <Music size={13} />,
  sample_pack:  <Package size={13} />,
  preset_pack:  <Package size={13} />,
}

const TYPE_LABELS: Record<string, string> = {
  course:       'Curso',
  beat:         'Beat',
  sample_pack:  'Sample Pack',
  preset_pack:  'Preset Pack',
}

export default function MarketPage() {
  const [products,         setProducts]         = useState<Product[]>([])
  const [loading,          setLoading]          = useState(true)
  const [search,           setSearch]           = useState('')
  const [activeType,       setActiveType]       = useState('all')
  const [isSeller,         setIsSeller]         = useState(false)
  const [sellerRequested,  setSellerRequested]  = useState(false)
  const [requesting,       setRequesting]       = useState(false)
  const [requestDone,      setRequestDone]      = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [{ data }, { data: { user } }] = await Promise.all([
        supabase
          .from('products')
          .select(`id, slug, title, type, price_usd, cover_url,
            profile:profiles!products_seller_id_fkey(name, username, avatar_url)`)
          .eq('published', true)
          .order('created_at', { ascending: false }),
        supabase.auth.getUser(),
      ])

      setProducts((data ?? []) as unknown as Product[])

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_seller, seller_requested')
          .eq('id', user.id)
          .single()
        setIsSeller(profile?.is_seller ?? false)
        setSellerRequested(profile?.seller_requested ?? false)
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleSellerRequest() {
    setRequesting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setRequesting(false); return }
    await supabase.from('profiles').update({ seller_requested: true }).eq('id', user.id)
    setSellerRequested(true)
    setRequestDone(true)
    setRequesting(false)
  }

  const filtered = products.filter(p => {
    const matchType   = activeType === 'all' || p.type === activeType
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.profile.name.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-black" style={{ letterSpacing: '-0.02em' }}>Market</h1>
          <p className="text-sm mt-0.5" style={{ color: '#7A6890' }}>
            Cursos, beats y productos digitales de la industria musical
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSeller && (
            <Link href="/services/new"
              className="text-sm font-bold px-4 py-2 rounded-full transition-all gradient-magenta text-white hover:opacity-90">
              + Publicar servicio
            </Link>
          )}
          <Link href="/purchases"
            className="text-sm font-semibold px-4 py-2 rounded-full transition-all"
            style={{ background: 'rgba(123,47,255,0.15)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.3)' }}>
            Mis compras
          </Link>
        </div>
      </div>

      {/* Banner seller — solo para no-sellers */}
      {!loading && !isSeller && (
        <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
          style={{ background: 'rgba(139,63,255,0.08)', border: '1px solid rgba(139,63,255,0.25)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(139,63,255,0.2)' }}>
            <Sparkles size={20} style={{ color: '#A855F7' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">¿Quieres vender en Mooseeka?</p>
            <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>
              Publica tus servicios y llega a miles de profesionales de la industria musical.
            </p>
          </div>
          {sellerRequested ? (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full shrink-0"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
              <span className="text-xs font-bold" style={{ color: '#22c55e' }}>
                {requestDone ? '¡Solicitud enviada!' : 'Solicitud pendiente'}
              </span>
            </div>
          ) : (
            <button
              onClick={handleSellerRequest}
              disabled={requesting}
              className="text-sm font-bold px-4 py-2 rounded-full shrink-0 transition-all disabled:opacity-60 gradient-magenta text-white hover:opacity-90">
              {requesting ? 'Enviando...' : 'Quiero publicar'}
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#7A6890' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cursos, beats, sample packs..."
          className="w-full text-white placeholder-[#7A6890] pl-11 pr-4 py-3 rounded-xl focus:outline-none text-sm"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.55)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')}
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
        {TYPE_FILTERS.map(f => (
          <button key={f.id} onClick={() => setActiveType(f.id)}
            className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0"
            style={activeType === f.id
              ? { background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)', color: '#fff' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.22)', color: '#C0A8D8' }
            }>
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: '#8B3FFF' }} />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl p-14 text-center"
          style={{ background: 'rgba(25,0,50,0.4)', border: '1px dashed rgba(123,47,255,0.25)' }}>
          <p className="text-3xl mb-3">🎵</p>
          <p className="text-white font-bold mb-1">
            {products.length === 0 ? 'El market está vacío por ahora' : 'No hay resultados'}
          </p>
          <p className="text-sm" style={{ color: '#7A6890' }}>
            {products.length === 0
              ? 'Próximamente habrá cursos, beats y más.'
              : 'Prueba con otra búsqueda o categoría.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <Link key={product.id} href={`/products/${product.slug || product.id}`}
              className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg group"
              style={{ background: 'rgba(25,0,50,0.7)', border: '1px solid rgba(123,47,255,0.2)' }}>

              {/* Cover */}
              <div className="relative w-full aspect-video overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(139,63,255,0.25), rgba(255,26,140,0.25))' }}>
                {product.cover_url
                  ? <img src={product.cover_url} alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>
                }
                {/* Type badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: 'rgba(7,0,16,0.85)', color: '#C0A8D8', backdropFilter: 'blur(8px)' }}>
                  {TYPE_ICONS[product.type]}
                  {TYPE_LABELS[product.type] ?? product.type}
                </div>
              </div>

              {/* Info */}
              <div className="p-3.5">
                <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-2">
                  {product.title}
                </p>

                {/* Seller */}
                <div className="flex items-center gap-1.5 mb-3">
                  {product.profile.avatar_url ? (
                    <img src={product.profile.avatar_url} alt={product.profile.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                      {product.profile.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <p className="text-xs truncate" style={{ color: '#7A6890' }}>{product.profile.name}</p>
                </div>

                <p className="text-white font-black text-base">
                  ${Number(product.price_usd).toLocaleString('es-AR')}
                  <span className="text-xs font-medium ml-1" style={{ color: '#7A6890' }}>ARS</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Play, BookOpen, Music, Package } from 'lucide-react'

interface Purchase {
  id: string
  created_at: string
  amount_paid_usd: number | null
  product: {
    id: string
    title: string
    type: string
    cover_url: string | null
    profile: {
      name: string
      username: string
    }
  }
}

const TYPE_LABELS: Record<string, string> = {
  course:       'Curso',
  beat:         'Beat',
  sample_pack:  'Sample Pack',
  preset_pack:  'Preset Pack',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  course:       <BookOpen size={15} />,
  beat:         <Music size={15} />,
  sample_pack:  <Package size={15} />,
  preset_pack:  <Package size={15} />,
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading,   setLoading]   = useState(true)
  const [notAuth,   setNotAuth]   = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Usamos getSession() — lee de memoria, no hace llamada de red
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user?.id) {
        setNotAuth(true)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id, created_at, amount_paid_usd,
          product:products(
            id, title, type, cover_url,
            profile:profiles!products_seller_id_fkey(name, username)
          )
        `)
        .eq('buyer_id', session.user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      if (error) console.error('[purchases] error:', error)
      setPurchases((data ?? []) as unknown as Purchase[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin" style={{ color: '#8B3FFF' }} />
      </div>
    )
  }

  if (notAuth) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-white font-bold mb-3">Tenés que iniciar sesión para ver tus compras</p>
        <Link href="/login" className="px-5 py-2.5 rounded-full text-white font-bold text-sm gradient-magenta">
          Iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
          Mis compras
        </h1>
        <p className="text-sm mt-1" style={{ color: '#7A6890' }}>
          Todo el contenido que adquiriste en Mooseeka
        </p>
      </div>

      {purchases.length === 0 && (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(25,0,50,0.4)', border: '1px dashed rgba(123,47,255,0.25)' }}>
          <p className="text-3xl mb-3">🛍️</p>
          <p className="text-white font-bold mb-1">Todavía no compraste nada</p>
          <p className="text-sm mb-5" style={{ color: '#7A6890' }}>
            Explorá el market para encontrar cursos, beats y más.
          </p>
          <Link href="/market"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-sm gradient-magenta hover:opacity-90 transition-all">
            Ir al market
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {purchases.map(p => (
          <div key={p.id} className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(25,0,50,0.7)', border: '1px solid rgba(123,47,255,0.2)' }}>
            <div className="flex gap-4 p-4">
              {/* Cover */}
              <div className="w-20 h-20 rounded-xl shrink-0 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(139,63,255,0.3), rgba(255,26,140,0.3))' }}>
                {p.product?.cover_url
                  ? <img src={p.product.cover_url} alt={p.product.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🎵</div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold mb-1.5"
                  style={{ background: 'rgba(139,63,255,0.15)', color: '#C0A8D8' }}>
                  {TYPE_ICONS[p.product?.type]}
                  {TYPE_LABELS[p.product?.type] ?? p.product?.type}
                </div>
                <p className="text-white font-bold truncate">{p.product?.title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>
                  por {p.product?.profile?.name ?? '—'}
                </p>
                {p.amount_paid_usd && (
                  <p className="text-xs mt-1 font-bold" style={{ color: '#10b981' }}>
                    ${Number(p.amount_paid_usd).toFixed(2)} USD
                  </p>
                )}
              </div>
            </div>

            <div className="px-4 pb-4">
              <Link href={`/products/${p.product?.id}/watch`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-sm gradient-magenta hover:opacity-90 transition-all">
                <Play size={15} fill="white" />
                Acceder al contenido
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

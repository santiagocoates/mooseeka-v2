'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Loader2, Package, BookOpen, Music } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Seller {
  id: string
  name: string
  username: string
  avatar_url: string | null
  roles: string[] | null
  created_at: string
  product_count: number
  total_revenue: number
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  course:       <BookOpen size={13} />,
  beat:         <Music size={13} />,
  sample_pack:  <Package size={13} />,
  preset_pack:  <Package size={13} />,
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  return `hace ${days} días`
}

export default function SellersPage() {
  const [sellers,  setSellers]  = useState<Seller[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Obtener perfiles que tienen al menos un producto
      const { data: products } = await supabase
        .from('products')
        .select('seller_id, type')
        .eq('published', true)

      if (!products || products.length === 0) { setLoading(false); return }

      // Agrupar por seller
      const sellerMap: Record<string, { count: number; types: string[] }> = {}
      for (const p of products) {
        if (!sellerMap[p.seller_id]) sellerMap[p.seller_id] = { count: 0, types: [] }
        sellerMap[p.seller_id].count++
        sellerMap[p.seller_id].types.push(p.type)
      }

      const sellerIds = Object.keys(sellerMap)

      // Obtener revenue por seller
      const { data: purchases } = await supabase
        .from('purchases')
        .select(`amount_paid_usd, product:products!inner(seller_id)`)
        .eq('status', 'completed')
        .in('products.seller_id', sellerIds)

      const revenueMap: Record<string, number> = {}
      for (const purchase of purchases ?? []) {
        const sid = (purchase.product as unknown as { seller_id: string } | null)?.seller_id
        if (sid) revenueMap[sid] = (revenueMap[sid] ?? 0) + Number(purchase.amount_paid_usd ?? 0)
      }

      // Obtener perfiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, roles, created_at')
        .in('id', sellerIds)

      setSellers((profiles ?? []).map(p => ({
        ...p,
        product_count: sellerMap[p.id]?.count ?? 0,
        total_revenue: revenueMap[p.id] ?? 0,
      })))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Sellers</h1>
        <p className="text-sm mt-1" style={{ color: '#7A6890' }}>
          Perfiles con productos publicados en el marketplace
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: '#8B3FFF' }} />
        </div>
      ) : sellers.length === 0 ? (
        <div className="rounded-2xl p-14 text-center"
          style={{ background: 'rgba(20,0,40,0.6)', border: '1px dashed rgba(123,47,255,0.2)' }}>
          <p className="text-3xl mb-3">📦</p>
          <p className="text-white font-bold mb-1">Todavía no hay sellers</p>
          <p className="text-sm mb-5" style={{ color: '#7A6890' }}>
            Cuando un usuario publique un producto aparecerá acá.
          </p>
          <Link href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-sm gradient-magenta hover:opacity-90 transition-all">
            Crear primer producto
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sellers.map(seller => (
            <div key={seller.id} className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
              {/* Avatar */}
              {seller.avatar_url ? (
                <img src={seller.avatar_url} alt={seller.name} className="w-12 h-12 rounded-full object-cover shrink-0"
                  style={{ border: '2px solid rgba(123,47,255,0.4)' }} />
              ) : (
                <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-lg font-black text-white"
                  style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                  {seller.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{seller.name}</p>
                <p className="text-xs mb-1.5" style={{ color: '#7A6890' }}>
                  @{seller.username} · {seller.roles?.slice(0, 2).join(' · ') || 'Mooseeka'}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold" style={{ color: '#C0A8D8' }}>
                    {seller.product_count} producto{seller.product_count !== 1 ? 's' : ''}
                  </span>
                  {seller.total_revenue > 0 && (
                    <span className="text-xs font-bold" style={{ color: '#10b981' }}>
                      ${seller.total_revenue.toFixed(2)} USD vendidos
                    </span>
                  )}
                  <span className="text-xs" style={{ color: '#7A6890' }}>
                    Miembro {timeAgo(seller.created_at)}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/${seller.username}`} target="_blank"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                  style={{ background: 'rgba(123,47,255,0.15)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.3)' }}>
                  <ExternalLink size={12} /> Ver perfil
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

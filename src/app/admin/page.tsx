'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Users, ShoppingBag, DollarSign, Package, Loader2 } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalProducts: number
  totalPurchases: number
  totalRevenue: number
}

interface RecentPurchase {
  id: string
  created_at: string
  amount_paid_usd: number | null
  product: { title: string; type: string } | null
  buyer: { name: string; username: string; avatar_url: string | null } | null
}

interface RecentUser {
  id: string
  name: string
  username: string
  avatar_url: string | null
  roles: string[] | null
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'ahora'
  if (mins  < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

export default function AdminDashboard() {
  const [stats,    setStats]    = useState<Stats | null>(null)
  const [purchases, setPurchases] = useState<RecentPurchase[]>([])
  const [users,    setUsers]    = useState<RecentUser[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [usersRes, productsRes, purchasesRes, recentPurchasesRes, recentUsersRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('purchases').select('amount_paid_usd').eq('status', 'completed'),
        supabase.from('purchases')
          .select(`id, created_at, amount_paid_usd,
            product:products(title, type),
            buyer:profiles!purchases_buyer_id_fkey(name, username, avatar_url)
          `)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('profiles')
          .select('id, name, username, avatar_url, roles, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const revenue = (purchasesRes.data ?? []).reduce(
        (sum, p) => sum + (Number(p.amount_paid_usd) || 0), 0
      )

      setStats({
        totalUsers:     usersRes.count ?? 0,
        totalProducts:  productsRes.count ?? 0,
        totalPurchases: purchasesRes.data?.length ?? 0,
        totalRevenue:   revenue,
      })
      setPurchases((recentPurchasesRes.data ?? []) as unknown as RecentPurchase[])
      setUsers((recentUsersRes.data ?? []) as RecentUser[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin" style={{ color: '#8B3FFF' }} />
      </div>
    )
  }

  const STAT_CARDS = [
    { label: 'Usuarios totales',   value: stats?.totalUsers ?? 0,                                icon: Users,       color: '#8B3FFF' },
    { label: 'Productos publicados', value: stats?.totalProducts ?? 0,                           icon: Package,     color: '#06b6d4' },
    { label: 'Ventas completadas', value: stats?.totalPurchases ?? 0,                            icon: ShoppingBag, color: '#FF1A8C' },
    { label: 'Revenue total (USD)', value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`,          icon: DollarSign,  color: '#10b981' },
  ]

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#7A6890' }}>Panel de administración de Mooseeka</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7A6890' }}>{label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Ventas recientes */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(123,47,255,0.12)' }}>
            <div className="flex items-center gap-2">
              <DollarSign size={16} style={{ color: '#10b981' }} />
              <h2 className="text-sm font-bold text-white">Ventas recientes</h2>
            </div>
            <Link href="/purchases" className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#A855F7' }}>
              Ver todas →
            </Link>
          </div>

          {purchases.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-2xl mb-2">💰</p>
              <p className="text-sm" style={{ color: '#7A6890' }}>Todavía no hay ventas</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(123,47,255,0.08)' }}>
              {purchases.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                  {p.buyer?.avatar_url ? (
                    <img src={p.buyer.avatar_url} alt={p.buyer.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                      style={{ border: '2px solid rgba(123,47,255,0.3)' }} />
                  ) : (
                    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                      {p.buyer?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.product?.title ?? 'Producto'}</p>
                    <p className="text-xs truncate" style={{ color: '#7A6890' }}>por {p.buyer?.name ?? 'Usuario'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-black" style={{ color: '#10b981' }}>
                      ${Number(p.amount_paid_usd ?? 0).toFixed(2)}
                    </span>
                    <span className="text-[10px]" style={{ color: '#7A6890' }}>{timeAgo(p.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usuarios recientes */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(123,47,255,0.12)' }}>
            <div className="flex items-center gap-2">
              <Users size={16} style={{ color: '#8B3FFF' }} />
              <h2 className="text-sm font-bold text-white">Usuarios recientes</h2>
            </div>
            <Link href="/admin/users" className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#A855F7' }}>
              Ver todos →
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(123,47,255,0.08)' }}>
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0"
                    style={{ border: '2px solid rgba(123,47,255,0.3)' }} />
                ) : (
                  <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                    {u.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                  <p className="text-xs truncate" style={{ color: '#7A6890' }}>
                    @{u.username} · {u.roles?.slice(0, 2).join(' · ') || 'Mooseeka'}
                  </p>
                </div>
                <span className="text-[10px] shrink-0" style={{ color: '#7A6890' }}>{timeAgo(u.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

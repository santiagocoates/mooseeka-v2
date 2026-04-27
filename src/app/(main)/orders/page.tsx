'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, RefreshCw, Clock, Download, AlertTriangle, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'revision' | 'completed' | 'disputed' | 'cancelled'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:     { label: 'Pendiente',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: <Clock size={11} /> },
  in_progress: { label: 'En proceso',  color: '#8B3FFF', bg: 'rgba(139,63,255,0.12)',  icon: <RefreshCw size={11} /> },
  delivered:   { label: 'Entregado',   color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',   icon: <Download size={11} /> },
  revision:    { label: 'En revisión', color: '#FF5500', bg: 'rgba(255,85,0,0.12)',    icon: <RefreshCw size={11} /> },
  completed:   { label: 'Completado',  color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   icon: <Check size={11} /> },
  disputed:    { label: 'En disputa',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: <AlertTriangle size={11} /> },
  cancelled:   { label: 'Cancelado',   color: '#6B7280', bg: 'rgba(107,114,128,0.12)', icon: <AlertTriangle size={11} /> },
}

interface OrderRow {
  id: string
  status: OrderStatus
  title: string
  personName: string
  avatar: string | null
  price: string
  date: string
  action: string | null
}

function formatDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function getAction(status: OrderStatus, tab: 'buying' | 'selling'): string | null {
  if (tab === 'buying' && status === 'delivered') return 'Revisar entrega'
  if (tab === 'selling' && status === 'in_progress') return 'Entregar trabajo'
  if (tab === 'selling' && status === 'pending') return 'Comenzar pedido'
  return null
}

export default function OrdersPage() {
  const [tab, setTab] = useState<'buying' | 'selling'>('buying')
  const [buying, setBuying] = useState<OrderRow[]>([])
  const [selling, setSelling] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setLoading(false); return }

      const uid = session.user.id

      const [buyRes, sellRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, status, created_at, price, currency, project_name, service:services(title), seller:profiles!orders_seller_id_fkey(name, avatar_url)')
          .eq('buyer_id', uid)
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('id, status, created_at, price, currency, project_name, service:services(title), buyer:profiles!orders_buyer_id_fkey(name, avatar_url)')
          .eq('seller_id', uid)
          .order('created_at', { ascending: false }),
      ])

      setBuying((buyRes.data ?? []).map((o: any) => ({
        id: o.id,
        status: o.status as OrderStatus,
        title: o.service?.title ?? o.project_name,
        personName: o.seller?.name ?? '—',
        avatar: o.seller?.avatar_url ?? null,
        price: `${o.currency === 'EUR' ? '€' : '$'}${o.price}`,
        date: formatDate(o.created_at),
        action: getAction(o.status as OrderStatus, 'buying'),
      })))

      setSelling((sellRes.data ?? []).map((o: any) => ({
        id: o.id,
        status: o.status as OrderStatus,
        title: o.service?.title ?? o.project_name,
        personName: o.buyer?.name ?? '—',
        avatar: o.buyer?.avatar_url ?? null,
        price: `${o.currency === 'EUR' ? '€' : '$'}${o.price}`,
        date: formatDate(o.created_at),
        action: getAction(o.status as OrderStatus, 'selling'),
      })))

      setLoading(false)
    }
    fetchOrders()
  }, [])

  const orders = tab === 'buying' ? buying : selling

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-black" style={{ letterSpacing: '-0.02em' }}>Mis pedidos</h1>
        <Link href="/services/new"
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
          <Plus size={14} /> Publicar servicio
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['buying', 'selling'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={tab === t
              ? { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.22)', color: '#C0A8D8' }}>
            {t === 'buying' ? '🛒 Comprando' : '💼 Vendiendo'}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full animate-spin border-2 border-[#8B3FFF] border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => {
            const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.cancelled

            return (
              <Link key={order.id} href={`/orders/${order.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:opacity-90"
                style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.18)')}>

                {/* Avatar */}
                {order.avatar ? (
                  <img src={order.avatar} alt={order.personName}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                    style={{ outline: '2px solid rgba(123,47,255,0.3)' }} />
                ) : (
                  <div className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', outline: '2px solid rgba(123,47,255,0.3)' }}>
                    {order.personName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{order.title}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#7A6890' }}>
                    {tab === 'buying' ? 'Vendedor' : 'Comprador'}: {order.personName} · {order.date}
                  </p>
                  {order.action && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                      ● {order.action}
                    </span>
                  )}
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="font-black text-sm text-white">{order.price}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: st.bg, color: st.color }}>
                    {st.icon} {st.label}
                  </span>
                </div>
              </Link>
            )
          })}

          {orders.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-white font-semibold mb-1">No tienes pedidos aún</p>
              <p className="text-sm" style={{ color: '#7A6890' }}>
                {tab === 'buying' ? 'Explora el market y contrata tu primer servicio.' : 'Publica un servicio para empezar a recibir pedidos.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

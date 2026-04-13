'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, RefreshCw, Clock, Download, AlertTriangle, Plus } from 'lucide-react'

type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'revision' | 'completed' | 'disputed'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:     { label: 'Pendiente',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: <Clock size={11} /> },
  in_progress: { label: 'En proceso',  color: '#8B3FFF', bg: 'rgba(139,63,255,0.12)',  icon: <RefreshCw size={11} /> },
  delivered:   { label: 'Entregado',   color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',   icon: <Download size={11} /> },
  revision:    { label: 'En revisión', color: '#FF5500', bg: 'rgba(255,85,0,0.12)',    icon: <RefreshCw size={11} /> },
  completed:   { label: 'Completado',  color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   icon: <Check size={11} /> },
  disputed:    { label: 'En disputa',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: <AlertTriangle size={11} /> },
}

const MOCK_BUYING = [
  { id: 'ord_001', status: 'delivered' as OrderStatus,   title: 'Mastering Profesional de Alta Fidelidad', seller: 'Marta Sound',      avatar: '/users/ingeniera.jpg',    price: '€45', date: 'Hace 3 días', action: 'Revisar entrega' },
  { id: 'ord_002', status: 'in_progress' as OrderStatus, title: 'Producción de Trap',                       seller: 'Acid Beat',        avatar: '/users/user2.jpg',        price: '€60', date: 'Hace 1 día',  action: null },
]

const MOCK_SELLING = [
  { id: 'ord_003', status: 'in_progress' as OrderStatus, title: 'Mezcla de Géneros Urbanos',               buyer: 'Carlos M.',         avatar: '/users/artistas.jpg',     price: '€80', date: 'Hace 2 días', action: 'Entregar trabajo' },
  { id: 'ord_004', status: 'completed' as OrderStatus,   title: 'Mastering Profesional de Alta Fidelidad', buyer: 'Sofía L.',          avatar: '/users/user3.jpg',        price: '€45', date: 'Hace 1 semana', action: null },
]

export default function OrdersPage() {
  const [tab, setTab] = useState<'buying' | 'selling'>('buying')
  const orders = tab === 'buying' ? MOCK_BUYING : MOCK_SELLING

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
      <div className="flex flex-col gap-3">
        {orders.map(order => {
          const st = STATUS_CONFIG[order.status]
          const person = tab === 'buying'
            ? { label: 'Vendedor', name: (order as typeof MOCK_BUYING[0]).seller, avatar: order.avatar }
            : { label: 'Comprador', name: (order as typeof MOCK_SELLING[0]).buyer, avatar: order.avatar }

          return (
            <Link key={order.id} href={`/orders/${order.id}`}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:opacity-90"
              style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.18)')}>

              {/* Avatar */}
              <img src={person.avatar} alt={person.name}
                className="w-11 h-11 rounded-full object-cover shrink-0"
                style={{ outline: '2px solid rgba(123,47,255,0.3)' }} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{order.title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#7A6890' }}>
                  {person.label}: {person.name} · {order.date}
                </p>
                {/* Action needed */}
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
    </div>
  )
}

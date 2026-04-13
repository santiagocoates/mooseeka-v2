'use client'

import Link from 'next/link'
import { Users, ShieldCheck, ShoppingBag, TrendingUp, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react'

const STATS = [
  { label: 'Usuarios totales',     value: '1,284',  change: '+48 esta semana',  icon: Users,       color: '#8B3FFF' },
  { label: 'Vendedores activos',   value: '37',     change: '+3 este mes',      icon: ShieldCheck, color: '#FF1A8C' },
  { label: 'Servicios publicados', value: '214',    change: '+12 esta semana',  icon: ShoppingBag, color: '#06b6d4' },
  { label: 'Órdenes totales',      value: '892',    change: '+67 este mes',     icon: TrendingUp,  color: '#f59e0b' },
]

const RECENT_REQUESTS = [
  { name: 'Diego Montoya',  role: 'Productor · Trap / Reggaetón', avatar: '/users/user2.jpg',      time: 'Hace 2h',  status: 'pending'  },
  { name: 'Valentina Cruz', role: 'Ingeniera de mezcla',          avatar: '/users/ingeniera.jpg',  time: 'Hace 5h',  status: 'pending'  },
  { name: 'Raúl Sánchez',   role: 'Compositor · Latin Pop',       avatar: '/users/artistas.jpg',   time: 'Hace 1d',  status: 'approved' },
  { name: 'Keila Mora',     role: 'Artista · R&B',                avatar: '/users/user1.jpg',      time: 'Hace 2d',  status: 'rejected' },
]

const RECENT_ORDERS = [
  { buyer: 'Carlos V.',   service: 'Mastering Profesional',   amount: '€45',  status: 'completed'   },
  { buyer: 'Ana L.',      service: 'Producción de Trap',      amount: '€60',  status: 'in_progress' },
  { buyer: 'Marcos P.',   service: 'Mixing Estéreo',          amount: '€80',  status: 'delivered'   },
  { buyer: 'Sofía R.',    service: 'Beat personalizado',      amount: '€120', status: 'pending'     },
]

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pendiente',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  approved:    { label: 'Aprobado',    color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  rejected:    { label: 'Rechazado',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  in_progress: { label: 'En proceso',  color: '#8B3FFF', bg: 'rgba(139,63,255,0.12)'  },
  completed:   { label: 'Completado',  color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  delivered:   { label: 'Entregado',   color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'   },
}

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#7A6890' }}>Bienvenido al panel de administración de Mooseeka</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7A6890' }}>{label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>{value}</p>
            <p className="text-xs font-medium" style={{ color: '#10b981' }}>↑ {change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Solicitudes recientes */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(123,47,255,0.12)' }}>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} style={{ color: '#FF1A8C' }} />
              <h2 className="text-sm font-bold text-white">Solicitudes de vendedor</h2>
            </div>
            <Link href="/admin/sellers"
              className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ color: '#A855F7' }}>
              Ver todas <span>→</span>
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(123,47,255,0.08)' }}>
            {RECENT_REQUESTS.map((r) => {
              const s = STATUS_BADGE[r.status]
              return (
                <div key={r.name} className="flex items-center gap-3 px-5 py-3.5">
                  <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover shrink-0"
                    style={{ border: '2px solid rgba(123,47,255,0.3)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                    <p className="text-xs truncate" style={{ color: '#7A6890' }}>{r.role}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    <span className="text-[10px]" style={{ color: '#7A6890' }}>{r.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(123,47,255,0.08)' }}>
            <Link href="/admin/sellers"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
              style={{ color: '#A855F7', border: '1px solid rgba(139,63,255,0.25)' }}>
              <Clock size={14} /> Ver 4 solicitudes pendientes
            </Link>
          </div>
        </div>

        {/* Órdenes recientes */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(123,47,255,0.12)' }}>
            <div className="flex items-center gap-2">
              <DollarSign size={16} style={{ color: '#10b981' }} />
              <h2 className="text-sm font-bold text-white">Órdenes recientes</h2>
            </div>
            <span className="text-xs font-semibold" style={{ color: '#10b981' }}>€305 esta semana</span>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(123,47,255,0.08)' }}>
            {RECENT_ORDERS.map((o, i) => {
              const s = STATUS_BADGE[o.status]
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #8B3FFF22, #FF1A8C22)', border: '1px solid rgba(123,47,255,0.25)' }}>
                    {o.buyer.split('')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{o.service}</p>
                    <p className="text-xs truncate" style={{ color: '#7A6890' }}>por {o.buyer}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-sm font-bold" style={{ color: '#10b981' }}>{o.amount}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

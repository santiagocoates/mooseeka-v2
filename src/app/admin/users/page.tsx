'use client'

import { useState } from 'react'
import { Search, ShieldCheck, ShieldOff, MoreHorizontal } from 'lucide-react'

const MOCK_USERS = [
  { id: '1', name: 'Elena Ríos',      username: 'elenarios',     avatar: '/users/productores.jpg', role: 'Productora Musical', joined: '10 Mar 2025', isSeller: true,  orders: 12, status: 'active'   },
  { id: '2', name: 'Marta Sound',     username: 'martasound',    avatar: '/users/ingeniera.jpg',   role: 'Mastering Engineer', joined: '5 Ene 2025',  isSeller: true,  orders: 89, status: 'active'   },
  { id: '3', name: 'Acid Beat',       username: 'acidbeat',      avatar: '/users/user2.jpg',       role: 'Music Producer',     joined: '1 Feb 2025',  isSeller: true,  orders: 34, status: 'active'   },
  { id: '4', name: 'DJ Slime',        username: 'djslime',       avatar: '/users/user1.jpg',       role: 'DJ · Productor',     joined: '20 Mar 2025', isSeller: false, orders: 3,  status: 'active'   },
  { id: '5', name: 'Diego Montoya',   username: 'diegomontoya',  avatar: '/users/user2.jpg',       role: 'Productor',          joined: '1 Abr 2025',  isSeller: false, orders: 0,  status: 'pending'  },
  { id: '6', name: 'Valentina Cruz',  username: 'valcruz',       avatar: '/users/ingeniera.jpg',   role: 'Ingeniera de mezcla',joined: '5 Abr 2025',  isSeller: false, orders: 0,  status: 'active'   },
  { id: '7', name: 'Keila Mora',      username: 'keilamora',     avatar: '/users/user2.jpg',       role: 'Artista · R&B',      joined: '2 Abr 2025',  isSeller: false, orders: 1,  status: 'suspended'},
]

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState(MOCK_USERS)

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  function toggleSeller(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isSeller: !u.isSeller } : u))
  }

  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    active:    { label: 'Activo',     color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
    pending:   { label: 'Pendiente',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    suspended: { label: 'Suspendido', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Usuarios</h1>
          <p className="text-sm mt-1" style={{ color: '#7A6890' }}>{users.length} usuarios registrados</p>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 max-w-xs"
          style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.2)' }}>
          <Search size={15} style={{ color: '#7A6890' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="bg-transparent text-sm text-white placeholder-[#7A6890] focus:outline-none flex-1" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-wider"
          style={{ color: '#7A6890', borderBottom: '1px solid rgba(123,47,255,0.12)', background: 'rgba(0,0,0,0.2)' }}>
          <div className="col-span-4">Usuario</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2">Vendedor</div>
          <div className="col-span-1 text-center">Órdenes</div>
          <div className="col-span-2">Desde</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y" style={{ borderColor: 'rgba(123,47,255,0.08)' }}>
          {filtered.map(user => {
            const s = STATUS_CONFIG[user.status]
            return (
              <div key={user.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors">
                {/* User */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0"
                    style={{ border: '2px solid rgba(123,47,255,0.3)' }} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs truncate" style={{ color: '#7A6890' }}>@{user.username}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>

                {/* Seller toggle */}
                <div className="col-span-2 flex items-center gap-2">
                  <button onClick={() => toggleSeller(user.id)}
                    className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-all"
                    style={user.isSeller
                      ? { background: 'rgba(139,63,255,0.15)', color: '#A855F7', border: '1px solid rgba(139,63,255,0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#7A6890', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {user.isSeller
                      ? <><ShieldCheck size={11} /> Vendedor</>
                      : <><ShieldOff size={11} /> Solo usuario</>}
                  </button>
                </div>

                {/* Orders */}
                <div className="col-span-1 text-center">
                  <span className="text-sm font-bold" style={{ color: user.orders > 0 ? '#C0A8D8' : '#7A6890' }}>
                    {user.orders}
                  </span>
                </div>

                {/* Joined */}
                <div className="col-span-2">
                  <span className="text-xs" style={{ color: '#7A6890' }}>{user.joined}</span>
                </div>

                {/* More */}
                <div className="col-span-1 flex justify-end">
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
                    style={{ color: '#7A6890' }}>
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

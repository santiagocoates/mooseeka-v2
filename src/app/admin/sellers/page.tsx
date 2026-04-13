'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

type Status = 'pending' | 'approved' | 'rejected'

interface SellerRequest {
  id: string
  name: string
  username: string
  avatar: string
  role: string
  genres: string[]
  why: string
  portfolio: string
  joinedDays: number
  followers: number
  status: Status
  time: string
}

const MOCK_REQUESTS: SellerRequest[] = [
  {
    id: '1',
    name: 'Diego Montoya',
    username: 'diegomontoya',
    avatar: '/users/user2.jpg',
    role: 'Productor musical',
    genres: ['Trap', 'Reggaetón', 'Latin Pop'],
    why: 'Tengo 6 años produciendo para artistas independientes en México y Colombia. Quiero usar Mooseeka para expandir mi clientela a toda Latinoamérica.',
    portfolio: 'https://soundcloud.com/diegomontoya',
    joinedDays: 12,
    followers: 3,
    status: 'pending',
    time: 'Hace 2h',
  },
  {
    id: '2',
    name: 'Valentina Cruz',
    username: 'valcruz',
    avatar: '/users/ingeniera.jpg',
    role: 'Ingeniera de mezcla',
    genres: ['Pop', 'R&B', 'Soul'],
    why: 'Trabajo en un estudio profesional en Bogotá hace 4 años. He mezclado más de 200 tracks. Busco clientes fuera de Colombia.',
    portfolio: 'https://www.instagram.com/valcruzaudio',
    joinedDays: 5,
    followers: 1,
    status: 'pending',
    time: 'Hace 5h',
  },
  {
    id: '3',
    name: 'Felipe Arenas',
    username: 'felipearenas',
    avatar: '/users/artistas.jpg',
    role: 'Compositor',
    genres: ['Balada', 'Latin Pop'],
    why: 'He escrito canciones para artistas con más de 10M de streams. Quiero ofrecer mis servicios de composición a través de Mooseeka.',
    portfolio: 'https://open.spotify.com/artist/felipearenas',
    joinedDays: 3,
    followers: 0,
    status: 'pending',
    time: 'Hace 1d',
  },
  {
    id: '4',
    name: 'Camila Ríos',
    username: 'camilarios',
    avatar: '/users/productores.jpg',
    role: 'Diseñadora gráfica · Música',
    genres: ['Urbano', 'Electrónica'],
    why: 'Diseño portadas de álbumes y material visual para artistas independientes. Tengo portfolio de más de 80 proyectos.',
    portfolio: 'https://behance.net/camilarios',
    joinedDays: 8,
    followers: 2,
    status: 'pending',
    time: 'Hace 1d',
  },
  {
    id: '5',
    name: 'Raúl Sánchez',
    username: 'raulbeats',
    avatar: '/users/user1.jpg',
    role: 'Productor · Beat maker',
    genres: ['Trap', 'Drill', 'Hip Hop'],
    why: 'Productor independiente con 5 años de experiencia. Beats vendidos en DistroKid y BeatStars.',
    portfolio: 'https://beatstars.com/raulbeats',
    joinedDays: 30,
    followers: 8,
    status: 'approved',
    time: 'Hace 3d',
  },
  {
    id: '6',
    name: 'Keila Mora',
    username: 'keilamora',
    avatar: '/users/user2.jpg',
    role: 'Artista · R&B',
    genres: ['R&B', 'Soul'],
    why: 'Quiero vender mis instrumentales.',
    portfolio: '',
    joinedDays: 1,
    followers: 0,
    status: 'rejected',
    time: 'Hace 5d',
  },
]

const TABS: { id: Status | 'all'; label: string }[] = [
  { id: 'all',      label: 'Todas'     },
  { id: 'pending',  label: 'Pendientes' },
  { id: 'approved', label: 'Aprobados' },
  { id: 'rejected', label: 'Rechazados'},
]

export default function SellersPage() {
  const [tab, setTab] = useState<Status | 'all'>('pending')
  const [requests, setRequests] = useState(MOCK_REQUESTS)
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = tab === 'all' ? requests : requests.filter(r => r.status === tab)

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  function approve(id: string) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    setExpanded(null)
  }
  function reject(id: string) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    setExpanded(null)
  }

  const STATUS_CONFIG = {
    pending:  { label: 'Pendiente',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock         },
    approved: { label: 'Aprobado',   color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle   },
    rejected: { label: 'Rechazado',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: XCircle       },
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Solicitudes de vendedor</h1>
        <p className="text-sm mt-1" style={{ color: '#7A6890' }}>
          Revisá cada solicitud y decidí quién puede publicar servicios en Mooseeka
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === t.id
              ? { background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)', color: '#fff' }
              : { color: '#7A6890' }}>
            {t.label}
            <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
              style={tab === t.id
                ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                : { background: 'rgba(123,47,255,0.15)', color: '#A855F7' }}>
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: '#7A6890' }}>
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-semibold text-white">No hay solicitudes aquí</p>
          </div>
        )}

        {filtered.map(req => {
          const s = STATUS_CONFIG[req.status]
          const StatusIcon = s.icon
          const isExpanded = expanded === req.id

          return (
            <div key={req.id} className="rounded-2xl overflow-hidden transition-all"
              style={{ background: 'rgba(20,0,40,0.8)', border: `1px solid ${req.status === 'pending' ? 'rgba(245,158,11,0.25)' : 'rgba(123,47,255,0.15)'}` }}>

              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <img src={req.avatar} alt={req.name} className="w-11 h-11 rounded-full object-cover shrink-0"
                  style={{ border: '2px solid rgba(123,47,255,0.3)' }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{req.name}</p>
                    <span className="text-xs" style={{ color: '#7A6890' }}>@{req.username}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: s.bg, color: s.color }}>
                      <StatusIcon size={10} />
                      {s.label}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#A855F7' }}>{req.role}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px]" style={{ color: '#7A6890' }}>
                      🗓 {req.joinedDays} días en Mooseeka
                    </span>
                    <span className="text-[10px]" style={{ color: '#7A6890' }}>
                      👥 {req.followers} seguidores
                    </span>
                    <span className="text-[10px]" style={{ color: '#7A6890' }}>{req.time}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'pending' && (
                    <>
                      <button onClick={() => approve(req.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.35)' }}>
                        <CheckCircle size={13} /> Aprobar
                      </button>
                      <button onClick={() => reject(req.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <XCircle size={13} /> Rechazar
                      </button>
                    </>
                  )}
                  {req.status === 'approved' && (
                    <button onClick={() => reject(req.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                      Revocar
                    </button>
                  )}
                  {req.status === 'rejected' && (
                    <button onClick={() => approve(req.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.35)' }}>
                      Aprobar
                    </button>
                  )}
                  <button onClick={() => setExpanded(isExpanded ? null : req.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/8"
                    style={{ color: '#7A6890' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 pb-5 flex flex-col gap-4" style={{ borderTop: '1px solid rgba(123,47,255,0.1)' }}>
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    {/* Por qué quiere vender */}
                    <div className="col-span-2">
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7A6890' }}>Por qué quiere vender</p>
                      <p className="text-sm leading-relaxed rounded-xl p-3"
                        style={{ color: '#C0A8D8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(123,47,255,0.15)' }}>
                        "{req.why}"
                      </p>
                    </div>

                    {/* Géneros */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7A6890' }}>Géneros</p>
                      <div className="flex flex-wrap gap-1.5">
                        {req.genres.map(g => (
                          <span key={g} className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background: 'rgba(139,63,255,0.15)', color: '#A855F7', border: '1px solid rgba(139,63,255,0.25)' }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Portfolio */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7A6890' }}>Portfolio / Trabajo anterior</p>
                      {req.portfolio ? (
                        <a href={req.portfolio} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ color: '#A855F7' }}>
                          <ExternalLink size={12} />
                          {req.portfolio.replace('https://', '')}
                        </a>
                      ) : (
                        <p className="text-xs" style={{ color: '#ef4444' }}>No proporcionó portfolio</p>
                      )}
                    </div>
                  </div>

                  {/* CTA final */}
                  {req.status === 'pending' && (
                    <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid rgba(123,47,255,0.1)' }}>
                      <button onClick={() => approve(req.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>
                        <CheckCircle size={15} /> Aprobar como vendedor
                      </button>
                      <button onClick={() => reject(req.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <XCircle size={15} /> Rechazar solicitud
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

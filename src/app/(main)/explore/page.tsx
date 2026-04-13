'use client'

import { useState } from 'react'
import { Search, Star } from 'lucide-react'
import Link from 'next/link'

const TRENDING_ARTISTS = [
  { name: 'DistroDub', genre: 'Jazz', followers: 8, avatar: '/users/user2.jpg' },
  { name: 'Valentina R.', genre: 'Alternative', followers: 1, avatar: '/users/user3.jpg' },
  { name: 'Adrede', genre: 'Alternative', followers: 3, avatar: '/users/artistas.jpg' },
  { name: 'Enzo Aguilar', genre: 'Rock', followers: 2, avatar: '/users/manager.jpg' },
  { name: 'Patricia V.', genre: 'World', followers: 2, avatar: '/users/user1.jpg' },
]

const TOP_SERVICES = [
  { id: '1', title: 'Mastering Profesional', seller: 'Marta Sound', price: '€45/track', rating: 5.0, reviews: 127, avatar: '/users/productores.jpg' },
  { id: '2', title: 'Producción de Trap', seller: 'Acid Beat', price: '€60/track', rating: 4.9, reviews: 95, avatar: '/users/user2.jpg' },
  { id: '3', title: 'Sesión de Fotos', seller: 'Creative Lens', price: 'Desde €120', rating: 5.0, reviews: 43, avatar: '/users/disenadores.jpg' },
]

const TOP_PROS = [
  { name: 'Elena Ríos', role: 'Productora · Ingeniera', avatar: '/users/productores.jpg', rating: 5.0 },
  { name: 'Carlos Beats', role: 'Productor · DJ', avatar: '/users/user2.jpg', rating: 4.9 },
  { name: 'Lina Vox', role: 'Cantante · Compositora', avatar: '/users/user3.jpg', rating: 4.8 },
]

export default function ExplorePage() {
  const [search, setSearch] = useState('')

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col gap-8">
      <h1 className="text-white text-2xl font-black" style={{ letterSpacing: '-0.02em' }}>Explora.</h1>

      {/* Search */}
      <div className="relative">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#7A6890' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar profesionales, servicios, contenido..."
          className="w-full text-white placeholder-[#7A6890] pl-11 pr-4 py-3.5 rounded-xl focus:outline-none text-sm transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.55)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')}
        />
      </div>

      {/* Trending Artists */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">🔥</span>
          <h2 className="text-white text-lg font-black" style={{ letterSpacing: '-0.02em' }}>Tendencias Artistas</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {TRENDING_ARTISTS.map(artist => (
            <div key={artist.name} className="flex flex-col items-center gap-3 min-w-[110px]">
              <div className="relative">
                <img src={artist.avatar} alt={artist.name}
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ border: '2px solid rgba(123,47,255,0.5)' }} />
                <div className="absolute inset-0 rounded-full"
                  style={{ background: 'linear-gradient(135deg, rgba(139,63,255,0.15), rgba(255,26,140,0.15))' }} />
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-semibold">{artist.name}</p>
                <p className="text-xs" style={{ color: '#7A6890' }}>{artist.genre}</p>
                <p className="text-xs" style={{ color: '#7A6890' }}>{artist.followers} seguidores</p>
              </div>
              <button className="text-xs font-bold px-4 py-1.5 rounded-full transition-all"
                style={{ border: '1px solid rgba(255,26,140,0.5)', color: '#FF1A8C' }}
                onMouseOver={e => { e.currentTarget.style.background = '#FF1A8C'; e.currentTarget.style.color = '#fff' }}
                onMouseOut={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#FF1A8C' }}>
                Seguir
              </button>
            </div>
          ))}
        </div>
        <button className="text-sm mt-3 transition-colors hover:opacity-80" style={{ color: '#A855F7' }}>
          Ver todas las tendencias →
        </button>
      </section>

      {/* Top Services */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">⭐</span>
          <div>
            <h2 className="text-white text-lg font-black" style={{ letterSpacing: '-0.02em' }}>Top Servicios</h2>
            <p className="text-xs" style={{ color: '#7A6890' }}>Los más contratados esta semana</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {TOP_SERVICES.map(service => (
            <Link key={service.id} href={`/services/${service.id}`}
              className="rounded-2xl overflow-hidden transition-all group block"
              style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.45)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.18)')}
            >
              <div className="h-28 overflow-hidden">
                <img src={service.avatar} alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-3">
                <p className="text-white font-bold text-sm group-hover:text-[#FF1A8C] transition-colors mb-1 line-clamp-1">{service.title}</p>
                <p className="text-xs mb-2" style={{ color: '#7A6890' }}>{service.seller}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-yellow-400" fill="currentColor" />
                    <span className="text-white text-xs font-semibold">{service.rating}</span>
                    <span className="text-xs" style={{ color: '#7A6890' }}>({service.reviews})</span>
                  </div>
                  <span className="text-white font-black text-sm">{service.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <button className="text-sm mt-3 transition-colors hover:opacity-80" style={{ color: '#A855F7' }}>
          Ver todos los servicios →
        </button>
      </section>

      {/* Top Professionals */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">👥</span>
          <div>
            <h2 className="text-white text-lg font-black" style={{ letterSpacing: '-0.02em' }}>Top Profesionales</h2>
            <p className="text-xs" style={{ color: '#7A6890' }}>Más contratados este mes</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {TOP_PROS.map(pro => (
            <div key={pro.name}
              className="rounded-2xl p-5 flex flex-col items-center gap-3 min-w-[160px] transition-all"
              style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.45)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.18)')}
            >
              <img src={pro.avatar} alt={pro.name}
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: '2px solid rgba(123,47,255,0.45)' }} />
              <div className="text-center">
                <p className="text-white font-bold text-sm">{pro.name}</p>
                <p className="text-xs" style={{ color: '#7A6890' }}>{pro.role}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={11} className="text-yellow-400" fill="currentColor" />
                  <span className="text-white text-xs">{pro.rating}</span>
                </div>
              </div>
              <button className="text-white text-xs font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition-all w-full gradient-magenta glow-btn">
                Ver perfil
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

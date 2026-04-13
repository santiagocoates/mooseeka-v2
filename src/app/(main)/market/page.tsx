'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import ServiceCard from '@/components/market/ServiceCard'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'production', label: 'Producción' },
  { id: 'mixing', label: 'Mixing & Mastering' },
  { id: 'composition', label: 'Composición' },
  { id: 'design', label: 'Diseño' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'legal', label: 'Legal' },
]

const MOCK_SERVICES = [
  {
    id: '1', title: 'Mastering Profesional de Alta Fidelidad', category: 'mastering',
    price: '€45/track', rating: 5.0, reviews: 127, sales: 89,
    seller: { name: 'Marta Sound', initials: 'MS', gradient: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' },
    coverImage: '/users/productores.jpg',
  },
  {
    id: '2', title: 'Producción de Trap', category: 'production',
    price: '€60/track', rating: 4.9, reviews: 95, sales: 67,
    seller: { name: 'Acid Beat', initials: 'AB', gradient: 'linear-gradient(135deg, #FF1A8C, #8B3FFF)' },
    coverImage: '/users/user2.jpg',
  },
  {
    id: '3', title: 'Sesión de Fotos Profesional', category: 'design',
    price: 'Desde €120', rating: 5.0, reviews: 43, sales: 34,
    seller: { name: 'Creative Lens', initials: 'CL', gradient: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' },
    coverImage: '/users/disenadores.jpg',
  },
  {
    id: '4', title: 'Producción Vocal Profesional', category: 'vocal',
    price: '€60/h', rating: 4.8, reviews: 31, sales: 22,
    seller: { name: 'Vocal Coach Pro', initials: 'VC', gradient: 'linear-gradient(135deg, #FF1A8C, #8B3FFF)' },
    coverImage: '/users/user3.jpg',
  },
  {
    id: '5', title: 'Mezcla de Géneros Urbanos', category: 'mixing',
    price: '€80/track', rating: 4.7, reviews: 58, sales: 44,
    seller: { name: 'Urban Mix', initials: 'UM', gradient: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' },
    coverImage: '/users/ingeniera.jpg',
  },
  {
    id: '6', title: 'Estrategia de Marketing para Artistas', category: 'marketing',
    price: '€150/mes', rating: 4.9, reviews: 22, sales: 18,
    seller: { name: 'Music Grow', initials: 'MG', gradient: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' },
    coverImage: '/users/marketers.jpg',
  },
]

export default function MarketPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_SERVICES.filter(s => {
    const matchCat = activeCategory === 'all' || s.category === activeCategory
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.seller.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-black" style={{ letterSpacing: '-0.02em' }}>Market</h1>
        <Link href="/services/new"
          className="text-white font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 hover:opacity-90 transition-all gradient-magenta glow-btn">
          <Plus size={16} />
          Publicar servicio
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#7A6890' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar profesionales, servicios, contenido..."
          className="w-full text-white placeholder-[#7A6890] pl-11 pr-4 py-3 rounded-xl focus:outline-none text-sm transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.55)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')}
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0"
            style={activeCategory === cat.id
              ? { background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)', color: '#fff' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.22)', color: '#C0A8D8' }
            }>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: '#7A6890' }}>
          <p className="text-lg mb-2">No se encontraron servicios</p>
          <p className="text-sm">Intenta con otra categoría o búsqueda</p>
        </div>
      )}
    </div>
  )
}

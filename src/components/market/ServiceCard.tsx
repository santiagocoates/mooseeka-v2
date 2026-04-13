'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  production: 'Producción',
  mixing: 'Mixing',
  mastering: 'Mastering',
  composition: 'Composición',
  design: 'Diseño',
  marketing: 'Marketing',
  legal: 'Legal',
  vocal: 'Vocal',
  other: 'Otro',
}

interface ServiceCardProps {
  service: {
    id: string
    title: string
    category: string
    price: string
    rating: number
    reviews: number
    sales: number
    seller: { name: string; initials: string; gradient: string }
    coverImage?: string
    coverGradient?: string
  }
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`}
      className="rounded-2xl overflow-hidden block transition-all group card-shadow"
      style={{ background: 'rgba(25,0,50,0.7)', border: '1px solid rgba(123,47,255,0.18)' }}
      onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.45)')}
      onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.18)')}
    >
      {/* Cover */}
      <div className="h-36 relative overflow-hidden">
        {service.coverImage ? (
          <img src={service.coverImage} alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full" style={{ background: service.coverGradient ?? 'linear-gradient(135deg, #0E001C, #15002A)' }} />
        )}
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,0,20,0.85) 0%, transparent 50%)' }} />
        {/* Category badge */}
        <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
          style={{ background: 'rgba(123,47,255,0.7)', color: '#fff', backdropFilter: 'blur(8px)' }}>
          {CATEGORY_LABELS[service.category] ?? service.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-bold text-sm leading-snug mb-3 group-hover:text-[#FF1A8C] transition-colors line-clamp-2">
          {service.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
            style={{ background: service.seller.gradient }}>
            {service.seller.initials[0]}
          </div>
          <span className="text-xs truncate" style={{ color: '#C0A8D8' }}>{service.seller.name}</span>
        </div>

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
  )
}

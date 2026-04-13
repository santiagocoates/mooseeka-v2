'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  Star, Clock, RefreshCw, Check, Share2, ArrowLeft,
  Shield, ChevronDown, ChevronUp, MessageSquare, Package
} from 'lucide-react'
import ShareModal from '@/components/shared/ShareModal'
import CheckoutModal from '@/components/orders/CheckoutModal'

const BASE_URL = 'https://mooseeka.com'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_SERVICES: Record<string, ServiceDetail> = {
  '1': {
    id: '1', type: 'service',
    title: 'Mastering Profesional de Alta Fidelidad',
    category: 'Mastering',
    description: 'Mastering de alta calidad usando equipamiento analógico y digital de referencia mundial. Más de 10 años trabajando con sellos europeos y artistas independientes. Cada track recibe atención personalizada para preservar la energía de tu mezcla mientras se maximiza el impacto en cualquier plataforma de streaming.',
    includes: [
      'Mastering estéreo para streaming y descarga',
      'Versión optimizada para Spotify, Apple Music, YouTube',
      'DDP file para fabricación de CD (si aplica)',
      'Informe técnico del proceso',
      '2 revisiones incluidas',
    ],
    price: '€45',
    pricingModel: 'Por track',
    deliveryTime: '2–3 días',
    revisions: '2',
    rating: 5.0,
    reviews: 127,
    sales: 89,
    coverImage: '/users/productores.jpg',
    seller: {
      username: 'martasound',
      name: 'Marta Sound',
      role: 'Mastering Engineer',
      avatar: '/users/ingeniera.jpg',
      rating: 5.0,
      reviews: 127,
      sales: 89,
      memberSince: 'Enero 2023',
      responseTime: '< 2 horas',
      gradient: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)',
    },
    reviewsList: [
      { author: 'Álvaro G.', avatar: '/users/user2.jpg', rating: 5, date: 'hace 2 días', text: 'Increíble trabajo. El mastering le dio una profundidad que no esperaba, suena perfecto en Spotify.' },
      { author: 'Daniela R.', avatar: '/users/user3.jpg', rating: 5, date: 'hace 1 semana', text: 'Muy profesional, entregó antes del plazo y con un resultado excelente. Ya es mi maestra de referencia.' },
      { author: 'Carlos M.', avatar: '/users/artistas.jpg', rating: 5, date: 'hace 2 semanas', text: 'Llevaba tiempo buscando un mastering que no aplastara la mezcla. Encontré lo que buscaba.' },
    ],
  },
  '2': {
    id: '2', type: 'service',
    title: 'Producción de Trap',
    category: 'Producción',
    description: 'Producción completa de trap con sonido profesional y actual. Trabajo con artistas independientes y sellos para crear beats originales adaptados a tu estilo. Incluye todos los stems separados para que tengas control total sobre el resultado final.',
    includes: [
      'Beat original 100% exclusivo',
      'Stems separados (drums, bass, melodies, fx)',
      'Mezcla básica incluida',
      'Archivo WAV + MP3',
      '3 revisiones de arreglos',
    ],
    price: '€60',
    pricingModel: 'Por track',
    deliveryTime: '3–5 días',
    revisions: '3',
    rating: 4.9,
    reviews: 95,
    sales: 67,
    coverImage: '/users/user2.jpg',
    seller: {
      username: 'acidbeat',
      name: 'Acid Beat',
      role: 'Productor Musical',
      avatar: '/users/user2.jpg',
      rating: 4.9,
      reviews: 95,
      sales: 67,
      memberSince: 'Marzo 2023',
      responseTime: '< 4 horas',
      gradient: 'linear-gradient(135deg, #FF1A8C, #8B3FFF)',
    },
    reviewsList: [
      { author: 'Raúl T.', avatar: '/users/artistas.jpg', rating: 5, date: 'hace 3 días', text: 'El beat superó mis expectativas. Sonido muy moderno y bien mezclado desde el principio.' },
      { author: 'Sofía L.', avatar: '/users/user3.jpg', rating: 5, date: 'hace 5 días', text: 'Muy buena comunicación durante el proceso. El resultado es exactamente lo que pedí.' },
      { author: 'Marcos V.', avatar: '/users/user2.jpg', rating: 4, date: 'hace 2 semanas', text: 'Buen trabajo, tardó un poco más de lo prometido pero el resultado valió la pena.' },
    ],
  },
}

// Fallback para IDs no encontrados
const FALLBACK: ServiceDetail = MOCK_SERVICES['1']

interface Review {
  author: string; avatar: string; rating: number; date: string; text: string
}

interface ServiceDetail {
  id: string; type: 'service' | 'product'
  title: string; category: string; description: string
  includes: string[]; price: string; pricingModel: string
  deliveryTime: string; revisions: string
  rating: number; reviews: number; sales: number; coverImage: string
  seller: {
    username: string; name: string; role: string; avatar: string
    rating: number; reviews: number; sales: number
    memberSince: string; responseTime: string; gradient: string
  }
  reviewsList: Review[]
}

// ─── Star row ──────────────────────────────────────────────────────────────────
function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? '#FACC15' : 'none'}
          className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-[#7A6890]'} />
      ))}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const service = MOCK_SERVICES[id] ?? FALLBACK
  const [shareOpen, setShareOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const displayedReviews = showAllReviews ? service.reviewsList : service.reviewsList.slice(0, 2)

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">

      {/* Back */}
      <Link href="/market"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white"
        style={{ color: '#7A6890' }}>
        <ArrowLeft size={15} /> Volver al Market
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Left: main content ── */}
        <div className="flex-1 min-w-0">

          {/* Cover */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 relative">
            <img src={service.coverImage} alt={service.title}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(10,0,20,0.6) 0%, transparent 50%)' }} />
            <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(123,47,255,0.8)', color: '#fff', backdropFilter: 'blur(8px)' }}>
              {service.category}
            </span>
            <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(10,0,20,0.7)', color: '#C0A8D8', backdropFilter: 'blur(8px)' }}>
              {service.type === 'service' ? '🛠️ Servicio' : '📦 Producto Digital'}
            </span>
          </div>

          {/* Title + stats */}
          <h1 className="text-white text-2xl font-black mb-3" style={{ letterSpacing: '-0.02em' }}>
            {service.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5">
              <Stars rating={service.rating} />
              <span className="text-white font-bold text-sm">{service.rating}</span>
              <span className="text-sm" style={{ color: '#7A6890' }}>({service.reviews} reseñas)</span>
            </div>
            <span className="text-sm" style={{ color: '#7A6890' }}>
              🛒 {service.sales} ventas
            </span>
          </div>

          {/* Seller row */}
          <Link href={`/${service.seller.username}`}
            className="flex items-center gap-3 p-4 rounded-2xl mb-6 transition-all hover:opacity-90"
            style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
            <img src={service.seller.avatar} alt={service.seller.name}
              className="w-11 h-11 rounded-full object-cover shrink-0"
              style={{ outline: '2px solid rgba(123,47,255,0.4)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{service.seller.name}</p>
              <p className="text-xs" style={{ color: '#7A6890' }}>{service.seller.role}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Stars rating={service.seller.rating} size={11} />
                <span className="text-xs font-semibold text-white">{service.seller.rating}</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>Ver perfil →</p>
            </div>
          </Link>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-white font-bold text-base mb-3">Sobre este servicio</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#C0A8D8' }}>{service.description}</p>
          </div>

          {/* Includes */}
          <div className="mb-8 rounded-2xl p-5"
            style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
            <h2 className="text-white font-bold text-base mb-4">¿Qué incluye?</h2>
            <div className="flex flex-col gap-2.5">
              {service.includes.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(139,63,255,0.2)' }}>
                    <Check size={11} style={{ color: '#A855F7' }} />
                  </div>
                  <span className="text-sm" style={{ color: '#C0A8D8' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-base">
                Reseñas <span style={{ color: '#7A6890' }}>({service.reviews})</span>
              </h2>
              <div className="flex items-center gap-1.5">
                <Stars rating={service.rating} />
                <span className="text-white font-black">{service.rating}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {displayedReviews.map((r, i) => (
                <div key={i} className="p-4 rounded-2xl"
                  style={{ background: 'rgba(25,0,50,0.5)', border: '1px solid rgba(123,47,255,0.12)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={r.avatar} alt={r.author}
                      className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">{r.author}</p>
                      <div className="flex items-center gap-2">
                        <Stars rating={r.rating} size={11} />
                        <span className="text-xs" style={{ color: '#7A6890' }}>{r.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#C0A8D8' }}>{r.text}</p>
                </div>
              ))}
            </div>

            {service.reviewsList.length > 2 && (
              <button onClick={() => setShowAllReviews(v => !v)}
                className="mt-4 w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ border: '1px solid rgba(123,47,255,0.25)', color: '#C0A8D8' }}>
                {showAllReviews ? <><ChevronUp size={15} /> Ver menos</> : <><ChevronDown size={15} /> Ver todas las reseñas</>}
              </button>
            )}
          </div>
        </div>

        {/* ── Right: purchase panel (sticky on desktop) ── */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-6 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(14,0,28,0.9)', border: '1px solid rgba(123,47,255,0.3)' }}>

            {/* Price */}
            <div className="p-5" style={{ borderBottom: '1px solid rgba(123,47,255,0.12)' }}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                  {service.price}
                </span>
                <span className="text-sm" style={{ color: '#7A6890' }}>{service.pricingModel}</span>
              </div>
              <p className="text-xs" style={{ color: '#7A6890' }}>Precio fijo · Sin costos ocultos</p>
            </div>

            {/* Details */}
            <div className="p-5 flex flex-col gap-3" style={{ borderBottom: '1px solid rgba(123,47,255,0.12)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#C0A8D8' }}>
                  <Clock size={14} style={{ color: '#8B3FFF' }} />
                  Tiempo de entrega
                </div>
                <span className="text-sm font-semibold text-white">{service.deliveryTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#C0A8D8' }}>
                  <RefreshCw size={14} style={{ color: '#8B3FFF' }} />
                  Revisiones
                </div>
                <span className="text-sm font-semibold text-white">{service.revisions}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#C0A8D8' }}>
                  <Package size={14} style={{ color: '#8B3FFF' }} />
                  Incluye
                </div>
                <span className="text-sm font-semibold text-white">{service.includes.length} ítems</span>
              </div>
            </div>

            {/* CTA */}
            <div className="p-5 flex flex-col gap-3">
              <button
                onClick={() => setCheckoutOpen(true)}
                className="w-full py-3.5 rounded-xl text-white font-black text-base transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' }}>
                {service.type === 'service' ? '⚡ Contratar ahora' : '🛒 Comprar ahora'}
              </button>

              <button className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ border: '1px solid rgba(123,47,255,0.35)', color: '#C0A8D8' }}>
                <MessageSquare size={15} />
                Contactar al vendedor
              </button>

              <button onClick={() => setShareOpen(true)}
                className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:opacity-70"
                style={{ color: '#7A6890' }}>
                <Share2 size={14} />
                Compartir
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Shield size={12} style={{ color: '#7A6890' }} />
                <span className="text-xs" style={{ color: '#7A6890' }}>Pago seguro · Garantía Mooseeka</span>
              </div>
            </div>

            {/* Seller quick info */}
            <div className="px-5 pb-5 flex flex-col gap-2.5 pt-0"
              style={{ borderTop: '1px solid rgba(123,47,255,0.12)' }}>
              <p className="text-xs font-bold uppercase tracking-wider pt-4" style={{ color: '#7A6890' }}>
                Sobre el vendedor
              </p>
              <div className="flex items-center gap-2.5">
                <img src={service.seller.avatar} alt={service.seller.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0" />
                <div>
                  <p className="text-white text-xs font-semibold">{service.seller.name}</p>
                  <p className="text-[10px]" style={{ color: '#7A6890' }}>Miembro desde {service.seller.memberSince}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Respuesta', value: service.seller.responseTime },
                  { label: 'Ventas', value: `${service.seller.sales}+` },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-2.5 text-center"
                    style={{ background: 'rgba(123,47,255,0.08)' }}>
                    <p className="text-white text-xs font-bold">{s.value}</p>
                    <p className="text-[10px]" style={{ color: '#7A6890' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        service={{
          id: service.id,
          title: service.title,
          price: service.price,
          pricingModel: service.pricingModel,
          deliveryTime: service.deliveryTime,
          revisions: service.revisions,
          seller: { name: service.seller.name, avatar: service.seller.avatar },
        }}
      />

      {/* Share modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={`${BASE_URL}/services/${service.id}`}
        displayUrl={`mooseeka.com/services/${service.id}`}
        shareText={`${service.title} por ${service.seller.name} en Mooseeka 🎵`}
        type="service"
      />
    </div>
  )
}

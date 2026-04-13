'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Check, RefreshCw, AlertTriangle,
  Upload, Download, Clock, Shield, MessageSquare, Star
} from 'lucide-react'

// ─── Types & mock ─────────────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'revision' | 'completed' | 'disputed'

interface Order {
  id: string
  status: OrderStatus
  service: { title: string; price: string; pricingModel: string; deliveryTime: string; revisions: string; revisionsUsed: number }
  seller: { name: string; username: string; avatar: string }
  buyer: { name: string; avatar: string }
  projectName: string
  notes: string
  createdAt: string
  deliveryDeadline: string
  deliveredFiles?: { name: string; size: string }[]
  autoReleaseIn?: string
}

const MOCK_ORDERS: Record<string, Order> = {
  ord_001: {
    id: 'ord_001',
    status: 'delivered',
    service: { title: 'Mastering Profesional de Alta Fidelidad', price: '€45', pricingModel: 'Por track', deliveryTime: '2–3 días', revisions: '2', revisionsUsed: 0 },
    seller: { name: 'Marta Sound', username: 'martasound', avatar: '/users/ingeniera.jpg' },
    buyer: { name: 'Elena Ríos', avatar: '/users/productores.jpg' },
    projectName: 'Single Verano 2025',
    notes: 'Mantener el carácter cálido de la mezcla, referencia sonora: Bad Bunny - Un Verano Sin Ti',
    createdAt: 'Hace 3 días',
    deliveryDeadline: 'Hoy',
    deliveredFiles: [
      { name: 'single_verano_2025_master.wav', size: '48 MB' },
      { name: 'single_verano_2025_master_mp3.mp3', size: '8 MB' },
    ],
    autoReleaseIn: '4 días',
  },
  ord_002: {
    id: 'ord_002',
    status: 'in_progress',
    service: { title: 'Producción de Trap', price: '€60', pricingModel: 'Por track', deliveryTime: '3–5 días', revisions: '3', revisionsUsed: 0 },
    seller: { name: 'Acid Beat', username: 'acidbeat', avatar: '/users/user2.jpg' },
    buyer: { name: 'Elena Ríos', avatar: '/users/productores.jpg' },
    projectName: 'EP Nocturna - Track 2',
    notes: 'Trap melódico, influencias: Drake, Bad Bunny. BPM: 140',
    createdAt: 'Hace 1 día',
    deliveryDeadline: 'En 4 días',
    deliveredFiles: [],
  },
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode; description: string }> = {
  pending:    { label: 'Pendiente',    color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   icon: <Clock size={14} />,         description: 'El vendedor aún no ha comenzado el trabajo.' },
  in_progress:{ label: 'En proceso',  color: '#8B3FFF', bg: 'rgba(139,63,255,0.12)',  icon: <RefreshCw size={14} />,     description: 'El vendedor está trabajando en tu proyecto.' },
  delivered:  { label: 'Entregado',   color: '#06B6D4', bg: 'rgba(6,182,212,0.1)',    icon: <Download size={14} />,      description: 'El vendedor entregó el trabajo. Revísalo y aprueba o pide cambios.' },
  revision:   { label: 'En revisión', color: '#FF5500', bg: 'rgba(255,85,0,0.1)',     icon: <RefreshCw size={14} />,     description: 'Pediste cambios. El vendedor está trabajando en ellos.' },
  completed:  { label: 'Completado',  color: '#22C55E', bg: 'rgba(34,197,94,0.1)',    icon: <Check size={14} />,         description: 'Pedido completado. El pago fue liberado al vendedor.' },
  disputed:   { label: 'En disputa',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)',    icon: <AlertTriangle size={14} />, description: 'Mooseeka está revisando el problema.' },
}

const TIMELINE_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pending',     label: 'Pedido' },
  { key: 'in_progress', label: 'En proceso' },
  { key: 'delivered',   label: 'Entregado' },
  { key: 'completed',   label: 'Completado' },
]

const STATUS_ORDER: OrderStatus[] = ['pending', 'in_progress', 'delivered', 'completed']

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const order = MOCK_ORDERS[id] ?? MOCK_ORDERS['ord_001']
  const status = STATUS_CONFIG[order.status]
  const currentStep = STATUS_ORDER.indexOf(order.status)

  const [revisionNote, setRevisionNote] = useState('')
  const [showRevision, setShowRevision] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')

  const canApprove = order.status === 'delivered'
  const canRevise  = order.status === 'delivered' && order.service.revisionsUsed < parseInt(order.service.revisions)

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">

      {/* Back */}
      <Link href="/orders"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white"
        style={{ color: '#7A6890' }}>
        <ArrowLeft size={15} /> Mis pedidos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-xs mb-1" style={{ color: '#7A6890' }}>Pedido #{order.id}</p>
          <h1 className="text-white text-xl font-black" style={{ letterSpacing: '-0.02em' }}>
            {order.service.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#7A6890' }}>
            {order.createdAt} · {order.service.price} {order.service.pricingModel}
          </p>
        </div>
        {/* Status badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shrink-0"
          style={{ background: status.bg, color: status.color }}>
          {status.icon}
          {status.label}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center mb-8">
        {TIMELINE_STEPS.map((s, i) => {
          const done    = i <= currentStep
          const active  = i === currentStep
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: done ? 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' : 'rgba(123,47,255,0.1)',
                    border: active ? '2px solid #8B3FFF' : '2px solid transparent',
                  }}>
                  {done && !active
                    ? <Check size={12} className="text-white" />
                    : <div className="w-2 h-2 rounded-full" style={{ background: active ? '#8B3FFF' : 'rgba(123,47,255,0.3)' }} />}
                </div>
                <span className="text-[10px] whitespace-nowrap hidden sm:block"
                  style={{ color: done ? '#C0A8D8' : '#7A6890', fontWeight: active ? 600 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1 mb-4"
                  style={{ background: i < currentStep ? 'linear-gradient(90deg,#8B3FFF,#FF1A8C)' : 'rgba(123,47,255,0.15)' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Status message */}
      <div className="flex items-start gap-3 p-4 rounded-xl mb-6"
        style={{ background: status.bg, border: `1px solid ${status.color}33` }}>
        <span style={{ color: status.color }} className="mt-0.5 shrink-0">{status.icon}</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: status.color }}>{status.label}</p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#C0A8D8' }}>{status.description}</p>
          {order.autoReleaseIn && order.status === 'delivered' && (
            <p className="text-xs mt-1.5" style={{ color: '#7A6890' }}>
              ⏱ El pago se libera automáticamente en <strong style={{ color: '#C0A8D8' }}>{order.autoReleaseIn}</strong> si no respondes.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Delivered files */}
          {order.deliveredFiles && order.deliveredFiles.length > 0 && (
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
              <h2 className="text-white font-bold text-sm mb-4">Archivos entregados</h2>
              <div className="flex flex-col gap-2">
                {order.deliveredFiles.map(f => (
                  <div key={f.name}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-80 cursor-pointer"
                    style={{ background: 'rgba(139,63,255,0.08)', border: '1px solid rgba(139,63,255,0.2)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                      <Download size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{f.name}</p>
                      <p className="text-[10px]" style={{ color: '#7A6890' }}>{f.size}</p>
                    </div>
                    <Download size={14} style={{ color: '#8B3FFF' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project details */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
            <h2 className="text-white font-bold text-sm mb-4">Detalles del proyecto</h2>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#7A6890' }}>Nombre</p>
                <p className="text-white text-sm font-semibold">{order.projectName}</p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#7A6890' }}>Notas</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#C0A8D8' }}>{order.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { label: 'Entrega prometida', value: order.deliveryDeadline },
                  { label: 'Revisiones', value: `${order.service.revisionsUsed}/${order.service.revisions} usadas` },
                ].map(d => (
                  <div key={d.label} className="p-3 rounded-xl" style={{ background: 'rgba(123,47,255,0.07)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#7A6890' }}>{d.label}</p>
                    <p className="text-white text-xs font-semibold">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revision form */}
          {showRevision && (
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,85,0,0.06)', border: '1px solid rgba(255,85,0,0.25)' }}>
              <h2 className="text-white font-bold text-sm mb-3">¿Qué necesitas cambiar?</h2>
              <textarea
                value={revisionNote}
                onChange={e => setRevisionNote(e.target.value)}
                placeholder="Describe los cambios que necesitas con el mayor detalle posible..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#7A6890] outline-none resize-none mb-3"
                style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)' }}
              />
              <div className="flex gap-2">
                <button onClick={() => setShowRevision(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-70"
                  style={{ border: '1px solid rgba(123,47,255,0.25)', color: '#7A6890' }}>
                  Cancelar
                </button>
                <button
                  disabled={revisionNote.trim().length < 10}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 hover:opacity-80"
                  style={{ background: 'rgba(255,85,0,0.7)' }}>
                  Enviar solicitud
                </button>
              </div>
            </div>
          )}

          {/* Review form */}
          {showReview && (
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <h2 className="text-white font-bold text-sm mb-1">Dejar una reseña</h2>
              <p className="text-xs mb-4" style={{ color: '#7A6890' }}>Tu opinión ayuda a otros compradores.</p>
              <div className="flex gap-2 mb-4">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star size={24} fill={s <= reviewRating ? '#FACC15' : 'none'}
                      className={s <= reviewRating ? 'text-yellow-400' : 'text-[#7A6890]'} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Comparte tu experiencia con este vendedor..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#7A6890] outline-none resize-none mb-3"
                style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)' }}
              />
              <button
                disabled={reviewRating === 0 || reviewText.trim().length < 10}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 hover:opacity-80"
                style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                Publicar reseña
              </button>
            </div>
          )}
        </div>

        {/* Right: actions + seller */}
        <div className="w-full md:w-56 shrink-0 flex flex-col gap-4">

          {/* Actions */}
          {canApprove && (
            <div className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: 'rgba(14,0,28,0.9)', border: '1px solid rgba(123,47,255,0.3)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#7A6890' }}>Acciones</p>

              <button
                onClick={() => setShowReview(true)}
                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                <Check size={14} /> Aprobar entrega
              </button>

              {canRevise && (
                <button
                  onClick={() => setShowRevision(true)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                  style={{ border: '1px solid rgba(123,47,255,0.3)', color: '#C0A8D8' }}>
                  <RefreshCw size={13} /> Pedir revisión
                </button>
              )}

              <button className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all hover:opacity-70"
                style={{ color: '#EF4444' }}>
                <AlertTriangle size={12} /> Reportar problema
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Shield size={11} style={{ color: '#7A6890' }} />
                <span className="text-[10px]" style={{ color: '#7A6890' }}>Garantía Mooseeka</span>
              </div>
            </div>
          )}

          {/* Seller */}
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#7A6890' }}>Vendedor</p>
            <Link href={`/${order.seller.username}`} className="flex items-center gap-2.5 mb-3 hover:opacity-80 transition-opacity">
              <img src={order.seller.avatar} alt={order.seller.name}
                className="w-9 h-9 rounded-full object-cover shrink-0" />
              <div>
                <p className="text-white text-xs font-semibold">{order.seller.name}</p>
                <p className="text-[10px]" style={{ color: '#7A6890' }}>Ver perfil →</p>
              </div>
            </Link>
            <button className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{ border: '1px solid rgba(123,47,255,0.25)', color: '#C0A8D8' }}>
              <MessageSquare size={12} /> Enviar mensaje
            </button>
          </div>

          {/* Escrow info */}
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={13} style={{ color: '#22c55e' }} />
              <p className="text-xs font-bold" style={{ color: '#22c55e' }}>Pago protegido</p>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: '#7A6890' }}>
              {order.service.price} retenido en escrow. Se libera al vendedor cuando apruebes la entrega.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

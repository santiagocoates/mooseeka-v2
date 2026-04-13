'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, ArrowLeft, ArrowRight, Shield, Clock, RefreshCw, Upload, Music, Check } from 'lucide-react'

interface ServiceInfo {
  id: string
  title: string
  price: string
  pricingModel: string
  deliveryTime: string
  revisions: string
  seller: { name: string; avatar: string }
}

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  service: ServiceInfo
}

export default function CheckoutModal({ open, onClose, service }: CheckoutModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [projectName, setProjectName] = useState('')
  const [notes, setNotes] = useState('')
  const [deadline, setDeadline] = useState('')
  const [refFile, setRefFile] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setStep(1); setProjectName(''); setNotes(''); setDeadline(''); setRefFile(null); setLoading(false)
  }

  function handleClose() { reset(); onClose() }

  function handleConfirm() {
    setLoading(true)
    // TODO: create order in Supabase + Stripe Checkout
    setTimeout(() => {
      handleClose()
      router.push('/orders/ord_001')
    }, 1200)
  }

  const canContinue = projectName.trim().length >= 2

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}>

      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#0E001C', border: '1px solid rgba(123,47,255,0.3)', maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(123,47,255,0.15)' }}>
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                style={{ color: '#7A6890' }}>
                <ArrowLeft size={15} />
              </button>
            )}
            <div>
              <h3 className="text-white font-bold text-sm">
                {step === 1 ? 'Cuéntanos tu proyecto' : 'Confirmar pedido'}
              </h3>
              <p className="text-xs" style={{ color: '#7A6890' }}>
                Paso {step} de 2
              </p>
            </div>
          </div>
          <button onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: '#7A6890' }}>
            <X size={17} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex shrink-0" style={{ borderBottom: '1px solid rgba(123,47,255,0.1)' }}>
          {[1, 2].map(s => (
            <div key={s} className="flex-1 h-0.5 transition-all"
              style={{ background: s <= step ? 'linear-gradient(90deg,#8B3FFF,#FF1A8C)' : 'rgba(123,47,255,0.12)' }} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ── Step 1: Brief ── */}
          {step === 1 && (
            <div className="p-5 flex flex-col gap-4">

              {/* Service pill */}
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.18)' }}>
                <img src={service.seller.avatar} alt={service.seller.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{service.title}</p>
                  <p className="text-xs" style={{ color: '#7A6890' }}>por {service.seller.name}</p>
                </div>
                <span className="font-black text-sm shrink-0" style={{ color: '#FF1A8C' }}>{service.price}</span>
              </div>

              {/* Project name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
                  Nombre del proyecto *
                </label>
                <input
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="ej: Single Verano 2025, EP Nocturna..."
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#7A6890] outline-none transition-all"
                  style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,63,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)')}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
                  Notas para el vendedor
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Referencias de sonido, BPM, género, instrucciones específicas..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#7A6890] outline-none resize-none transition-all"
                  style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,63,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)')}
                />
                <p className="text-right text-xs mt-1" style={{ color: '#7A6890' }}>{notes.length}/500</p>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
                  Fecha límite <span className="font-normal normal-case">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                  style={{
                    background: 'rgba(123,47,255,0.08)',
                    border: '1px solid rgba(123,47,255,0.2)',
                    colorScheme: 'dark',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,63,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)')}
                />
              </div>

              {/* Reference file */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
                  Archivo de referencia <span className="font-normal normal-case">(opcional)</span>
                </label>
                <input ref={fileRef} type="file" accept="audio/*,.pdf,.zip" className="hidden"
                  onChange={e => setRefFile(e.target.files?.[0]?.name ?? null)} />
                {refFile ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.25)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                      <Music size={14} className="text-white" />
                    </div>
                    <span className="flex-1 text-sm text-white truncate">{refFile}</span>
                    <button onClick={() => setRefFile(null)}
                      className="text-[#7A6890] hover:text-[#FF1A8C] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all hover:opacity-80"
                    style={{ border: '1px dashed rgba(123,47,255,0.3)', color: '#7A6890' }}>
                    <Upload size={15} />
                    <span className="text-sm">Subir audio, PDF o ZIP de referencia</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Summary + payment ── */}
          {step === 2 && (
            <div className="p-5 flex flex-col gap-4">

              {/* Order summary */}
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(123,47,255,0.2)' }}>
                <div className="px-4 py-3"
                  style={{ background: 'rgba(123,47,255,0.1)', borderBottom: '1px solid rgba(123,47,255,0.15)' }}>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">Resumen del pedido</p>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-white font-semibold text-sm">{service.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>por {service.seller.name}</p>
                  </div>
                  <div className="h-px" style={{ background: 'rgba(123,47,255,0.12)' }} />
                  <div className="flex flex-col gap-2">
                    {[
                      { icon: <Clock size={13} />, label: 'Entrega', value: service.deliveryTime },
                      { icon: <RefreshCw size={13} />, label: 'Revisiones', value: service.revisions },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2" style={{ color: '#7A6890' }}>
                          <span style={{ color: '#8B3FFF' }}>{r.icon}</span>
                          {r.label}
                        </div>
                        <span className="text-white font-medium">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-px" style={{ background: 'rgba(123,47,255,0.12)' }} />

                  {/* Project name recap */}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7A6890' }}>Proyecto</p>
                    <p className="text-white text-sm font-semibold">{projectName}</p>
                    {notes && <p className="text-xs leading-relaxed" style={{ color: '#7A6890' }}>{notes}</p>}
                  </div>

                  <div className="h-px" style={{ background: 'rgba(123,47,255,0.12)' }} />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Total</span>
                    <span className="text-xl font-black" style={{ color: '#FF1A8C' }}>
                      {service.price} <span className="text-xs font-normal" style={{ color: '#7A6890' }}>{service.pricingModel}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Escrow explanation */}
              <div className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Shield size={16} className="shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>Tu pago está protegido</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#7A6890' }}>
                    El dinero queda retenido por Mooseeka y solo se libera cuando apruebes la entrega. Si algo sale mal, te devolvemos el dinero.
                  </p>
                </div>
              </div>

              {/* Payment method placeholder */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7A6890' }}>Método de pago</p>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)' }}>
                  <div className="w-8 h-5 rounded flex items-center justify-center text-xs font-black bg-white text-blue-700">VISA</div>
                  <span className="text-sm text-white">•••• •••• •••• 4242</span>
                  <span className="ml-auto text-xs" style={{ color: '#7A6890' }}>Stripe</span>
                </div>
                <p className="text-xs" style={{ color: '#7A6890' }}>
                  Se conectará con Stripe al integrar pagos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 shrink-0"
          style={{ borderTop: '1px solid rgba(123,47,255,0.15)' }}>
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!canContinue}
              className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90">
              <span>Continuar</span>
              <ArrowRight size={15} />
              <style>{`.cta-btn{background:linear-gradient(135deg,#8B3FFF,#FF1A8C)}`}</style>
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check size={15} /> Confirmar y pagar {service.price}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

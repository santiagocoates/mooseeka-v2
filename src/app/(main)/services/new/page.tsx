'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Upload, X, Plus, Star, Clock, RefreshCw, Music } from 'lucide-react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────
type OfferType = 'service' | 'product' | null

interface FormData {
  type: OfferType
  // Step 1
  title: string
  category: string
  description: string
  // Step 2 – service
  pricingModel: string
  price: string
  currency: string
  deliveryTime: string
  revisions: string
  includes: string[]
  // Step 2 – product
  licenseType: string
  fileFormat: string
  // Step 3
  coverPreview: string | null
  audioPreview: string | null
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  { value: 'produccion',  label: '🎵 Producción Musical' },
  { value: 'mezcla',      label: '🎚️ Mezcla y Mastering' },
  { value: 'composicion', label: '✍️ Composición' },
  { value: 'grabacion',   label: '🎤 Grabación' },
  { value: 'sesion',      label: '🎸 Músico de Sesión' },
  { value: 'video',       label: '🎬 Video & Fotografía' },
  { value: 'diseno',      label: '🎨 Diseño Gráfico' },
  { value: 'marketing',   label: '📱 Marketing Musical' },
  { value: 'clases',      label: '🎓 Clases y Tutoriales' },
  { value: 'gestion',     label: '📋 Gestión Artística' },
]

const PRODUCT_CATEGORIES = [
  { value: 'beats',      label: '🥁 Beats / Instrumentales' },
  { value: 'samples',    label: '🎛️ Sample Packs' },
  { value: 'presets',    label: '🎹 Presets / Plugins' },
  { value: 'cursos',     label: '📚 Cursos Digitales' },
  { value: 'partituras', label: '🎼 Partituras' },
  { value: 'stems',      label: '🗂️ Stems / Multitracks' },
]

const PRICING_MODELS = [
  { value: 'proyecto', label: 'Por proyecto' },
  { value: 'hora',     label: 'Por hora' },
  { value: 'cancion',  label: 'Por canción' },
  { value: 'consultar',label: 'A consultar' },
]

const DELIVERY_TIMES = [
  { value: '24h',      label: '24 horas' },
  { value: '3d',       label: '2–3 días' },
  { value: '1w',       label: '1 semana' },
  { value: '2w',       label: '2 semanas' },
  { value: 'consultar',label: 'A consultar' },
]

const REVISION_OPTIONS = ['1', '2', '3', 'Ilimitadas']

const LICENSE_TYPES = [
  { value: 'no-exclusiva', label: '🔓 Licencia no exclusiva', desc: 'El beat puede venderse a otros artistas' },
  { value: 'exclusiva',    label: '🔒 Licencia exclusiva',    desc: 'Solo tú tendrás derechos sobre este beat' },
  { value: 'libre',        label: '✅ Uso libre',              desc: 'Sin restricciones de uso' },
]

const FILE_FORMATS = ['MP3', 'WAV', 'FLAC', 'ZIP', 'PDF', 'MP4', 'Otro']

const CURRENCIES = ['€', '$', 'USD']

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ['Tipo', 'Detalles', 'Precio', 'Portada', 'Vista previa']

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done    = i < current
        const active  = i === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done ? 'linear-gradient(135deg,#8B3FFF,#FF1A8C)'
                    : active ? 'rgba(139,63,255,0.2)'
                    : 'rgba(123,47,255,0.08)',
                  border: active ? '2px solid #8B3FFF' : '2px solid transparent',
                  color: done ? '#fff' : active ? '#A855F7' : '#7A6890',
                }}>
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span className="text-[10px] hidden sm:block whitespace-nowrap"
                style={{ color: active ? '#C0A8D8' : '#7A6890', fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-1 mb-4 transition-all"
                style={{ background: done ? 'linear-gradient(90deg,#8B3FFF,#FF1A8C)' : 'rgba(123,47,255,0.15)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Shared field components ──────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-white mb-1.5">{children}</label>
}

function Input({ value, onChange, placeholder, maxLength }: {
  value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#7A6890] outline-none transition-all"
      style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)' }}
      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,63,255,0.7)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)')}
    />
  )
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none"
      style={{
        background: 'rgba(123,47,255,0.08)',
        border: '1px solid rgba(123,47,255,0.2)',
        color: value ? '#fff' : '#7A6890',
      }}
      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,63,255,0.7)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)')}>
      <option value="" style={{ background: '#0E001C' }}>Selecciona una opción</option>
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: '#0E001C' }}>{o.label}</option>
      ))}
    </select>
  )
}

// ─── Step 0: Tipo ─────────────────────────────────────────────────────────────
function StepTipo({ onSelect }: { onSelect: (t: OfferType) => void }) {
  return (
    <div>
      <h2 className="text-white text-2xl font-black mb-1" style={{ letterSpacing: '-0.02em' }}>
        ¿Qué quieres ofrecer?
      </h2>
      <p className="text-sm mb-8" style={{ color: '#7A6890' }}>
        Elige el tipo de oferta que mejor describe lo que vas a publicar.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Servicio */}
        <button onClick={() => onSelect('service')}
          className="group text-left p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)' }}
          onMouseOver={e => (e.currentTarget.style.borderColor = '#8B3FFF')}
          onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)')}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
            style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
            🛠️
          </div>
          <h3 className="text-white font-black text-lg mb-2">Servicio</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#7A6890' }}>
            Ofrece tu trabajo a otros artistas. Producción, mezcla, clases, diseño y más.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Producción', 'Mezcla', 'Composición', 'Clases'].map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(139,63,255,0.15)', color: '#A855F7' }}>{t}</span>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm font-bold" style={{ color: '#A855F7' }}>
            Crear servicio <ArrowRight size={15} />
          </div>
        </button>

        {/* Producto */}
        <button onClick={() => onSelect('product')}
          className="group text-left p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'rgba(255,26,140,0.06)', border: '1px solid rgba(255,26,140,0.18)' }}
          onMouseOver={e => (e.currentTarget.style.borderColor = '#FF1A8C')}
          onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,26,140,0.18)')}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
            style={{ background: 'linear-gradient(135deg,#FF1A8C,#FF6B35)' }}>
            📦
          </div>
          <h3 className="text-white font-black text-lg mb-2">Producto Digital</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#7A6890' }}>
            Vende algo descargable al instante. Beats, sample packs, presets, cursos y más.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Beats', 'Sample Packs', 'Presets', 'Cursos'].map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(255,26,140,0.12)', color: '#FF1A8C' }}>{t}</span>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm font-bold" style={{ color: '#FF1A8C' }}>
            Crear producto digital <ArrowRight size={15} />
          </div>
        </button>
      </div>
    </div>
  )
}

// ─── Step 1: Detalles ─────────────────────────────────────────────────────────
function StepDetalles({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: string) => void }) {
  const categories = data.type === 'service' ? SERVICE_CATEGORIES : PRODUCT_CATEGORIES
  const remaining = 300 - data.description.length

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-white text-2xl font-black mb-1" style={{ letterSpacing: '-0.02em' }}>
          {data.type === 'service' ? 'Cuéntanos sobre tu servicio' : 'Cuéntanos sobre tu producto'}
        </h2>
        <p className="text-sm" style={{ color: '#7A6890' }}>
          Estos detalles ayudan a que los compradores encuentren tu oferta.
        </p>
      </div>

      <div>
        <FieldLabel>Título *</FieldLabel>
        <Input
          value={data.title}
          onChange={v => onChange('title', v)}
          placeholder={data.type === 'service'
            ? 'ej: Producción de trap profesional'
            : 'ej: Pack de 10 beats urbanos — Licencia incluida'}
          maxLength={80}
        />
        <p className="text-xs mt-1 text-right" style={{ color: '#7A6890' }}>{data.title.length}/80</p>
      </div>

      <div>
        <FieldLabel>Categoría *</FieldLabel>
        <Select
          value={data.category}
          onChange={v => onChange('category', v)}
          options={categories}
        />
      </div>

      <div>
        <FieldLabel>Descripción *</FieldLabel>
        <textarea
          value={data.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder={data.type === 'service'
            ? 'Describe tu servicio: qué incluye, tu proceso de trabajo, tu experiencia...'
            : 'Describe el producto: qué incluye, formatos, cómo se usa...'}
          maxLength={300}
          rows={5}
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#7A6890] outline-none transition-all resize-none"
          style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,63,255,0.7)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)')}
        />
        <p className="text-xs mt-1 text-right"
          style={{ color: remaining < 30 ? '#FF1A8C' : '#7A6890' }}>{remaining} caracteres restantes</p>
      </div>
    </div>
  )
}

// ─── Step 2: Precio ───────────────────────────────────────────────────────────
function StepPrecio({ data, onChange, onIncludesChange }: {
  data: FormData
  onChange: (k: keyof FormData, v: string) => void
  onIncludesChange: (items: string[]) => void
}) {
  const [newItem, setNewItem] = useState('')

  function addItem() {
    const trimmed = newItem.trim()
    if (!trimmed || data.includes.length >= 6) return
    onIncludesChange([...data.includes, trimmed])
    setNewItem('')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-white text-2xl font-black mb-1" style={{ letterSpacing: '-0.02em' }}>
          {data.type === 'service' ? 'Precio y entrega' : 'Precio y licencia'}
        </h2>
        <p className="text-sm" style={{ color: '#7A6890' }}>
          Define cuánto vale tu oferta y qué recibe el comprador.
        </p>
      </div>

      {data.type === 'service' ? (
        <>
          {/* Pricing model */}
          <div>
            <FieldLabel>Modelo de precio *</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRICING_MODELS.map(m => (
                <button key={m.value}
                  onClick={() => onChange('pricingModel', m.value)}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-center"
                  style={{
                    background: data.pricingModel === m.value ? 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' : 'rgba(123,47,255,0.08)',
                    border: `1px solid ${data.pricingModel === m.value ? 'transparent' : 'rgba(123,47,255,0.2)'}`,
                    color: data.pricingModel === m.value ? '#fff' : '#C0A8D8',
                  }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          {data.pricingModel !== 'consultar' && (
            <div>
              <FieldLabel>Precio *</FieldLabel>
              <div className="flex gap-2">
                <select value={data.currency} onChange={e => onChange('currency', e.target.value)}
                  className="px-3 py-3 rounded-xl text-sm font-bold outline-none"
                  style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)', color: '#fff', minWidth: 64 }}>
                  {CURRENCIES.map(c => <option key={c} value={c} style={{ background: '#0E001C' }}>{c}</option>)}
                </select>
                <Input value={data.price} onChange={v => onChange('price', v)} placeholder="ej: 60" />
              </div>
            </div>
          )}

          {/* Delivery time */}
          <div>
            <FieldLabel>Tiempo de entrega *</FieldLabel>
            <Select value={data.deliveryTime} onChange={v => onChange('deliveryTime', v)} options={DELIVERY_TIMES} />
          </div>

          {/* Revisions */}
          <div>
            <FieldLabel>Revisiones incluidas</FieldLabel>
            <div className="flex gap-2">
              {REVISION_OPTIONS.map(r => (
                <button key={r}
                  onClick={() => onChange('revisions', r)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: data.revisions === r ? 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' : 'rgba(123,47,255,0.08)',
                    border: `1px solid ${data.revisions === r ? 'transparent' : 'rgba(123,47,255,0.2)'}`,
                    color: data.revisions === r ? '#fff' : '#C0A8D8',
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* License type */}
          <div>
            <FieldLabel>Tipo de licencia *</FieldLabel>
            <div className="flex flex-col gap-2">
              {LICENSE_TYPES.map(l => (
                <button key={l.value}
                  onClick={() => onChange('licenseType', l.value)}
                  className="flex items-start gap-3 p-3.5 rounded-xl text-left transition-all"
                  style={{
                    background: data.licenseType === l.value ? 'rgba(139,63,255,0.15)' : 'rgba(123,47,255,0.06)',
                    border: `1px solid ${data.licenseType === l.value ? '#8B3FFF' : 'rgba(123,47,255,0.18)'}`,
                  }}>
                  <div className="w-4 h-4 rounded-full mt-0.5 shrink-0 border-2 flex items-center justify-center"
                    style={{ borderColor: data.licenseType === l.value ? '#8B3FFF' : '#7A6890' }}>
                    {data.licenseType === l.value && (
                      <div className="w-2 h-2 rounded-full" style={{ background: '#8B3FFF' }} />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{l.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>{l.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <FieldLabel>Precio *</FieldLabel>
            <div className="flex gap-2">
              <select value={data.currency} onChange={e => onChange('currency', e.target.value)}
                className="px-3 py-3 rounded-xl text-sm font-bold outline-none"
                style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)', color: '#fff', minWidth: 64 }}>
                {CURRENCIES.map(c => <option key={c} value={c} style={{ background: '#0E001C' }}>{c}</option>)}
              </select>
              <Input value={data.price} onChange={v => onChange('price', v)} placeholder="ej: 25" />
            </div>
          </div>

          {/* File format */}
          <div>
            <FieldLabel>Formato del archivo</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {FILE_FORMATS.map(f => (
                <button key={f}
                  onClick={() => onChange('fileFormat', f)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: data.fileFormat === f ? 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' : 'rgba(123,47,255,0.08)',
                    border: `1px solid ${data.fileFormat === f ? 'transparent' : 'rgba(123,47,255,0.2)'}`,
                    color: data.fileFormat === f ? '#fff' : '#C0A8D8',
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Included items — both types */}
      <div>
        <FieldLabel>¿Qué incluye? <span className="font-normal text-xs" style={{ color: '#7A6890' }}>(hasta 6)</span></FieldLabel>
        <div className="flex flex-col gap-2 mb-2">
          {data.includes.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.15)' }}>
              <Check size={13} style={{ color: '#8B3FFF', flexShrink: 0 }} />
              <span className="flex-1 text-sm text-white">{item}</span>
              <button onClick={() => onIncludesChange(data.includes.filter((_, j) => j !== i))}
                className="text-[#7A6890] hover:text-[#FF1A8C] transition-colors">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        {data.includes.length < 6 && (
          <div className="flex gap-2">
            <input
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="ej: Stems separados, 2 revisiones..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#7A6890] outline-none"
              style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,63,255,0.7)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)')}
            />
            <button onClick={addItem}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
              <Plus size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step 3: Portada ──────────────────────────────────────────────────────────
function StepPortada({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: string | null) => void }) {
  const coverRef  = useRef<HTMLInputElement>(null)
  const audioRef  = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleCoverFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    onChange('coverPreview', url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white text-2xl font-black mb-1" style={{ letterSpacing: '-0.02em' }}>
          Dale vida a tu oferta
        </h2>
        <p className="text-sm" style={{ color: '#7A6890' }}>
          Una buena imagen de portada aumenta hasta 3× las conversiones.
        </p>
      </div>

      {/* Cover image */}
      <div>
        <FieldLabel>Imagen de portada *</FieldLabel>
        <input ref={coverRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleCoverFile(e.target.files?.[0])} />

        {data.coverPreview ? (
          <div className="relative rounded-2xl overflow-hidden aspect-square max-w-xs">
            <img src={data.coverPreview} alt="portada" className="w-full h-full object-cover" />
            <button onClick={() => onChange('coverPreview', null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <X size={15} />
            </button>
            <button onClick={() => coverRef.current?.click()}
              className="absolute bottom-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full text-white"
              style={{ background: 'rgba(139,63,255,0.8)' }}>
              Cambiar
            </button>
          </div>
        ) : (
          <div
            onClick={() => coverRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleCoverFile(e.dataTransfer.files[0]) }}
            className="aspect-square max-w-xs rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
            style={{
              background: dragging ? 'rgba(139,63,255,0.15)' : 'rgba(123,47,255,0.06)',
              border: `2px dashed ${dragging ? '#8B3FFF' : 'rgba(123,47,255,0.3)'}`,
            }}>
            <Upload size={28} style={{ color: dragging ? '#8B3FFF' : '#7A6890' }} className="mb-3" />
            <p className="text-sm font-semibold" style={{ color: dragging ? '#A855F7' : '#C0A8D8' }}>
              {dragging ? 'Suelta la imagen' : 'Sube tu portada'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#7A6890' }}>PNG, JPG · Recomendado 1:1</p>
          </div>
        )}
      </div>

      {/* Audio preview */}
      <div>
        <FieldLabel>
          Preview de audio <span className="font-normal text-xs" style={{ color: '#7A6890' }}>(opcional)</span>
        </FieldLabel>
        <p className="text-xs mb-3" style={{ color: '#7A6890' }}>
          {data.type === 'service'
            ? 'Sube una muestra de tu trabajo para aumentar la confianza del comprador.'
            : 'Sube un preview de 30–60 seg para que los compradores escuchen antes de comprar.'}
        </p>
        <input ref={audioRef} type="file" accept="audio/*" className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (!f) return
            onChange('audioPreview', f.name)
          }} />

        {data.audioPreview ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.25)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
              <Music size={15} className="text-white" />
            </div>
            <span className="flex-1 text-sm text-white truncate">{data.audioPreview}</span>
            <button onClick={() => onChange('audioPreview', null)} className="text-[#7A6890] hover:text-[#FF1A8C] transition-colors">
              <X size={15} />
            </button>
          </div>
        ) : (
          <button onClick={() => audioRef.current?.click()}
            className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all hover:opacity-80"
            style={{ background: 'rgba(123,47,255,0.08)', border: '1px dashed rgba(123,47,255,0.3)', color: '#C0A8D8' }}>
            <Music size={15} />
            <span className="text-sm font-medium">Subir audio de muestra</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Step 4: Vista previa ─────────────────────────────────────────────────────
function StepPreview({ data, onPublish }: { data: FormData; onPublish: () => void }) {
  const category = (data.type === 'service' ? SERVICE_CATEGORIES : PRODUCT_CATEGORIES)
    .find(c => c.value === data.category)

  const priceLabel = data.pricingModel === 'consultar' ? 'A consultar'
    : data.pricingModel === 'hora' ? `${data.currency}${data.price}/h`
    : data.pricingModel === 'cancion' ? `${data.currency}${data.price}/canción`
    : `${data.currency}${data.price}`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white text-2xl font-black mb-1" style={{ letterSpacing: '-0.02em' }}>
          Así se verá tu oferta
        </h2>
        <p className="text-sm" style={{ color: '#7A6890' }}>
          Revisa cómo aparecerá en el marketplace antes de publicar.
        </p>
      </div>

      {/* Preview card */}
      <div className="rounded-2xl overflow-hidden max-w-sm"
        style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.25)' }}>
        {/* Cover */}
        <div className="aspect-video w-full relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#1a0035,#0A0014)' }}>
          {data.coverPreview ? (
            <img src={data.coverPreview} alt="portada" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-40">{data.type === 'service' ? '🛠️' : '📦'}</span>
            </div>
          )}
          {/* Type badge */}
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{
              background: data.type === 'service' ? 'rgba(139,63,255,0.85)' : 'rgba(255,26,140,0.85)',
              color: '#fff',
            }}>
            {data.type === 'service' ? 'Servicio' : 'Producto Digital'}
          </span>
        </div>

        <div className="p-4">
          {category && (
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#7A6890' }}>
              {category.label}
            </p>
          )}
          <h3 className="text-white font-bold text-base leading-snug mb-2">
            {data.title || 'Título de tu oferta'}
          </h3>
          {data.description && (
            <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: '#C0A8D8' }}>
              {data.description}
            </p>
          )}

          {/* Includes */}
          {data.includes.length > 0 && (
            <div className="flex flex-col gap-1 mb-3">
              {data.includes.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Check size={11} style={{ color: '#8B3FFF', flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: '#C0A8D8' }}>{item}</span>
                </div>
              ))}
              {data.includes.length > 3 && (
                <span className="text-xs" style={{ color: '#7A6890' }}>+{data.includes.length - 3} más</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid rgba(123,47,255,0.12)' }}>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#7A6890' }}>
              {data.type === 'service' && data.deliveryTime && (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {DELIVERY_TIMES.find(d => d.value === data.deliveryTime)?.label}
                </span>
              )}
              {data.type === 'service' && data.revisions && (
                <span className="flex items-center gap-1">
                  <RefreshCw size={11} />
                  {data.revisions} rev.
                </span>
              )}
              {data.type === 'product' && data.fileFormat && (
                <span className="flex items-center gap-1">📁 {data.fileFormat}</span>
              )}
              <span className="flex items-center gap-1">
                <Star size={11} className="text-yellow-400" fill="currentColor" />
                Nuevo
              </span>
            </div>
            <span className="font-black text-base" style={{ color: '#FF1A8C' }}>
              {data.price ? priceLabel : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Publish */}
      <div className="flex flex-col gap-3">
        <button onClick={onPublish}
          className="w-full py-4 rounded-2xl text-white font-black text-base tracking-tight transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
          🚀 Publicar en Mooseeka
        </button>
        <button className="text-sm text-center transition-colors hover:opacity-80" style={{ color: '#7A6890' }}>
          Guardar como borrador
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const INITIAL: FormData = {
  type: null,
  title: '', category: '', description: '',
  pricingModel: 'proyecto', price: '', currency: '€',
  deliveryTime: '', revisions: '2', includes: [],
  licenseType: '', fileFormat: '',
  coverPreview: null, audioPreview: null,
}

export default function NewServicePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(INITIAL)

  function setField(k: keyof FormData, v: string | string[] | null) {
    setData(prev => ({ ...prev, [k]: v }))
  }

  function handleTypeSelect(t: OfferType) {
    setData(prev => ({ ...prev, type: t }))
    setStep(1)
  }

  function canAdvance(): boolean {
    if (step === 1) return data.title.length >= 3 && !!data.category && data.description.length >= 10
    if (step === 2) return data.type === 'product'
      ? !!data.licenseType && !!data.price
      : (data.pricingModel === 'consultar' || !!data.price) && !!data.deliveryTime
    if (step === 3) return !!data.coverPreview
    return true
  }

  function handlePublish() {
    // TODO: save to Supabase
    router.push('/elenarios')
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/elenarios"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.2)', color: '#C0A8D8' }}>
            <ArrowLeft size={17} />
          </Link>
          <div>
            <h1 className="text-white font-black text-lg" style={{ letterSpacing: '-0.02em' }}>
              Nueva oferta
            </h1>
            <p className="text-xs" style={{ color: '#7A6890' }}>
              {data.type === 'service' ? 'Servicio' : data.type === 'product' ? 'Producto Digital' : 'Servicio o Producto Digital'}
            </p>
          </div>
        </div>

        {/* Step bar (hidden on step 0) */}
        {step > 0 && <StepBar current={step - 1} />}

        {/* Step content */}
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(14,0,28,0.7)', border: '1px solid rgba(123,47,255,0.15)' }}>
          {step === 0 && <StepTipo onSelect={handleTypeSelect} />}
          {step === 1 && <StepDetalles data={data} onChange={(k, v) => setField(k, v as string)} />}
          {step === 2 && (
            <StepPrecio
              data={data}
              onChange={(k, v) => setField(k, v as string)}
              onIncludesChange={items => setField('includes', items)}
            />
          )}
          {step === 3 && <StepPortada data={data} onChange={(k, v) => setField(k, v)} />}
          {step === 4 && <StepPreview data={data} onPublish={handlePublish} />}
        </div>

        {/* Nav buttons */}
        {step > 0 && step < 4 && (
          <div className="flex justify-between mt-4">
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-80"
              style={{ border: '1px solid rgba(123,47,255,0.3)', color: '#C0A8D8' }}>
              <ArrowLeft size={15} /> Atrás
            </button>
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }}>
              {step === 3 ? 'Ver vista previa' : 'Continuar'} <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

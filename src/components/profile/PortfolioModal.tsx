'use client'

import { useState, useRef } from 'react'
import { X, Link2, ImagePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PORTFOLIO_TYPES = [
  { id: 'single',  label: 'Single',   emoji: '🎵' },
  { id: 'ep',      label: 'EP',       emoji: '💿' },
  { id: 'album',   label: 'Álbum',    emoji: '📀' },
  { id: 'beat',    label: 'Beat',     emoji: '🎛️' },
  { id: 'remix',   label: 'Remix',    emoji: '🔀' },
  { id: 'mezcla',  label: 'Mezcla',   emoji: '🎚️' },
  { id: 'jingle',  label: 'Jingle',   emoji: '📢' },
  { id: 'otro',    label: 'Otro',     emoji: '🎶' },
]

const YEARS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString())

export interface PortfolioItem {
  id: string
  title: string
  type: string
  year: string
  role: string
  cover_url: string | null
  link: string
  description: string
}

interface PortfolioModalProps {
  open: boolean
  profileId: string
  onClose: () => void
  onSave: (item: PortfolioItem) => void
  initial?: PortfolioItem | null
}

export default function PortfolioModal({ open, profileId, onClose, onSave, initial }: PortfolioModalProps) {
  const [type,        setType]        = useState(initial?.type        ?? 'single')
  const [title,       setTitle]       = useState(initial?.title       ?? '')
  const [year,        setYear]        = useState(initial?.year        ?? '')
  const [role,        setRole]        = useState(initial?.role        ?? '')
  const [link,        setLink]        = useState(initial?.link        ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [coverPreview, setCoverPreview] = useState<string | null>(initial?.cover_url ?? null)
  const [coverFile, setCoverFile]     = useState<File | null>(null)
  const [saving, setSaving]           = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const DESC_LIMIT = 200
  const canSave = title.trim().length > 0

  function handleCoverFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setCoverPreview(URL.createObjectURL(file))
    setCoverFile(file)
  }

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      const supabase = createClient()
      let cover_url = initial?.cover_url ?? null

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${profileId}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('portfolio').upload(path, coverFile, { upsert: true })
        if (!error) {
          const { data } = supabase.storage.from('portfolio').getPublicUrl(path)
          cover_url = data.publicUrl
        }
      }

      const row = {
        profile_id:  profileId,
        title,
        type,
        year:        year || null,
        role:        role || null,
        cover_url,
        link:        link || null,
        description: description || null,
      }

      if (initial) {
        await supabase.from('portfolio_items').update(row).eq('id', initial.id)
        onSave({ id: initial.id, title, type, year, role, cover_url, link, description })
      } else {
        const { data } = await supabase.from('portfolio_items').insert(row).select().single()
        if (data) onSave({ id: data.id, title, type, year, role, cover_url, link, description })
      }

      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-lg rounded-2xl flex flex-col overflow-hidden"
        style={{ background: '#0E001C', border: '1px solid rgba(123,47,255,0.25)', maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(123,47,255,0.15)' }}>
          <h3 className="text-white font-bold text-base">
            {initial ? 'Editar trabajo' : 'Agregar al portafolio'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#7A6890' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">

          {/* Tipo */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#7A6890' }}>Tipo</label>
            <div className="flex flex-wrap gap-2">
              {PORTFOLIO_TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={type === t.id
                    ? { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.2)' }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cover */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#7A6890' }}>
              Portada <span style={{ fontWeight: 400 }}>· opcional</span>
            </label>
            <div className="flex gap-4 items-start">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-xl overflow-hidden cursor-pointer group shrink-0 flex items-center justify-center relative"
                style={{ background: 'rgba(25,0,50,0.8)', border: '1px dashed rgba(123,47,255,0.4)' }}>
                {coverPreview ? (
                  <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <ImagePlus size={22} style={{ color: '#7A6890' }} />
                    <span className="text-[10px]" style={{ color: '#7A6890' }}>Subir imagen</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <ImagePlus size={18} className="text-white" />
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverFile(f) }} />
              <p className="text-xs mt-2 leading-relaxed" style={{ color: '#7A6890' }}>
                Sube la portada del single, álbum o proyecto. Recomendado: imagen cuadrada 500×500px o mayor.
              </p>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
              Título *
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Nombre del track, álbum o proyecto..."
              className="w-full px-3 py-2.5 rounded-xl text-white placeholder-[#7A6890] text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }} />
          </div>

          {/* Año + Rol */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>Año</label>
              <select value={year} onChange={e => setYear(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl focus:outline-none appearance-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)', color: year ? '#fff' : '#7A6890' }}>
                <option value="" style={{ background: '#0E001C' }}>Año</option>
                {YEARS.map(y => <option key={y} value={y} style={{ background: '#0E001C' }}>{y}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>Mi rol</label>
              <input value={role} onChange={e => setRole(e.target.value)}
                placeholder="ej: Productor, Artista..."
                className="w-full px-3 py-2.5 rounded-xl text-white placeholder-[#7A6890] text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }} />
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
              Enlace <span style={{ fontWeight: 400 }}>· opcional</span>
            </label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}>
              <Link2 size={14} style={{ color: '#7A6890', flexShrink: 0 }} />
              <input value={link} onChange={e => setLink(e.target.value)}
                placeholder="Spotify, YouTube, SoundCloud..."
                className="flex-1 bg-transparent text-white placeholder-[#7A6890] text-sm focus:outline-none" />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
              Descripción <span style={{ fontWeight: 400 }}>· opcional</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, DESC_LIMIT))}
              placeholder="Cuéntanos sobre este trabajo, tu rol, el proceso creativo..."
              rows={3} className="w-full text-white placeholder-[#7A6890] text-sm resize-none rounded-xl px-3 py-2.5 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }} />
            <div className="flex justify-end mt-1">
              <span className="text-xs" style={{ color: description.length > DESC_LIMIT * 0.85 ? '#FF1A8C' : '#7A6890' }}>
                {description.length}/{DESC_LIMIT}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderTop: '1px solid rgba(123,47,255,0.15)' }}>
          <button onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-full transition-colors"
            style={{ color: '#7A6890' }}
            onMouseOver={e => (e.currentTarget.style.color = '#fff')}
            onMouseOut={e => (e.currentTarget.style.color = '#7A6890')}>
            Cancelar
          </button>
          <button disabled={!canSave || saving} onClick={handleSave}
            className="text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all disabled:opacity-30 gradient-magenta glow-btn hover:opacity-90">
            {saving ? 'Guardando...' : initial ? 'Guardar cambios' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

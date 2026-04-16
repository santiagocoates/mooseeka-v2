'use client'

import { useState, useRef } from 'react'
import { X, Link2, ImagePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface Post {
  id: string
  profile_id: string
  type: string
  content: string
  link: string
  image_url: string | null
  created_at: string
}

const POST_TYPES = [
  { id: 'logro',      label: 'Logro',       emoji: '🏆', desc: 'Un hito, reconocimiento o meta alcanzada' },
  { id: 'lanzamiento',label: 'Lanzamiento', emoji: '🚀', desc: 'Nuevo single, EP, álbum o beat' },
  { id: 'video',      label: 'Video',       emoji: '🎬', desc: 'Videoclip, live session o behind the scenes' },
  { id: 'busqueda',   label: 'Búsqueda',    emoji: '🔍', desc: 'Buscás músico, productor o colaborador' },
]

interface CreatePostModalProps {
  open: boolean
  profileId: string
  onClose: () => void
  onSave: (post: Post) => void
  initial?: Post | null
}

export default function CreatePostModal({ open, profileId, onClose, onSave, initial }: CreatePostModalProps) {
  const [type,        setType]        = useState(initial?.type    ?? 'logro')
  const [content,     setContent]     = useState(initial?.content ?? '')
  const [link,        setLink]        = useState(initial?.link    ?? '')
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image_url ?? null)
  const [imageFile,   setImageFile]   = useState<File | null>(null)
  const [saving,      setSaving]      = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const CONTENT_LIMIT = 400
  const canSave = content.trim().length > 0

  function handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setImagePreview(URL.createObjectURL(file))
    setImageFile(file)
  }

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      const supabase = createClient()
      let image_url = initial?.image_url ?? null

      if (imageFile) {
        const ext  = imageFile.name.split('.').pop()
        const path = `${profileId}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('posts').upload(path, imageFile, { upsert: true })
        if (!error) {
          const { data } = supabase.storage.from('posts').getPublicUrl(path)
          image_url = data.publicUrl
        }
      }

      const row = {
        profile_id: profileId,
        type,
        content: content.trim(),
        link:     link.trim() || null,
        image_url,
      }

      if (initial) {
        await supabase.from('posts').update(row).eq('id', initial.id)
        onSave({ ...initial, type, content: content.trim(), link: link.trim(), image_url })
      } else {
        const { data } = await supabase.from('posts').insert(row).select().single()
        if (data) onSave(data)
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
            {initial ? 'Editar publicación' : 'Nueva publicación'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#7A6890' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">

          {/* Tipo */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#7A6890' }}>
              Tipo de publicación
            </label>
            <div className="grid grid-cols-2 gap-2">
              {POST_TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className="flex items-start gap-2.5 p-3 rounded-xl text-left transition-all"
                  style={type === t.id
                    ? { background: 'linear-gradient(135deg,rgba(139,63,255,0.25),rgba(255,26,140,0.15))', border: '1px solid rgba(139,63,255,0.5)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(123,47,255,0.15)', color: '#C0A8D8' }}>
                  <span className="text-lg shrink-0">{t.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{t.label}</p>
                    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: '#7A6890' }}>{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contenido */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
              Contenido *
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value.slice(0, CONTENT_LIMIT))}
              placeholder={
                type === 'logro'       ? 'Contá tu logro, ¿qué conseguiste?' :
                type === 'lanzamiento' ? '¿Qué estás lanzando? Contale a la comunidad...' :
                type === 'video'       ? 'Describí el video, dónde fue filmado, de qué trata...' :
                                         '¿A quién estás buscando? Describí el perfil ideal...'
              }
              rows={4}
              className="w-full text-white placeholder-[#7A6890] text-sm resize-none rounded-xl px-3 py-2.5 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs" style={{ color: content.length > CONTENT_LIMIT * 0.85 ? '#FF1A8C' : '#7A6890' }}>
                {content.length}/{CONTENT_LIMIT}
              </span>
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
              Imagen <span style={{ fontWeight: 400 }}>· opcional</span>
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden" style={{ maxHeight: 200 }}>
                <img src={imagePreview} alt="preview" className="w-full object-cover rounded-xl" style={{ maxHeight: 200 }} />
                <button
                  onClick={() => { setImagePreview(null); setImageFile(null) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.7)' }}>
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(123,47,255,0.3)' }}>
                <ImagePlus size={18} style={{ color: '#7A6890' }} />
                <span className="text-sm" style={{ color: '#7A6890' }}>Subir imagen</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }} />
          </div>

          {/* Link */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
              Enlace <span style={{ fontWeight: 400 }}>· opcional</span>
            </label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}>
              <Link2 size={14} style={{ color: '#7A6890', flexShrink: 0 }} />
              <input
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="Spotify, YouTube, SoundCloud..."
                className="flex-1 bg-transparent text-white placeholder-[#7A6890] text-sm focus:outline-none"
              />
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
            {saving ? 'Publicando...' : initial ? 'Guardar cambios' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}

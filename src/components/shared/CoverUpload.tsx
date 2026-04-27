'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, Loader2 } from 'lucide-react'

interface CoverUploadProps {
  value: string        // URL actual
  onChange: (url: string) => void
}

export default function CoverUpload({ value, onChange }: CoverUploadProps) {
  const inputRef            = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes'); return }
    if (file.size > 5 * 1024 * 1024)    { setError('La imagen no puede superar 5 MB'); return }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(path)

      onChange(publicUrl)
    } catch (err: unknown) {
      console.error(err)
      setError('Error subiendo la imagen. Intentá de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {value ? (
        /* Preview con botón para cambiar */
        <div className="relative w-full h-48 rounded-xl overflow-hidden group">
          <img src={value} alt="Portada" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            <button type="button" onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white font-bold text-sm transition-all"
              style={{ background: 'rgba(139,63,255,0.8)', border: '1px solid rgba(139,63,255,0.5)' }}>
              <ImagePlus size={15} /> Cambiar
            </button>
            <button type="button" onClick={() => onChange('')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white font-bold text-sm transition-all"
              style={{ background: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.4)' }}>
              <X size={15} /> Quitar
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <Loader2 size={28} className="animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        /* Área de upload */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          disabled={uploading}
          className="w-full h-40 rounded-xl flex flex-col items-center justify-center gap-3 transition-all hover:opacity-80 disabled:opacity-50"
          style={{ background: 'rgba(139,63,255,0.06)', border: '2px dashed rgba(139,63,255,0.35)' }}>
          {uploading ? (
            <Loader2 size={28} className="animate-spin" style={{ color: '#8B3FFF' }} />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(139,63,255,0.15)' }}>
                <ImagePlus size={22} style={{ color: '#8B3FFF' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Subir imagen de portada</p>
                <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>
                  PNG, JPG o WebP · máx. 5 MB
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Plus, Trash2, Loader2, GripVertical } from 'lucide-react'
import CoverUpload from '@/components/shared/CoverUpload'

interface ItemForm {
  title: string
  type: 'video' | 'audio' | 'file'
  url: string
  is_preview: boolean
  duration_seconds: string
}

const TYPES = [
  { id: 'course',      label: 'Curso'       },
  { id: 'beat',        label: 'Beat'        },
  { id: 'sample_pack', label: 'Sample Pack' },
  { id: 'preset_pack', label: 'Preset Pack' },
]

export default function NewProductPage() {
  const router = useRouter()

  // Campos del producto
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [type,        setType]        = useState('course')
  const [price,       setPrice]       = useState('')
  const [coverUrl,    setCoverUrl]    = useState('')
  const [published,   setPublished]   = useState(false)

  function toSlug(text: string) {
    return text.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim()
      .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60)
  }

  // Items (clases/archivos)
  const [items,  setItems]  = useState<ItemForm[]>([])
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  function addItem() {
    setItems(prev => [...prev, {
      title: '', type: 'video', url: '', is_preview: false, duration_seconds: ''
    }])
  }

  function updateItem(idx: number, patch: Partial<ItemForm>) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, ...patch } : item))
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !price) { setError('Título y precio son obligatorios'); return }

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError('No autenticado'); setSaving(false); return }

      // Insertar producto
      const { data: product, error: prodError } = await supabase
        .from('products')
        .insert({
          seller_id:   session.user.id,
          title:       title.trim(),
          description: description.trim() || null,
          type,
          price_usd:   parseFloat(price),
          cover_url:   coverUrl.trim() || null,
          slug:        toSlug(title.trim()) || null,
          published,
        })
        .select('id')
        .single()

      if (prodError || !product) throw prodError ?? new Error('Error creando producto')

      // Insertar items
      if (items.length > 0) {
        const validItems = items.filter(i => i.title.trim() && i.url.trim())
        if (validItems.length > 0) {
          const { error: itemsError } = await supabase.from('product_items').insert(
            validItems.map((item, idx) => ({
              product_id:       product.id,
              title:            item.title.trim(),
              type:             item.type,
              url:              item.url.trim(),
              is_preview:       item.is_preview,
              order_index:      idx,
              duration_seconds: item.duration_seconds ? parseInt(item.duration_seconds) : null,
            }))
          )
          if (itemsError) throw itemsError
        }
      }

      router.push('/admin/products')
    } catch (err: unknown) {
      console.error(err)
      setError('Error guardando el producto. Revisá los datos.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm mb-4 hover:opacity-70 transition-opacity"
          style={{ color: '#C0A8D8' }}>
          <ChevronLeft size={15} /> Volver a productos
        </Link>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
          Nuevo producto
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Tipo de producto</label>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(t => (
              <button key={t.id} type="button" onClick={() => setType(t.id)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={type === t.id
                  ? { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.25)' }
                }>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Título *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required
            placeholder="Ej: Curso de Producción Musical desde Cero"
            className="w-full text-white placeholder-[#7A6890] px-4 py-3 rounded-xl text-sm focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.55)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')} />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            placeholder="Describí qué aprenderán o qué incluye el producto..."
            className="w-full text-white placeholder-[#7A6890] px-4 py-3 rounded-xl text-sm focus:outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.55)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')} />
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Precio (USD) *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold">$</span>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0.01" step="0.01"
              placeholder="99.00"
              className="w-full text-white placeholder-[#7A6890] pl-8 pr-4 py-3 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.55)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')} />
          </div>
        </div>

        {/* Cover image upload */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Imagen de portada</label>
          <CoverUpload value={coverUrl} onChange={setCoverUrl} />
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'rgba(123,47,255,0.15)' }} />

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-white">
              {type === 'course' ? 'Clases / videos' : 'Archivos del producto'}
            </label>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={{ background: 'rgba(139,63,255,0.15)', color: '#8B3FFF', border: '1px solid rgba(139,63,255,0.3)' }}>
              <Plus size={13} /> Agregar
            </button>
          </div>

          {items.length === 0 && (
            <p className="text-sm text-center py-6 rounded-xl"
              style={{ color: '#7A6890', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(123,47,255,0.2)' }}>
              {type === 'course'
                ? 'Agregá las clases del curso (URLs de YouTube o Vimeo)'
                : 'Agregá los archivos del producto'}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(123,47,255,0.18)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical size={14} style={{ color: '#7A6890' }} />
                  <span className="text-xs font-mono font-bold" style={{ color: '#7A6890' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex gap-1.5 ml-auto">
                    {(['video', 'audio', 'file'] as const).map(t => (
                      <button key={t} type="button" onClick={() => updateItem(idx, { type: t })}
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-all"
                        style={item.type === t
                          ? { background: 'rgba(139,63,255,0.3)', color: '#C0A8D8' }
                          : { background: 'transparent', color: '#7A6890' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => removeItem(idx)}
                    className="p-1 rounded-lg hover:bg-red-500/10 transition-all" style={{ color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <input value={item.title} onChange={e => updateItem(idx, { title: e.target.value })}
                    placeholder={type === 'course' ? 'Título de la clase' : 'Nombre del archivo'}
                    className="w-full text-white placeholder-[#7A6890] px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.2)' }} />

                  <input value={item.url} onChange={e => updateItem(idx, { url: e.target.value })}
                    placeholder={item.type === 'video'
                      ? 'URL de YouTube o Vimeo'
                      : 'URL del archivo (Supabase Storage, Drive, etc.)'}
                    className="w-full text-white placeholder-[#7A6890] px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.2)' }} />

                  <div className="flex gap-3">
                    {item.type === 'video' && (
                      <input type="number" value={item.duration_seconds}
                        onChange={e => updateItem(idx, { duration_seconds: e.target.value })}
                        placeholder="Duración (segundos)"
                        className="flex-1 text-white placeholder-[#7A6890] px-3 py-2 rounded-lg text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.2)' }} />
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={item.is_preview}
                        onChange={e => updateItem(idx, { is_preview: e.target.checked })}
                        className="w-4 h-4 rounded accent-purple-500" />
                      <span className="text-xs" style={{ color: '#C0A8D8' }}>Vista previa gratis</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publicar */}
        <div className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(123,47,255,0.18)' }}>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Publicar inmediatamente</p>
            <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>
              Si está apagado, se guarda como borrador y no aparece en el market.
            </p>
          </div>
          <button type="button" onClick={() => setPublished(!published)}
            className="relative w-11 h-6 rounded-full transition-all shrink-0"
            style={{ background: published ? 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' : 'rgba(255,255,255,0.1)' }}>
            <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
              style={{ left: published ? '24px' : '4px' }} />
          </button>
        </div>

        {error && (
          <p className="text-sm font-medium px-4 py-3 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Link href="/admin/products"
            className="flex-1 py-3 rounded-full text-center font-bold text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.2)' }}>
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 gradient-magenta glow-btn">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? 'Guardando...' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import {
  Briefcase, Headphones, Package, BookOpen, X,
  ChevronRight, ArrowLeft, DollarSign, Clock, Tag,
  Play, Upload, FileAudio, ExternalLink, Trash2,
  ImageIcon, Music, Video, Send
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────── */
const POST_TYPES = [
  { id: 'work',    icon: Briefcase,  label: 'Trabajo',  description: 'Comparte un proyecto completado o en progreso', color: '#8B3FFF', bg: 'rgba(139,63,255,0.12)', border: 'rgba(139,63,255,0.35)' },
  { id: 'service', icon: Headphones, label: 'Servicio', description: 'Anuncia un nuevo servicio en el marketplace',   color: '#FF1A8C', bg: 'rgba(255,26,140,0.12)', border: 'rgba(255,26,140,0.35)' },
  { id: 'product', icon: Package,    label: 'Producto', description: 'Vende samples, presets, beats o merch',         color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.35)'  },
  { id: 'course',  icon: BookOpen,   label: 'Curso',    description: 'Comparte conocimiento y enseña a otros',        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
]

const SERVICE_CATEGORIES = [
  'Producción musical','Mixing','Mastering','Composición',
  'Grabación','Diseño gráfico','Video / Clip','Marketing',
  'Management','Legal','Educación','Otro',
]

const CHAR_LIMIT = 500

/* ── Link helpers ─────────────────────────────────── */
function getYouTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}
function getSpotifyEmbed(url: string) {
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/)
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null
}
function detectLinkType(url: string): 'youtube' | 'spotify' | 'other' | null {
  if (!url) return null
  if (url.includes('youtu')) return 'youtube'
  if (url.includes('spotify.com')) return 'spotify'
  if (url.startsWith('http')) return 'other'
  return null
}

interface MediaState {
  type: 'youtube' | 'spotify' | 'audio' | 'image' | 'link' | null
  url: string
  youtubeId?: string
  spotifyEmbed?: string
  audioUrl?: string
  imageUrl?: string
  fileName?: string
  autoDetected?: boolean
}

function extractFirstUrl(text: string): string | null {
  const m = text.match(/(https?:\/\/[^\s]+)/)
  return m ? m[1].replace(/[.,;!?)]+$/, '') : null
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

function autoDetectMedia(url: string): MediaState | null {
  const type = detectLinkType(url)
  if (type === 'youtube') {
    const id = getYouTubeId(url)
    if (id) return { type: 'youtube', url, youtubeId: id, autoDetected: true }
  } else if (type === 'spotify') {
    const embed = getSpotifyEmbed(url)
    if (embed) return { type: 'spotify', url, spotifyEmbed: embed, autoDetected: true }
  } else if (type === 'other') {
    return { type: 'link', url, autoDetected: true }
  }
  return null
}

/* ── MediaPreview ─────────────────────────────────── */
function MediaPreview({ media, onRemove }: { media: MediaState; onRemove: () => void }) {
  if (!media.type) return null
  return (
    <div className="relative rounded-xl overflow-hidden mt-3" style={{ border: '1px solid rgba(123,47,255,0.25)' }}>
      <button onClick={onRemove}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.75)', color: '#fff' }}>
        <Trash2 size={13} />
      </button>

      {media.type === 'youtube' && media.youtubeId && (
        <div style={{ background: '#000' }}>
          <div className="relative">
            <img src={`https://img.youtube.com/vi/${media.youtubeId}/hqdefault.jpg`}
              alt="YouTube" className="w-full h-40 object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,0,0,0.9)' }}>
                <Play size={22} fill="white" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-400">YouTube</span>
                <span className="text-white text-xs truncate opacity-80">{media.url}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {media.type === 'spotify' && media.spotifyEmbed && (
        <iframe src={media.spotifyEmbed} width="100%" height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy" className="block" style={{ borderRadius: '12px' }} />
      )}

      {media.type === 'audio' && (
        <div className="flex items-center gap-3 p-3" style={{ background: 'rgba(139,63,255,0.1)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 gradient-magenta">
            <FileAudio size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{media.fileName}</p>
            <audio controls src={media.audioUrl} className="mt-1.5 w-full h-8" style={{ accentColor: '#FF1A8C' }} />
          </div>
        </div>
      )}

      {media.type === 'image' && media.imageUrl && (
        <img src={media.imageUrl} alt="preview" className="w-full max-h-64 object-cover" />
      )}

      {media.type === 'link' && (
        <a href={media.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${getDomain(media.url)}&sz=32`}
            alt="" className="w-6 h-6 rounded shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: '#C0A8D8' }}>{getDomain(media.url)}</p>
            <p className="text-xs truncate mt-0.5" style={{ color: '#7A6890' }}>{media.url}</p>
          </div>
          <ExternalLink size={13} style={{ color: '#7A6890' }} />
        </a>
      )}
    </div>
  )
}

/* ── LinkInput ────────────────────────────────────── */
function LinkInput({ onAdd }: { onAdd: (m: MediaState) => void }) {
  const [val, setVal] = useState('')
  const [error, setError] = useState('')

  function handleAdd() {
    const t = detectLinkType(val.trim())
    if (!t) { setError('Pega un enlace válido'); return }
    if (t === 'youtube') {
      const id = getYouTubeId(val.trim())
      if (!id) { setError('No se pudo leer el video de YouTube'); return }
      onAdd({ type: 'youtube', url: val.trim(), youtubeId: id })
    } else if (t === 'spotify') {
      const embed = getSpotifyEmbed(val.trim())
      if (!embed) { setError('No se pudo leer el enlace de Spotify'); return }
      onAdd({ type: 'spotify', url: val.trim(), spotifyEmbed: embed })
    } else {
      onAdd({ type: 'link', url: val.trim() })
    }
    setVal(''); setError('')
  }

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(123,47,255,0.15)' }}>
      <div className="flex gap-2">
        <input value={val} onChange={e => { setVal(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Pega un enlace de YouTube, Spotify o cualquier URL..."
          className="flex-1 text-sm bg-transparent text-white placeholder-[#7A6890] focus:outline-none px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? '#FF1A8C' : 'rgba(123,47,255,0.25)'}` }} />
        <button onClick={handleAdd}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white shrink-0 gradient-magenta hover:opacity-90 transition-all">
          Agregar
        </button>
      </div>
      {error && <p className="text-xs mt-1" style={{ color: '#FF1A8C' }}>{error}</p>}
      <p className="text-xs mt-1.5" style={{ color: '#7A6890' }}>
        Compatible con <span style={{ color: '#ff4444' }}>YouTube</span>, <span style={{ color: '#1DB954' }}>Spotify</span> y cualquier URL
      </p>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────── */
export default function CreatePost() {
  // Inline composer state
  const [inlineOpen, setInlineOpen]   = useState(false)
  const [inlineText, setInlineText]   = useState('')
  const [inlineMedia, setInlineMedia] = useState<MediaState>({ type: null, url: '' })
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [inlineDismissed, setInlineDismissed] = useState<string | null>(null)

  // Full modal state
  const [modalOpen, setModalOpen]     = useState(false)
  const [step, setStep]               = useState<'type' | 'form'>('type')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [content, setContent]         = useState('')
  const [media, setMedia]             = useState<MediaState>({ type: null, url: '' })
  const [mediaTab, setMediaTab]       = useState<'link' | null>(null)
  const [modalDismissed, setModalDismissed] = useState<string | null>(null)

  // Service / product / course fields
  const [svcTitle, setSvcTitle] = useState(''); const [svcCat, setSvcCat] = useState('')
  const [svcPrice, setSvcPrice] = useState(''); const [svcDays, setSvcDays] = useState('')
  const [prdTitle, setPrdTitle] = useState(''); const [prdPrice, setPrdPrice] = useState('')
  const [crsTitle, setCrsTitle] = useState(''); const [crsDur, setCrsDur] = useState(''); const [crsPrx, setCrsPrx] = useState('')

  const audioRef  = useRef<HTMLInputElement>(null)
  const imageRef  = useRef<HTMLInputElement>(null)
  const iaudioRef = useRef<HTMLInputElement>(null)
  const iimageRef = useRef<HTMLInputElement>(null)

  const modalType = POST_TYPES.find(t => t.id === selectedType)

  function openModal(t: string | null) {
    setSelectedType(t); setStep(t ? 'form' : 'type'); setModalOpen(true)
  }
  function closeModal() {
    setModalOpen(false)
    setTimeout(() => {
      setStep('type'); setSelectedType(null); setContent(''); setMedia({ type: null, url: '' }); setMediaTab(null)
      setModalDismissed(null)
      setSvcTitle(''); setSvcCat(''); setSvcPrice(''); setSvcDays('')
      setPrdTitle(''); setPrdPrice(''); setCrsTitle(''); setCrsDur(''); setCrsPrx('')
    }, 200)
  }
  function closeInline() {
    setInlineOpen(false); setInlineText(''); setInlineMedia({ type: null, url: '' })
    setShowLinkInput(false); setInlineDismissed(null)
  }

  function handleInlineTextChange(text: string) {
    if (inlineMedia.type && !inlineMedia.autoDetected) { setInlineText(text); return }
    const url = extractFirstUrl(text)
    if (url && url !== inlineDismissed) {
      const detected = autoDetectMedia(url)
      if (detected) {
        setInlineText(text.replace(url, '').replace(/\s+/g, ' ').trim())
        setInlineMedia(detected); setShowLinkInput(false); return
      }
    }
    setInlineText(text)
    if (inlineMedia.autoDetected) setInlineMedia({ type: null, url: '' })
  }

  function handleModalTextChange(text: string) {
    if (media.type && !media.autoDetected) { setContent(text); return }
    const url = extractFirstUrl(text)
    if (url && url !== modalDismissed) {
      const detected = autoDetectMedia(url)
      if (detected) {
        setContent(text.replace(url, '').replace(/\s+/g, ' ').trim())
        setMedia(detected); setMediaTab(null); return
      }
    }
    setContent(text)
    if (media.autoDetected) setMedia({ type: null, url: '' })
  }

  function handleInlineAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const url = URL.createObjectURL(f)
    setInlineMedia({ type: 'audio', url, audioUrl: url, fileName: f.name })
    setShowLinkInput(false)
  }
  function handleInlineImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const url = URL.createObjectURL(f)
    setInlineMedia({ type: 'image', url, imageUrl: url, fileName: f.name })
    setShowLinkInput(false)
  }
  function handleModalAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const url = URL.createObjectURL(f)
    setMedia({ type: 'audio', url, audioUrl: url, fileName: f.name }); setMediaTab(null)
  }
  function handleModalImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const url = URL.createObjectURL(f)
    setMedia({ type: 'image', url, imageUrl: url, fileName: f.name }); setMediaTab(null)
  }

  return (
    <>
      {/* ════════════════════════════════════════════
          INLINE COMPOSER (estilo de la imagen)
      ════════════════════════════════════════════ */}
      <div className="rounded-2xl overflow-hidden card-shadow"
        style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>

        {/* Textarea area */}
        <div className="p-4">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold gradient-magenta mt-0.5">
              TU
            </div>
            <textarea
              value={inlineText}
              onChange={e => handleInlineTextChange(e.target.value.slice(0, CHAR_LIMIT))}
              onFocus={() => setInlineOpen(true)}
              placeholder="Escribe tu publicación, comparte un enlace o menciona usuarios con @username..."
              rows={inlineOpen ? 4 : 2}
              className="flex-1 bg-transparent text-white placeholder-[#7A6890] resize-none focus:outline-none text-sm leading-relaxed transition-all"
              style={{ minHeight: inlineOpen ? '96px' : '44px' }}
            />
          </div>

          {/* Media preview dentro del composer */}
          {inlineMedia.type && (
            <div className="ml-12">
              <MediaPreview media={inlineMedia} onRemove={() => {
                if (inlineMedia.autoDetected) setInlineDismissed(inlineMedia.url)
                setInlineMedia({ type: null, url: '' }); setShowLinkInput(false)
              }} />
            </div>
          )}

          {/* Link input inline */}
          {showLinkInput && !inlineMedia.type && (
            <div className="ml-12">
              <LinkInput onAdd={m => { setInlineMedia(m); setShowLinkInput(false) }} />
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(123,47,255,0.15)' }} />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Media icons */}
          <div className="flex items-center gap-1">
            <ToolbarIcon icon={ImageIcon} label="Imagen"   color="#8B3FFF" onClick={() => iimageRef.current?.click()} />
            <ToolbarIcon icon={Music}     label="Audio"    color="#FF1A8C" onClick={() => iaudioRef.current?.click()} />
            <ToolbarIcon icon={Video}     label="Video / Link" color="#06b6d4"
              onClick={() => { setInlineOpen(true); setShowLinkInput(v => !v) }}
              active={showLinkInput} />
            <input ref={iaudioRef} type="file" accept="audio/*" className="hidden" onChange={handleInlineAudio} />
            <input ref={iimageRef} type="file" accept="image/*" className="hidden" onChange={handleInlineImage} />
          </div>

          {/* Actions */}
          {inlineOpen ? (
            <div className="flex items-center gap-2">
              <button onClick={closeInline}
                className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
                style={{ color: '#7A6890' }}>
                Cancelar
              </button>
              <button
                disabled={!inlineText.trim()}
                onClick={closeInline}
                className="flex items-center gap-2 text-white font-bold px-5 py-1.5 rounded-full text-sm gradient-magenta glow-btn hover:opacity-90 transition-all disabled:opacity-30">
                <Send size={14} />
                Publicar
              </button>
            </div>
          ) : (
            /* Tipos de post — visible cuando está colapsado */
            <div className="flex items-center gap-1">
              {POST_TYPES.map(({ id, icon: Icon, label, color, bg }) => (
                <button key={id} onClick={() => openModal(id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all hover:bg-white/8"
                  style={{ background: bg, color }}>
                  <Icon size={12} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          MODAL COMPLETO (tipos con campos extra)
      ════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>

          <div className="w-full max-w-lg rounded-2xl flex flex-col overflow-hidden"
            style={{ background: '#0E001C', border: '1px solid rgba(123,47,255,0.25)', maxHeight: '92vh' }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(123,47,255,0.15)' }}>
              {step === 'form' && (
                <button onClick={() => setStep('type')}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#7A6890' }}>
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className="flex-1">
                <h3 className="text-white font-bold text-base">
                  {step === 'type' ? 'Crear publicación' : `Nueva publicación · ${modalType?.label}`}
                </h3>
                {step === 'form' && modalType && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: modalType.color }} />
                    <span className="text-xs" style={{ color: '#7A6890' }}>{modalType.description}</span>
                  </div>
                )}
              </div>
              <button onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#7A6890' }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5">

              {/* Paso 1 — elegir tipo */}
              {step === 'type' && (
                <div className="flex flex-col gap-2">
                  {POST_TYPES.map(({ id, icon: Icon, label, description, color, bg, border }) => (
                    <button key={id} onClick={() => { setSelectedType(id); setStep('form') }}
                      className="flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                      style={{ background: bg, border: '1px solid transparent' }}
                      onMouseOver={e => (e.currentTarget.style.border = `1px solid ${border}`)}
                      onMouseOut={e => (e.currentTarget.style.border = '1px solid transparent')}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${color}22`, border: `1px solid ${color}40` }}>
                        <Icon size={20} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>{description}</p>
                      </div>
                      <ChevronRight size={16} style={{ color: '#7A6890' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Paso 2 — composer con campos */}
              {step === 'form' && modalType && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold gradient-magenta">TU</div>
                    <div>
                      <p className="text-white text-sm font-semibold">Tu nombre</p>
                      <p className="text-xs" style={{ color: '#7A6890' }}>Publicando como tú</p>
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(123,47,255,0.2)' }}>
                    <textarea value={content} onChange={e => handleModalTextChange(e.target.value.slice(0, CHAR_LIMIT))}
                      placeholder={
                        selectedType === 'work'    ? 'Describe lo que trabajaste, las herramientas que usaste...' :
                        selectedType === 'service' ? 'Describe tu servicio, qué incluye, por qué contratar contigo...' :
                        selectedType === 'product' ? 'Describe tu producto, formato, compatibilidad...' :
                                                     'Describe el curso, a quién va dirigido, qué van a aprender...'
                      }
                      rows={4} className="w-full bg-transparent text-white placeholder-[#7A6890] resize-none focus:outline-none text-sm leading-relaxed" />

                    {media.type && (
                      <MediaPreview media={media} onRemove={() => {
                        if (media.autoDetected) setModalDismissed(media.url)
                        setMedia({ type: null, url: '' }); setMediaTab(null)
                      }} />
                    )}
                    {mediaTab === 'link' && !media.type && (
                      <LinkInput onAdd={m => { setMedia(m); setMediaTab(null) }} />
                    )}
                    <div className="flex justify-end mt-2">
                      <span className="text-xs" style={{ color: content.length > CHAR_LIMIT * 0.85 ? '#FF1A8C' : '#7A6890' }}>
                        {content.length}/{CHAR_LIMIT}
                      </span>
                    </div>
                  </div>

                  {/* Media toolbar */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7A6890' }}>Adjuntar</p>
                    <div className="flex gap-2 flex-wrap">
                      <MediaToolBtn icon={Music}     label="Audio"              color="#FF1A8C" active={media.type === 'audio'}   disabled={!!media.type && media.type !== 'audio'}   onClick={() => audioRef.current?.click()} />
                      <MediaToolBtn icon={ImageIcon}  label="Imagen"             color="#8B3FFF" active={media.type === 'image'}   disabled={!!media.type && media.type !== 'image'}   onClick={() => imageRef.current?.click()} />
                      <MediaToolBtn icon={Video}      label="YouTube / Spotify"  color="#06b6d4" active={mediaTab === 'link' || media.type === 'youtube' || media.type === 'spotify' || media.type === 'link'}
                        disabled={!!media.type && media.type !== 'youtube' && media.type !== 'spotify' && media.type !== 'link'}
                        onClick={() => setMediaTab(p => p === 'link' ? null : 'link')} />
                    </div>
                    <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={handleModalAudio} />
                    <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleModalImage} />
                  </div>

                  {/* Campos específicos por tipo */}
                  {selectedType === 'service' && (
                    <div className="flex flex-col gap-3 pt-1" style={{ borderTop: '1px solid rgba(123,47,255,0.12)' }}>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7A6890' }}>Detalles del servicio</p>
                      <SmallField icon={Tag} placeholder="Título del servicio" value={svcTitle} onChange={setSvcTitle} />
                      <div className="flex flex-wrap gap-1.5">
                        {SERVICE_CATEGORIES.map(cat => (
                          <button key={cat} onClick={() => setSvcCat(cat)}
                            className="text-xs px-3 py-1 rounded-full font-medium transition-all"
                            style={svcCat === cat
                              ? { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }
                              : { background: 'rgba(255,255,255,0.05)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.2)' }}>
                            {cat}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <SmallField icon={DollarSign} placeholder="Precio (ej: €60)" value={svcPrice} onChange={setSvcPrice} />
                        <SmallField icon={Clock} placeholder="Entrega (ej: 3 días)" value={svcDays} onChange={setSvcDays} />
                      </div>
                    </div>
                  )}
                  {selectedType === 'product' && (
                    <div className="flex flex-col gap-3 pt-1" style={{ borderTop: '1px solid rgba(123,47,255,0.12)' }}>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7A6890' }}>Detalles del producto</p>
                      <SmallField icon={Tag} placeholder="Nombre del producto" value={prdTitle} onChange={setPrdTitle} />
                      <SmallField icon={DollarSign} placeholder="Precio" value={prdPrice} onChange={setPrdPrice} />
                    </div>
                  )}
                  {selectedType === 'course' && (
                    <div className="flex flex-col gap-3 pt-1" style={{ borderTop: '1px solid rgba(123,47,255,0.12)' }}>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7A6890' }}>Detalles del curso</p>
                      <SmallField icon={Tag} placeholder="Título del curso" value={crsTitle} onChange={setCrsTitle} />
                      <div className="flex gap-3">
                        <SmallField icon={Clock} placeholder="Duración" value={crsDur} onChange={setCrsDur} />
                        <SmallField icon={DollarSign} placeholder="Precio" value={crsPrx} onChange={setCrsPrx} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {step === 'form' && (
              <div className="px-5 py-4 flex items-center justify-between shrink-0"
                style={{ borderTop: '1px solid rgba(123,47,255,0.15)' }}>
                <div className="flex items-center gap-2">
                  {media.type && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(139,63,255,0.15)', color: '#A855F7', border: '1px solid rgba(139,63,255,0.3)' }}>
                      {media.type === 'youtube' ? '▶ YouTube' : media.type === 'spotify' ? '🎵 Spotify' : media.type === 'audio' ? '🎙 Audio' : media.type === 'image' ? '🖼 Imagen' : '🔗 Enlace'}
                    </span>
                  )}
                  <p className="text-xs" style={{ color: '#7A6890' }}>{media.type ? 'adjunto' : 'sin adjunto'}</p>
                </div>
                <button disabled={!content.trim()} onClick={closeModal}
                  className="flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-full text-sm gradient-magenta glow-btn hover:opacity-90 transition-all disabled:opacity-30">
                  <Send size={14} />
                  Publicar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* ── Helpers ────────────────────────────────────── */
function ToolbarIcon({ icon: Icon, label, color, onClick, active }: {
  icon: React.ElementType; label: string; color: string; onClick: () => void; active?: boolean
}) {
  return (
    <button onClick={onClick} title={label}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/8"
      style={active ? { background: `${color}20`, color } : { color: '#7A6890' }}>
      <Icon size={18} />
    </button>
  )
}

function MediaToolBtn({ icon: Icon, label, color, active, disabled, onClick }: {
  icon: React.ElementType; label: string; color: string; active: boolean; disabled: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-30"
      style={active
        ? { background: `${color}20`, color, border: `1px solid ${color}60` }
        : { background: 'rgba(255,255,255,0.04)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.18)' }}>
      <Icon size={14} />
      {label}
    </button>
  )
}

function SmallField({ icon: Icon, placeholder, value, onChange }: {
  icon: React.ElementType; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}>
      <Icon size={14} style={{ color: '#7A6890' }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent text-white placeholder-[#7A6890] text-sm focus:outline-none min-w-0" />
    </div>
  )
}

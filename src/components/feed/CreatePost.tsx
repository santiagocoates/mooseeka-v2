'use client'

import { useState, useRef, useEffect } from 'react'
import {
  X, ChevronRight, ArrowLeft, Play,
  Upload, FileAudio, ExternalLink, Trash2,
  ImageIcon, Music, Video, Send, Link2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { PostData } from './PostCard'

const POST_TYPES = [
  { id: 'lanzamiento', label: 'Lanzamiento', emoji: '🚀', desc: 'Nuevo single, EP, álbum o beat',         color: '#8B3FFF', bg: 'rgba(139,63,255,0.12)', border: 'rgba(139,63,255,0.35)' },
  { id: 'logro',       label: 'Logro',       emoji: '🏆', desc: 'Un hito, reconocimiento o meta',          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)'  },
  { id: 'video',       label: 'Video',       emoji: '🎬', desc: 'Videoclip, live session o BTS',           color: '#FF1A8C', bg: 'rgba(255,26,140,0.12)',  border: 'rgba(255,26,140,0.35)'  },
  { id: 'busqueda',    label: 'Búsqueda',    emoji: '🔍', desc: 'Buscas músico, productor o colaborador',  color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.35)'   },
]

const CHAR_LIMIT = 500

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
function extractFirstUrl(text: string): string | null {
  const m = text.match(/(https?:\/\/[^\s]+)/)
  return m ? m[1].replace(/[.,;!?)]+$/, '') : null
}
function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

interface MediaState {
  type: 'youtube' | 'spotify' | 'audio' | 'image' | 'link' | null
  url: string
  youtubeId?: string
  spotifyEmbed?: string
  audioUrl?: string
  audioFile?: File
  imageUrl?: string
  imageFile?: File
  fileName?: string
  autoDetected?: boolean
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'ahora'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h`
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
              <span className="text-xs font-bold text-red-400">YouTube</span>
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
          <img src={`https://www.google.com/s2/favicons?domain=${getDomain(media.url)}&sz=32`}
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
interface CreatePostProps {
  onPost?: (post: PostData) => void
}

export default function CreatePost({ onPost }: CreatePostProps) {
  const currentUser = useCurrentUser()

  // Inline composer
  const [inlineOpen,     setInlineOpen]     = useState(false)
  const [inlineText,     setInlineText]     = useState('')
  const [inlineMedia,    setInlineMedia]    = useState<MediaState>({ type: null, url: '' })
  const [inlineType,     setInlineType]     = useState('lanzamiento')
  const [showLinkInput,  setShowLinkInput]  = useState(false)
  const [inlineDismissed, setInlineDismissed] = useState<string | null>(null)
  const [publishing,     setPublishing]     = useState(false)
  const [error,          setError]          = useState<string | null>(null)

  // Full modal
  const [modalOpen,      setModalOpen]      = useState(false)
  const [step,           setStep]           = useState<'type' | 'form'>('type')
  const [selectedType,   setSelectedType]   = useState<string | null>(null)
  const [content,        setContent]        = useState('')
  const [media,          setMedia]          = useState<MediaState>({ type: null, url: '' })
  const [mediaTab,       setMediaTab]       = useState<'link' | null>(null)
  const [modalDismissed, setModalDismissed] = useState<string | null>(null)
  const [modalPublishing, setModalPublishing] = useState(false)
  const [modalError,     setModalError]     = useState<string | null>(null)

  const iaudioRef = useRef<HTMLInputElement>(null)
  const iimageRef = useRef<HTMLInputElement>(null)
  const audioRef  = useRef<HTMLInputElement>(null)
  const imageRef  = useRef<HTMLInputElement>(null)

  const modalType = POST_TYPES.find(t => t.id === selectedType)

  function openModal(t: string | null) {
    setSelectedType(t); setStep(t ? 'form' : 'type'); setModalOpen(true)
  }
  function closeModal() {
    setModalOpen(false)
    setTimeout(() => {
      setStep('type'); setSelectedType(null); setContent('')
      setMedia({ type: null, url: '' }); setMediaTab(null)
      setModalDismissed(null); setModalError(null)
    }, 200)
  }
  function closeInline() {
    setInlineOpen(false); setInlineText(''); setInlineMedia({ type: null, url: '' })
    setShowLinkInput(false); setInlineDismissed(null); setError(null)
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

  function handleInlineImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setInlineMedia({ type: 'image', url: '', imageUrl: URL.createObjectURL(f), imageFile: f, fileName: f.name })
    setShowLinkInput(false)
  }
  function handleInlineAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setInlineMedia({ type: 'audio', url: '', audioUrl: URL.createObjectURL(f), audioFile: f, fileName: f.name })
    setShowLinkInput(false)
  }
  function handleModalImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setMedia({ type: 'image', url: '', imageUrl: URL.createObjectURL(f), imageFile: f, fileName: f.name }); setMediaTab(null)
  }
  function handleModalAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setMedia({ type: 'audio', url: '', audioUrl: URL.createObjectURL(f), audioFile: f, fileName: f.name }); setMediaTab(null)
  }

  async function uploadImageFile(file: File, profileId: string): Promise<string | null> {
    const supabase = createClient()
    const ext  = file.name.split('.').pop()
    const path = `${profileId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('posts').upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('posts').getPublicUrl(path)
    return data.publicUrl
  }

  async function uploadFile(file: File, profileId: string, folder: string): Promise<string | null> {
    const supabase = createClient()
    const ext  = file.name.split('.').pop()
    const path = `${profileId}/${folder}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('posts').upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('posts').getPublicUrl(path)
    return data.publicUrl
  }

  async function publishPost(type: string, text: string, mediaState: MediaState): Promise<PostData | null> {
    if (!currentUser) return null
    const supabase = createClient()

    let image_url: string | null = null
    let audio_url: string | null = null
    let audio_name: string | null = null
    let link: string | null = null

    if (mediaState.type === 'image' && mediaState.imageFile) {
      image_url = await uploadFile(mediaState.imageFile, currentUser.id, 'img')
    } else if (mediaState.type === 'audio' && mediaState.audioFile) {
      audio_url  = await uploadFile(mediaState.audioFile, currentUser.id, 'audio')
      audio_name = mediaState.fileName ?? null
    } else if (['youtube', 'spotify', 'link'].includes(mediaState.type ?? '')) {
      link = mediaState.url
    }

    const row = {
      profile_id: currentUser.id,
      type,
      content:    text.trim(),
      link,
      image_url,
      audio_url,
      audio_name,
    }

    const { data, error } = await supabase.from('posts').insert(row).select().single()
    if (error) throw error
    if (!data) return null

    const postDataType: PostData['type'] =
      type === 'logro'    ? 'achievement' :
      type === 'busqueda' ? 'regular'     : 'work'

    let embed: PostData['embed'] | undefined
    if (link) {
      const ytId = mediaState.youtubeId
      if (ytId) embed = { type: 'youtube', url: link, youtubeId: ytId }
      else if (mediaState.spotifyEmbed) embed = { type: 'spotify', url: link, spotifyEmbed: mediaState.spotifyEmbed }
      else embed = { type: 'link', url: link }
    }

    return {
      id: data.id,
      author: {
        name:     currentUser.name,
        role:     '',
        avatar:   currentUser.avatar_url ?? undefined,
        initials: currentUser.name[0]?.toUpperCase() ?? '?',
        username: currentUser.username,
      },
      time:       'ahora',
      type:       postDataType,
      content:    text.trim(),
      image:      image_url ?? undefined,
      audio_url:  audio_url ?? undefined,
      audio_name: audio_name ?? undefined,
      embed,
      likes:    0,
      comments: 0,
    }
  }

  async function handleInlinePublish() {
    if (!inlineText.trim() || publishing) return
    setPublishing(true); setError(null)
    try {
      const post = await publishPost(inlineType, inlineText, inlineMedia)
      if (post) { onPost?.(post); closeInline() }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'Error al publicar'
      setError(msg)
    } finally {
      setPublishing(false)
    }
  }

  async function handleModalPublish() {
    if (!content.trim() || !selectedType || modalPublishing) return
    setModalPublishing(true); setModalError(null)
    try {
      const post = await publishPost(selectedType, content, media)
      if (post) { onPost?.(post); closeModal() }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'Error al publicar'
      setModalError(msg)
    } finally {
      setModalPublishing(false)
    }
  }

  const selectedPostType = POST_TYPES.find(t => t.id === inlineType)

  return (
    <>
      {/* ════ INLINE COMPOSER ════ */}
      <div className="rounded-2xl overflow-hidden card-shadow"
        style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>

        <div className="p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
                style={{ border: '2px solid rgba(123,47,255,0.4)' }} />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold gradient-magenta mt-0.5">
                {currentUser?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <textarea
              value={inlineText}
              onChange={e => handleInlineTextChange(e.target.value.slice(0, CHAR_LIMIT))}
              onFocus={() => setInlineOpen(true)}
              placeholder="Comparte un lanzamiento, logro, video o búsqueda..."
              rows={inlineOpen ? 4 : 2}
              className="flex-1 bg-transparent text-white placeholder-[#7A6890] resize-none focus:outline-none text-sm leading-relaxed transition-all"
              style={{ minHeight: inlineOpen ? '96px' : '44px' }}
            />
          </div>

          {/* Type selector — visible when open */}
          {inlineOpen && (
            <div className="flex gap-1.5 mt-3 ml-12 flex-wrap">
              {POST_TYPES.map(t => (
                <button key={t.id} onClick={() => setInlineType(t.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  style={inlineType === t.id
                    ? { background: t.bg, color: t.color, border: `1px solid ${t.border}` }
                    : { background: 'rgba(255,255,255,0.04)', color: '#7A6890', border: '1px solid rgba(123,47,255,0.15)' }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Media preview */}
          {inlineMedia.type && (
            <div className="ml-12">
              <MediaPreview media={inlineMedia} onRemove={() => {
                if (inlineMedia.autoDetected) setInlineDismissed(inlineMedia.url)
                setInlineMedia({ type: null, url: '' }); setShowLinkInput(false)
              }} />
            </div>
          )}

          {showLinkInput && !inlineMedia.type && (
            <div className="ml-12">
              <LinkInput onAdd={m => { setInlineMedia(m); setShowLinkInput(false) }} />
            </div>
          )}

          {error && (
            <p className="text-xs mt-2 ml-12 px-3 py-2 rounded-lg font-medium"
              style={{ background: 'rgba(255,50,50,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.25)' }}>
              {error}
            </p>
          )}
        </div>

        <div style={{ height: '1px', background: 'rgba(123,47,255,0.15)' }} />

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <ToolbarIcon icon={ImageIcon} label="Imagen"       color="#8B3FFF" onClick={() => iimageRef.current?.click()} />
            <ToolbarIcon icon={Music}     label="Audio"        color="#FF1A8C" onClick={() => iaudioRef.current?.click()} />
            <ToolbarIcon icon={Link2}     label="Enlace"       color="#06b6d4"
              onClick={() => { setInlineOpen(true); setShowLinkInput(v => !v) }}
              active={showLinkInput} />
            <input ref={iaudioRef} type="file" accept="audio/*"  className="hidden" onChange={handleInlineAudio} />
            <input ref={iimageRef} type="file" accept="image/*"  className="hidden" onChange={handleInlineImage} />
          </div>

          {inlineOpen ? (
            <div className="flex items-center gap-2">
              <button onClick={closeInline}
                className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
                style={{ color: '#7A6890' }}>
                Cancelar
              </button>
              <button
                disabled={!inlineText.trim() || publishing}
                onClick={handleInlinePublish}
                className="flex items-center gap-2 text-white font-bold px-5 py-1.5 rounded-full text-sm gradient-magenta glow-btn hover:opacity-90 transition-all disabled:opacity-30">
                <Send size={14} />
                {publishing ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {POST_TYPES.map(({ id, emoji, label, color, bg }) => (
                <button key={id} onClick={() => openModal(id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: bg, color }}>
                  <span>{emoji}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ════ MODAL COMPLETO ════ */}
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
                  {step === 'type' ? 'Crear publicación' : `${modalType?.emoji} ${modalType?.label}`}
                </h3>
                {step === 'form' && modalType && (
                  <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>{modalType.desc}</p>
                )}
              </div>
              <button onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#7A6890' }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5">
              {step === 'type' && (
                <div className="flex flex-col gap-2">
                  {POST_TYPES.map(({ id, emoji, label, desc, color, bg, border }) => (
                    <button key={id} onClick={() => { setSelectedType(id); setStep('form') }}
                      className="flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                      style={{ background: bg, border: '1px solid transparent' }}
                      onMouseOver={e => (e.currentTarget.style.border = `1px solid ${border}`)}
                      onMouseOut={e => (e.currentTarget.style.border = '1px solid transparent')}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                        style={{ background: `${color}22`, border: `1px solid ${color}40` }}>
                        {emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>{desc}</p>
                      </div>
                      <ChevronRight size={16} style={{ color: '#7A6890' }} />
                    </button>
                  ))}
                </div>
              )}

              {step === 'form' && modalType && (
                <div className="flex flex-col gap-4">
                  {/* Author */}
                  <div className="flex gap-3 items-center">
                    {currentUser?.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                        style={{ border: '2px solid rgba(123,47,255,0.4)' }} />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold gradient-magenta">
                        {currentUser?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-semibold">{currentUser?.name ?? 'Tú'}</p>
                      <p className="text-xs" style={{ color: '#7A6890' }}>Publicando como tú</p>
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(123,47,255,0.2)' }}>
                    <textarea value={content} onChange={e => handleModalTextChange(e.target.value.slice(0, CHAR_LIMIT))}
                      placeholder={
                        selectedType === 'lanzamiento' ? 'Describe lo que estás lanzando...' :
                        selectedType === 'logro'       ? '¿Qué conseguiste? Contale a la comunidad...' :
                        selectedType === 'video'       ? 'Describí el video...' :
                                                          '¿A quién estás buscando?'
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
                      <MediaToolBtn icon={Music}     label="Audio"             color="#FF1A8C" active={media.type === 'audio'}   disabled={!!media.type && media.type !== 'audio'}   onClick={() => audioRef.current?.click()} />
                      <MediaToolBtn icon={ImageIcon}  label="Imagen"            color="#8B3FFF" active={media.type === 'image'}   disabled={!!media.type && media.type !== 'image'}   onClick={() => imageRef.current?.click()} />
                      <MediaToolBtn icon={Video}      label="YouTube / Spotify" color="#06b6d4"
                        active={mediaTab === 'link' || ['youtube','spotify','link'].includes(media.type ?? '')}
                        disabled={!!media.type && !['youtube','spotify','link'].includes(media.type ?? '')}
                        onClick={() => setMediaTab(p => p === 'link' ? null : 'link')} />
                    </div>
                    <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={handleModalAudio} />
                    <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleModalImage} />
                  </div>

                  {modalError && (
                    <p className="text-xs px-3 py-2 rounded-lg font-medium"
                      style={{ background: 'rgba(255,50,50,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.25)' }}>
                      {modalError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {step === 'form' && (
              <div className="px-5 py-4 flex items-center justify-between shrink-0"
                style={{ borderTop: '1px solid rgba(123,47,255,0.15)' }}>
                <button onClick={closeModal} className="text-sm font-medium px-4 py-2 rounded-full"
                  style={{ color: '#7A6890' }}>
                  Cancelar
                </button>
                <button disabled={!content.trim() || modalPublishing} onClick={handleModalPublish}
                  className="flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-full text-sm gradient-magenta glow-btn hover:opacity-90 transition-all disabled:opacity-30">
                  <Send size={14} />
                  {modalPublishing ? 'Publicando...' : 'Publicar'}
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

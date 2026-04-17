'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Pause, Trash2, Link2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/* ── Audio Player ─────────────────────────────────── */
function AudioPlayer({ src, fileName }: { src: string; fileName?: string }) {
  const audioRef   = useRef<HTMLAudioElement>(null)
  const [playing,  setPlaying]  = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [current,  setCurrent]  = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime  = () => { setCurrent(audio.currentTime); setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0) }
    const onMeta  = () => setDuration(audio.duration)
    const onEnded = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else         { audio.play();  setPlaying(true)  }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  function fmt(s: number) {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  const BARS = [45,70,35,85,55,90,40,75,60,95,30,65,80,50,70,40,88,55,72,38,92,48,67,82,44,76,58,91,36,69,84,52,78,42,88,61,74,46,83,57]

  return (
    <div className="rounded-xl p-4 mt-3" style={{ background: 'rgba(10,0,20,0.8)', border: '1px solid rgba(123,47,255,0.25)' }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-3">
        <button onClick={togglePlay}
          className="w-11 h-11 rounded-full gradient-magenta flex items-center justify-center shrink-0 hover:opacity-90 transition-all">
          {playing ? <Pause size={18} fill="white" className="text-white" /> : <Play size={18} fill="white" className="text-white ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          {fileName && (
            <p className="text-white text-xs font-semibold truncate mb-1.5 flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(139,63,255,0.3)', color: '#A855F7' }}>INÉDITO</span>
              {fileName.replace(/\.[^/.]+$/, '')}
            </p>
          )}
          <div className="flex items-end gap-0.5 h-7 cursor-pointer mb-1.5" onClick={seek}>
            {BARS.map((h, i) => (
              <div key={i} className="flex-1 rounded-sm transition-colors"
                style={{ height: `${h}%`, background: i < (progress / 100) * BARS.length ? '#A855F7' : 'rgba(255,255,255,0.12)' }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full cursor-pointer overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={seek}>
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(to right, #8B3FFF, #FF1A8C)' }} />
            </div>
            <span className="text-xs shrink-0 tabular-nums" style={{ color: '#7A6890' }}>{fmt(current)} / {fmt(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── PostData interface ───────────────────────────── */
export interface PostData {
  id: string
  author: {
    name: string
    role: string
    avatar?: string
    initials: string
    username?: string
  }
  time: string
  content: string
  type: 'work' | 'service' | 'achievement' | 'regular'
  image?: string
  audio_url?: string
  audio_name?: string
  embed?: {
    type: 'youtube' | 'spotify' | 'link'
    url: string
    youtubeId?: string
    spotifyEmbed?: string
  }
  likes: number
  comments: number
  liked?: boolean
}

const TYPE_COLORS: Record<string, string> = {
  work:        '#8b5cf6',
  service:     '#e91e8c',
  achievement: '#f59e0b',
  regular:     '#06b6d4',
}
const TYPE_LABELS: Record<string, string> = {
  work:        'Lanzamiento',
  service:     'Servicio',
  achievement: 'Logro',
  regular:     'Búsqueda',
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

/* ── PostCard ─────────────────────────────────────── */
interface PostCardProps {
  post: PostData
  currentUsername?: string
  onDelete?: (id: string) => void
}

export default function PostCard({ post, currentUsername, onDelete }: PostCardProps) {
  const [liked,       setLiked]       = useState(post.liked ?? false)
  const [likeCount,   setLikeCount]   = useState(post.likes)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [copied,      setCopied]      = useState(false)

  const isOwner = !!currentUsername && currentUsername === post.author.username
  const color   = TYPE_COLORS[post.type] ?? '#8b5cf6'
  const label   = TYPE_LABELS[post.type] ?? 'Post'

  function toggleLike() {
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  async function handleDelete() {
    if (!isOwner || deleting) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', post.id)
    onDelete?.(post.id)
  }

  async function handleShare() {
    const url = `${window.location.origin}/home`
    const text = `${post.author.name} en Mooseeka: "${post.content.slice(0, 80)}${post.content.length > 80 ? '...' : ''}"`
    if (navigator.share) {
      try { await navigator.share({ title: 'Mooseeka', text, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = () => setMenuOpen(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [menuOpen])

  return (
    <article className="rounded-2xl p-5 card-shadow" style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {post.author.username ? (
            <Link href={`/${post.author.username}`} className="shrink-0">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: '2px solid rgba(123,47,255,0.4)' }} />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' }}>
                  {post.author.initials}
                </div>
              )}
            </Link>
          ) : post.author.avatar ? (
            <img src={post.author.avatar} alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
              style={{ border: '2px solid rgba(123,47,255,0.4)' }} />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' }}>
              {post.author.initials}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {post.author.username ? (
                <Link href={`/${post.author.username}`} className="text-white font-bold text-sm hover:underline">
                  {post.author.name}
                </Link>
              ) : (
                <span className="text-white font-bold text-sm">{post.author.name}</span>
              )}
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${color}20`, color }}>
                {label}
              </span>
            </div>
            {/* Roles + time */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {post.author.role && (
                <span className="text-xs font-medium" style={{ color: '#C0A8D8' }}>{post.author.role}</span>
              )}
              {post.author.role && <span className="text-xs" style={{ color: '#7A6890' }}>·</span>}
              <span className="text-xs" style={{ color: '#7A6890' }}>{post.time}</span>
            </div>
          </div>
        </div>

        {/* ··· menu */}
        <div className="relative shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: '#7A6890' }}>
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 rounded-xl overflow-hidden shadow-2xl min-w-[150px]"
              style={{ background: '#1A0035', border: '1px solid rgba(123,47,255,0.3)' }}
              onClick={e => e.stopPropagation()}>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium transition-colors hover:bg-red-500/15 text-left"
                  style={{ color: '#ff6b6b' }}>
                  <Trash2 size={14} />
                  {deleting ? 'Eliminando...' : 'Eliminar post'}
                </button>
              )}
              <button
                onClick={() => { handleShare(); setMenuOpen(false) }}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium transition-colors hover:bg-white/8 text-left"
                style={{ color: '#C0A8D8' }}>
                <Link2 size={14} />
                Copiar enlace
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text content */}
      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#C0A8D8' }}>{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(123,47,255,0.2)' }}>
          <img src={post.image} alt="" className="w-full object-cover" style={{ maxHeight: 360 }} />
        </div>
      )}

      {/* Audio player */}
      {post.audio_url && <AudioPlayer src={post.audio_url} fileName={post.audio_name} />}

      {/* YouTube embed */}
      {post.embed?.type === 'youtube' && post.embed.youtubeId && (
        <div className="relative rounded-xl overflow-hidden mt-3" style={{ border: '1px solid rgba(123,47,255,0.25)', paddingTop: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${post.embed.youtubeId}?rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen loading="lazy" style={{ border: 'none' }}
          />
        </div>
      )}

      {/* Spotify embed */}
      {post.embed?.type === 'spotify' && post.embed.spotifyEmbed && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <iframe src={post.embed.spotifyEmbed} width="100%" height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy" className="block" style={{ borderRadius: '12px', border: 'none' }} />
        </div>
      )}

      {/* Plain link */}
      {post.embed?.type === 'link' && (
        <a href={post.embed.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 mt-3 rounded-xl hover:bg-white/5 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}>
          <img src={`https://www.google.com/s2/favicons?domain=${getDomain(post.embed.url)}&sz=32`}
            alt="" className="w-6 h-6 rounded shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: '#C0A8D8' }}>{getDomain(post.embed.url)}</p>
            <p className="text-xs truncate mt-0.5" style={{ color: '#7A6890' }}>{post.embed.url}</p>
          </div>
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 mt-4 pt-4" style={{ borderTop: '1px solid rgba(123,47,255,0.12)' }}>
        <button onClick={toggleLike}
          className="flex items-center gap-1.5 text-sm transition-all hover:text-[#FF1A8C]"
          style={{ color: liked ? '#FF1A8C' : '#7A6890' }}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm transition-colors hover:text-white" style={{ color: '#7A6890' }}>
          <MessageCircle size={18} />
          <span>{post.comments}</span>
        </button>
        <button onClick={handleShare}
          className="flex items-center gap-1.5 text-sm transition-colors hover:text-white ml-auto"
          style={{ color: copied ? '#A855F7' : '#7A6890' }}>
          {copied ? <Check size={18} /> : <Share2 size={18} />}
          {copied && <span className="text-xs">¡Copiado!</span>}
        </button>
      </div>
    </article>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Pause, ExternalLink } from 'lucide-react'

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
    const pct  = (e.clientX - rect.left) / rect.width
    audio.currentTime = pct * duration
  }

  function fmt(s: number) {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const BARS = [45,70,35,85,55,90,40,75,60,95,30,65,80,50,70,40,88,55,72,38,92,48,67,82,44,76,58,91,36,69,84,52,78,42,88,61,74,46,83,57]

  return (
    <div className="rounded-xl p-4 mt-3" style={{ background: 'rgba(10,0,20,0.8)', border: '1px solid rgba(123,47,255,0.25)' }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-3">
        <button onClick={togglePlay}
          className="w-11 h-11 rounded-full gradient-magenta flex items-center justify-center shrink-0 hover:opacity-90 transition-all">
          {playing
            ? <Pause size={18} fill="white" className="text-white" />
            : <Play  size={18} fill="white" className="text-white ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          {fileName && (
            <p className="text-white text-xs font-semibold truncate mb-1.5 flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(139,63,255,0.3)', color: '#A855F7' }}>INÉDITO</span>
              {fileName.replace(/\.[^/.]+$/, '')}
            </p>
          )}
          {/* Waveform */}
          <div className="flex items-end gap-0.5 h-7 cursor-pointer mb-1.5" onClick={seek}>
            {BARS.map((h, i) => {
              const filled = i < (progress / 100) * BARS.length
              return (
                <div key={i} className="flex-1 rounded-sm transition-colors"
                  style={{ height: `${h}%`, background: filled ? '#A855F7' : 'rgba(255,255,255,0.12)' }} />
              )
            })}
          </div>
          {/* Progress bar + time */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full cursor-pointer overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={seek}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(to right, #8B3FFF, #FF1A8C)' }} />
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
export default function PostCard({ post }: { post: PostData }) {
  const [liked,     setLiked]     = useState(post.liked ?? false)
  const [likeCount, setLikeCount] = useState(post.likes)

  function toggleLike() {
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  const color = TYPE_COLORS[post.type] ?? '#8b5cf6'
  const label = TYPE_LABELS[post.type] ?? 'Post'

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
                <Link href={`/${post.author.username}`} className="text-white font-semibold text-sm hover:underline">
                  {post.author.name}
                </Link>
              ) : (
                <span className="text-white font-semibold text-sm">{post.author.name}</span>
              )}
              {post.type !== 'regular' && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${color}20`, color }}>
                  {label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {post.author.role && <span className="text-xs" style={{ color: '#7A6890' }}>{post.author.role}</span>}
              {post.author.role && <span className="text-xs" style={{ color: '#7A6890' }}>·</span>}
              <span className="text-xs" style={{ color: '#7A6890' }}>{post.time}</span>
            </div>
          </div>
        </div>
        <button className="hover:text-white transition-colors p-1 shrink-0" style={{ color: '#7A6890' }}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Text content */}
      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#C0A8D8' }}>{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(123,47,255,0.2)' }}>
          <img src={post.image} alt="" className="w-full object-cover" style={{ maxHeight: 360 }} />
        </div>
      )}

      {/* Audio player (unreleased music) */}
      {post.audio_url && (
        <AudioPlayer src={post.audio_url} fileName={post.audio_name} />
      )}

      {/* YouTube embed — full iframe */}
      {post.embed?.type === 'youtube' && post.embed.youtubeId && (
        <div className="relative rounded-xl overflow-hidden mt-3" style={{ border: '1px solid rgba(123,47,255,0.25)', paddingTop: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${post.embed.youtubeId}?rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            style={{ border: 'none' }}
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
          <ExternalLink size={13} style={{ color: '#7A6890' }} />
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 mt-4 pt-4" style={{ borderTop: '1px solid rgba(123,47,255,0.12)' }}>
        <button onClick={toggleLike}
          className={`flex items-center gap-1.5 text-sm transition-all ${liked ? '' : 'hover:text-[#FF1A8C]'}`}
          style={{ color: liked ? '#FF1A8C' : '#7A6890' }}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm transition-colors hover:text-white" style={{ color: '#7A6890' }}>
          <MessageCircle size={18} />
          <span>{post.comments}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm transition-colors hover:text-white ml-auto" style={{ color: '#7A6890' }}>
          <Share2 size={18} />
        </button>
      </div>
    </article>
  )
}

'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Pause, ExternalLink } from 'lucide-react'

const WAVEFORM = [45,70,35,85,55,90,40,75,60,95,30,65,80,50,70,40,88,55,72,38,92,48,67,82,44,76,58,91,36,69,84,52,78,42,88,61,74,46,83,57]

interface AudioPlayerProps {
  title: string
  duration: string
}

function AudioPlayer({ title, duration }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(30)

  return (
    <div className="rounded-xl p-4 mt-3" style={{ background: 'rgba(10,0,20,0.8)', border: '1px solid rgba(123,47,255,0.2)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPlaying(!playing)}
          className="w-10 h-10 rounded-full gradient-magenta flex items-center justify-center shrink-0 hover:opacity-90 transition-all"
        >
          {playing ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{title}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-white/10 rounded-full relative">
              <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#8b5cf6] to-[#e91e8c] rounded-full transition-all"
                style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[#b0b0b0] text-xs shrink-0">{duration}</span>
          </div>
          {/* Waveform visual — fixed heights to avoid hydration mismatch */}
          <div className="flex items-end gap-0.5 mt-2 h-6">
            {WAVEFORM.map((h, i) => (
              <div key={i}
                className={`flex-1 rounded-sm transition-all ${i < progress * 0.4 ? 'bg-[#8b5cf6]' : 'bg-white/15'}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ServiceCardEmbedProps {
  title: string
  price: string
  category: string
  rating: number
}

function ServiceCardEmbed({ title, price, category, rating }: ServiceCardEmbedProps) {
  return (
    <div className="rounded-xl p-4 mt-3 flex items-center justify-between" style={{ background: 'rgba(10,0,20,0.8)', border: '1px solid rgba(123,47,255,0.2)' }}>
      <div>
        <p className="text-[#b0b0b0] text-xs uppercase tracking-wider mb-1">{category}</p>
        <p className="text-white font-medium text-sm">{title}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-[#b0b0b0] text-xs">{rating} · </span>
          <span className="text-white text-sm font-semibold">{price}</span>
        </div>
      </div>
      <button className="gradient-magenta text-white text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-all flex items-center gap-1.5">
        Ver <ExternalLink size={12} />
      </button>
    </div>
  )
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

export interface PostData {
  id: string
  author: {
    name: string
    role: string
    avatar?: string
    initials: string
    avatarGradient?: string
  }
  time: string
  content: string
  type: 'work' | 'service' | 'achievement' | 'regular'
  audio?: { title: string; duration: string }
  service?: { title: string; price: string; category: string; rating: number }
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

export default function PostCard({ post }: { post: PostData }) {
  const [liked, setLiked] = useState(post.liked ?? false)
  const [likeCount, setLikeCount] = useState(post.likes)

  function toggleLike() {
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  const typeColors: Record<string, string> = {
    work: '#8b5cf6',
    service: '#e91e8c',
    achievement: '#f59e0b',
    regular: '#06b6d4',
  }
  const typeLabels: Record<string, string> = {
    work: 'Trabajo',
    service: 'Servicio',
    achievement: 'Logro',
    regular: 'Post',
  }

  return (
    <article className="rounded-2xl p-5 card-shadow" style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {post.author.avatar ? (
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
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">{post.author.name}</span>
              {post.type !== 'regular' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: `${typeColors[post.type]}20`, color: typeColors[post.type] }}>
                  {typeLabels[post.type]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: '#7A6890' }}>{post.author.role}</span>
              <span className="text-xs" style={{ color: '#7A6890' }}>·</span>
              <span className="text-xs" style={{ color: '#7A6890' }}>{post.time}</span>
            </div>
          </div>
        </div>
        <button className="hover:text-white transition-colors p-1" style={{ color: '#7A6890' }}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed" style={{ color: '#C0A8D8' }}>{post.content}</p>

      {/* Embedded audio */}
      {post.audio && <AudioPlayer title={post.audio.title} duration={post.audio.duration} />}

      {/* Embedded service */}
      {post.service && (
        <ServiceCardEmbed
          title={post.service.title}
          price={post.service.price}
          category={post.service.category}
          rating={post.service.rating}
        />
      )}

      {/* Embedded YouTube / Spotify */}
      {post.embed?.type === 'youtube' && post.embed.youtubeId && (
        <div className="relative rounded-xl overflow-hidden mt-3" style={{ border: '1px solid rgba(123,47,255,0.25)' }}>
          <a href={post.embed.url} target="_blank" rel="noopener noreferrer">
            <img src={`https://img.youtube.com/vi/${post.embed.youtubeId}/hqdefault.jpg`}
              alt="YouTube" className="w-full h-44 object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,0,0,0.9)' }}>
                <Play size={22} fill="white" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
              <span className="text-xs font-bold text-red-400">YouTube</span>
            </div>
          </a>
        </div>
      )}
      {post.embed?.type === 'spotify' && post.embed.spotifyEmbed && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <iframe src={post.embed.spotifyEmbed} width="100%" height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy" className="block" style={{ borderRadius: '12px' }} />
        </div>
      )}
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

'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CreatePostModal, { Post } from './CreatePostModal'

const POST_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  logro:       { emoji: '🏆', label: 'Logro',       color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'  },
  lanzamiento: { emoji: '🚀', label: 'Lanzamiento', color: '#8B3FFF', bg: 'rgba(139,63,255,0.15)'  },
  video:       { emoji: '🎬', label: 'Video',       color: '#FF1A8C', bg: 'rgba(255,26,140,0.15)'  },
  busqueda:    { emoji: '🔍', label: 'Búsqueda',    color: '#06b6d4', bg: 'rgba(6,182,212,0.15)'   },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'ahora'
  if (mins  < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days  < 7)  return `${days}d`
  return new Date(dateStr).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

/** Returns YouTube thumbnail if URL is a YouTube link */
function getYoutubeThumbnail(url: string): string | null {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null
}

interface PostsSectionProps {
  profileId: string
  isOwner: boolean
}

export default function PostsSection({ profileId, isOwner }: PostsSectionProps) {
  const [posts,      setPosts]      = useState<Post[]>([])
  const [loading,    setLoading]    = useState(true)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editing,    setEditing]    = useState<Post | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('posts')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data)
        setLoading(false)
      })
  }, [profileId])

  function handleSave(post: Post) {
    setPosts(prev => {
      const exists = prev.find(p => p.id === post.id)
      return exists ? prev.map(p => p.id === post.id ? post : p) : [post, ...prev]
    })
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  function openAdd()            { setEditing(null);  setModalOpen(true) }
  function openEdit(post: Post) { setEditing(post);  setModalOpen(true) }

  if (loading) return null

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base">Actividad</h3>
          {isOwner && (
            <button onClick={openAdd}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-90 gradient-magenta text-white">
              <Plus size={13} />
              Publicar
            </button>
          )}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(25,0,50,0.4)', border: '1px dashed rgba(123,47,255,0.25)' }}>
            <p className="text-3xl mb-3">✨</p>
            <p className="text-white font-semibold text-sm mb-1">Sin publicaciones todavía</p>
            <p className="text-xs" style={{ color: '#7A6890' }}>
              Comparte logros, lanzamientos, videos o búsquedas de colaboradores.
            </p>
            {isOwner && (
              <button onClick={openAdd}
                className="mt-4 text-sm font-semibold px-5 py-2 rounded-full gradient-magenta text-white hover:opacity-90 transition-all">
                Primera publicación
              </button>
            )}
          </div>
        )}

        {/* Posts feed */}
        {posts.length > 0 && (
          <div className="flex flex-col gap-3">
            {posts.map(post => {
              const cfg       = POST_CONFIG[post.type] ?? POST_CONFIG.logro
              const ytThumb   = getYoutubeThumbnail(post.link)
              const coverImg  = post.image_url ?? ytThumb ?? null

              return (
                <div key={post.id}
                  className="rounded-2xl overflow-hidden group relative"
                  style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.15)' }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.35)')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.15)')}>

                  {/* Image */}
                  {coverImg && (
                    <div className="w-full overflow-hidden" style={{ maxHeight: 280 }}>
                      <img src={coverImg} alt="" className="w-full object-cover" style={{ maxHeight: 280 }} />
                    </div>
                  )}

                  <div className="p-4">
                    {/* Header: type badge + time + actions */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cfg.emoji}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        <span className="text-[11px]" style={{ color: '#7A6890' }}>
                          {timeAgo(post.created_at)}
                        </span>
                      </div>

                      {isOwner && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(post)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                            style={{ color: '#7A6890' }}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(post.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/15 hover:text-red-400"
                            style={{ color: '#7A6890' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#E0C8F0' }}>
                      {post.content}
                    </p>

                    {/* Link */}
                    {post.link && (
                      <a href={post.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
                        style={{ background: 'rgba(139,63,255,0.15)', color: '#A855F7', border: '1px solid rgba(139,63,255,0.3)' }}>
                        <ExternalLink size={11} />
                        {post.link.includes('spotify') ? 'Escuchar en Spotify' :
                         post.link.includes('youtube') || post.link.includes('youtu.be') ? 'Ver en YouTube' :
                         'Ver enlace'}
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CreatePostModal
        open={modalOpen}
        profileId={profileId}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </>
  )
}

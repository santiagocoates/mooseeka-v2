'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Music, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PortfolioModal, { PortfolioItem } from './PortfolioModal'

const TYPE_LABELS: Record<string, string> = {
  single:  'Single',
  ep:      'EP',
  album:   'Álbum',
  beat:    'Beat',
  remix:   'Remix',
  mezcla:  'Mezcla',
  jingle:  'Jingle',
  otro:    'Otro',
}

const TYPE_COLORS: Record<string, string> = {
  single:  '#8B3FFF',
  ep:      '#FF1A8C',
  album:   '#f59e0b',
  beat:    '#06b6d4',
  remix:   '#a855f7',
  mezcla:  '#10b981',
  jingle:  '#f97316',
  otro:    '#7A6890',
}

/** Returns YouTube video thumbnail URL, or null if not a YouTube link */
function getYoutubeThumbnail(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (!match) return null
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
}

/** Returns true if the URL is a Spotify link */
function isSpotifyUrl(url: string): boolean {
  return /open\.spotify\.com/.test(url)
}

interface PortfolioSectionProps {
  profileId: string
  isOwner: boolean
}

export default function PortfolioSection({ profileId, isOwner }: PortfolioSectionProps) {
  const [items, setItems]         = useState<PortfolioItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<PortfolioItem | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('portfolio_items')
      .select('*')
      .eq('profile_id', profileId)
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data.map(row => ({
          id:          row.id,
          title:       row.title,
          type:        row.type,
          year:        row.year ?? '',
          role:        row.role ?? '',
          cover_url:   row.cover_url ?? null,
          link:        row.link ?? '',
          description: row.description ?? '',
        })))
        setLoading(false)
      })
  }, [profileId])

  function handleSave(item: PortfolioItem) {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id)
      return exists ? prev.map(i => i.id === item.id ? item : i) : [item, ...prev]
    })
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('portfolio_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function openAdd()                     { setEditing(null); setModalOpen(true) }
  function openEdit(item: PortfolioItem) { setEditing(item); setModalOpen(true) }

  if (loading) return null

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base">Portafolio musical</h3>
          {isOwner && (
            <button onClick={openAdd}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-90 gradient-magenta text-white">
              <Plus size={13} />
              Agregar
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(25,0,50,0.4)', border: '1px dashed rgba(123,47,255,0.25)' }}>
            <p className="text-3xl mb-3">🎨</p>
            <p className="text-white font-semibold text-sm mb-1">Sin portafolio todavía</p>
            <p className="text-xs" style={{ color: '#7A6890' }}>
              Agrega tus singles, EPs, álbumes, beats y proyectos destacados.
            </p>
            {isOwner && (
              <button onClick={openAdd}
                className="mt-4 text-sm font-semibold px-5 py-2 rounded-full gradient-magenta text-white hover:opacity-90 transition-all">
                Agregar primer trabajo
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {items.map(item => {
              const color     = TYPE_COLORS[item.type] ?? '#7A6890'
              const ytThumb   = getYoutubeThumbnail(item.link)
              const isSpotify = isSpotifyUrl(item.link)
              // Cover priority: user-uploaded > YouTube auto-thumbnail > placeholder
              const coverSrc  = item.cover_url ?? ytThumb ?? null
              const hasLink   = !!item.link

              return (
                <div key={item.id} className="flex flex-col">
                  {/* Cover card */}
                  <div
                    onClick={() => { if (hasLink) window.open(item.link, '_blank', 'noopener,noreferrer') }}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                    style={{
                      background: 'rgba(25,0,50,0.8)',
                      border: `1px solid rgba(123,47,255,0.2)`,
                      cursor: hasLink ? 'pointer' : 'default',
                    }}>

                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${color}22, rgba(10,0,20,0.8))` }}>
                        <Music size={28} style={{ color: `${color}88` }} />
                      </div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                      style={{ background: `${color}dd`, color: '#fff' }}>
                      {TYPE_LABELS[item.type] ?? item.type}
                    </div>

                    {/* Platform badge */}
                    {(ytThumb || isSpotify) && (
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1"
                        style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
                        {ytThumb ? '▶ YouTube' : '♫ Spotify'}
                      </div>
                    )}

                    {/* Hover overlay — link indicator */}
                    {hasLink && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(0,0,0,0.45)' }}>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold"
                          style={{ background: 'rgba(139,63,255,0.85)' }}>
                          <ExternalLink size={11} />
                          Abrir
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title + meta */}
                  <p className="text-white text-xs font-semibold mt-1.5 truncate">{item.title}</p>
                  {(item.year || item.role) && (
                    <p className="text-[10px] truncate" style={{ color: '#7A6890' }}>
                      {[item.role, item.year].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  {/* Edit / Delete */}
                  {isOwner && (
                    <div className="flex gap-1.5 mt-1.5">
                      <button onClick={() => openEdit(item)}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors hover:bg-white/10"
                        style={{ color: '#7A6890', border: '1px solid rgba(123,47,255,0.2)' }}>
                        <Pencil size={10} />
                        Editar
                      </button>
                      <button onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors hover:bg-red-500/15 hover:text-red-400"
                        style={{ color: '#7A6890', border: '1px solid rgba(123,47,255,0.2)' }}>
                        <Trash2 size={10} />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <PortfolioModal
        open={modalOpen}
        profileId={profileId}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Music } from 'lucide-react'
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

function detectEmbed(url: string): { type: 'spotify' | 'youtube' | null; embedUrl: string | null } {
  if (!url) return { type: null, embedUrl: null }

  const spotifyMatch = url.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/)
  if (spotifyMatch) {
    return {
      type: 'spotify',
      embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`,
    }
  }

  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` }
  }

  return { type: null, embedUrl: null }
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
  const [expanded, setExpanded]   = useState<string | null>(null)

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
          id: row.id,
          title: row.title,
          type: row.type,
          year: row.year ?? '',
          role: row.role ?? '',
          cover_url: row.cover_url ?? null,
          link: row.link ?? '',
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
    if (expanded === id) setExpanded(null)
  }

  function openAdd()                     { setEditing(null);  setModalOpen(true) }
  function openEdit(item: PortfolioItem) { setEditing(item);  setModalOpen(true) }

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
              const color      = TYPE_COLORS[item.type] ?? '#7A6890'
              const isExpanded = expanded === item.id
              const embed      = detectEmbed(item.link)

              return (
                <div key={item.id} className="flex flex-col">
                  {/* Cover */}
                  <div
                    onClick={() => setExpanded(isExpanded ? null : item.id)}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                    style={{ background: 'rgba(25,0,50,0.8)', border: `1px solid rgba(123,47,255,0.2)` }}>
                    {item.cover_url ? (
                      <img src={item.cover_url} alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                  </div>

                  {/* Title + meta */}
                  <p className="text-white text-xs font-semibold mt-1.5 truncate">{item.title}</p>
                  {(item.year || item.role) && (
                    <p className="text-[10px] truncate" style={{ color: '#7A6890' }}>
                      {[item.role, item.year].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  {/* Edit / Delete — always visible for owner */}
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

                  {/* Expanded — span all columns with negative margin trick */}
                  {isExpanded && (
                    <div className="mt-2 rounded-xl overflow-hidden col-span-3"
                      style={{ border: '1px solid rgba(123,47,255,0.2)' }}>
                      {/* Spotify embed */}
                      {embed.type === 'spotify' && (
                        <iframe
                          src={embed.embedUrl!}
                          width="100%"
                          height="152"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          style={{ borderRadius: 12, border: 'none', display: 'block' }}
                        />
                      )}
                      {/* YouTube embed */}
                      {embed.type === 'youtube' && (
                        <iframe
                          src={embed.embedUrl!}
                          width="100%"
                          height="200"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          style={{ border: 'none', display: 'block', borderRadius: 12 }}
                        />
                      )}
                      {/* Description + plain link fallback */}
                      {(item.description || (item.link && embed.type === null)) && (
                        <div className="p-3" style={{ background: 'rgba(25,0,50,0.8)' }}>
                          {item.description && (
                            <p className="text-xs leading-relaxed mb-2" style={{ color: '#C0A8D8' }}>{item.description}</p>
                          )}
                          {item.link && embed.type === null && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-white"
                              style={{ color }}>
                              Abrir enlace →
                            </a>
                          )}
                        </div>
                      )}
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

'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, Music } from 'lucide-react'
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

  function openAdd()  { setEditing(null); setModalOpen(true) }
  function openEdit(item: PortfolioItem) { setEditing(item); setModalOpen(true) }

  if (loading) return null

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base">Portafolio</h3>
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
              const color = TYPE_COLORS[item.type] ?? '#7A6890'
              const isExpanded = expanded === item.id

              return (
                <div key={item.id} className="flex flex-col">
                  {/* Cover */}
                  <div
                    onClick={() => setExpanded(isExpanded ? null : item.id)}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                    style={{ background: 'rgba(25,0,50,0.8)', border: `1px solid rgba(123,47,255,0.2)` }}>
                    {item.cover_url ? (
                      <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                    {/* Owner actions */}
                    {isOwner && (
                      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); openEdit(item) }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                          style={{ background: 'rgba(0,0,0,0.7)' }}>
                          <Pencil size={11} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                          style={{ background: 'rgba(0,0,0,0.7)' }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <p className="text-white text-xs font-semibold mt-1.5 truncate">{item.title}</p>
                  {(item.year || item.role) && (
                    <p className="text-[10px] truncate" style={{ color: '#7A6890' }}>
                      {[item.role, item.year].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="mt-2 p-3 rounded-xl col-span-3"
                      style={{ background: 'rgba(25,0,50,0.8)', border: '1px solid rgba(123,47,255,0.2)' }}>
                      {item.description && (
                        <p className="text-xs leading-relaxed mb-2" style={{ color: '#C0A8D8' }}>{item.description}</p>
                      )}
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-white"
                          style={{ color: color }}>
                          <ExternalLink size={11} />
                          Escuchar / Ver
                        </a>
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

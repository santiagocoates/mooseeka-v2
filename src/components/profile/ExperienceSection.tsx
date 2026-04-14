'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import ExperienceModal, { ExperienceData } from './ExperienceModal'
import { createClient } from '@/lib/supabase/client'

const TYPE_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  trabajo:      { emoji: '💼', color: '#8B3FFF', bg: 'rgba(139,63,255,0.15)' },
  colaboracion: { emoji: '🤝', color: '#FF1A8C', bg: 'rgba(255,26,140,0.15)' },
  proyecto:     { emoji: '🎯', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)'  },
  lanzamiento:  { emoji: '🚀', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  gira:         { emoji: '🎤', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
}

const MONTHS = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function formatDate(month: string, year: string, current: boolean) {
  if (current) return 'Actualidad'
  if (!year) return ''
  const m = month ? MONTHS[parseInt(month)] : ''
  return m ? `${m} ${year}` : year
}

interface ExperienceSectionProps {
  profileId: string
  isOwner: boolean
}

export default function ExperienceSection({ profileId, isOwner }: ExperienceSectionProps) {
  const [experiences, setExperiences] = useState<ExperienceData[]>([])
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<ExperienceData | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('experiences')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_year', { ascending: false })
      .order('start_month', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setExperiences(data.map(row => ({
            id: row.id,
            type: row.type,
            title: row.title,
            company: row.company,
            startMonth: row.start_month ?? '',
            startYear: row.start_year,
            endMonth: row.end_month ?? '',
            endYear: row.end_year ?? '',
            current: row.current ?? false,
            description: row.description ?? '',
            link: row.link ?? '',
          })))
        }
        setLoading(false)
      })
  }, [profileId])

  async function handleSave(exp: ExperienceData) {
    const supabase = createClient()
    const row = {
      profile_id:  profileId,
      type:        exp.type,
      title:       exp.title,
      company:     exp.company,
      start_month: exp.startMonth || null,
      start_year:  exp.startYear,
      end_month:   exp.current ? null : exp.endMonth || null,
      end_year:    exp.current ? null : exp.endYear || null,
      current:     exp.current,
      description: exp.description || null,
      link:        exp.link || null,
    }

    const isNew = !experiences.find(e => e.id === exp.id)

    if (isNew) {
      const { data } = await supabase.from('experiences').insert(row).select().single()
      if (data) setExperiences(prev => [{ ...exp, id: data.id }, ...prev])
    } else {
      await supabase.from('experiences').update(row).eq('id', exp.id)
      setExperiences(prev => prev.map(e => e.id === exp.id ? exp : e))
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('experiences').delete().eq('id', id)
    setExperiences(prev => prev.filter(e => e.id !== id))
  }

  function openAdd()  { setEditing(null); setModalOpen(true) }
  function openEdit(exp: ExperienceData) { setEditing(exp); setModalOpen(true) }

  if (loading) return null

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base">Trayectoria</h3>
          {isOwner && (
            <button onClick={openAdd}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-90 gradient-magenta text-white">
              <Plus size={13} />
              Agregar
            </button>
          )}
        </div>

        {experiences.length === 0 && (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(25,0,50,0.4)', border: '1px dashed rgba(123,47,255,0.25)' }}>
            <p className="text-3xl mb-3">🎵</p>
            <p className="text-white font-semibold text-sm mb-1">Sin trayectoria todavía</p>
            <p className="text-xs" style={{ color: '#7A6890' }}>
              Agrega tus trabajos, colaboraciones y proyectos más importantes.
            </p>
            {isOwner && (
              <button onClick={openAdd}
                className="mt-4 text-sm font-semibold px-5 py-2 rounded-full gradient-magenta text-white hover:opacity-90 transition-all">
                Agregar primera experiencia
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {experiences.map((exp, i) => {
            const cfg = TYPE_CONFIG[exp.type] ?? TYPE_CONFIG.trabajo
            const startStr = formatDate(exp.startMonth, exp.startYear, false)
            const endStr   = formatDate(exp.endMonth, exp.endYear, exp.current)
            const dateStr  = startStr && endStr ? `${startStr} — ${endStr}` : startStr || endStr

            return (
              <div key={exp.id}
                className="flex gap-4 p-4 rounded-2xl group relative transition-all"
                style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.15)' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.35)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.15)')}>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                    {cfg.emoji}
                  </div>
                  {i < experiences.length - 1 && (
                    <div className="flex-1 w-0.5 mt-2 rounded-full min-h-[16px]"
                      style={{ background: 'rgba(123,47,255,0.2)' }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm leading-snug">{exp.title}</p>
                      <p className="text-sm font-medium mt-0.5" style={{ color: cfg.color }}>{exp.company}</p>
                    </div>
                    {isOwner && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => openEdit(exp)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                          style={{ color: '#7A6890' }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(exp.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/15 hover:text-red-400"
                          style={{ color: '#7A6890' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    {dateStr && <span className="text-xs" style={{ color: '#7A6890' }}>{dateStr}</span>}
                    {exp.current && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(139,63,255,0.2)', color: '#A855F7' }}>
                        Actual
                      </span>
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: '#C0A8D8' }}>
                      {exp.description}
                    </p>
                  )}

                  {exp.link && (
                    <a href={exp.link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-medium transition-colors hover:text-white"
                      style={{ color: '#7B2FFF' }}>
                      <ExternalLink size={11} />
                      Ver proyecto
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ExperienceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </>
  )
}

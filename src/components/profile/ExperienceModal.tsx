'use client'

import { useState } from 'react'
import { X, Briefcase, Link2, Calendar } from 'lucide-react'

const EXP_TYPES = [
  { id: 'trabajo',       label: 'Trabajo',        emoji: '💼' },
  { id: 'colaboracion',  label: 'Colaboración',   emoji: '🤝' },
  { id: 'proyecto',      label: 'Proyecto',       emoji: '🎯' },
  { id: 'lanzamiento',   label: 'Lanzamiento',    emoji: '🚀' },
  { id: 'gira',          label: 'Gira / Show',    emoji: '🎤' },
]

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const YEARS  = Array.from({ length: 20 }, (_, i) => (new Date().getFullYear() - i).toString())

interface ExperienceModalProps {
  open: boolean
  onClose: () => void
  onSave: (exp: ExperienceData) => void
  initial?: ExperienceData | null
}

export interface ExperienceData {
  id: string
  type: string
  title: string
  company: string
  startMonth: string
  startYear: string
  endMonth: string
  endYear: string
  current: boolean
  description: string
  link: string
}

export default function ExperienceModal({ open, onClose, onSave, initial }: ExperienceModalProps) {
  const [type,        setType]        = useState(initial?.type        ?? 'trabajo')
  const [title,       setTitle]       = useState(initial?.title       ?? '')
  const [company,     setCompany]     = useState(initial?.company     ?? '')
  const [startMonth,  setStartMonth]  = useState(initial?.startMonth  ?? '')
  const [startYear,   setStartYear]   = useState(initial?.startYear   ?? '')
  const [endMonth,    setEndMonth]    = useState(initial?.endMonth    ?? '')
  const [endYear,     setEndYear]     = useState(initial?.endYear     ?? '')
  const [current,     setCurrent]     = useState(initial?.current     ?? false)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [link,        setLink]        = useState(initial?.link        ?? '')

  const DESC_LIMIT = 300
  const canSave = title.trim() && company.trim() && startYear

  function handleSave() {
    if (!canSave) return
    onSave({
      id: initial?.id ?? Date.now().toString(),
      type, title, company,
      startMonth, startYear,
      endMonth: current ? '' : endMonth,
      endYear:  current ? '' : endYear,
      current, description, link,
    })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-lg rounded-2xl flex flex-col overflow-hidden"
        style={{ background: '#0E001C', border: '1px solid rgba(123,47,255,0.25)', maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(123,47,255,0.15)' }}>
          <h3 className="text-white font-bold text-base">
            {initial ? 'Editar experiencia' : 'Agregar experiencia'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#7A6890' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">

          {/* Tipo */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#7A6890' }}>Tipo</label>
            <div className="flex flex-wrap gap-2">
              {EXP_TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={type === t.id
                    ? { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.2)' }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <Field label="Título / Rol *" icon={Briefcase}
            placeholder="ej: Productor Musical, Ingeniero de Mezcla, Artista Invitado..."
            value={title} onChange={setTitle} />

          {/* Empresa / Proyecto */}
          <Field label="Empresa / Proyecto / Artista *" icon={Briefcase}
            placeholder="ej: Universal Music, Proyecto Propio, @NombreArtista..."
            value={company} onChange={setCompany} />

          {/* Fechas */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#7A6890' }}>
              <Calendar size={11} className="inline mr-1.5" />
              Fecha de inicio *
            </label>
            <div className="flex gap-3">
              <SelectField placeholder="Mes" value={startMonth} onChange={setStartMonth}
                options={MONTHS.map((m, i) => ({ value: (i+1).toString(), label: m }))} />
              <SelectField placeholder="Año" value={startYear} onChange={setStartYear}
                options={YEARS.map(y => ({ value: y, label: y }))} />
            </div>
          </div>

          {/* Actual */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setCurrent(v => !v)}
              className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
              style={current
                ? { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }
                : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(123,47,255,0.3)' }}>
              {current && <span className="text-white text-xs">✓</span>}
            </div>
            <span className="text-sm" style={{ color: '#C0A8D8' }}>Actualmente trabajo aquí</span>
          </label>

          {/* Fecha fin */}
          {!current && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#7A6890' }}>
                <Calendar size={11} className="inline mr-1.5" />
                Fecha de fin
              </label>
              <div className="flex gap-3">
                <SelectField placeholder="Mes" value={endMonth} onChange={setEndMonth}
                  options={MONTHS.map((m, i) => ({ value: (i+1).toString(), label: m }))} />
                <SelectField placeholder="Año" value={endYear} onChange={setEndYear}
                  options={YEARS.map(y => ({ value: y, label: y }))} />
              </div>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#7A6890' }}>
              Descripción <span style={{ color: '#7A6890', fontWeight: 400 }}>· opcional</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, DESC_LIMIT))}
              placeholder="Describe lo que hiciste, logros, herramientas que usaste..."
              rows={3} className="w-full text-white placeholder-[#7A6890] text-sm resize-none rounded-xl px-3 py-2.5 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }} />
            <div className="flex justify-end mt-1">
              <span className="text-xs" style={{ color: description.length > DESC_LIMIT * 0.85 ? '#FF1A8C' : '#7A6890' }}>
                {description.length}/{DESC_LIMIT}
              </span>
            </div>
          </div>

          {/* Link */}
          <Field label="Enlace · opcional" icon={Link2}
            placeholder="Spotify, YouTube, SoundCloud, sitio web..."
            value={link} onChange={setLink} />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderTop: '1px solid rgba(123,47,255,0.15)' }}>
          <button onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-full transition-colors"
            style={{ color: '#7A6890' }}
            onMouseOver={e => (e.currentTarget.style.color = '#fff')}
            onMouseOut={e => (e.currentTarget.style.color = '#7A6890')}>
            Cancelar
          </button>
          <button disabled={!canSave} onClick={handleSave}
            className="text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all disabled:opacity-30 gradient-magenta glow-btn hover:opacity-90">
            {initial ? 'Guardar cambios' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* helpers */
function Field({ label, icon: Icon, placeholder, value, onChange }: {
  label: string; icon: React.ElementType; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>{label}</label>
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}>
        <Icon size={14} style={{ color: '#7A6890', flexShrink: 0 }} />
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-[#7A6890] text-sm focus:outline-none" />
      </div>
    </div>
  )
}

function SelectField({ placeholder, value, onChange, options }: {
  placeholder: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="flex-1 text-sm px-3 py-2.5 rounded-xl focus:outline-none appearance-none"
      style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)',
        color: value ? '#fff' : '#7A6890',
      }}>
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value} style={{ background: '#0E001C' }}>{o.label}</option>)}
    </select>
  )
}

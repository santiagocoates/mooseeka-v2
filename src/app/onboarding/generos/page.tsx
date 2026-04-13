'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import StepProgress from '@/components/onboarding/StepProgress'

const GENRES = [
  { id: 'reggaeton',   label: 'Reggaetón',       emoji: '🔥' },
  { id: 'trap',        label: 'Trap',             emoji: '⛓️' },
  { id: 'pop',         label: 'Pop',              emoji: '⭐' },
  { id: 'rock',        label: 'Rock',             emoji: '🎸' },
  { id: 'electronic',  label: 'Electrónica',      emoji: '🎛️' },
  { id: 'hiphop',      label: 'Hip Hop',          emoji: '🎤' },
  { id: 'latin',       label: 'Latin',            emoji: '💃' },
  { id: 'rancheras',   label: 'Regional Mexicano',emoji: '🤠' },
  { id: 'salsa',       label: 'Salsa / Cumbia',   emoji: '🎺' },
  { id: 'afrobeats',   label: 'Afrobeats',        emoji: '🥁' },
  { id: 'jazz',        label: 'Jazz',             emoji: '🎷' },
  { id: 'rythmsoul',   label: 'R&B / Soul',       emoji: '🎶' },
  { id: 'folk',        label: 'Folk / Indie',     emoji: '🪕' },
  { id: 'classical',   label: 'Clásica',          emoji: '🎻' },
  { id: 'metal',       label: 'Metal',            emoji: '🤘' },
  { id: 'ambient',     label: 'Ambient',          emoji: '🌊' },
  { id: 'house',       label: 'House / Techno',   emoji: '🏠' },
  { id: 'otro',        label: 'Otro',             emoji: '🎵' },
]

const MAX = 5

export default function OnboardingGeneros() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(g => g !== id)
        : prev.length < MAX ? [...prev, id] : prev
    )
  }

  const canContinue = selected.length >= 1

  return (
    <div className="w-full max-w-lg">
      <StepProgress current={3} />

      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
          ¿Qué música te mueve?
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#C0A8D8' }}>
          Elige hasta {MAX} géneros. Usamos esto para mostrarte contenido y profesionales relevantes.
        </p>
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {GENRES.map(g => {
          const isSelected = selected.includes(g.id)
          const disabled   = !isSelected && selected.length >= MAX
          return (
            <button key={g.id} onClick={() => toggle(g.id)} disabled={disabled}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-35"
              style={isSelected
                ? { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff', boxShadow: '0 4px 16px rgba(255,26,140,0.25)' }
                : { background: 'rgba(25,0,50,0.7)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.25)' }}
              onMouseOver={e => !disabled && !isSelected && (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.6)')}
              onMouseOut={e => !isSelected && (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')}>
              <span>{g.emoji}</span>
              {g.label}
            </button>
          )
        })}
      </div>

      {/* Counter */}
      <p className="text-xs mb-6" style={{ color: '#7A6890' }}>
        {selected.length === 0
          ? 'Selecciona al menos un género'
          : `${selected.length} de ${MAX} seleccionados`}
      </p>

      <button
        disabled={!canContinue}
        onClick={() => router.push('/onboarding/objetivo')}
        className="w-full py-3.5 rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30 gradient-magenta glow-btn hover:opacity-90">
        Continuar
        <ArrowRight size={18} />
      </button>
    </div>
  )
}

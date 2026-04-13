'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import StepProgress from '@/components/onboarding/StepProgress'

const ROLES = [
  { id: 'artista',    label: 'Artista',             emoji: '🎤', desc: 'Cantante, músico, MC' },
  { id: 'productor',  label: 'Productor',            emoji: '🎛️', desc: 'Beat maker, productor musical' },
  { id: 'mixing',     label: 'Ingeniero de mezcla',  emoji: '🎚️', desc: 'Mixing engineer' },
  { id: 'mastering',  label: 'Masterizador',         emoji: '📀', desc: 'Mastering engineer' },
  { id: 'compositor', label: 'Compositor',           emoji: '🎼', desc: 'Escritor de canciones' },
  { id: 'dj',         label: 'DJ',                   emoji: '🎧', desc: 'DJ, turntablist' },
  { id: 'manager',    label: 'Manager',              emoji: '📋', desc: 'Artist manager, A&R' },
  { id: 'marketer',   label: 'Marketer',             emoji: '📣', desc: 'Marketing musical' },
  { id: 'disenador',  label: 'Diseñador',            emoji: '🎨', desc: 'Arte, visuales, branding' },
  { id: 'abogado',    label: 'Abogado Musical',      emoji: '⚖️', desc: 'Derechos, contratos' },
  { id: 'educador',   label: 'Educador',             emoji: '📚', desc: 'Maestro, coach musical' },
  { id: 'fotovideo',  label: 'Foto / Video',         emoji: '🎬', desc: 'Videoclips, fotografía' },
]

const MAX_ROLES = 4

export default function OnboardingRoles() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(r => r !== id)
        : prev.length < MAX_ROLES ? [...prev, id] : prev
    )
  }

  const canContinue = selected.length >= 1

  return (
    <div className="w-full max-w-lg">
      <StepProgress current={2} />

      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
          ¿Qué haces en la música?
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#C0A8D8' }}>
          Elige hasta {MAX_ROLES} roles. Esto personaliza tu experiencia y las sugerencias que ves.
        </p>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {selected.map(id => {
            const r = ROLES.find(r => r.id === id)!
            return (
              <button key={id} onClick={() => toggle(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80 gradient-magenta">
                <span>{r.emoji}</span>
                {r.label}
                <span className="ml-0.5 opacity-70 text-xs">✕</span>
              </button>
            )
          })}
          <span className="flex items-center text-xs px-2" style={{ color: '#7A6890' }}>
            {selected.length}/{MAX_ROLES}
          </span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {ROLES.map(role => {
          const isSelected = selected.includes(role.id)
          const disabled   = !isSelected && selected.length >= MAX_ROLES
          return (
            <button key={role.id} onClick={() => toggle(role.id)} disabled={disabled}
              className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all disabled:opacity-35"
              style={isSelected
                ? { background: 'rgba(139,63,255,0.2)', border: '2px solid rgba(139,63,255,0.7)' }
                : { background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.2)' }}
              onMouseOver={e => !disabled && !isSelected && (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.5)')}
              onMouseOut={e => !isSelected && (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)')}>
              <span className="text-2xl">{role.emoji}</span>
              <div>
                <p className="text-white font-bold text-sm">{role.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>{role.desc}</p>
              </div>
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs gradient-magenta">
                  ✓
                </div>
              )}
            </button>
          )
        })}
      </div>

      <button
        disabled={!canContinue}
        onClick={() => router.push('/onboarding/generos')}
        className="w-full py-3.5 rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30 gradient-magenta glow-btn hover:opacity-90">
        Continuar
        <ArrowRight size={18} />
      </button>
    </div>
  )
}

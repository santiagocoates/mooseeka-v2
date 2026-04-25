'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShoppingBag, Briefcase, Users, Heart, Check } from 'lucide-react'
import StepProgress from '@/components/onboarding/StepProgress'
import { useOnboarding } from '../context'

const OBJETIVOS = [
  {
    id: 'conectar',
    icon: Users,
    label: 'Conectar con la industria',
    desc: 'Quiero hacer networking, conocer profesionales, mostrar mi trabajo y estar al día con la escena musical.',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.5)',
  },
  {
    id: 'contratar',
    icon: ShoppingBag,
    label: 'Contratar servicios',
    desc: 'Busco producción, mezcla, masterización, diseño y más para mis proyectos.',
    color: '#8B3FFF',
    bg: 'rgba(139,63,255,0.12)',
    border: 'rgba(139,63,255,0.5)',
  },
  {
    id: 'ofrecer',
    icon: Briefcase,
    label: 'Ofrecer servicios',
    desc: 'Quiero publicar mis servicios y conseguir clientes dentro de la industria.',
    color: '#FF1A8C',
    bg: 'rgba(255,26,140,0.12)',
    border: 'rgba(255,26,140,0.5)',
  },
  {
    id: 'fan',
    icon: Heart,
    label: 'Soy apasionado de la música',
    desc: 'Quiero descubrir artistas, seguir su trabajo y estar cerca de la música que amo.',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    border: 'rgba(236,72,153,0.5)',
  },
]

export default function OnboardingObjetivo() {
  const router = useRouter()
  const { objetivo: savedObjetivo, update } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(savedObjetivo) ? savedObjetivo : savedObjetivo ? [savedObjetivo as unknown as string] : []
  )

  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function handleContinue() {
    update({ objetivo: selected })
    router.push('/onboarding/listo')
  }

  return (
    <div className="w-full max-w-md">
      <StepProgress current={4} />

      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
          ¿Para qué usas Mooseeka?
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#C0A8D8' }}>
          Podés elegir varias opciones. Esto personaliza tu experiencia desde el primer día.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {OBJETIVOS.map(({ id, icon: Icon, label, desc, color, bg, border }) => {
          const isSelected = selected.includes(id)
          return (
            <button key={id} onClick={() => toggle(id)}
              className="flex items-start gap-4 p-5 rounded-2xl text-left transition-all w-full"
              style={isSelected
                ? { background: bg, border: `2px solid ${border}` }
                : { background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}
              onMouseOver={e => !isSelected && (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.45)')}
              onMouseOut={e => !isSelected && (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.18)')}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base mb-1">{label}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#C0A8D8' }}>{desc}</p>
              </div>
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 transition-all"
                style={isSelected
                  ? { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', border: 'none' }
                  : { background: 'transparent', border: '2px solid rgba(123,47,255,0.35)' }}>
                {isSelected && <Check size={13} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          )
        })}
      </div>

      <button
        disabled={selected.length === 0}
        onClick={handleContinue}
        className="w-full py-3.5 rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30 gradient-magenta glow-btn hover:opacity-90">
        Finalizar
        <ArrowRight size={18} />
      </button>
    </div>
  )
}

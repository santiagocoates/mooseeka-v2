'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function OnboardingListo() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(t); router.push('/home'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [router])

  return (
    <div className="w-full max-w-md flex flex-col items-center text-center gap-8">
      {/* Logo animado */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(139,63,255,0.2), rgba(255,26,140,0.2))', border: '2px solid rgba(139,63,255,0.4)' }}>
          <Image src="/isologo.png" alt="Mooseeka" width={64} height={64} className="object-contain" />
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' }} />
      </div>

      {/* Text */}
      <div>
        <h1 className="text-4xl font-black text-white mb-3" style={{ letterSpacing: '-0.03em' }}>
          ¡Ya eres parte de<br />
          <span className="gradient-text">mooseeka!</span>
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#C0A8D8' }}>
          Tu perfil está listo. Empieza a conectar con los mejores profesionales de la industria musical latinoamericana.
        </p>
      </div>

      {/* Quick stats */}
      <div className="flex gap-6">
        {[
          { value: '+5K', label: 'Profesionales' },
          { value: '+200', label: 'Servicios' },
          { value: '12', label: 'Países' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-black gradient-text">{s.value}</p>
            <p className="text-xs" style={{ color: '#7A6890' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full flex flex-col gap-3">
        <button onClick={() => router.push('/home')}
          className="w-full py-3.5 rounded-full text-white font-bold transition-all gradient-magenta glow-btn hover:opacity-90">
          Entrar a Mooseeka
        </button>
        <p className="text-xs" style={{ color: '#7A6890' }}>
          Redirigiendo automáticamente en {countdown}s...
        </p>
      </div>
    </div>
  )
}

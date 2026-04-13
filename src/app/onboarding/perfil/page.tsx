'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ArrowRight, User } from 'lucide-react'
import StepProgress from '@/components/onboarding/StepProgress'

export default function OnboardingPerfil() {
  const router = useRouter()
  const [name, setName]       = useState('')
  const [username, setUsername] = useState('')
  const [avatar, setAvatar]   = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setAvatar(url)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) handleFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files?.[0]; if (f) handleFile(f)
  }

  // Auto-generate username from name
  function handleNameChange(v: string) {
    setName(v)
    if (!username || username === toSlug(name)) {
      setUsername(toSlug(v))
    }
  }

  function toSlug(s: string) {
    return s.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9._]/g, '').slice(0, 20)
  }

  const canContinue = name.trim().length >= 2 && username.trim().length >= 2

  return (
    <div className="w-full max-w-md">
      <StepProgress current={1} />

      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
          Crea tu perfil
        </h1>
        <p style={{ color: '#C0A8D8' }} className="text-sm leading-relaxed">
          Así te van a conocer los demás profesionales de la industria.
        </p>
      </div>

      {/* Avatar upload */}
      <div className="flex flex-col items-center mb-8">
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="relative w-28 h-28 rounded-full cursor-pointer group"
          style={{
            border: dragging ? '2px solid #FF1A8C' : '2px dashed rgba(123,47,255,0.5)',
            background: 'rgba(25,0,50,0.6)',
            transition: 'border-color 0.2s'
          }}>
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <User size={36} style={{ color: '#7A6890' }} />
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.6)' }}>
            <Camera size={20} className="text-white" />
            <span className="text-white text-xs mt-1 font-medium">Cambiar</span>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        <p className="text-xs mt-3" style={{ color: '#7A6890' }}>
          Foto de perfil <span style={{ color: '#7A6890' }}>· opcional</span>
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Name */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
            Nombre completo *
          </label>
          <input
            value={name} onChange={e => handleNameChange(e.target.value)}
            placeholder="Tu nombre o nombre artístico"
            className="w-full px-4 py-3 rounded-xl text-white placeholder-[#7A6890] text-sm focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.6)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')}
          />
        </div>

        {/* Username */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
            Nombre de usuario *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#7A6890' }}>@</span>
            <input
              value={username} onChange={e => setUsername(toSlug(e.target.value))}
              placeholder="tu_usuario"
              className="w-full pl-8 pr-4 py-3 rounded-xl text-white placeholder-[#7A6890] text-sm focus:outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.6)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')}
            />
          </div>
          {username && (
            <p className="text-xs mt-1.5" style={{ color: '#7A6890' }}>
              Tu perfil será <span style={{ color: '#A855F7' }}>mooseeka.com/@{username}</span>
            </p>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        disabled={!canContinue}
        onClick={() => router.push('/onboarding/roles')}
        className="w-full py-3.5 rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30 gradient-magenta glow-btn hover:opacity-90">
        Continuar
        <ArrowRight size={18} />
      </button>
    </div>
  )
}

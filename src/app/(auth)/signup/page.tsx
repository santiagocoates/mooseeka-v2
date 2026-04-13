'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ROLES = [
  { id: 'artist', label: 'Artista / Músico', emoji: '🎤' },
  { id: 'producer', label: 'Productor', emoji: '🎹' },
  { id: 'engineer', label: 'Ingeniero (Mixing/Mastering)', emoji: '🎚️' },
  { id: 'manager', label: 'Manager', emoji: '💼' },
  { id: 'marketer', label: 'Marketer', emoji: '📱' },
  { id: 'designer', label: 'Diseñador', emoji: '🎨' },
  { id: 'lawyer', label: 'Abogado Musical', emoji: '⚖️' },
  { id: 'educator', label: 'Educador', emoji: '📚' },
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  function toggleRole(id: string) {
    setSelectedRoles(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  async function handleGoogleSignup() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/home` },
    })
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, roles: selectedRoles },
        emailRedirectTo: `${window.location.origin}/home`,
      },
    })
    if (error) { alert(error.message); setLoading(false) }
  }

  return (
    <div className="w-full max-w-sm px-6 py-12 flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #e91e8c)' }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <path d="M20 8C20 8 10 14 10 24C10 28 14 32 20 32C26 32 30 28 30 24C30 14 20 8 20 8Z" fill="white" opacity="0.9"/>
            <circle cx="20" cy="23" r="5" fill="white"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold gradient-text">Crear cuenta</h1>
      </div>

      {step === 1 ? (
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-4 rounded-full flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrarse con Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[#b0b0b0] text-xs">o con email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <input type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} required
              className="w-full bg-[#2a1a4e] border border-white/10 text-white placeholder-[#b0b0b0] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8b5cf6] transition-colors" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-[#2a1a4e] border border-white/10 text-white placeholder-[#b0b0b0] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8b5cf6] transition-colors" />
            <input type="password" placeholder="Contraseña (mín. 8 caracteres)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full bg-[#2a1a4e] border border-white/10 text-white placeholder-[#b0b0b0] px-4 py-3 rounded-xl focus:outline-none focus:border-[#8b5cf6] transition-colors" />
            <button type="submit" className="w-full gradient-magenta text-white font-semibold py-4 rounded-full hover:opacity-90 transition-all">
              Continuar →
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          <div>
            <h2 className="text-white font-semibold text-lg mb-1">¿Cuál es tu rol?</h2>
            <p className="text-[#b0b0b0] text-sm">Puedes seleccionar varios</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(role => (
              <button key={role.id} onClick={() => toggleRole(role.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRoles.includes(role.id)
                    ? 'border-[#e91e8c] bg-[#e91e8c]/10 text-white'
                    : 'border-white/10 bg-[#1a0a2e] text-[#b0b0b0] hover:border-white/25'
                }`}>
                <span className="text-xl">{role.emoji}</span>
                <p className="text-xs mt-1 font-medium">{role.label}</p>
              </button>
            ))}
          </div>
          <button onClick={handleSignup} disabled={loading || selectedRoles.length === 0}
            className="w-full gradient-magenta text-white font-semibold py-4 rounded-full hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
          </button>
        </div>
      )}

      <p className="text-[#b0b0b0] text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-[#e91e8c] font-medium hover:underline">Iniciar sesión</Link>
      </p>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'google' | 'email'>('google')

  async function handleGoogleLogin() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/home` },
    })
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <>
      {/* Background glow orbs */}
      <div className="bg-glow w-[500px] h-[500px] -top-32 -left-32"
        style={{ background: 'radial-gradient(circle, rgba(123,47,255,0.2) 0%, transparent 70%)' }} />
      <div className="bg-glow w-[400px] h-[400px] -bottom-20 -right-20"
        style={{ background: 'radial-gradient(circle, rgba(255,26,140,0.14) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm px-6 py-12 flex flex-col items-center gap-8 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-5">
          <Image src="/isologo.png" alt="Mooseeka" width={72} height={72} className="object-contain" />
          <div className="text-center">
            <h1 className="text-4xl font-black gradient-text tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              mooseeka
            </h1>
            <p className="text-center mt-3 text-sm leading-relaxed max-w-xs" style={{ color: '#C0A8D8' }}>
              Bienvenido a mooseeka, la plataforma que conecta artistas y profesionales de la industria de la música.
            </p>
          </div>
        </div>

        {/* Auth */}
        {mode === 'google' ? (
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-black font-bold py-4 rounded-full flex items-center justify-center gap-3 hover:bg-gray-100 transition-all disabled:opacity-60 text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Cargando...' : 'Continuar con Google'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(123,47,255,0.2)' }} />
              <span className="text-xs" style={{ color: '#7A6890' }}>o</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(123,47,255,0.2)' }} />
            </div>

            <button
              onClick={() => setMode('email')}
              className="w-full font-medium py-4 rounded-full text-sm transition-all"
              style={{ border: '1px solid rgba(123,47,255,0.3)', color: '#C0A8D8' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.6)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.3)')}
            >
              Continuar con email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-3">
            <input
              type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full text-white placeholder-[#7A6890] px-4 py-3 rounded-xl focus:outline-none transition-colors text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(123,47,255,0.25)' }}
            />
            <input
              type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full text-white placeholder-[#7A6890] px-4 py-3 rounded-xl focus:outline-none transition-colors text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(123,47,255,0.25)' }}
            />
            <button type="submit" disabled={loading}
              className="w-full text-white font-bold py-4 rounded-full hover:opacity-90 transition-all disabled:opacity-60 gradient-magenta glow-btn text-sm">
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
            <button type="button" onClick={() => setMode('google')}
              className="text-sm transition-colors" style={{ color: '#7A6890' }}>
              ← Volver
            </button>
          </form>
        )}

        <p className="text-xs text-center" style={{ color: '#7A6890' }}>
          Al continuar, aceptas nuestros{' '}
          <Link href="#" className="hover:underline" style={{ color: '#A855F7' }}>Términos</Link>
          {' '}y{' '}
          <Link href="#" className="hover:underline" style={{ color: '#A855F7' }}>Política de Privacidad</Link>
        </p>

        <p className="text-sm" style={{ color: '#7A6890' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#FF1A8C' }}>Regístrate</Link>
        </p>
      </div>
    </>
  )
}

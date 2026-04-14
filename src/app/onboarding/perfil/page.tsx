'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ArrowRight, User, Check, X, ImagePlus } from 'lucide-react'
import StepProgress from '@/components/onboarding/StepProgress'
import { useOnboarding } from '../context'
import { createClient } from '@/lib/supabase/client'

function toSlug(s: string) {
  return s.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9._]/g, '').slice(0, 20)
}

export default function OnboardingPerfil() {
  const router = useRouter()
  const { name, username, avatarPreview, bannerPreview, update } = useOnboarding()

  const [localName, setLocalName]         = useState(name)
  const [localUsername, setLocalUsername] = useState(username)
  const [localAvatar, setLocalAvatar]     = useState<string | null>(avatarPreview)
  const [avatarFile, setAvatarFile]       = useState<File | null>(null)
  const [localBanner, setLocalBanner]     = useState<string | null>(bannerPreview)
  const [bannerFile, setBannerFile]       = useState<File | null>(null)
  const [draggingAvatar, setDraggingAvatar] = useState(false)
  const [draggingBanner, setDraggingBanner] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const checkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-fill from Google auth on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const authName = user.user_metadata?.full_name || user.user_metadata?.name || ''
      const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

      if (!localName && authName) {
        setLocalName(authName)
        const slug = toSlug(authName)
        setLocalUsername(slug)
        checkUsername(slug)
      }
      if (!localAvatar && googleAvatar) {
        setLocalAvatar(googleAvatar)
        // Mark as Google URL (no file), will be saved directly
        update({ avatarPreview: googleAvatar })
      }
    })
  }, [])

  function handleAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setLocalAvatar(url)
    setAvatarFile(file)
  }

  function handleBannerFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setLocalBanner(url)
    setBannerFile(file)
  }

  function handleNameChange(v: string) {
    setLocalName(v)
    if (!localUsername || localUsername === toSlug(localName)) {
      const slug = toSlug(v)
      setLocalUsername(slug)
      checkUsername(slug)
    }
  }

  function handleUsernameChange(v: string) {
    const slug = toSlug(v)
    setLocalUsername(slug)
    checkUsername(slug)
  }

  function checkUsername(slug: string) {
    if (checkTimeout.current) clearTimeout(checkTimeout.current)
    if (slug.length < 2) { setUsernameStatus('idle'); return }
    setUsernameStatus('checking')
    checkTimeout.current = setTimeout(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', slug)
        .neq('id', user?.id ?? '')
        .maybeSingle()
      setUsernameStatus(data ? 'taken' : 'available')
    }, 500)
  }

  function handleContinue() {
    update({
      name: localName,
      username: localUsername,
      avatarFile,
      avatarPreview: localAvatar,
      bannerFile,
      bannerPreview: localBanner,
    })
    router.push('/onboarding/roles')
  }

  const canContinue =
    localName.trim().length >= 2 &&
    localUsername.trim().length >= 2 &&
    usernameStatus !== 'taken' &&
    usernameStatus !== 'checking'

  return (
    <div className="w-full max-w-md">
      <StepProgress current={1} />

      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
          Crea tu perfil
        </h1>
        <p style={{ color: '#C0A8D8' }} className="text-sm leading-relaxed">
          Así te van a conocer los demás profesionales de la industria.
        </p>
      </div>

      {/* Banner upload */}
      <div className="mb-6">
        <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#7A6890' }}>
          Foto de portada <span style={{ color: '#7A6890' }}>· opcional</span>
        </label>
        <div
          onClick={() => bannerRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDraggingBanner(true) }}
          onDragLeave={() => setDraggingBanner(false)}
          onDrop={e => { e.preventDefault(); setDraggingBanner(false); const f = e.dataTransfer.files?.[0]; if (f) handleBannerFile(f) }}
          className="relative w-full h-28 rounded-2xl overflow-hidden cursor-pointer group"
          style={{
            border: draggingBanner ? '2px solid #FF1A8C' : '2px dashed rgba(123,47,255,0.4)',
            background: 'rgba(25,0,50,0.6)',
            transition: 'border-color 0.2s',
          }}>
          {localBanner ? (
            <img src={localBanner} alt="banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <ImagePlus size={24} style={{ color: '#7A6890' }} />
              <p className="text-xs" style={{ color: '#7A6890' }}>Subir foto de portada</p>
            </div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            <Camera size={20} className="text-white" />
            <span className="text-white text-xs font-medium">{localBanner ? 'Cambiar portada' : 'Subir portada'}</span>
          </div>
          {localBanner && (
            <button
              onClick={e => { e.stopPropagation(); setLocalBanner(null); setBannerFile(null) }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white z-10"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <X size={14} />
            </button>
          )}
        </div>
        <input ref={bannerRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleBannerFile(f) }} />
      </div>

      {/* Avatar upload */}
      <div className="flex flex-col items-center mb-8">
        <div
          onClick={() => avatarRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDraggingAvatar(true) }}
          onDragLeave={() => setDraggingAvatar(false)}
          onDrop={e => { e.preventDefault(); setDraggingAvatar(false); const f = e.dataTransfer.files?.[0]; if (f) handleAvatarFile(f) }}
          className="relative w-24 h-24 rounded-full cursor-pointer group"
          style={{
            border: draggingAvatar ? '2px solid #FF1A8C' : '2px solid rgba(123,47,255,0.5)',
            background: 'rgba(25,0,50,0.6)',
            transition: 'border-color 0.2s',
          }}>
          {localAvatar ? (
            <img src={localAvatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <User size={32} style={{ color: '#7A6890' }} />
            </div>
          )}
          <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.6)' }}>
            <Camera size={18} className="text-white" />
            <span className="text-white text-xs mt-1 font-medium">Cambiar</span>
          </div>
        </div>
        <input ref={avatarRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f) }} />
        <p className="text-xs mt-2" style={{ color: '#7A6890' }}>
          {localAvatar ? 'Foto de perfil · click para cambiar' : 'Foto de perfil · opcional'}
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
            Nombre completo *
          </label>
          <input
            value={localName} onChange={e => handleNameChange(e.target.value)}
            placeholder="Tu nombre o nombre artístico"
            className="w-full px-4 py-3 rounded-xl text-white placeholder-[#7A6890] text-sm focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.6)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>
            Nombre de usuario *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#7A6890' }}>@</span>
            <input
              value={localUsername} onChange={e => handleUsernameChange(e.target.value)}
              placeholder="tu_usuario"
              className="w-full pl-8 pr-10 py-3 rounded-xl text-white placeholder-[#7A6890] text-sm focus:outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.6)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')}
            />
            {usernameStatus === 'checking' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#7A6890' }}>...</span>
            )}
            {usernameStatus === 'available' && (
              <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#22c55e' }} />
            )}
            {usernameStatus === 'taken' && (
              <X size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#ef4444' }} />
            )}
          </div>
          {localUsername && usernameStatus !== 'taken' && (
            <p className="text-xs mt-1.5" style={{ color: '#7A6890' }}>
              Tu perfil será <span style={{ color: '#A855F7' }}>mooseeka.com/@{localUsername}</span>
            </p>
          )}
          {usernameStatus === 'taken' && (
            <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>
              Este usuario ya está en uso. Prueba otro.
            </p>
          )}
        </div>
      </div>

      <button
        disabled={!canContinue}
        onClick={handleContinue}
        className="w-full py-3.5 rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30 gradient-magenta glow-btn hover:opacity-90">
        Continuar
        <ArrowRight size={18} />
      </button>
    </div>
  )
}

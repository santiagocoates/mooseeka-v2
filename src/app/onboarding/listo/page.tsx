'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useOnboarding } from '../context'
import { createClient } from '@/lib/supabase/client'

async function uploadFile(supabase: ReturnType<typeof createClient>, bucket: string, path: string, file: File) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export default function OnboardingListo() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)
  const [saving, setSaving] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { name, username, avatarFile, avatarPreview, bannerFile, roles, genres, objetivo } = useOnboarding()

  useEffect(() => {
    async function save() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setError('No hay sesión activa.'); setSaving(false); return }

        let avatar_url: string | undefined
        let cover_url: string | undefined

        // Upload avatar file if user chose a new one
        if (avatarFile) {
          const ext = avatarFile.name.split('.').pop()
          const url = await uploadFile(supabase, 'avatars', `${user.id}/avatar.${ext}`, avatarFile)
          if (url) avatar_url = url
        } else if (avatarPreview) {
          // Use Google photo URL directly
          avatar_url = avatarPreview
        }

        // Upload banner
        if (bannerFile) {
          const ext = bannerFile.name.split('.').pop()
          const url = await uploadFile(supabase, 'avatars', `${user.id}/banner.${ext}`, bannerFile)
          if (url) cover_url = url
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            name: name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            username: username || user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || user.id.slice(0, 8),
            ...(avatar_url ? { avatar_url } : {}),
            ...(cover_url ? { cover_url } : {}),
            roles,
            genres,
            objetivo,
            onboarding_completed: true,
          }, { onConflict: 'id' })

        if (updateError) throw updateError
      } catch (err: unknown) {
        console.error('Onboarding save error:', err)
        setError('Hubo un error al guardar. Intenta de nuevo.')
      } finally {
        setSaving(false)
      }
    }
    save()
  }, [])

  useEffect(() => {
    if (saving || error) return
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(t); router.push('/home'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [saving, error, router])

  if (saving) {
    return (
      <div className="w-full max-w-md flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
          style={{ background: 'linear-gradient(135deg, rgba(139,63,255,0.3), rgba(255,26,140,0.3))' }}>
          <Image src="/isologo.png" alt="Mooseeka" width={40} height={40} className="object-contain" />
        </div>
        <p className="text-white font-semibold">Guardando tu perfil...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-md flex flex-col items-center text-center gap-6">
        <p style={{ color: '#ef4444' }} className="font-semibold">{error}</p>
        <button onClick={() => router.push('/home')}
          className="px-6 py-3 rounded-full text-white font-bold gradient-magenta">
          Ir a Mooseeka de todos modos
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center text-center gap-8">
      <div className="relative">
        <div className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(139,63,255,0.2), rgba(255,26,140,0.2))', border: '2px solid rgba(139,63,255,0.4)' }}>
          <Image src="/isologo.png" alt="Mooseeka" width={64} height={64} className="object-contain" />
        </div>
        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' }} />
      </div>

      <div>
        <h1 className="text-4xl font-black text-white mb-3" style={{ letterSpacing: '-0.03em' }}>
          ¡Ya eres parte de<br />
          <span className="gradient-text">mooseeka!</span>
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#C0A8D8' }}>
          Tu perfil está listo. Empieza a conectar con los mejores profesionales de la industria musical latinoamericana.
        </p>
      </div>

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

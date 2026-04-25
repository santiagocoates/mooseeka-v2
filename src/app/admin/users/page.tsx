'use client'

import { useState, useEffect } from 'react'
import { Search, ShieldCheck, ShieldOff, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  name: string
  username: string
  avatar_url: string | null
  roles: string[] | null
  is_admin: boolean
  is_suspended: boolean | null
  onboarding_completed: boolean | null
  created_at: string
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, roles, is_admin, is_suspended, onboarding_completed, created_at')
        .order('created_at', { ascending: false })
        .limit(100)
      setProfiles((data ?? []) as Profile[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = profiles.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  )

  async function toggleAdmin(profile: Profile) {
    setToggling(profile.id)
    const supabase = createClient()
    await supabase.from('profiles').update({ is_admin: !profile.is_admin }).eq('id', profile.id)
    setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_admin: !p.is_admin } : p))
    setToggling(null)
  }

  async function toggleSuspend(profile: Profile) {
    setToggling(profile.id + '_suspend')
    const supabase = createClient()
    await supabase.from('profiles').update({ is_suspended: !profile.is_suspended }).eq('id', profile.id)
    setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_suspended: !p.is_suspended } : p))
    setToggling(null)
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Usuarios</h1>
          <p className="text-sm mt-1" style={{ color: '#7A6890' }}>
            {loading ? '...' : `${profiles.length} usuarios registrados`}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.2)' }}>
          <Search size={15} style={{ color: '#7A6890' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="bg-transparent text-sm text-white placeholder-[#7A6890] focus:outline-none w-48" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: '#8B3FFF' }} />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-wider"
            style={{ color: '#7A6890', borderBottom: '1px solid rgba(123,47,255,0.12)', background: 'rgba(0,0,0,0.2)' }}>
            <div className="col-span-4">Usuario</div>
            <div className="col-span-3">Rol</div>
            <div className="col-span-2 text-center">Admin</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y" style={{ borderColor: 'rgba(123,47,255,0.08)' }}>
            {filtered.length === 0 && (
              <div className="text-center py-12" style={{ color: '#7A6890' }}>
                No hay usuarios que coincidan
              </div>
            )}
            {filtered.map(user => (
              <div key={user.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors">
                {/* Avatar + info */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0"
                      style={{ border: '2px solid rgba(123,47,255,0.3)' }} />
                  ) : (
                    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                      {user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs truncate" style={{ color: '#7A6890' }}>@{user.username}</p>
                  </div>
                </div>

                {/* Roles */}
                <div className="col-span-3">
                  <p className="text-xs truncate" style={{ color: '#C0A8D8' }}>
                    {user.roles?.slice(0, 2).join(' · ') || '—'}
                  </p>
                </div>

                {/* Admin toggle */}
                <div className="col-span-2 flex justify-center">
                  <button onClick={() => toggleAdmin(user)} disabled={toggling === user.id}
                    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-all"
                    style={user.is_admin
                      ? { background: 'rgba(255,26,140,0.15)', color: '#FF1A8C', border: '1px solid rgba(255,26,140,0.35)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#7A6890', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {toggling === user.id
                      ? <Loader2 size={10} className="animate-spin" />
                      : user.is_admin ? <ShieldCheck size={11} /> : <ShieldOff size={11} />
                    }
                    {user.is_admin ? 'Admin' : 'User'}
                  </button>
                </div>

                {/* Estado */}
                <div className="col-span-2">
                  {user.is_suspended ? (
                    <button onClick={() => toggleSuspend(user)} disabled={toggling === user.id + '_suspend'}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all hover:opacity-80"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                      Suspendido
                    </button>
                  ) : user.onboarding_completed ? (
                    <button onClick={() => toggleSuspend(user)} disabled={toggling === user.id + '_suspend'}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all hover:opacity-80"
                      style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                      Activo
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                      Sin onboarding
                    </span>
                  )}
                </div>

                {/* Ver perfil */}
                <div className="col-span-1 flex justify-end">
                  <Link href={`/${user.username}`} target="_blank"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
                    style={{ color: '#7A6890' }}>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

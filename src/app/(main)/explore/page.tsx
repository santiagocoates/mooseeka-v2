'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, UserPlus, UserCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

interface Profile {
  id: string
  name: string
  username: string
  avatar_url: string | null
  roles: string[] | null
  bio: string | null
}

const ALL_ROLES = [
  'Artista', 'Productor', 'DJ', 'Compositor', 'Cantante',
  'Ingeniero de mezcla', 'Masterización', 'Manager',
  'Diseñador', 'Videógrafo', 'Fotógrafo',
]

export default function ExplorePage() {
  const currentUser = useCurrentUser()
  const [search,      setSearch]      = useState('')
  const [activeRole,  setActiveRole]  = useState<string | null>(null)
  const [profiles,    setProfiles]    = useState<Profile[]>([])
  const [loading,     setLoading]     = useState(true)
  const [following,   setFollowing]   = useState<Set<string>>(new Set())
  const [toggling,    setToggling]    = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cargar perfiles que sigo actualmente
  useEffect(() => {
    if (!currentUser) return
    const supabase = createClient()
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id)
      .then(({ data }) => {
        if (data) setFollowing(new Set(data.map(r => r.following_id)))
      })
  }, [currentUser])

  const fetchProfiles = useCallback(async (q: string, role: string | null) => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('profiles')
      .select('id, name, username, avatar_url, roles, bio')
      .eq('onboarding_completed', true)
      .limit(24)

    if (q.trim()) {
      query = query.ilike('name', `%${q.trim()}%`)
    }
    if (role) {
      query = query.contains('roles', [role])
    }
    if (!q.trim() && !role) {
      query = query.order('created_at', { ascending: false })
    }

    const { data } = await query
    setProfiles((data ?? []).filter(p => p.id !== currentUser?.id))
    setLoading(false)
  }, [currentUser?.id])

  // Debounce en el input de búsqueda
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchProfiles(search, activeRole)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, activeRole, fetchProfiles])

  async function toggleFollow(profileId: string) {
    if (!currentUser || toggling.has(profileId)) return
    setToggling(prev => new Set(prev).add(profileId))
    const supabase = createClient()
    const isFollowing = following.has(profileId)

    if (isFollowing) {
      await supabase.from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profileId)
      setFollowing(prev => { const s = new Set(prev); s.delete(profileId); return s })
    } else {
      await supabase.from('follows')
        .insert({ follower_id: currentUser.id, following_id: profileId })
      setFollowing(prev => new Set(prev).add(profileId))
    }
    setToggling(prev => { const s = new Set(prev); s.delete(profileId); return s })
  }

  const isSearching = search.trim() !== '' || activeRole !== null

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

      {/* Header */}
      <h1 className="text-white text-2xl font-black" style={{ letterSpacing: '-0.02em' }}>
        Explora.
      </h1>

      {/* Search */}
      <div className="relative">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#7A6890' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full text-white placeholder-[#7A6890] pl-11 pr-4 py-3.5 rounded-xl focus:outline-none text-sm transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.25)' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.55)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.25)')}
        />
      </div>

      {/* Filtro por rol */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveRole(null)}
          className="shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all"
          style={{
            background: activeRole === null ? 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' : 'rgba(255,255,255,0.06)',
            color: activeRole === null ? '#fff' : '#7A6890',
            border: activeRole === null ? 'none' : '1px solid rgba(123,47,255,0.2)',
          }}>
          Todos
        </button>
        {ALL_ROLES.map(role => (
          <button
            key={role}
            onClick={() => setActiveRole(activeRole === role ? null : role)}
            className="shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{
              background: activeRole === role ? 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' : 'rgba(255,255,255,0.06)',
              color: activeRole === role ? '#fff' : '#7A6890',
              border: activeRole === role ? 'none' : '1px solid rgba(123,47,255,0.2)',
            }}>
            {role}
          </button>
        ))}
      </div>

      {/* Título sección */}
      <div className="flex items-center gap-2">
        <span className="text-base">{isSearching ? '🔍' : '🔥'}</span>
        <h2 className="text-white font-bold text-sm">
          {isSearching ? 'Resultados' : 'Perfiles recientes'}
        </h2>
        {!loading && (
          <span className="text-xs ml-auto" style={{ color: '#7A6890' }}>
            {profiles.length} {profiles.length === 1 ? 'perfil' : 'perfiles'}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl p-4 animate-pulse flex gap-4"
              style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
              <div className="w-14 h-14 rounded-full shrink-0"
                style={{ background: 'rgba(123,47,255,0.2)' }} />
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <div className="h-3 w-36 rounded" style={{ background: 'rgba(123,47,255,0.15)' }} />
                <div className="h-2 w-24 rounded" style={{ background: 'rgba(123,47,255,0.1)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {!loading && profiles.length === 0 && (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: 'rgba(25,0,50,0.4)', border: '1px dashed rgba(123,47,255,0.25)' }}>
          <p className="text-3xl mb-3">🎵</p>
          <p className="text-white font-semibold text-sm mb-1">
            {isSearching ? 'Sin resultados' : 'Aún no hay perfiles'}
          </p>
          <p className="text-xs" style={{ color: '#7A6890' }}>
            {isSearching ? 'Probá con otro nombre o rol.' : 'Sé el primero en unirte.'}
          </p>
        </div>
      )}

      {/* Grid de perfiles */}
      {!loading && profiles.length > 0 && (
        <div className="flex flex-col gap-3">
          {profiles.map(profile => {
            const isFollowing = following.has(profile.id)
            const isToggling  = toggling.has(profile.id)
            const roleStr     = profile.roles?.slice(0, 2).join(' · ') || 'Mooseeka'

            return (
              <div key={profile.id}
                className="rounded-2xl p-4 flex items-center gap-4 transition-all"
                style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.38)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.18)')}>

                {/* Avatar */}
                <Link href={`/${profile.username}`} className="shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name}
                      className="w-14 h-14 rounded-full object-cover"
                      style={{ border: '2px solid rgba(123,47,255,0.4)' }} />
                  ) : (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg"
                      style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', border: '2px solid rgba(123,47,255,0.4)' }}>
                      {profile.name[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/${profile.username}`}
                    className="text-white font-bold text-sm hover:underline truncate block">
                    {profile.name}
                  </Link>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#C0A8D8' }}>{roleStr}</p>
                  {profile.bio && (
                    <p className="text-xs mt-1 line-clamp-1" style={{ color: '#7A6890' }}>{profile.bio}</p>
                  )}
                </div>

                {/* Follow button */}
                {currentUser && (
                  <button
                    onClick={() => toggleFollow(profile.id)}
                    disabled={isToggling}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all"
                    style={isFollowing ? {
                      background: 'rgba(139,63,255,0.15)',
                      color: '#A855F7',
                      border: '1px solid rgba(139,63,255,0.4)',
                    } : {
                      background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)',
                      color: '#fff',
                    }}>
                    {isToggling
                      ? <Loader2 size={13} className="animate-spin" />
                      : isFollowing
                        ? <><UserCheck size={13} /> Siguiendo</>
                        : <><UserPlus size={13} /> Seguir</>
                    }
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

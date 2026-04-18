'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { Pencil, Upload, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import EditProfileModal from '@/components/profile/EditProfileModal'
import ShareModal from '@/components/shared/ShareModal'
import { SocialLinks } from '@/components/profile/SocialIcons'
import PortfolioSection from '@/components/profile/PortfolioSection'
import ExperienceSection from '@/components/profile/ExperienceSection'
import PostsSection from '@/components/profile/PostsSection'

const BASE_URL = 'https://mooseeka.com'

interface Profile {
  id: string
  username: string
  name: string
  avatar_url: string | null
  cover_url: string | null
  bio: string | null
  role: string | null
  roles: string[] | null
  location: string | null
  social_links: Record<string, string> | null
  objetivo: string | null
  is_seller: boolean
  created_at: string
}

interface Service {
  id: string
  title: string
  price: number
  currency: string
  category: string | null
  rating_avg: number
  rating_count: number
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-52 w-full rounded-none" style={{ background: 'rgba(25,0,50,0.8)' }} />
      <div className="px-4 md:px-6 pb-8 -mt-10">
        <div className="flex justify-between mb-5">
          <div className="w-24 h-24 rounded-full" style={{ background: 'rgba(123,47,255,0.2)' }} />
          <div className="w-28 h-9 rounded-full mt-auto" style={{ background: 'rgba(123,47,255,0.1)' }} />
        </div>
        <div className="h-6 w-40 rounded mb-2" style={{ background: 'rgba(123,47,255,0.1)' }} />
        <div className="h-4 w-32 rounded" style={{ background: 'rgba(123,47,255,0.07)' }} />
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-4xl">👤</p>
      <p className="text-white font-bold text-lg">Perfil no encontrado</p>
      <p className="text-sm" style={{ color: '#7A6890' }}>Este usuario no existe en Mooseeka.</p>
      <Link href="/home" className="mt-2 px-5 py-2.5 rounded-full text-white font-bold text-sm gradient-magenta">
        Volver al inicio
      </Link>
    </div>
  )
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)

  const [profile, setProfile]           = useState<Profile | null>(null)
  const [services, setServices]         = useState<Service[]>([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [currentUserId, setCurrentUserId]   = useState<string | null>(null)
  const [isFollowing, setIsFollowing]   = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [loading, setLoading]           = useState(true)
  const [notFound, setNotFound]         = useState(false)
  const [editOpen, setEditOpen]         = useState(false)
  const [shareOpen, setShareOpen]       = useState(false)

  const loadProfile = useCallback(async () => {
    const supabase = createClient()

    const [{ data: { user } }, { data: profileData, error }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('profiles').select('*').eq('username', username).single(),
    ])

    setCurrentUserId(user?.id ?? null)

    if (error || !profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(profileData)

    const followersQ = supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileData.id)
    const followingQ = supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileData.id)
    const svcsQ      = supabase.from('services').select('id, title, price, currency, category, rating_avg, rating_count')
      .eq('seller_id', profileData.id).eq('is_active', true).limit(6)
    const isFollowQ  = user
      ? supabase.from('follows').select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id).eq('following_id', profileData.id)
      : Promise.resolve({ count: null })

    const results = await Promise.all([followersQ, followingQ, svcsQ, isFollowQ])
    const [followersRes, followingRes, svcsRes] = results as [
      { count: number | null }, { count: number | null }, { data: Service[] | null }, { count: number | null }?
    ]

    setFollowersCount(followersRes.count ?? 0)
    setFollowingCount(followingRes.count ?? 0)
    setServices(svcsRes.data ?? [])
    if (user && results[3]) {
      setIsFollowing(((results[3] as { count: number | null }).count ?? 0) > 0)
    }
    setLoading(false)
  }, [username])

  useEffect(() => { loadProfile() }, [loadProfile])

  async function toggleFollow() {
    if (!currentUserId || !profile || followLoading) return
    setFollowLoading(true)
    const supabase = createClient()
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUserId).eq('following_id', profile.id)
      setIsFollowing(false)
      setFollowersCount(c => c - 1)
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: profile.id })
      setIsFollowing(true)
      setFollowersCount(c => c + 1)
    }
    setFollowLoading(false)
  }

  if (loading) return <ProfileSkeleton />
  if (notFound) return <NotFound />
  if (!profile) return null

  const isOwner = currentUserId === profile.id
  const displayRoles = profile.roles?.length ? profile.roles.join(' · ') : profile.role ?? ''
  const profileUrl = `${BASE_URL}/${profile.username}`
  const memberSince = new Date(profile.created_at).toLocaleDateString('es', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto">
      {/* Banner */}
      <div className="h-36 md:h-52 w-full relative overflow-hidden">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="portada" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #0A0014, #15002A, #0A0014)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(10,0,20,0.9) 100%)' }} />
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 pb-8 relative">
        {/* Avatar + actions */}
        <div className="flex items-end justify-between -mt-10 md:-mt-14 mb-4 md:mb-5">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
              style={{ border: '3px solid #0A0014', outline: '2px solid rgba(123,47,255,0.5)' }} />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl font-black"
              style={{ border: '3px solid #0A0014', outline: '2px solid rgba(123,47,255,0.5)', background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }}>
              {profile.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pb-1 justify-end">
            {isOwner ? (
              <button onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 font-semibold text-xs md:text-sm px-3 md:px-5 py-2 rounded-full transition-all"
                style={{ border: '1px solid rgba(123,47,255,0.45)', color: '#C0A8D8' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.8)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.45)')}>
                <Pencil size={13} />
                <span className="hidden sm:inline">Editar perfil</span>
                <span className="sm:hidden">Editar</span>
              </button>
            ) : (
              <>
                <button className="font-medium text-xs md:text-sm px-3 md:px-5 py-2 rounded-full transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#C0A8D8' }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}>
                  Contactar
                </button>
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className="font-bold text-xs md:text-sm px-3 md:px-5 py-2 rounded-full transition-all disabled:opacity-60"
                  style={isFollowing
                    ? { border: '1px solid rgba(123,47,255,0.5)', color: '#C0A8D8', background: 'transparent' }
                    : { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }}
                  onMouseOver={e => { if (isFollowing) e.currentTarget.style.borderColor = 'rgba(255,50,50,0.6)'; e.currentTarget.style.color = isFollowing ? '#ff6b6b' : '#fff' }}
                  onMouseOut={e => { if (isFollowing) e.currentTarget.style.borderColor = 'rgba(123,47,255,0.5)'; e.currentTarget.style.color = isFollowing ? '#C0A8D8' : '#fff' }}>
                  {followLoading ? '...' : isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              </>
            )}
            <button onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 font-semibold text-xs md:text-sm px-3 md:px-4 py-2 rounded-full transition-all"
              style={{ border: '1px solid rgba(123,47,255,0.3)', color: '#C0A8D8' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.7)'; e.currentTarget.style.color = '#fff' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(123,47,255,0.3)'; e.currentTarget.style.color = '#C0A8D8' }}>
              <Upload size={13} />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          </div>
        </div>

        {/* Name + roles */}
        <h1 className="text-white text-xl md:text-2xl font-black mb-0.5" style={{ letterSpacing: '-0.02em' }}>{profile.name}</h1>
        {displayRoles && <p className="text-sm mb-1" style={{ color: '#C0A8D8' }}>{displayRoles}</p>}
        <p className="text-xs mb-3" style={{ color: '#7A6890' }}>mooseeka.com/{profile.username}</p>

        {/* Social links */}
        {profile.social_links && Object.values(profile.social_links).some(v => v?.trim()) && (
          <div className="mb-4">
            <SocialLinks socials={profile.social_links} />
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-5 mb-5">
          <div>
            <p className="text-white font-black text-lg">{followersCount}</p>
            <p className="text-xs" style={{ color: '#7A6890' }}>seguidores</p>
          </div>
          <div>
            <p className="text-white font-black text-lg">{followingCount}</p>
            <p className="text-xs" style={{ color: '#7A6890' }}>siguiendo</p>
          </div>
          {services.length > 0 && (
            <div>
              <p className="text-white font-black text-lg">{services.length}</p>
              <p className="text-xs" style={{ color: '#7A6890' }}>servicios</p>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#C0A8D8' }}>{profile.bio}</p>
        )}

        {/* Main content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            {/* Posts / Activity feed */}
            <PostsSection profileId={profile.id} isOwner={isOwner} />

            {/* Portfolio */}
            <PortfolioSection profileId={profile.id} isOwner={isOwner} />

            {/* Experience */}
            <ExperienceSection profileId={profile.id} isOwner={isOwner} />

            {/* Services */}
            {(services.length > 0 || isOwner) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold">Servicios</h3>
                  {isOwner && (
                    <Link href="/services/new"
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-80 transition-all"
                      style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }}>
                      + Agregar
                    </Link>
                  )}
                </div>
                {services.length === 0 && isOwner && (
                  <div className="rounded-xl p-6 flex flex-col items-center gap-2 text-center"
                    style={{ background: 'rgba(25,0,50,0.6)', border: '1px dashed rgba(123,47,255,0.25)' }}>
                    <p className="text-sm" style={{ color: '#7A6890' }}>Aún no tienes servicios publicados.</p>
                    <Link href="/services/new" className="text-sm font-semibold" style={{ color: '#A855F7' }}>
                      Publicar mi primer servicio →
                    </Link>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {services.map(service => (
                    <Link key={service.id} href={`/services/${service.id}`}
                      className="flex items-center justify-between rounded-xl p-4 transition-all"
                      style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}
                      onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.45)')}
                      onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.18)')}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg gradient-magenta shrink-0">🎵</div>
                        <div>
                          <p className="text-white font-semibold text-sm">{service.title}</p>
                          <p className="font-black text-sm" style={{ color: '#FF1A8C' }}>
                            {service.currency} {service.price}
                          </p>
                        </div>
                      </div>
                      {service.rating_count > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="text-white text-sm font-semibold">{service.rating_avg.toFixed(1)}</span>
                          <span className="text-xs" style={{ color: '#7A6890' }}>({service.rating_count})</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="w-full md:w-56 shrink-0">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
              <h3 className="text-white font-bold text-sm mb-3">Info</h3>
              <div className="flex flex-col gap-2.5">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} style={{ color: '#7A6890' }} className="shrink-0" />
                    <span className="text-sm" style={{ color: '#C0A8D8' }}>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={13} style={{ color: '#7A6890' }} className="shrink-0" />
                  <span className="text-sm" style={{ color: '#C0A8D8' }}>Miembro desde {memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSave={(updated) => {
          setProfile(prev => prev ? { ...prev, ...updated } : prev)
          setEditOpen(false)
        }}
      />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={profileUrl}
        displayUrl={`mooseeka.com/${profile.username}`}
        shareText={`Mira el perfil de ${profile.name} en Mooseeka 🎵`}
        type="profile"
      />
    </div>
  )
}

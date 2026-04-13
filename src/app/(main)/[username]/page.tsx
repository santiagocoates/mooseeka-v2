'use client'

import { use, useState } from 'react'
import { Star, Pencil, Eye, TrendingUp, Share2, Upload } from 'lucide-react'
import Link from 'next/link'
import EditProfileModal from '@/components/profile/EditProfileModal'
import ExperienceSection from '@/components/profile/ExperienceSection'
import ShareModal from '@/components/shared/ShareModal'
import { SocialLinks } from '@/components/profile/SocialIcons'

const BASE_URL = 'https://mooseeka.com'

/* Mock "current user" — will come from Supabase auth later */
const CURRENT_USER = 'elenarios'

const MOCK_PROFILES: Record<string, any> = {
  elenarios: {
    name: 'Elena Ríos',
    username: 'elenarios',
    role: 'Productora Musical · Ingeniera Experimental',
    location: 'Barcelona, ES',
    bio: 'Especializada en diseño sonoro para proyectos indie y música experimental. Más de 10 años de experiencia transformando ideas abstractas en paisajes sonoros envolventes. He trabajado con sellos europeos y colectivos de vanguardia en Berlín y Barcelona.',
    avatar: '/users/productores.jpg',
    cover: '/covers/studio1.jpg',
    stats: { fans: '1.2K', following: 48, services: 15 },
    views: { total: '8.4K', thisWeek: 247, trend: '+12%', weekly: [52, 68, 44, 91, 73, 112, 103] },
    socials: { instagram: 'elenarios.music', tiktok: 'elenarios', spotify: '4Z8W4fKeB5YxbusRsdQVPb', youtube: '', soundcloud: '', twitter: '' },
    highlights: [
      { label: 'Ubicación', value: 'Barcelona, ES', icon: '📍' },
      { label: 'Álbum actual', value: '"Resonancia" (Álbum)', icon: '🎵' },
      { label: 'Activo desde', value: 'Enero 2024', icon: '⭐' },
    ],
    portfolio: [
      { title: 'Deep Oceans', cover: '/covers/studio2.jpg' },
      { title: 'Resonancia', cover: '/covers/art.jpg' },
      { title: 'Studio Session', cover: '/covers/studio3.jpg' },
    ],
    services: [
      { id: '1', title: 'Producción Musical', price: '€60/track', rating: 4.9, reviews: 95 },
    ],
  },
}

/* Fallback for unknown usernames */
const MOCK_PROFILE_BASE = MOCK_PROFILES.elenarios

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const profile = MOCK_PROFILES[username] ?? MOCK_PROFILE_BASE
  const [editOpen, setEditOpen]   = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [serviceShareId, setServiceShareId] = useState<string | null>(null)
  const isOwner = username === CURRENT_USER

  const profileUrl     = `${BASE_URL}/${profile.username}`
  const profileDisplay = `mooseeka.com/${profile.username}`

  const maxWeekly = Math.max(...profile.views.weekly)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover */}
      <div className="h-36 md:h-52 w-full relative overflow-hidden">
        {profile.cover ? (
          <img src={profile.cover} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #0A0014, #15002A)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(10,0,20,0.9) 100%)' }} />
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 pb-8 relative">
        {/* Avatar + Actions */}
        <div className="flex items-end justify-between -mt-10 md:-mt-14 mb-4 md:mb-5">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
            style={{ border: '3px solid #0A0014', outline: '2px solid rgba(123,47,255,0.5)' }}
          />
          {/* Action buttons */}
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
                <button className="text-white font-bold text-xs md:text-sm px-3 md:px-5 py-2 rounded-full hover:opacity-90 transition-all gradient-magenta glow-btn">
                  Colaborar
                </button>
              </>
            )}
            {/* Share — visible to everyone */}
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

        {/* Name + role */}
        <h1 className="text-white text-xl md:text-2xl font-black mb-0.5" style={{ letterSpacing: '-0.02em' }}>{profile.name}</h1>
        <p className="text-sm mb-1" style={{ color: '#C0A8D8' }}>{profile.role}</p>
        <p className="text-xs mb-3" style={{ color: '#7A6890' }}>mooseeka.com/{profile.username}</p>

        {/* Social links */}
        {'socials' in profile && (
          <div className="mb-4">
            <SocialLinks socials={(profile as typeof MOCK_PROFILES['elenarios']).socials} />
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-5 mb-5">
          <div>
            <p className="text-white font-black text-lg" style={{ letterSpacing: '-0.02em' }}>{profile.stats.fans}</p>
            <p className="text-xs" style={{ color: '#7A6890' }}>fans</p>
          </div>
          <div>
            <p className="text-white font-black text-lg">{profile.stats.following}</p>
            <p className="text-xs" style={{ color: '#7A6890' }}>siguiendo</p>
          </div>
          <div>
            <p className="text-white font-black text-lg">{profile.stats.services}</p>
            <p className="text-xs" style={{ color: '#7A6890' }}>servicios</p>
          </div>
          {isOwner && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <p className="text-white font-black text-lg" style={{ letterSpacing: '-0.02em' }}>{profile.views.total}</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                  style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  <TrendingUp size={9} />
                  {profile.views.trend}
                </span>
              </div>
              <p className="text-xs" style={{ color: '#7A6890' }}>visitas</p>
            </div>
          )}
        </div>

        <p className="text-sm leading-relaxed mb-6" style={{ color: '#C0A8D8' }}>{profile.bio}</p>

        {/* Main content — stacks on mobile, side by side on md+ */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1 min-w-0">

            {/* Portfolio */}
            <div className="mb-6">
              <h3 className="text-white font-bold mb-3">Portfolio</h3>
              <div className="flex gap-3">
                {profile.portfolio.map((item: any) => (
                  <div key={item.title} className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer group relative">
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      style={{ background: 'rgba(123,47,255,0.6)' }}>
                      <span className="text-white text-xs font-semibold text-center px-1">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <ExperienceSection isOwner={isOwner} />

            {/* Services */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">Servicios</h3>
                {isOwner && (
                  <Link href="/services/new"
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                    style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }}>
                    <span>+</span> Agregar
                  </Link>
                )}
              </div>
              {profile.services.map((service: any) => (
                <div key={service.id} className="flex items-center gap-2 group">
                  <Link href={`/services/${service.id}`}
                    className="flex-1 flex items-center justify-between rounded-xl p-4 transition-all"
                    style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.45)')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.18)')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg gradient-magenta">🎵</div>
                      <div>
                        <p className="text-white font-semibold text-sm">{service.title}</p>
                        <p className="font-black text-sm" style={{ color: '#FF1A8C' }}>{service.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400" fill="currentColor" />
                      <span className="text-white text-sm font-semibold">{service.rating}</span>
                      <span className="text-xs" style={{ color: '#7A6890' }}>({service.reviews})</span>
                    </div>
                  </Link>
                  {/* Share service — always visible on mobile, hover on desktop */}
                  <button
                    onClick={() => setServiceShareId(service.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all md:opacity-0 md:group-hover:opacity-100"
                    style={{ border: '1px solid rgba(123,47,255,0.25)', color: '#7A6890' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(123,47,255,0.15)'; e.currentTarget.style.color = '#fff' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A6890' }}>
                    <Share2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — full width on mobile, fixed width on md+ */}
          <div className="w-full md:w-56 shrink-0 flex flex-col gap-4">
            {/* Highlights */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
              <h3 className="text-white font-bold text-sm mb-3">Highlights</h3>
              {/* On mobile: horizontal scroll row. On md+: vertical list */}
              <div className="flex md:flex-col gap-4 md:gap-2.5 overflow-x-auto pb-1 md:pb-0">
                {profile.highlights.map((h: any) => (
                  <div key={h.label} className="flex items-start gap-2 shrink-0 md:shrink">
                    <span className="text-sm">{h.icon}</span>
                    <div>
                      <p className="text-xs whitespace-nowrap" style={{ color: '#7A6890' }}>{h.label}</p>
                      <p className="text-white text-xs font-semibold whitespace-nowrap">{h.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visits widget — owner only */}
            {isOwner && (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <Eye size={13} style={{ color: '#06b6d4' }} />
                    Visitas al perfil
                  </h3>
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-2xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                    {profile.views.thisWeek}
                  </span>
                  <span className="text-xs" style={{ color: '#7A6890' }}>esta semana</span>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                    style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                    <TrendingUp size={9} />
                    {profile.views.trend}
                  </span>
                </div>
                {/* Bar chart */}
                <div className="flex items-end gap-0.5 h-14 mb-2">
                  {profile.views.weekly.map((v: any, i: number) => (
                    <div key={i} className="flex-1 rounded-sm transition-all"
                      style={{
                        height: `${Math.round((v / maxWeekly) * 100)}%`,
                        background: i === profile.views.weekly.length - 1
                          ? 'linear-gradient(to top, #06b6d4, #22d3ee)'
                          : 'linear-gradient(to top, #8B3FFF, #7B2FFF)',
                      }} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px]" style={{ color: '#7A6890' }}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="mt-3 pt-3 flex justify-between" style={{ borderTop: '1px solid rgba(123,47,255,0.12)' }}>
                  <span className="text-xs" style={{ color: '#7A6890' }}>Total histórico</span>
                  <span className="text-xs font-bold text-white">{profile.views.total}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />

      {/* Profile share modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={profileUrl}
        displayUrl={profileDisplay}
        shareText={`Mira el perfil de ${profile.name} en Mooseeka — portafolio y servicios de música 🎵`}
        type="profile"
      />

      {/* Service share modals */}
      {profile.services.map((service: any) => (
        <ShareModal
          key={service.id}
          open={serviceShareId === service.id}
          onClose={() => setServiceShareId(null)}
          url={`${BASE_URL}/services/${service.id}`}
          displayUrl={`mooseeka.com/services/${service.id}`}
          shareText={`${service.title} por ${profile.name} en Mooseeka — ${service.price} 🎵`}
          type="service"
        />
      ))}
    </div>
  )
}

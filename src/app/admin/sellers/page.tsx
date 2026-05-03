'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Loader2, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface SellerProfile {
  id: string
  name: string
  username: string
  avatar_url: string | null
  roles: string[] | null
  created_at: string
  is_seller: boolean
  seller_requested: boolean
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  return `hace ${days} días`
}

function ProfileRow({
  profile,
  onApprove,
  approving,
}: {
  profile: SellerProfile
  onApprove?: (id: string) => void
  approving?: boolean
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl"
      style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt={profile.name} className="w-12 h-12 rounded-full object-cover shrink-0"
          style={{ border: '2px solid rgba(123,47,255,0.4)' }} />
      ) : (
        <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-lg font-black text-white"
          style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
          {profile.name?.[0]?.toUpperCase() ?? '?'}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-white font-bold truncate">{profile.name}</p>
        <p className="text-xs mb-1" style={{ color: '#7A6890' }}>
          @{profile.username} · {profile.roles?.slice(0, 2).join(' · ') || 'Mooseeka'}
        </p>
        <p className="text-xs" style={{ color: '#7A6890' }}>Miembro {timeAgo(profile.created_at)}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link href={`/${profile.username}`} target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
          style={{ background: 'rgba(123,47,255,0.15)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.3)' }}>
          <ExternalLink size={12} /> Ver perfil
        </Link>
        {onApprove && (
          <button
            onClick={() => onApprove(profile.id)}
            disabled={approving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 disabled:opacity-50 gradient-magenta text-white">
            <CheckCircle2 size={12} />
            {approving ? 'Aprobando...' : 'Aprobar'}
          </button>
        )}
        {profile.is_seller && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle2 size={11} /> Seller
          </span>
        )}
      </div>
    </div>
  )
}

export default function SellersPage() {
  const [pending,   setPending]   = useState<SellerProfile[]>([])
  const [approved,  setApproved]  = useState<SellerProfile[]>([])
  const [loading,   setLoading]   = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url, roles, created_at, is_seller, seller_requested')
      .or('is_seller.eq.true,seller_requested.eq.true')
      .order('created_at', { ascending: false })

    const profiles = (data ?? []) as SellerProfile[]
    setPending(profiles.filter(p => p.seller_requested && !p.is_seller))
    setApproved(profiles.filter(p => p.is_seller))
    setLoading(false)
  }

  async function approveSeller(id: string) {
    setApprovingId(id)
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ is_seller: true, seller_requested: false })
      .eq('id', id)
    await load()
    setApprovingId(null)
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Sellers</h1>
        <p className="text-sm mt-1" style={{ color: '#7A6890' }}>
          Gestioná solicitudes y sellers aprobados
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: '#8B3FFF' }} />
        </div>
      ) : (
        <>
          {/* Solicitudes pendientes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} style={{ color: '#f59e0b' }} />
              <h2 className="text-white font-bold">Solicitudes pendientes</h2>
              {pending.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  {pending.length}
                </span>
              )}
            </div>

            {pending.length === 0 ? (
              <div className="rounded-2xl p-8 text-center"
                style={{ background: 'rgba(20,0,40,0.4)', border: '1px dashed rgba(123,47,255,0.2)' }}>
                <p className="text-sm" style={{ color: '#7A6890' }}>No hay solicitudes pendientes.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pending.map(p => (
                  <ProfileRow
                    key={p.id}
                    profile={p}
                    onApprove={approveSeller}
                    approving={approvingId === p.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sellers aprobados */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
              <h2 className="text-white font-bold">Sellers aprobados</h2>
              {approved.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                  {approved.length}
                </span>
              )}
            </div>

            {approved.length === 0 ? (
              <div className="rounded-2xl p-8 text-center"
                style={{ background: 'rgba(20,0,40,0.4)', border: '1px dashed rgba(123,47,255,0.2)' }}>
                <p className="text-sm" style={{ color: '#7A6890' }}>
                  Todavía no hay sellers aprobados.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {approved.map(p => (
                  <ProfileRow key={p.id} profile={p} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

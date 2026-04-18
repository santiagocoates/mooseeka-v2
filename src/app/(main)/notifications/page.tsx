'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react'
import { useNotifications, Notification } from '@/lib/hooks/useNotifications'

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'ahora'
  if (mins  < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days  < 7)  return `${days}d`
  return new Date(dateStr).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

const TYPE_CONFIG = {
  follow:  { icon: UserPlus,      color: '#A855F7', text: 'te empezó a seguir'         },
  like:    { icon: Heart,         color: '#FF1A8C', text: 'le dio like a tu post'       },
  comment: { icon: MessageCircle, color: '#8B3FFF', text: 'comentó en tu post'          },
}

function NotifItem({ n }: { n: Notification }) {
  const cfg  = TYPE_CONFIG[n.type]
  const Icon = cfg.icon

  return (
    <div className="flex items-start gap-3 px-4 py-3.5 transition-all rounded-xl"
      style={{
        background: n.read ? 'transparent' : 'rgba(139,63,255,0.08)',
        border: '1px solid',
        borderColor: n.read ? 'rgba(123,47,255,0.12)' : 'rgba(139,63,255,0.25)',
      }}>

      {/* Avatar */}
      <Link href={`/${n.actor.username}`} className="relative shrink-0">
        {n.actor.avatar_url ? (
          <img src={n.actor.avatar_url} alt={n.actor.name}
            className="w-10 h-10 rounded-full object-cover"
            style={{ border: '2px solid rgba(123,47,255,0.4)' }} />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
            {n.actor.name[0]?.toUpperCase()}
          </div>
        )}
        {/* Ícono del tipo */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: cfg.color }}>
          <Icon size={10} className="text-white" fill="white" />
        </div>
      </Link>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: '#C0A8D8' }}>
          <Link href={`/${n.actor.username}`}
            className="font-bold text-white hover:underline mr-1">
            {n.actor.name}
          </Link>
          {cfg.text}
          {n.post_id && (
            <Link href="/home" className="ml-1 font-medium hover:underline"
              style={{ color: '#A855F7' }}>
              · Ver post
            </Link>
          )}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>{timeAgo(n.created_at)}</p>
      </div>

      {/* Punto de no leído */}
      {!n.read && (
        <div className="w-2 h-2 rounded-full shrink-0 mt-1.5"
          style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }} />
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead } = useNotifications()

  // Marcar todo leído al entrar
  useEffect(() => {
    if (unreadCount > 0) markAllRead()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-white" />
          <h1 className="text-white text-xl font-black" style={{ letterSpacing: '-0.02em' }}>
            Notificaciones
          </h1>
        </div>
        {unreadCount > 0 && (
          <span className="text-xs font-bold px-3 py-1 rounded-full text-white"
            style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
            {unreadCount} nuevas
          </span>
        )}
      </div>

      {/* Lista */}
      {notifications.length === 0 ? (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: 'rgba(25,0,50,0.4)', border: '1px dashed rgba(123,47,255,0.25)' }}>
          <p className="text-3xl mb-3">🔔</p>
          <p className="text-white font-semibold text-sm mb-1">Sin notificaciones</p>
          <p className="text-xs" style={{ color: '#7A6890' }}>
            Cuando alguien te siga, likee o comente, aparece acá.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(n => <NotifItem key={n.id} n={n} />)}
        </div>
      )}
    </div>
  )
}

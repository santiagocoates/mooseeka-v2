'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

export default function TopBar() {
  const router                      = useRouter()
  const { unreadCount, markAllRead } = useNotifications()
  const currentUser                 = useCurrentUser()

  function handleBell() {
    markAllRead()
    router.push('/notifications')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-end px-4 h-14 gap-2"
      style={{
        background: 'rgba(7,0,16,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(123,47,255,0.12)',
      }}>

      {currentUser === null ? (
        /* Usuario no autenticado — CTAs de conversión */
        <div className="flex items-center gap-2">
          <Link href="/login"
            className="text-sm font-semibold px-4 py-1.5 rounded-full transition-all"
            style={{ color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.35)' }}>
            Ingresar
          </Link>
          <Link href="/signup"
            className="text-sm font-bold px-4 py-1.5 rounded-full text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
            Registrarse
          </Link>
        </div>
      ) : (
        /* Usuario autenticado — campanita */
        <button onClick={handleBell} className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-white/5">
          <Bell size={20} style={{ color: unreadCount > 0 ? '#FF1A8C' : '#7A6890' }} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-black flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </header>
  )
}

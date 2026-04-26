'use client'

import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/lib/hooks/useNotifications'

export default function TopBar() {
  const router = useRouter()
  const { unreadCount, markAllRead } = useNotifications()

  function handleBell() {
    markAllRead()
    router.push('/notifications')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-end px-4 h-14"
      style={{
        background: 'rgba(7,0,16,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(123,47,255,0.12)',
      }}>
      <button onClick={handleBell} className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-white/5">
        <Bell size={20} style={{ color: unreadCount > 0 ? '#FF1A8C' : '#7A6890' }} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-black flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </header>
  )
}

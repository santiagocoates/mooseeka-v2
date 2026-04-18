'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Compass, Bell, User } from 'lucide-react'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useNotifications } from '@/lib/hooks/useNotifications'

export default function BottomNav() {
  const pathname    = usePathname()
  const currentUser = useCurrentUser()
  const { unreadCount } = useNotifications()

  const NAV_ITEMS = [
    { href: '/home',          icon: Home,        label: 'Inicio'   },
    { href: '/market',        icon: ShoppingBag, label: 'Market'   },
    { href: '/explore',       icon: Compass,     label: 'Explorar' },
    { href: '/notifications', icon: Bell,        label: 'Notifs',  badge: unreadCount },
    { href: currentUser ? `/${currentUser.username}` : '#', icon: User, label: 'Perfil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around px-1 pt-2 pb-safe"
      style={{
        background: 'rgba(7,0,16,0.96)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(123,47,255,0.18)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
      }}>
      {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
        const isActive = pathname === href
        return (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl relative transition-all">
            <div className="relative">
              <Icon size={23} style={{ color: isActive ? '#FF1A8C' : '#7A6890' }} />
              {!!badge && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-black flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className="text-[10px]"
              style={{ color: isActive ? '#FF1A8C' : '#7A6890', fontWeight: isActive ? 700 : 500 }}>
              {label}
            </span>
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg,#8B3FFF,#FF1A8C)' }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

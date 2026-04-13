'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Package, Compass, User } from 'lucide-react'

const CURRENT_USERNAME = 'elenarios'

const NAV_ITEMS = [
  { href: '/home',                icon: Home,        label: 'Inicio'  },
  { href: '/market',              icon: ShoppingBag, label: 'Market'  },
  { href: '/explore',             icon: Compass,     label: 'Explorar'},
  { href: '/orders',              icon: Package,     label: 'Pedidos' },
  { href: `/${CURRENT_USERNAME}`, icon: User,        label: 'Perfil'  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around px-1 pt-2 pb-safe"
      style={{
        background: 'rgba(7,0,16,0.96)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(123,47,255,0.18)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
      }}>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl relative transition-all">
            <div className="relative">
              <Icon
                size={23}
                style={{ color: isActive ? '#FF1A8C' : '#7A6890' }}
              />
            </div>
            <span
              className="text-[10px]"
              style={{
                color: isActive ? '#FF1A8C' : '#7A6890',
                fontWeight: isActive ? 700 : 500,
              }}>
              {label}
            </span>
            {isActive && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg,#8B3FFF,#FF1A8C)' }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

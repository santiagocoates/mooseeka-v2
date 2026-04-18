'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ShoppingBag, Compass, Bell, User, Settings, LogOut, Package, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useNotifications } from '@/lib/hooks/useNotifications'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const currentUser = useCurrentUser()
  const { unreadCount } = useNotifications()

  const NAV_ITEMS = [
    { href: '/home',          icon: Home,        label: 'Inicio'        },
    { href: '/market',        icon: ShoppingBag, label: 'Market'        },
    { href: '/explore',       icon: Compass,     label: 'Explorar'      },
    { href: '/notifications', icon: Bell,        label: 'Notificaciones', badge: unreadCount },
    { href: '/orders',        icon: Package,     label: 'Mis pedidos'   },
    { href: currentUser ? `/${currentUser.username}` : '#', icon: User, label: 'Perfil' },
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex w-[220px] shrink-0 h-screen sticky top-0 flex-col border-r"
      style={{ background: '#070010', borderColor: 'rgba(123,47,255,0.12)' }}>

      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/home" className="flex items-center gap-2.5">
          <Image src="/isologo.png" alt="Mooseeka" width={32} height={32} className="object-contain" />
          <span className="text-xl font-black tracking-tight gradient-text" style={{ letterSpacing: '-0.03em' }}>
            mooseeka
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 mt-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive ? 'text-white' : 'text-[#C0A8D8] hover:text-white'
              }`}
              style={isActive ? { background: 'rgba(123,47,255,0.18)' } : {}}>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                  style={{ background: 'linear-gradient(180deg, #8B3FFF, #FF1A8C)' }} />
              )}
              <Icon size={19} className={isActive ? 'text-[#FF1A8C]' : 'group-hover:text-[#FF1A8C] transition-colors'} />
              <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
              {badge && (
                <span className="ml-auto text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' }}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 flex flex-col gap-0.5 border-t pt-4"
        style={{ borderColor: 'rgba(123,47,255,0.12)' }}>
        {currentUser?.is_admin && (
          <Link href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5"
            style={{ color: '#FF1A8C' }}>
            <ShieldCheck size={17} />
            <span className="text-sm font-medium">Admin</span>
          </Link>
        )}
        <Link href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#7A6890] hover:text-[#C0A8D8] hover:bg-white/5 transition-all">
          <Settings size={17} />
          <span className="text-sm font-medium">Configuración</span>
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#7A6890] hover:text-[#FF1A8C] hover:bg-[#FF1A8C]/8 transition-all w-full text-left">
          <LogOut size={17} />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

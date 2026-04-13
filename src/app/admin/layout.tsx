'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ShieldCheck, FileText, LogOut, ChevronRight
} from 'lucide-react'

const NAV = [
  { href: '/admin',          icon: LayoutDashboard, label: 'Dashboard'           },
  { href: '/admin/sellers',  icon: ShieldCheck,     label: 'Solicitudes vendedor', badge: 4 },
  { href: '/admin/users',    icon: Users,            label: 'Usuarios'            },
  { href: '/admin/content',  icon: FileText,         label: 'Contenido'           },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen" style={{ background: '#07000F' }}>

      {/* Sidebar */}
      <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col"
        style={{ background: '#0E0020', borderRight: '1px solid rgba(123,47,255,0.15)' }}>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5">
          <Image src="/isologo.png" alt="Mooseeka" width={28} height={28} className="object-contain" />
          <div>
            <span className="text-base font-black tracking-tight gradient-text" style={{ letterSpacing: '-0.03em' }}>
              mooseeka
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#FF1A8C', lineHeight: 1 }}>
              Admin
            </p>
          </div>
        </div>

        <div className="mx-4 mb-4 h-px" style={{ background: 'rgba(123,47,255,0.15)' }} />

        {/* Nav */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5">
          {NAV.map(({ href, icon: Icon, label, badge }) => {
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
                <Icon size={17} className={isActive ? 'text-[#FF1A8C]' : 'group-hover:text-[#FF1A8C] transition-colors'} />
                <span className="text-sm font-medium flex-1">{label}</span>
                {badge && (
                  <span className="text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)' }}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-4 border-t" style={{ borderColor: 'rgba(123,47,255,0.12)' }}>
          <Link href="/home"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#7A6890] hover:text-[#C0A8D8] hover:bg-white/5 transition-all text-sm">
            <LogOut size={16} />
            Volver a la app
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}

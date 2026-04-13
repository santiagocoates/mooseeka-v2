import Image from 'next/image'
import Link from 'next/link'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: '#0A0014' }}>
      {/* Glow orbs */}
      <div className="fixed w-[500px] h-[500px] -top-40 -left-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,47,255,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="fixed w-[400px] h-[400px] -bottom-20 -right-20 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,26,140,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/isologo.png" alt="Mooseeka" width={28} height={28} className="object-contain" />
          <span className="text-lg font-black gradient-text" style={{ letterSpacing: '-0.03em' }}>mooseeka</span>
        </Link>
        <span className="text-xs" style={{ color: '#7A6890' }}>
          ¿Ya tienes cuenta? <Link href="/login" className="font-semibold transition-colors hover:text-white" style={{ color: '#A855F7' }}>Inicia sesión</Link>
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        {children}
      </main>
    </div>
  )
}

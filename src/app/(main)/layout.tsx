import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen relative" style={{ background: '#0A0014' }}>
      {/* Background glow orbs */}
      <div className="bg-glow w-[600px] h-[600px] -top-40 -left-40"
        style={{ background: 'radial-gradient(circle, rgba(100,20,200,0.14) 0%, transparent 70%)' }} />
      <div className="bg-glow w-[500px] h-[500px] bottom-0 right-0"
        style={{ background: 'radial-gradient(circle, rgba(200,20,120,0.09) 0%, transparent 70%)' }} />

      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Right column: TopBar + content */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        <TopBar />
        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  )
}

const SUGGESTIONS = [
  { name: 'Carlos Mendoza', role: 'Productor Musical', avatar: '/users/user1.jpg' },
  { name: 'Lina Vox', role: 'Cantante · Compositora', avatar: '/users/user3.jpg' },
  { name: 'DJ Omar', role: 'DJ · Beatmaker', avatar: '/users/manager.jpg' },
]

const TRENDING = [
  '#ElectronicMusic',
  '#MasteringPro',
  '#IndependentArtist',
  '#SoundDesign',
  '#LatinPop',
]

export default function RightSidebar() {
  return (
    <aside className="w-[272px] shrink-0 h-screen sticky top-0 overflow-y-auto py-6 px-4 flex flex-col gap-5">
      {/* Suggestions */}
      <div className="rounded-2xl p-4 card-shadow" style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
        <h3 className="text-white font-bold text-sm mb-4">Sugerencias</h3>
        <div className="flex flex-col gap-3">
          {SUGGESTIONS.map(user => (
            <div key={user.name} className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover shrink-0"
                style={{ border: '2px solid rgba(123,47,255,0.35)' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs truncate" style={{ color: '#7A6890' }}>{user.role}</p>
              </div>
              <button className="text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-90 transition-all shrink-0 gradient-magenta glow-btn">
                Seguir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="rounded-2xl p-4 card-shadow" style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
        <h3 className="text-white font-bold text-sm mb-4">Trending</h3>
        <div className="flex flex-col gap-1">
          {TRENDING.map((tag, i) => (
            <button key={tag}
              className="flex items-center gap-2.5 text-left px-2 py-2 rounded-lg transition-colors group hover:bg-white/5">
              <span className="text-xs w-4" style={{ color: '#7A6890' }}>{i + 1}</span>
              <span className="font-semibold text-sm transition-colors group-hover:text-[#FF1A8C]"
                style={{ color: '#A855F7' }}>
                {tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs px-2" style={{ color: '#7A6890' }}>
        © 2025 Mooseeka ·{' '}
        <span className="hover:text-white cursor-pointer transition-colors">Términos</span>
        {' '}·{' '}
        <span className="hover:text-white cursor-pointer transition-colors">Privacidad</span>
      </p>
    </aside>
  )
}

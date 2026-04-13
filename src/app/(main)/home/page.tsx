'use client'

import CreatePost from '@/components/feed/CreatePost'
import PostCard, { PostData } from '@/components/feed/PostCard'
import RightSidebar from '@/components/feed/RightSidebar'

const TRENDING_ARTISTS = [
  { name: 'DistroDub', genre: 'Jazz · 8 seguidores', avatar: '/users/user2.jpg' },
  { name: 'Three Dogs Y.', genre: 'Alternative · 1 seguidor', avatar: '/users/user1.jpg' },
  { name: 'Adrede', genre: 'Alternative · 3 seguidores', avatar: '/users/artistas.jpg' },
]

const MOCK_POSTS: PostData[] = [
  {
    id: '1',
    author: { name: 'Elena Ríos', role: 'Productora Musical', avatar: '/users/productores.jpg', initials: 'ER' },
    time: '2h',
    type: 'work',
    content: 'Acabo de masterizar este track para @DJSlime 🎧 Sonido analógico puro para un beat demoledor.',
    audio: { title: 'Deep Oceans (Master)', duration: '3:45' },
    likes: 24,
    comments: 6,
  },
  {
    id: '2',
    author: { name: 'Acid Beat', role: 'Music Producer', avatar: '/users/user2.jpg', initials: 'AB' },
    time: '5h',
    type: 'service',
    content: 'Nuevo servicio disponible en el market 🎹 Producción de trap con sonido profesional. ¡Primeros 5 clientes con 20% OFF!',
    service: { title: 'Producción de Trap', price: '€60/track', category: 'Producción', rating: 4.9 },
    likes: 41,
    comments: 12,
    liked: true,
  },
  {
    id: '3',
    author: { name: 'Marta Sound', role: 'Mastering Engineer', avatar: '/users/ingeniera.jpg', initials: 'MS' },
    time: '1d',
    type: 'achievement',
    content: '🔥 Acabo de llegar a las 100 reseñas en Mooseeka con un promedio de 5 estrellas. Gracias a todos los clientes increíbles que han confiado en mi trabajo. La industria latina está creciendo fuerte 💜',
    likes: 87,
    comments: 23,
  },
  {
    id: '4',
    author: { name: 'DJ Slime', role: 'DJ · Productor', avatar: '/users/user1.jpg', initials: 'DS' },
    time: '3h',
    type: 'work',
    content: 'Nuevo track ya disponible 🔥 Producido con @AcidBeat https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed: {
      type: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeId: 'dQw4w9WgXcQ',
    },
    likes: 53,
    comments: 9,
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        <CreatePost />

        {/* Trending Artists */}
        <div className="rounded-2xl p-4 card-shadow" style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔥</span>
            <h2 className="text-white font-bold">Tendencias Artistas</h2>
          </div>
          <div className="flex flex-col gap-3">
            {TRENDING_ARTISTS.map(artist => (
              <div key={artist.name} className="flex items-center gap-3">
                <img src={artist.avatar} alt={artist.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                  style={{ border: '2px solid rgba(123,47,255,0.4)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold">{artist.name}</p>
                  <p className="text-xs" style={{ color: '#7A6890' }}>{artist.genre}</p>
                </div>
                <button className="text-xs font-bold px-4 py-1.5 rounded-full shrink-0 transition-all hover:bg-[#FF1A8C] hover:text-white"
                  style={{ border: '1px solid rgba(255,26,140,0.5)', color: '#FF1A8C' }}>
                  Seguir
                </button>
              </div>
            ))}
          </div>
          <button className="text-sm mt-3 transition-colors hover:opacity-80" style={{ color: '#A855F7' }}>
            Ver todas las tendencias →
          </button>
        </div>

        {MOCK_POSTS.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="hidden xl:block">
        <RightSidebar />
      </div>
    </div>
  )
}

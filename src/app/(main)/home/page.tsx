'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CreatePost from '@/components/feed/CreatePost'
import PostCard, { PostData } from '@/components/feed/PostCard'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

interface TrendingProfile {
  id: string
  name: string
  username: string
  avatar_url: string | null
  roles: string[] | null
  follower_count: number
}

function getYouTubeId(url: string) {
  const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}
function getSpotifyEmbed(url: string) {
  const m = url?.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/)
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'ahora'
  if (mins  < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days  < 7)  return `${days}d`
  return new Date(dateStr).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function mapDbPostToPostData(row: Record<string, unknown>): PostData {
  const profile = row.profile as Record<string, unknown>
  const roles   = (profile?.roles as string[] | null) ?? []
  const roleStr = roles.slice(0, 2).join(' · ') || 'Mooseeka'
  const name    = (profile?.name as string) ?? 'Usuario'

  let embed: PostData['embed'] | undefined
  const link = row.link as string | null
  if (link) {
    const ytId = getYouTubeId(link)
    if (ytId) {
      embed = { type: 'youtube', url: link, youtubeId: ytId }
    } else {
      const spEmbed = getSpotifyEmbed(link)
      if (spEmbed) {
        embed = { type: 'spotify', url: link, spotifyEmbed: spEmbed }
      } else if (link.startsWith('http')) {
        embed = { type: 'link', url: link }
      }
    }
  }

  const type = row.type as string
  const postDataType: PostData['type'] =
    type === 'logro'    ? 'achievement' :
    type === 'busqueda' ? 'regular'     : 'work'

  return {
    id:      row.id as string,
    author: {
      name,
      role:   roleStr,
      avatar: (profile?.avatar_url as string) || undefined,
      initials: name[0]?.toUpperCase() ?? '?',
      username: profile?.username as string,
    },
    time:    timeAgo(row.created_at as string),
    type:    postDataType,
    content: row.content as string,
    image:      (row.image_url  as string) || undefined,
    audio_url:  (row.audio_url  as string) || undefined,
    audio_name: (row.audio_name as string) || undefined,
    embed,
    likes:    0,
    comments: 0,
  }
}

export default function HomePage() {
  const currentUser = useCurrentUser()
  const [posts,    setPosts]    = useState<PostData[]>([])
  const [trending, setTrending] = useState<TrendingProfile[]>([])
  const [loading,  setLoading]  = useState(true)
  const [feedTab,  setFeedTab]  = useState<'forYou' | 'following'>('forYou')

  const loadFeed = useCallback(async (tab: 'forYou' | 'following') => {
    setLoading(true)
    const supabase = createClient()

    // Usuario autenticado (para saber qué posts ya likeó)
    const { data: { user: authUser } } = await supabase.auth.getUser()

    let postsQuery = supabase
      .from('posts')
      .select('*, profile:profiles(id, name, username, avatar_url, roles)')
      .order('created_at', { ascending: false })
      .limit(30)

    // Tab "Siguiendo": filtrar por perfiles que sigue el usuario
    if (tab === 'following' && authUser) {
      const { data: followsData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', authUser.id)
      const followingIds = (followsData ?? []).map(f => f.following_id)
      if (followingIds.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }
      postsQuery = postsQuery.in('profile_id', followingIds)
    }

    const { data } = await postsQuery
    if (!data) { setLoading(false); return }

    const postIds = data.map(p => p.id as string)

    // Likes: conteo por post + cuáles likeó el usuario actual
    const { data: likesData } = await supabase
      .from('post_likes')
      .select('post_id, user_id')
      .in('post_id', postIds)

    const likeCountMap: Record<string, number> = {}
    const userLikedSet = new Set<string>()
    for (const like of likesData ?? []) {
      likeCountMap[like.post_id] = (likeCountMap[like.post_id] ?? 0) + 1
      if (like.user_id === authUser?.id) userLikedSet.add(like.post_id)
    }

    setPosts(data.map(row => ({
      ...mapDbPostToPostData(row),
      likes: likeCountMap[row.id as string] ?? 0,
      liked: userLikedSet.has(row.id as string),
    })))
    setLoading(false)
  }, [])

  const loadTrending = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url, roles')
      .eq('onboarding_completed', true)
      .order('created_at', { ascending: false })
      .limit(4)
    if (data) setTrending(data.map(p => ({ ...p, follower_count: 0 })))
  }, [])

  useEffect(() => {
    loadFeed(feedTab)
    loadTrending()
  // currentUser?.id: re-fetch cuando la sesión de auth carga (resuelve race condition en refresh)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedTab, currentUser?.id])

  function handleNewPost(post: PostData) {
    setPosts(prev => [post, ...prev])
  }

  function handleDelete(id: string) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        <CreatePost onPost={handleNewPost} />

        {/* Trending — solo si hay perfiles */}
        {trending.length > 0 && (
          <div className="rounded-2xl p-4 card-shadow"
            style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔥</span>
              <h2 className="text-white font-bold">Perfiles recientes</h2>
            </div>
            <div className="flex flex-col gap-3">
              {trending.map(profile => (
                <Link key={profile.id} href={`/${profile.username}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                      style={{ border: '2px solid rgba(123,47,255,0.4)' }} />
                  ) : (
                    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', border: '2px solid rgba(123,47,255,0.4)' }}>
                      {profile.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{profile.name}</p>
                    <p className="text-xs truncate" style={{ color: '#7A6890' }}>
                      {profile.roles?.slice(0, 2).join(' · ') || 'Mooseeka'}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0 transition-all"
                    style={{ border: '1px solid rgba(255,26,140,0.5)', color: '#FF1A8C' }}>
                    Ver perfil
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Toggle Para ti / Siguiendo */}
        <div className="flex rounded-xl p-1 gap-1"
          style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
          {(['forYou', 'following'] as const).map(tab => (
            <button key={tab}
              onClick={() => setFeedTab(tab)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={feedTab === tab ? {
                background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)',
                color: '#fff',
              } : {
                color: '#7A6890',
              }}>
              {tab === 'forYou' ? 'Para ti' : 'Siguiendo'}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl p-5 animate-pulse"
                style={{ background: 'rgba(25,0,50,0.6)', border: '1px solid rgba(123,47,255,0.18)' }}>
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full" style={{ background: 'rgba(123,47,255,0.2)' }} />
                  <div className="flex-1">
                    <div className="h-3 w-32 rounded mb-2" style={{ background: 'rgba(123,47,255,0.15)' }} />
                    <div className="h-2 w-24 rounded" style={{ background: 'rgba(123,47,255,0.1)' }} />
                  </div>
                </div>
                <div className="h-3 w-full rounded mb-2" style={{ background: 'rgba(123,47,255,0.1)' }} />
                <div className="h-3 w-3/4 rounded" style={{ background: 'rgba(123,47,255,0.07)' }} />
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="rounded-2xl p-10 text-center"
            style={{ background: 'rgba(25,0,50,0.4)', border: '1px dashed rgba(123,47,255,0.25)' }}>
            <p className="text-3xl mb-3">{feedTab === 'following' ? '👥' : '🎵'}</p>
            <p className="text-white font-semibold text-sm mb-1">
              {feedTab === 'following' ? 'Tu feed de seguidos está vacío' : 'El feed está vacío'}
            </p>
            <p className="text-xs" style={{ color: '#7A6890' }}>
              {feedTab === 'following'
                ? 'Seguí a otros músicos para ver sus posts acá.'
                : 'Sé el primero en publicar algo.'}
            </p>
          </div>
        )}

        {!loading && posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUsername={currentUser?.username}
            currentUserId={currentUser?.id}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}

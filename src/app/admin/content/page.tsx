'use client'

import { useState, useEffect } from 'react'
import { Eye, Trash2, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Post {
  id: string
  content: string
  type: string
  created_at: string
  image_url: string | null
  link: string | null
  profile: {
    name: string
    username: string
    avatar_url: string | null
  } | null
}

interface Product {
  id: string
  title: string
  type: string
  price_usd: number
  published: boolean
  created_at: string
  profile: {
    name: string
    username: string
  } | null
}

const TYPE_LABELS: Record<string, string> = {
  course:       'Curso',
  beat:         'Beat',
  sample_pack:  'Sample Pack',
  preset_pack:  'Preset Pack',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'ahora'
  if (mins  < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

export default function ContentPage() {
  const [posts,    setPosts]    = useState<Post[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<'posts' | 'products'>('posts')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [postsRes, productsRes] = await Promise.all([
        supabase.from('posts')
          .select('id, content, type, created_at, image_url, link, profile:profiles!posts_profile_id_fkey(name, username, avatar_url)')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase.from('products')
          .select('id, title, type, price_usd, published, created_at, profile:profiles!products_seller_id_fkey(name, username)')
          .order('created_at', { ascending: false })
          .limit(30),
      ])
      setPosts((postsRes.data ?? []) as unknown as Post[])
      setProducts((productsRes.data ?? []) as unknown as Product[])
      setLoading(false)
    }
    load()
  }, [])

  async function deletePost(id: string) {
    if (!confirm('¿Eliminás este post?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  async function toggleProduct(product: Product) {
    setDeleting(product.id)
    const supabase = createClient()
    await supabase.from('products').update({ published: !product.published }).eq('id', product.id)
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, published: !p.published } : p))
    setDeleting(null)
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Contenido</h1>
        <p className="text-sm mt-1" style={{ color: '#7A6890' }}>Moderá posts y productos de la plataforma</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
        {[
          { id: 'posts' as const,    label: `Posts (${posts.length})`       },
          { id: 'products' as const, label: `Productos (${products.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === t.id
              ? { background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)', color: '#fff' }
              : { color: '#7A6890' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: '#8B3FFF' }} />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>

          {/* POSTS TAB */}
          {tab === 'posts' && (
            <>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(123,47,255,0.12)' }}>
                <p className="text-sm font-bold text-white">{posts.length} posts recientes</p>
              </div>
              {posts.length === 0 && (
                <div className="text-center py-12" style={{ color: '#7A6890' }}>No hay posts</div>
              )}
              <div className="divide-y" style={{ borderColor: 'rgba(123,47,255,0.08)' }}>
                {posts.map(post => (
                  <div key={post.id} className="flex items-start gap-4 px-5 py-4">
                    {/* Avatar */}
                    {post.profile?.avatar_url ? (
                      <img src={post.profile.avatar_url} alt={post.profile.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
                        style={{ border: '2px solid rgba(123,47,255,0.3)' }} />
                    ) : (
                      <div className="w-9 h-9 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)' }}>
                        {post.profile?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white">{post.profile?.name ?? 'Usuario'}</p>
                        <span className="text-xs" style={{ color: '#7A6890' }}>@{post.profile?.username}</span>
                        <span className="text-xs" style={{ color: '#7A6890' }}>· {timeAgo(post.created_at)}</span>
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#C0A8D8' }}>
                        {post.content}
                      </p>
                      {post.image_url && (
                        <div className="mt-2 w-16 h-12 rounded-lg overflow-hidden">
                          <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/${post.profile?.username}`} target="_blank"
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
                        style={{ color: '#7A6890' }}>
                        <Eye size={15} />
                      </Link>
                      <button onClick={() => deletePost(post.id)} disabled={deleting === post.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10"
                        style={{ color: deleting === post.id ? '#7A6890' : '#ef4444' }}>
                        {deleting === post.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(123,47,255,0.12)' }}>
                <p className="text-sm font-bold text-white">{products.length} productos</p>
              </div>
              {products.length === 0 && (
                <div className="text-center py-12" style={{ color: '#7A6890' }}>No hay productos</div>
              )}
              <div className="divide-y" style={{ borderColor: 'rgba(123,47,255,0.08)' }}>
                {products.map(product => (
                  <div key={product.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-white truncate">{product.title}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={product.published
                            ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                            : { background: 'rgba(255,255,255,0.06)', color: '#7A6890' }}>
                          {product.published ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: '#7A6890' }}>
                        {TYPE_LABELS[product.type] ?? product.type} · ${Number(product.price_usd).toFixed(0)} USD · {product.profile?.name ?? '—'} · {timeAgo(product.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link href={`/products/${product.id}`} target="_blank"
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
                        style={{ color: '#7A6890' }}>
                        <ExternalLink size={14} />
                      </Link>
                      <button onClick={() => toggleProduct(product)} disabled={deleting === product.id}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                        style={product.published
                          ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
                          : { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                        {deleting === product.id
                          ? '...'
                          : product.published ? 'Despublicar' : 'Publicar'
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

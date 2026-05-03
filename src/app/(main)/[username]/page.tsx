import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProfilePageClient from './ProfilePageClient'

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params
  const supabase     = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, bio, avatar_url, roles, role')
    .eq('username', username)
    .single()

  if (!profile) return { title: 'Mooseeka' }

  const displayRoles = profile.roles?.length
    ? (profile.roles as string[]).join(', ')
    : (profile.role ?? '')

  const title       = `${profile.name} · Mooseeka`
  const description = profile.bio
    || (displayRoles ? `${displayRoles} en Mooseeka` : 'Perfil en Mooseeka')
  const image       = profile.avatar_url || 'https://app.mooseeka.com/logo.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 400, height: 400, alt: profile.name }],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProfilePage(
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  return <ProfilePageClient username={username} />
}

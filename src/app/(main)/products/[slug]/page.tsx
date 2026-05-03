import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProductPageClient from './ProductPageClient'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const TYPE_LABELS: Record<string, string> = {
  course:       'Curso',
  beat:         'Beat',
  sample_pack:  'Sample Pack',
  preset_pack:  'Preset Pack',
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const isUUID = UUID_RE.test(slug)
  const query  = supabase
    .from('products')
    .select('title, description, cover_url, type, profile:profiles!products_seller_id_fkey(name)')
    .eq('published', true)

  const { data: product } = await (isUUID ? query.eq('id', slug) : query.eq('slug', slug)).single()

  if (!product) return { title: 'Mooseeka' }

  const profileName = (product.profile as unknown as { name: string } | null)?.name ?? ''
  const title       = `${product.title} · Mooseeka`
  const description = product.description
    || `${TYPE_LABELS[product.type] ?? product.type}${profileName ? ` por ${profileName}` : ''} en Mooseeka`
  const image       = product.cover_url || 'https://app.mooseeka.com/logo.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: product.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  return <ProductPageClient slug={slug} />
}

import { NextRequest, NextResponse } from 'next/server'

function getOgTag(html: string, prop: string): string | null {
  // og:property con content después
  const m1 = html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
  if (m1) return decodeHtmlEntities(m1[1])
  // content antes de og:property
  const m2 = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'))
  if (m2) return decodeHtmlEntities(m2[1])
  // twitter:card fallback
  const m3 = html.match(new RegExp(`<meta[^>]+name=["']twitter:${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
  if (m3) return decodeHtmlEntities(m3[1])
  const m4 = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:${prop}["']`, 'i'))
  if (m4) return decodeHtmlEntities(m4[1])
  return null
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Mooseeka/1.0; +https://mooseeka.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 3600 }, // cache 1 hora
    })

    if (!res.ok) return NextResponse.json({ error: 'Fetch failed' }, { status: 502 })

    const html = await res.text()

    const title       = getOgTag(html, 'title')
      || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
      || null
    const description = getOgTag(html, 'description') || null
    const image       = getOgTag(html, 'image') || null
    const siteName    = getOgTag(html, 'site_name') || null

    return NextResponse.json({ title, description, image, siteName }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 })
  }
}

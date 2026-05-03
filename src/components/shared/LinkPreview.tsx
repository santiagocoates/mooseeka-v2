'use client'

import { useState, useEffect } from 'react'

interface OgData {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

interface LinkPreviewProps {
  url: string
}

export default function LinkPreview({ url }: LinkPreviewProps) {
  const [og,      setOg]      = useState<OgData | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed,  setFailed]  = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchOg() {
      try {
        const res = await fetch(`/api/og?url=${encodeURIComponent(url)}`)
        if (!res.ok) throw new Error('failed')
        const data: OgData = await res.json()
        if (!cancelled) setOg(data)
      } catch {
        if (!cancelled) setFailed(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOg()
    return () => { cancelled = true }
  }, [url])

  const domain   = getDomain(url)
  const favicon  = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  const hasImage = og?.image && !failed

  // Skeleton mientras carga
  if (loading) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="block mt-3 rounded-xl overflow-hidden animate-pulse"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}>
        <div className="h-36 w-full" style={{ background: 'rgba(123,47,255,0.08)' }} />
        <div className="p-3 flex flex-col gap-2">
          <div className="h-3 w-3/4 rounded" style={{ background: 'rgba(123,47,255,0.1)' }} />
          <div className="h-2 w-full rounded" style={{ background: 'rgba(123,47,255,0.07)' }} />
          <div className="h-2 w-1/2 rounded" style={{ background: 'rgba(123,47,255,0.05)' }} />
        </div>
      </a>
    )
  }

  // Fallback simple si no se pudo obtener OG o no hay imagen
  if (failed || (!og?.title && !og?.image)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 mt-3 rounded-xl hover:bg-white/5 transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}>
        <img src={favicon} alt="" className="w-6 h-6 rounded shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: '#C0A8D8' }}>{domain}</p>
          <p className="text-xs truncate mt-0.5" style={{ color: '#7A6890' }}>{url}</p>
        </div>
      </a>
    )
  }

  // Rich preview card
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="block mt-3 rounded-xl overflow-hidden transition-all hover:opacity-90"
      style={{ background: 'rgba(10,0,20,0.8)', border: '1px solid rgba(123,47,255,0.22)' }}>
      {hasImage && (
        <div className="w-full overflow-hidden" style={{ maxHeight: 220 }}>
          <img
            src={og!.image!}
            alt={og?.title ?? ''}
            className="w-full object-cover"
            style={{ maxHeight: 220 }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <img src={favicon} alt="" className="w-4 h-4 rounded shrink-0" />
          <span className="text-[11px] font-semibold uppercase tracking-wide truncate" style={{ color: '#7A6890' }}>
            {og?.siteName || domain}
          </span>
        </div>
        {og?.title && (
          <p className="text-sm font-bold text-white leading-snug line-clamp-2 mb-1">
            {og.title}
          </p>
        )}
        {og?.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#7A6890' }}>
            {og.description}
          </p>
        )}
      </div>
    </a>
  )
}

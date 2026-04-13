'use client'

import { useState } from 'react'
import { X, Copy, Check, Link2 } from 'lucide-react'

/* ── Social channels ── */
const SOCIALS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    bg: '#25D366',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    getUrl: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    bg: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    bg: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    bg: '#26A5E4',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    getUrl: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
]

interface ShareModalProps {
  open: boolean
  onClose: () => void
  /** Full public URL to share, e.g. "https://mooseeka.com/elenarios" */
  url: string
  /** Short display URL shown in the box, e.g. "mooseeka.com/elenarios" */
  displayUrl: string
  /** Text prefilled in social share message */
  shareText: string
  type: 'profile' | 'service'
}

export default function ShareModal({ open, onClose, url, displayUrl, shareText, type }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#0E001C', border: '1px solid rgba(123,47,255,0.3)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(123,47,255,0.12)' }}>
          <div>
            <h3 className="text-white font-bold text-base">
              {type === 'profile' ? 'Compartir perfil' : 'Compartir servicio'}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>
              {type === 'profile'
                ? 'Comparte tu portafolio con el mundo'
                : 'Comparte este servicio con tus clientes'}
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: '#7A6890' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* URL box */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7A6890' }}>
              Tu link
            </p>
            <div className="flex items-center gap-2 px-3 py-3 rounded-xl"
              style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.25)' }}>
              <Link2 size={14} style={{ color: '#8B3FFF', flexShrink: 0 }} />
              <span className="flex-1 text-sm font-semibold text-white truncate">{displayUrl}</span>
              <button onClick={copyLink}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shrink-0"
                style={copied
                  ? { background: 'rgba(34,197,94,0.2)', color: '#22c55e' }
                  : { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' }}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Social share */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#7A6890' }}>
              Compartir en
            </p>
            <div className="grid grid-cols-4 gap-2">
              {SOCIALS.map(s => (
                <a key={s.id}
                  href={s.getUrl(url, shareText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseOver={e => (e.currentTarget.style.background = `${s.bg}18`)}
                  onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-full"
                    style={{ background: `${s.bg}22`, color: s.bg }}>
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: '#C0A8D8' }}>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Instagram tip */}
          <div className="flex items-start gap-3 px-3 py-3 rounded-xl"
            style={{ background: 'rgba(139,63,255,0.07)', border: '1px dashed rgba(139,63,255,0.25)' }}>
            <span className="text-lg shrink-0">📱</span>
            <div>
              <p className="text-xs font-bold text-white mb-0.5">Para Instagram</p>
              <p className="text-xs leading-relaxed" style={{ color: '#7A6890' }}>
                Copia el link y pégalo en la bio de tu Instagram para que tus seguidores puedan ver tu portafolio y contratar tus servicios.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt     = 'Mooseeka - La red profesional de la música'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0014',
          gap: 32,
        }}
      >
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://app.mooseeka.com/logo.png"
          alt="Mooseeka"
          width={320}
          height={320}
          style={{ objectFit: 'contain' }}
        />
        {/* Tagline */}
        <p style={{ color: '#C0A8D8', fontSize: 28, margin: 0, fontFamily: 'sans-serif' }}>
          La red profesional de la música
        </p>
      </div>
    ),
    { ...size }
  )
}

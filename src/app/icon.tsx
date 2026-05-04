import { ImageResponse } from 'next/og'

export const runtime     = 'edge'
export const size        = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0014',
          borderRadius: '120px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://app.mooseeka.com/isologo.png"
          alt="Mooseeka"
          width={420}
          height={420}
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    { ...size }
  )
}

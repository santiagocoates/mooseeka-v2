import { ImageResponse } from 'next/og'

export const runtime     = 'edge'
export const size        = { width: 32, height: 32 }
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
          background: '#1a0035',
          borderRadius: '8px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://mooseeka-v2.vercel.app/isologo.png"
          alt="Mooseeka"
          width={28}
          height={28}
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    { ...size }
  )
}

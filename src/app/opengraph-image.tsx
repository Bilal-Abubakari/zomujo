import { ImageResponse } from 'next/og';
import { BRANDING } from '@/constants/branding.constant';

export const runtime = 'edge';
export const alt = `${BRANDING.APP_NAME} – ${BRANDING.SLOGAN}`;
export const size = { width: 1200, height: 630 };

export const contentType = 'image/png';

export default function Image(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #08af85 0%, #065f46 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        padding: '60px',
      }}
    >
      {/* Logo placeholder circle */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          border: '3px solid rgba(255,255,255,0.4)',
        }}
      >
        <span style={{ fontSize: 48, color: '#ffffff' }}>🏥</span>
      </div>

      {/* App name */}
      <p
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: '#ffffff',
          margin: 0,
          letterSpacing: '-2px',
        }}
      >
        {BRANDING.APP_NAME}
      </p>

      {/* Slogan */}
      <p
        style={{
          fontSize: 32,
          color: 'rgba(255,255,255,0.85)',
          margin: '16px 0 0 0',
          fontWeight: 400,
        }}
      >
        {BRANDING.SLOGAN}
      </p>

      {/* Divider */}
      <div
        style={{
          width: 120,
          height: 4,
          background: 'rgba(255,255,255,0.5)',
          borderRadius: 2,
          margin: '32px 0',
        }}
      />

      {/* Tagline */}
      <p
        style={{
          fontSize: 24,
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
          textAlign: 'center',
          maxWidth: 800,
        }}
      >
        {BRANDING.OG_DESCRIPTION}
      </p>
    </div>,
    { ...size },
  );
}

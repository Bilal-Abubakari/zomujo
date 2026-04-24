'use client';

import React, { JSX } from 'react';
import QRCode from 'react-qr-code';
import { Logo } from '@/assets/images';
import { IDoctor } from '@/types/doctor.interface';
import { capitalize, pesewasToGhc } from '@/lib/utils';
import { BRANDING } from '@/constants/branding.constant';

interface ProfileCardProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  doctor: IDoctor | null;
  profilePictureBase64: string;
  fullName: string;
  url: string;
}

export default function ProfileCard({
  cardRef,
  doctor,
  profilePictureBase64,
  fullName,
  url,
}: Readonly<ProfileCardProps>): JSX.Element {
  const specializations = doctor?.specializations ?? [];
  const experience = doctor?.experience ?? 0;
  const consultations = doctor?.consultationCount ?? 0;
  const fee = doctor?.fee;
  const rawBio = doctor?.bio ?? '';
  const bio = rawBio.length > 180 ? rawBio.slice(0, 180).trimEnd() + '…' : rawBio;

  return (
    // Positioned far off-screen via inline style so Tailwind purging can't interfere
    <div
      data-profile-card-wrapper="true"
      style={{ position: 'fixed', left: '-9999px', top: 0, overflow: 'hidden' }}
    >
      <div
        ref={cardRef}
        data-profile-card-ref="true"
        style={{
          width: '540px',
          height: '810px',
          position: 'relative',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
          backgroundColor: '#0d2137',
        }}
      >
        {/* Background: profile picture or branded gradient */}
        {doctor?.profilePicture && profilePictureBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profilePictureBase64}
            data-profile-card-pic="true"
            aria-hidden="true"
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, #1e3a5f 0%, #0f6e6e 100%)',
            }}
          />
        )}

        {/* Gradient overlay — strong at bottom, light at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.82) 35%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.5) 100%)',
          }}
        />

        {/* ── Top bar: logo left, QR right ── */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '28px',
            right: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={typeof Logo === 'string' ? Logo : (Logo as { src: string }).src}
            alt={BRANDING.APP_NAME}
            style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
          />

          {/* Small QR code */}
          <div
            style={{
              background: 'rgba(255,255,255,0.92)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QRCode
              value={url || 'https://zomujo.com'}
              size={60}
              level="M"
              fgColor="#000000"
              bgColor="transparent"
            />
          </div>
        </div>

        {/* ── Bottom content block ── */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '0 32px 36px',
          }}
        >
          {/* Name */}
          <h1
            style={{
              fontSize: '38px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#FFD166',
              margin: 0,
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            }}
          >
            Dr. {fullName}
          </h1>

          {/* Specializations */}
          {specializations.length > 0 && (
            <div style={{ display: 'block', marginBottom: '8px', marginTop: '16px' }}>
              {specializations.slice(0, 3).map((s, i) => (
                <span
                  key={s}
                  style={{
                    background: 'rgba(255,209,102,0.18)',
                    border: '1px solid rgba(255,209,102,0.45)',
                    color: '#FFD166',
                    borderRadius: '20px',
                    paddingBottom: '16px',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    // lineHeight === height is the reliable html2canvas trick for vertical centering
                    lineHeight: '20px',
                    marginRight: i < specializations.slice(0, 3).length - 1 ? '6px' : '0px',
                  }}
                >
                  {capitalize(s)}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {bio && (
            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.72)',
                margin: 0,
                marginTop: '16px',
                marginBottom: '16px',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
              }}
            >
              {bio}
            </p>
          )}

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: 'rgba(255,255,255,0.15)',
              marginBottom: '16px',
            }}
          />

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '16px' }}>
            {experience > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}
                >
                  {experience}
                </span>
                <span
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}
                >
                  yrs experience
                </span>
              </div>
            )}
            {!!fee && (
              <>
                {(experience > 0 || consultations > 0) && (
                  <div
                    style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.2)' }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}
                  >
                    GHs {pesewasToGhc(fee)}
                  </span>
                  <span
                    style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}
                  >
                    per session
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Book CTA pill */}
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,209,102,0.15)',
              border: '1px solid rgba(255,209,102,0.35)',
              borderRadius: '20px',
              paddingBottom: '20px',
              paddingLeft: '10px',
              paddingRight: '10px',
              marginTop: '16px',
            }}
          >
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Book on </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFD166' }}>
              {BRANDING.APP_NAME}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

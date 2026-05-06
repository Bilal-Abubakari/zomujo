'use client';

import React, { JSX } from 'react';
import QRCode from 'react-qr-code';
import { Logo } from '@/assets/images';
import { IDoctor } from '@/types/doctor.interface';
import { capitalize } from '@/lib/utils';

interface QRCardProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  doctor: IDoctor | null;
  profilePictureBase64: string;
  url: string;
  fullName: string;
}

function ProfileImage({
  doctor,
  profilePictureBase64,
}: Readonly<{
  doctor: IDoctor | null;
  profilePictureBase64: string;
}>): JSX.Element {
  if (doctor?.profilePicture && profilePictureBase64) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profilePictureBase64}
        data-profile-pic="true"
        aria-hidden="true"
        alt={doctor.firstName}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e5e7eb',
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#6b7280',
      }}
    >
      {doctor?.firstName?.[0]}
      {doctor?.lastName?.[0]}
    </div>
  );
}

export default function QRCard({
  cardRef,
  doctor,
  profilePictureBase64,
  url,
}: Readonly<QRCardProps>): JSX.Element {
  return (
    <div
      data-qr-card-wrapper="true"
      style={{ position: 'fixed', top: 0, left: '-9999px', overflow: 'hidden' }}
    >
      <div
        ref={cardRef}
        data-card-ref="true"
        style={{
          width: '500px',
          height: '800px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '64px 32px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '160px',
              height: '160px',
              overflow: 'hidden',
              borderRadius: '16px',
              border: '4px solid #f3f4f6',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
            }}
          >
            <ProfileImage doctor={doctor} profilePictureBase64={profilePictureBase64} />
          </div>
          <div>
            <h2
              style={{
                fontSize: '30px',
                fontWeight: 'bold',
                color: '#111827',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              Dr. {doctor?.firstName} {doctor?.lastName}
            </h2>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '500', color: '#6b7280' }}>
              {doctor?.specializations?.length
                ? capitalize(doctor.specializations[0])
                : 'General Practitioner'}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '32px 0',
          }}
        >
          <div
            style={{
              borderRadius: '16px',
              border: '2px solid #f3f4f6',
              backgroundColor: '#ffffff',
              padding: '24px',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}
          >
            <QRCode
              value={url || 'https://zomujo.com'}
              size={220}
              level="H"
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          <p
            style={{
              maxWidth: '70%',
              fontSize: '14px',
              fontWeight: '500',
              color: '#9ca3af',
              margin: '0 auto',
            }}
          >
            Scan this QR code to view profile and book an appointment instantly.
          </p>
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            opacity: 0.8,
          }}
        >
          <div
            style={{ width: '128px', height: '40px', display: 'flex', justifyContent: 'center' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={typeof Logo === 'string' ? Logo : (Logo as { src: string }).src}
              alt="Fornix Link"
              style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Powered by Fornix Link</p>
        </div>
      </div>
    </div>
  );
}

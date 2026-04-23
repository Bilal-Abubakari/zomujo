'use client';

import React, { JSX, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Medal, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { doctorInfo } from '@/lib/features/doctors/doctorsThunk';
import { IDoctor } from '@/types/doctor.interface';
import { pesewasToGhc, showErrorToast } from '@/lib/utils';
import { Logo } from '@/assets/images';
import Image from 'next/image';
import { BRANDING } from '@/constants/branding.constant';
import { selectIsDoctor, selectIsPatient, selectUser } from '@/lib/features/auth/authSelector';
import ShareQRSection from '@/components/doctor/ShareQRSection';
import QRCard from '@/components/doctor/QRCard';
import ProfileCard from '@/components/doctor/ProfileCard';
import { useProfilePictureBase64 } from '@/hooks/useProfilePictureBase64';
import { useShareQR } from '@/hooks/useShareQR';
import { DoctorProfile } from '@/components/doctor/DoctorProfile';

interface DoctorProfileViewProps {
  doctorId: string;
  mode: 'public' | 'dashboard';
}

export default function DoctorProfileView({
  doctorId,
  mode,
}: Readonly<DoctorProfileViewProps>): JSX.Element {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isPatient = useAppSelector(selectIsPatient);
  const isDoctor = useAppSelector(selectIsDoctor);
  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);

  const { profilePictureBase64, isImageLoading } = useProfilePictureBase64(doctor);
  const { copyToClipboard, shareOnSocial, downloadQRCode, downloadProfileCard } = useShareQR(
    url,
    cardRef,
    doctorId,
    profilePictureBase64,
    isImageLoading,
    doctor ? `${doctor.firstName} ${doctor.lastName}` : undefined,
    profileCardRef,
  );

  useEffect(() => {
    if (globalThis.window !== undefined) {
      if (mode === 'public') {
        setUrl(globalThis.window.location.href);
      } else {
        // Always point shared links to the public profile page, not the dashboard
        const origin = globalThis.window.location.origin;
        setUrl(`${origin}/doctor/${doctorId}`);
      }
    }
  }, [doctorId, mode]);

  useEffect(() => {
    const fetchDoctor = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(doctorInfo(doctorId));
      if (payload && !showErrorToast(payload)) {
        setDoctor(payload as IDoctor);
      }
      setIsLoading(false);
    };
    void fetchDoctor();
  }, [dispatch, doctorId]);

  const getCtaLabel = (): string | null => {
    if (isDoctor) {
      return null;
    }
    return 'Book Appointment';
  };
  const ctaLabel = getCtaLabel();

  const getNavButtons = (): JSX.Element => {
    if (user) {
      if (isPatient) {
        return (
          <Link href={`/dashboard/doctor/${doctorId}`}>
            <Button child="View in Dashboard" />
          </Link>
        );
      }
      return <></>;
    }
    return (
      <>
        <Link href="/login">
          <Button variant="outline" child="Log In" />
        </Link>
        <Link href="/sign-up">
          <Button child="Sign Up" />
        </Link>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-t-primary h-10 w-10 animate-spin rounded-full border-4 border-gray-200" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-gray-700">Doctor profile not found.</p>
        <Link href="/">
          <Button child="Go Home" />
        </Link>
      </div>
    );
  }

  const fullName = `${doctor.firstName} ${doctor.lastName}`;

  // Public mode
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* ── Top Nav ─────────────────────────────────────────── */}
      {mode === 'public' && (
        <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-9 w-28">
              <Image src={Logo} alt={BRANDING.APP_NAME} fill className="object-contain" />
            </div>
          </Link>
          <div className="flex items-center gap-2">{getNavButtons()}</div>
        </header>
      )}

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8 md:px-6">
        <DoctorProfile ctaLabel={ctaLabel} doctorId={doctorId} doctor={doctor} />

        {/* ── Stats row ────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {doctor.fee && (
            <div className="flex flex-col items-center rounded-xl border bg-white p-4 shadow-sm">
              <span className="text-primary text-2xl font-extrabold">
                GHs {pesewasToGhc(doctor.fee)}
              </span>
              <span className="mt-1 text-xs text-gray-500">Consultation Fee</span>
            </div>
          )}
          {(doctor.experience || 0) > 0 && (
            <div className="flex flex-col items-center rounded-xl border bg-white p-4 shadow-sm">
              <span className="text-primary flex items-center gap-1 text-2xl font-extrabold">
                <Clock size={20} />
                {doctor.experience}
              </span>
              <span className="mt-1 text-xs text-gray-500">Years Experience</span>
            </div>
          )}
          {doctor.consultationCount > 0 && (
            <div className="flex flex-col items-center rounded-xl border bg-white p-4 shadow-sm">
              <span className="text-primary flex items-center gap-1 text-2xl font-extrabold">
                <Medal size={20} />
                {doctor.consultationCount}+
              </span>
              <span className="mt-1 text-xs text-gray-500">Consultations</span>
            </div>
          )}
        </div>

        {/* ── Share + QR ────────────────────────────────────── */}
        <ShareQRSection
          url={url}
          copyToClipboard={copyToClipboard}
          shareOnSocial={shareOnSocial}
          downloadQRCode={downloadQRCode}
          downloadProfileCard={downloadProfileCard}
        />
      </main>

      {/* ── Slot Selection Modal ───────────────────────────── */}

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="mt-auto border-t bg-white py-6 text-center text-sm text-gray-400">
        <p>
          Powered by{' '}
          <Link href="/" className="text-primary font-semibold">
            {BRANDING.APP_NAME}
          </Link>{' '}
          · {BRANDING.SLOGAN}
        </p>
      </footer>

      {/* ── Hidden QR card for generation ───────────────────── */}
      <QRCard
        cardRef={cardRef}
        doctor={doctor}
        profilePictureBase64={profilePictureBase64}
        url={url}
        fullName={fullName}
      />

      {/* ── Hidden profile card for social media download ────── */}
      <ProfileCard
        cardRef={profileCardRef}
        doctor={doctor}
        profilePictureBase64={profilePictureBase64}
        fullName={fullName}
        url={url}
      />
    </div>
  );
}

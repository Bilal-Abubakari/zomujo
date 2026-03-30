import React, { JSX, Suspense } from 'react';
import DoctorProfileView from '@/components/doctor/DoctorProfileView';
import type { Metadata } from 'next';
import { BRANDING } from '@/constants/branding.constant';
import {
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  buildPhysicianJsonLd,
} from '@/lib/seo';
import { IDoctor } from '@/types/doctor.interface';
import { IResponse } from '@/types/shared.interface';

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

async function fetchDoctor(id: string): Promise<IDoctor | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctors/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return null;
    }
    const json = (await response.json()) as IResponse<IDoctor>;
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: DoctorPageProps): Promise<Metadata> {
  const { id } = await params;
  const doctor = await fetchDoctor(id);

  if (!doctor) {
    return {
      title: 'Doctor Profile',
      description: `Find and book an appointment with a verified doctor on ${BRANDING.APP_NAME}.`,
      robots: { index: false, follow: false },
    };
  }

  const name = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const specialization = doctor.specializations.join(', ');
  const title = `${name} – ${specialization}`;
  const description =
    doctor.bio ||
    `Book an appointment with ${name}, specialising in ${specialization} on ${BRANDING.APP_NAME}.`;
  const url = buildCanonicalUrl(`/doctor/${id}`);
  const ogImages = doctor.profilePicture
    ? [{ url: doctor.profilePicture, width: 800, height: 800, alt: name }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({ title, description, url, images: ogImages }),
    twitter: buildTwitterCard({
      title,
      description,
      images: doctor.profilePicture ? [doctor.profilePicture] : undefined,
    }),
  };
}

export default async function PublicDoctorPage({
  params,
}: Readonly<DoctorPageProps>): Promise<JSX.Element> {
  const { id } = await params;
  const doctor = await fetchDoctor(id);

  const physicianJsonLd = doctor
    ? buildPhysicianJsonLd({
        id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        profilePicture: doctor.profilePicture,
        bio: doctor.bio,
        specializations: doctor.specializations,
      })
    : null;

  return (
    <>
      {physicianJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianJsonLd) }}
        />
      )}
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="border-t-primary h-10 w-10 animate-spin rounded-full border-4 border-gray-200" />
          </div>
        }
      >
        <DoctorProfileView doctorId={id} mode="public" />
      </Suspense>
    </>
  );
}

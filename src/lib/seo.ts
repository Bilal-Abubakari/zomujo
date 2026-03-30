import type { Metadata } from 'next';
import { BRANDING } from '@/constants/branding.constant';

// ---------------------------------------------------------------------------
// Canonical URL helper
// ---------------------------------------------------------------------------
export function buildCanonicalUrl(path: string): string {
  const base = BRANDING.APP_URL.replace(/\/$/, '');
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalised}`;
}

// ---------------------------------------------------------------------------
// Shared Open Graph defaults
// ---------------------------------------------------------------------------
interface OpenGraphOverrides {
  title?: string;
  description?: string;
  url?: string;
  images?: { url: string; width: number; height: number; alt: string }[];
}

export function buildOpenGraph(overrides: OpenGraphOverrides = {}): Metadata['openGraph'] {
  return {
    type: 'website',
    siteName: BRANDING.APP_NAME,
    locale: 'en_US',
    title: overrides.title ?? `${BRANDING.APP_NAME} – ${BRANDING.SLOGAN}`,
    description: overrides.description ?? BRANDING.OG_DESCRIPTION,
    url: overrides.url ?? BRANDING.APP_URL,
    images: overrides.images ?? [
      {
        url: buildCanonicalUrl('/og-image.png'),
        width: 1200,
        height: 630,
        alt: `${BRANDING.APP_NAME} – ${BRANDING.SLOGAN}`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Shared Twitter Card defaults
// ---------------------------------------------------------------------------
interface TwitterOverrides {
  title?: string;
  description?: string;
  images?: string[];
}

export function buildTwitterCard(overrides: TwitterOverrides = {}): Metadata['twitter'] {
  return {
    card: 'summary_large_image',
    site: BRANDING.TWITTER_HANDLE,
    creator: BRANDING.TWITTER_HANDLE,
    title: overrides.title ?? `${BRANDING.APP_NAME} – ${BRANDING.SLOGAN}`,
    description: overrides.description ?? BRANDING.OG_DESCRIPTION,
    images: overrides.images ?? [buildCanonicalUrl('/og-image.png')],
  };
}

// ---------------------------------------------------------------------------
// Reusable NOINDEX metadata constant
// Applied to protected / functional pages that must not appear in search results
// ---------------------------------------------------------------------------
export const NOINDEX: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

// ---------------------------------------------------------------------------
// JSON-LD: Organisation (MedicalOrganization)
// ---------------------------------------------------------------------------
interface JsonLdOrganization {
  '@context': 'https://schema.org';
  '@type': 'MedicalOrganization';
  name: string;
  url: string;
  logo: string;
  description: string;
  contactPoint: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: 'customer service';
    email: string;
  };
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
  };
  sameAs: string[];
}

export function buildOrganizationJsonLd(): JsonLdOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: BRANDING.APP_NAME,
    url: BRANDING.APP_URL,
    logo: buildCanonicalUrl('/android-chrome-512x512.png'),
    description: BRANDING.OG_DESCRIPTION,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BRANDING.CONTACT_PHONE,
      contactType: 'customer service',
      email: BRANDING.CONTACT_EMAIL,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: BRANDING.CONTACT_ADDRESS,
    },
    sameAs: [BRANDING.APP_URL],
  };
}

// ---------------------------------------------------------------------------
// JSON-LD: Physician
// ---------------------------------------------------------------------------
interface JsonLdPhysician {
  '@context': 'https://schema.org';
  '@type': 'Physician';
  name: string;
  url: string;
  image: string;
  description: string;
  medicalSpecialty: string[];
  worksFor: {
    '@type': 'MedicalOrganization';
    name: string;
    url: string;
  };
}

interface DoctorJsonLdInput {
  firstName: string;
  lastName: string;
  profilePicture: string;
  bio: string;
  specializations: string[];
  id: string;
}

export function buildPhysicianJsonLd(doctor: DoctorJsonLdInput): JsonLdPhysician {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
    url: buildCanonicalUrl(`/doctor/${doctor.id}`),
    image: doctor.profilePicture,
    description: doctor.bio,
    medicalSpecialty: doctor.specializations,
    worksFor: {
      '@type': 'MedicalOrganization',
      name: BRANDING.APP_NAME,
      url: BRANDING.APP_URL,
    },
  };
}

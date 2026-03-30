import { JSX } from 'react';
import Home from '@/components/home/home';
import type { Metadata } from 'next';
import { BRANDING } from '@/constants/branding.constant';
import { buildOpenGraph, buildTwitterCard, buildCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: `${BRANDING.APP_NAME} – ${BRANDING.SLOGAN}`,
  description: BRANDING.OG_DESCRIPTION,
  keywords: [...BRANDING.KEYWORDS],
  alternates: {
    canonical: buildCanonicalUrl('/'),
  },
  openGraph: buildOpenGraph({
    url: buildCanonicalUrl('/'),
  }),
  twitter: buildTwitterCard(),
};

export default function HomePage(): JSX.Element {
  return <Home />;
}

import React, { JSX } from 'react';
import Policy from '../_components/policy';
import type { Metadata } from 'next';
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard } from '@/lib/seo';
import { BRANDING } from '@/constants/branding.constant';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Learn how ${BRANDING.APP_NAME} collects, uses, and protects your personal health information.`,
  alternates: {
    canonical: buildCanonicalUrl('/privacy-policy'),
  },
  openGraph: buildOpenGraph({
    title: `Privacy Policy | ${BRANDING.APP_NAME}`,
    description: `Learn how ${BRANDING.APP_NAME} collects, uses, and protects your personal health information.`,
    url: buildCanonicalUrl('/privacy-policy'),
  }),
  twitter: buildTwitterCard({
    title: `Privacy Policy | ${BRANDING.APP_NAME}`,
    description: `Learn how ${BRANDING.APP_NAME} collects, uses, and protects your personal health information.`,
  }),
};

const Privacy = (): JSX.Element => <Policy />;

export default Privacy;

import { JSX } from 'react';
import CookiePolicy from '../_components/cookiePolicy';
import type { Metadata } from 'next';
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard } from '@/lib/seo';
import { BRANDING } from '@/constants/branding.constant';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: `Understand how ${BRANDING.APP_NAME} uses cookies and similar technologies on our platform.`,
  alternates: {
    canonical: buildCanonicalUrl('/cookie-policy'),
  },
  openGraph: buildOpenGraph({
    title: `Cookie Policy | ${BRANDING.APP_NAME}`,
    description: `Understand how ${BRANDING.APP_NAME} uses cookies and similar technologies on our platform.`,
    url: buildCanonicalUrl('/cookie-policy'),
  }),
  twitter: buildTwitterCard({
    title: `Cookie Policy | ${BRANDING.APP_NAME}`,
    description: `Understand how ${BRANDING.APP_NAME} uses cookies and similar technologies on our platform.`,
  }),
};

const CookiePolicyPage = (): JSX.Element => <CookiePolicy />;

export default CookiePolicyPage;

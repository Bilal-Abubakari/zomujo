import React, { JSX } from 'react';
import TermsAndCondition from '../_components/termsConditions';
import type { Metadata } from 'next';
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard } from '@/lib/seo';
import { BRANDING } from '@/constants/branding.constant';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `Read the terms and conditions governing your use of the ${BRANDING.APP_NAME} healthcare platform.`,
  alternates: {
    canonical: buildCanonicalUrl('/terms-conditions'),
  },
  openGraph: buildOpenGraph({
    title: `Terms & Conditions | ${BRANDING.APP_NAME}`,
    description: `Read the terms and conditions governing your use of the ${BRANDING.APP_NAME} healthcare platform.`,
    url: buildCanonicalUrl('/terms-conditions'),
  }),
  twitter: buildTwitterCard({
    title: `Terms & Conditions | ${BRANDING.APP_NAME}`,
    description: `Read the terms and conditions governing your use of the ${BRANDING.APP_NAME} healthcare platform.`,
  }),
};

const TermsConditions = (): JSX.Element => <TermsAndCondition />;

export default TermsConditions;

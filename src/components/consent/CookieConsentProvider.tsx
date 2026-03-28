'use client';

import { JSX } from 'react';
import dynamic from 'next/dynamic';

// Dynamically imported so it only runs on the client (no SSR),
// preventing any localStorage hydration mismatch.
const CookieConsentBanner = dynamic(() => import('./CookieConsentBanner'), { ssr: false });

const CookieConsentProvider = (): JSX.Element => <CookieConsentBanner />;

export default CookieConsentProvider;

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { JSX, ReactNode } from 'react';
import StoreProvider from '@/app/storeProvider';
import { BRANDING } from '@/constants/branding.constant';
import CookieConsentProvider from '@/components/consent/CookieConsentProvider';
import {
  buildOpenGraph,
  buildTwitterCard,
  buildOrganizationJsonLd,
  buildCanonicalUrl,
} from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#08af85',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BRANDING.APP_URL),
  title: {
    default: `${BRANDING.APP_NAME} – ${BRANDING.SLOGAN}`,
    template: `%s | ${BRANDING.APP_NAME}`,
  },
  description: BRANDING.OG_DESCRIPTION,
  keywords: [...BRANDING.KEYWORDS],
  applicationName: BRANDING.APP_NAME,
  authors: [{ name: BRANDING.APP_NAME, url: BRANDING.APP_URL }],
  creator: BRANDING.APP_NAME,
  publisher: BRANDING.APP_NAME,
  alternates: {
    canonical: buildCanonicalUrl('/'),
  },
  openGraph: buildOpenGraph(),
  twitter: buildTwitterCard(),
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-256x256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  const orgJsonLd = buildOrganizationJsonLd();

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <StoreProvider>{children}</StoreProvider>
        <Toaster />
        <CookieConsentProvider />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}

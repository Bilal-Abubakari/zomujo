import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { JSX, ReactNode } from 'react';
import StoreProvider from '@/app/storeProvider';
import { BRANDING } from '@/constants/branding.constant';

const inter = Inter({
  subsets: ['latin'],
});
export const metadata: Metadata = {
  title: BRANDING.APP_NAME,
  description:
    'A secure healthcare platform to boost patient engagement and improve overall healthcare delivery',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <StoreProvider>
          {children}
        </StoreProvider>

        <Toaster />
      </body>
    </html>
  );
}

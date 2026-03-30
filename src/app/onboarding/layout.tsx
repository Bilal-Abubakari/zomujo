import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';
import { ReactNode, JSX } from 'react';

export const metadata: Metadata = NOINDEX;

export default function OnboardingLayout({
  children,
}: Readonly<{ children: ReactNode }>): JSX.Element {
  return <>{children}</>;
}


import { JSX } from 'react';
import Verifications from '@/components/verification/Verifications';
import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

export const metadata: Metadata = NOINDEX;

const VerifyEmail = (): JSX.Element => <Verifications />;

export default VerifyEmail;

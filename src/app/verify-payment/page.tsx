import { JSX } from 'react';
import Verifications from '@/components/verification/Verifications';
import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

export const metadata: Metadata = NOINDEX;

const VerifyPaymentPage = (): JSX.Element => <Verifications type="payment" />;

export default VerifyPaymentPage;

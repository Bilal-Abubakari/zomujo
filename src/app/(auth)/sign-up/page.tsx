import { JSX } from 'react';
import SignUp from '@/app/(auth)/_components/signUp';
import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

export const metadata: Metadata = NOINDEX;

const SignUpPage = (): JSX.Element => <SignUp />;

export default SignUpPage;

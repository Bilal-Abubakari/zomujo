import Dashboard from '@/app/dashboard/_components/dashboard';
import { JSX } from 'react';
import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

export const metadata: Metadata = NOINDEX;

const Main = (): JSX.Element => <Dashboard />;

export default Main;

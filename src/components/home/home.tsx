'use client';
import { JSX } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/hero';
import { useQueryParam } from '@/hooks/useQueryParam';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/home/navigation';

const Doctors = dynamic(() => import('@/app/dashboard/(patient)/find-doctor/_components/doctors'), {
  loading: () => <SectionFallback />,
  ssr: false,
});
const Footer = dynamic(() => import('@/components/home/footer'), {
  loading: () => <MinimalFallback />,
  ssr: false,
});
const Statistics = dynamic(() => import('./statistics'), {
  loading: () => <SectionFallback />,
  ssr: false,
});
const AvailableFeatures = dynamic(() => import('./availableFeatures'), {
  loading: () => <SectionFallback />,
  ssr: false,
});
const SolutionsOffered = dynamic(() => import('./solutionsOffered'), {
  loading: () => <SectionFallback />,
  ssr: false,
});
const HowItWorks = dynamic(() => import('./howItWorks'), {
  loading: () => <SectionFallback />,
  ssr: false,
});
const Faq = dynamic(() => import('./faq'), {
  loading: () => <SectionFallback />,
  ssr: false,
});
const Pricing = dynamic(() => import('./pricing'), {
  loading: () => <SectionFallback />,
  ssr: false,
});
const InterestedProvider = dynamic(() => import('./interestedProviders'), {
  loading: () => <SectionFallback />,
  ssr: false,
});

const SectionFallback = (): JSX.Element => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="animate-spin" size={32} />
  </div>
);

const MinimalFallback = (): JSX.Element => (
  <div className="flex items-center justify-center py-4">
    <Loader2 className="animate-spin" size={24} />
  </div>
);

export default function Home(): JSX.Element {
  const { hasSearchParams } = useQueryParam();
  const router = useRouter();

  const handleBackClick = (): void => {
    router.push('/');
  };

  return (
    <div>
      {hasSearchParams ? (
        <div className="mx-4 md:mx-10">
          <div className="mt-4 mb-4 flex items-center justify-between">
            <Button
              onClick={handleBackClick}
              child={
                <>
                  <ArrowLeft />
                  Back
                </>
              }
            />
            <Navigation />
          </div>
          <Doctors />
        </div>
      ) : (
        <>
          <Hero />
          <Statistics />
          <AvailableFeatures />
          <Pricing />
          <SolutionsOffered />
          <HowItWorks />
          <Faq />
          <InterestedProvider />
        </>
      )}
      <Footer />
    </div>
  );
}

'use client';
import { JSX, lazy, Suspense } from 'react';
import Hero from '@/components/home/hero';
import { useQueryParam } from '@/hooks/useQueryParam';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/home/navigation';

const Doctors = lazy(() => import('@/app/dashboard/(patient)/find-doctor/_components/doctors'));
const Footer = lazy(() => import('@/components/home/footer'));
const Statistics = lazy(() => import('./statistics'));
const AvailableFeatures = lazy(() => import('./availableFeatures'));
const SolutionsOffered = lazy(() => import('./solutionsOffered'));
const HowItWorks = lazy(() => import('./howItWorks'));
const Faq = lazy(() => import('./faq'));
const InterestedProvider = lazy(() => import('./interestedProviders'));

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
          <Suspense fallback={<SectionFallback />}>
            <Doctors />
          </Suspense>
        </div>
      ) : (
        <>
          <Hero />
          <Suspense fallback={<SectionFallback />}>
            <Statistics />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <AvailableFeatures />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <SolutionsOffered />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <HowItWorks />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Faq />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <InterestedProvider />
          </Suspense>
        </>
      )}
      <Suspense fallback={<MinimalFallback />}>
        <Footer />
      </Suspense>
    </div>
  );
}

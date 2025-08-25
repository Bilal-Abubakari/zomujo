'use client';
import Header from '@/components/home/header';
import { JSX } from 'react';
import Hero from '@/components/home/hero';
import Footer from '@/components/home/footer';
import OrganizationsComingSoon from '@/components/home/organizationsComingSoon';
import { useQueryParam } from '@/hooks/useQueryParam';
import Doctors from '@/app/dashboard/(patient)/find-doctor/_components/doctors';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/home/navigation';

export default function Home(): JSX.Element {
  const { hasSearchParams } = useQueryParam();
  const router = useRouter();

  const handleBackClick = (): void => {
    router.push('/');
  };

  return (
    <div>
      {hasSearchParams ? (
        <div className="mx-10">
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
          {' '}
          <Header />
          <Hero />
          <OrganizationsComingSoon />
        </>
      )}
      <Footer />
    </div>
  );
}

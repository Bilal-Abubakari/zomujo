'use client';
import Image from 'next/image';
import React, { JSX } from 'react';
import { Logo } from '@/assets/images';
import { cn } from '@/lib/utils';
import PersonalDetails from '@/app/onboarding/_components/personalDetails';
import { useAppSelector } from '@/lib/hooks';
import DoctorIdentification from '@/app/onboarding/_components/doctorIdentification';
import DoctorPhotoUpload from '@/app/onboarding/_components/doctorPhotoUpload';
import { AlertMessage } from '@/components/ui/alert';

const DoctorOnboarding = (): JSX.Element => {
  const currentStep = useAppSelector(({ authentication }) => authentication.currentStep);
  const errorMessage = useAppSelector(({ authentication }) => authentication.errorMessage);

  const currentView = {
    1: <PersonalDetails />,
    2: <DoctorIdentification />,
    3: <DoctorPhotoUpload />,
  }[currentStep];

  return (
    <div className="flex min-h-screen w-screen flex-col items-center bg-[#FAFAFA]">
      <header className="relative w-full bg-white px-4 py-6 sm:px-8 md:px-12 md:py-10 lg:px-[72px]">
        <Image
          src={Logo}
          className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 sm:h-11 sm:w-11"
          alt="Zyptyk Logo"
        />
      </header>
      <div className="mt-8 flex w-full max-w-[610px] flex-col gap-8 px-4 pb-8 sm:mt-12 sm:gap-10 sm:px-6 md:mt-16 md:gap-12 md:px-8 lg:mt-[70px] lg:px-0">
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-4 sm:text-base">Step {currentStep} of 3</p>
          <div className="flex flex-row items-center justify-between gap-4">
            {Array(3)
              .fill('')
              .map((_, i) => (
                <div
                  key={`progress-${i}`}
                  className={cn(
                    'h-1 w-full duration-150',
                    currentStep >= i + 1 ? 'bg-primary' : 'bg-gray-200',
                  )}
                />
              ))}
          </div>
        </div>
        {errorMessage && (
          <AlertMessage message={errorMessage} className="w-full max-w-sm" variant="destructive" />
        )}
        {currentView}
      </div>
    </div>
  );
};

export default DoctorOnboarding;

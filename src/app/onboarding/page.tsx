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
    <div className="flex h-screen w-screen flex-col items-center bg-[#FAFAFA]">
      <header className="relative w-full bg-white px-[72px] py-10">
        <Image
          src={Logo}
          className="absolute top-1/2 left-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2"
          alt="Zyptyk Logo"
        />
      </header>
      <div className="mt-[70px] flex w-[610px] flex-col gap-12">
        <div className="flex flex-col gap-3">
          <p className="leading-4">Step {currentStep} of 3</p>
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
          <AlertMessage message={errorMessage} className="max-w-sm" variant="destructive" />
        )}
        {currentView}
      </div>
    </div>
  );
};

export default DoctorOnboarding;

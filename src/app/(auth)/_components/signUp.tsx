'use client';
import AuthenticationFrame, { ImagePosition } from '../_components/authenticationFrame';
import Text from '@/components/text/text';
import Image from 'next/image';
import { Logo, SignUpSlide } from '@/assets/images';
import SignUpForm from '../_components/signUpForm';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { useBookingInfo } from '@/hooks/useBookingInfo';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import AuthPopIn from './authPopIn';
import { useSearchParams } from 'next/navigation';
import BookingInfoCard from './BookingInfoCard';
import { BRANDING } from '@/constants/branding.constant';

const SignUp = (): JSX.Element => {
  const searchParams = useSearchParams();
  const { isLoading, appointmentSlot, doctor, hasBookingInfo, fullName, doctorId, slotId } =
    useBookingInfo();
  const [isPopInOpen, setIsPopInOpen] = useState(false);

  useEffect(() => {
    if (hasBookingInfo) {
      setIsPopInOpen(true);
    }
  }, [hasBookingInfo]);

  const loginLink = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return `/login?${params.toString()}`;
  }, [searchParams]);

  return (
    <div className="relative md:-ml-6">
      {isLoading && hasBookingInfo && <LoadingOverlay />}
      {hasBookingInfo && (
        <AuthPopIn
          isOpen={isPopInOpen}
          onClose={() => setIsPopInOpen(false)}
          message={
            <p className="text-sm text-gray-600">
              Already have an account? Log in to complete your booking.
            </p>
          }
          buttonText="Go to Login"
          link={loginLink}
        />
      )}
      <AuthenticationFrame
        imageSlide={SignUpSlide}
        imageAlt="sign-up"
        imagePosition={ImagePosition.Left}
      >
        {hasBookingInfo && doctor && appointmentSlot ? (
          <>
            <BookingInfoCard
              doctor={doctor}
              appointmentSlot={appointmentSlot}
              fullName={fullName}
            />
            <div className="mx-auto mt-4 w-full max-w-sm md:mt-8">
              <span className="text-xl font-bold md:text-2xl">Tell us a bit about you</span>
              <p className="mt-1 text-sm text-gray-500">
                To book your appointment, we need to verify a few things for Dr. {doctor.lastName}
              </p>
            </div>
          </>
        ) : (
          <div>
            <Image
              src={Logo}
              width={44}
              height={44}
              alt={`${BRANDING.APP_NAME}-logo`}
              className="m-auto"
            />
            <div className="mt-5 flex w-full flex-col items-center space-y-3 2xl:space-y-3.5">
              <div className="flex flex-col items-center text-center">
                <Text variantStyle="h4" variant="h4">
                  Get started with {BRANDING.APP_NAME}
                </Text>
                <Text variantStyle="body-small" className="text-grayscale-500">
                  Create new account by providing your details below
                </Text>
              </div>
            </div>
          </div>
        )}

        <SignUpForm hasBookingInfo={hasBookingInfo} slotId={slotId} doctorId={doctorId} />
      </AuthenticationFrame>
    </div>
  );
};

export default SignUp;

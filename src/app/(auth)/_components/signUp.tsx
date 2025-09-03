'use client';
import AuthenticationFrame, { ImagePosition } from '../_components/authenticationFrame';
import Text from '@/components/text/text';
import Image from 'next/image';
import { Logo, SignUpSlide } from '@/assets/images';
import SignUpForm from '../_components/signUpForm';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { useQueryParam } from '@/hooks/useQueryParam';
import { AvatarComp } from '@/components/ui/avatar';
import { useAppDispatch } from '@/lib/hooks';
import { doctorInfo } from '@/lib/features/doctors/doctorsThunk';
import { getAppointmentSlot } from '@/lib/features/appointments/appointmentsThunk';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import { AppointmentSlots } from '@/types/slots.interface';
import { IDoctor } from '@/types/doctor.interface';
import moment from 'moment';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';

const SignUp = (): JSX.Element => {
  const { getQueryParam } = useQueryParam();
  const doctorId = getQueryParam('doctorId');
  const slotId = getQueryParam('slotId');
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentSlot, setAppointmentSlot] = useState<AppointmentSlots | null>(null);
  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const fullName = useMemo(
    () => (doctor ? `${doctor.firstName} ${doctor.lastName}` : ''),
    [doctor],
  );
  const hasBookingInfo = useMemo(() => !!doctorId && !!slotId, [doctorId, slotId]);

  useEffect(() => {
    const fetchBookingInfo = async (): Promise<void> => {
      if (hasBookingInfo) {
        const [{ payload: doctorInfoResponse }, { payload: slotResponse }] = await Promise.all([
          dispatch(doctorInfo(doctorId)),
          dispatch(getAppointmentSlot(slotId)),
        ]);
        if (showErrorToast(doctorInfoResponse) || showErrorToast(slotResponse)) {
          toast({
            title: ToastStatus.Error,
            description: 'Failed to load booking info',
            variant: 'destructive',
          });
          return;
        }
        setAppointmentSlot(slotResponse as AppointmentSlots);
        setDoctor(doctorInfoResponse as IDoctor);
      }
      setIsLoading(false);
    };
    void fetchBookingInfo();
  }, [dispatch, doctorId, hasBookingInfo, slotId]);

  return (
    <div className="relative -ml-6">
      {isLoading && <LoadingOverlay />}
      <AuthenticationFrame
        imageSlide={SignUpSlide}
        imageAlt="sign-up"
        imagePosition={ImagePosition.Left}
      >
        {hasBookingInfo ? (
          <>
            <div className="mx-auto w-full max-w-sm rounded-lg border p-4">
              <div className="mb-4 flex w-full flex-row gap-4">
                <div>
                  <AvatarComp
                    imageSrc={doctor?.profilePicture}
                    name={fullName}
                    className="h-18 w-18"
                  />
                </div>
                <div className="flex w-full flex-col justify-center gap-y-1">
                  <div className="flex items-center">
                    <h2 className="text-lg font-bold text-gray-900">Dr. {fullName}</h2>
                  </div>
                  <p className="text-primary-600 text-sm font-medium">
                    {doctor?.specializations ? doctor.specializations[0] : 'General Practitioner'}
                  </p>
                  <p className="text-primary-600 text-sm font-medium">
                    {appointmentSlot?.date && moment(appointmentSlot.date).format('ddd, MMM D')} at{' '}
                    {appointmentSlot?.startTime &&
                      moment(appointmentSlot.startTime).format('h:mm A')}
                  </p>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-8 w-full max-w-sm">
              <span className="text-2xl font-bold">Tell us a bit about you</span>
              <p className="mt-1 text-sm text-gray-500">
                To book your appointment, we need to verify a few things for Dr. Bilal&#39;s office
              </p>
            </div>
          </>
        ) : (
          <div>
            <Image src={Logo} width={44} height={44} alt="Zyptyk-logo" className="m-auto" />
            <div className="mt-5 flex w-full flex-col items-center space-y-3 2xl:space-y-3.5">
              <div className="flex flex-col items-center">
                <Text variantStyle="h4" variant="h4">
                  Get started with Zyptyk
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

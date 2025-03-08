'use client';
import { cn, showErrorToast } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import React, { JSX, useEffect, useState } from 'react';
import AvailableDates from './availableDates';
import AppointmentReason from './appointmentReason';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { BookingForm } from '@/types/booking.interface';
import { AvatarComp } from '@/components/ui/avatar';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { IDoctor } from '@/types/doctor.interface';
import { useAppDispatch } from '@/lib/hooks';
import { doctorInfo } from '@/lib/features/doctors/doctorsThunk';
import { toast } from '@/hooks/use-toast';
import { initiatePayment } from '@/lib/features/payments/paymentsThunk';
import { ICheckout } from '@/types/payment.interface';

const AvailableAppointment = (): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(1);
  const [doctorInformation, setDoctorInformation] = useState<IDoctor>();
  const [isPaymentInitiated, setIsPaymentInitiated] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const params = useParams();
  const doctorId = params.appointment;
  const router = useRouter();
  const dateToday = new Date();

  const BookingSchema = z.object({
    date: requiredStringSchema(),
    time: requiredStringSchema(),
    reason: requiredStringSchema(),
    appointmentType: requiredStringSchema(),
    additionalInfo: requiredStringSchema(false),
  });

  const {
    register,
    setValue,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm<BookingForm>({
    resolver: zodResolver(BookingSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      appointmentType: 'virtual',
      date: dateToday.toISOString(),
    },
  });                                                   

  const onSubmit = async (): Promise<void> => {
    setIsPaymentInitiated(true);
    const { payload } = await dispatch(
      initiatePayment({ amount: doctorInformation?.fee?.amount ?? 0, doctorId: String(doctorId) }),
    );

    if (payload && showErrorToast(payload)) {
      toast(payload);
      return;
    }

    const response = payload as ICheckout;
    if (response) {
      window.open(response.authorization_url, '_blank');
    }

    setIsPaymentInitiated(false);
  };

  useEffect(() => {
    async function getDoctorInfo(): Promise<void> {
      const { payload } = await dispatch(doctorInfo(String(doctorId)));

      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }

      setDoctorInformation(payload as IDoctor);
    }
    void getDoctorInfo();
  }, []);

  return (
    <div>
      <button
        className="mb-5 flex rounded-lg border border-gray-300 bg-gray-200 p-2 sm:mb-0"
        onClick={() => router.back()}
      >
        <ChevronLeft /> <span className="hidden sm:block">Find doctors</span>
      </button>

      <div className="m-auto w-[80vw] max-w-[447px]">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row">
          <p className="leading-4">Step {currentStep} of 3</p>
          <div className="flex flex-row items-center justify-between">
            {Array(3)
              .fill('')
              .map((_, i) => (
                <div
                  key={`progress-${i}`}
                  className={cn(
                    'h-1 w-20 duration-150',
                    currentStep >= i + 1 ? 'bg-primary' : 'bg-gray-200',
                  )}
                />
              ))}
          </div>
        </div>
        {currentStep === 1 && (
          <AvailableDates
            register={register}
            setValue={setValue}
            setCurrentStep={setCurrentStep}
            watch={watch}
          />
        )}
        {currentStep === 2 && (
          <AppointmentReason
            register={register}
            setValue={setValue}
            setCurrentStep={setCurrentStep}
            isValid={isValid}
            watch={watch}
            errors={errors}
          />
        )}
        {currentStep === 3 && (
          <form
            className="mb-8 w-[447px] max-w-[80vw] rounded-md border bg-white p-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <p className="mb-8 text-xl font-bold"> Booking Summary</p>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-20 border-b border-dashed text-gray-400"></div>
              <div className="rounded-2xl border p-1 text-gray-400">BOOKING INFORMATION</div>
              <div className="w-full max-w-20 border-b border-dashed text-gray-400"></div>
            </div>

            <div className="mt-8 flex gap-2">
              <AvatarComp
                name={doctorInformation?.firstName ?? ''}
                imageSrc={doctorInformation?.profilePicture}
              />
              <div className="flex flex-col">
                <p className="text-lg font-bold">
                  Dr. {doctorInformation?.firstName} {doctorInformation?.lastName}
                </p>
                <p className="text-sm font-medium text-gray-400">
                  {doctorInformation?.specializations[0]}
                </p>
              </div>
            </div>

            <div className="mt-8 mb-8 w-full border-b border-gray-100"></div>

            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-500">Date</div>
              <div className="font-medium">{moment(getValues('date')).format('LL')}</div>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-500">Time</div>
              <div className="font-medium">{getValues('time')}</div>
            </div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="whitespace-nowrap text-gray-500">Reason for consult</div>
              <div className="truncate font-medium">{getValues('reason')}</div>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-500">Appointment</div>
              <div className="font-medium">
                <Badge variant={'blue'}> {getValues('appointmentType')} </Badge>
              </div>
            </div>

            {getValues('additionalInfo') && (
              <div className="rounded-xl bg-gray-100 p-4">
                <p className="font-bold">Additional Note</p>
                <p className="text-gray-400">{getValues('additionalInfo')} </p>
              </div>
            )}

            <div className="my-8 flex items-center justify-center">
              <div className="w-full max-w-32 border-b border-dashed text-gray-400"></div>
              <div className="rounded-2xl border p-1 text-gray-400">BILL DETAILS</div>
              <div className="w-full max-w-32 border-b border-dashed text-gray-400"></div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-500">Consultation Fee</div>
              <div className="font-medium"> GHC {doctorInformation?.fee?.amount ?? 0}.00</div>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-500">Booking Fee</div>
              <div className="font-medium"> GHC 5.00</div>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-500">Total</div>
              <div className="text-lg font-bold">
                {' '}
                GHC {(doctorInformation?.fee?.amount ?? 0) + 5}.00
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <Button child={'Back'} variant={'outline'} onClick={() => setCurrentStep(2)} />
              <Button
                child={'Make Payment'}
                onClick={() => setCurrentStep(3)}
                disabled={!isValid}
                isLoading={isPaymentInitiated}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AvailableAppointment;

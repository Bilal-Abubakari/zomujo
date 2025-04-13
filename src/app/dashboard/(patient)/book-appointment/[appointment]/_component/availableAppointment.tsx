'use client';
import { cn, showErrorToast } from '@/lib/utils';
import { Building2, ChevronLeft } from 'lucide-react';
import React, { JSX, useCallback, useEffect, useState } from 'react';
import AvailableDates from './availableDates';
import AppointmentReason from './appointmentReason';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { IBookingForm } from '@/types/booking.interface';
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
import { IHospital } from '@/types/hospital.interface';
import { MedicalAppointmentType, useQueryParam } from '@/hooks/useQueryParam';
import { getHospital } from '@/lib/features/hospitals/hospitalThunk';
import Image from 'next/image';
import { AppointmentType } from '@/types/appointment.interface';

const AvailableAppointment = (): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPaymentInitiated, setIsPaymentInitiated] = useState<boolean>(false);
  const [information, setInformation] = useState<IDoctor | IHospital>();
  const dispatch = useAppDispatch();
  const params = useParams();
  const router = useRouter();
  const { getQueryParam } = useQueryParam();
  const id = params.appointment as string;
  const dateToday = new Date();

  const bookingSchema = z.object({
    date: requiredStringSchema(),
    time: requiredStringSchema(),
    slotId: requiredStringSchema(),
    reason: requiredStringSchema(),
    appointmentType: requiredStringSchema(),
    additionalInfo: requiredStringSchema(false),
    amount: z.number(),
  });

  const getAmount = useCallback((): number => {
    if (!information) {
      return 0;
    }
    if ('fee' in information) {
      return information.fee.amount;
    }
    return information.regularFee;
  }, [information]);

  const {
    register,
    setValue,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm<IBookingForm>({
    resolver: zodResolver(bookingSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      amount: getAmount(),
      appointmentType: AppointmentType.Virtual,
      date: dateToday.toISOString(),
    },
  });

  const onSubmit = async ({ reason, additionalInfo, slotId }: IBookingForm): Promise<void> => {
    if (!information) {
      return;
    }
    setIsPaymentInitiated(true);

    const { payload } = await dispatch(
      initiatePayment({ amount: getAmount(), additionalInfo, reason, slotId }),
    );

    if (payload && showErrorToast(payload)) {
      toast(payload);
      setIsPaymentInitiated(false);
      return;
    }

    const { authorization_url } = payload as ICheckout;
    window.location.replace(authorization_url);
    setIsPaymentInitiated(false);
  };

  useEffect(() => {
    const appointmentType = getQueryParam('appointmentType');
    if (!appointmentType) {
      router.push('/dashboard/find-doctor');
      return;
    }
    async function getInfo(): Promise<void> {
      let payload: unknown;
      if (appointmentType === MedicalAppointmentType.Doctor) {
        const { payload: doctorResponse } = await dispatch(doctorInfo(id));
        payload = doctorResponse;
      } else {
        const { payload: hospitalResponse } = await dispatch(getHospital(id));
        payload = hospitalResponse;
      }

      if (payload && showErrorToast(payload)) {
        router.push('/dashboard/find-doctor');
        toast(payload);
        return;
      }

      setInformation(payload as IHospital | IDoctor);
    }
    void getInfo();
  }, []);

  return (
    <div>
      <button
        className="mb-5 flex rounded-lg border border-gray-300 bg-gray-200 p-2 sm:mb-0"
        onClick={() => router.back()}
      >
        <ChevronLeft /> <span className="hidden sm:block">Go back</span>
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
              {information && 'firstName' in information && (
                <>
                  <AvatarComp name={information.firstName} imageSrc={information.profilePicture} />
                  <div className="flex flex-col">
                    <p className="text-lg font-bold">
                      Dr. {information.firstName} {information.lastName}
                    </p>
                    <p className="text-sm font-medium text-gray-400">
                      {information.specializations[0]}
                    </p>
                  </div>
                </>
              )}
              {information && 'name' in information && (
                <>
                  {information.image ? (
                    <Image
                      src={information.image}
                      alt={information.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-lg">
                      <Building2 size={40} className="text-primary" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-lg font-bold">{information.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {information.specialties?.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
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
              <div className="font-medium"> GHC {getAmount()}.00</div>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-500">Total</div>
              <div className="text-lg font-bold">
                {' '}
                GHC{' '}
                {information && 'fee' in information
                  ? (information?.fee?.amount ?? 0)
                  : (information?.regularFee ?? 0)}
                .00
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <Button child={'Back'} variant={'outline'} onClick={() => setCurrentStep(2)} />
              <Button
                child={'Make Payment'}
                onClick={() => setCurrentStep(3)}
                disabled={!isValid || isPaymentInitiated}
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

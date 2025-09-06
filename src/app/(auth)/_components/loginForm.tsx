'use client';
import Image from 'next/image';
import Link from 'next/link';
import Text from '@/components/text/text';
import { Logo } from '@/assets/images';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { emailSchema, requiredStringSchema } from '@/schemas/zod.schemas';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MODE } from '@/constants/constants';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AlertMessage } from '@/components/ui/alert';
import { login } from '@/lib/features/auth/authThunk';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { selectThunkState } from '@/lib/features/auth/authSelector';
import { useRouter, useSearchParams } from 'next/navigation';
import { ILogin, ILoginResponse } from '@/types/auth.interface';
import { authenticationProvider } from './authenticationProvider';
import { useQueryParam } from '@/hooks/useQueryParam';
import { doctorInfo } from '@/lib/features/doctors/doctorsThunk';
import { getAppointmentSlot } from '@/lib/features/appointments/appointmentsThunk';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import { AppointmentSlots } from '@/types/slots.interface';
import { IDoctor } from '@/types/doctor.interface';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { AvatarComp } from '@/components/ui/avatar';
import moment from 'moment';
import AuthPopIn from './authPopIn';

const loginSchema = z.object({
  email: emailSchema,
  password: requiredStringSchema(),
});

const LoginForm = (): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ILogin>({ resolver: zodResolver(loginSchema), mode: MODE.ON_TOUCH });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isLoading, errorMessage } = useAppSelector(selectThunkState);

  const { getQueryParam } = useQueryParam();
  const doctorId = getQueryParam('doctorId');
  const slotId = getQueryParam('slotId');
  const [isFetchingBookingInfo, setIsFetchingBookingInfo] = useState(true);
  const [appointmentSlot, setAppointmentSlot] = useState<AppointmentSlots | null>(null);
  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const [isPopInOpen, setIsPopInOpen] = useState(false);

  const fullName = useMemo(
    () => (doctor ? `${doctor.firstName} ${doctor.lastName}` : ''),
    [doctor],
  );
  const hasBookingInfo = useMemo(() => !!doctorId && !!slotId, [doctorId, slotId]);

  useEffect(() => {
    const fetchBookingInfo = async (): Promise<void> => {
      if (hasBookingInfo) {
        setIsPopInOpen(true);
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
          setIsFetchingBookingInfo(false);
          return;
        }
        setAppointmentSlot(slotResponse as AppointmentSlots);
        setDoctor(doctorInfoResponse as IDoctor);
      }
      setIsFetchingBookingInfo(false);
    };
    void fetchBookingInfo();
  }, [dispatch, doctorId, hasBookingInfo, slotId]);

  const onSubmit = async (loginCredentials: ILogin): Promise<void> => {
    const { payload } = await dispatch(login(loginCredentials));
    if (payload) {
      const data = payload as ILoginResponse;
      if (data.paystack) {
        window.location.replace(data.paystack.authorization_url);
      }
      router.push('/dashboard');
    }
  };

  const signUpLink = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return `/sign-up?${params.toString()}`;
  }, [searchParams]);

  return (
    <form className="flex w-full flex-col items-center" onSubmit={handleSubmit(onSubmit)}>
      {isFetchingBookingInfo && hasBookingInfo && <LoadingOverlay />}
      {hasBookingInfo && (
        <AuthPopIn
          isOpen={isPopInOpen}
          onClose={() => setIsPopInOpen(false)}
          message={
            <p className="text-sm text-gray-600">
              Don&apos;t have an account? Create one to complete your booking.
            </p>
          }
          buttonText="Go to Sign Up"
          link={signUpLink}
        />
      )}
      {hasBookingInfo && doctor && appointmentSlot ? (
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
                  {appointmentSlot?.startTime && moment(appointmentSlot.startTime).format('h:mm A')}
                </p>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-8 w-full max-w-sm">
            <span className="text-2xl font-bold">Welcome back!</span>
            <p className="mt-1 text-sm text-gray-500">
              Login to complete your booking with Dr. {doctor.lastName}.
            </p>
          </div>
        </>
      ) : (
        <>
          <Image src={Logo} width={44} height={44} alt="Zyptyk-logo" />
          <div className="mt-5 flex w-full flex-col items-center space-y-3 2xl:space-y-3.5">
            <div className="flex flex-col items-center">
              <Text variantStyle="h4" variant="h4">
                Welcome to Zyptyk
              </Text>
              <Text variantStyle="body-small" className="text-grayscale-500">
                Login to your account to get started
              </Text>
            </div>
          </div>
        </>
      )}
      <div className="flex w-full flex-col items-center gap-8 pt-8">
        {errorMessage && (
          <AlertMessage message={errorMessage} className="max-w-sm" variant="destructive" />
        )}
        <Input
          labelName="Email"
          type="email"
          error={errors.email?.message}
          placeholder="Enter your email"
          {...register('email')}
        />
        <Input
          labelName="Password"
          type="password"
          placeholder="Enter your password"
          enablePasswordToggle={true}
          error={errors.password?.message}
          {...register('password')}
        />
        <Button
          isLoading={isLoading}
          child="Login"
          disabled={!isValid || isLoading}
          className="w-full max-w-sm"
        />
        <div className="flex w-full max-w-sm justify-between">
          <Checkbox
            name="remember"
            labelClassName="font-normal leading-none text-base"
            labelName="Remember me"
          />

          <Link href="/forgot-password" className="text-primary">
            Forgot password?
          </Link>
        </div>
        <div>
          <span> Don&rsquo;t have an account? </span>
          <Link href={signUpLink} className="text-primary pl-1">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default authenticationProvider(LoginForm);

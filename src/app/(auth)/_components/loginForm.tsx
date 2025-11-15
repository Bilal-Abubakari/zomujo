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
import { login, initiateGoogleOAuth } from '@/lib/features/auth/authThunk';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { selectThunkState } from '@/lib/features/auth/authSelector';
import { useRouter, useSearchParams } from 'next/navigation';
import { ILogin, ILoginResponse } from '@/types/auth.interface';
import { authenticationProvider } from './authenticationProvider';
import { useBookingInfo } from '@/hooks/useBookingInfo';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import AuthPopIn from './authPopIn';
import BookingInfoCard from './BookingInfoCard';
import GoogleOAuthButton from '@/components/ui/googleOAuthButton';

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

  const {
    isLoading: isAuthLoading,
    isOAuthLoading,
    errorMessage,
  } = useAppSelector(selectThunkState);

  const { isLoading, appointmentSlot, doctor, hasBookingInfo, fullName, doctorId, slotId } =
    useBookingInfo();
  const [isPopInOpen, setIsPopInOpen] = useState(false);

  useEffect(() => {
    if (hasBookingInfo) {
      setIsPopInOpen(true);
    }
  }, [hasBookingInfo]);

  const onSubmit = async (loginCredentials: ILogin): Promise<void> => {
    const { payload } = await dispatch(
      login({
        ...loginCredentials,
        doctorId,
        slotId,
      }),
    );
    if (payload) {
      const data = payload as ILoginResponse;
      if (data.paystack) {
        window.location.replace(data.paystack.authorization_url);
        return;
      }
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    await dispatch(initiateGoogleOAuth({ doctorId, slotId }));
  };

  const signUpLink = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return `/sign-up?${params.toString()}`;
  }, [searchParams]);

  return (
    <form
      className="flex w-full flex-col items-center overflow-y-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      {isLoading && hasBookingInfo && <LoadingOverlay />}
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
          <BookingInfoCard doctor={doctor} appointmentSlot={appointmentSlot} fullName={fullName} />
          <div className="mx-auto mt-8 w-full max-w-sm">
            <span className="text-xl font-bold sm:text-2xl">Welcome back!</span>
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
          isLoading={isAuthLoading}
          child="Login"
          disabled={!isValid || isAuthLoading}
          className="w-full max-w-sm"
        />

        <div className="flex w-full max-w-sm items-center gap-4">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>

        <GoogleOAuthButton onClick={handleGoogleLogin} isLoading={isOAuthLoading} />

        <div className="flex w-full max-w-sm items-center justify-between text-sm sm:text-base">
          <Checkbox
            name="remember"
            labelClassName="font-normal leading-none"
            labelName="Remember me"
          />

          <Link href="/forgot-password" className="text-primary">
            Forgot password?
          </Link>
        </div>
        <div className="text-sm sm:text-base">
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

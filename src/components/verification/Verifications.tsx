'use client';
import { useAppDispatch } from '@/lib/hooks';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect, useState, useCallback } from 'react';
import { verifyEmail } from '@/lib/features/auth/authThunk';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ErrorIllustration, SuccessIllustration } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { capitalize } from '@/lib/utils';
import { verifyPayment } from '@/lib/features/payments/paymentsThunk';
import { PaymentVerification, useQueryParam } from '@/hooks/useQueryParam';
import { ICustomResponse } from '@/types/shared.interface';

type VerificationsProps = {
  type?: 'email' | 'payment';
};

const Verifications = ({ type = 'email' }: VerificationsProps): JSX.Element => {
  const redirectUrl = `/dashboard${type === 'email' ? '' : '/appointment?appointmentView=requests'}`;
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(7);
  const { token } = useParams<{ token: string }>();
  const dispatch = useAppDispatch();
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { getQueryParam } = useQueryParam();

  const handleVerificationSuccess = useCallback(
    (payload: string) => {
      setSuccessMessage(payload);
      const interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      const timeout = setTimeout(() => {
        router.push(redirectUrl);
      }, 6000);

      return (): void => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    },
    [router],
  );

  const submitVerification = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    const { payload } = await dispatch(
      type === 'email'
        ? verifyEmail(token)
        : verifyPayment(getQueryParam(PaymentVerification.reference)),
    );
    const { success, message } = payload as ICustomResponse;
    if (success) {
      handleVerificationSuccess(message);
    } else {
      setErrorMessage(message);
    }
    setIsLoading(false);
  }, [dispatch, token, handleVerificationSuccess]);

  useEffect(() => {
    void submitVerification();
  }, [submitVerification]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      {isLoading ? (
        <>
          <Loader2 strokeWidth={1} className="animate-spin" size={64} />
          <h1>Verifying {capitalize(type)}...</h1>
        </>
      ) : errorMessage ? (
        <>
          <Image width={200} src={ErrorIllustration} alt="Verification failed" />
          <h2 className="mt-4 font-semibold text-red-500">{errorMessage}</h2>
          {type === 'email' ? (
            <Button
              child="Login"
              variant="secondary"
              className="mt-5 w-full max-w-xs"
              onClick={() => router.push('/login')}
            />
          ) : (
            <div>
              <Button
                child="View Appointments"
                variant="secondary"
                className="mt-5 w-full max-w-xs"
                onClick={() => router.push(redirectUrl)}
              />
              <Button
                child="Retry"
                variant="secondary"
                className="mt-5 w-full max-w-xs"
                onClick={() => submitVerification()}
              />
            </div>
          )}
        </>
      ) : successMessage ? (
        <>
          <Image width={200} src={SuccessIllustration} alt="Verification Success" />
          <h2 className="text-primary mt-4 font-semibold">{successMessage}</h2>
          <h1>Redirecting in {countdown} seconds...</h1>
          <Button
            child="Redirect Now"
            className="mt-5 w-full max-w-xs"
            onClick={() => router.push(redirectUrl)}
          />
        </>
      ) : null}
    </div>
  );
};

export default Verifications;

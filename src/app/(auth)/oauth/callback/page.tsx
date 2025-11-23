'use client';
import { useEffect, useState, JSX } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { handleOAuthCallback } from '@/lib/features/auth/authThunk';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { LocalStorageManager } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const OAuthCallbackPage = (): JSX.Element | null => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processCallback = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
      setIsLoading(false);
      return;
    }

    // Create URLSearchParams from the current search params
    const queryParams = new URLSearchParams(searchParams.toString());

    if (queryParams.toString() === '') {
      setError('No authentication data received');
      setIsLoading(false);
      return;
    }

    // Retrieve booking data from localStorage
    const { doctorId, slotId, role } = LocalStorageManager.getOAuthBookingData();

    const response = await dispatch(
      handleOAuthCallback({
        queryParams,
        doctorId,
        slotId,
        role,
      }),
    ).unwrap();

    if (response.success) {
      LocalStorageManager.clearOAuthBookingData();

      const authorizationUrl = response.data?.authorization_url;
      if (authorizationUrl) {
        window.location.replace(authorizationUrl);
      } else {
        // Check for saved redirect URL
        const redirectUrl = LocalStorageManager.getAndClearRedirectUrl();
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/dashboard');
        }
      }
    } else {
      setError(response.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void processCallback();
  }, []);

  const handleTryAgain = (): void => {
    // Clear any stored data and redirect to login
    LocalStorageManager.clearOAuthBookingData();
    router.push('/login');
  };

  if (isLoading) {
    return <LoadingOverlay message="Verifying with google" />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Authentication Failed</h2>
            <p className="text-gray-600">{error}</p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleTryAgain} className="w-full" child="Try Again" />
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full"
              child="Go to Dashboard"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallbackPage;

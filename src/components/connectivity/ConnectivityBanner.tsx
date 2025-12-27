'use client';

import { JSX, useEffect } from 'react';
import { useConnectivity } from '@/hooks/useConnectivity';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { networkFailureErrorMessage } from '@/lib/axios';

export const ConnectivityBanner = (): JSX.Element | null => {
  const isOnline = useConnectivity();
  const { toasts, dismiss } = useToast();

  useEffect(() => {
    if (isOnline) {
      const networkToast = toasts.find((t) => t.description === networkFailureErrorMessage);
      if (networkToast) {
        dismiss(networkToast.id);
      }
    }
  }, [isOnline, toasts, dismiss]);

  if (isOnline) {
    return null;
  }

  return (
    <Alert className="fixed top-0 right-0 left-0 z-50 border-red-500 bg-red-50 text-red-800">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        No internet connection. Please check your network and try again.
      </AlertDescription>
    </Alert>
  );
};

'use client';

import { JSX, useEffect, useState } from 'react';
import { useConnectivity } from '@/hooks/useConnectivity';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { networkFailureErrorMessage } from '@/lib/axios';

export const ConnectivityBanner = (): JSX.Element | null => {
  const isOnline = useConnectivity();
  const { toasts, dismiss } = useToast();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isOnline) {
      const networkToast = toasts.find((t) => t.description === networkFailureErrorMessage);
      if (networkToast) {
        dismiss(networkToast.id);
      }
    } else {
      setIsDismissed(false);
    }
  }, [isOnline, toasts]);

  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <Alert className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-red-500 bg-red-50 text-red-800">
      <div className="flex items-center">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          Slow or No internet connection. Please check your network and try again.
        </AlertDescription>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="ml-2 rounded p-1 hover:bg-red-100"
        aria-label="Close connectivity banner"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
};

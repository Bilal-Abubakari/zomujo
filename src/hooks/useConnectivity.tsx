import { useEffect } from 'react';
import { setConnectivity } from '@/lib/features/connectivity/connectivitySlice';
import { RootState } from '@/lib/store';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

export const useConnectivity = (): boolean => {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector((state: RootState) => state.connectivity.isOnline);

  useEffect(() => {
    const checkConnectivity = async (): Promise<void> => {
      try {
        await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
        });
        dispatch(setConnectivity(true));
      } catch {
        dispatch(setConnectivity(false));
      }
    };

    void checkConnectivity();

    const handleOnline = (): void => {
      dispatch(setConnectivity(true));
      setTimeout(checkConnectivity, 1000);
    };
    const handleOffline = (): void => {
      dispatch(setConnectivity(false));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkConnectivity, 30000);

    return (): void => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [dispatch]);

  return isOnline;
};

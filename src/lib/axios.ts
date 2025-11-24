import { ToastStatus } from '@/types/shared.enum';
import axiosClient, { isAxiosError } from 'axios';
import { Toast } from '@/hooks/use-toast';
import { timeDifferenceChecker } from '@/lib/date';
import { LocalStorageManager } from '@/lib/localStorage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const FORNIX_URL = process.env.NEXT_PUBLIC_FORNIX_URL;

const networkFailureErrorMessage = 'Oops! Server Error... Please check your internet connection';

const axios = axiosClient.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const axiosFornix = axiosClient.create({
  baseURL: FORNIX_URL,
});

export const axiosBase = axiosClient.create();

// Flag to track if session expiry is already being handled
let isHandlingSessionExpiry = false;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isAxiosError(error)) {
      const user = JSON.parse(localStorage.getItem('persist:user') || '{}');
      const loggedInAt = user?.loggedInAt;
      if (error.response?.status === 401 && loggedInAt && !isHandlingSessionExpiry) {
        // Session usually expires after 24 hours
        // Let's allow a 30 minutes backup time to gracefully log out the user
        // Hence reason for 23.5 hours
        // We stringify before persisting to local storage hence the need to parse twice
        if (timeDifferenceChecker(JSON.parse(JSON.parse(loggedInAt)), 23.5)) {
          isHandlingSessionExpiry = true;

          // Clear all persisted Redux state first
          LocalStorageManager.clear();

          // Now save current URL for redirect after login
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== '/login' && !currentPath.startsWith('/sign-up')) {
            LocalStorageManager.saveRedirectUrl(currentPath);
          }

          LocalStorageManager.setSessionExpiredFlag();

          window.location.href = '/login';
        }
      }
    }
    if (isHandlingSessionExpiry) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    return Promise.reject(error);
  },
);

export const axiosErrorHandler = (error: unknown, toast = false): string | Toast => {
  const message = isAxiosError(error)
    ? (error.response?.data.message ?? networkFailureErrorMessage)
    : error instanceof Error
      ? error.message
      : networkFailureErrorMessage;

  if (toast) {
    return {
      title: ToastStatus.Error,
      description: message,
      variant: 'destructive',
    };
  }

  return message;
};

export default axios;

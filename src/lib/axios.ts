import { ToastStatus } from '@/types/shared.enum';
import axiosClient, { isAxiosError } from 'axios';
import { Toast } from '@/hooks/use-toast';
import { timeDifferenceChecker } from '@/lib/date';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const networkFailureErrorMessage = 'Oops! Server Error... Please check your internet connection';

const axios = axiosClient.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const axiosBase = axiosClient.create();

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      const user = JSON.parse(localStorage.getItem('persist:user') || '{}');
      const loggedInAt = user?.loggedInAt;
      if (error.response?.status === 401 && loggedInAt) {
        // Session usually expires after 24 hours
        // Let's allow a 30 minutes backup time to gracefully log out the user
        // Hence reason for 23.5 hours
        // We stringify before persisting to local storage hence the need to parse twice
        if (timeDifferenceChecker(JSON.parse(JSON.parse(loggedInAt)), 23.5)) {
          window.localStorage.clear();
          window.location.reload();
        }
      }
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

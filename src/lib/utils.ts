import { Toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string
 * @param inputs
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Get the initials of a name
 * @param name
 */
export const getInitials = (name: string): string => {
  const nameSplit = name.split(' ');
  const nameLength = nameSplit.length;
  if (nameLength > 1) {
    return (nameSplit[0].substring(0, 1) + nameSplit[nameLength - 1].substring(0, 1)).toUpperCase();
  }
  return nameSplit[0].substring(0, 1).toUpperCase();
};

export function interpolateRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  // Check if the input value is within the input range
  if (value < inMin || value > inMax) {
    throw new Error('Input value is out of the input range');
  }

  // Calculate the normalized value within the input range
  const normalizedValue = (value - inMin) / (inMax - inMin);

  // Interpolate the value within the output range
  return outMin + normalizedValue * (outMax - outMin);
}

/**
 * Used to tell if we need to show a toast for the error based on the axiosErrorHandler function
 * @param payload - The payload from the axiosErrorHandler function
 */
export const showErrorToast = (payload: unknown): boolean =>
  (payload as Toast).title === ToastStatus.Error;

/**
 * Use to generate a success toast message type
 * @param message - The message to display in the toast
 */
export const generateSuccessToast = (message: string): Toast => ({
  title: ToastStatus.Success,
  description: message,
  variant: 'success',
});

import { Toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IQueryParams } from '@/types/shared.interface';

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

/**
 * Used to download file given url and filename
 * This function creates a link element, sets the href and download attributes,
 * appends it to the body, clicks the link, and removes it from the body
 * @param url - The url of the file to download
 * @param filename - The name of the file to download
 */
export const downloadFileWithUrl = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Converts a string or sentence to capitalized version
 * @param text - The string or sentence to capitalize
 * @returns The capitalized string or sentence
 */
export const capitalize = (text: string): string =>
  text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * Opens external urls in a new tab
 * @param url
 */
export const openExternalUrls = (url: string): Window | null => window.open(url, '_blank');

/**
 * Generates a valid query string from the given query parameters.
 * Filters out any parameters with undefined values.
 *
 * @param queryParams - An object containing query parameters as key-value pairs.
 * @returns A valid query string.
 */
export const getValidQueryString = (queryParams: IQueryParams<unknown>): string => {
  const filteredQueryParams = Object.fromEntries(
    Object.entries(queryParams).filter(([, value]) => value !== undefined),
  );
  return new URLSearchParams(filteredQueryParams).toString();
};

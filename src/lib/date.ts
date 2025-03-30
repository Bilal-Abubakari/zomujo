import moment from 'moment';

export const getCurrentYear = (): number => new Date().getFullYear();

interface IWeekday {
  day: number;
  weekday: string;
}

/**
 * Returns an array of objects representing the weekdays of the current week.
 * Each object contains the day of the month and the abbreviated weekday name.
 *
 * @param today - The date to use as the reference point for the current week. Defaults to the current date.
 * @returns An array of objects representing the weekdays of the current week (Monday to Friday).
 */
export function getWeekdaysOfCurrentWeek(today = new Date()): IWeekday[] {
  const currentDay = today.getDate();
  const currentWeekday = today.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6

  const monday = new Date(today);
  monday.setDate(currentDay - currentWeekday + (currentWeekday === 0 ? -6 : 1)); // Adjust for Sunday
  const weekdays: IWeekday[] = [];

  for (let i = 0; i < 5; i++) {
    // Monday to Friday
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);

    const weekdayObject: IWeekday = {
      day: currentDate.getDate(),
      weekday: getWeekdayString(currentDate.getDay()),
    };

    weekdays.push(weekdayObject);
  }

  return weekdays;
}

/**
 * Converts a day index to its corresponding weekday string.
 *
 * @param dayIndex - The index of the day (0 for Sunday, 1 for Monday, ..., 6 for Saturday).
 * @returns The abbreviated weekday string (e.g., 'Sun', 'Mon').
 */
function getWeekdayString(dayIndex: number): string {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return weekdays[dayIndex];
}

/**
 * Returns the current time in GMT (UTC) in the format HH:MM AM/PM.
 *
 * @returns {string} - The current time in GMT.
 */
export function getCurrentTimeInGMT(): string {
  const now = new Date();

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',

    hour12: true,
  };

  return now.toLocaleTimeString('en-GB', options).toUpperCase();
}

/**
 * Calculates the maximum date based on the given age limit.
 *
 * @param ageLimit - The age limit to calculate the maximum date. Defaults to 18.
 * @returns The maximum date as a string in the format YYYY-MM-DD.
 */
export const maxDate = (ageLimit = 18): string => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - ageLimit, today.getMonth(), today.getDate());
  return maxDate.toISOString().split('T')[0];
};

/**
 * Returns a greeting message based on the current time.
 *
 * @returns {string} - The greeting message.
 *   - "Good morning" if the current time is between 5 AM and 12 PM.
 *   - "Good afternoon" if the current time is between 12 PM and 5 PM.
 *   - "Good evening" if the current time is after 5 PM or before 5 AM.
 */
export function getGreeting(): string {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) {
    return 'Good morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

/**
 * Formats a given date to a string in the format "DD MMM YYYY" eg: 12 Dec 2025.
 *
 * @param date - The date to format, either as a Date object or a string.
 * @returns The formatted date string.
 */
export function getFormattedDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Converts a date to the format DD/MM/YYYY
 * @param date - The date to format
 * @returns The formatted date string
 */
export function formatDateToDDMMYYYY(date: Date | string): string {
  const formattedDate = new Date(date);
  const day = String(formattedDate.getDate()).padStart(2, '0');
  const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
  const year = formattedDate.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Checks if the difference between the current time and the given date stamp exceeds the specified time limit in hours.
 * @param dateStamp - The date to compare against the current time.
 * @param timeLimitInHours - The time limit in hours to check the difference against. Defaults to 24 hours.
 * @returns `true` if the difference exceeds the time limit, otherwise `false`.
 */
export function timeDifferenceChecker(dateStamp: Date | string, timeLimitInHours = 24): boolean {
  const timeToCheck = new Date(dateStamp).getTime();
  const currentTime = new Date().getTime();
  const hoursDifference = Math.abs(currentTime - timeToCheck) / 36e5;
  return hoursDifference > timeLimitInHours;
}

/**
 * Extracts the time from a given date stamp and formats it as HH:MM.
 * @param dateStamp - The date stamp to extract the time from.
 * @returns The formatted time string.
 */
export function getTimeFromDateStamp(dateStamp: Date | string): string {
  const date = new Date(dateStamp);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Parses a time string in the format "HH:MM" and returns a Date object with the time set.
 *
 * @param time - The time string to parse.
 * @returns A Date object with the time set to the parsed hours and minutes.
 */
export const parseTime = (time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Extracts the time in GMT format from an ISO date string and converts it to a 12-hour or 24-hour format.
 *
 * @param {string | Date} isoString - The ISO date string (e.g., "1970-01-01T09:00:00.000Z").
 * @param {Object} [options] - Optional configuration object.
 * @param {boolean} [options.showAmPm=true] - Whether to show AM/PM indicator.
 * @returns {string} - The formatted time (e.g., "9:00 AM", "9:00", "21:00").
 *
 */
export function extractGMTTime(
  isoString: string | Date,
  options: { showAmPm?: boolean } = {},
): string {
  const { showAmPm = true } = options;
  const date = new Date(isoString);
  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  if (showAmPm) {
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${amPm}`;
  }
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Combines a given date and time into a single ISO 8601 datetime string.
 *
 * @param {string} dateString - The date string in ISO format (e.g., "2025-03-14T00:00:00.000Z").
 * @param {string} timeString - The time string in ISO format (e.g., "1970-01-01T10:30:00.000Z").
 * @returns {Date} A new Date object with the combined date and time.
 *
 */
export function mergeDateAndTime(dateString: string, timeString: string): Date {
  const date = dateString.split('T')[0];
  const time = timeString.split('T')[1];
  return new Date(`${date}T${time}`);
}

/**
 * Checks if the given date is today
 *
 * @param {Date | string} date - The date to check
 * @returns {boolean} - True if the date is today, false otherwise
 */
export function isToday(date: Date | string): boolean {
  return moment(date).isSame(moment(), 'day');
}

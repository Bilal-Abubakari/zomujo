export const getCurrentYear = (): number => new Date().getFullYear();

interface WeekdayObject {
  day: number;
  weekday: string;
}

export function getWeekdaysOfCurrentWeek(today = new Date()): WeekdayObject[] {
  const currentDay = today.getDate();
  const currentWeekday = today.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6

  const monday = new Date(today);
  monday.setDate(currentDay - currentWeekday + (currentWeekday === 0 ? -6 : 1)); // Adjust for Sunday
  const weekdays: WeekdayObject[] = [];

  for (let i = 0; i < 5; i++) {
    // Monday to Friday
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);

    const weekdayObject: WeekdayObject = {
      day: currentDate.getDate(),
      weekday: getWeekdayString(currentDate.getDay()),
    };

    weekdays.push(weekdayObject);
  }

  return weekdays;
}

function getWeekdayString(dayIndex: number): string {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return weekdays[dayIndex];
}

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

export const maxDate = (ageLimit = 18): string => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - ageLimit, today.getMonth(), today.getDate());
  return maxDate.toISOString().split('T')[0];
};

export function getGreeting(): string {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) {
    return 'Good morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

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

import { IFrequency, IRule, ISlotPatternBase, IWeekDays } from '@/types/slots.interface';

/**
 * Generates a recurrence rule string based on the provided weekdays and frequency.
 * See https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html for more information.
 * @param weekDays - An array of weekdays represented as strings (e.g., 'MO', 'TU').
 * @param frequency - The frequency of the recurrence (e.g., 'DAILY', 'WEEKLY').
 * @returns The formatted recurrence rule string (e.g. 'FREQ=WEEKLY;BYDAY=MO,TU').
 */
export const generateRecurrenceRule = (weekDays: IWeekDays[], frequency: IFrequency): string => {
  const rule: IRule = {
    freq: frequency,
    byDay: weekDays.join(','),
  };

  return Object.entries(rule)
    .filter(([, value]) => !!value)
    .map(([key, value]) => `${key.toUpperCase()}=${value}`)
    .join(';');
};

/**
 * Generates a description for a slot based on the provided pattern, frequency, and weekdays.
 * @param slotPattern - The pattern of the slot containing startDate, endDate, endTime, startTime, duration, and type.
 * @param frequency - The frequency of the recurrence (e.g., 'DAILY', 'WEEKLY').
 * @param weekDays - An array of weekdays represented as strings (e.g., 'MO', 'TU').
 * @returns The formatted slot description string.
 */
export const generateSlotDescription = (
  { startDate, endDate, endTime, startTime, duration }: ISlotPatternBase,
  frequency: IFrequency,
  weekDays: IWeekDays[],
): string => {
  const startDateStr = new Date(startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const endDateStr =
    endDate &&
    new Date(endDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  const fullDays = weekDays.map((day) => weekDayMap[day]);

  // Format days string based on selection
  let daysStr: string;
  switch (fullDays.length) {
    case 1:
      daysStr = `on ${fullDays[0]}s`;
      break;
    case 2:
      daysStr = `on ${fullDays[0]}s and ${fullDays[1]}s`;
      break;
    case 7:
      daysStr = 'every day';
      break;
    default: {
      const exceptDays = Object.values(weekDayMap).filter((day) => !fullDays.includes(day));
      if (exceptDays.length === 1) {
        daysStr = `every day except ${exceptDays[0]}s`;
      } else if (exceptDays.length === 2) {
        daysStr = `every day except ${exceptDays[0]}s and ${exceptDays[1]}s`;
      } else {
        const lastDay = fullDays[fullDays.length - 1];
        const otherDays = fullDays.slice(0, -1);
        daysStr = `on ${otherDays.join('s, ')}s, and ${lastDay}s`;
      }
      break;
    }
  }

  // Format time in 12-hour format for better readability
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const startTimeFormatted = formatTime(startTime);
  const endTimeFormatted = formatTime(endTime);

  // Build description based on whether it's single date or range
  if (endDate) {
    // Date range
    return (
      `You are about to create ${duration}-minute appointment slots ${daysStr}, ` +
      `from ${startTimeFormatted} to ${endTimeFormatted}.\n\n` +
      `This pattern will repeat ${frequency.toLowerCase()} starting from ${startDateStr} ` +
      `and ending on ${endDateStr}.`
    );
  } 
    // Single date
    return (
      `You are about to create ${duration}-minute appointment slots on ${startDateStr}, ` +
      `from ${startTimeFormatted} to ${endTimeFormatted}.\n\n` +
      `This is a single day appointment and will not repeat.`
    );
  
};

/**
 * A mapping of iCalendar weekdays to their full names.
 */
export const weekDayMap: { [key in IWeekDays]: string } = {
  SU: 'Sunday',
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
};

/**
 * Extracts the frequency from an iCalendar recurrence rule.
 * @param rule
 */
export const getFrequencyFromRule = (rule: string): IFrequency => {
  const frequency = rule.match(/FREQ=(.*?);/)?.[1];
  return frequency as IFrequency;
};

/**
 * Extracts the weekdays from an iCalendar recurrence rule.
 * @param rule
 */
export const getWeekDaysFromRule = (rule: string): IWeekDays[] => {
  const weekdays = rule.match(/BYDAY=(.*)/)?.[1];
  return weekdays?.split(',') as IWeekDays[];
};

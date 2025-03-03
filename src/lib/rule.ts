import { IFrequency, IRule, ISlotPatternBase, IWeekDays } from '@/types/appointment';

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
  { startDate, endDate, endTime, startTime, duration, type }: ISlotPatternBase,
  frequency: IFrequency,
  weekDays: IWeekDays[],
): string => {
  const startDateStr = new Date(startDate).toLocaleDateString();
  const endDateStr = endDate && new Date(endDate).toLocaleDateString();
  const fullDays = weekDays.map((day) => weekDayMap[day]);

  let daysStr: string;
  switch (fullDays.length) {
    case 1:
      daysStr = `every ${fullDays[0]}`;
      break;
    case 2:
      daysStr = `every ${fullDays[0]} and ${fullDays[1]}`;
      break;
    case 7:
      daysStr = 'daily';
      break;
    default: {
      const exceptDays = Object.values(weekDayMap).filter((day) => !fullDays.includes(day));
      if (exceptDays.length <= 2) {
        daysStr = `daily except ${exceptDays.join(' and ')}`;
      } else {
        daysStr = `every ${fullDays.slice(0, -1).join(', ')} and ${fullDays.slice(-1)}`;
      }
      break;
    }
  }

  return (
    `You are creating ${type} appointment slots that will occur ${daysStr} ` +
    `from ${startTime} to ${endTime}, ` +
    `starting from ${startDateStr} ${endDate ? `to ${endDateStr}` : ''} on a ${frequency.toLowerCase()} basis, each slot being ${duration} minutes long.`
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

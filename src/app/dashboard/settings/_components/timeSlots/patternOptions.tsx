'use client';
import { JSX } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { capitalize } from '@/lib/utils';
import { shortDaysOfTheWeek } from '@/constants/constants';
import { frequencies, weekDays } from '@/constants/appointments.constant';
import { IFrequency, IWeekDays } from '@/types/slots.interface';
import { SectionLabel } from './sectionLabel';

interface PatternOptionsProps {
  selectedWeekDays: IWeekDays[];
  onWeekDaysChange: (days: IWeekDays[]) => void;
  frequency: IFrequency | undefined;
  onFrequencyChange: (frequency: IFrequency) => void;
}

export const PatternOptions = ({
  selectedWeekDays,
  onWeekDaysChange,
  frequency,
  onFrequencyChange,
}: PatternOptionsProps): JSX.Element => (
  <>
    <div>
      <SectionLabel
        title="Select Days Preferred:"
        detailedInfo={
          <div className="space-y-2">
            <p>Choose the days when you want to be available for appointments.</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Click on days to select or deselect them</li>
              <li>Selected days will be highlighted in blue</li>
              <li>You can select any combination of days</li>
              <li>These days will repeat based on your chosen frequency</li>
            </ul>
          </div>
        }
        tips={[
          'Example: Select Mon, Wed, Fri for a typical part-time schedule',
          'Most doctors choose 3-5 days per week',
        ]}
      />
      <ToggleGroup
        onValueChange={(days: IWeekDays[]) => onWeekDaysChange(days)}
        value={selectedWeekDays}
        type="multiple"
        className="mt-2 flex-wrap justify-start gap-2"
      >
        {shortDaysOfTheWeek.map((day, index) => (
          <ToggleGroupItem
            key={day}
            value={weekDays[index]}
            aria-label="Toggle bold"
            className="hover:bg-primary/10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground cursor-pointer border border-gray-300 px-3 py-2 text-sm transition-colors duration-150 sm:px-4"
          >
            {day}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
    <div>
      <SectionLabel
        title="Select Frequency:"
        detailedInfo={
          <div className="space-y-2">
            <p className="font-medium">How often should this pattern repeat?</p>
            <ul className="space-y-2">
              <li>
                <strong>Daily:</strong> Slots available every single day (including weekends)
              </li>
              <li>
                <strong>Weekly:</strong> Slots repeat each week on your selected days{' '}
                <span className="text-primary">(Most common)</span>
              </li>
              <li>
                <strong>Monthly:</strong> Slots repeat once per month
              </li>
            </ul>
          </div>
        }
        tips={['Most doctors use "Weekly" to maintain a consistent weekly schedule']}
      />
      <ToggleGroup
        onValueChange={(freq: IFrequency) => onFrequencyChange(freq)}
        value={frequency}
        type="single"
        className="mt-2 flex-wrap justify-start gap-2"
      >
        {frequencies.map((freq) => (
          <ToggleGroupItem
            key={freq}
            value={freq}
            aria-label="Toggle bold"
            className="hover:bg-primary/10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-w-20 cursor-pointer border border-gray-300 px-3 py-2 text-sm transition-colors duration-150 sm:min-w-25 sm:px-4"
          >
            {capitalize(freq)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  </>
);

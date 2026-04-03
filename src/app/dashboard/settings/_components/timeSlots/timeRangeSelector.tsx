'use client';
import { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import moment from 'moment/moment';
import { SectionLabel } from './sectionLabel';

const addMinutes = (time: string, minutes: number): string => {
  if (!time) {
    return '';
  }
  const [hours, mins] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(hours, mins + minutes);
  return moment(d).format('HH:mm');
};

const QUICK_SHIFTS = [
  { label: 'Morning (8-12)', start: '08:00', end: '12:00' },
  { label: 'Afternoon (1-5)', start: '13:00', end: '17:00' },
  { label: 'Evening (6-9)', start: '18:00', end: '21:00' },
  { label: 'Full Day', start: '08:00', end: '17:00' },
];

interface TimeRangeSelectorProps {
  creationMode: 'single' | 'pattern';
  startTime: string;
  endTime: string;
  slotDuration: number;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export const TimeRangeSelector = ({
  creationMode,
  startTime,
  endTime,
  slotDuration,
  onStartTimeChange,
  onEndTimeChange,
}: TimeRangeSelectorProps): JSX.Element => (
  <>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <SectionLabel
          title="Start Time:"
          detailedInfo={
            <div className="space-y-2">
              <p>When do you want appointments to begin each day?</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Must be earlier than end time</li>
                <li>Time format displays based on your system settings (12-hour or 24-hour)</li>
                <li>This is the earliest time patients can book</li>
                <li>Must be within the same calendar day as end time</li>
              </ul>
            </div>
          }
          tips={['Common start times: 8:00 AM / 08:00, 9:00 AM / 09:00, or 10:00 AM / 10:00']}
        />
        <div className="relative">
          <Clock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="time"
            value={startTime}
            onChange={({ target }) => {
              const time = target.value;
              onStartTimeChange(time);
              if (!endTime || time >= endTime) {
                onEndTimeChange(addMinutes(time, slotDuration));
              }
            }}
            className="focus:ring-primary/20 w-full cursor-pointer rounded-md border py-2 pr-3 pl-10 text-sm outline-none focus:ring-2 sm:text-base"
          />
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel
          title="End Time:"
          detailedInfo={
            <div className="space-y-2">
              <p>When should appointments end each day?</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Must be later than start time</li>
                <li>Time format displays based on your system settings (12-hour or 24-hour)</li>
                <li>Last appointment slot will start before this time</li>
                <li>Cannot span overnight (must be same day)</li>
              </ul>
            </div>
          }
          tips={['Common end times: 5:00 PM / 17:00, 6:00 PM / 18:00']}
        />
        <div className="relative">
          <Clock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="time"
            value={endTime}
            onChange={({ target }) => {
              const time = target.value;
              if (!startTime || time > startTime) {
                onEndTimeChange(time);
              } else {
                toast({
                  title: ToastStatus.Info,
                  description: 'End time must be within a 24-hour period and after the start time.',
                  variant: 'default',
                });
              }
            }}
            className="focus:ring-primary/20 w-full cursor-pointer rounded-md border py-2 pr-3 pl-10 text-sm outline-none focus:ring-2 sm:text-base"
          />
        </div>
      </div>
    </div>

    {creationMode === 'single' && (
      <div className="space-y-3">
        <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          Quick Shifts
        </Label>
        <div className="flex flex-wrap gap-2">
          {QUICK_SHIFTS.map(({ label, start, end }) => (
            <Button
              key={label}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                onStartTimeChange(start);
                onEndTimeChange(end);
              }}
              child={label}
            />
          ))}
        </div>
      </div>
    )}
  </>
);

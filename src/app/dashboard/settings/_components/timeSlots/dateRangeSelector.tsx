'use client';
import { JSX } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment/moment';
import { SectionLabel } from './sectionLabel';

interface DateRangeSelectorProps {
  creationMode: 'single' | 'pattern';
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

const SingleDateInfo = (): JSX.Element => (
  <div className="space-y-3">
    <p>Select the specific date you want to create appointment slots for.</p>
    <ul className="ml-4 list-disc space-y-1">
      <li>Pick any future date from the calendar</li>
      <li>
        Slots will be generated only for this single day between your chosen start and end times
      </li>
    </ul>
  </div>
);

const PatternDateInfo = (): JSX.Element => (
  <div className="space-y-3">
    <p>Define the date range over which slots should be created:</p>
    <ul className="ml-4 list-disc space-y-1">
      <li>
        <strong>Start Date (Required):</strong> The first day to create slots
      </li>
      <li>
        <strong>End Date (Required):</strong> The last day to create slots
      </li>
      <li>Past dates are disabled (you can only create future slots)</li>
      <li>Your selected days and times will apply to all matching dates in this range</li>
    </ul>

    <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
      <p className="mb-2 flex items-start gap-2 text-sm font-semibold text-amber-800">
        <span className="text-lg">⚠️</span>
        <span>Important: Date Range Must Cover Your Selected Days!</span>
      </p>
      <div className="space-y-2 text-sm text-amber-700">
        <p>
          The date range you select <strong>must include</strong> at least one occurrence of the
          days you chose in &quot;Select Days Preferred&quot; above. Otherwise, no slots will be
          created.
        </p>
        <div className="mt-2 ml-3 space-y-2 border-l-2 border-amber-300 pl-3">
          <div>
            <p className="font-medium text-amber-800">✓ Example of CORRECT setup:</p>
            <p className="text-xs">
              • Selected Days: Monday, Wednesday, Friday
              <br />
              • Start Date: Monday, Jan 6, 2025
              <br />
              • End Date: Friday, Jan 31, 2025
              <br />
              <span className="text-green-700">
                → Slots will be created for all Mon/Wed/Fri in January
              </span>
            </p>
          </div>
          <div>
            <p className="font-medium text-red-700">✗ Example of INCORRECT setup:</p>
            <p className="text-xs">
              • Selected Days: Monday, Wednesday, Friday
              <br />
              • Start Date: Tuesday, Jan 7, 2025
              <br />
              • End Date: Wednesday, Jan 8, 2025
              <br />
              <span className="text-red-700">
                → Only Wed Jan 8 gets slots — Tuesday is not a selected day
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const today = new Date(new Date().setHours(0, 0, 0, 0));

export const DateRangeSelector = ({
  creationMode,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeSelectorProps): JSX.Element => {
  const isSingle = creationMode === 'single';
  const dateTips = isSingle
    ? ['Perfect for one-off availability or covering extra shifts']
    : [
        'Ensure your date range includes at least one of your selected days',
        'Tip: Use a longer date range (e.g., 1-3 months) to create slots for multiple weeks at once',
      ];

  return (
    <div className="space-y-4">
      <SectionLabel
        title={isSingle ? 'Select Date:' : 'Select Dates:'}
        detailedInfo={isSingle ? <SingleDateInfo /> : <PatternDateInfo />}
        tips={dateTips}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {isSingle ? 'Date' : 'Start Date (Required)'}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full cursor-pointer justify-start text-left text-xs font-normal sm:text-sm',
                  !startDate && 'text-muted-foreground',
                )}
                child={
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {startDate ? (
                        moment(startDate).format('LL')
                      ) : (
                        <span>{isSingle ? 'Pick date' : 'Pick start date'}</span>
                      )}
                    </span>
                  </>
                }
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                autoFocus
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                disabled={(date) => date < today}
              />
            </PopoverContent>
          </Popover>
        </div>

        {!isSingle && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">End Date (Required)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full cursor-pointer justify-start text-left text-xs font-normal sm:text-sm',
                    !endDate && 'text-muted-foreground',
                  )}
                  child={
                    <>
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {endDate ? moment(endDate).format('LL') : <span>Pick end date</span>}
                      </span>
                    </>
                  }
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  autoFocus
                  mode="single"
                  selected={endDate}
                  onSelect={onEndDateChange}
                  disabled={(date) => date < (startDate ?? today)}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
};

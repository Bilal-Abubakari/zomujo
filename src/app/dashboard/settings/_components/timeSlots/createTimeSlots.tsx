'use client';
import React, { JSX, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Info, ChevronDown, ChevronUp, HelpCircle, Lightbulb } from 'lucide-react';
import { capitalize, cn, dataCompletionToast, showErrorToast } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { createAppointmentSlot } from '@/lib/features/appointments/appointmentsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { generateRecurrenceRule, generateSlotDescription } from '@/lib/rule';
import { Toast, toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import { Confirmation } from '@/components/ui/dialog';
import { shortDaysOfTheWeek } from '@/constants/constants';
import { frequencies, weekDays } from '@/constants/appointments.constant';
import moment from 'moment/moment';
import { IFrequency, ISlotPatternBase, IWeekDays, AppointmentType } from '@/types/slots.interface';
import { PaymentTab } from '@/hooks/useQueryParam';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { IDoctor } from '@/types/doctor.interface';
import { useRouter } from 'next/navigation';

interface CreateTimeSlotsProps {
  onSlotCreated?: () => void;
}

const CreateTimeSlots = ({ onSlotCreated }: CreateTimeSlotsProps): JSX.Element => {
  const doctorInfo = useAppSelector(selectExtra) as IDoctor;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWeekDays, setSelectedWeekDays] = useState<IWeekDays[]>([]);
  const [confirmation, setConfirmation] = useState(false);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [frequency, setFrequency] = useState<IFrequency>();
  const [slotDuration, setSlotDuration] = useState(45);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showGuide, setShowGuide] = useState(false);
  const dispatch = useAppDispatch();

  const toggleSection = (section: string): void => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const canGenerateSlot = (): boolean => {
    if (selectedWeekDays.length > 0 && !!frequency && !!startTime && !!endTime && !!startDate) {
      return true;
    }
    toast({
      title: ToastStatus.Info,
      description: 'Please select a date range, frequency, and time slots',
      variant: 'default',
    });
    return false;
  };

  const getSlotPattern = (): ISlotPatternBase => {
    const pattern: ISlotPatternBase = {
      startDate: startDate?.toISOString() ?? '',
      startTime,
      endTime,
      recurrence: generateRecurrenceRule(selectedWeekDays, frequency!),
      duration: slotDuration,
      type: AppointmentType.Virtual,
    };

    // Only include endDate if it's been set
    if (endDate) {
      pattern.endDate = endDate.toISOString();
    }

    return pattern;
  };

  const generateTimeSlots = async (): Promise<void> => {
    setIsLoading(true);
    const { payload } = await dispatch(createAppointmentSlot(getSlotPattern()));

    setIsLoading(false);

    if (!showErrorToast(payload)) {
      setConfirmation(false);
    }

    if (payload) {
      const toastData = payload as Toast;
      toast(toastData);
      if (toastData.variant === 'success') {
        onSlotCreated?.();

        if (!doctorInfo?.bio) {
          router.push('/dashboard/settings');
          toast(dataCompletionToast('profile'));
          return;
        }
        if (!doctorInfo?.fee) {
          router.push(`/dashboard/settings/payment?tab=${PaymentTab.Pricing}`);
          toast(dataCompletionToast('pricing'));
          return;
        }
        if (!doctorInfo?.hasDefaultPayment) {
          router.push(`/dashboard/settings/payment?tab=${PaymentTab.PaymentMethod}`);
          router.refresh();
          toast(dataCompletionToast('paymentMethod'));
        }
      }
    }
  };

  const getLabel = (
    title: string,
    section: string,
    detailedInfo: string | JSX.Element,
    tips?: string[],
  ): JSX.Element => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-base font-medium">
        <span>{title}</span>
        <button
          type="button"
          onClick={() => toggleSection(section)}
          className="text-primary hover:text-primary/80 flex cursor-pointer items-center gap-1 text-xs font-medium transition-colors"
        >
          <HelpCircle size={14} />
          <span>{expandedSections[section] ? 'Hide info' : 'Learn more'}</span>
          {expandedSections[section] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </Label>
      {expandedSections[section] && (
        <div className="border-primary space-y-2 rounded-r-md border-l-4 bg-green-50 p-4">
          <div className="text-sm text-gray-700">
            {typeof detailedInfo === 'string' ? <p>{detailedInfo}</p> : detailedInfo}
          </div>
          {tips && tips.length > 0 && (
            <div className="mt-3 border-t border-green-200 pt-3">
              <div className="flex items-start gap-2">
                <Lightbulb size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <div className="space-y-1">
                  {tips.map((tip, idx) => (
                    <p key={`${idx}-${tip}`} className="text-xs text-gray-600">
                      {tip}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full space-y-6 sm:p-6">
      {/* Guide Card */}
      {showGuide && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="text-primary" size={20} />
                Quick Setup Guide
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowGuide(false)} child="Close" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium">Select Your Working Days</p>
                  <p className="text-gray-600">
                    Choose which days you&#39;ll be available for appointments
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium">Choose Frequency</p>
                  <p className="text-gray-600">
                    Select how often this pattern repeats (usually &#34;Weekly&#34;)
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium">Set Date Range</p>
                  <p className="text-gray-600">
                    Pick the dates when this availability should start and end
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  4
                </span>
                <div>
                  <p className="font-medium">Define Working Hours</p>
                  <p className="text-gray-600">Set your daily start and end times</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  5
                </span>
                <div>
                  <p className="font-medium">Generate Slots</p>
                  <p className="text-gray-600">Review and confirm your schedule</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {frequency && (
        <Confirmation
          description={generateSlotDescription(getSlotPattern(), frequency, selectedWeekDays)}
          showClose={true}
          open={confirmation}
          acceptCommand={() => generateTimeSlots()}
          rejectCommand={() => setConfirmation(false)}
          setState={setConfirmation}
          isLoading={isLoading}
        />
      )}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Create A Time Slot Pattern</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGuide(!showGuide)}
              child={
                <>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {showGuide ? 'Hide Guide' : 'Show Guide'}
                </>
              }
            />
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-6">
            <div>
              {getLabel(
                'Select Days Preferred:',
                'weekdays',
                <div className="space-y-2">
                  <p>Choose the days when you want to be available for appointments.</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Click on days to select or deselect them</li>
                    <li>Selected days will be highlighted in blue</li>
                    <li>You can select any combination of days</li>
                    <li>These days will repeat based on your chosen frequency</li>
                  </ul>
                </div>,
                [
                  'Example: Select Mon, Wed, Fri for a typical part-time schedule',
                  'Most doctors choose 3-5 days per week',
                ],
              )}
              <ToggleGroup
                onValueChange={(days: IWeekDays[]) => setSelectedWeekDays(days)}
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
              {getLabel(
                'Select Frequency:',
                'frequency',
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
                    <li>
                      <strong>Yearly:</strong> Slots repeat annually
                    </li>
                  </ul>
                </div>,
                ['Most doctors use "Weekly" to maintain a consistent weekly schedule'],
              )}
              <ToggleGroup
                onValueChange={(frequency: IFrequency) => setFrequency(frequency)}
                value={frequency}
                type="single"
                className="mt-2 flex-wrap justify-start gap-2"
              >
                {frequencies.map((frequency) => (
                  <ToggleGroupItem
                    key={frequency}
                    value={frequency}
                    aria-label="Toggle bold"
                    className="hover:bg-primary/10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-w-[80px] cursor-pointer border border-gray-300 px-3 py-2 text-sm transition-colors duration-150 sm:min-w-[100px] sm:px-4"
                  >
                    {capitalize(frequency)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="space-y-4">
              {getLabel(
                'Select Dates:',
                'dates',
                <div className="space-y-3">
                  <p>Define when slots should be created:</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <strong>Start Date (Required):</strong> The first day to create slots
                    </li>
                    <li>
                      <strong>End Date (Optional):</strong> The last day to create slots. Leave
                      empty to create slots for only the start date
                    </li>
                    <li>Past dates are disabled (you can only create future slots)</li>
                    <li>Your selected days and times will apply to all dates in this range</li>
                  </ul>

                  <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                    <p className="mb-2 flex items-start gap-2 text-sm font-semibold text-amber-800">
                      <span className="text-lg">⚠️</span>
                      <span>Important: Dates Must Match Your Selected Days!</span>
                    </p>
                    <div className="space-y-2 text-sm text-amber-700">
                      <p>
                        The dates you select here <strong>must include</strong> the days you chose
                        in &quot;Select Days Preferred&quot; above. Otherwise, no slots will be
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
                            • Start Date: Tuesday, Jan 7, 2025 (single date, no end date)
                            <br />
                            <span className="text-red-700">
                              → NO slots created! Tuesday is not in your selected days
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3">
                    <p className="mb-1 text-sm font-medium text-blue-800">
                      💡 For Single Day Slots:
                    </p>
                    <p className="text-sm text-blue-700">
                      If you leave the end date empty, make sure your start date is one of the days
                      you selected above. For example:
                    </p>
                    <ul className="mt-1 ml-4 list-disc space-y-1 text-xs text-blue-700">
                      <li>
                        If you selected &quot;Monday&quot; as your preferred day, choose a Monday as
                        your start date
                      </li>
                      <li>
                        If you selected &quot;Friday&quot;, make sure your start date falls on a
                        Friday
                      </li>
                    </ul>
                  </div>
                </div>,
                [
                  'For a single day: Leave end date empty AND ensure the start date matches one of your selected days',
                  'For multiple days: Set both dates AND ensure the date range includes the days you selected',
                  'Tip: Use a longer date range (e.g., 1-3 months) to create slots for multiple weeks of your selected days',
                ],
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date (Required)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full cursor-pointer justify-start text-left text-xs font-normal sm:text-sm',
                          !startDate && 'text-muted-foreground',
                        )}
                        child={
                          <>
                            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {startDate ? (
                                moment(startDate).format('LL')
                              ) : (
                                <span>Pick start date</span>
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
                        onSelect={setStartDate}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    End Date{' '}
                    <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full cursor-pointer justify-start text-left text-xs font-normal sm:text-sm',
                          !endDate && 'text-muted-foreground',
                        )}
                        child={
                          <>
                            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {endDate ? (
                                moment(endDate).format('LL')
                              ) : (
                                <span>Leave empty for single day</span>
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
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => {
                          const today = new Date(new Date().setHours(0, 0, 0, 0));
                          const minDate = startDate || today;
                          return date < minDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {endDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEndDate(undefined)}
                      className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
                      child="Clear end date"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                {getLabel(
                  'Start Time:',
                  'startTime',
                  <div className="space-y-2">
                    <p>When do you want appointments to begin each day?</p>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>Must be earlier than end time</li>
                      <li>
                        Time format displays based on your system settings (12-hour or 24-hour)
                      </li>
                      <li>This is the earliest time patients can book</li>
                      <li>Must be within the same calendar day as end time</li>
                    </ul>
                  </div>,
                  ['Common start times: 8:00 AM / 08:00, 9:00 AM / 09:00, or 10:00 AM / 10:00'],
                )}
                <input
                  type="time"
                  value={startTime}
                  onChange={({ target }) => {
                    const time = target.value;
                    if (!endTime || time < endTime) {
                      setStartTime(time);
                    } else {
                      toast({
                        title: ToastStatus.Info,
                        description:
                          'Start time must be within a 24-hour period and before the end time.',
                        variant: 'default',
                      });
                    }
                  }}
                  className="w-full cursor-pointer rounded-md border px-3 py-2 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                {getLabel(
                  'End Time:',
                  'endTime',
                  <div className="space-y-2">
                    <p>When should appointments end each day?</p>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>Must be later than start time</li>
                      <li>
                        Time format displays based on your system settings (12-hour or 24-hour)
                      </li>
                      <li>Last appointment slot will start before this time</li>
                      <li>Cannot span overnight (must be same day)</li>
                    </ul>
                  </div>,
                  ['Common end times: 5:00 PM / 17:00, 6:00 PM / 18:00'],
                )}
                <input
                  type="time"
                  value={endTime}
                  onChange={({ target }) => {
                    const time = target.value;
                    if (time > startTime) {
                      setEndTime(time);
                    } else {
                      toast({
                        title: ToastStatus.Info,
                        description:
                          'End time must be within a 24-hour period and after the start time.',
                        variant: 'default',
                      });
                    }
                  }}
                  className="w-full cursor-pointer rounded-md border px-3 py-2 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              {getLabel(
                'Slot Duration (minutes):',
                'duration',
                <div className="space-y-2">
                  <p className="font-medium">How long should each appointment be?</p>
                  <p className="text-sm">
                    Currently, all appointment slots are set to <strong>45 minutes</strong>. This
                    duration works well for most consultations and allows adequate time for patient
                    interaction, examination, and documentation.
                  </p>
                  <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                    <p className="mb-1 text-sm font-medium text-amber-800">Why 45 minutes?</p>
                    <ul className="ml-4 list-disc space-y-1 text-sm text-amber-700">
                      <li>Provides sufficient time for thorough consultations</li>
                      <li>Allows for patient questions and discussions</li>
                      <li>Includes time for documentation between appointments</li>
                      <li>Balances quality care with daily patient capacity</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-600">
                      <strong>Note:</strong> Custom durations (15, 30, or 60 minutes) will be
                      available in a future update. If you need different slot durations now, please
                      contact support.
                    </p>
                  </div>
                </div>,
                [
                  'With 45-minute slots from 9:00 AM to 5:00 PM, you can see up to 10 patients per day',
                  'This duration is recommended by many healthcare professionals for virtual consultations',
                ],
              )}
              <Select
                value={slotDuration.toString()}
                onValueChange={(v) => setSlotDuration(parseInt(v))}
                disabled={true}
              >
                <SelectTrigger className="cursor-not-allowed text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 30, 45, 60].map((duration) => (
                    <SelectItem key={duration} value={duration.toString()}>
                      {duration} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs italic">
                Duration is currently fixed at 45 minutes for all appointments
              </p>
            </div>

            <Button
              child="Generate Time Slots"
              onClick={() => canGenerateSlot() && setConfirmation(true)}
              className="w-full cursor-pointer text-sm sm:text-base"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTimeSlots;

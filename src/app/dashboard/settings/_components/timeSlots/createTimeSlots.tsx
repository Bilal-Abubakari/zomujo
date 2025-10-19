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
import { DateRange } from 'react-day-picker';
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

const CreateTimeSlots = (): JSX.Element => {
  const doctorInfo = useAppSelector(selectExtra) as IDoctor;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWeekDays, setSelectedWeekDays] = useState<IWeekDays[]>([]);
  const [confirmation, setConfirmation] = useState(false);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [frequency, setFrequency] = useState<IFrequency>();
  const [slotDuration, setSlotDuration] = useState(45);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showGuide, setShowGuide] = useState(false);
  const dispatch = useAppDispatch();

  const toggleSection = (section: string): void => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const canGenerateSlot = (): boolean => {
    if (selectedWeekDays.length > 0 && !!frequency && !!startTime && !!endTime && !!date?.from) {
      return true;
    }
    toast({
      title: ToastStatus.Info,
      description: 'Please select a date range, frequency, and time slots',
      variant: 'default',
    });
    return false;
  };

  const getSlotPattern = (): ISlotPatternBase => ({
    startDate: date?.from?.toISOString() ?? '',
    endDate: date?.to?.toISOString() ?? '',
    startTime,
    endTime,
    recurrence: generateRecurrenceRule(selectedWeekDays, frequency!),
    duration: slotDuration,
    type: AppointmentType.Virtual,
  });

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
        <div className="space-y-2 rounded-r-md border-l-4 border-blue-500 bg-blue-50 p-4">
          <div className="text-sm text-gray-700">
            {typeof detailedInfo === 'string' ? <p>{detailedInfo}</p> : detailedInfo}
          </div>
          {tips && tips.length > 0 && (
            <div className="mt-3 border-t border-blue-200 pt-3">
              <div className="flex items-start gap-2">
                <Lightbulb size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <div className="space-y-1">
                  {tips.map((tip, idx) => (
                    <p key={idx} className="text-xs text-gray-600">
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
            <div className="space-y-2">
              {getLabel(
                'Select Dates:',
                'dates',
                <div className="space-y-2">
                  <p>Define when this availability pattern should be active:</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <strong>Single Date:</strong> Click one date for a one-time schedule
                    </li>
                    <li>
                      <strong>Date Range:</strong> Click start date, then end date for ongoing
                      availability
                    </li>
                    <li>Past dates are disabled (you can only create future slots)</li>
                    <li>Your selected days and times will apply to all dates in this range</li>
                  </ul>
                </div>,
                [
                  'For regular practice: Select a 3-6 month range and extend it later',
                  'For temporary availability: Select specific start and end dates',
                ],
              )}
              <div className={cn('grid gap-2')}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full cursor-pointer justify-start text-left text-xs font-normal sm:w-[300px] sm:text-sm',
                        !date && 'text-muted-foreground',
                      )}
                      child={
                        <>
                          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {date?.from ? (
                              date.to ? (
                                <>
                                  {moment(date.from).format('LL')} - {moment(date.to).format('LL')}
                                </>
                              ) : (
                                moment(date.from).format('LL')
                              )
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </span>
                        </>
                      }
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      autoFocus
                      mode="range"
                      defaultMonth={date?.from}
                      startMonth={new Date()}
                      hidden={[{ before: new Date() }]}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      className="hidden sm:block"
                    />
                    <Calendar
                      autoFocus
                      mode="range"
                      defaultMonth={date?.from}
                      startMonth={new Date()}
                      hidden={[{ before: new Date() }]}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={1}
                      className="block sm:hidden"
                    />
                  </PopoverContent>
                </Popover>
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
                      <li>Uses 24-hour format (e.g., 09:00 = 9 AM, 14:00 = 2 PM)</li>
                      <li>This is the earliest time patients can book</li>
                      <li>Must be within the same calendar day as end time</li>
                    </ul>
                  </div>,
                  ['Common start times: 08:00, 09:00, or 10:00'],
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
                      <li>Uses 24-hour format</li>
                      <li>Last appointment slot will start before this time</li>
                      <li>Cannot span overnight (must be same day)</li>
                    </ul>
                  </div>,
                  ['Common end times: 17:00 (5 PM), 18:00 (6 PM)'],
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

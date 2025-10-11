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
import { CalendarIcon, Info } from 'lucide-react';
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
import { TooltipComp } from '@/components/ui/tooltip';
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
  const dispatch = useAppDispatch();

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

  const getLabel = (title: string, tip: string): JSX.Element => (
    <Label className="flex items-center gap-2 text-base">
      <span>{title}</span>
      <TooltipComp tip={tip}>
        <Info size={16} />
      </TooltipComp>
    </Label>
  );

  return (
    <div className="mx-auto w-full space-y-6 sm:p-6">
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
          <CardTitle className="text-lg sm:text-xl">Create A Time Slot Pattern</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-6">
            <div>
              {getLabel(
                'Select Days Preferred:',
                'Select the days of the week for which you want to create time slots. You can select multiple days.',
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
                'Select the frequency for which you want to create time slots. You can select daily, weekly, monthly, or yearly.',
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
                'Select the date range for which you want to create time slots. You can also select a single date.',
              )}
              <div className={cn('grid gap-2')}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left text-xs font-normal sm:w-[300px] sm:text-sm',
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
                  'Select the start time for the time slots. The start time must be within a 24-hour period.',
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
                  className="w-full rounded-md border px-3 py-2 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                {getLabel(
                  'End Time:',
                  'Select the end time for the time slots. The end time must be within a 24-hour period and after the start time.',
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
                  className="w-full rounded-md border px-3 py-2 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Slot Duration (minutes)</Label>
              <Select
                value={slotDuration.toString()}
                onValueChange={(v) => setSlotDuration(parseInt(v))}
                disabled={true}
              >
                <SelectTrigger className="text-sm sm:text-base">
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
            </div>

            <Button
              child="Generate Time Slots"
              onClick={() => canGenerateSlot() && setConfirmation(true)}
              className="w-full text-sm sm:text-base"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTimeSlots;

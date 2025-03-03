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
import { capitalize, cn, showErrorToast } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { IFrequency, ISlotPatternBase, IWeekDays } from '@/types/appointment';
import { createAppointmentSlot } from '@/lib/features/appointments/appointmentsThunk';
import { useAppDispatch } from '@/lib/hooks';
import { generateRecurrenceRule, generateSlotDescription } from '@/lib/rule';
import { toast } from '@/hooks/use-toast';
import { ToastStatus, VisitType } from '@/types/shared.enum';
import { Confirmation } from '@/components/ui/dialog';
import { shortDaysOfTheWeek } from '@/constants/constants';
import { TooltipComp } from '@/components/ui/tooltip';
import { frequencies, weekDays } from '@/constants/appointments.constant';
import moment from 'moment/moment';

const CreateTimeSlots = (): JSX.Element => {
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
    type: VisitType.Virtual,
  });

  const generateTimeSlots = async (): Promise<void> => {
    setIsLoading(true);
    const { payload } = await dispatch(createAppointmentSlot(getSlotPattern()));

    setIsLoading(false);

    if (!showErrorToast(payload)) {
      setConfirmation(false);
    }

    if (payload) {
      toast(payload);
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
    <div className="mx-auto max-w-4xl space-y-6 p-6">
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
        <CardHeader>
          <CardTitle>Create A Time Slot Pattern</CardTitle>
        </CardHeader>
        <CardContent>
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
              >
                {shortDaysOfTheWeek.map((day, index) => (
                  <ToggleGroupItem key={day} value={weekDays[index]} aria-label="Toggle bold">
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
              >
                {frequencies.map((frequency) => (
                  <ToggleGroupItem key={frequency} value={frequency} aria-label="Toggle bold">
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
                        'w-[300px] justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                      )}
                      child={
                        <>
                          <CalendarIcon />
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
                          )}{' '}
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full rounded-md border px-3 py-2"
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
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Slot Duration (minutes)</Label>
              <Select
                value={slotDuration.toString()}
                onValueChange={(v) => setSlotDuration(parseInt(v))}
                disabled={true}
              >
                <SelectTrigger>
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
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTimeSlots;

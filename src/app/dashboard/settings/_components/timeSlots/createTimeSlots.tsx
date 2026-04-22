'use client';
import { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CalendarIcon,
  HelpCircle,
  // eslint-disable-next-line no-shadow-restricted-names
  Infinity,
} from 'lucide-react';
import { dataCompletionToast, showErrorToast } from '@/lib/utils';
import { createAppointmentSlot } from '@/lib/features/appointments/appointmentsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { generateRecurrenceRule, generateSlotDescription } from '@/lib/rule';
import { Toast, toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import { Confirmation } from '@/components/ui/dialog';
import { weekDays } from '@/constants/appointments.constant';
import { IFrequency, ISlotPatternBase, IWeekDays, AppointmentType } from '@/types/slots.interface';
import { PaymentTab } from '@/hooks/useQueryParam';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { IDoctor } from '@/types/doctor.interface';
import { useRouter } from 'next/navigation';
import { QuickSetupGuide } from './quickSetupGuide';
import { PatternOptions } from './patternOptions';
import { DateRangeSelector } from './dateRangeSelector';
import { TimeRangeSelector } from './timeRangeSelector';
import { SlotDuration } from './slotDuration';

interface CreateTimeSlotsProps {
  onSlotCreated?: () => void;
}

const CreateTimeSlots = ({ onSlotCreated }: CreateTimeSlotsProps): JSX.Element => {
  const doctorInfo = useAppSelector(selectExtra) as IDoctor;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [creationMode, setCreationMode] = useState<'single' | 'pattern'>('single');
  const [selectedWeekDays, setSelectedWeekDays] = useState<IWeekDays[]>([]);
  const [confirmation, setConfirmation] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [frequency, setFrequency] = useState<IFrequency>();
  const [slotDuration, setSlotDuration] = useState(45);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showGuide, setShowGuide] = useState(false);

  const canGenerateSlot = (): boolean => {
    if (creationMode === 'single') {
      if (startTime && endTime && startDate) {
        return true;
      }
      toast({
        title: ToastStatus.Info,
        description: 'Please select a date and time slots',
        variant: 'default',
      });
      return false;
    }
    if (selectedWeekDays.length > 0 && frequency && startTime && endTime && startDate && endDate) {
      return true;
    }
    toast({
      title: ToastStatus.Info,
      description: 'Please select a date range (start and end), frequency, and time slots',
      variant: 'default',
    });
    return false;
  };

  const getSlotPattern = (): ISlotPatternBase => {
    let finalWeekDays = selectedWeekDays;
    let finalFrequency = frequency;
    let finalEndDate = endDate;

    if (creationMode === 'single' && startDate) {
      finalWeekDays = [weekDays[startDate.getDay()]];
      finalFrequency = 'DAILY';
      finalEndDate = undefined;
    }

    const pattern: ISlotPatternBase = {
      startDate: startDate?.toISOString() ?? '',
      startTime,
      endTime,
      recurrence: generateRecurrenceRule(finalWeekDays, finalFrequency!),
      duration: slotDuration,
      type: AppointmentType.Virtual,
    };

    if (finalEndDate) {
      pattern.endDate = finalEndDate.toISOString();
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

  return (
    <div className="mx-auto w-full space-y-6 sm:p-6">
      <Tabs
        defaultValue="single"
        value={creationMode}
        onValueChange={(v) => setCreationMode(v as 'single' | 'pattern')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <CalendarIcon size={16} />
            One-time Slot
          </TabsTrigger>
          <TabsTrigger value="pattern" className="flex items-center gap-2">
            <Infinity size={16} />
            Recurring Pattern
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {showGuide && <QuickSetupGuide onClose={() => setShowGuide(false)} />}

      {(frequency || creationMode === 'single') && (
        <Confirmation
          description={generateSlotDescription(
            getSlotPattern(),
            creationMode === 'single' ? 'DAILY' : frequency!,
            creationMode === 'single' && startDate
              ? [weekDays[startDate.getDay()]]
              : selectedWeekDays,
          )}
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
            <CardTitle className="text-lg sm:text-xl">
              {creationMode === 'single' ? 'Create a One-time Slot' : 'Create A Time Slot Pattern'}
            </CardTitle>
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
            {creationMode === 'pattern' && (
              <PatternOptions
                selectedWeekDays={selectedWeekDays}
                onWeekDaysChange={setSelectedWeekDays}
                frequency={frequency}
                onFrequencyChange={setFrequency}
              />
            )}

            <DateRangeSelector
              creationMode={creationMode}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />

            <TimeRangeSelector
              creationMode={creationMode}
              startTime={startTime}
              endTime={endTime}
              slotDuration={slotDuration}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
            />

            <SlotDuration slotDuration={slotDuration} onSlotDurationChange={setSlotDuration} />

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

'use client';
import { Calendar } from '@/components/ui/calendar';
import { cn, showErrorToast } from '@/lib/utils';
import { JSX, useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { AvailabilityProps } from '@/types/booking.interface';
import { extractGMTTime } from '@/lib/date';
import {
  getAppointmentSlotsByDate,
  getAppointmentSlotsDates,
} from '@/lib/features/appointments/appointmentsThunk';
import { IPagination } from '@/types/shared.interface';
import { MedicalAppointmentType, useQueryParam } from '@/hooks/useQueryParam';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ListView from './listView';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { AppointmentDate, AppointmentSlots, SlotStatus } from '@/types/slots.interface';

const AvailableDates = ({ setValue, watch, doctorId }: AvailabilityProps): JSX.Element => {
  const date = watch('date');
  const selectedTime = watch('time');
  const dispatch = useAppDispatch();
  const params = useParams();
  const id = params.appointment as string;
  const { getQueryParam } = useQueryParam();
  const appointmentType = getQueryParam('appointmentType');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<AppointmentSlots[]>([]);
  const [isAvailableSlotLoading, setIsAvailableSlotLoading] = useState(false);
  const [isLoadingAppointmentDates, setIsLoadingAppointmentDates] = useState(false);
  const [canBookDates, setCanBookDates] = useState<Date[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const timeSlotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function slotsAvailable(): Promise<void> {
      setIsLoadingAppointmentDates(true);
      const lastDateOfTheMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const { payload } = await dispatch(
        getAppointmentSlotsDates({
          startDate: currentDate,
          endDate: lastDateOfTheMonth,
          doctorId: appointmentType === MedicalAppointmentType.Doctor ? id : '',
          orgId: appointmentType === MedicalAppointmentType.Hospital ? id : '',
          pageSize: 35,
          page: 1,
          status: SlotStatus.Available,
        }),
      );

      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoadingAppointmentDates(false);
        return;
      }
      const { rows } = payload as IPagination<AppointmentDate>;
      const dates = rows.map(({ date }) => new Date(date));

      setCanBookDates(dates);
      setIsLoadingAppointmentDates(false);
    }

    void slotsAvailable();
  }, [currentDate]);

  useEffect(() => {
    async function slotsAvailable(): Promise<void> {
      setAvailableTimeSlots([]);
      setIsAvailableSlotLoading(true);
      const { payload } = await dispatch(
        getAppointmentSlotsByDate({
          date: new Date(date || new Date()).toISOString(),
          doctorId: doctorId || (appointmentType === MedicalAppointmentType.Doctor ? id : ''),
          orgId: appointmentType === MedicalAppointmentType.Hospital ? id : '',
        }),
      );

      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsAvailableSlotLoading(false);
        return;
      }
      const data = payload as AppointmentSlots[];
      if (data) {
        const availableSlots: AppointmentSlots[] = data.map(({ startTime, ...rest }) => ({
          ...rest,
          startTime: `${extractGMTTime(startTime)}`,
        }));
        setAvailableTimeSlots(availableSlots);
      } else {
        setAvailableTimeSlots([]);
      }
      setIsAvailableSlotLoading(false);
    }

    void slotsAvailable();
  }, [date]);

  // Scroll to time slots when they're loaded after date selection
  useEffect(() => {
    if (!isAvailableSlotLoading && date && timeSlotsRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        timeSlotsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [isAvailableSlotLoading, date]);

  const handleSlotSelection = (startTime: string, id: string): void => {
    setValue('time', startTime, {
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue('slotId', id, {
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="rounded-md border p-8">
      <div>
        <p className="pb-8 text-left text-xl font-bold"> Choose available Date & Time</p>
      </div>
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <div className="relative">
            {isLoadingAppointmentDates && <LoadingOverlay />}
            <Calendar
              showOutsideDays={false}
              onMonthChange={(month) => setCurrentDate(month)}
              dayButtonClassName="cursor-pointer"
              modifiers={{
                canBook: canBookDates,
              }}
              modifiersClassNames={{
                canBook: 'bg-gray-200 rounded-md font-semibold',
              }}
              mode="single"
              selected={new Date(date || new Date())}
              onSelect={(date) => {
                if (date) {
                  setValue('date', date.toISOString(), {
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }
              }}
              className="mx-auto w-full rounded-md border"
              disabled={{ before: new Date() }}
            />
          </div>

          <div ref={timeSlotsRef}>
            <p className="mt-5 mb-2 font-medium">Available time (Africa/Accra - GMT (+00:00))</p>
            {!!availableTimeSlots.length && (
              <small className="m-auto text-center text-red-500">
                *Each session is 45 minutes{' '}
              </small>
            )}
            <div className="flex flex-wrap gap-3">
              {!!availableTimeSlots.length &&
                availableTimeSlots.map(({ startTime, id }) => (
                  <div
                    key={id}
                    className={cn(
                      'w-max cursor-pointer rounded-sm border p-1 font-medium text-gray-500',
                      selectedTime === startTime && 'border-primary text-primary',
                    )}
                    onKeyDown={() => handleSlotSelection(startTime, id)}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSlotSelection(startTime, id);
                    }}
                  >
                    {startTime}
                  </div>
                ))}
              {!availableTimeSlots.length && !isAvailableSlotLoading && (
                <div className="text-red-500">
                  {' '}
                  Sorry, no available slot for the selected date 😕{' '}
                </div>
              )}
            </div>
          </div>

          {isAvailableSlotLoading && (
            <div className="flex gap-2">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className={cn('h-8 w-16 animate-pulse rounded-sm border bg-gray-200')}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="list">
          <ListView setValue={setValue} watch={watch} doctorId={doctorId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AvailableDates;

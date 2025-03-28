'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn, showErrorToast } from '@/lib/utils';
import { JSX, useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { AvailabilityProps } from '@/types/booking.interface';
import { extractGMTTime, isToday } from '@/lib/date';
import { getAppointmentSlots } from '@/lib/features/appointments/appointmentsThunk';
import { IPagination } from '@/types/shared.interface';
import { MedicalAppointmentType, useQueryParam } from '@/hooks/useQueryParam';
import { ISlot, SlotStatus } from '@/types/appointment.interface';

const AvailableDates = ({ setValue, setCurrentStep, watch }: AvailabilityProps): JSX.Element => {
  const date = watch('date');
  const selectedTime = watch('time');
  const dispatch = useAppDispatch();
  const params = useParams();
  const id = params.appointment as string;
  const { getQueryParam } = useQueryParam();
  const appointmentType = getQueryParam('appointmentType');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<ISlot[]>([]);
  const [isAvailableSlotLoading, setIsAvailableSlotLoading] = useState(false);

  useEffect(() => {
    async function slotsAvailable(): Promise<void> {
      setAvailableTimeSlots([]);
      setIsAvailableSlotLoading(true);
      const { payload } = await dispatch(
        getAppointmentSlots({
          startDate: new Date(date),
          endDate: new Date(date),
          startTime: isToday(date) ? extractGMTTime(new Date(), { showAmPm: false }) : '00:00',
          endTime: '23:59',
          doctorId: appointmentType === MedicalAppointmentType.Doctor ? id : '',
          orgId: appointmentType === MedicalAppointmentType.Hospital ? id : '',
          pageSize: 35,
          page: 1,
          status: SlotStatus.Available,
        }),
      );

      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsAvailableSlotLoading(false);
        return;
      }
      const { rows } = payload as IPagination<ISlot>;
      const availableSlots = rows.map(({ startTime, ...rest }) => ({
        ...rest,
        startTime: `${extractGMTTime(startTime)}`,
      }));

      setAvailableTimeSlots(availableSlots);
      setIsAvailableSlotLoading(false);
    }

    void slotsAvailable();
  }, [date]);

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
      <Calendar
        mode="single"
        selected={new Date(date)}
        onSelect={(date) => {
          if (date) {
            setValue('date', date.toISOString(), {
              shouldTouch: true,
              shouldValidate: true,
            });
          }
        }}
        className="mx-auto w-max rounded-md border"
        disabled={{ before: new Date() }}
      />

      <div>
        <p className="mt-5 mb-2 font-medium">Available time (Africa/Accra - GMT (+00:00))</p>
        {!!availableTimeSlots.length && (
          <small className="m-auto text-center text-red-500">*Each session is 45 minutes </small>
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
                onClick={() => handleSlotSelection(startTime, id)}
              >
                {startTime}
              </div>
            ))}
          {!availableTimeSlots.length && !isAvailableSlotLoading && (
            <div className="text-red-500"> Sorry, no available slot for the selected date 😕 </div>
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

      <div className="mt-11 ml-auto flex justify-end">
        <Button
          child="Continue"
          disabled={!(date && selectedTime)}
          onClick={() => setCurrentStep(2)}
        />
      </div>
    </div>
  );
};

export default AvailableDates;

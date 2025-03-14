'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn, showErrorToast } from '@/lib/utils';
import { JSX, useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { AvailabilityProps } from '@/types/booking.interface';
import { ISlot, SlotStatus } from '@/types/appointment';
import { extractGMTTime } from '@/lib/date';
import { getAppointmentSlots } from '@/lib/features/appointments/appointmentsThunk';
import { IPagination } from '@/types/shared.interface';
import { AppointmentType, useQueryParam } from '@/hooks/useQueryParam';

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
          doctorId: appointmentType === AppointmentType.Doctor ? id : '',
          orgId: appointmentType === AppointmentType.Hospital ? id : '',
          pageSize: 35,
          page: 1,
          status: SlotStatus.Available,
        }),
      );

      if (payload && showErrorToast(payload)) {
        toast(payload);
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
                onKeyDown={() => {
                  setValue('slotId', id);
                  setValue('time', startTime, {
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                  setValue('slotId', id, {
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
                onClick={() => {
                  setValue('slotId', id);
                  setValue('time', startTime, {
                    shouldTouch: true,
                    shouldValidate: true,
                  });

                  setValue('slotId', id, {
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
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

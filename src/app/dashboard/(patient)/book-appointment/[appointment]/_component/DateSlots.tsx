'use client';

import { JSX, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { useAppDispatch } from '@/lib/hooks';
import { useQueryParam, MedicalAppointmentType } from '@/hooks/useQueryParam';
import { getAppointmentSlotsByDate } from '@/lib/features/appointments/appointmentsThunk';
import { showErrorToast, cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { extractGMTTime } from '@/lib/date';
import { AvailabilityProps } from '@/types/booking.interface';
import { AppointmentSlots } from '@/types/slots.interface';

type DateSlotsProps = {
  date: string;
  setValue: AvailabilityProps['setValue'];
  watch: AvailabilityProps['watch'];
  doctorId: AvailabilityProps['doctorId'];
};

const DateSlots = ({ date, setValue, watch, doctorId }: DateSlotsProps): JSX.Element => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const dispatch = useAppDispatch();
  const params = useParams();
  const id = params.appointment as string;
  const { getQueryParam } = useQueryParam();
  const appointmentType = getQueryParam('appointmentType');

  const selectedTime = watch('time');
  const selectedDate = watch('date');

  const [slots, setSlots] = useState<AppointmentSlots[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSlotsForDate = async (): Promise<void> => {
      if (inView && !slots.length) {
        setIsLoading(true);
        const { payload } = await dispatch(
          getAppointmentSlotsByDate({
            date: new Date(date).toISOString(),
            doctorId: doctorId || (appointmentType === MedicalAppointmentType.Doctor ? id : ''),
            orgId: appointmentType === MedicalAppointmentType.Hospital ? id : '',
          }),
        );

        if (payload && showErrorToast(payload)) {
          toast(payload);
          setIsLoading(false);
          return;
        }

        const data = payload as AppointmentSlots[];
        const availableSlots = data.map(({ startTime, ...rest }) => ({
          ...rest,
          startTime: `${extractGMTTime(startTime)}`,
        }));
        setSlots(availableSlots);
        setIsLoading(false);
      }
    };

    void fetchSlotsForDate();
  }, [inView, date, dispatch, doctorId, id, appointmentType, slots.length]);

  const handleSlotSelection = (startTime: string, slotId: string): void => {
    setValue('date', new Date(date).toISOString(), {
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue('time', startTime, {
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue('slotId', slotId, {
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <div ref={ref} className="flex flex-wrap gap-3 pt-2">
      {isLoading &&
        [...Array(3)].map((_, index) => (
          <div key={index} className="h-8 w-20 animate-pulse rounded-sm bg-gray-200" />
        ))}
      {!isLoading && slots.length === 0 && inView && (
        <p className="text-sm text-gray-500">No available slots for this day.</p>
      )}
      {slots.map(({ startTime, id: slotId }) => {
        const isSelected =
          selectedTime === startTime &&
          new Date(selectedDate).toDateString() === new Date(date).toDateString();
        return (
          <button
            key={slotId}
            className={cn(
              'w-max cursor-pointer rounded-sm border p-1 font-medium text-gray-500',
              isSelected && 'border-primary text-primary',
            )}
            onClick={() => handleSlotSelection(startTime, slotId)}
          >
            {startTime}
          </button>
        );
      })}
    </div>
  );
};

export default DateSlots;

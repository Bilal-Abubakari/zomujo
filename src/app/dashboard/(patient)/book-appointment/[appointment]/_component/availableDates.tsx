'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn, showErrorToast } from '@/lib/utils';
import { JSX, useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { doctorSlot } from '@/lib/features/doctors/doctorsThunk';
import { useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { AvailabilityProps } from '@/types/booking.interface';

const AvailableDates = ({ setValue, setCurrentStep, watch }: AvailabilityProps): JSX.Element => {
  const date = watch('date');
  const selectedTime = watch('time');
  const dispatch = useAppDispatch();

  //Todo: Adjust accordingly when the backend changes.
  const dummyTime = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00'];
  const params = useParams();
  const doctorId = params.appointment;

  useEffect(() => {
    async function slotsAvailable(): Promise<void> {
      const { payload } = await dispatch(doctorSlot({ date, id: String(doctorId) }));

      if (payload && showErrorToast(payload)) {
        toast(payload);
      }
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
      />

      <div>
        <p className="mt-5 mb-2 font-medium">Available time (Africa/Accra - GMT (+00:00))</p>

        <div className="flex flex-wrap gap-3">
          {dummyTime.map((time) => (
            <div
              key={time}
              className={cn(
                'w-max cursor-pointer rounded-sm border p-1 font-medium text-gray-500',
                selectedTime === time && 'border-primary text-primary',
              )}
              onKeyDown={() => {
                setValue('time', time, {
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
              onClick={() => {
                setValue('time', time, {
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
            >
              {time}
            </div>
          ))}
        </div>
      </div>

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

import { Button } from '@/components/ui/button';
import { OptionsMenu } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import React, { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { AvailabilityProps } from '@/types/booking.interface';

const AppointmentReason = ({
  register,
  setCurrentStep,
  setValue,
  isValid,
  errors,
  watch,
}: AvailabilityProps): JSX.Element => {
  const appointmentOptions = [
    { label: 'Visit', value: 'visit' },
    { label: 'Virtual', value: 'virtual' },
  ];

  return (
    <div className="w-[80vw] max-w-[447px] rounded-sm border p-8">
      <p className="mb-8 font-bold">Reason for Visit</p>
      <Textarea
        className="resize-none"
        labelName="Why the visit ?"
        labelClassName="font-medium"
        placeholder="Headache"
        {...register('reason')}
        error={errors?.reason?.message || ''}
        onChange={(event) => {
          setValue('reason', event.target.value, { shouldTouch: true, shouldValidate: true });
        }}
      />
      <div className="my-4 h-10 cursor-pointer sm:flex">
        <div className="flex w-full justify-between">
          <OptionsMenu
            options={appointmentOptions}
            Icon={Calendar}
            menuTrigger="Appointment Type"
            selected={watch('appointmentType')}
            setSelected={(value) => {
              setValue('appointmentType', value, {
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            className="bg-gray-50"
          />

          <Badge variant={'blue'}>{watch('appointmentType')}</Badge>
        </div>
      </div>
      <Textarea
        className="resize-none"
        labelName="Additional Notes"
        labelClassName="font-medium"
        placeholder="Please share anything that will help prepare for the consult"
        {...register('additionalInfo')}
        onChange={(event) => {
          setValue('additionalInfo', event.target.value, {
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
      />

      <div className="mt-4 flex justify-between">
        <Button child={'Back'} variant={'outline'} onClick={() => setCurrentStep(1)} />
        <Button child={'Confirm booking'} onClick={() => setCurrentStep(3)} disabled={!isValid} />
      </div>
    </div>
  );
};

export default AppointmentReason;

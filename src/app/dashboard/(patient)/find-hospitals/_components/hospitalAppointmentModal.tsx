'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector } from '@/lib/hooks';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import moment from 'moment';
import React, { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MODE } from '@/constants/constants';
import { phoneNumberSchema, requiredStringSchema } from '@/schemas/zod.schemas';
import { cn } from '@/lib/utils';

interface HospitalAppointmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  hospitalId: string;
  hospitalName?: string;
  onSubmit: (data: HospitalAppointmentFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface HospitalAppointmentFormData {
  name: string;
  telephone: string;
  serviceType?: string;
  additionalInfo?: string;
  date: string;
}

const hospitalAppointmentSchema = z.object({
  name: requiredStringSchema().min(2, 'Name must be at least 2 characters'),
  telephone: phoneNumberSchema,
  serviceType: z.string().optional(),
  additionalInfo: z.string().optional(),
  date: z
    .string()
    .min(1, 'Please select a date')
    .refine(
      (value) => {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: 'Appointment date must be today or in the future' },
    ),
});

const HospitalAppointmentModal = ({
  open,
  setOpen,
  hospitalId,
  hospitalName,
  onSubmit,
  isLoading = false,
}: HospitalAppointmentModalProps): JSX.Element => {
  const userName = useAppSelector(selectUserName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<HospitalAppointmentFormData>({
    resolver: zodResolver(hospitalAppointmentSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      name: userName || '',
      telephone: '',
      serviceType: '',
      additionalInfo: '',
      date: '',
    },
  });

  const selectedDate = watch('date');

  const onFormSubmit = async (data: HospitalAppointmentFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      setOpen(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (): void => {
    if (!isSubmitting && !isLoading) {
      reset();
      setOpen(false);
    }
  };

  return (
    <Modal
      open={open}
      setState={setOpen}
      showClose={!isSubmitting && !isLoading}
      title={`Book Appointment${hospitalName ? ` - ${hospitalName}` : ''}`}
      description="Fill in the details below to request an appointment"
      content={
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <Input
            labelName="Name"
            placeholder="Enter your full name"
            error={errors.name?.message || ''}
            {...register('name')}
            defaultMaxWidth={false}
          />

          <Input
            labelName="Telephone Number"
            placeholder="Enter your phone number"
            type="tel"
            error={errors.telephone?.message || ''}
            {...register('telephone')}
            defaultMaxWidth={false}
          />

          <Input
            labelName="Service Type (Optional)"
            placeholder="e.g., General Consultation, Emergency, etc."
            error={errors.serviceType?.message || ''}
            {...register('serviceType')}
            defaultMaxWidth={false}
          />

          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium">
              Appointment Date <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground',
                  )}
                  disabled={isSubmitting || isLoading}
                  child={
                    <>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? moment(selectedDate).format('LL') : <span>Pick a date</span>}
                    </>
                  }
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate ? new Date(selectedDate) : undefined}
                  onSelect={(value) => {
                    if (value) {
                      setValue('date', value.toISOString(), {
                        shouldValidate: true,
                        shouldTouch: true,
                      });
                    }
                  }}
                  disabled={{ before: new Date() }}
                  defaultMonth={new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.date && <small className="mt-1 block text-xs font-medium text-red-500">{errors.date.message}</small>}
          </div>

          <Textarea
            labelName="Additional Information (Optional)"
            placeholder="Any additional details or special requests..."
            error={errors.additionalInfo?.message || ''}
            rows={4}
            {...register('additionalInfo')}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
              child="Cancel"
            />
            <Button
              type="submit"
              disabled={!isValid || isSubmitting || isLoading}
              isLoading={isSubmitting || isLoading}
              child="Submit Request"
            />
          </div>
        </form>
      }
    />
  );
};

export default HospitalAppointmentModal;


import React, { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IPatternException } from '@/types/appointment';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import { useAppDispatch } from '@/lib/hooks';
import { createPatternException } from '@/lib/features/appointments/appointmentsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import moment from 'moment';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SelectInput, SelectOption } from '@/components/ui/select';
import { MODE } from '@/constants/constants';
import { parseTime } from '@/lib/date';

const exceptionTypes: SelectOption[] = [
  { label: 'Modification', value: 'modification' },
  { label: 'Cancellation', value: 'cancellation' },
];

const formSchema = z
  .object({
    date: requiredStringSchema(),
    startTime: requiredStringSchema(),
    endTime: z.string({
      required_error: 'End time is required',
    }),
    type: requiredStringSchema(),
    reason: requiredStringSchema(),
  })
  .refine(({ endTime, startTime }) => parseTime(endTime) > parseTime(startTime), {
    path: ['endTime'],
    message: 'End time must be after start time',
  });

type CreateExceptionProps = {
  patternId: string;
  closeCreateException: () => void;
};

const CreateException = ({
  patternId,
  closeCreateException,
}: CreateExceptionProps): JSX.Element => {
  const [isLoading, setLoading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<IPatternException>({
    resolver: zodResolver(formSchema),
    mode: MODE.ON_TOUCH,
  });
  const dispatch = useAppDispatch();

  const onSubmit = async (data: IPatternException): Promise<void> => {
    setLoading(true);
    const { startTime, endTime } = data;
    const { payload } = await dispatch(
      createPatternException({
        ...data,
        patternId,
        startTime: parseTime(startTime).toISOString(),
        endTime: parseTime(endTime).toISOString(),
      }),
    );
    toast(payload as Toast);
    setLoading(false);
    closeCreateException();
  };

  return (
    <div className="mx-auto w-full max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-6 text-2xl font-semibold">Create Exception</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium">
            Date
          </label>
          <div className={cn('grid gap-2')}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-[300px] justify-start text-left font-normal',
                    !watch('date') && 'text-muted-foreground',
                  )}
                  child={
                    <>
                      <CalendarIcon />
                      {watch('date') ? (
                        moment(watch('date')).format('LL')
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
                  mode="single"
                  defaultMonth={new Date()}
                  startMonth={new Date()}
                  hidden={[{ before: new Date() }]}
                  selected={new Date(watch('date'))}
                  onSelect={(value) =>
                    value &&
                    setValue('date', value.toISOString(), {
                      shouldValidate: true,
                      shouldTouch: true,
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            labelName="Start Time"
            type="time"
            error={errors.startTime?.message}
            {...register('startTime')}
          />
          <Input
            labelName="End Time"
            type="time"
            error={errors.endTime?.message}
            {...register('endTime')}
          />
        </div>

        <SelectInput
          ref={register('type').ref}
          control={control}
          options={exceptionTypes}
          label="Type of Exception"
          error={errors.type?.message}
          name="type"
          placeholder="Select exception type"
        />

        <Textarea
          error={errors.reason?.message}
          labelName="Reason for Exception"
          {...register('reason')}
          placeholder="Please provide a reason for this exception..."
        />

        <div className="flex justify-end gap-4">
          <Button
            onClick={closeCreateException}
            type="button"
            disabled={isLoading}
            variant="outline"
            child={'Cancel'}
          />
          <Button
            disabled={!isValid || isLoading}
            isLoading={isLoading}
            child={'Create Exception'}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateException;

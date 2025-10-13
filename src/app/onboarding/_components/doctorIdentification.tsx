import SingleImageDropzone from '@/components/ui/singleFileDropzone';
import { InfoIcon } from 'lucide-react';
import React, { FormEvent, JSX, useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fileSchema } from '@/schemas/zod.schemas';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateCurrentStep, updateDoctorIdentification } from '@/lib/features/auth/authSlice';
import { IDoctorIdentification } from '@/types/auth.interface';

const DoctorIdentificationSchema = z.object({
  front: fileSchema,
  back: fileSchema,
});

const DoctorIdentification = (): JSX.Element => {
  const doctorIdentification = useAppSelector(
    ({ authentication }) => authentication.doctorIdentification,
  );
  const [confirm, setConfirm] = useState(false);
  const {
    register,
    setValue,
    watch,
    getValues,
    formState: { isValid },
  } = useForm<IDoctorIdentification<File>>({
    resolver: zodResolver(DoctorIdentificationSchema),
    defaultValues: doctorIdentification,
  });
  const dispatch = useAppDispatch();

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    dispatch(updateDoctorIdentification(getValues()));
  };

  useEffect(() => {
    if (doctorIdentification) {
      setConfirm(true);
    }
  }, [doctorIdentification]);

  return (
    <form className="flex w-full flex-col gap-10" onSubmit={($event) => onSubmit($event)}>
      <div className="flex flex-col gap-1.5">
        <p className="flex flex-row items-center gap-1 text-2xl leading-8 font-bold sm:text-[32px]">
          Upload doctor&#39;s ID
          <span>
            <InfoIcon size={16} />
          </span>
        </p>
        <p className="text-grayscale-medium text-sm leading-6 sm:text-base">
          We require both sides of ID Card
        </p>
      </div>
      <div className="flex flex-col justify-between gap-4">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between sm:gap-2">
          <SingleImageDropzone
            height={280}
            width={300}
            label="Front"
            className="w-full sm:w-auto"
            value={watch('front')}
            {...register('front')}
            onChange={(file) => setValue('front', file!, { shouldValidate: true })}
          />
          <SingleImageDropzone
            height={280}
            width={300}
            label="Back"
            className="w-full sm:w-auto"
            value={watch('back')}
            {...register('back')}
            onChange={(file) => setValue('back', file!, { shouldValidate: true })}
          />
        </div>
        <div className="flex flex-row">
          <Checkbox
            name="confirm"
            labelClassName="text-gray-500 text-sm sm:text-base"
            checked={confirm}
            onCheckedChange={(checked) => setConfirm(Boolean(checked))}
            labelName="I confirm that the ID provided is a valid  government issued doctor ID. This ID includes my name, ID number and expiry date"
          />
        </div>
      </div>
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-4 self-center sm:max-w-none sm:flex-row sm:gap-8">
        <Button
          onClick={() => dispatch(updateCurrentStep(1))}
          variant="secondary"
          className="bg-accent-foreground w-full text-white"
          type="button"
          child="Back"
        />
        <Button className="w-full" disabled={!isValid || !confirm} type="submit" child="Continue" />
      </div>
    </form>
  );
};

export default DoctorIdentification;

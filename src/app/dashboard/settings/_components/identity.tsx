'use client';
import { Button } from '@/components/ui/button';
import SingleImageDropzone from '@/components/ui/singleFileDropzone';
import { Toast, toast } from '@/hooks/use-toast';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { uploadDoctorId } from '@/lib/features/doctors/doctorsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fileSchema } from '@/schemas/zod.schemas';
import { IDoctorIdentification } from '@/types/auth.interface';
import { IDoctor } from '@/types/doctor.interface';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const Identity = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { IDs, status } = useAppSelector(selectExtra) as IDoctor;

  const identificationSchema = z.object({
    front: fileSchema,
    back: fileSchema,
  });
  const { register, setValue, watch, handleSubmit, getValues } = useForm<IDoctorIdentification>({
    resolver: zodResolver(identificationSchema),
    defaultValues: IDs,
  });

  async function onSubmit(): Promise<void> {
    setIsLoading(true);
    const { payload } = await dispatch(uploadDoctorId(getValues()));
    toast(payload as Toast);
    setIsLoading(false);
  }

  return (
    <div>
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-bold">Identification</h2>
          {status === AcceptDeclineStatus.Accepted && (
            <span className="rounded-sm bg-success-50 p-2 text-xs text-primary">
              Your ID has been verified
            </span>
          )}
        </div>
        <p className="text-gray-500">
          Stay in the loop! Receive updates, and important news directly to your inbox.
        </p>
        <hr className="my-7 gap-4" />
      </div>
      <form className="max-w-[650px]" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap justify-center sm:justify-between">
          <SingleImageDropzone
            height={280}
            width={300}
            label="Front"
            value={watch('front')}
            {...register('front')}
            onChange={(file) => setValue('front', file!, { shouldValidate: true })}
            className="mb-4"
            showDeleteIcon={status !== AcceptDeclineStatus.Accepted}
          />
          <SingleImageDropzone
            height={280}
            width={300}
            label="Back"
            value={watch('back')}
            {...register('back')}
            onChange={(file) => setValue('back', file!, { shouldValidate: true })}
            showDeleteIcon={status !== AcceptDeclineStatus.Accepted}
          />
        </div>
        {status !== AcceptDeclineStatus.Accepted && (
          <div className="mb-16 mt-4 flex justify-end sm:mb-0 sm:mt-0">
            <Button child="Save Changes" isLoading={isLoading} disabled={isLoading} />
          </div>
        )}
      </form>
    </div>
  );
};

export default Identity;

import { Check, InfoIcon } from 'lucide-react';
import React, { FormEvent, JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { fileSchema } from '@/schemas/zod.schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import SingleImageDropzone from '@/components/ui/singleFileDropzone';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { IDoctorPhotoUpload } from '@/types/auth.interface';
import { Modal } from '@/components/ui/dialog';
import { doctorOnboarding } from '@/lib/features/auth/authThunk';
import { updateCurrentStep } from '@/lib/features/auth/authSlice';

const DoctorPhotoUploadScheme = z.object({
  profilePicture: fileSchema,
});

const DoctorPhotoUpload = (): JSX.Element => {
  const [confirm, setConfirm] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const {
    register,
    setValue,
    watch,
    getValues,
    formState: { isValid },
  } = useForm<IDoctorPhotoUpload>({
    resolver: zodResolver(DoctorPhotoUploadScheme),
  });
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(({ authentication }) => authentication.isLoading);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const { payload } = await dispatch(doctorOnboarding(getValues()));
    if (payload) {
      setOpenModal(true);
    }
  };

  return (
    <form className="flex w-full flex-col gap-10" onSubmit={(event) => onSubmit(event)}>
      <Modal open={openModal} content={<OnboardingSuccessful />} />
      <div className="flex flex-col gap-1.5">
        <p className="flex flex-row items-center gap-1 text-[32px] leading-8 font-bold">
          Upload Photo
          <span>
            <InfoIcon size={16} />
          </span>
        </p>
        <p className="text-grayscale-medium leading-6">Upload a photo for verification purposes.</p>
      </div>
      <div className="flex flex-col justify-between gap-4">
        <div className="flex flex-row justify-between">
          <SingleImageDropzone
            height={200}
            width={610}
            label="Passport Photo"
            value={watch('profilePicture')}
            {...register('profilePicture')}
            onChange={(file) => setValue('profilePicture', file!, { shouldValidate: true })}
          />
        </div>
        <div className="flex flex-row">
          <Checkbox
            name="confirm"
            labelClassName="text-gray-500"
            checked={confirm}
            onCheckedChange={(checked) => setConfirm(Boolean(checked))}
            labelName="I confirm that the photo provided is my face and no one else’s face"
          />
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-8">
        <Button
          onClick={() => dispatch(updateCurrentStep(2))}
          variant="secondary"
          className="bg-accent-foreground w-full text-white"
          type="button"
          disabled={isLoading}
          child="Back"
        />
        <Button
          className="w-full"
          child="Finish"
          isLoading={isLoading}
          disabled={!isValid || !confirm}
          type="submit"
        />
      </div>
    </form>
  );
};

export default DoctorPhotoUpload;

const OnboardingSuccessful = (): JSX.Element => {
  const router = useRouter();
  return (
    <div className="relative flex flex-col items-center gap-12 p-8 pt-16">
      <div className="absolute top-0 left-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50">
        <div className="from-primaryLightBase to-primaryDark flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b">
          <Check size={32} strokeWidth={3} className="text-white" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="text-2xl leading-6 font-bold">Submission Received!</p>
        <p className="text-center leading-4 text-gray-500">
          Thank you for submitting your information! Our admin team will review and verify your
          details shortly. You will gain access to the features once the verification process is
          complete.
        </p>
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        <Button child="Go to Dashboard" type="button" onClick={() => router.push('/dashboard')} />
      </div>
    </div>
  );
};

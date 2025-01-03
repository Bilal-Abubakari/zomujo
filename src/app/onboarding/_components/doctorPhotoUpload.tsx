import { Check, InfoIcon } from 'lucide-react';
import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { requiredStringSchema } from '@/schemas/zod.schemas';
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
  profilePicture: requiredStringSchema(),
});

const DoctorPhotoUpload = () => {
  const [confirm, setConfirm] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { register, setValue, watch, getValues } = useForm<IDoctorPhotoUpload>({
    resolver: zodResolver(DoctorPhotoUploadScheme),
  });
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(({ authentication }) => authentication.isLoading);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
        <p className="flex flex-row items-center gap-1 text-[32px] font-bold leading-8">
          Upload Photo
          <span>
            <InfoIcon size={16} />
          </span>
        </p>
        <p className="leading-6 text-grayscale-medium">Upload a photo for verification purposes.</p>
      </div>
      <div className="flex flex-col justify-between gap-4">
        <div className="flex flex-row justify-between">
          <SingleImageDropzone
            height={200}
            width={610}
            label="Passport Photo"
            value={watch('profilePicture')}
            {...register('profilePicture')}
            onChange={(file) => file && setValue('profilePicture', file)}
          />
        </div>
        <div className="flex flex-row">
          <Checkbox
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
          className="w-full bg-accent-foreground text-white"
          type="button"
          child="Back"
        />
        <Button
          className="w-full"
          child="Finish"
          isLoading={isLoading}
          disabled={!watch('profilePicture') || !confirm}
          type="submit"
        />
      </div>
    </form>
  );
};

export default DoctorPhotoUpload;

const OnboardingSuccessful = () => {
  const router = useRouter();
  return (
    <div className="relative flex flex-col items-center gap-12 p-8 pt-16">
      <div className="absolute left-1/2 top-0 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-primaryLightBase to-primaryDark">
          <Check size={32} strokeWidth={3} className="text-white" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="text-2xl font-bold leading-6">Submission Received!</p>
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

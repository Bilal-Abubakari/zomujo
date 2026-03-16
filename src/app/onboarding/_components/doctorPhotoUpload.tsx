import { Check, InfoIcon } from 'lucide-react';
import React, { JSX, SyntheticEvent, useState } from 'react';
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

  const onSubmit = async (event: SyntheticEvent): Promise<void> => {
    event.preventDefault();
    const { payload } = await dispatch(doctorOnboarding(getValues()));
    if (payload) {
      setOpenModal(true);
    }
  };

  return (
    <form className="flex w-full flex-col gap-10" onSubmit={(event) => onSubmit(event)}>
      <Modal open={openModal} content={<OnboardingSuccessful />} />
      <div className="flex w-full flex-col gap-1.5">
        <p className="flex flex-row items-center gap-1 text-2xl leading-8 font-bold sm:text-[32px]">
          Professional Photo{''}
          <span>
            <InfoIcon size={16} />
          </span>
        </p>
        <p className="text-grayscale-medium text-sm leading-6 sm:text-base">
          Upload a clear, professional photo. This photo will be displayed on your profile and is
          the first impression patients have of you — make it count!
        </p>
      </div>
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800">
        <p className="mb-1 font-semibold">📸 Photo Guidelines</p>
        <ul className="list-inside list-disc space-y-1 text-xs text-blue-700">
          <li>Use a plain or neutral background</li>
          <li>Face the camera directly with good lighting</li>
          <li>Wear professional attire (e.g., lab coat or formal wear)</li>
          <li>Avoid sunglasses, hats, or accessories that obscure your face</li>
          <li>High resolution preferred (PNG or JPG, max 5MB)</li>
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-center">
          <SingleImageDropzone
            height={200}
            enableCamera={true}
            cameraLabel="Take Professional Photo"
            width={300}
            label="Professional Headshot"
            className="w-full sm:w-auto"
            value={watch('profilePicture')}
            {...register('profilePicture')}
            onChange={(file) => setValue('profilePicture', file!, { shouldValidate: true })}
          />
        </div>
        <div className="flex flex-row">
          <Checkbox
            name="confirm"
            labelClassName="text-gray-500 text-sm sm:text-base"
            checked={confirm}
            onCheckedChange={(checked) => setConfirm(Boolean(checked))}
            labelName="I confirm this is a professional photo of myself that I consent to display on my public profile"
          />
        </div>
      </div>
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-4 self-center sm:flex-row sm:gap-8">
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
          disabled={!isValid || !confirm || isLoading}
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
    <div className="relative flex flex-col items-center gap-8 p-6 pt-16">
      <div className="absolute top-0 left-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50">
        <div className="from-primary-light-base to-primary-dark flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-b sm:h-16 sm:w-16">
          <Check size={28} strokeWidth={3} className="text-white sm:size-8" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <p className="text-xl leading-6 font-bold sm:text-2xl">Submission Received!</p>
        <p className="text-center text-sm leading-5 text-gray-500 sm:text-base sm:leading-6">
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

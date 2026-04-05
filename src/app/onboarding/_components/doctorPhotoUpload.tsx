import { InfoIcon } from 'lucide-react';
import React, { JSX, SyntheticEvent, useState } from 'react';
import { z } from 'zod';
import { fileSchema } from '@/schemas/zod.schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import SingleImageDropzone from '@/components/ui/singleFileDropzone';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { IDoctorPhotoUpload } from '@/types/auth.interface';
import { doctorOnboarding } from '@/lib/features/auth/authThunk';
import { updateCurrentStep } from '@/lib/features/auth/authSlice';

const DoctorPhotoUploadScheme = z.object({
  profilePicture: fileSchema,
});

const PROGRESS_MESSAGES: { threshold: number; message: string }[] = [
  { threshold: 0, message: 'Preparing your profile photo...' },
  { threshold: 30, message: 'Uploading your information...' },
  { threshold: 60, message: 'Securely saving your profile...' },
  { threshold: 85, message: 'Almost there, hang tight!' },
  { threshold: 95, message: 'Finalizing your profile...' },
];

const getProgressMessage = (percent: number): string => {
  const match = [...PROGRESS_MESSAGES].reverse().find((m) => percent >= m.threshold);
  return match?.message ?? PROGRESS_MESSAGES[0].message;
};

const DoctorPhotoUpload = (): JSX.Element => {
  const [confirm, setConfirm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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
    setUploadProgress(0);
    const { payload } = await dispatch(
      doctorOnboarding({
        ...getValues(),
        onUploadProgress: (percent) => setUploadProgress(percent),
      }),
    );
    if (payload) {
      setUploadProgress(100);
      setTimeout(() => {
        dispatch(updateCurrentStep(3));
      }, 600);
    } else {
      setUploadProgress(null);
    }
  };

  const isUploading = uploadProgress !== null && isLoading;

  return (
    <>
      {isUploading && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <svg
                  className="h-8 w-8 animate-pulse text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <p className="text-center text-lg font-semibold text-gray-900">
                Uploading Your Information
              </p>
              <p className="text-center text-sm text-gray-500">
                {getProgressMessage(uploadProgress)}
              </p>
            </div>

            <div className="mb-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-3 rounded-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center text-sm font-medium text-blue-600">{uploadProgress}%</p>

            <p className="mt-4 text-center text-xs text-gray-400">
              Please keep this window open until the upload is complete.
            </p>
          </div>
        </div>
      )}

      <form className="flex w-full flex-col gap-10" onSubmit={(event) => onSubmit(event)}>
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
            onClick={() => dispatch(updateCurrentStep(1))}
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
    </>
  );
};

export default DoctorPhotoUpload;

'use client';
import { MODE } from '@/constants/constants';
import { Toast, toast } from '@/hooks/use-toast';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { updateDoctorProfile } from '@/lib/features/doctors/doctorsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  nameArraySchema,
  nameSchema,
  phoneNumberSchema,
  positiveNumberSchema,
  requiredStringSchema,
  textAreaSchema,
} from '@/schemas/zod.schemas';
import { DoctorPersonalInfo, IDoctor } from '@/types/doctor.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { JSX, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import useImageUpload from '@/hooks/useImageUpload';
import { isEqual } from 'lodash';
import { useRouter } from 'next/navigation';
import { PaymentTab } from '@/hooks/useQueryParam';
import { dataCompletionToast } from '@/lib/utils';
import ProfilePictureUpload from '@/components/profile/ProfilePictureUpload';
import PersonalDetailsForm from '@/components/forms/PersonalDetailsForm';
const PersonalDetailsSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  education: z
    .object({
      school: requiredStringSchema(),
      degree: nameSchema,
    })
    .optional(),
  languages: nameArraySchema,
  bio: textAreaSchema,
  experience: positiveNumberSchema,
  specializations: z.array(nameSchema).max(3, 'You can select up to 3 specializations'),
  contact: phoneNumberSchema,
});
const PersonalInfo = (): JSX.Element => {
  const router = useRouter();
  const personalDetails = useAppSelector(selectExtra) as IDoctor;
  const getFormDataFromPersonalDetails = (
    details: IDoctor | null,
  ): DoctorPersonalInfo & Pick<IDoctor, 'profilePicture'> => ({
    firstName: details?.firstName || '',
    lastName: details?.lastName || '',
    languages: details?.languages || [],
    bio: details?.bio || '',
    experience: details?.experience || 0,
    specializations: details?.specializations || [],
    contact: details?.contact || '',
    profilePicture: details?.profilePicture || '',
  });
  const defaultFormData = useMemo(
    () => getFormDataFromPersonalDetails(personalDetails),
    [personalDetails],
  );
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<DoctorPersonalInfo>({
    resolver: zodResolver(PersonalDetailsSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: defaultFormData,
  });
  const {
    imageRef,
    imageUrl: userProfilePicture,
    handleImageChange,
    resetImage,
  } = useImageUpload<DoctorPersonalInfo>({
    setValue,
    defaultImageUrl: personalDetails?.profilePicture,
  });
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const currentFormData = watch();
  const currentFormDataWithImage = useMemo(
    () => ({
      ...currentFormData,
      experience: Number(currentFormData.experience),
      profilePicture: userProfilePicture || '',
    }),
    [currentFormData, userProfilePicture],
  );
  const hasChanges = useMemo(
    () => !isEqual(defaultFormData, currentFormDataWithImage),
    [defaultFormData, currentFormDataWithImage],
  );
  async function onSubmit(doctorPersonalInfo: DoctorPersonalInfo): Promise<void> {
    setIsLoading(true);
    const { payload } = await dispatch(updateDoctorProfile(doctorPersonalInfo));
    if (payload) {
      const toastData = payload as Toast;
      toast(toastData);
      if (toastData.variant === 'success') {
        if (!personalDetails?.fee) {
          router.push(`/dashboard/settings/payment?tab=${PaymentTab.Pricing}`);
          toast(dataCompletionToast('pricing'));
          return;
        }
        if (!personalDetails?.hasDefaultPayment) {
          router.push(`/dashboard/settings/payment?tab=${PaymentTab.PaymentMethod}`);
          toast(dataCompletionToast('paymentMethod'));
          return;
        }
        if (!personalDetails?.hasSlot) {
          router.push('/dashboard/settings/availability');
          toast(dataCompletionToast('availability'));
          return;
        }
      }
    }
    setIsLoading(false);
  }
  const handleMultiInputChange = (key: keyof DoctorPersonalInfo, value: string[]): void =>
    setValue(key, value, { shouldTouch: true, shouldValidate: true });
  return (
    <>
      <ProfilePictureUpload
        userProfilePicture={userProfilePicture}
        imageRef={imageRef}
        handleImageChange={handleImageChange}
        resetImage={resetImage}
      />
      <hr className="my-[30px]" />
      <PersonalDetailsForm
        register={register}
        errors={errors}
        watch={watch}
        isLoading={isLoading}
        isValid={isValid}
        hasChanges={hasChanges}
        onSubmit={handleSubmit(onSubmit)}
        handleMultiInputChange={handleMultiInputChange}
      />
    </>
  );
};
export default PersonalInfo;

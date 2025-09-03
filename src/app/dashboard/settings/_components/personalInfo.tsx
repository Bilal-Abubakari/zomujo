'use client';
import MultiInputField from '@/components/multi-input-field/multiInputField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MODE, specialties } from '@/constants/constants';
import { toast } from '@/hooks/use-toast';
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
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import useImageUpload from '@/hooks/useImageUpload';
import { MultiSelect } from '@/components/ui/multiSelect';

const PersonalDetailsSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  education: z.object({
    school: requiredStringSchema(),
    degree: nameSchema,
  }),
  languages: nameArraySchema,
  awards: nameArraySchema,
  bio: textAreaSchema,
  experience: positiveNumberSchema,
  specializations: nameArraySchema,
  contact: phoneNumberSchema,
});

const PersonalInfo = (): JSX.Element => {
  const personalDetails = useAppSelector(selectExtra) as IDoctor;

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<DoctorPersonalInfo>({
    resolver: zodResolver(PersonalDetailsSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: personalDetails,
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

  async function onSubmit(doctorPersonalInfo: DoctorPersonalInfo): Promise<void> {
    setIsLoading(true);
    const { payload } = await dispatch(updateDoctorProfile(doctorPersonalInfo));
    if (payload) {
      toast(payload);
    }
    setIsLoading(false);
  }

  const handleMultiInputChange = (key: keyof DoctorPersonalInfo, value: string[]): void =>
    setValue(key, value, { shouldTouch: true, shouldValidate: true });

  return (
    <>
      <section>
        <div>
          <h2 className="text-2xl font-bold">Personal Details</h2>
          <p className="text-gray-500"> Update your profile</p>
        </div>
        <hr className="my-7 gap-4" />
        <p className="my-4 font-medium"> Upload profile</p>
        <div className="flex items-center justify-start gap-2">
          <div>
            {userProfilePicture ? (
              <Image
                className="h-[79px] w-[79px] rounded-full bg-gray-600 object-fill"
                src={userProfilePicture}
                alt="Profile Picture"
                width={79}
                height={79}
              />
            ) : (
              <div className="flex h-[79px] w-[79px] items-center justify-center rounded-full bg-gray-200">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <input className="hidden" ref={imageRef} type="file" onChange={handleImageChange} />
          </div>
          <Button
            child={'Upload new profile'}
            variant={'outline'}
            className="bg-transparent"
            onClick={() => imageRef.current?.click()}
          />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <Trash2 size={16} onClick={resetImage} />
          </div>
        </div>
      </section>
      <hr className="my-[30px]" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex-warp flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <Input
            labelName="First name"
            className="bg-transparent"
            placeholder="John"
            error={errors.firstName?.message || ''}
            {...register('firstName')}
          />
          <Input
            labelName="Last name"
            className="bg-transparent"
            placeholder="Doe"
            error={errors.lastName?.message || ''}
            {...register('lastName')}
          />
        </div>
        <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <Input
            labelName="Phone Number"
            className="bg-transparent"
            placeholder="0208880000"
            {...register('contact')}
            error={errors.contact?.message || ''}
          />
          <Input
            labelName="Experience"
            className="bg-transparent"
            placeholder="5"
            error={errors.experience?.message || ''}
            type="number"
            {...register('experience')}
          />
        </div>
        <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <div className="w-full max-w-[384px]">
            <Input
              labelName="School attended"
              className="bg-transparent"
              placeholder="University of Ghana"
              error={errors.education?.school?.message || ''}
              type="text"
              {...register('education.school')}
            />
          </div>
          <div className="w-full max-w-[384px]">
            <Input
              labelName="Certificate acquired"
              className="bg-transparent"
              placeholder="Bachelor of Medicine and Bachelor of Surgery"
              error={errors.education?.degree?.message || ''}
              type="text"
              {...register('education.degree')}
            />
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <div className="w-full max-w-[384px]">
            <MultiInputField
              ref={register('awards').ref}
              handleValueChange={(value) => handleMultiInputChange('awards', value)}
              error={errors.awards?.message || ''}
              label="Awards"
              placeholder="Best Doctor"
              defaultValues={watch('awards')}
            />
          </div>
          <div className="w-full max-w-[384px]">
            <MultiSelect
              labelName="Specialization"
              options={specialties}
              defaultValue={watch('specializations')}
              placeholder="Select specializations"
              ref={register('specializations').ref}
              onValueChange={(value) => handleMultiInputChange('specializations', value)}
              animation={2}
              error={errors.specializations?.message || ''}
            />
          </div>
        </div>
        <div className="mt-2 w-full max-w-[384px]">
          <MultiInputField
            ref={register('languages').ref}
            handleValueChange={(value) => handleMultiInputChange('languages', value)}
            error={errors.languages?.message || ''}
            label="Languages"
            placeholder="English"
            defaultValues={watch('languages')}
          />
        </div>
        <div className="mt-8 max-w-[384px] items-baseline">
          <Textarea
            labelName=" Bio (something your patients will love about you)"
            className="w-full resize-none bg-transparent"
            error={errors.bio?.message || ''}
            {...register('bio')}
          />
        </div>
        <Button
          child="Save Changes"
          className="me:mb-0 my-[15px] mb-24 ml-auto flex"
          isLoading={isLoading}
          disabled={!isValid || isLoading}
        />
      </form>
    </>
  );
};

export default PersonalInfo;

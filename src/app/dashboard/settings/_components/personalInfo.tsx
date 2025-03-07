'use client';
import MultiInputField from '@/components/multi-input-field/multiInputField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MODE } from '@/constants/constants';
import { toast } from '@/hooks/use-toast';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { updateDoctorProfile } from '@/lib/features/doctors/doctorsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  nameArraySchema,
  nameSchema,
  phoneNumberSchema,
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

const PersonalInfo = (): JSX.Element => {
  const { firstName, lastName, specializations, bio, experience, contact, profilePicture } =
    useAppSelector(selectExtra) as IDoctor;
  const personalDetails = {
    firstName,
    lastName,
    specializations,
    bio,
    experience,
    contact: contact,
  };
  const PersonalDetailsSchema = z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    schoolsAttended: nameArraySchema,
    languages: nameArraySchema,
    awards: nameArraySchema,
    bio: textAreaSchema,
    experience: requiredStringSchema(),
    specializations: nameArraySchema,
    contact: phoneNumberSchema,
  });

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
    defaultImageUrl: profilePicture,
  });

  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const schoolsAttended = watch('schoolsAttended');
  const languages = watch('languages');
  const userAwards = watch('awards');
  const specialization = watch('specializations');
  const userBio = watch('bio');

  async function onSubmit(doctorPersonalInfo: DoctorPersonalInfo): Promise<void> {
    setIsLoading(true);
    const { payload } = await dispatch(updateDoctorProfile(doctorPersonalInfo));
    if (payload) {
      toast(payload);
    }
    setIsLoading(false);
  }

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
            <MultiInputField
              ref={register('schoolsAttended').ref}
              handleValueChange={(value) =>
                setValue('schoolsAttended', value, { shouldTouch: true, shouldValidate: true })
              }
              error={errors.schoolsAttended?.message || ''}
              label="Schools Attended"
              placeholder="University of Ghana"
              onBlur={() => {
                if (!schoolsAttended) {
                  setValue('schoolsAttended', [], {
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }
              }}
            />
          </div>
          <div className="w-full max-w-[384px]">
            <MultiInputField
              ref={register('languages').ref}
              handleValueChange={(value) => {
                setValue('languages', value, { shouldTouch: true, shouldValidate: true });
              }}
              error={errors.languages?.message || ''}
              label="Languages"
              placeholder="English"
              onBlur={() => {
                if (!languages) {
                  setValue('languages', [], { shouldTouch: true, shouldValidate: true });
                }
              }}
            />
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <div className="w-full max-w-[384px]">
            <MultiInputField
              ref={register('awards').ref}
              handleValueChange={(value) => {
                setValue('awards', value, { shouldTouch: true, shouldValidate: true });
              }}
              error={errors.awards?.message || ''}
              label="Awards"
              placeholder="Best Doctor"
              onBlur={() => {
                if (!userAwards) {
                  setValue('awards', [], { shouldTouch: true, shouldValidate: true });
                }
              }}
            />
          </div>
          <div className="w-full max-w-[384px]">
            <MultiInputField
              ref={register('specializations').ref}
              handleValueChange={(value) => {
                setValue('specializations', value, { shouldTouch: true, shouldValidate: true });
              }}
              error={errors.specializations?.message || ''}
              label="Specialization"
              placeholder="Ophthalmology"
              onBlur={() => {
                if (!specialization) {
                  setValue('specializations', [], { shouldTouch: true, shouldValidate: true });
                }
              }}
            />
          </div>
        </div>

        <div className="mt-8 max-w-[384px] items-baseline">
          <Textarea
            labelName=" Bio (something your patients will love about you)"
            className="w-full resize-none bg-transparent"
            error={errors.bio?.message || ''}
            {...register('bio')}
            onChange={(event) => {
              setValue('bio', event.target.value, { shouldTouch: true, shouldValidate: true });
            }}
            onBlur={() => {
              if (!userBio) {
                setValue('bio', '', { shouldTouch: true, shouldValidate: true });
              }
            }}
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

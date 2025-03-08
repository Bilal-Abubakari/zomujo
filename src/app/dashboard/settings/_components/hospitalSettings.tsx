'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { healthInsurances, MODE, specialties } from '@/constants/constants';
import { toast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { nameArraySchema, nameSchema, positiveNumberSchema } from '@/schemas/zod.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IHospitalProfile } from '@/types/hospital.interface';
import { MultiSelect } from '@/components/ui/multiSelect';
import { updateHospitalDetails } from '@/lib/features/hospitals/hospitalThunk';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { IAdmin } from '@/types/admin.interface';
import useImageUpload from '@/hooks/useImageUpload';

const hospitalSettingsSchema = z.object({
  image: z.union([z.instanceof(File), z.string().url()]),
  name: nameSchema,
  specialties: nameArraySchema,
  regularFee: positiveNumberSchema,
  supportedInsurance: nameArraySchema,
});

const HospitalSettings = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const { org } = useAppSelector(selectExtra) as IAdmin;
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<IHospitalProfile>({
    resolver: zodResolver(hospitalSettingsSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: org,
  });
  const {
    imageRef,
    imageUrl: hospitalImage,
    handleImageChange,
    resetImage,
  } = useImageUpload<IHospitalProfile>({
    setValue,
    defaultImageUrl: org.image,
    fieldName: 'image',
  });

  async function onSubmit(hospitalProfile: Partial<IHospitalProfile>): Promise<void> {
    setIsLoading(true);
    if (typeof hospitalProfile.image === 'string') {
      delete hospitalProfile.image;
    }
    const { payload } = await dispatch(updateHospitalDetails(hospitalProfile));
    if (payload) {
      toast(payload);
    }
    setIsLoading(false);
  }

  return (
    <>
      <section>
        <div>
          <h2 className="text-2xl font-bold">Hospital Settings</h2>
          <p className="text-gray-500"> Update hospital details</p>
        </div>
        <hr className="my-7 gap-4" />
        <p className="font-medium"> Upload Hospital Image</p>
        <span className="text-sm text-gray-500">This is what patient&#39;s will see</span>
        <div className="mt-4 flex items-center justify-start gap-2">
          <div>
            {hospitalImage ? (
              <Image
                className="h-[79px] w-[79px] rounded-full bg-gray-600 object-fill"
                src={hospitalImage}
                alt="Hospital's Picture"
                width={79}
                height={79}
              />
            ) : (
              <div className="flex h-[79px] w-[79px] items-center justify-center rounded-full bg-gray-200">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <input
              accept="image/*"
              className="hidden"
              ref={imageRef}
              type="file"
              onChange={handleImageChange}
            />
          </div>
          <Button
            child={'Upload Image'}
            variant={'outline'}
            className="bg-transparent"
            onClick={() => imageRef.current?.click()}
          />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <Trash2 className="cursor-pointer" size={16} onClick={() => resetImage()} />
          </div>
        </div>
      </section>
      <hr className="my-[30px]" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex-warp flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <Input
            labelName="Name of Hospital"
            className="bg-transparent"
            placeholder="Zomujo Hospital"
            error={errors.name?.message || ''}
            {...register('name')}
          />
          <MultiSelect
            labelName="Select Specialties"
            options={specialties}
            onValueChange={(value) => {
              setValue('specialties', value, { shouldTouch: true, shouldValidate: true });
            }}
            defaultValue={watch('specialties')}
            placeholder="Select options"
            variant="inverted"
            animation={2}
            maxCount={1}
          />
        </div>
        <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <MultiSelect
            labelName="Select Support Insurance"
            options={healthInsurances}
            onValueChange={(value) => {
              setValue('supportedInsurance', value, { shouldTouch: true, shouldValidate: true });
            }}
            defaultValue={watch('supportedInsurance')}
            placeholder="Select options"
            variant="inverted"
            animation={2}
            maxCount={1}
          />
          <Input
            labelName="Consulation Fees"
            className="bg-transparent"
            placeholder="Enter total fees for consultation"
            type="number"
            error={errors.regularFee?.message || ''}
            {...register('regularFee')}
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

export default HospitalSettings;

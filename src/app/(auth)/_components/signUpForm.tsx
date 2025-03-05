'use client';
import { Button } from '@/components/ui/button';
import { MODE, unMatchingPasswords } from '@/constants/constants';
import {
  coordinatesSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  requiredStringSchema,
} from '@/schemas/zod.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { JSX, useState } from 'react';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { AlertMessage } from '@/components/ui/alert';
import { ISignUp } from '@/types/auth.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { requestOrganization, signUp } from '@/lib/features/auth/authThunk';
import { selectThunkState } from '@/lib/features/auth/authSelector';
import { Role } from '@/types/shared.enum';
import { ImageVariant, Modal } from '@/components/ui/dialog';
import Location from '@/components/location/location';
import { Option } from 'react-google-places-autocomplete/build/types';

const SignUpForm = (): JSX.Element => {
  const doctorsSchema = z
    .object({
      firstName: nameSchema,
      lastName: nameSchema,
      email: emailSchema(),
      password: passwordSchema,
      confirmPassword: passwordSchema,
      role: requiredStringSchema(),
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
      message: unMatchingPasswords,
      path: ['confirmPassword'],
    });

  const organizationsSchema = z.object({
    name: nameSchema,
    email: emailSchema(),
    role: requiredStringSchema(),
    location: requiredStringSchema(),
    long: coordinatesSchema,
    lat: coordinatesSchema,
    gpsLink: requiredStringSchema(),
  });

  const patientSchema = z
    .object({
      firstName: nameSchema,
      lastName: nameSchema,
      email: emailSchema(),
      password: passwordSchema,
      confirmPassword: passwordSchema,
      role: requiredStringSchema(),
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
      message: unMatchingPasswords,
      path: ['confirmPassword'],
    });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<ISignUp>({
    resolver: async (data, context, options) => {
      const { role } = data;
      let schema;
      if (role === Role.Doctor) {
        schema = doctorsSchema;
      } else if (role === Role.Admin) {
        schema = organizationsSchema;
      } else {
        schema = patientSchema;
      }
      return zodResolver(schema)(data, context, options);
    },
    defaultValues: {
      role: Role.Patient,
    },
    mode: MODE.ON_TOUCH,
  });
  const role = watch('role');
  const location = watch('location');

  const getFormTitle = (selectedForm: Role): string => {
    switch (selectedForm) {
      case Role.Doctor:
        return 'Sign Up as Doctor';
      case Role.Admin:
        return 'Request Organizational Access';
      default:
        return 'Sign Up as Patient';
    }
  };
  const dispatch = useAppDispatch();
  const [successMessage, setSuccessMessage] = useState('');
  const { isLoading, errorMessage } = useAppSelector(selectThunkState);
  const onSubmit = async (userCredentials: ISignUp): Promise<void> => {
    setSuccessMessage('');
    const action = userCredentials.role === Role.Admin ? requestOrganization : signUp;
    const { payload } = await dispatch(action(userCredentials));
    if (payload) {
      setSuccessMessage(String(payload));
      reset();
    }

    setOpenModal(true);
  };

  const [openModal, setOpenModal] = useState(false);
  const handleLocationValue = ({ value }: Option): void => {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const placeId = value.place_id;

    service.getDetails({ placeId }, (place, status) => {
      if (status !== 'OK' || !place?.geometry?.location) {
        return;
      }

      setValue('lat', place.geometry.location.lat());
      setValue('long', place.geometry.location.lng());
      setValue('gpsLink', place.url || '');
      setValue('location', value.description, {
        shouldValidate: true,
      });
    });
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mt-4">
        {successMessage ? (
          <Modal
            open={openModal}
            content={successMessage}
            showImage={true}
            imageVariant={role === Role.Admin ? ImageVariant.Success : ImageVariant.Email}
            showClose={true}
            setState={setOpenModal}
          />
        ) : (
          <Modal
            open={openModal}
            content={errorMessage}
            showImage={true}
            imageVariant={ImageVariant.Error}
            showClose={true}
            setState={setOpenModal}
          />
        )}
      </div>
      <div className="mb-5 mt-4 flex justify-center space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value={Role.Patient}
            className="h-4 w-4 accent-primary"
            {...register('role')}
          />
          <span>Patient</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value={Role.Doctor}
            {...register('role')}
            className="h-4 w-4 accent-primary"
          />
          <span>Doctor</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value={Role.Admin}
            {...register('role')}
            className="h-4 w-4 accent-primary"
          />
          <span>Organization</span>
        </label>
      </div>
      {role === Role.Admin && (
        <AlertMessage
          message="This selection doesn&rsquo;t create an account automatically. We&rsquo;ll contact you
            after processing your request."
          title="Importance Notice"
          className="border-primary"
          titleClassName="font-semibold text-primary"
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
        {role === Role.Doctor && <NameFields register={register} errors={errors} />}

        {role === Role.Admin && (
          <>
            <Input
              labelName="Hospital's Name"
              error={errors.name?.message || ''}
              placeholder="Zyptyk Hospital"
              {...register('name')}
            />

            <Location
              placeHolder="Liberation Road, Accra"
              error={errors.location?.message || ''}
              handleLocationValue={handleLocationValue}
              onBlur={() =>
                !location && setValue('location', '', { shouldTouch: true, shouldValidate: true })
              }
            />
          </>
        )}

        {role === Role.Patient && <NameFields register={register} errors={errors} />}

        <Input
          labelName="Email"
          error={errors.email?.message?.toString() || ''}
          placeholder="johndoe@gmail.com"
          {...register('email')}
        />
        {role !== Role.Admin && (
          <>
            <Input
              labelName="Password"
              type="password"
              error={errors.password?.message || ''}
              placeholder="***********************"
              enablePasswordToggle={true}
              {...register('password')}
            />
            <Input
              labelName="Confirm Password"
              type="password"
              error={errors.confirmPassword?.message || ''}
              placeholder="***********************"
              enablePasswordToggle={true}
              {...register('confirmPassword')}
            />
          </>
        )}

        <Button
          type="submit"
          className="mt-4 w-full"
          child={getFormTitle(role)}
          disabled={!isValid || isLoading}
          isLoading={isLoading}
        />
        <div className="text-center">
          <span>Already have an account?</span>
          <Link href="/login" className="pl-1 text-primary">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;

type NameFieldsProps = {
  register: UseFormRegister<ISignUp>;
  errors: FieldErrors;
};
const NameFields = ({ register, errors }: NameFieldsProps): JSX.Element => (
  <div className="mt-8 flex w-full flex-col items-baseline justify-center gap-8 md:w-full md:flex-row md:gap-2">
    <Input
      labelName="First Name"
      error={errors.firstName?.message?.toString() || ''}
      placeholder="John"
      {...register('firstName')}
    />
    <Input
      labelName="Last Name"
      error={errors.lastName?.message?.toString() || ''}
      placeholder="Doe"
      {...register('lastName')}
    />
  </div>
);

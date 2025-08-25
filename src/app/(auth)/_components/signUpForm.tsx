'use client';
import { Button } from '@/components/ui/button';
import { MODE } from '@/constants/constants';
import { emailSchema, nameSchema, requiredStringSchema } from '@/schemas/zod.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { ChangeEvent, JSX, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { AlertMessage } from '@/components/ui/alert';
import { IOrganizationRequest, IUserSignUp } from '@/types/auth.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { requestOrganization, signUp } from '@/lib/features/auth/authThunk';
import { selectThunkState } from '@/lib/features/auth/authSelector';
import { Role } from '@/types/shared.enum';
import { ImageVariant, Modal } from '@/components/ui/dialog';
import Location from '@/components/location/location';
import { Option } from 'react-google-places-autocomplete/build/types';
import { ISelected } from '@/components/ui/dropdown-menu';
import UserSignUp, { UserSignUpMethods } from '@/app/(auth)/_components/userSignUp';

const roleOptions: ISelected[] = [
  {
    label: 'Patient',
    value: Role.Patient,
  },
  { label: 'Doctor', value: Role.Doctor },
  { label: 'Organization', value: Role.Admin },
];

const SignUpForm = (): JSX.Element => {
  const userSignUpRef = useRef<UserSignUpMethods>(null);
  const organizationsSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    location: requiredStringSchema(),
    long: z.number(),
    lat: z.number(),
    gpsLink: requiredStringSchema(),
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<IOrganizationRequest>({
    resolver: zodResolver(organizationsSchema),
    mode: MODE.ON_TOUCH,
  });

  const location = watch('location');

  const dispatch = useAppDispatch();
  const [role, setRole] = useState<Role>(Role.Patient);
  const [successMessage, setSuccessMessage] = useState('');
  const { isLoading, errorMessage } = useAppSelector(selectThunkState);

  const onSubmit = async (userCredentials: IOrganizationRequest | IUserSignUp): Promise<void> => {
    let payload: unknown;
    setSuccessMessage('');
    if (role === Role.Admin && 'name' in userCredentials) {
      const { payload: organizationRequestResponse } = await dispatch(
        requestOrganization(userCredentials),
      );
      payload = organizationRequestResponse;
    } else if (role !== Role.Admin && 'firstName' in userCredentials) {
      const { payload: userSignUpResponse } = await dispatch(signUp({ ...userCredentials, role }));
      payload = userSignUpResponse;
    } else {
      return;
    }
    if (payload) {
      setSuccessMessage(String(payload));
      reset();
      userSignUpRef.current?.resetUserSignUp();
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

      const {
        geometry: { location },
        url,
      } = place;

      setValue('lat', location.lat());
      setValue('long', location.lng());
      setValue('gpsLink', url ?? '');
      setValue('location', value.description, {
        shouldValidate: true,
      });
    });
  };

  const handleRoleChange = ({ target }: ChangeEvent<HTMLInputElement>): void =>
    setRole(target.value as Role);

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
      <div className="mt-4 mb-5 flex justify-center space-x-6">
        {roleOptions.map(({ label, value }) => (
          <label key={value} className="flex items-center space-x-2">
            <input
              type="radio"
              value={value}
              className="accent-primary h-4 w-4"
              checked={role === value}
              onChange={handleRoleChange}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      {role !== Role.Admin && (
        <UserSignUp ref={userSignUpRef} role={role} isLoading={isLoading} submit={onSubmit} />
      )}
      {role === Role.Admin && (
        <>
          <AlertMessage
            message="This selection doesn&rsquo;t create an account automatically. We&rsquo;ll contact you
            after processing your request."
            title="Importance Notice"
            className="border-primary"
            titleClassName="font-semibold text-primary"
          />
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
            <Input
              labelName="Hospital's Name"
              error={'name' in errors ? errors.name?.message : ''}
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
            <Input
              labelName="Email"
              error={errors.email?.message}
              placeholder="johndoe@gmail.com"
              {...register('email')}
            />

            <Button
              type="submit"
              className="mt-4 w-full"
              child="Request Organization Access"
              disabled={!isValid || isLoading}
              isLoading={isLoading}
            />
          </form>
        </>
      )}
      <div className="mt-4 text-center">
        <span>Already have an account?</span>
        <Link href="/login" className="text-primary pl-1">
          Login
        </Link>
      </div>
    </div>
  );
};

export default SignUpForm;

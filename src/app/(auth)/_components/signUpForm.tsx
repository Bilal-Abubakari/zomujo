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
import { requestOrganization, signUp, initiateGoogleOAuth } from '@/lib/features/auth/authThunk';
import { selectThunkState } from '@/lib/features/auth/authSelector';
import { Role } from '@/types/shared.enum';
import { ImageVariant, Modal } from '@/components/ui/dialog';
import Location from '@/components/location/location';
import { Option } from 'react-google-places-autocomplete/build/types';
import { ISelected } from '@/components/ui/dropdown-menu';
import UserSignUp, { UserSignUpMethods } from '@/app/(auth)/_components/userSignUp';
import GoogleOAuthButton from '@/components/ui/googleOAuthButton';

const roleOptions: ISelected[] = [
  {
    label: 'Patient',
    value: Role.Patient,
  },
  { label: 'Doctor', value: Role.Doctor },
  // { label: 'Organization', value: Role.Admin }, TODO: Organization not part of MVP
];

export type SignUpFormProps = {
  hasBookingInfo: boolean;
  doctorId?: string;
  slotId?: string;
};

const SignUpForm = ({ hasBookingInfo, slotId, doctorId }: SignUpFormProps): JSX.Element => {
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
      const { payload: userSignUpResponse } = await dispatch(
        signUp({ ...userCredentials, role, doctorId, slotId }),
      );
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

  const handleGoogleSignUp = async (): Promise<void> => {
    await dispatch(initiateGoogleOAuth({ doctorId, slotId, role }));
  };

  const getRoleDescription = (roleValue: Role): string => {
    switch (roleValue) {
      case Role.Patient:
        return 'Book appointments and manage your health';
      case Role.Doctor:
        return 'Provide healthcare services and manage patients';
      case Role.Admin:
        return 'Manage your healthcare organization';
      default:
        return '';
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm overflow-y-auto">
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
      {!hasBookingInfo && (
        <div className="mb-6">
          <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">
            I want to sign up as a:
          </h3>
          <div className="space-y-3">
            {roleOptions.map(({ label, value }) => (
              <label
                key={value}
                className={`hover:border-primary hover:bg-primary/5 flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all ${
                  role === value ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value={value}
                    className="accent-primary h-5 w-5"
                    checked={role === value}
                    onChange={handleRoleChange}
                  />
                  <div>
                    <span className="block font-medium text-gray-900">{label}</span>
                    <span className="text-sm text-gray-500">
                      {getRoleDescription(value as Role)}
                    </span>
                  </div>
                </div>
                {role === value && (
                  <svg className="text-primary h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
      {role !== Role.Admin && (
        <>
          <GoogleOAuthButton
            onClick={handleGoogleSignUp}
            isLoading={isLoading}
            text="Sign up with Google"
          />
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-300"></div>
            <span className="text-sm text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>
          <UserSignUp
            ref={userSignUpRef}
            role={role}
            isLoading={isLoading}
            submit={onSubmit}
            hasBookingInfo={hasBookingInfo}
          />
        </>
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

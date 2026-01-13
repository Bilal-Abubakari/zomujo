'use client';
import { Button } from '@/components/ui/button';
import { MODE } from '@/constants/constants';
import { emailSchema, nameSchema, requiredStringSchema } from '@/schemas/zod.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { ChangeEvent, JSX, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { AlertMessage } from '@/components/ui/alert';
import { IOrganizationRequest, IUserSignUp, IHospitalSignUp } from '@/types/auth.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { requestOrganization, signUp, initiateGoogleOAuth, hospitalSignUp } from '@/lib/features/auth/authThunk';
import { selectThunkState } from '@/lib/features/auth/authSelector';
import { Role } from '@/types/shared.enum';
import { ImageVariant, Modal } from '@/components/ui/dialog';
import Location, { Option } from '@/components/location/location';
import { ISelected } from '@/components/ui/dropdown-menu';
import UserSignUp, { UserSignUpMethods } from '@/app/(auth)/_components/userSignUp';
import GoogleOAuthButton from '@/components/ui/googleOAuthButton';
import { useSearchParams } from 'next/navigation';
import { capitalize } from '@/lib/utils';
import { PLACEHOLDER_HOSPITAL_NAME } from '@/constants/branding.constant';

const roleOptions: ISelected[] = [
  {
    label: 'Patient',
    value: Role.Patient,
  },
  { label: 'Doctor', value: Role.Doctor },
  { label: 'Hospital', value: Role.Hospital },
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

  const hospitalSignUpSchema = z
    .object({
      email: emailSchema,
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string(),
      hospitalName: nameSchema,
      location: requiredStringSchema(),
      long: z.number(),
      lat: z.number(),
      gpsLink: requiredStringSchema(),
      phone: z.string().optional(),
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');

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

  const {
    register: registerHospital,
    handleSubmit: handleSubmitHospital,
    watch: watchHospital,
    setValue: setValueHospital,
    trigger: triggerHospital,
    formState: { errors: errorsHospital, isValid: isValidHospital },
  } = useForm<IHospitalSignUp>({
    resolver: zodResolver(hospitalSignUpSchema),
    mode: MODE.ON_TOUCH,
  });

  const location = watch('location');
  const hospitalLocation = watchHospital('location');

  const dispatch = useAppDispatch();
  const [role, setRole] = useState<Role>(Role.Patient);
  const [successMessage, setSuccessMessage] = useState('');
  const { isLoading, isOAuthLoading, errorMessage } = useAppSelector(selectThunkState);

  const onSubmit = async (userCredentials: IOrganizationRequest | IUserSignUp): Promise<void> => {
    let payload: unknown;
    setSuccessMessage('');
    if (role === Role.Admin && 'name' in userCredentials) {
      const formattedCredentials = {
        ...userCredentials,
        name: capitalize(userCredentials.name.trim()),
      };
      const { payload: organizationRequestResponse } = await dispatch(
        requestOrganization(formattedCredentials),
      );
      payload = organizationRequestResponse;
    } else if (role !== Role.Admin && role !== Role.Hospital && 'firstName' in userCredentials) {
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

  const onHospitalSubmit = async (hospitalCredentials: IHospitalSignUp): Promise<void> => {
    setSuccessMessage('');
    const formattedCredentials = {
      ...hospitalCredentials,
      hospitalName: capitalize(hospitalCredentials.hospitalName.trim()),
    };
    const { payload } = await dispatch(hospitalSignUp(formattedCredentials));
    if (payload) {
      // Hospital sign-up logs in automatically, redirect to dashboard
      window.location.href = '/dashboard';
      return;
    }
    setOpenModal(true);
  };

  const [openModal, setOpenModal] = useState(false);
  
  // Dummy GPS coordinates for different locations
  const DUMMY_COORDINATES: Record<string, { lat: number; lng: number; url: string }> = {
    '1': { lat: 5.6037, lng: -0.1870, url: 'https://maps.google.com/?q=Liberation+Road+Accra' },
    '2': { lat: 5.5558, lng: -0.1969, url: 'https://maps.google.com/?q=Osu+Accra' },
    '3': { lat: 5.6698, lng: -0.0166, url: 'https://maps.google.com/?q=Tema+Ghana' },
    '4': { lat: 6.6885, lng: -1.6244, url: 'https://maps.google.com/?q=Kumasi+Ghana' },
    '5': { lat: 4.8845, lng: -1.7554, url: 'https://maps.google.com/?q=Takoradi+Ghana' },
  };
  
  const handleLocationValue = ({ value }: Option): void => {
    const placeId = value.place_id;
    const coords = DUMMY_COORDINATES[placeId] || DUMMY_COORDINATES['1'];
    
    setValue('lat', coords.lat);
    setValue('long', coords.lng);
    setValue('gpsLink', coords.url);
    setValue('location', value.description, {
      shouldValidate: true,
    });
  };

  const handleHospitalLocationValue = ({ value }: Option): void => {
    const placeId = value.place_id;
    const coords = DUMMY_COORDINATES[placeId] || DUMMY_COORDINATES['1'];
    
    setValueHospital('lat', coords.lat);
    setValueHospital('long', coords.lng);
    setValueHospital('gpsLink', coords.url);
    setValueHospital('location', value.description, {
      shouldValidate: true,
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
      case Role.Hospital:
        return 'Manage hospital operations and view appointments';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (roleParam) {
      setRole(roleParam as Role);
    }
  }, [roleParam]);

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
      {role !== Role.Admin && role !== Role.Hospital && (
        <>
          <GoogleOAuthButton
            onClick={handleGoogleSignUp}
            isLoading={isOAuthLoading}
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
      {role === Role.Hospital && (
        <>
          <form onSubmit={handleSubmitHospital(onHospitalSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Input
                labelName="Email"
                error={errorsHospital.email?.message}
                placeholder="admin@hospital.com"
                {...registerHospital('email')}
              />
              <Input
                labelName="Password"
                error={errorsHospital.password?.message}
                placeholder="••••••••"
                type="password"
                {...registerHospital('password')}
              />
              <Input
                labelName="Confirm Password"
                error={errorsHospital.confirmPassword?.message}
                placeholder="••••••••"
                type="password"
                {...registerHospital('confirmPassword')}
              />
              <Input
                labelName="Hospital Name"
                error={errorsHospital.hospitalName?.message}
                placeholder={PLACEHOLDER_HOSPITAL_NAME}
                {...registerHospital('hospitalName')}
              />
              <Location
                placeHolder="Liberation Road, Accra"
                error={errorsHospital.location?.message || ''}
                value={hospitalLocation || ''}
                onChange={(value) => {
                  setValueHospital('location', value, { shouldValidate: true });
                  // Set default coordinates if not already set (when typing directly)
                  const currentLat = watchHospital('lat');
                  const currentLong = watchHospital('long');
                  const currentGpsLink = watchHospital('gpsLink');
                  if (currentLat === undefined || currentLong === undefined || !currentGpsLink) {
                    // Use default coordinates from first location
                    const defaultCoords = DUMMY_COORDINATES['1'];
                    setValueHospital('lat', defaultCoords.lat, { shouldValidate: true });
                    setValueHospital('long', defaultCoords.lng, { shouldValidate: true });
                    setValueHospital('gpsLink', defaultCoords.url, { shouldValidate: true });
                    // Trigger validation for all location-related fields
                    setTimeout(() => {
                      triggerHospital(['location', 'lat', 'long', 'gpsLink']);
                    }, 0);
                  }
                }}
                handleLocationValue={handleHospitalLocationValue}
                onBlur={() => {
                  if (!hospitalLocation) {
                    setValueHospital('location', '', { shouldTouch: true, shouldValidate: true });
                  }
                }}
              />
              <Input
                labelName="Phone (Optional)"
                error={errorsHospital.phone?.message}
                placeholder="+233 24 123 4567"
                {...registerHospital('phone')}
              />
            </div>
            <Button
              type="submit"
              className="mt-4 w-full"
              child="Create Hospital Account"
              disabled={!isValidHospital || isLoading}
              isLoading={isLoading}
            />
          </form>
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
              placeholder={PLACEHOLDER_HOSPITAL_NAME}
              {...register('name')}
            />

            <Location
              placeHolder="Liberation Road, Accra"
              error={errors.location?.message || ''}
              value={location || ''}
              onChange={(value) => {
                setValue('location', value, { shouldValidate: true });
              }}
              handleLocationValue={handleLocationValue}
              onBlur={() => {
                if (!location) {
                  setValue('location', '', { shouldTouch: true, shouldValidate: true });
                }
              }}
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

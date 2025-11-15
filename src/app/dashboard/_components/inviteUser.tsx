'use client';
import { emailSchema, requiredStringSchema } from '@/schemas/zod.schemas';
import { MODE } from '@/constants/constants';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { JSX } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IBaseUser } from '@/types/auth.interface';
import { capitalize } from '@/lib/utils';

type InviteUserProps = {
  title: string;
  isLoading?: boolean;
  submit: (inviteUser: IBaseUser) => void;
  buttonTitle: string;
};

const InviteUser = ({ isLoading, submit, title, buttonTitle }: InviteUserProps): JSX.Element => {
  const inviteDoctorSchema = z.object({
    firstName: requiredStringSchema(),
    lastName: requiredStringSchema(),
    email: emailSchema,
  });
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<IBaseUser>({
    resolver: zodResolver(inviteDoctorSchema),
    mode: MODE.ON_TOUCH,
  });

  const onSubmit = (userData: IBaseUser): void => {
    const formattedUserData = {
      ...userData,
      firstName: capitalize(userData.firstName.trim()),
      lastName: capitalize(userData.lastName.trim()),
    };
    submit(formattedUserData);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-5 flex flex-col items-center justify-center space-y-8"
    >
      <h2 className="text-center text-2xl font-bold">{title}</h2>
      <Input
        labelName="First Name"
        error={errors.firstName?.message || ''}
        placeholder="John"
        {...register('firstName')}
      />
      <Input
        labelName="Last Name"
        error={errors.lastName?.message || ''}
        placeholder="Doe"
        {...register('lastName')}
      />
      <Input
        labelName="Email"
        error={errors.email?.message || ''}
        placeholder="johndoe@gmail.com"
        {...register('email')}
      />
      <Button
        type="submit"
        className="mt-4 w-full max-w-sm"
        child={buttonTitle}
        disabled={!isValid || isLoading}
        isLoading={isLoading}
      />
    </form>
  );
};

export default InviteUser;

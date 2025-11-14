import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema } from '@/schemas/zod.schemas';
import { MODE, unMatchingPasswords } from '@/constants/constants';
import { useForm } from 'react-hook-form';
import { IUserSignUp } from '@/types/auth.interface';
import { Role } from '@/types/shared.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import React, { forwardRef, JSX, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { capitalize } from '@/lib/utils';

type UserSignUpProps = {
  role: Role;
  isLoading: boolean;
  submit: (userCredentials: IUserSignUp) => void;
  hasBookingInfo: boolean;
};

export type UserSignUpMethods = {
  resetUserSignUp: () => void;
};
const UserSignUp = forwardRef<UserSignUpMethods, UserSignUpProps>(
  ({ submit, role, isLoading, hasBookingInfo }, ref): JSX.Element => {
    const usersSchema = z
      .object({
        firstName: nameSchema,
        lastName: nameSchema,
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: passwordSchema,
      })
      .refine(({ password, confirmPassword }) => password === confirmPassword, {
        message: unMatchingPasswords,
        path: ['confirmPassword'],
      });

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isValid },
    } = useForm<IUserSignUp>({
      resolver: zodResolver(usersSchema),
      mode: MODE.ON_TOUCH,
    });

    useImperativeHandle(ref, () => ({
      resetUserSignUp(): void {
        reset();
      },
    }));

    const onSubmit = async (userCredentials: IUserSignUp): Promise<void> => {
      const formattedCredentials = {
        ...userCredentials,
        firstName: capitalize(userCredentials.firstName.trim()),
        lastName: capitalize(userCredentials.lastName.trim()),
      };
      submit(formattedCredentials);
    };

    const getFormTitle = (): string => {
      if (hasBookingInfo) {
        return 'Continue Booking';
      }
      if (role === Role.Doctor) {
        return 'Sign Up as Doctor';
      }
      return 'Sign Up as Patient';
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6 md:space-y-8">
        <Input
          labelName="First Name"
          error={errors.firstName?.message?.toString()}
          placeholder="John"
          {...register('firstName')}
        />
        <Input
          labelName="Last Name"
          error={errors.lastName?.message?.toString()}
          placeholder="Doe"
          {...register('lastName')}
        />
        <Input
          labelName="Email"
          error={errors.email?.message?.toString()}
          placeholder="johndoe@gmail.com"
          {...register('email')}
        />
        <Input
          labelName="Password"
          type="password"
          error={errors.password?.message}
          placeholder="***********************"
          enablePasswordToggle={true}
          {...register('password')}
        />
        <Input
          labelName="Confirm Password"
          type="password"
          error={errors.confirmPassword?.message}
          placeholder="***********************"
          enablePasswordToggle={true}
          {...register('confirmPassword')}
        />
        <Button
          type="submit"
          className="mt-4 w-full"
          child={getFormTitle()}
          disabled={!isValid || isLoading}
          isLoading={isLoading}
        />
      </form>
    );
  },
);

UserSignUp.displayName = 'UserSignUp';

export default UserSignUp;

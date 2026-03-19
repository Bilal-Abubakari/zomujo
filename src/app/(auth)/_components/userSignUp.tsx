import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema } from '@/schemas/zod.schemas';
import { MODE, unMatchingPasswords } from '@/constants/constants';
import { useForm, Controller } from 'react-hook-form';
import { IUserSignUp } from '@/types/auth.interface';
import { Role } from '@/types/shared.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import React, { forwardRef, JSX, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { capitalize } from '@/lib/utils';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

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
        consentAccepted: z.boolean().refine((val) => val === true, {
          message: 'You must accept the Terms & Conditions and Privacy Policy to continue.',
        }),
      })
      .refine(({ password, confirmPassword }) => password === confirmPassword, {
        message: unMatchingPasswords,
        path: ['confirmPassword'],
      });

    type UserSignUpFormValues = z.infer<typeof usersSchema>;

    const {
      register,
      handleSubmit,
      reset,
      control,
      formState: { errors, isValid },
    } = useForm<UserSignUpFormValues>({
      resolver: zodResolver(usersSchema),
      mode: MODE.ON_TOUCH,
      defaultValues: { consentAccepted: false },
    });

    useImperativeHandle(ref, () => ({
      resetUserSignUp(): void {
        reset();
      },
    }));

    const onSubmit = async (userCredentials: UserSignUpFormValues): Promise<void> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { consentAccepted: _, ...rest } = userCredentials;
      const formattedCredentials: IUserSignUp = {
        ...rest,
        firstName: capitalize(rest.firstName.trim()),
        lastName: capitalize(rest.lastName.trim()),
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

        {/* Consent checkbox — required before submitting */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-3">
            <Controller
              name="consentAccepted"
              control={control}
              render={({ field }): JSX.Element => (
                <Checkbox
                  id="consentAccepted"
                  className="mt-0.5 shrink-0"
                  checked={field.value}
                  onCheckedChange={(checked): void => field.onChange(checked === true)}
                />
              )}
            />
            <label
              htmlFor="consentAccepted"
              className="text-foreground cursor-pointer text-xs leading-relaxed"
            >
              I confirm that I have read, understood, and agree to be bound by the{' '}
              <Link
                href="/terms-conditions"
                className="text-primary font-medium underline-offset-2 hover:underline"
                target="_blank"
              >
                Terms &amp; Conditions
              </Link>{' '}
              and acknowledge that I have read and accept the{' '}
              <Link
                href="/privacy-policy"
                className="text-primary font-medium underline-offset-2 hover:underline"
                target="_blank"
              >
                Privacy &amp; Data Protection Policy
              </Link>{' '}
              of Fornix Labs Limited.
            </label>
          </div>
          {errors.consentAccepted && (
            <p className="text-destructive text-xs">{errors.consentAccepted.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="mt-2 w-full"
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

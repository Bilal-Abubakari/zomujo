'use client';
import React, { useState, JSX } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MODE } from '@/constants/constants';
import { passwordSchema } from '@/schemas/zod.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IUpdatePassword } from '@/types/auth.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { deleteAccount, updatePassword } from '@/lib/features/auth/authThunk';
import { toast } from '@/hooks/use-toast';
import { Confirmation, ConfirmationProps } from '@/components/ui/dialog';
import { BRANDING } from '@/constants/branding.constant';
import { selectIsOAuthOnly } from '@/lib/features/auth/authSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const GoogleIcon = (): JSX.Element => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

const SecurityInfo = (): JSX.Element => {
  const PasswordUpdateSchema = z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IUpdatePassword>({
    resolver: zodResolver(PasswordUpdateSchema),
    mode: MODE.ON_TOUCH,
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const [isConfirmationLoading, setIsConfirmationLoading] = useState(false);
  const isOAuth = useAppSelector(selectIsOAuthOnly);

  async function onSubmit(userCredentials: IUpdatePassword): Promise<void> {
    setIsLoading(true);
    const { payload } = await dispatch(updatePassword(userCredentials));

    if (payload) {
      toast(payload);
    }
    setIsLoading(false);
  }

  async function handleDeleteAccount(): Promise<void> {
    setIsConfirmationLoading(true);
    const { payload } = await dispatch(deleteAccount());
    if (payload) {
      toast(payload);
    }
    setIsConfirmationLoading(false);
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Security</h2>
        <p className="text-gray-500"> Change your profile</p>
        <hr className="my-7 gap-4" />
      </div>
      {isOAuth ? (
        <Card className="max-w-158.75 border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <GoogleIcon />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-base font-semibold text-gray-900">
                Connected with Google
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                You used Google to sign in to your account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2 pt-4">
              <Info className="mt-0.5 h-4 w-4 text-blue-500" />
              <p className="text-sm text-gray-600">
                Since you logged in with Google, you don&apos;t need a password to access your
                account. You can manage your Google security settings directly through your Google
                Account.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form className="flex w-full max-w-158.75 flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
          <Input
            labelName="Current Password"
            className="bg-transparent"
            wrapperClassName="max-w-none"
            placeholder="*****************"
            enablePasswordToggle={true}
            {...register('currentPassword')}
            error={errors.currentPassword?.message || ''}
          />
          <Input
            labelName="New Password"
            className="bg-transparent"
            wrapperClassName="max-w-none"
            placeholder="*****************"
            enablePasswordToggle={true}
            {...register('newPassword')}
            error={errors.newPassword?.message || ''}
          />

          <Input
            labelName="Confirm Password"
            className="bg-transparent"
            wrapperClassName="max-w-none"
            placeholder="*****************"
            enablePasswordToggle={true}
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message || ''}
          />
          <Button
            child="Save Changes"
            className="mt-12 ml-auto flex"
            disabled={!isValid || isLoading}
            isLoading={isLoading}
          />
        </form>
      )}
      <hr className="my-8" />

      <div className="flex max-w-158.75 flex-wrap items-center justify-between">
        <div>
          <h2 className="font-bold">Delete account</h2>
          <p className="text-xs text-gray-500 sm:max-w-74.25">
            We&rsquo;ll delete your account and data permanently. Thanks for being part of{' '}
            {BRANDING.APP_NAME}! You&rsquo;re always welcome back if you change your mind.
          </p>
        </div>
        <div className="flex gap-2 pt-3 pb-28 sm:pt-0 sm:pb-0">
          <Button
            child={'Delete account'}
            variant={'destructive'}
            onClick={() => {
              setConfirmation((prev) => ({
                ...prev,
                open: true,
                acceptCommand(): void {
                  handleDeleteAccount();
                },
                acceptButtonTitle: 'Yes Delete Account',
                description:
                  'Are you sure you want to delete account, this action is Irreversible?',
                rejectCommand(): void {
                  setConfirmation((prev) => ({
                    ...prev,
                    open: false,
                  }));
                },
              }));
            }}
          />
          <Button child={'Learn more'} variant={'outline'} />
        </div>
      </div>
      <Confirmation
        {...confirmation}
        showClose={true}
        setState={() =>
          setConfirmation((prev) => ({
            ...prev,
            open: false,
          }))
        }
        isLoading={isConfirmationLoading}
      />
    </>
  );
};
export default SecurityInfo;

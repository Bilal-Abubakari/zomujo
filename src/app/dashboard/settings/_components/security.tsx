'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MODE } from '@/constants/constants';
import { passwordSchema } from '@/schemas/zod.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { JSX } from 'react';
import { z } from 'zod';
import { IUpdatePassword } from '@/types/auth.interface';
import { useAppDispatch } from '@/lib/hooks';
import { deleteAccount, updatePassword } from '@/lib/features/auth/authThunk';
import { toast } from '@/hooks/use-toast';
import { Confirmation, ConfirmationProps } from '@/components/ui/dialog';

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
      <form className="flex w-full max-w-[635px] flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
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
      <hr className="my-8" />

      <div className="flex max-w-[635px] flex-wrap items-center justify-between">
        <div>
          <h2 className="font-bold">Delete account</h2>
          <p className="text-xs text-gray-500 sm:max-w-[297px]">
            We&rsquo;ll delete your account and data permanently. Thanks for being part of Zomujo!
            You&rsquo;re always welcome back if you change your mind.
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

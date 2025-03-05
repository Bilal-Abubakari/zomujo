'use client';
import { Button } from '@/components/ui/button';
import { ImageVariant, Modal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MODE, unMatchingPasswords } from '@/constants/constants';
import { selectThunkState } from '@/lib/features/auth/authSelector';
import { resetPassword } from '@/lib/features/auth/authThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { passwordSchema, requiredStringSchema } from '@/schemas/zod.schemas';
import { IResetPassword } from '@/types/auth.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { JSX, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const ResetPasswordForm = (): JSX.Element => {
  const ResetPasswordSchema = z
    .object({
      newPassword: passwordSchema,
      confirmPassword: passwordSchema,
      token: requiredStringSchema(),
    })
    .refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
      message: unMatchingPasswords,
      path: ['confirmPassword'],
    });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<IResetPassword>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: MODE.ON_TOUCH,
  });

  const dispatch = useAppDispatch();
  const [successMessage, setSuccessMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const { isLoading, errorMessage } = useAppSelector(selectThunkState);

  const onSubmit = async (passwordCredentials: IResetPassword): Promise<void> => {
    const { payload } = await dispatch(resetPassword(passwordCredentials));
    if (payload) {
      setSuccessMessage(String(payload));
      reset();
    }

    setOpenModal(true);
  };

  const params = useParams();

  useEffect(() => {
    setValue('token', String(params.token), {
      shouldValidate: true,
      shouldTouch: true,
    });
  }, [params, setValue]);

  return (
    <>
      <Modal
        open={openModal}
        content={successMessage ? <SuccessMessage message={successMessage} /> : errorMessage}
        showImage={true}
        imageVariant={successMessage ? ImageVariant.Success : ImageVariant.Error}
        showClose={true}
        setState={setOpenModal}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-8 flex flex-col items-center justify-center gap-8">
          <Input
            labelName="Password"
            type="password"
            error={errors.newPassword?.message || ''}
            placeholder="************************"
            {...register('newPassword')}
            enablePasswordToggle={true}
          />
          <Input
            labelName="Confirm Password"
            type="password"
            error={errors.confirmPassword?.message || ''}
            placeholder="************************"
            {...register('confirmPassword')}
            enablePasswordToggle={true}
          />
          <Button
            child="Reset Password"
            disabled={!isValid || isLoading}
            className="w-full max-w-sm"
            isLoading={isLoading}
          />
        </div>
      </form>
    </>
  );
};

export default ResetPasswordForm;

export const SuccessMessage = ({ message }: { message: string }): JSX.Element => (
  <div className="flex flex-col gap-2">
    {message}
    <Link href="/login">
      <Button child="Login"></Button>
    </Link>
  </div>
);

'use client';
import { Button } from '@/components/ui/button';
import { ImageVariant, Modal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MODE } from '@/constants/constants';
import { selectThunkState } from '@/lib/features/auth/authSelector';
import { forgotPassword } from '@/lib/features/auth/authThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { emailSchema } from '@/schemas/zod.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface IForgotPassword {
  email: string;
}
const ForgetPasswordForm = (): JSX.Element => {
  const ForgotPasswordSchema = z.object({
    email: emailSchema(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<IForgotPassword>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: MODE.ON_TOUCH,
  });
  const [openModal, setOpenModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, errorMessage } = useAppSelector(selectThunkState);

  const onSubmit = async ({ email }: IForgotPassword): Promise<void> => {
    const { payload } = await dispatch(forgotPassword(email));
    if (payload) {
      setSuccessMessage(String(payload));
      reset();
    }

    setOpenModal(true);
  };

  return (
    <>
      <Modal
        open={openModal}
        content={successMessage || errorMessage}
        showImage={true}
        imageVariant={successMessage ? ImageVariant.Email : ImageVariant.Error}
        showClose={true}
        setState={setOpenModal}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-8 flex flex-col items-center justify-center gap-8">
          <Input
            labelName="Email"
            type="email"
            error={errors.email?.message || ''}
            placeholder="johndoe@gmail.com"
            {...register('email')}
          />
          <Button
            child="Continue"
            className="w-full max-w-sm"
            isLoading={isLoading}
            disabled={!isValid || isLoading}
          />

          <div>
            <Link href="/login" className="flex pl-2 text-primary">
              <ArrowLeft /> Back
            </Link>
          </div>
        </div>
      </form>
    </>
  );
};

export default ForgetPasswordForm;

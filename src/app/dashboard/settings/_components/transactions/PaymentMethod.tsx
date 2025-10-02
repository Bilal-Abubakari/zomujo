'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MODE } from '@/constants/constants';
import { Toast, toast } from '@/hooks/use-toast';
import { selectExtra } from '@/lib/features/auth/authSelector';
import {
  addPaymentsDetails,
  getBanks,
  updatePaymentsDetails,
} from '@/lib/features/payments/paymentsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { dataCompletionToast } from '@/lib/utils';
import {
  booleanSchema,
  nameSchema,
  phoneOrCardNumberSchema,
  requiredStringSchema,
} from '@/schemas/zod.schemas';
import { ICreatePaymentDetails, IPaymentDetails } from '@/types/payment.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { JSX, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Combobox } from '@/components/ui/select';
import { AlertMessage } from '@/components/ui/alert';
import { selectBankOptions, selectPayments } from '@/lib/features/payments/paymentSelector';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { IDoctor } from '@/types/doctor.interface';

type PaymentInfoWithoutType = Omit<ICreatePaymentDetails, 'type'>;

const paymentMethodSchema = z.object({
  reference: nameSchema,
  accountNumber: phoneOrCardNumberSchema,
  bankCode: requiredStringSchema(),
  isDefault: booleanSchema,
});

type PaymentMethodProps = {
  closeModal?: () => void;
  paymentDetails?: IPaymentDetails | null;
};

const PaymentMethod = ({ closeModal, paymentDetails }: PaymentMethodProps): JSX.Element => {
  const router = useRouter();
  const doctorInfo = useAppSelector(selectExtra) as IDoctor;
  const isEditMode = !!paymentDetails;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<PaymentInfoWithoutType>({
    resolver: zodResolver(paymentMethodSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      reference: paymentDetails?.reference || '',
      accountNumber: paymentDetails?.accountNumber || '',
      bankCode: paymentDetails?.bankCode || '',
      isDefault: paymentDetails?.isDefault || false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const { errorMessage, banks, isLoadingBanks } = useAppSelector(selectPayments);
  const bankOptions = useAppSelector(selectBankOptions);
  const dispatch = useAppDispatch();

  const redirectToProfileSetup = (): void => {
    if (!isEditMode) {
      if (!doctorInfo?.bio) {
        router.push('/dashboard/settings');
        toast(dataCompletionToast('profile'));
        return;
      }
      if (!doctorInfo?.fee) {
        router.push('/dashboard/settings/payment?tab=pricing');
        toast(dataCompletionToast('pricing'));
      }
    }
  };

  async function handleFormSubmit(formData: PaymentInfoWithoutType): Promise<void> {
    setIsLoading(true);
    let payload: unknown;
    const { type } = banks.find(({ code }) => code === formData.bankCode)!; // If bank doesn't exist user cannot select;
    const paymentData = { ...formData, type };
    if (isEditMode) {
      const { payload: editResponse } = await dispatch(
        updatePaymentsDetails({
          ...paymentData,
          id: paymentDetails.id,
        }),
      );
      payload = editResponse;
    } else {
      const { payload: addResponse } = await dispatch(addPaymentsDetails(paymentData));
      payload = addResponse;
    }

    if (payload) {
      const toastData = payload as Toast;
      toast(toastData);
      if (toastData.variant === 'success') {
        closeModal?.();
        redirectToProfileSetup();
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (!banks.length) {
      dispatch(getBanks());
    }
  }, []);

  return (
    <div>
      <p className="text-2xl font-bold"> {isEditMode ? 'Edit' : 'Add'} Method</p>
      <hr className="my-6" />
      {errorMessage && (
        <AlertMessage message={errorMessage} className="max-w-sm" variant="destructive" />
      )}
      <form
        className="flex flex-col gap-8"
        onSubmit={handleSubmit((formFiledValues) => handleFormSubmit(formFiledValues))}
      >
        <Input
          labelName="Enter Account Name"
          wrapperClassName="max-w-none"
          error={errors.reference?.message}
          {...register('reference')}
        />
        <Combobox
          isLoading={isLoadingBanks}
          onChange={(value) => setValue('bankCode', value, { shouldValidate: true })}
          options={bankOptions}
          value={watch('bankCode')}
          label="Select Bank"
          placeholder="Select Your Bank"
          searchPlaceholder="Search Bank..."
        />
        <Input
          labelName="Account Number"
          wrapperClassName="max-w-none"
          type="number"
          {...register('accountNumber')}
          error={errors.accountNumber?.message}
        />
        <div className="flex flex-row">
          <Checkbox
            labelClassName="text-gray-500"
            {...register('isDefault')}
            labelName="Make Default Payment"
            checked={watch('isDefault')}
            onCheckedChange={(checked) => setValue('isDefault', Boolean(checked))}
          />
        </div>
        <div className="flex justify-end">
          <Button child="Save" disabled={!isValid} isLoading={isLoading} />
        </div>
      </form>
    </div>
  );
};

export default PaymentMethod;

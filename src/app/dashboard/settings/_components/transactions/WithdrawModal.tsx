'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/select';
import { AlertMessage } from '@/components/ui/alert';
import { Toast, toast } from '@/hooks/use-toast';
import { MODE } from '@/constants/constants';
import { getPaymentDetails, withdrawFunds } from '@/lib/features/payments/paymentsThunk';
import { useAppDispatch } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import { IPaymentDetails } from '@/types/payment.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { JSX, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const withdrawSchema = z.object({
  methodId: z.string().min(1, 'Please select a payment method'),
  amount: z.number({ error: 'Amount must be a number' }).positive('Amount must be greater than 0'),
});

type WithdrawFormData = z.infer<typeof withdrawSchema>;

type WithdrawModalProps = {
  walletAmount: number;
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
};

const WithdrawModal = ({
  walletAmount,
  userId,
  onSuccess,
  onClose,
}: WithdrawModalProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentDetails[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    mode: MODE.ON_TOUCH,
  });

  const fetchPaymentMethods = async (): Promise<void> => {
    setIsLoadingMethods(true);
    const { payload } = await dispatch(getPaymentDetails(userId));
    if (payload && showErrorToast(payload)) {
      toast(payload as Toast);
      setErrorMessage('Failed to load payment methods');
      setIsLoadingMethods(false);
      return;
    }
    setPaymentMethods(payload as IPaymentDetails[]);
    setIsLoadingMethods(false);
  };

  useEffect(() => {
    void fetchPaymentMethods();
  }, []);

  const handleFormSubmit = async (formData: WithdrawFormData): Promise<void> => {
    if (formData.amount > walletAmount) {
      toast({
        title: 'Invalid Amount',
        description: `Amount cannot exceed your available balance of GHS ${walletAmount.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const response = await dispatch(withdrawFunds(formData)).unwrap();
    toast(response);
    if (!showErrorToast(response)) {
      onSuccess();
    }
    setIsLoading(false);
  };

  const paymentMethodOptions = paymentMethods.map((method) => ({
    label: `${method.reference} - ${method.accountNumber}`,
    value: method.id,
  }));

  return (
    <div>
      <p className="text-2xl font-bold">Withdraw Funds</p>
      <hr className="my-6" />
      {errorMessage && (
        <AlertMessage message={errorMessage} className="mb-4" variant="destructive" />
      )}
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit((formData) => handleFormSubmit(formData))}
      >
        <div>
          <p className="mb-2 text-sm text-gray-600">
            Available Balance: <span className="font-semibold">GHS {walletAmount.toFixed(2)}</span>
          </p>
        </div>

        <Combobox
          isLoading={isLoadingMethods}
          onChange={(value) => setValue('methodId', value, { shouldValidate: true })}
          options={paymentMethodOptions}
          value={watch('methodId') || ''}
          label="Select Payment Method"
          placeholder="Choose payment method"
          searchPlaceholder="Search payment methods..."
        />

        <Input
          labelName="Enter Amount"
          wrapperClassName="max-w-none"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
        />

        <div className="flex justify-end gap-4">
          <Button
            child="Cancel"
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          />
          <Button child="Withdraw" disabled={!isValid || isLoadingMethods} isLoading={isLoading} />
        </div>
      </form>
    </div>
  );
};

export default WithdrawModal;

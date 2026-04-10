'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/select';
import { AlertMessage } from '@/components/ui/alert';
import { Toast, toast } from '@/hooks/use-toast';
import { MODE } from '@/constants/constants';
import { getPaymentDetails, withdrawFunds } from '@/lib/features/payments/paymentsThunk';
import { useAppDispatch } from '@/lib/hooks';
import { ghcToPesewas, showErrorToast } from '@/lib/utils';
import { IPaymentDetails } from '@/types/payment.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { JSX, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PESEWAS_PER_CEDI } from '@/constants/payment.constants';
import { Info } from 'lucide-react';

const WITHDRAWAL_FEES: Record<string, number> = {
  mobile_money: 1,
  ghipss: 8,
};

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
        description: `Amount cannot exceed your available balance of GHS ${(walletAmount / PESEWAS_PER_CEDI).toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const response = await dispatch(
      withdrawFunds({
        ...formData,
        amount: ghcToPesewas(formData.amount),
      }),
    ).unwrap();
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

  const selectedMethod = paymentMethods.find((m) => m.id === watch('methodId'));
  const processingFee = selectedMethod ? WITHDRAWAL_FEES[selectedMethod.type] : null;

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
            Available Balance:{' '}
            <span className="font-semibold">
              GHS {(walletAmount / PESEWAS_PER_CEDI).toFixed(2)}
            </span>
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

        {processingFee === null ? (
          <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
            <Info size={13} className="mt-0.5 shrink-0" />
            <p>
              Processing fees apply: <span className="font-semibold">GHS 1.00</span> for Mobile
              Money and <span className="font-semibold">GHS 8.00</span> for bank transfers.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
            <Info size={13} className="mt-0.5 shrink-0" />
            <p>
              A processing fee of <span className="font-semibold">GHS {processingFee}.00</span>{' '}
              applies to {selectedMethod?.type === 'mobile_money' ? 'Mobile Money' : 'bank'}{' '}
              withdrawals. The fee will be deducted from the withdrawn amount.
            </p>
          </div>
        )}

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

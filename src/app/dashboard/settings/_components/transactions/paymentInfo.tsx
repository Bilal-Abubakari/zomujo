'use client';
import { CardPayment, MobileMoney } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MODE } from '@/constants/constants';
import { toast } from '@/hooks/use-toast';
import { selectUserId } from '@/lib/features/auth/authSelector';
import {
  addPaymentsDetails,
  getBanks,
  getPaymentDetails,
} from '@/lib/features/payments/paymentsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import {
  booleanSchema,
  nameSchema,
  phoneOrCardNumberSchema,
  requiredStringSchema,
} from '@/schemas/zod.schemas';
import { CardProps, PaymentDetails } from '@/types/payment.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Combobox } from '@/components/ui/select';
import { AlertMessage } from '@/components/ui/alert';
import { selectBankOptions, selectPayments } from '@/lib/features/payments/paymentSelector';
import { Checkbox } from '@/components/ui/checkbox';

const PaymentInfo = (): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const [userPaymentDetails, setUserPaymentDetails] = useState<PaymentDetails[]>([]);

  useEffect(() => {
    const paymentDetails = async (): Promise<void> => {
      const { payload } = await dispatch(getPaymentDetails(userId!));
      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }
      setUserPaymentDetails(payload as PaymentDetails[]);
    };
    void paymentDetails();
  }, [isModalOpen]);

  return (
    <>
      <div className="flex flex-wrap gap-6">
        {userPaymentDetails.map(({ reference, accountNumber, type }) => (
          <Card name={reference} number={accountNumber} type={type} key={accountNumber} />
        ))}

        <div
          className="flex h-[139px] w-[139px] cursor-pointer items-center justify-center rounded-[7.32px] border border-dashed text-gray-500"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus />
        </div>
      </div>
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          content={<PaymentMethod key={'paymentMethod'} closeModal={() => setIsModalOpen(false)} />}
          showClose={true}
          setState={setIsModalOpen}
        />
      )}
    </>
  );
};

export default PaymentInfo;

const Card = ({ number, name, type }: CardProps): JSX.Element => (
  <div className="flex h-[139px] w-[139px] flex-col items-start justify-center rounded-[7.32px] border pl-4">
    <Image src={type === 'bank' ? CardPayment : MobileMoney} alt={type} />
    <p className="mt-4 w-28 truncate font-bold"> {name}</p>
    <p className="truncate text-[12px] font-bold text-gray-400"> {number}</p>
  </div>
);

const paymentMethodSchema = z.object({
  reference: nameSchema,
  accountNumber: phoneOrCardNumberSchema,
  bankCode: requiredStringSchema(),
  isDefault: booleanSchema,
});

type PaymentMethodProps = {
  closeModal?: () => void;
};
const PaymentMethod = ({ closeModal }: PaymentMethodProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<PaymentDetails>({
    resolver: zodResolver(paymentMethodSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      isDefault: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const { errorMessage, banks, isLoadingBanks } = useAppSelector(selectPayments);
  const bankOptions = useAppSelector(selectBankOptions);
  const dispatch = useAppDispatch();

  async function handleFormSubmit(formData: PaymentDetails): Promise<void> {
    setIsLoading(true);
    const { type } = banks.find(({ code }) => code === formData.bankCode)!; // If bank doesn't exist user cannot select;
    const { payload } = await dispatch(addPaymentsDetails({ ...formData, type }));

    if (payload) {
      toast(payload);
    } else {
      closeModal && closeModal();
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
      <p className="text-2xl font-bold"> Add Method</p>
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

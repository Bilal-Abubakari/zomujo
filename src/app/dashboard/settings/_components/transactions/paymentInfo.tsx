'use client';
import { CardPayment, MobileMoney } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Modal, Confirmation } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MODE } from '@/constants/constants';
import { Toast, toast } from '@/hooks/use-toast';
import { selectExtra, selectUserId } from '@/lib/features/auth/authSelector';
import {
  addPaymentsDetails,
  deletePaymentDetails,
  getBanks,
  getPaymentDetails,
  updatePaymentsDetails,
} from '@/lib/features/payments/paymentsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { dataCompletionToast, showErrorToast } from '@/lib/utils';
import {
  booleanSchema,
  nameSchema,
  phoneOrCardNumberSchema,
  requiredStringSchema,
} from '@/schemas/zod.schemas';
import { CardProps, ICreatePaymentDetails, IPaymentDetails } from '@/types/payment.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Combobox } from '@/components/ui/select';
import { AlertMessage } from '@/components/ui/alert';
import { selectBankOptions, selectPayments } from '@/lib/features/payments/paymentSelector';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { IDoctor } from '@/types/doctor.interface';
import { Skeleton } from '@/components/ui/skeleton';

type PaymentInfoWithoutType = Omit<ICreatePaymentDetails, 'type'>;

const PaymentInfo = (): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<IPaymentDetails | null>(null);
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userPaymentDetails, setUserPaymentDetails] = useState<IPaymentDetails[]>([]);

  const fetchPaymentDetails = async (): Promise<void> => {
    setIsLoading(true);
    const { payload } = await dispatch(getPaymentDetails(userId!));
    if (payload && showErrorToast(payload)) {
      toast(payload);
      setIsLoading(false);
      return;
    }
    setUserPaymentDetails(payload as IPaymentDetails[]);
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchPaymentDetails();
  }, []);

  const handleEdit = (payment: IPaymentDetails): void => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (payment: IPaymentDetails): void => {
    if (userPaymentDetails.length <= 1) {
      toast({
        title: 'Cannot Delete Payment Method',
        description: 'You must add a new payment method before deleting your only existing one.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedPayment(payment);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedPayment) {
      return;
    }
    setIsDeleting(true);
    const { payload } = await dispatch(deletePaymentDetails(selectedPayment.id));
    if (payload) {
      toast(payload as Toast);
      if ((payload as Toast).variant === 'success') {
        await fetchPaymentDetails();
        setIsDeleteModalOpen(false);
        setSelectedPayment(null);
      }
    }
    setIsDeleting(false);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    void fetchPaymentDetails();
  };

  return (
    <>
      <div className="flex flex-wrap gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[139px] w-[139px] rounded-[7.32px] bg-gray-300" />
            <Skeleton className="h-[139px] w-[139px] rounded-[7.32px] bg-gray-300" />
          </>
        ) : (
          userPaymentDetails.map((payment) => (
            <Card
              name={payment.reference}
              number={payment.accountNumber}
              type={payment.type}
              key={payment.accountNumber}
              onEdit={() => handleEdit(payment)}
              onDelete={() => handleDeleteRequest(payment)}
            />
          ))
        )}

        {!isLoading && (
          <div
            className="flex h-[139px] w-[139px] cursor-pointer items-center justify-center rounded-[7.32px] border border-dashed text-gray-500"
            onClick={() => {
              setSelectedPayment(null);
              setIsModalOpen(true);
            }}
          >
            <Plus />
          </div>
        )}
      </div>
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          content={
            <PaymentMethod
              key={selectedPayment ? 'edit-payment' : 'add-payment'}
              closeModal={closeModal}
              paymentDetails={selectedPayment}
            />
          }
          showClose={true}
          setState={(isOpen) => {
            if (!isOpen) {
              closeModal();
            }
          }}
        />
      )}
      {isDeleteModalOpen && (
        <Confirmation
          open={isDeleteModalOpen}
          setState={setIsDeleteModalOpen}
          title="Delete Payment Method"
          description="Are you sure you want to delete this payment method? This action cannot be undone."
          acceptCommand={handleDelete}
          rejectCommand={() => setIsDeleteModalOpen(false)}
          acceptButtonTitle="Yes, Delete"
          rejectButtonTitle="No, Cancel"
          isLoading={isDeleting}
          showClose={!isDeleting}
        />
      )}
    </>
  );
};

export default PaymentInfo;

type CardWithActionsProps = CardProps & {
  onEdit: () => void;
  onDelete: () => void;
};

const Card = ({ number, name, type, onEdit, onDelete }: CardWithActionsProps): JSX.Element => (
  <div className="group relative flex h-[139px] w-[139px] flex-col items-start justify-center rounded-[7.32px] border pl-4">
    <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Pencil
        className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={onEdit}
      />
      <Trash2
        className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700"
        onClick={onDelete}
      />
    </div>
    <Image src={type === 'ghipss' ? CardPayment : MobileMoney} alt={type} />
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
        if (!isEditMode) {
          if (!doctorInfo?.bio) {
            router.push('/dashboard/settings');
            toast(dataCompletionToast('profile'));
            return;
          }
          if (!doctorInfo?.fee) {
            router.push('/dashboard/settings/payment?tab=pricing');
            toast(dataCompletionToast('pricing'));
            return;
          }
        }
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

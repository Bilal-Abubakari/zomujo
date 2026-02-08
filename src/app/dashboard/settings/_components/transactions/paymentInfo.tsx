'use client';
import { Modal, Confirmation } from '@/components/ui/dialog';
import { Toast, toast } from '@/hooks/use-toast';
import { selectUserId } from '@/lib/features/auth/authSelector';
import { deletePaymentDetails, getPaymentDetails } from '@/lib/features/payments/paymentsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import { IPaymentDetails } from '@/types/payment.interface';
import { Plus } from 'lucide-react';
import React, { JSX, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Card from './Card';
import PaymentMethod from './PaymentMethod';

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
            <Skeleton className="h-34.75 w-34.75 rounded-[7.32px] bg-gray-300" />
            <Skeleton className="h-34.75 w-34.75 rounded-[7.32px] bg-gray-300" />
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
            className="flex h-34.75 w-34.75 cursor-pointer items-center justify-center rounded-[7.32px] border border-dashed text-gray-500"
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

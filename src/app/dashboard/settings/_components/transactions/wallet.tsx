'use client';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Toast, toast } from '@/hooks/use-toast';
import { selectUserId } from '@/lib/features/auth/authSelector';
import { getWalletAmount } from '@/lib/features/payments/paymentsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import React, { JSX, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import WithdrawModal from './WithdrawModal';
import { IWallet } from '@/types/payment.interface';

const Wallet = (): JSX.Element => {
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);

  const fetchWalletAmount = async (): Promise<void> => {
    setIsLoading(true);
    const response = await dispatch(getWalletAmount()).unwrap();
    if (response && showErrorToast(response)) {
      toast(response as Toast);
      setIsLoading(false);
      return;
    }
    setWalletAmount((response as IWallet).net);
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchWalletAmount();
  }, []);

  const handleWithdrawSuccess = (): void => {
    setIsWithdrawModalOpen(false);
    void fetchWalletAmount();
  };

  return (
    <>
      <div>
        <div className="w-full rounded-xl border p-6 sm:h-[200px] sm:w-[453px]">
          <p className="mb-2 text-sm font-medium text-gray-400">AVAILABLE</p>
          {isLoading ? (
            <Skeleton className="h-10 w-32 bg-gray-300" />
          ) : (
            <p className="text-[20px] font-bold sm:text-[38px]">GHS {walletAmount.toFixed(2)}</p>
          )}
          <hr className="my-4" />
          <Button
            child="Withdraw"
            className="w-full"
            disabled={walletAmount <= 0 || isLoading}
            onClick={() => setIsWithdrawModalOpen(true)}
          />
        </div>
      </div>
      {isWithdrawModalOpen && (
        <Modal
          open={isWithdrawModalOpen}
          content={
            <WithdrawModal
              walletAmount={walletAmount}
              userId={userId ?? ''}
              onSuccess={handleWithdrawSuccess}
              onClose={() => setIsWithdrawModalOpen(false)}
            />
          }
          showClose={true}
          setState={setIsWithdrawModalOpen}
        />
      )}
    </>
  );
};

export default Wallet;

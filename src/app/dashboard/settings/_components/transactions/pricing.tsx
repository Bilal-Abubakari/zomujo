'use client';
import { Slider } from '@/components/ui/slider';
import React, { JSX, useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setPaymentRate, updateOrganizationsDetails } from '@/lib/features/payments/paymentsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { selectExtra, selectIsOrganizationAdmin } from '@/lib/features/auth/authSelector';
import { IRate } from '@/types/payment.interface';
import { IDoctor } from '@/types/doctor.interface';
import { AsyncThunkAction } from '@reduxjs/toolkit';
import { useRouter } from 'next/navigation';
import { dataCompletionToast, ghcToPesewas, pesewasToGhc, sliderPosition } from '@/lib/utils';
import { PaymentTab } from '@/hooks/useQueryParam';
import { MAX_AMOUNT, MIN_AMOUNT } from '@/constants/constants';
import { DOCTOR_EARNINGS_PERCENTAGE, PLATFORM_FEE_PERCENTAGE } from '@/constants/payment.constants';

const Pricing = (): JSX.Element => {
  const router = useRouter();
  const doctorInfo = useAppSelector(selectExtra) as IDoctor;

  const MIN_SESSION = 45;
  const MAX_SESSION = 120;

  const [currentAmount, setCurrentAmount] = useState(MIN_AMOUNT);
  const [currentSessionLength, setCurrentSessionLength] = useState(MIN_SESSION);
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsOrganizationAdmin);
  const [isLoading, setIsLoading] = useState(false);
  async function updateRate(rate: IRate): Promise<void> {
    setIsLoading(true);
    const action = isAdmin
      ? updateOrganizationsDetails(rate.amount)
      : (setPaymentRate(rate) as AsyncThunkAction<Toast, unknown, object>);

    const { payload } = await dispatch(action);

    if (payload) {
      const toastData = payload as Toast;
      toast(toastData);
      if (toastData.variant === 'success') {
        if (!doctorInfo?.bio) {
          router.push('/dashboard/settings');
          toast(dataCompletionToast('profile'));
          return;
        }
        if (!doctorInfo?.hasDefaultPayment) {
          router.push(`/dashboard/settings/payment?tab=${PaymentTab.PaymentMethod}`);
          router.refresh();
          toast(dataCompletionToast('paymentMethod'));
          return;
        }
        if (!doctorInfo?.hasSlot) {
          router.push('/dashboard/availability');
          toast(dataCompletionToast('availability'));
          return;
        }
      }
    }

    setIsLoading(false);
  }

  useEffect(() => {
    if (doctorInfo?.fee) {
      const amount = pesewasToGhc(doctorInfo.fee);
      if (amount) {
        setCurrentAmount(amount);
        setCurrentSessionLength(Number(MIN_SESSION));
      }
    }
  }, []);

  const doctorEarnings = Math.round(currentAmount * (DOCTOR_EARNINGS_PERCENTAGE / 100));

  return (
    <div className="flex w-full flex-col items-end gap-24 sm:ml-6 sm:w-113.5">
      <div className="relative flex w-full flex-1 flex-col gap-4">
        <p className="text-sm">Select amount</p>
        <Slider
          value={[currentAmount]}
          onValueChange={(value) => setCurrentAmount(value[0])}
          min={MIN_AMOUNT}
          max={MAX_AMOUNT}
          step={10}
        />
        <motion.div
          style={{
            x: `${sliderPosition(window.innerWidth < 430 ? 20 : currentAmount / 35, 'amount')}px`,
          }}
          className="bg-primary absolute top-[calc(100%+8px)] flex h-8 w-16 items-center justify-center rounded-full"
        >
          <p className="text-sm text-white">₵{currentAmount}</p>
        </motion.div>
      </div>
      <div className="relative flex w-full flex-1 flex-col gap-4">
        <div className="flex justify-between">
          <p className="text-sm">Length of session</p>
          <p className="text-xs text-red-600">*Not adjustable</p>
        </div>
        <Slider
          value={[currentSessionLength]}
          min={MIN_SESSION}
          max={MAX_SESSION}
          step={5}
          disabled={true}
        />
        <motion.div
          style={{
            x: `${sliderPosition(window.innerWidth < 430 ? 20 : currentSessionLength, 'sessionLength')}px`,
          }}
          className="absolute top-[calc(100%+8px)] flex h-8 items-center justify-center rounded-full bg-gray-500 px-2.5"
        >
          <p className="text-sm text-white">{currentSessionLength} mins</p>
        </motion.div>
      </div>
      <div className="flex w-full items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Earnings breakdown</p>
          <p className="leading-5">
            You will receive{' '}
            <span className="font-bold">
              ₵{doctorEarnings} ({DOCTOR_EARNINGS_PERCENTAGE}%)
            </span>{' '}
            per consultation. A{' '}
            <span className="font-bold">{PLATFORM_FEE_PERCENTAGE}% platform fee</span> is deducted
            from your set fee of <span className="font-bold">₵{currentAmount}</span>.
          </p>
        </div>
      </div>
      <Button
        child="Save Changes"
        isLoading={isLoading}
        disabled={isLoading}
        onClick={() => updateRate({ amount: ghcToPesewas(currentAmount) })}
      />
    </div>
  );
};

export default Pricing;

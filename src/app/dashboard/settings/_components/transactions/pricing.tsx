'use client';
import { Slider } from '@/components/ui/slider';
import React, { JSX, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setPaymentRate, updateOrganizationsDetails } from '@/lib/features/payments/paymentsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { selectExtra, selectIsOrganizationAdmin } from '@/lib/features/auth/authSelector';
import { IRate } from '@/types/payment.interface';
import { IDoctor } from '@/types/doctor.interface';
import { AsyncThunkAction } from '@reduxjs/toolkit';

const Pricing = (): JSX.Element => {
  const MIN_AMOUNT = 20;
  const MAX_AMOUNT = 10000;

  const MIN_SESSION = 30;
  const MAX_SESSION = 120;

  const [currentAmount, setCurrentAmount] = useState(MIN_AMOUNT);
  const [currentSessionLength, setCurrentSessionLength] = useState(45);
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsOrganizationAdmin);
  const [isLoading, setIsLoading] = useState(false);
  const { fee } = useAppSelector(selectExtra)! as IDoctor;
  async function updateRate(rate: IRate): Promise<void> {
    setIsLoading(true);
    const action = isAdmin
      ? updateOrganizationsDetails(rate.amount)
      : (setPaymentRate(rate) as AsyncThunkAction<Toast, unknown, Object>);

    const { payload } = await dispatch(action);

    if (payload) {
      toast(payload);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    if (fee) {
      const { amount, lengthOfSession } = fee;
      const sectionLength = lengthOfSession.split(' ')[0];
      if (amount) {
        setCurrentAmount(amount);
        setCurrentSessionLength(Number(sectionLength));
      }
    }
  }, []);
  function sliderPosition(value: number, type: 'amount' | 'sessionLength'): number {
    if (type === 'amount') {
      const multiplier = 1.3;
      const offset = -20;
      return value * multiplier + offset;
    }
    const multiplier = value < 60 ? 1.3 : value < 80 ? 2.4 : 3;
    const offset = value < 50 ? -30 : 0;
    return value * multiplier + offset;
  }
  return (
    <div className="flex w-full flex-col items-end gap-24 sm:ml-6 sm:w-[454px]">
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
      <Button
        child="Save Changes"
        isLoading={isLoading}
        disabled={isLoading}
        onClick={() =>
          updateRate({ amount: currentAmount, lengthOfSession: `${currentSessionLength} mins` })
        }
      />
    </div>
  );
};

export default Pricing;

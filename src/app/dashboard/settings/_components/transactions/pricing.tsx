'use client';
import { Slider } from '@/components/ui/slider';
import React, { JSX, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setPaymentRate } from '@/lib/features/payments/payments.thunk';
import { toast } from '@/hooks/use-toast';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { IRate } from '@/types/payment.interface';
import { IDoctor } from '@/types/doctor.interface';

const Pricing = (): JSX.Element => {
  const MIN_AMOUNT = 20;
  const MAX_AMOUNT = 300;

  const MIN_SESSION = 30;
  const MAX_SESSION = 120;

  const [currentAmount, setCurrentAmount] = useState(MIN_AMOUNT);
  const [currentSessionLength, setCurrentSessionLength] = useState(MIN_SESSION);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { rate } = useAppSelector(selectExtra)! as IDoctor;
  async function updateRate(rate: IRate): Promise<void> {
    setIsLoading(true);
    const { payload } = await dispatch(setPaymentRate(rate));
    if (payload) {
      toast(payload);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    const { amount, lengthOfSession } = rate;
    const sectionLength = lengthOfSession.split(' ')[0];
    if (amount) {
      setCurrentAmount(amount);
      setCurrentSessionLength(Number(sectionLength));
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
          step={5}
        />
        <motion.div
          style={{
            x: `${sliderPosition(window.innerWidth < 430 ? 20 : currentAmount, 'amount')}px`,
          }}
          className="bg-primary absolute top-[calc(100%+8px)] flex h-8 w-16 items-center justify-center rounded-full"
        >
          <p className="text-sm text-white">₵{currentAmount}</p>
        </motion.div>
      </div>
      <div className="relative flex w-full flex-1 flex-col gap-4">
        <p className="text-sm">Length of session</p>
        <Slider
          value={[currentSessionLength]}
          onValueChange={(value) => setCurrentSessionLength(value[0])}
          min={MIN_SESSION}
          max={MAX_SESSION}
          step={5}
        />
        <motion.div
          style={{
            x: `${sliderPosition(window.innerWidth < 430 ? 20 : currentSessionLength, 'sessionLength')}px`,
          }}
          className="bg-primary absolute top-[calc(100%+8px)] flex h-8 items-center justify-center rounded-full px-2.5"
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

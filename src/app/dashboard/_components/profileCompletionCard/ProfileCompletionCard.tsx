'use client';
import { selectExtra, selectUserRole } from '@/lib/features/auth/authSelector';
import { cn } from '@/lib/utils';
import { IDoctor } from '@/types/doctor.interface';
import { useRouter } from 'next/navigation';
import React, { JSX, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PaymentTab } from '@/hooks/useQueryParam';
import { Role } from '@/types/shared.enum';

const ProfileCompletionCard = (): JSX.Element => {
  const router = useRouter();
  const extra = useSelector(selectExtra) as IDoctor | null;
  const role = useSelector(selectUserRole);
  const [completionRate, setCompletionRate] = useState(0);
  const [completionMessage, setCompletionMessage] = useState(
    'Complete profile to unlock your profile for patient requests',
  );

  useEffect(() => {
    if (extra) {
      let completedCount = 0;
      const baseCompletion = 40;
      const remainingPercentage = 60;
      const totalStages = 4;

      // Stage 1: Profile Info
      const hasProfileInfo =
        extra.experience &&
        extra.specializations?.length > 0 &&
        extra.languages?.length > 0 &&
        extra.bio;
      if (hasProfileInfo) {
        completedCount++;
      }

      // Stage 2: Fee
      if (extra.fee) {
        completedCount++;
      }

      // Stage 3: Payment Method
      if (extra.hasDefaultPayment) {
        completedCount++;
      }

      // Stage 4: Slot pattern
      if (extra.hasSlot) {
        completedCount++;
      }

      if (!hasProfileInfo) {
        setCompletionMessage('Complete your profile to unlock your profile for patient requests.');
      } else if (!extra.fee) {
        setCompletionMessage('Set up your pricing to continue and unlock your profile.');
      } else if (!extra.hasDefaultPayment) {
        setCompletionMessage('Add a payment method to receive payments and unlock your profile.');
      } else if (!extra.hasSlot) {
        setCompletionMessage('Set your availability to start receiving patient requests.');
      }

      const additionalPercentage = (completedCount / totalStages) * remainingPercentage;
      setCompletionRate(Math.floor(baseCompletion + additionalPercentage));
    }
  }, [extra]);

  const handleCompleteProfileClick = (): void => {
    if (!extra) {
      return;
    }

    // Stage 1 check: Profile Info
    const hasProfileInfo =
      extra.experience &&
      extra.education &&
      extra.specializations?.length > 0 &&
      extra.languages?.length > 0 &&
      extra.bio;
    if (!hasProfileInfo) {
      router.push('/dashboard/settings');
      return;
    }

    // Stage 2 check: Fee
    if (!extra.fee) {
      router.push(`/dashboard/settings/payment?tab=${PaymentTab.Pricing}`);
      return;
    }

    // Stage 3 check: Payment Method
    if (!extra.hasDefaultPayment) {
      router.push(`/dashboard/settings/payment?tab=${PaymentTab.PaymentMethod}`);
    }

    // Stage 4 check: Slot pattern
    if (!extra.hasSlot) {
      router.push('/dashboard/settings/availability');
    }
  };

  if (role !== Role.Doctor) {
    return <></>;
  }

  return (
    <div
      className={cn(
        'relative hidden w-full flex-col items-center justify-center gap-6 rounded-lg bg-linear-to-t from-teal-800 to-emerald-500 px-5 py-4',
        completionRate >= 100 ? 'hidden' : 'flex',
      )}
    >
      <div className="z-20 flex h-14 w-full flex-col items-start justify-start gap-2">
        <div className="flex w-full flex-row items-center justify-between">
          <p className="text-base font-medium text-white">Getting Started</p>
          <p className="text-sm font-bold text-white">{completionRate}%</p>
        </div>
        <div className="text-xs font-normal text-white">{completionMessage}</div>
      </div>
      <div className="z-20 h-1 w-full rounded-full bg-white/10">
        <div
          style={{
            width: `${completionRate}%`,
          }}
          className="h-1 rounded-full bg-white"
        ></div>
      </div>
      <button
        onClick={handleCompleteProfileClick}
        className="z-20 flex h-9 flex-col items-center justify-center self-stretch rounded-md border border-white/20 bg-white/20 backdrop-blur-lg"
      >
        <p className="text-sm font-medium text-white">Complete Profile</p>
      </button>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="158"
        height="178"
        viewBox="0 0 158 178"
        fill="none"
        className="absolute bottom-0 left-0 z-0"
      >
        <path
          d="M-64 250L124 -72H158L124 250H-64Z"
          fill="url(#paint0_linear_412_12737)"
          fillOpacity="0.7"
        />
        <defs>
          <linearGradient
            id="paint0_linear_412_12737"
            x1="-17.5"
            y1="26"
            x2="153"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0.2" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="222"
        height="178"
        viewBox="0 0 222 178"
        fill="none"
        className="absolute right-0 bottom-0 z-10"
      >
        <path
          d="M0 250L188 -72H222L188 250H0Z"
          fill="url(#paint0_linear_412_12736)"
          fillOpacity="0.7"
        />
        <defs>
          <linearGradient
            id="paint0_linear_412_12736"
            x1="46.5"
            y1="26"
            x2="217"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0.2" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default ProfileCompletionCard;

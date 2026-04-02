'use client';
import React, { JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, BadgeCheck, Check, CreditCard, Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { useAppDispatch } from '@/lib/hooks';
import { updateCurrentStep } from '@/lib/features/auth/authSlice';
import { REGISTRATION_FEE } from '@/constants/payment.constants';

const RegistrationFee = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [openModal, setOpenModal] = useState(false);

  const handleSkip = (): void => {
    setOpenModal(true);
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <Modal open={openModal} content={<OnboardingSuccessful />} />

      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <p className="flex flex-row items-center gap-2 text-2xl leading-8 font-bold sm:text-[32px]">
          Registration Fee
          <CreditCard size={20} className="text-primary" />
        </p>
        <p className="text-grayscale-medium text-sm leading-6 sm:text-base">
          Complete your onboarding by paying a one-time platform registration fee.
        </p>
      </div>

      {/* Fee Card */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-white to-primary/10 p-6 shadow-sm sm:p-8">
        <div className="absolute top-0 right-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BadgeCheck size={13} />
              One-Time Fee
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              GH₵{' '}
              <span className="text-primary">
                {REGISTRATION_FEE.toLocaleString('en-GH')}
              </span>
            </p>
            <p className="text-sm text-gray-500">One-time platform registration fee</p>
          </div>
          <ul className="mt-2 flex flex-col gap-2">
            {[
              'Full access to the Fornix Link platform',
              'Verified doctor badge on your profile',
              'Connect with patients nationwide',
              'Access to consultation and appointment tools',
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Skip disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="font-semibold">You can skip this step for now</p>
          <p className="leading-5 text-amber-700">
            However, once you begin earning through Fornix Link — whether from consultations or
            appointments — you will be required to settle this one-time registration fee. Early
            payment helps activate your full profile sooner.
          </p>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p className="leading-5">
          This is a <strong>one-time</strong> fee and will never be charged again. It covers your
          permanent registration on the Fornix Link platform and helps maintain the quality and
          trust of our medical network.
        </p>
      </div>

      {/* Actions */}
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-4 self-center sm:max-w-none sm:flex-row sm:gap-8">
        <Button
          onClick={() => dispatch(updateCurrentStep(3))}
          variant="secondary"
          className="bg-accent-foreground w-full text-white"
          type="button"
          child="Back"
        />
        <Button
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary/5"
          type="button"
          child={`Pay GH₵ ${REGISTRATION_FEE.toLocaleString('en-GH')} Now`}
          onClick={() => undefined}
          title="Payment coming soon — you can skip and pay later"
        />
        <Button
          className="w-full"
          type="button"
          child="Skip for Now"
          onClick={handleSkip}
        />
      </div>
    </div>
  );
};

export default RegistrationFee;

const OnboardingSuccessful = (): JSX.Element => {
  const router = useRouter();
  return (
    <div className="relative flex flex-col items-center gap-8 p-6 pt-16">
      <div className="absolute top-0 left-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50">
        <div className="from-primary-light-base to-primary-dark flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-b sm:h-16 sm:w-16">
          <Check size={28} strokeWidth={3} className="text-white sm:size-8" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <p className="text-xl leading-6 font-bold sm:text-2xl">Submission Received!</p>
        <p className="text-center text-sm leading-5 text-gray-500 sm:text-base sm:leading-6">
          Thank you for submitting your information! Our admin team will review and verify your
          details shortly. You will gain access to the features once the verification process is
          complete.
        </p>
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        <Button child="Go to Dashboard" type="button" onClick={() => router.push('/dashboard')} />
      </div>
    </div>
  );
};



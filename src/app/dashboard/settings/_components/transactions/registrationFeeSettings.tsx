'use client';
import React, { JSX } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Info,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/hooks';
import {
  selectRegistrationFeePaid,
  selectRegistrationFeePaidAt,
} from '@/lib/features/auth/authSelector';
import { REGISTRATION_FEE } from '@/constants/payment.constants';

const BENEFITS = [
  'Full access to the Fornix Link platform',
  'Verified doctor badge on your profile',
  'Connect with patients nationwide',
  'Access to consultation and appointment tools',
] as const;

const RegistrationFeeSettings = (): JSX.Element => {
  const isPaid = useAppSelector(selectRegistrationFeePaid);
  const paidAtRaw = useAppSelector(selectRegistrationFeePaidAt);

  const paidAt = paidAtRaw
    ? new Date(JSON.parse(paidAtRaw)).toLocaleDateString('en-GH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  if (isPaid) {
    return <PaidState paidAt={paidAt} />;
  }

  return <UnpaidState />;
};

export default RegistrationFeeSettings;

/* ─────────────────────────── Paid State ─────────────────────────── */

const PaidState = ({ paidAt }: { paidAt: string | null }): JSX.Element => (
  <div className="flex w-full flex-col gap-6 sm:max-w-140">
    {/* Success banner */}
    <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
      <CheckCircle2 className="size-6 shrink-0 text-green-600" />
      <div>
        <p className="font-semibold text-green-800">Registration Fee Paid</p>
        <p className="text-sm text-green-700">
          You are a fully registered member of the Fornix Link platform.
        </p>
      </div>
    </div>

    {/* Receipt card */}
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-gray-50 px-6 py-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Receipt size={18} />
          <span className="font-semibold">Payment Receipt</span>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          PAID
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Description</span>
          <span className="text-sm font-medium text-gray-800">Platform Registration Fee</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="text-lg font-extrabold text-gray-900">
            GH₵ <span className="text-primary">{REGISTRATION_FEE.toLocaleString('en-GH')}</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Type</span>
          <span className="text-sm font-medium text-gray-800">One-time fee</span>
        </div>
        {paidAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Date Paid</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
              <CalendarCheck size={14} className="text-primary" />
              {paidAt}
            </span>
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Benefits unlocked */}
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Benefits unlocked
          </p>
          <ul className="flex flex-col gap-2">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                <ShieldCheck size={15} className="text-primary mt-0.5 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    {/* Info note */}
    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
      <Info size={16} className="mt-0.5 shrink-0" />
      <p className="leading-5">
        This was a <strong>one-time</strong> fee. You will never be charged for platform
        registration again.
      </p>
    </div>
  </div>
);

/* ─────────────────────────── Unpaid State ─────────────────────────── */

const UnpaidState = (): JSX.Element => (
  <div className="flex w-full flex-col gap-6 sm:max-w-140">
    {/* Pending status banner */}
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <CreditCard className="size-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-semibold text-amber-800">Registration Fee Pending</p>
        <p className="text-sm text-amber-700">
          Your one-time platform registration fee has not yet been paid.
        </p>
      </div>
    </div>

    {/* Fee card */}
    <div className="border-primary/20 from-primary/5 to-primary/10 relative overflow-hidden rounded-2xl border bg-linear-to-br via-white p-6 shadow-sm">
      <div className="bg-primary/5 absolute top-0 right-0 h-28 w-28 translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="relative flex flex-col gap-4">
        <span className="bg-primary/10 text-primary inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
          <BadgeCheck size={13} />
          One-Time Fee
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-4xl font-extrabold tracking-tight text-gray-900">
            GH₵ <span className="text-primary">{REGISTRATION_FEE.toLocaleString('en-GH')}</span>
          </p>
          <p className="text-sm text-gray-500">One-time platform registration fee</p>
        </div>
        <ul className="mt-1 flex flex-col gap-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
              <ShieldCheck size={15} className="text-primary mt-0.5 shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Obligation notice */}
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertCircle size={17} className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="font-semibold">Payment will be required once you start earning</p>
        <p className="leading-5 text-amber-700">
          You may delay payment for now, but once you begin receiving income through Fornix Link —
          from consultations or appointments — you will be obligated to settle this one-time
          registration fee.
        </p>
      </div>
    </div>

    {/* Info note */}
    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
      <Info size={16} className="mt-0.5 shrink-0" />
      <p className="leading-5">
        This is a <strong>one-time</strong> fee and will never be charged again. It covers your
        permanent registration on the Fornix Link platform.
      </p>
    </div>

    {/* CTA */}
    <Button
      className="w-full sm:w-auto"
      type="button"
      child={
        <span className="flex items-center gap-2">
          <CreditCard size={16} />
          Pay GH₵ {REGISTRATION_FEE.toLocaleString('en-GH')} Now
        </span>
      }
      onClick={() => undefined}
      title="Payment processing coming soon"
    />
  </div>
);

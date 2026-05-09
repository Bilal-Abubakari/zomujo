'use client';

import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronDown, ChevronUp, CreditCard, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectIsPatient } from '@/lib/features/auth/authSelector';
import {
  selectMostRecentPendingPayment,
  selectPendingPayments,
} from '@/lib/features/payments/paymentSelector';
import { getPendingPayments, retryPayment } from '@/lib/features/payments/paymentsThunk';
import { IRetryPaymentResponse } from '@/types/payment.interface';
import { showErrorToast, cn, pesewasToGhc } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getFormattedDate, extractGMTTime } from '@/lib/date';
import { AvatarComp } from '@/components/ui/avatar';
import PaymentCountdown from '@/components/payment/PaymentCountdown';

const REFETCH_INTERVAL_MS = 60_000;

const PendingPaymentBanner = (): JSX.Element | null => {
  const isPatient = useAppSelector(selectIsPatient);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pendingPayments = useAppSelector(selectPendingPayments);
  const payment = useAppSelector(selectMostRecentPendingPayment);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPending = useCallback(() => {
    void dispatch(getPendingPayments());
  }, [dispatch]);

  useEffect(() => {
    if (!isPatient) {
      return;
    }

    fetchPending();

    intervalRef.current = setInterval(fetchPending, REFETCH_INTERVAL_MS);

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        fetchPending();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPatient, fetchPending]);

  const handleExpire = useCallback(() => {
    fetchPending();
  }, [fetchPending]);

  const handleRetry = async (): Promise<void> => {
    if (!payment) {
      return;
    }
    setIsRetrying(true);
    const { payload } = await dispatch(retryPayment(payment.reference));
    setIsRetrying(false);

    if (showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
      return;
    }

    const { authorization_url } = payload as IRetryPaymentResponse;
    globalThis.location.href = authorization_url;
  };

  const handleAlreadyPaid = (): void => {
    if (!payment) {
      return;
    }
    router.push(`/verify-payment?reference=${payment.reference}`);
  };

  const handleViewAll = (): void => {
    router.push('/dashboard/appointment?appointmentView=requests');
  };

  if (!isPatient || !payment) {
    return null;
  }

  const amountGhs = pesewasToGhc(payment.totalAmount).toFixed(2);
  const doctorName = payment.doctor
    ? `Dr. ${payment.doctor.firstName} ${payment.doctor.lastName}`
    : null;

  if (isCollapsed) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none"
          aria-label="View pending payment"
        >
          <CreditCard size={16} />
          <span>Pending payment</span>
          {doctorName && <span className="max-w-30 truncate opacity-80">· {doctorName}</span>}
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 font-mono text-xs">
            GHS {amountGhs}
          </span>
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="fixed right-4 bottom-4 z-50 w-full max-w-sm rounded-xl border border-amber-200 bg-white shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between rounded-t-xl bg-amber-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Unfinished payment</p>
            {payment.status === 'failed' && (
              <p className="text-xs text-red-500">Previous payment attempt failed</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(true)}
            className="rounded p-1 text-amber-600 hover:bg-amber-100"
            aria-label="Minimise banner"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="rounded p-1 text-amber-600 hover:bg-amber-100"
            aria-label="Close banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 px-4 py-3">
        {/* Doctor row */}
        {payment.doctor && (
          <div className="flex items-center gap-3">
            <AvatarComp
              name={`${payment.doctor.firstName} ${payment.doctor.lastName}`}
              imageSrc={payment.doctor.profilePicture ?? undefined}
              className="h-8 w-8"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">{doctorName}</p>
            </div>
          </div>
        )}

        {/* Slot + amount */}
        <div className="flex items-center justify-between text-sm">
          {payment.slot ? (
            <span className="text-gray-600">
              {getFormattedDate(payment.slot.date)} · {extractGMTTime(payment.slot.startTime)}
            </span>
          ) : (
            <span />
          )}
          <span className="font-semibold text-gray-800">GHS {amountGhs}</span>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-1.5 text-xs text-amber-700">
          <span>⏱ Expires in</span>
          <PaymentCountdown expiresAt={payment.expiresAt} onExpire={handleExpire} />
        </div>

        {/* View all link */}
        {pendingPayments.length > 1 && (
          <button
            onClick={handleViewAll}
            className="text-primary text-xs underline underline-offset-2"
          >
            View all {pendingPayments.length} pending payments
          </button>
        )}
      </div>

      {/* Actions */}
      <div
        className={cn('flex gap-2 rounded-b-xl border-t border-amber-100 bg-amber-50 px-4 py-3')}
      >
        <button
          onClick={handleRetry}
          disabled={!payment.canRetry || isRetrying}
          className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRetrying ? 'Redirecting…' : 'Retry payment'}
        </button>
        <button
          onClick={handleAlreadyPaid}
          className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
        >
          I already paid
        </button>
      </div>
    </div>
  );
};

export default PendingPaymentBanner;

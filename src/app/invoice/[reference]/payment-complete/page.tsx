'use client';
import { JSX, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { showErrorToast, pesewasToGhc } from '@/lib/utils';
import {
  getPublicInvoice,
  confirmPayment,
  downloadPublicInvoiceReceipt,
} from '@/lib/features/invoices/invoicesThunk';
import { IServiceInvoice, IConfirmPaymentResponse } from '@/types/invoice.interface';
import { BRANDING } from '@/constants/branding.constant';
import moment from 'moment';

type ScreenState = 'confirming' | 'paid' | 'error';

const PAYMENT_CHANNEL_LABELS: Record<string, string> = {
  mobile_money: 'Mobile Money',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  ghipss: 'GhIPSS',
};

const PaymentCompletePage = (): JSX.Element => {
  const { reference } = useParams<{ reference: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [screen, setScreen] = useState<ScreenState>('confirming');
  const [invoice, setInvoice] = useState<IServiceInvoice | null>(null);
  const [confirmation, setConfirmation] = useState<IConfirmPaymentResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const confirm = async (): Promise<void> => {
      // First fetch the invoice to get its UUID
      const { payload: invoicePayload } = await dispatch(getPublicInvoice(reference));
      if (showErrorToast(invoicePayload)) {
        setErrorMessage('Could not load invoice details. Please check your invoice page.');
        setScreen('error');
        return;
      }

      const fetchedInvoice = invoicePayload as IServiceInvoice;
      setInvoice(fetchedInvoice);

      // Confirm payment with the invoice UUID
      const { payload: confirmPayload } = await dispatch(confirmPayment(fetchedInvoice.id));
      if (showErrorToast(confirmPayload)) {
        setErrorMessage(
          'We could not confirm your payment. If you completed the payment, you will receive an email confirmation shortly.',
        );
        setScreen('error');
        return;
      }

      setConfirmation(confirmPayload as IConfirmPaymentResponse);
      setScreen('paid');
    };

    void confirm();
  }, [reference]);

  async function handleDownloadReceipt(): Promise<void> {
    if (!invoice) {
      return;
    }
    setIsDownloading(true);
    await dispatch(downloadPublicInvoiceReceipt(invoice.reference));
    setIsDownloading(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center px-4 py-4">
          <span className="text-primary text-lg font-bold">{BRANDING.APP_NAME}</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          {/* Confirming */}
          {screen === 'confirming' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirming Payment…</h2>
              <p className="text-sm text-gray-500">
                Please wait while we verify your payment with Paystack.
              </p>
            </div>
          )}

          {/* Paid */}
          {screen === 'paid' && invoice && confirmation && (
            <div className="space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={36} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your payment for invoice{' '}
                  <span className="font-mono font-medium">{confirmation.reference}</span> has been
                  confirmed.
                </p>
              </div>

              <div className="space-y-3 rounded-xl bg-gray-50 px-5 py-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Amount Paid</span>
                  <span className="text-lg font-bold text-gray-900">
                    GHS {pesewasToGhc(invoice.totalAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Payment Method</span>
                  <span className="text-sm font-medium text-gray-700">
                    {PAYMENT_CHANNEL_LABELS[confirmation.paymentChannel] ??
                      confirmation.paymentChannel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Paid On</span>
                  <span className="text-sm font-medium text-gray-700">
                    {moment(confirmation.paidAt).format('MMMM D, YYYY [at] h:mm A')}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                child={
                  <span className="flex items-center gap-2">
                    <Download size={15} />
                    Download Receipt
                  </span>
                }
                onClick={handleDownloadReceipt}
                isLoading={isDownloading}
              />
              <button
                type="button"
                className="hover:text-primary text-sm text-gray-400 underline"
                onClick={() => router.push(`/invoice/${reference}`)}
              >
                View invoice
              </button>
            </div>
          )}

          {/* Error */}
          {screen === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment Not Confirmed</h2>
              <p className="text-sm text-gray-500">{errorMessage}</p>
              <p className="text-xs text-gray-400">
                Reference: <span className="font-mono font-medium">{reference}</span>
              </p>
              <Button
                variant="outline"
                className="w-full"
                child="Back to Invoice"
                onClick={() => router.push(`/invoice/${reference}`)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCompletePage;

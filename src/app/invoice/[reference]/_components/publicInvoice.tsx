'use client';
import { JSX, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AvatarComp } from '@/components/ui/avatar';
import {
  CreditCard,
  Stethoscope,
  CalendarDays,
  FileText,
  AlertCircle,
  Download,
  Receipt,
} from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { showErrorToast, pesewasToGhc } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  getPublicInvoice,
  payInvoice,
  downloadPublicInvoicePdf,
  downloadPublicInvoiceReceipt,
} from '@/lib/features/invoices/invoicesThunk';
import { IServiceInvoice, IInvoicePayResponse } from '@/types/invoice.interface';
import InvoiceStatusBadge from '@/app/dashboard/invoices/_components/invoiceStatusBadge';
import moment from 'moment';
import { BRANDING } from '@/constants/branding.constant';

const PublicInvoice = (): JSX.Element => {
  const { reference } = useParams<{ reference: string }>();
  const dispatch = useAppDispatch();

  const [invoice, setInvoice] = useState<IServiceInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getPublicInvoice(reference));
      setIsLoading(false);
      if (showErrorToast(payload)) {
        setError('This invoice could not be found or is no longer available.');
        return;
      }
      setInvoice(payload as IServiceInvoice);
    };
    void fetch();
  }, [reference]);

  async function handleDownloadPdf(): Promise<void> {
    if (!invoice) {
      return;
    }
    setIsPdfLoading(true);
    const { payload } = await dispatch(downloadPublicInvoicePdf(invoice.reference));
    setIsPdfLoading(false);
    if (showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
    }
  }

  async function handleDownloadReceipt(): Promise<void> {
    if (!invoice) {
      return;
    }
    setIsReceiptLoading(true);
    const { payload } = await dispatch(downloadPublicInvoiceReceipt(invoice.reference));
    setIsReceiptLoading(false);
    if (showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
    }
  }

  async function handlePay(): Promise<void> {
    if (!invoice) {
      return;
    }

    setIsPaying(true);
    const { payload } = await dispatch(payInvoice(invoice.id));
    setIsPaying(false);

    if (showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
      return;
    }

    const { authorizationUrl } = payload as IInvoicePayResponse;
    globalThis.location.href = authorizationUrl;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-900">Invoice Not Found</h2>
          <p className="text-sm text-gray-500">
            {error || 'This invoice could not be found or is no longer available.'}
          </p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';
  const isCancelled = invoice.status === 'cancelled';
  const canPay = invoice.status === 'sent';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <span className="text-primary text-lg font-bold">{BRANDING.APP_NAME}</span>
          <span className="font-mono text-sm text-gray-400">{invoice.reference}</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        {/* Status banner for paid/cancelled */}
        {isPaid && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-medium text-emerald-700">
              This invoice has been paid.{' '}
              {invoice.paidAt &&
                `Payment received on ${moment(invoice.paidAt).format('MMMM D, YYYY')}.`}
            </p>
          </div>
        )}
        {isCancelled && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <p className="text-sm font-medium text-red-700">This invoice has been cancelled.</p>
          </div>
        )}

        {/* Invoice card */}
        <div className="rounded-2xl bg-white shadow-sm">
          {/* Invoice header */}
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-lg font-bold text-gray-900">{invoice.reference}</h1>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CalendarDays size={13} />
                  <span>Issued {moment(invoice.createdAt).format('MMMM D, YYYY')}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Total Due</p>
                <p className="text-2xl font-bold text-gray-900">
                  GHS {pesewasToGhc(invoice.totalAmount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor info */}
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">
              <Stethoscope size={12} />
              Billed By
            </div>
            <div className="flex items-center gap-3">
              <AvatarComp
                name={`${invoice.doctor.firstName} ${invoice.doctor.lastName}`}
                imageSrc={invoice.doctor.profilePicture ?? ''}
                className="h-10 w-10"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  Dr. {invoice.doctor.firstName} {invoice.doctor.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="px-6 py-4">
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Services
            </h3>
            <div className="space-y-3">
              {invoice.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-gray-400">{item.description}</p>
                    )}
                  </div>
                  <span className="ml-4 font-semibold whitespace-nowrap text-gray-900">
                    GHS {pesewasToGhc(item.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="font-bold text-gray-800">Total</span>
              <span className="text-primary text-xl font-bold">
                GHS {pesewasToGhc(invoice.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t border-gray-100 px-6 py-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                <FileText size={12} />
                Notes
              </div>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {/* Pay CTA */}
          {canPay && (
            <div className="border-t border-gray-100 px-6 py-5">
              <Button
                className="w-full"
                child={
                  isPaying ? (
                    'Redirecting to payment…'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard size={16} />
                      Pay GHS {pesewasToGhc(invoice.totalAmount).toFixed(2)}
                    </span>
                  )
                }
                onClick={handlePay}
                isLoading={isPaying}
              />
              <p className="mt-2 text-center text-xs text-gray-400">
                Secured by Paystack. Your payment details are encrypted.
              </p>
            </div>
          )}

          {/* Documents */}
          <div className="border-t border-gray-100 px-6 py-5">
            <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Documents
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                child={
                  <span className="flex items-center justify-center gap-2">
                    <Download size={15} />
                    Invoice PDF
                  </span>
                }
                onClick={handleDownloadPdf}
                isLoading={isPdfLoading}
              />
              {isPaid && (
                <Button
                  variant="outline"
                  className="flex-1"
                  child={
                    <span className="flex items-center justify-center gap-2">
                      <Receipt size={15} />
                      Receipt PDF
                    </span>
                  }
                  onClick={handleDownloadReceipt}
                  isLoading={isReceiptLoading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicInvoice;

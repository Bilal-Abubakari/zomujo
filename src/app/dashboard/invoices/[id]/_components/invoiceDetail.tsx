'use client';
import { JSX, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AvatarComp } from '@/components/ui/avatar';
import { Confirmation, ConfirmationProps } from '@/components/ui/dialog';
import {
  ArrowLeft,
  Download,
  XCircle,
  Send,
  User,
  Stethoscope,
  FileText,
  CalendarDays,
  Eye,
  Link2,
  Check,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';
import { Role } from '@/types/shared.enum';
import { showErrorToast, pesewasToGhc, buildInvoicePaymentCopyText } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  getInvoice,
  cancelInvoice,
  downloadInvoiceReceipt,
  sendInvoice,
  previewInvoicePdf,
  getInvoiceLink,
} from '@/lib/features/invoices/invoicesThunk';
import { IServiceInvoice, IInvoiceLinkResponse } from '@/types/invoice.interface';
import InvoiceStatusBadge from '@/app/dashboard/invoices/_components/invoiceStatusBadge';
import moment from 'moment';

const InvoiceDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isDoctor = user?.role === Role.Doctor;

  const [invoice, setInvoice] = useState<IServiceInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<
    'cancel' | 'download' | 'send' | 'pdf' | 'link' | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getInvoice(id));
      setIsLoading(false);
      if (showErrorToast(payload)) {
        toast(payload as Parameters<typeof toast>[0]);
        return;
      }
      setInvoice(payload as IServiceInvoice);
    };
    void fetch();
  }, [id]);

  async function handlePreviewPdf(): Promise<void> {
    if (!invoice) {
      return;
    }
    setActionLoading('pdf');
    const { payload } = await dispatch(previewInvoicePdf(invoice.id));
    setActionLoading(null);
    if (showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
    }
  }

  async function handleCopyLink(): Promise<void> {
    if (!invoice) {
      return;
    }
    setActionLoading('link');
    const { payload } = await dispatch(getInvoiceLink(invoice.id));
    setActionLoading(null);
    if (showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
      return;
    }
    const { paymentUrl } = payload as IInvoiceLinkResponse;
    const { firstName, lastName } = invoice.doctor;
    await navigator.clipboard.writeText(
      buildInvoicePaymentCopyText(paymentUrl, firstName, lastName),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSend(): Promise<void> {
    if (!invoice) {
      return;
    }
    setActionLoading('send');
    const { payload } = await dispatch(sendInvoice(invoice.id));
    setActionLoading(null);
    toast(payload as Parameters<typeof toast>[0]);
    if (!showErrorToast(payload)) {
      setInvoice((prev) => (prev ? { ...prev, status: 'sent' } : prev));
    }
  }

  async function handleDownloadReceipt(): Promise<void> {
    if (!invoice) {
      return;
    }
    setActionLoading('download');
    const { payload } = await dispatch(
      downloadInvoiceReceipt({ id: invoice.id, reference: invoice.reference }),
    );
    setActionLoading(null);
    toast(payload as Parameters<typeof toast>[0]);
  }

  function handleCancel(): void {
    if (!invoice) {
      return;
    }
    setConfirmation({
      open: true,
      title: 'Cancel Invoice',
      description: `Cancel invoice ${invoice.reference}? This cannot be undone.`,
      acceptButtonTitle: 'Yes, Cancel',
      rejectButtonTitle: 'Keep',
      acceptCommand: async () => {
        setConfirmation((prev) => ({ ...prev, open: false }));
        setActionLoading('cancel');
        const { payload } = await dispatch(cancelInvoice(invoice.id));
        setActionLoading(null);
        toast(payload as Parameters<typeof toast>[0]);
        if (!showErrorToast(payload)) {
          setInvoice((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
        }
      },
      rejectCommand: () => setConfirmation((prev) => ({ ...prev, open: false })),
    });
  }

  if (isLoading) {
    return (
      <div className="mt-4 flex items-center justify-center rounded-lg bg-white p-20">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="mt-4 rounded-lg bg-white p-10 text-center">
        <p className="text-gray-500">Invoice not found.</p>
        <Button
          className="mt-4"
          variant="outline"
          child="Back to Invoices"
          onClick={() => router.push('/dashboard/invoices')}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 space-y-4">
        {/* Back + Actions bar */}
        <div className="flex items-center justify-between rounded-lg bg-white px-6 py-4">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
            onClick={() => router.push('/dashboard/invoices')}
          >
            <ArrowLeft size={16} />
            All Invoices
          </button>

          <div className="flex items-center gap-2">
            {isDoctor && (
              <Button
                size="sm"
                variant="outline"
                child={
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} />
                    Preview PDF
                  </span>
                }
                onClick={handlePreviewPdf}
                isLoading={actionLoading === 'pdf'}
              />
            )}
            {isDoctor && (
              <Button
                size="sm"
                variant="outline"
                child={
                  copied ? (
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <Check size={14} />
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Link2 size={14} />
                      Copy Link
                    </span>
                  )
                }
                onClick={handleCopyLink}
                isLoading={actionLoading === 'link'}
                disabled={copied}
              />
            )}
            {isDoctor && invoice.status === 'draft' && (
              <Button
                size="sm"
                variant="outline"
                child={
                  <span className="flex items-center gap-1.5">
                    <Send size={14} />
                    Send Invoice
                  </span>
                }
                onClick={handleSend}
                isLoading={actionLoading === 'send'}
              />
            )}
            {isDoctor && (invoice.status === 'draft' || invoice.status === 'sent') && (
              <Button
                size="sm"
                variant="destructive"
                child={
                  <span className="flex items-center gap-1.5">
                    <XCircle size={14} />
                    Cancel
                  </span>
                }
                onClick={handleCancel}
                isLoading={actionLoading === 'cancel'}
              />
            )}
            {invoice.status === 'paid' && (
              <Button
                size="sm"
                child={
                  <span className="flex items-center gap-1.5">
                    <Download size={14} />
                    Download Receipt
                  </span>
                }
                onClick={handleDownloadReceipt}
                isLoading={actionLoading === 'download'}
              />
            )}
          </div>
        </div>

        {/* Main card */}
        <div className="space-y-8 rounded-lg bg-white px-6 py-6">
          {/* Invoice header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-xl font-bold text-gray-900">{invoice.reference}</h1>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays size={14} />
                <span>Issued {moment(invoice.createdAt).format('MMMM D, YYYY')}</span>
              </div>
              {invoice.paidAt && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CalendarDays size={14} />
                  <span>Paid {moment(invoice.paidAt).format('MMMM D, YYYY')}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Due</p>
              <p className="text-3xl font-bold text-gray-900">
                GHS {pesewasToGhc(invoice.totalAmount).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Doctor + Patient info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                <Stethoscope size={13} /> Doctor
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

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                <User size={13} /> Patient
              </div>
              <div className="flex items-center gap-3">
                <AvatarComp
                  name={`${invoice.patient.firstName} ${invoice.patient.lastName}`}
                  imageSrc={invoice.patient.profilePicture ?? ''}
                  className="h-10 w-10"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {invoice.patient.firstName} {invoice.patient.lastName}
                  </p>
                  {invoice.patientAge != null && (
                    <p className="text-sm text-gray-500">Age: {invoice.patientAge}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Services & Items</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Item</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.description && (
                          <p className="mt-0.5 text-xs text-gray-400">{item.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        GHS {pesewasToGhc(item.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-800">Total</td>
                    <td className="text-primary px-4 py-3 text-right text-lg font-bold">
                      GHS {pesewasToGhc(invoice.totalAmount).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                <FileText size={13} /> Notes
              </div>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      <Confirmation
        {...confirmation}
        showClose={true}
        setState={() => setConfirmation((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default InvoiceDetail;

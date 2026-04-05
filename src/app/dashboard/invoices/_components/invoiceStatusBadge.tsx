import { JSX } from 'react';
import { ServiceInvoiceStatus } from '@/types/invoice.interface';
import { capitalize } from '@/lib/utils';

const statusStyles: Record<ServiceInvoiceStatus, { dot: string; text: string; bg: string }> = {
  draft: { dot: 'bg-[#94A3B8]', text: 'text-[#64748B]', bg: 'bg-slate-100' },
  sent: { dot: 'bg-[#3B82F6]', text: 'text-[#2563EB]', bg: 'bg-blue-50' },
  paid: { dot: 'bg-[#07926F]', text: 'text-[#07926F]', bg: 'bg-emerald-50' },
  cancelled: { dot: 'bg-[#EF4444]', text: 'text-[#DC2626]', bg: 'bg-red-50' },
};

interface InvoiceStatusBadgeProps {
  status: ServiceInvoiceStatus;
  className?: string;
}

const InvoiceStatusBadge = ({ status, className = '' }: InvoiceStatusBadgeProps): JSX.Element => {
  const { dot, text, bg } = statusStyles[status] ?? statusStyles.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {capitalize(status)}
    </span>
  );
};

export default InvoiceStatusBadge;

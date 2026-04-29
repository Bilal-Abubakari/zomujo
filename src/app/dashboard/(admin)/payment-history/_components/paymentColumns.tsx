import { ColumnDef } from '@tanstack/react-table';
import { IPayment } from '@/types/payment.interface';
import { JSX } from 'react';
import { AvatarWithName } from '@/components/ui/avatar';
import { getFormattedDate } from '@/lib/date';
import { PESEWAS_PER_CEDI } from '@/constants/payment.constants';
import { capitalize } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import PaymentStatusBadge from './paymentStatusBadge';

const fmt = (amount: number, currency = 'GHS'): string => {
  const inCedis = amount / PESEWAS_PER_CEDI;
  return `${currency} ${inCedis.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatChannel = (channel: string): string =>
  channel
    .split('_')
    .map((word) => (word.toUpperCase() === 'GHIPSS' ? 'GHIPSS' : capitalize(word)))
    .join(' ');

type BreakdownRowProps = { label: string; value: string; bold?: boolean; muted?: boolean };

const BreakdownRow = ({ label, value, bold, muted }: BreakdownRowProps): JSX.Element => (
  <div className={`flex justify-between gap-6 ${muted ? 'text-gray-400' : ''}`}>
    <span className={bold ? 'font-semibold' : 'text-gray-500'}>{label}</span>
    <span className={bold ? 'font-semibold' : ''}>{value}</span>
  </div>
);

const Divider = (): JSX.Element => <hr className="border-gray-100" />;

export const paymentColumns: ColumnDef<IPayment>[] = [
  {
    accessorKey: 'reference',
    header: 'Reference',
    cell: ({ row }): JSX.Element => (
      <span className="font-mono text-xs text-gray-600">{row.getValue('reference')}</span>
    ),
  },
  {
    id: 'patient',
    header: 'Patient',
    cell: ({ row }): JSX.Element => {
      const patient = row.original.patient;
      if (!patient) {
        return <span className="text-gray-400">—</span>;
      }
      return (
        <AvatarWithName
          firstName={patient.firstName}
          lastName={patient.lastName}
          imageSrc={patient.profilePicture ?? undefined}
        />
      );
    },
  },
  {
    id: 'doctor',
    header: 'Doctor',
    cell: ({ row }): JSX.Element => {
      const doctor = row.original.doctor;
      if (!doctor) {
        return <span className="text-gray-400">—</span>;
      }
      return (
        <AvatarWithName
          firstName={doctor.firstName}
          lastName={doctor.lastName}
          imageSrc={doctor.profilePicture ?? undefined}
        />
      );
    },
  },
  {
    id: 'totalAmount',
    header: 'Amount',
    cell: ({ row }): JSX.Element => {
      const { totalAmount, subtotal, tax, paystackFee, netAmount, platformShare, doctorShare, doctorNet, currency } =
        row.original;
      return (
        <Popover>
          <PopoverTrigger className="flex items-center gap-1 font-semibold hover:text-gray-700">
            {fmt(totalAmount, currency)}
            <ChevronDown size={13} className="text-gray-400" />
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-2 text-sm" align="start">
            <p className="mb-1 font-semibold text-gray-700">Breakdown</p>
            <BreakdownRow label="Subtotal" value={fmt(subtotal, currency)} />
            <BreakdownRow label="Tax (7%)" value={fmt(tax, currency)} />
            <Divider />
            <BreakdownRow label="Total Charged" value={fmt(totalAmount, currency)} bold />
            <BreakdownRow label="Paystack Fee" value={`− ${fmt(paystackFee, currency)}`} muted />
            <Divider />
            <BreakdownRow label="Net Received" value={fmt(netAmount, currency)} bold />
            <BreakdownRow label="Platform Share" value={fmt(platformShare, currency)} />
            <BreakdownRow label="Doctor Share" value={fmt(doctorShare, currency)} />
            <BreakdownRow label="Doctor Net" value={fmt(doctorNet, currency)} />
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    cell: ({ row }): JSX.Element => (
      <span className="text-sm text-gray-600">{formatChannel(row.getValue('channel'))}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }): JSX.Element => <PaymentStatusBadge status={row.getValue('status')} />,
  },
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }): string =>
      getFormattedDate(row.original.paidAt ?? row.original.createdAt),
  },
];

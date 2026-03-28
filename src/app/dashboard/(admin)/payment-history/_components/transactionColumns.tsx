import { ColumnDef } from '@tanstack/react-table';
import { ITransaction } from '@/types/payment.interface';
import { JSX } from 'react';
import { AvatarWithName } from '@/components/ui/avatar';
import { getFormattedDate } from '@/lib/date';
import { PESEWAS_PER_CEDI } from '@/constants/payment.constants';
import { capitalize } from '@/lib/utils';
import TransactionStatusBadge from './transactionStatusBadge';

const formatAmount = (amount: number, currency: string): string => {
  const inCedis = amount / PESEWAS_PER_CEDI;
  return `${currency ?? 'GHS'} ${inCedis.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatType = (type: string): string =>
  type
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');

export const transactionColumns: ColumnDef<ITransaction>[] = [
  {
    accessorKey: 'reference',
    header: 'Reference',
    cell: ({ row }): JSX.Element => (
      <span className="font-mono text-xs text-gray-600">{row.getValue('reference')}</span>
    ),
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
          imageSrc={doctor.profilePicture}
        />
      );
    },
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
          imageSrc={patient.profilePicture}
        />
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }): JSX.Element => (
      <span className="text-sm">{formatType(row.getValue('type'))}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }): JSX.Element => (
      <span className="font-semibold">
        {formatAmount(row.getValue('amount'), row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }): JSX.Element => <TransactionStatusBadge status={row.getValue('status')} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }): string => getFormattedDate(row.getValue('createdAt')),
  },
];


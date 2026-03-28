import { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { TransactionStatus } from '@/types/shared.enum';

interface TransactionStatusBadgeProps {
  status: string;
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'destructive' | 'brown' | 'gray' }
> = {
  [TransactionStatus.Success]: { label: 'Success', variant: 'default' },
  [TransactionStatus.Pending]: { label: 'Pending', variant: 'brown' },
  [TransactionStatus.Failed]: { label: 'Failed', variant: 'destructive' },
  [TransactionStatus.Reversed]: { label: 'Reversed', variant: 'gray' },
};

const TransactionStatusBadge = ({ status }: TransactionStatusBadgeProps): JSX.Element => {
  const config = statusConfig[status] ?? { label: status, variant: 'gray' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default TransactionStatusBadge;


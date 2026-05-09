import { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '@/types/shared.enum';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; variant: 'default' | 'destructive' | 'brown' | 'gray' }
> = {
  [PaymentStatus.Success]: { label: 'Success', variant: 'default' },
  [PaymentStatus.Pending]: { label: 'Pending', variant: 'brown' },
  [PaymentStatus.Failed]: { label: 'Failed', variant: 'destructive' },
  [PaymentStatus.Abandoned]: { label: 'Abandoned', variant: 'destructive' },
  [PaymentStatus.Refunded]: { label: 'Refunded', variant: 'gray' },
  [PaymentStatus.PartialRefund]: { label: 'Partial Refund', variant: 'gray' },
};

const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps): JSX.Element => {
  const config = statusConfig[status] ?? { label: status, variant: 'gray' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default PaymentStatusBadge;

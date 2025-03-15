import { AcceptDeclineStatus, AppointmentStatus } from '@/types/shared.enum';
import { Badge } from '@/components/ui/badge';
import React, { JSX } from 'react';

type StatusBadgeProps = {
  status: AcceptDeclineStatus | AppointmentStatus;
  approvedTitle?: string;
};
const StatusBadge = ({ status, approvedTitle }: StatusBadgeProps): JSX.Element => {
  switch (status) {
    case AcceptDeclineStatus.Accepted:
      return <Badge variant="default">{approvedTitle ?? 'Approved'}</Badge>;
    case AcceptDeclineStatus.Declined:
      return <Badge variant="destructive">Declined</Badge>;
    case AcceptDeclineStatus.Deactivated:
      return <Badge variant="destructive">Deactivated</Badge>;
    default:
      return <Badge variant="brown">Pending</Badge>;
  }
};

export { StatusBadge };

import {
  AcceptDeclineStatus,
  AppointmentStatus,
  ApproveDeclineStatus,
  RequestStatus,
} from '@/types/shared.enum';
import { Badge } from '@/components/ui/badge';
import React, { JSX } from 'react';

type StatusBadgeProps = {
  status: AcceptDeclineStatus | AppointmentStatus | ApproveDeclineStatus | RequestStatus;
  approvedTitle?: string;
  declinedTitle?: string;
};
const StatusBadge = ({ status, approvedTitle, declinedTitle }: StatusBadgeProps): JSX.Element => {
  switch (status) {
    case AcceptDeclineStatus.Accepted:
    case ApproveDeclineStatus.Approved:
    case RequestStatus.Completed:
      return <Badge variant="default">{approvedTitle ?? 'Approved'}</Badge>;
    case AcceptDeclineStatus.Declined:
      return <Badge variant="destructive">{declinedTitle ?? 'Declined'}</Badge>;
    case AcceptDeclineStatus.Deactivated:
      return <Badge variant="destructive">Deactivated</Badge>;
    default:
      return <Badge variant="brown">Pending</Badge>;
  }
};

export { StatusBadge };

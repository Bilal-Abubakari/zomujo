import {
  AcceptDeclineStatus,
  AppointmentStatus,
  ApproveDeclineStatus,
  ConditionStatus,
  RequestStatus,
} from '@/types/shared.enum';
import { Badge } from '@/components/ui/badge';
import React, { JSX } from 'react';
import { ConsultationStatus } from '@/types/consultation.interface';

type StatusBadgeProps = {
  status:
    | AcceptDeclineStatus
    | AppointmentStatus
    | ApproveDeclineStatus
    | RequestStatus
    | ConditionStatus
    | ConsultationStatus;
  approvedTitle?: string;
  declinedTitle?: string;
  defaultTitle?: string;
  destructiveTitle?: string;
};
const StatusBadge = ({
  status,
  approvedTitle,
  declinedTitle,
  defaultTitle,
  destructiveTitle,
}: StatusBadgeProps): JSX.Element => {
  switch (status) {
    case AcceptDeclineStatus.Accepted:
    case ApproveDeclineStatus.Approved:
    case ConditionStatus.Inactive:
    case RequestStatus.Completed:
    case ConsultationStatus.Completed:
      return <Badge variant="default">{approvedTitle ?? 'Approved'}</Badge>;
    case AcceptDeclineStatus.Declined:
    case ConditionStatus.Active:
      return <Badge variant="destructive">{declinedTitle ?? 'Declined'}</Badge>;
    case AcceptDeclineStatus.Deactivated:
    case ConsultationStatus.Cancelled:
      return <Badge variant="destructive">{destructiveTitle ?? 'Deactivated'}</Badge>;
    case ConditionStatus.Controlled:
      return <Badge variant="gray">Chronic</Badge>;
    case ConsultationStatus.Progress:
      return <Badge variant="blue">In Progress</Badge>;
    default:
      return <Badge variant="brown">{defaultTitle ?? 'Pending'}</Badge>;
  }
};

export { StatusBadge };

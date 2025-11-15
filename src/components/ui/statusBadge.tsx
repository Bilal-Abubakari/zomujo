import {
  AcceptDeclineStatus,
  ApproveDeclineStatus,
  ConditionStatus,
  RequestStatus,
} from '@/types/shared.enum';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
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
    case AppointmentStatus.Accepted:
      return <Badge variant="default">{approvedTitle ?? 'Accepted'}</Badge>;
    case AppointmentStatus.Completed:
      return <Badge variant="default">{'Completed'}</Badge>;
    case AppointmentStatus.Progress:
      return <Badge variant="blue">In Progress</Badge>;
    case AppointmentStatus.Cancelled:
      return <Badge variant="destructive">{destructiveTitle ?? 'Cancelled'}</Badge>;
    case AppointmentStatus.Declined:
      return <Badge variant="destructive">{declinedTitle ?? 'Declined'}</Badge>;
    case AppointmentStatus.Incomplete:
      return <Badge variant="gray">Incomplete</Badge>;
    // Accept / Approve style statuses
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
    default:
      return <Badge variant="brown">{defaultTitle ?? 'Pending'}</Badge>;
  }
};

export { StatusBadge };

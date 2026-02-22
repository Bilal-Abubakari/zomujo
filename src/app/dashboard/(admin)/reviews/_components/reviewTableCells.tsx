'use client';

import { JSX } from 'react';
import { IReview } from '@/types/review.interface';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, FileText } from 'lucide-react';
import { ActionsDropdownMenus } from '@/components/ui/dropdown-menu';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';
import { AvatarWithName } from '@/components/ui/avatar';

export const isPatientReview = (review: IReview): boolean => !!review.appointmentId;

interface UserCellProps {
  review: IReview;
}

export const UserCell = ({ review }: UserCellProps): JSX.Element => {
  if (isPatientReview(review) && review.patient) {
    return (
      <AvatarWithName
        firstName={review.patient.firstName}
        lastName={review.patient.lastName}
        imageSrc={review.patient.profilePicture}
      />
    );
  }

  return (
    <AvatarWithName
      firstName={review.doctor.firstName}
      lastName={review.doctor.lastName}
      imageSrc={review.doctor.profilePicture}
    />
  );
};

interface RoleCellProps {
  review: IReview;
}

export const RoleCell = ({ review }: RoleCellProps): JSX.Element => {
  const isPatient = isPatientReview(review);
  return (
    <Badge variant={isPatient ? 'default' : 'brown'}>{isPatient ? 'Patient' : 'Doctor'}</Badge>
  );
};

interface RatingCellProps {
  rating: number;
}

export const RatingCell = ({ rating }: RatingCellProps): JSX.Element => (
  <div className="flex items-center gap-1">
    <span className="font-semibold">{rating}</span>
    <span className="text-yellow-500">★</span>
  </div>
);

interface StatusCellProps {
  status: string;
}

export const StatusCell = ({ status }: StatusCellProps): JSX.Element => {
  const statusMap: Record<
    string,
    { label: string; variant: 'default' | 'destructive' | 'brown' | 'outline' }
  > = {
    pending: { label: 'Pending', variant: 'brown' },
    skipped: { label: 'Hidden', variant: 'destructive' },
    completed: { label: 'Visible', variant: 'default' },
  };
  const statusConfig = statusMap[status.toLowerCase()] || { label: status, variant: 'outline' };
  return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
};

interface CommentCellProps {
  comment: string;
}

export const CommentCell = ({ comment }: CommentCellProps): JSX.Element => {
  const displayComment = comment || 'No comment';
  const truncatedComment =
    displayComment.length > 50 ? `${displayComment.substring(0, 50)}...` : displayComment;
  return <span className="text-sm text-gray-600">{truncatedComment}</span>;
};

interface ActionsCellProps {
  review: IReview;
  onView: (review: IReview) => void;
  onAction: (
    acceptTitle: string,
    description: string,
    id: string,
    actionThunk: AsyncThunk<Toast, string, object>,
    acceptButtonTitle?: string,
    rejectButtonTitle?: string,
  ) => void;
  completeReview: AsyncThunk<Toast, string, object>;
  skipReview: AsyncThunk<Toast, string, object>;
}

export const ActionsCell = ({
  review,
  onView,
  onAction,
  completeReview,
  skipReview,
}: ActionsCellProps): JSX.Element => {
  const { status, id, doctor } = review;
  const normalizedStatus = status.toLowerCase();
  const canShow = normalizedStatus === 'pending' || normalizedStatus === 'skipped';
  const canHide = normalizedStatus === 'pending' || normalizedStatus === 'completed';
  const userName =
    isPatientReview(review) && review.patient
      ? `${review.patient.firstName} ${review.patient.lastName}`
      : `${doctor.firstName} ${doctor.lastName}`;

  return (
    <ActionsDropdownMenus
      menuContent={[
        {
          title: (
            <>
              <FileText className="mr-2 h-4 w-4" /> View
            </>
          ),
          visible: true,
          clickCommand: () => onView(review),
        },
        {
          title: (
            <>
              <Eye className="mr-2 h-4 w-4" /> Make Public
            </>
          ),
          visible: canShow,
          clickCommand: () =>
            onAction(
              'Make Public',
              `Are you sure you want to make this review from ${userName} public?`,
              id,
              completeReview,
              'Yes, make public',
              'Cancel',
            ),
        },
        {
          title: (
            <>
              <EyeOff className="mr-2 h-4 w-4" /> Make Private
            </>
          ),
          visible: canHide,
          clickCommand: () =>
            onAction(
              'Make Private',
              `Are you sure you want to make this review from ${userName} private?`,
              id,
              skipReview,
              'Yes, make private',
              'Cancel',
            ),
        },
      ]}
    />
  );
};

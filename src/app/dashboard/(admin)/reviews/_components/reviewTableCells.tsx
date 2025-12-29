'use client';

import { JSX } from 'react';
import { IReview } from '@/types/review.interface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { ActionsDropdownMenus } from '@/components/ui/dropdown-menu';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';

interface DoctorCellProps {
  doctor: IReview['doctorId'];
}

export const DoctorCell = ({ doctor }: DoctorCellProps): JSX.Element => (
    <div className="flex items-center gap-2">
      {doctor.profilePicture && (
        <img
          src={doctor.profilePicture}
          alt={`${doctor.firstName} ${doctor.lastName}`}
          className="h-8 w-8 rounded-full object-cover"
        />
      )}
      <span className="font-medium">
        {doctor.firstName} {doctor.lastName}
      </span>
    </div>
  );

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
  const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'brown' | 'outline' }> = {
    pending: { label: 'Pending', variant: 'brown' },
    skipped: { label: 'Skipped', variant: 'destructive' },
    completed: { label: 'Completed', variant: 'default' },
  };
  const statusConfig = statusMap[status.toLowerCase()] || { label: status, variant: 'outline' };
  return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
};

interface CommentCellProps {
  comment: string;
}

export const CommentCell = ({ comment }: CommentCellProps): JSX.Element => {
  const displayComment = comment || 'No comment';
  const truncatedComment = displayComment.length > 50 ? `${displayComment.substring(0, 50)}...` : displayComment;
  return <span className="text-sm text-gray-600">{truncatedComment}</span>;
};

interface ActionsCellProps {
  review: IReview;
  onView: (review: IReview) => void;
  onComplete: (
    acceptTitle: string,
    description: string,
    id: string,
    actionThunk: AsyncThunk<Toast, string, object>,
    acceptButtonTitle?: string,
    rejectButtonTitle?: string,
  ) => void;
  completeReview: AsyncThunk<Toast, string, object>;
}

export const ActionsCell = ({
  review,
  onView,
  onComplete,
  completeReview,
}: ActionsCellProps): JSX.Element => {
  const { status, id, doctorId } = review;
  const isPending = status.toLowerCase() === 'pending';
  const doctorName = `${doctorId.firstName} ${doctorId.lastName}`;

  return (
    <ActionsDropdownMenus
      menuContent={[
        {
          title: (
            <>
              <CheckCircle className="mr-2 h-4 w-4" /> Complete
            </>
          ),
          visible: isPending,
          clickCommand: () =>
            onComplete(
              'Complete',
              `mark this review from ${doctorName} as complete`,
              id,
              completeReview,
              'Yes, complete',
              'Cancel',
            ),
        },
      ]}
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(review)}
            className="cursor-pointer"
            child="View"
          />
          {isPending && (
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                onComplete(
                  'Complete',
                  `mark this review from ${doctorName} as complete`,
                  id,
                  completeReview,
                  'Yes, complete',
                  'Cancel',
                )
              }
              className="cursor-pointer"
              child="Complete"
            />
          )}
        </div>
      }
    />
  );
};


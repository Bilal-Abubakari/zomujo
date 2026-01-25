import { ColumnDef } from '@tanstack/react-table';
import { IReview } from '@/types/review.interface';
import { JSX } from 'react';
import { DoctorCell, RatingCell, StatusCell, CommentCell, ActionsCell } from './reviewTableCells';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';

interface CreateReviewColumnsProps {
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

export const createReviewColumns = ({
  onView,
  onComplete,
  completeReview,
}: CreateReviewColumnsProps): ColumnDef<IReview>[] => [
  {
    accessorKey: 'id',
  },
  {
    accessorKey: 'doctorId',
    header: 'Doctor',
    cell: ({ row }): JSX.Element => <DoctorCell doctor={row.original.doctorId} />,
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }): JSX.Element => <RatingCell rating={row.original.rating} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }): JSX.Element => <StatusCell status={row.original.status} />,
  },
  {
    accessorKey: 'comment',
    header: 'Comment',
    cell: ({ row }): JSX.Element => <CommentCell comment={row.original.comment} />,
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }): JSX.Element => (
      <ActionsCell
        review={row.original}
        onView={onView}
        onComplete={onComplete}
        completeReview={completeReview}
      />
    ),
    enableHiding: false,
  },
];

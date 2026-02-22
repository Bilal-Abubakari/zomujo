import { ColumnDef } from '@tanstack/react-table';
import { IReview } from '@/types/review.interface';
import { JSX } from 'react';
import { UserCell, RoleCell, RatingCell, StatusCell, CommentCell, ActionsCell } from './reviewTableCells';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Toast } from '@/hooks/use-toast';

interface CreateReviewColumnsProps {
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

export const createReviewColumns = ({
  onView,
  onAction,
  completeReview,
  skipReview,
}: CreateReviewColumnsProps): ColumnDef<IReview>[] => [
  {
    id: 'user',
    header: 'User',
    cell: ({ row }): JSX.Element => <UserCell review={row.original} />,
  },
  {
    id: 'role',
    header: 'Role',
    cell: ({ row }): JSX.Element => <RoleCell review={row.original} />,
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
        onAction={onAction}
        completeReview={completeReview}
        skipReview={skipReview}
      />
    ),
    enableHiding: false,
  },
];

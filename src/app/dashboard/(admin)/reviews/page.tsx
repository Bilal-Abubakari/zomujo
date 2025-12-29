'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IReview } from '@/types/review.interface';
import { PaginationData, TableData } from '@/components/ui/table';
import React, { FormEvent, JSX, useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { Search, CheckCircle } from 'lucide-react';
import { OrderDirection } from '@/types/shared.enum';
import { Badge } from '@/components/ui/badge';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { getReviews, completeReview } from '@/lib/features/reviews/reviewsThunk';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/useSearch';
import { Modal, Confirmation, ConfirmationProps } from '@/components/ui/dialog';
import { ReviewDetails } from './_components/reviewDetails';
import { ActionsDropdownMenus } from '@/components/ui/dropdown-menu';
import { useDropdownAction } from '@/hooks/useDropdownAction';

const ReviewsPage = (): JSX.Element => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const { searchTerm, handleSearch } = useSearch(handleSubmit);
  const dispatch = useAppDispatch();
  const [queryParameters, setQueryParameters] = useState<IQueryParams<''>>({
    page: 1,
    orderDirection: OrderDirection.Descending,
    orderBy: 'createdAt',
    search: '',
    pageSize: 10,
    status: '',
  });

  const { isConfirmationLoading, handleConfirmationOpen, handleConfirmationClose } =
    useDropdownAction<''>({
      setConfirmation,
      setQueryParameters: setQueryParameters as React.Dispatch<React.SetStateAction<IQueryParams<''>>>,
    });

  useEffect(() => {
    const fetchReviews = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getReviews(queryParameters));
      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoading(false);
        return;
      }
      if (payload) {
        const { rows, ...pagination } = payload as IPagination<IReview>;
        setReviews(rows);
        setPaginationData(pagination);
      }
      setIsLoading(false);
    };
    void fetchReviews();
  }, [queryParameters, dispatch]);

  function handleSubmit(event: FormEvent<HTMLFormElement>, search?: string): void {
    event.preventDefault();
    setQueryParameters((prev) => ({
      ...prev,
      page: 1,
      search: search ?? searchTerm,
    }));
  }

  const updatePage = (pageIndex: number): void => {
    setQueryParameters((prev) => ({
      ...prev,
      page: pageIndex + 1,
    }));
  };

  const handleViewReview = (review: IReview): void => {
    setSelectedReview(review);
    setOpenModal(true);
  };

  const columns: ColumnDef<IReview>[] = [
    {
      accessorKey: 'id',
    },
    {
      accessorKey: 'doctorId',
      header: 'Doctor',
      cell: ({ row }): JSX.Element => {
        const doctor = row.original.doctorId;
        return (
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
      },
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }): JSX.Element => {
        const rating = row.original.rating;
        return (
          <div className="flex items-center gap-1">
            <span className="font-semibold">{rating}</span>
            <span className="text-yellow-500">★</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }): JSX.Element => {
        const status = row.original.status;
        const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'brown' | 'outline' }> = {
          pending: { label: 'Pending', variant: 'brown' },
          skipped: { label: 'Skipped', variant: 'destructive' },
          completed: { label: 'Completed', variant: 'default' },
        };
        const statusConfig = statusMap[status.toLowerCase()] || { label: status, variant: 'outline' };
        return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
      },
    },
    {
      accessorKey: 'comment',
      header: 'Comment',
      cell: ({ row }): JSX.Element => {
        const comment = row.original.comment || 'No comment';
        const truncatedComment = comment.length > 50 ? `${comment.substring(0, 50)}...` : comment;
        return <span className="text-sm text-gray-600">{truncatedComment}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }): JSX.Element => {
        const { status, id, doctorId } = row.original;
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
                  handleConfirmationOpen(
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
                  onClick={() => handleViewReview(row.original)}
                  className="cursor-pointer"
                  child="View"
                />
                {isPending && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      handleConfirmationOpen(
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
      },
      enableHiding: false,
    },
  ];

  return (
    <>
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by doctor name or comment..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="default" child="Search" />
          </form>

          <TableData
            columns={columns}
            data={reviews}
            page={queryParameters.page}
            userPaginationChange={({ pageIndex }) => updatePage(pageIndex)}
            paginationData={paginationData}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Modal
        open={openModal}
        content={selectedReview ? <ReviewDetails review={selectedReview} /> : null}
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
        setState={setOpenModal}
        showClose={true}
      />

      <Confirmation
        {...confirmation}
        showClose={true}
        setState={handleConfirmationClose}
        isLoading={isConfirmationLoading}
      />
    </>
  );
};

export default ReviewsPage;

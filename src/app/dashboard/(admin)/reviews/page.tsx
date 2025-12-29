'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IReview } from '@/types/review.interface';
import { PaginationData, TableData } from '@/components/ui/table';
import React, { FormEvent, JSX, useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { Search } from 'lucide-react';
import { OrderDirection } from '@/types/shared.enum';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { getReviews, completeReview } from '@/lib/features/reviews/reviewsThunk';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/useSearch';
import { Modal, Confirmation, ConfirmationProps } from '@/components/ui/dialog';
import { ReviewDetails } from './_components/reviewDetails';
import { useDropdownAction } from '@/hooks/useDropdownAction';
import { DoctorCell, RatingCell, StatusCell, CommentCell, ActionsCell } from './_components/reviewTableCells';

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
          onView={handleViewReview}
          onComplete={handleConfirmationOpen}
          completeReview={completeReview}
        />
      ),
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

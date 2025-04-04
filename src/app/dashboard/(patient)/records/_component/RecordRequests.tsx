'use client';
import { AvatarWithName } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Confirmation, ConfirmationProps } from '@/components/ui/dialog';
import { ActionsDropdownMenus, ISelected, OptionsMenu } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TableData } from '@/components/ui/table';
import { useDropdownAction } from '@/hooks/useDropdownAction';
import { useSearch } from '@/hooks/useSearch';
import { IRecordRequest } from '@/types/appointment.interface';
import { ApproveDeclineStatus, OrderDirection } from '@/types/shared.enum';
import { ColumnDef } from '@tanstack/react-table';
import { Ban, ListFilter, Search, SendHorizontal, Signature } from 'lucide-react';
import moment from 'moment';
import React, { FormEvent, JSX, useState } from 'react';
import { StatusBadge } from '@/components/ui/statusBadge';
import { useFetchPaginatedData } from '@/hooks/useFetchPaginatedData';
import {
  acceptRecordRequest,
  declineRecordRequest,
  getRecordRequests,
} from '@/lib/features/records/recordsThunk';

const RecordRequests = (): JSX.Element => {
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const { isLoading, setQueryParameters, paginationData, queryParameters, tableData, updatePage } =
    useFetchPaginatedData<IRecordRequest, ApproveDeclineStatus | ''>(getRecordRequests, {
      orderBy: 'createdAt',
      orderDirection: OrderDirection.Descending,
      page: 1,
      search: '',
      status: '',
    });
  const { searchTerm, handleSearch } = useSearch(handleSubmit);

  const statusFilterOptions: ISelected[] = [
    {
      value: '',
      label: 'All',
    },
    {
      value: ApproveDeclineStatus.Approved,
      label: 'Approved',
    },
    {
      value: ApproveDeclineStatus.Pending,
      label: 'Pending',
    },
    {
      value: ApproveDeclineStatus.Declined,
      label: 'Disapproved',
    },
  ];
  const columns: ColumnDef<IRecordRequest>[] = [
    {
      accessorKey: 'doctor',
      header: () => <div className="flex cursor-pointer whitespace-nowrap">Doctor&#39;s Name</div>,
      cell: ({ row: { original } }): JSX.Element => {
        const { doctor } = original;
        return (
          <AvatarWithName
            imageSrc={doctor.profilePicture}
            firstName={doctor.firstName}
            lastName={doctor.lastName}
          />
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date Requested',
      cell: ({ row: { original } }): string => moment(original.createdAt).format('LL'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }): JSX.Element => (
        <StatusBadge status={original.status} declinedTitle="Disapproved" />
      ),
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row: { original } }): JSX.Element => {
        const { status, doctor, id } = original;
        const isPending = status === ApproveDeclineStatus.Pending;
        const isApproved = status === ApproveDeclineStatus.Approved;
        const isDeclined = status === ApproveDeclineStatus.Declined;
        const doctorName = `${doctor.firstName} ${doctor.lastName}`;
        return (
          <ActionsDropdownMenus
            menuContent={[
              {
                title: (
                  <>
                    <Signature /> Approve
                  </>
                ),
                clickCommand: () =>
                  handleConfirmationOpen(
                    'Accept',
                    `grant ${doctorName}'s access to your records`,
                    id,
                    acceptRecordRequest,
                    'Yes, accept',
                    'Cancel',
                  ),
                visible: isPending || isDeclined,
              },
              {
                title: (
                  <>
                    <Ban /> Disapprove
                  </>
                ),
                clickCommand: () =>
                  handleConfirmationOpen(
                    'Decline',
                    `disapprove ${doctorName}'s access`,
                    id,
                    declineRecordRequest,
                    'Yes, disapprove',
                    'Cancel',
                  ),
                visible: isPending || isApproved,
              },
            ]}
          />
        );
      },
    },
  ];

  const { isConfirmationLoading, handleConfirmationOpen, handleConfirmationClose } =
    useDropdownAction({
      setConfirmation,
      setQueryParameters,
    });

  function handleSubmit(event: FormEvent<HTMLFormElement>, search?: string): void {
    event.preventDefault();
    setQueryParameters((prev) => ({
      ...prev,
      page: 1,
      search: search ?? searchTerm,
    }));
  }

  return (
    <div>
      <Confirmation
        {...confirmation}
        showClose={true}
        setState={() => handleConfirmationClose()}
        isLoading={isConfirmationLoading}
      />
      <div className="flex justify-between">
        <form className="flex" onSubmit={handleSubmit}>
          <Input
            error=""
            placeholder="Search by doctor's name"
            className="max-w-[333px] sm:w-[333px]"
            type="search"
            leftIcon={<Search className="cursor-pointer text-gray-500" size={20} />}
            onChange={handleSearch}
          />
          {searchTerm && <Button child={<SendHorizontal />} className="ml-2" />}
        </form>
        <OptionsMenu
          options={statusFilterOptions}
          Icon={ListFilter}
          menuTrigger="Status"
          selected={queryParameters.status}
          setSelected={(value) =>
            setQueryParameters((prev) => ({
              ...prev,
              page: 1,
              status: value as ApproveDeclineStatus,
            }))
          }
          className="h-10 cursor-pointer bg-gray-50 sm:flex"
        />
      </div>
      <div className="mt-5">
        <TableData
          columns={columns}
          page={queryParameters.page}
          data={tableData}
          paginationData={paginationData}
          userPaginationChange={({ pageIndex }) => updatePage(pageIndex)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default RecordRequests;

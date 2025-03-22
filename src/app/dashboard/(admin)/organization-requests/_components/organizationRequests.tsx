'use client';
import { ColumnDef } from '@tanstack/react-table';
import { IHospital } from '@/types/hospital.interface';
import { PaginationData, TableData } from '@/components/ui/table';
import React, { FormEvent, JSX, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Ban, Ellipsis, ListFilter, Search, SendHorizontal, Signature } from 'lucide-react';
import { ApproveDeclineStatus, OrderDirection } from '@/types/shared.enum';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ISelected,
  OptionsMenu,
} from '@/components/ui/dropdown-menu';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import {
  approveOrganizationRequest,
  declineOrganizationRequest,
  getOrganizationRequests,
} from '@/lib/features/organization-requests/organizationRequestsThunk';
import OrganizationRequestsStats from '@/app/dashboard/(admin)/organization-requests/_components/organizationRequestsStats';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/useSearch';
import { Confirmation, ConfirmationProps } from '@/components/ui/dialog';
import { getFormattedDate } from '@/lib/date';
import { useDropdownAction } from '@/hooks/useDropdownAction';

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
    label: 'Rejected',
  },
];

const OrganizationRequests = (): JSX.Element => {
  const [requests, setRequests] = useState<IHospital[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const { searchTerm, handleSearch } = useSearch(handleSubmit);
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(({ organizationRequests }) => organizationRequests.isLoading);
  const [queryParameters, setQueryParameters] = useState<IQueryParams<ApproveDeclineStatus | ''>>({
    page: 1,
    orderDirection: OrderDirection.Descending,
    orderBy: 'createdAt',
    search: '',
    status: '',
  });
  const { handleDropdownAction, isConfirmationLoading } = useDropdownAction({
    setConfirmation,
    setQueryParameters,
  });

  useEffect(() => {
    const fetchHospitals = async (): Promise<void> => {
      const { payload } = await dispatch(getOrganizationRequests(queryParameters));
      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }
      if (payload) {
        const { rows, ...pagination } = payload as IPagination<IHospital>;
        setRequests(rows);
        setPaginationData(pagination);
      }
    };
    void fetchHospitals();
  }, [queryParameters]);

  function handleSubmit(event: FormEvent<HTMLFormElement>, search?: string): void {
    event.preventDefault();
    setQueryParameters((prev) => ({
      ...prev,
      page: 1,
      search: search ?? searchTerm,
    }));
  }

  const columns: ColumnDef<IHospital>[] = [
    {
      accessorKey: 'id',
    },
    {
      accessorKey: 'name',
      header: 'Hospital Name',
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }): JSX.Element => {
        switch (row.getValue('status')) {
          case ApproveDeclineStatus.Approved:
            return <Badge variant="default">Approved</Badge>;
          case ApproveDeclineStatus.Declined:
            return <Badge variant="destructive">Declined</Badge>;
          default:
            return <Badge variant="brown">Pending</Badge>;
        }
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Created',
      cell: ({ row }) => getFormattedDate(row.getValue('createdAt')),
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }): JSX.Element | false => {
        const isPending = row.getValue('status') === ApproveDeclineStatus.Pending;
        return (
          isPending && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Ellipsis className="cursor-pointer text-sm text-gray-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    setConfirmation((prev) => ({
                      ...prev,
                      open: true,
                      acceptCommand: () =>
                        handleDropdownAction(
                          approveOrganizationRequest,
                          String(row.getValue('id')),
                        ),
                      acceptButtonTitle: 'Yes, Approve',
                      rejectButtonTitle: 'Cancel',
                      rejectCommand: () =>
                        setConfirmation((prev) => ({
                          ...prev,
                          open: false,
                        })),
                      description: `Are you sure you want to approve this request?`,
                    }))
                  }
                >
                  <Signature />
                  <span>Approve</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    setConfirmation((prev) => ({
                      ...prev,
                      open: true,
                      acceptCommand: () =>
                        handleDropdownAction(
                          declineOrganizationRequest,
                          String(row.getValue('id')),
                        ),
                      rejectButtonTitle: 'Cancel',
                      acceptButtonTitle: 'Yes, Decline',
                      rejectCommand: () =>
                        setConfirmation((prev) => ({
                          ...prev,
                          open: false,
                        })),
                      description: `Are you sure you want to decline this request?`,
                    }))
                  }
                >
                  <Ban />
                  <span>Decline</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        );
      },
    },
  ];

  return (
    <>
      <div className="pb-[80px]">
        <div className="flex flex-col">
          <span className="text-[32px] font-bold">Organization Requests</span>
        </div>
        <OrganizationRequestsStats />
        <div className="mt-4 rounded-lg bg-white">
          <div className="p-6">
            <div className="mb-4 flex flex-wrap justify-between">
              <div className="mb-2 flex gap-2">
                <form className="flex" onSubmit={handleSubmit}>
                  <Input
                    error=""
                    placeholder="Search by name or location"
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
                  menuTrigger="Filter Status"
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
            </div>
            <TableData
              isLoading={isLoading}
              columns={columns}
              columnVisibility={{ id: false }}
              data={requests}
              userPaginationChange={({ pageIndex }) =>
                setQueryParameters((prev) => ({
                  ...prev,
                  page: pageIndex + 1,
                }))
              }
              paginationData={paginationData}
              page={queryParameters.page}
            />
          </div>
        </div>
      </div>
      <Confirmation
        {...confirmation}
        showClose={true}
        setState={() =>
          setConfirmation((prev) => ({
            ...prev,
            open: false,
          }))
        }
        isLoading={isConfirmationLoading}
      />
    </>
  );
};

export default OrganizationRequests;

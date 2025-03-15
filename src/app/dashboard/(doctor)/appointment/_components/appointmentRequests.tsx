'use client';
import { AvatarWithName } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Confirmation, ConfirmationProps } from '@/components/ui/dialog';
import { ActionsDropdownMenus, ISelected, OptionsMenu } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PaginationData, TableData } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useDropdownAction } from '@/hooks/useDropdownAction';
import { useSearch } from '@/hooks/useSearch';
import { acceptAppointment, getAppointment } from '@/lib/features/appointments/appointmentsThunk';
import { selectUser } from '@/lib/features/auth/authSelector';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import { AppointmentType, IAppointmentRequest } from '@/types/appointment.interface';
import { AppointmentStatus } from '@/types/shared.enum';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { ColumnDef } from '@tanstack/react-table';
import {
  House,
  ListFilter,
  Presentation,
  RotateCcw,
  Search,
  SendHorizontal,
  Signature,
} from 'lucide-react';
import moment from 'moment';
import React, { FormEvent, JSX, useEffect, useState } from 'react';
import { StatusBadge } from '@/components/ui/statusBadge';

type RequestColumnsProps = {
  id: string;
  firstName: string;
  lastName: string;
  status: AppointmentStatus;
  type: AppointmentType;
  date: string;
  time: string;
  profilePicture: string | null;
};

const AppointmentRequests = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [queryParameters, setQueryParameters] = useState<IQueryParams<AppointmentStatus | ''>>({
    doctorId: user?.id,
    page: 1,
    search: '',
    status: '',
  });
  const [requestData, setRequestData] = useState<RequestColumnsProps[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });

  const statusFilterOptions: ISelected[] = [
    {
      value: '',
      label: 'All',
    },
    {
      value: AppointmentStatus.Accepted,
      label: 'Accepted',
    },
    {
      value: AppointmentStatus.Pending,
      label: 'Pending',
    },
  ];
  const columns: ColumnDef<RequestColumnsProps>[] = [
    {
      accessorKey: 'patient',
      header: () => <div className="flex cursor-pointer whitespace-nowrap">Patient Name</div>,
      cell: ({ row: { original } }): JSX.Element => {
        const { firstName, lastName, profilePicture } = original;
        return (
          <AvatarWithName
            imageSrc={profilePicture ?? ''}
            firstName={firstName}
            lastName={lastName}
          />
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row: { original } }): JSX.Element => {
        const { type } = original;
        const virtual = type === AppointmentType.Virtual;
        return virtual ? (
          <div className="flex items-center gap-2">
            <Presentation size={16} /> Virtual
          </div>
        ) : (
          <div>
            <House size={16} /> Visit
          </div>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'time',
      header: () => <div className="flex cursor-pointer whitespace-nowrap">Time</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }): JSX.Element => (
        <StatusBadge status={original.status} approvedTitle="Accepted" />
      ),
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row: { original } }): JSX.Element => {
        const { status, firstName, lastName, id } = original;
        const isPending = status === AppointmentStatus.Pending;
        return isPending ? (
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
                    `accept ${firstName} ${lastName}'s appointment request`,
                    id,
                    acceptAppointment,
                  ),
              },
              {
                title: (
                  <>
                    <RotateCcw /> Reschedule
                  </>
                ),
                clickCommand: () =>
                  handleConfirmationOpen(
                    'Reschedule',
                    `reschedule ${firstName} ${lastName}'s request`,
                    id,
                    acceptAppointment,
                  ),
              },
            ]}
          />
        ) : (
          <div />
        );
      },
      enableHiding: false,
    },
  ];

  useEffect(() => {
    async function getAppointments(): Promise<void> {
      setIsTableLoading(true);
      const { payload } = await dispatch(getAppointment(queryParameters));
      setIsTableLoading(false);
      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }

      if (payload) {
        const { rows, ...pagination } = payload as IPagination<IAppointmentRequest>;
        const requestData = rows.map(
          ({ id, patient: { firstName, lastName, profilePicture }, status, slot }) => ({
            id: String(id),
            firstName,
            lastName,
            status,
            type: slot!.type,
            time: moment(slot!.startTime).format('hh:mm A'),
            date: moment(slot!.date).format('LL'),
            profilePicture,
          }),
        );
        setPaginationData(pagination);
        setRequestData(requestData);
      }
    }

    void getAppointments();
  }, [queryParameters]);

  const { isConfirmationLoading, handleConfirmationOpen, handleConfirmationClose } =
    useDropdownAction({
      setConfirmation,
      setQueryParameters,
    });
  const { searchTerm, handleSearch } = useSearch(handleSubmit);

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
      <div className="flex justify-between">
        <form className="flex" onSubmit={handleSubmit}>
          <Input
            error=""
            placeholder="Search by patient"
            className="max-w-[333px] sm:w-[333px]"
            type="search"
            leftIcon={<Search className="cursor-pointer text-gray-500" size={20} />}
            onChange={handleSearch}
          />
          {searchTerm && <Button child={<SendHorizontal />} className="-ml-8" />}
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
              status: value as AppointmentStatus,
            }))
          }
          className="h-10 cursor-pointer bg-gray-50 sm:flex"
        />
      </div>
      <div className="mt-5">
        <TableData
          columns={columns}
          data={requestData}
          paginationData={paginationData}
          columnVisibility={{ id: false }}
          isLoading={isTableLoading}
        />
      </div>
      <Confirmation
        {...confirmation}
        showClose={true}
        setState={() => handleConfirmationClose()}
        isLoading={isConfirmationLoading}
      />
    </div>
  );
};

export default AppointmentRequests;

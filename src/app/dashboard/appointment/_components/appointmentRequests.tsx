'use client';
import { AvatarWithName } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Confirmation, ConfirmationProps } from '@/components/ui/dialog';
import { ActionsDropdownMenus, ISelected, OptionsMenu } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TableData } from '@/components/ui/table';
import { useDropdownAction } from '@/hooks/useDropdownAction';
import { useSearch } from '@/hooks/useSearch';
import { acceptAppointment, declineAppointment, getAppointments } from '@/lib/features/appointments/appointmentsThunk';
import { selectUser } from '@/lib/features/auth/authSelector';
import { useAppSelector } from '@/lib/hooks';
import { AppointmentType, IAppointment } from '@/types/appointment.interface';
import { AppointmentStatus, OrderDirection, Role } from '@/types/shared.enum';
import { ColumnDef } from '@tanstack/react-table';
import {
  Ban,
  House,
  ListFilter,
  Presentation,
  RotateCcw,
  Search,
  SendHorizontal,
  Signature,
} from 'lucide-react';
import moment from 'moment';
import React, { FormEvent, JSX, useState } from 'react';
import { StatusBadge } from '@/components/ui/statusBadge';
import { useFetchPaginatedData } from '@/hooks/useFetchPaginatedData';

const AppointmentRequests = (): JSX.Element => {
  const { role, id } = useAppSelector(selectUser)!;
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const { isLoading, setQueryParameters, paginationData, queryParameters, tableData, updatePage } =
    useFetchPaginatedData<IAppointment, AppointmentStatus | ''>(getAppointments, {
      orderBy: 'createdAt',
      orderDirection: OrderDirection.Descending,
      doctorId: role === Role.Doctor ? id : undefined,
      patientId: role === Role.Patient ? id : undefined,
      page: 1,
      search: '',
      status: '',
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
  const columns: ColumnDef<IAppointment>[] = [
    {
      accessorKey: 'patient',
      header: () => <div className="flex cursor-pointer whitespace-nowrap">Patient Name</div>,
      cell: ({ row: { original } }): JSX.Element => {
        const { doctor, patient } = original;
        const isDoctor = role === Role.Doctor;
        return (
          <AvatarWithName
            imageSrc={isDoctor ? patient.profilePicture : doctor.profilePicture}
            firstName={isDoctor ? patient.firstName : doctor.firstName}
            lastName={isDoctor ? patient.lastName : doctor.lastName}
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
      cell: ({ row: { original } }): string => moment(original.slot.date).format('LL'),
    },
    {
      accessorKey: 'time',
      header: 'Time',
      cell: ({ row: { original } }): string => moment(original.slot.startTime).format('hh:mm A'),
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
        const { status, patient, doctor, id } = original;
        const isPending = status === AppointmentStatus.Pending;
        const isDone = status === AppointmentStatus.Completed;
        const getName = (): string => {
          if (role === Role.Patient) {
            return `${doctor.firstName} ${doctor.lastName}`;
          }
          return `${patient.firstName} ${patient.lastName}`;
        };
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
                    `accept ${getName()}'s appointment request`,
                    id,
                    acceptAppointment,
                    'Yes, accept',
                    'Cancel'
                  ),
                visible: role === Role.Doctor && isPending,
              },
              {
                title: (
                  <>
                    <Ban /> Cancel
                  </>
                ),
                clickCommand: () =>
                  handleConfirmationOpen(
                    'Decline',
                    `decline ${getName()}'s appointment request`,
                    id,
                    declineAppointment,
                    'Yes, decline',
                    'Cancel'
                  ),
                visible: !isDone,
              },
              // TODO: Is a refund functionality feasible???
              {
                title: (
                  <>
                    <RotateCcw /> Reschedule
                  </>
                ),
                clickCommand: () =>
                  handleConfirmationOpen(
                    'Reschedule',
                    `reschedule ${getName()}'s request`,
                    id,
                    acceptAppointment,
                  ),
              },
            ]}
          />
        );
      },
      enableHiding: false,
    },
  ];

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
          page={queryParameters.page}
          data={tableData}
          paginationData={paginationData}
          userPaginationChange={({ pageIndex }) => updatePage(pageIndex)}
          isLoading={isLoading}
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

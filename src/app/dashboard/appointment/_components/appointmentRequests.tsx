'use client';
import { AvatarWithName } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Confirmation, ConfirmationProps, Modal } from '@/components/ui/dialog';
import { ActionsDropdownMenus, ISelected, OptionsMenu } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TableData } from '@/components/ui/table';
import { useDropdownAction } from '@/hooks/useDropdownAction';
import { useSearch } from '@/hooks/useSearch';
import {
  acceptAppointment,
  assignAppointment,
  declineAppointment,
  getAppointments,
} from '@/lib/features/appointments/appointmentsThunk';
import { selectUser } from '@/lib/features/auth/authSelector';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AppointmentType, IAppointment } from '@/types/appointment.interface';
import { AcceptDeclineStatus, AppointmentStatus, OrderDirection, Role } from '@/types/shared.enum';
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
  Waypoints,
} from 'lucide-react';
import moment from 'moment';
import React, { FormEvent, JSX, useState } from 'react';
import { StatusBadge } from '@/components/ui/statusBadge';
import { useFetchPaginatedData } from '@/hooks/useFetchPaginatedData';
import { IDoctor } from '@/types/doctor.interface';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getAllDoctors } from '@/lib/features/doctors/doctorsThunk';
import { Toast, toast } from '@/hooks/use-toast';

type SelectedAppointment = {
  date: Date;
  appointmentId: string;
};
const AppointmentRequests = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment>({
    date: new Date(),
    appointmentId: '',
  });

  const { isLoading, setQueryParameters, paginationData, queryParameters, tableData, updatePage } =
    useFetchPaginatedData<IAppointment, AppointmentStatus | ''>(getAppointments, {
      orderBy: 'createdAt',
      orderDirection: OrderDirection.Descending,
      doctorId: user?.role === Role.Doctor ? user?.id : undefined,
      patientId: user?.role === Role.Patient ? user?.id : undefined,
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
        const isDoctor = user?.role === Role.Doctor;
        const isAdmin = user?.role === Role.Admin || user?.role === Role.SuperAdmin;
        return (
          <AvatarWithName
            imageSrc={isDoctor || isAdmin ? patient.profilePicture : doctor.profilePicture}
            firstName={isDoctor || isAdmin ? patient.firstName : doctor.firstName}
            lastName={isDoctor || isAdmin ? patient.lastName : doctor.lastName}
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
        const { status, patient, doctor, id, createdAt } = original;
        const isPending = status === AppointmentStatus.Pending;
        const isDone = status === AppointmentStatus.Completed;
        const getName = (): string => {
          if (user?.role === Role.Patient) {
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
                    'Cancel',
                  ),
                visible: user?.role === Role.Doctor && isPending,
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
                    'Cancel',
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
              {
                title: (
                  <>
                    <Waypoints /> Assign to a Doctor
                  </>
                ),
                clickCommand: (): void => {
                  setOpenModal(true);
                  setSelectedAppointment({
                    date: new Date(createdAt),
                    appointmentId: id,
                  });
                },
                visible: user?.role === Role.Admin || user?.role === Role.SuperAdmin,
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

      <Modal
        open={openModal}
        content={
          <AvailableDoctors
            closeModal={() => setOpenModal(false)}
            appointment={selectedAppointment}
          />
        }
        showClose={true}
        setState={setOpenModal}
      />
    </div>
  );
};

export default AppointmentRequests;

type AvailableDoctorsProps = {
  closeModal: () => void;
  appointment: SelectedAppointment;
};
const AvailableDoctors = ({ closeModal, appointment }: AvailableDoctorsProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { date, appointmentId } = appointment;
  const [doctorId, setDoctorId] = useState('');
  const [isAssignRequestLoading, setIsAssignRequestLoading] = useState(false);
  const initialQueryParameters = {
    page: 1,
    orderDirection: OrderDirection.Descending,
    orderBy: 'createdAt',
    status: '' as AcceptDeclineStatus,
    search: '',
    startDate: date,
    pageSize: 100,
  };
  const { isLoading, tableData } = useFetchPaginatedData<IDoctor>(
    getAllDoctors,
    initialQueryParameters,
  );

  async function assignDoctor(): Promise<void> {
    setIsAssignRequestLoading(true);
    const { payload } = await dispatch(assignAppointment({ appointmentId, doctorId }));
    toast(payload as Toast);
    setIsAssignRequestLoading(false);
    closeModal();
  }

  return (
    <div>
      <p className="font-medium"> Available Doctors</p>
      {!isLoading ? (
        <div className="mt-2 max-h-[300px] overflow-y-auto">
          <RadioGroup>
            {tableData.map(({ firstName, lastName, id }) => (
              <div className="mt-2 flex items-center space-x-2" key={id}>
                <RadioGroupItem value={id} id={id} onClick={() => setDoctorId(id)} />
                <Label htmlFor={id} className="font-normal">
                  {firstName} {lastName}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ) : (
        <div className="mt-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex animate-pulse items-center space-x-4">
              <div className="flex flex-row gap-4 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-300" />
                <div className="h-4 w-48 rounded bg-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && !tableData.length && <div>Sorry, no doctors available at the moment.</div>}
      <div className="mt-6 flex justify-end gap-2">
        <Button child={'Cancel'} variant={'ghost'} onClick={closeModal} />
        <Button
          child={'Assign Request'}
          variant={'default'}
          onClick={assignDoctor}
          disabled={!doctorId || isAssignRequestLoading}
          isLoading={isAssignRequestLoading}
        />
      </div>
    </div>
  );
};

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
  rescheduleAppointment,
} from '@/lib/features/appointments/appointmentsThunk';
import { joinConsultation } from '@/lib/features/appointments/consultation/consultationThunk';
import { selectUser, selectExtra, selectOrganizationId } from '@/lib/features/auth/authSelector';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { IAppointment } from '@/types/appointment.interface';
import { AppointmentType } from '@/types/slots.interface';
import { AcceptDeclineStatus, OrderDirection, Role } from '@/types/shared.enum';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { ColumnDef } from '@tanstack/react-table';
import {
  Ban,
  Calendar as CalendarIcon,
  House,
  ListFilter,
  Loader2,
  Presentation,
  RotateCcw,
  Search,
  SendHorizontal,
  Signature,
  Video,
  View,
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
import { useRouter } from 'next/navigation';
import { NotificationEvent } from '@/types/notification.interface';
import useWebSocket from '@/hooks/useWebSocket';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '@/schemas/booking.schema';
import { IBookingForm } from '@/types/booking.interface';
import { MODE } from '@/constants/constants';
import { SlotSelectionModal } from '@/components/ui/slotSelectionModal';
import { showErrorToast } from '@/lib/utils';

type SelectedAppointment = {
  date: Date;
  appointmentId: string;
};

type RescheduleAppointment = {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorProfilePicture: string;
  specializations?: string[];
  experience?: number;
  noOfConsultations?: number;
};

const AppointmentRequests = (): JSX.Element => {
  const { on } = useWebSocket();
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const extra = useAppSelector(selectExtra);
  const orgId = useAppSelector(selectOrganizationId);
  const dispatch = useAppDispatch();
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
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false);
  const [rescheduleAppointmentData, setRescheduleAppointmentData] =
    useState<RescheduleAppointment | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [joiningAppointmentId, setJoiningAppointmentId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { register, setValue, getValues, watch, reset } = useForm<IBookingForm>({
    resolver: zodResolver(bookingSchema),
    mode: MODE.ON_TOUCH,
  });

  // Get hospital ID from extra if user is a hospital
  const hospitalId =
    user?.role === Role.Hospital && extra && 'id' in extra ? (extra as { id: string }).id : undefined;

  const {
    isLoading,
    setQueryParameters,
    paginationData,
    queryParameters,
    tableData,
    updatePage,
    refetch,
  } = useFetchPaginatedData<IAppointment, AppointmentStatus | ''>(getAppointments, {
    orderBy: 'createdAt',
    orderDirection: OrderDirection.Descending,
    doctorId: user?.role === Role.Doctor ? user?.id : undefined,
    patientId: user?.role === Role.Patient ? user?.id : undefined,
    orgId: user?.role === Role.Hospital ? hospitalId : user?.role === Role.Admin ? orgId : undefined,
    page: 1,
    search: '',
    status: '',
  });

  on(NotificationEvent.NewRequest, () => {
    void refetch();
  });

  const statusFilterOptions: ISelected[] = [
    { value: '', label: 'All' },
    { value: AppointmentStatus.Pending, label: 'Pending' },
    { value: AppointmentStatus.Accepted, label: 'Accepted' },
    { value: AppointmentStatus.Progress, label: 'In Progress' },
    { value: AppointmentStatus.Completed, label: 'Completed' },
    { value: AppointmentStatus.Cancelled, label: 'Cancelled' },
    { value: AppointmentStatus.Declined, label: 'Declined' },
    { value: AppointmentStatus.Incomplete, label: 'Incomplete' },
  ];
  const columns: ColumnDef<IAppointment>[] = [
    {
      accessorKey: 'patient',
      header: () => (
        <div className="flex cursor-pointer whitespace-nowrap">
          {user?.role === Role.Doctor || user?.role === Role.Hospital
            ? 'Patient Name'
            : 'Doctor Name'}
        </div>
      ),
      cell: ({ row: { original } }): JSX.Element => {
        const { doctor, patient } = original;
        const isDoctor = user?.role === Role.Doctor;
        const isHospital = user?.role === Role.Hospital;
        const isAdmin = user?.role === Role.Admin || user?.role === Role.SuperAdmin;
        return (
          <AvatarWithName
            imageSrc={isDoctor || isAdmin || isHospital ? patient.profilePicture : doctor.profilePicture}
            firstName={isDoctor || isAdmin || isHospital ? patient.firstName : doctor.firstName}
            lastName={isDoctor || isAdmin || isHospital ? patient.lastName : doctor.lastName}
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
        <StatusBadge
          status={original.status}
          approvedTitle="Accepted"
          destructiveTitle="Cancelled"
        />
      ),
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row: { original } }): JSX.Element => {
        const { status, patient, doctor, id, createdAt } = original;
        const isPending = status === AppointmentStatus.Pending;
        const isInProgress = status === AppointmentStatus.Progress;
        const isDone = status === AppointmentStatus.Completed;
        const isCancelled = status === AppointmentStatus.Cancelled;
        const getName = (): string => {
          if (user?.role === Role.Patient) {
            return `${doctor.firstName} ${doctor.lastName}`;
          }
          if (user?.role === Role.Hospital) {
            return `${patient.firstName} ${patient.lastName}`;
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
                visible: !isDone && !isCancelled,
              },
              // TODO: Is a refund functionality feasible???
              {
                title: (
                  <>
                    <RotateCcw /> Reschedule
                  </>
                ),
                clickCommand: (): void => {
                  setRescheduleAppointmentData({
                    appointmentId: id,
                    doctorId: doctor.id,
                    doctorName: `${doctor.firstName} ${doctor.lastName}`,
                    doctorProfilePicture: doctor.profilePicture,
                    specializations: doctor.specializations,
                    experience: doctor.experience,
                    noOfConsultations: doctor.noOfConsultations,
                  });
                  setOpenRescheduleModal(true);
                  reset();
                },
                visible: !isDone && !isCancelled && !isInProgress,
              },
              {
                title: (
                  <>
                    {joiningAppointmentId === id ? <Loader2 className="animate-spin" /> : <Video />}{' '}
                    {joiningAppointmentId === id ? 'Joining...' : 'Join Meeting'}
                  </>
                ),
                clickCommand: (): void => {
                  if (!joiningAppointmentId) {
                    void handleJoinMeeting(id);
                  }
                },
                visible: !isDone && !isCancelled,
              },
              {
                title: (
                  <>
                    <View /> View Consultation
                  </>
                ),
                clickCommand: (): void => {
                  if (user?.role === Role.Doctor || user?.role === Role.Hospital) {
                    router.push(`/dashboard/patients/${patient.id}?appointmentId=${id}`);
                  } else {
                    router.push(`/dashboard/consultation-patient/${id}`);
                  }
                },
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

  const handleReschedule = async (): Promise<void> => {
    if (!rescheduleAppointmentData) {
      return;
    }

    const { slotId } = getValues();
    if (!slotId) {
      toast({
        title: 'Error',
        description: 'Please select a time slot',
        variant: 'destructive',
      });
      return;
    }

    setIsRescheduling(true);

    const { payload } = await dispatch(
      rescheduleAppointment({
        slotId,
        appointmentId: rescheduleAppointmentData.appointmentId,
      }),
    );

    if (payload && showErrorToast(payload)) {
      toast(payload);
      setIsRescheduling(false);
      return;
    }

    toast(payload as Toast);
    setIsRescheduling(false);
    setOpenRescheduleModal(false);
    setRescheduleAppointmentData(null);
    reset();
    void refetch();
  };

  const handleJoinMeeting = async (appointmentId: string): Promise<void> => {
    setJoiningAppointmentId(appointmentId);

    const { payload } = await dispatch(joinConsultation(appointmentId));

    if (payload && showErrorToast(payload)) {
      toast(payload);
      setJoiningAppointmentId(null);
      return;
    }

    // Open meeting link in new tab
    const meetingLink = payload as string;
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    }

    setJoiningAppointmentId(null);
  };

  const handleDateChange = (type: 'start' | 'end', value: string): void => {
    const dateVal = value ? new Date(value) : null;
    if (type === 'start') {
      setStartDate(dateVal);
      setQueryParameters((prev) => ({ ...prev, page: 1, startDate: dateVal || undefined }));
      // Validate order
      if (dateVal && endDate && dateVal > endDate) {
        toast({
          title: 'Error',
          description: 'Start date cannot be after end date',
          variant: 'destructive',
        });
      }
    } else {
      setEndDate(dateVal);
      setQueryParameters((prev) => ({ ...prev, page: 1, endDate: dateVal || undefined }));
      if (startDate && dateVal && startDate > dateVal) {
        toast({
          title: 'Error',
          description: 'End date cannot be before start date',
          variant: 'destructive',
        });
      }
    }
  };

  const clearDates = (): void => {
    setStartDate(null);
    setEndDate(null);
    setQueryParameters((prev) => ({ ...prev, page: 1, startDate: undefined, endDate: undefined }));
  };

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
        <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex items-center gap-2">
            <Input
              error=""
              type="date"
              className="w-[150px]"
              placeholder="Start Date"
              value={startDate ? moment(startDate).format('YYYY-MM-DD') : ''}
              leftIcon={<CalendarIcon size={16} />}
              onChange={(e) => handleDateChange('start', e.target.value)}
            />
            {/*Will activate maybe later*/}
            {/*<Input*/}
            {/*  error=""*/}
            {/*  type="date"*/}
            {/*  className="w-[150px]"*/}
            {/*  value={endDate ? moment(endDate).format('YYYY-MM-DD') : ''}*/}
            {/*  leftIcon={<CalendarIcon size={16} />}*/}
            {/*  onChange={(e) => handleDateChange('end', e.target.value)}*/}
            {/*/>*/}
            {(startDate || endDate) && (
              <Button variant="ghost" child="Clear" onClick={clearDates} />
            )}
          </div>
        </div>
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

      {rescheduleAppointmentData && (
        <SlotSelectionModal
          open={openRescheduleModal}
          onCloseAction={() => {
            setOpenRescheduleModal(false);
            setRescheduleAppointmentData(null);
            reset();
          }}
          onConfirmAction={handleReschedule}
          isLoading={isRescheduling}
          doctorId={rescheduleAppointmentData.doctorId}
          doctorName={rescheduleAppointmentData.doctorName}
          doctorProfilePicture={rescheduleAppointmentData.doctorProfilePicture}
          specializations={rescheduleAppointmentData.specializations}
          experience={rescheduleAppointmentData.experience}
          noOfConsultations={rescheduleAppointmentData.noOfConsultations}
          registerAction={register}
          setValueAction={setValue}
          watch={watch}
          title="Reschedule Appointment"
          confirmButtonText="Reschedule"
        />
      )}
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

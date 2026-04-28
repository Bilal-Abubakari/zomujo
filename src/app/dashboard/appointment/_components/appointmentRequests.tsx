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
  cancelAppointment,
  declineAppointment,
  getAppointments,
  rescheduleAppointment,
} from '@/lib/features/appointments/appointmentsThunk';
import { joinConsultation } from '@/lib/features/appointments/consultation/consultationThunk';
import {
  acceptHospitalAppointment,
  assignDoctorToHospitalAppointment,
  declineHospitalAppointment,
  getHospitalAppointments,
} from '@/lib/features/hospital-appointments/hospitalAppointmentsThunk';
import { selectUser, selectOrganizationId } from '@/lib/features/auth/authSelector';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { IAppointment } from '@/types/appointment.interface';
import { IHospitalAppointment } from '@/types/hospital-appointment.interface';
import { AcceptDeclineStatus, OrderDirection, Role } from '@/types/shared.enum';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { AsyncThunk } from '@reduxjs/toolkit';
import { ColumnDef } from '@tanstack/react-table';
import {
  Ban,
  Calendar as CalendarIcon,
  CalendarClock,
  FileText,
  House,
  ListFilter,
  Loader2,
  Presentation,
  Search,
  SendHorizontal,
  Signature,
  Video,
  View,
  Waypoints,
} from 'lucide-react';
import moment from 'moment';
import React, { JSX, SyntheticEvent, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/ui/statusBadge';
import { useFetchPaginatedData } from '@/hooks/useFetchPaginatedData';
import { IDoctor } from '@/types/doctor.interface';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getAllDoctors } from '@/lib/features/doctors/doctorsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { NotificationEvent } from '@/types/notification.interface';
import useWebSocket from '@/hooks/useWebSocket';
import { SlotSelectionModal } from '@/components/ui/slotSelectionModal';
import { IBookingForm } from '@/types/booking.interface';
import { AppointmentType } from '@/types/slots.interface';
import { bookingSchema } from '@/schemas/booking.schema';
import PatientDetailsDrawer from './PatientDetailsDrawer';

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
  consultationCount?: number;
};

function getAppointmentType(
  original: IAppointment | IHospitalAppointment,
): AppointmentType | undefined {
  if ('type' in original && original.type) {
    return original.type;
  }
  return original.slot?.type;
}

const AppointmentRequests = (): JSX.Element => {
  const { on } = useWebSocket();
  const user = useAppSelector(selectUser);
  const orgId = useAppSelector(selectOrganizationId);
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAppointmentForDetails, setSelectedAppointmentForDetails] = useState<
    IAppointment | IHospitalAppointment | null
  >(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Use hospital appointments endpoint for hospital role, doctor appointments for others
  const isHospital = user?.role === Role.Hospital;
  const fetchAction = isHospital ? getHospitalAppointments : getAppointments;

  const {
    isLoading,
    setQueryParameters,
    paginationData,
    queryParameters,
    tableData,
    updatePage,
    refetch,
  } = useFetchPaginatedData<IAppointment | IHospitalAppointment, AppointmentStatus | ''>(
    fetchAction as AsyncThunk<
      Toast | IPagination<IAppointment | IHospitalAppointment>,
      IQueryParams<AppointmentStatus | ''>,
      object
    >,
    {
      orderBy: 'createdAt',
      orderDirection: OrderDirection.Descending,
      doctorId: user?.role === Role.Doctor ? user?.id : undefined,
      patientId: user?.role === Role.Patient ? user?.id : undefined,
      orgId: user?.role === Role.Admin ? orgId : undefined,
      page: 1,
      search: '',
      status: '',
    },
  );

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
  const dateSortOptions: ISelected[] = [
    { value: '', label: 'Default' },
    { value: OrderDirection.Ascending, label: 'Ascending' },
    { value: OrderDirection.Descending, label: 'Descending' },
  ];
  const [dateSortDirection, setDateSortDirection] = useState<string>('');
  const [joiningAppointmentId, setJoiningAppointmentId] = useState<string | null>(null);
  const [rescheduleAppointmentData, setRescheduleAppointmentData] =
    useState<RescheduleAppointment | null>(null);
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { register, setValue, watch, reset: resetBookingForm } = useForm<IBookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      reason: 'Reschedule appointment',
      appointmentType: 'doctor',
      additionalInfo: '',
      isFollowUp: false,
      date: '',
    },
  });

  const { isConfirmationLoading, handleConfirmationOpen, handleConfirmationClose } =
    useDropdownAction({
      setConfirmation,
      setQueryParameters,
    });

  async function handleJoinMeeting(appointmentId: string): Promise<void> {
    setJoiningAppointmentId(appointmentId);
    const { payload } = await dispatch(joinConsultation(appointmentId));
    if (payload && showErrorToast(payload)) {
      toast(payload as Toast);
      setJoiningAppointmentId(null);
      return;
    }
    const meetingLink = payload as string;
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    }
    setJoiningAppointmentId(null);
  }

  async function handleReschedule(): Promise<void> {
    if (!rescheduleAppointmentData) {
      return;
    }
    const slotId = watch('slotId');
    if (!slotId) {
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
      toast(payload as Toast);
      setIsRescheduling(false);
      return;
    }
    toast(payload as Toast);
    setIsRescheduling(false);
    setOpenRescheduleModal(false);
    setRescheduleAppointmentData(null);
    resetBookingForm();
    void refetch();
  }

  const isSuperAdmin = user?.role === Role.SuperAdmin;
  const columns: ColumnDef<IAppointment | IHospitalAppointment, unknown>[] = [
    {
      accessorKey: 'patient',
      // prettier-ignore
      header: () => ( //NOSONAR
        <div className="flex cursor-pointer whitespace-nowrap">
          {user?.role === Role.Doctor || user?.role === Role.Hospital || isSuperAdmin
            ? 'Patient Name'
            : 'Doctor Name'}
        </div>
      ),
      // prettier-ignore
      cell: ({ row: { original } }): JSX.Element => { //NOSONAR
        const { doctor, patient } = original;
        const isDoctor = user?.role === Role.Doctor;
        const isHospital = user?.role === Role.Hospital;
        const isAdmin = user?.role === Role.Admin || user?.role === Role.SuperAdmin || isSuperAdmin;
        // Determine which entity to show as "person"
        const person =
          isDoctor || isAdmin || isHospital
            ? patient
            : doctor;
        // Show all possibly available union data (email/contact for admin & superadmin)
        return (
          <AvatarWithName
            imageSrc={person?.profilePicture ?? ''}
            firstName={person?.firstName ?? ''}
            lastName={person?.lastName ?? ''}
            email={isAdmin ? person?.email : undefined}
            contact={isAdmin ? person?.contact : undefined}
          />
        );
      },
    },
    ...(isSuperAdmin
      ? [
          {
            accessorKey: 'doctor',
            header: 'Doctor Name',
            // prettier-ignore
            cell: ({ row: { original } }): JSX.Element => ( //NOSONAR
              <AvatarWithName
                imageSrc={original.doctor?.profilePicture}
                firstName={original.doctor?.firstName}
                lastName={original.doctor?.lastName}
                email={original.doctor?.email}
                contact={original.doctor?.contact}
              />
            ),
          } satisfies ColumnDef<IAppointment | IHospitalAppointment>,
        ]
      : []),
    {
      accessorKey: 'type',
      header: 'Type',
      // prettier-ignore
      cell: ({ row: { original } }): JSX.Element => { //NOSONAR
        const apptType = getAppointmentType(original);
        const virtual = apptType === AppointmentType.Virtual;
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
      cell: ({ row: { original } }): string => {
        // Handle appointments without slots (hospital appointments)
        if (original.slot?.date) {
          return moment(original.slot.date).format('LL');
        }
        // Try to extract date from additionalInfo or use createdAt
        if (original.additionalInfo) {
          const dateMatch = original.additionalInfo.match(/Appointment Date: (.+)/);
          if (dateMatch) {
            return moment(dateMatch[1]).format('LL');
          }
        }
        return moment(original.createdAt).format('LL');
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      // prettier-ignore
      cell: ({ row: { original } }): JSX.Element => ( //NOSONAR
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
      // prettier-ignore
      cell: ({ row: { original } }): JSX.Element => { //NOSONAR
        const { status, patient, doctor, id, createdAt } = original;
        const isPending = status === AppointmentStatus.Pending;
        const isDone = status === AppointmentStatus.Completed;
        const isCancelled = status === AppointmentStatus.Cancelled;
        const isInProgress = status === AppointmentStatus.Progress;
        const apptType = getAppointmentType(original);
        const isVirtual = apptType === AppointmentType.Virtual;
        const getName = (): string => {
          if (user?.role === Role.Patient) {
            return `${doctor?.firstName ?? ''} ${doctor?.lastName ?? ''}`.trim();
          }
          return `${patient?.firstName ?? ''} ${patient?.lastName ?? ''}`.trim();
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
                    isHospital ? acceptHospitalAppointment : acceptAppointment,
                    'Yes, accept',
                    'Cancel',
                  ),
                visible: (user?.role === Role.Doctor || user?.role === Role.Hospital) && isPending,
              },
              {
                title: (
                  <>
                    <Ban />{' '}
                    {user?.role === Role.Doctor || user?.role === Role.Hospital
                      ? 'Decline'
                      : 'Cancel'}
                  </>
                ),
                clickCommand: () =>
                  user?.role === Role.Doctor
                    ? handleConfirmationOpen(
                        'Decline',
                        `decline ${getName()}'s appointment request`,
                        id,
                        declineAppointment,
                        'Yes, decline',
                        'Cancel',
                      )
                    : user?.role === Role.Hospital
                      ? handleConfirmationOpen(
                          'Decline',
                          `decline ${getName()}'s appointment request`,
                          id,
                          declineHospitalAppointment,
                          'Yes, decline',
                          'Cancel',
                        )
                      : handleConfirmationOpen(
                          'Cancel',
                          `cancel your appointment with ${getName()}`,
                          id,
                          cancelAppointment,
                          'Yes, cancel',
                          'No, keep it',
                        ),
                visible: !isDone && !isCancelled,
              },
              {
                title: (
                  <>
                    <FileText /> View Details
                  </>
                ),
                clickCommand: (): void => {
                  setSelectedAppointmentForDetails(original);
                  setIsDrawerOpen(true);
                },
                visible: !isDone && !isCancelled,
              },
              {
                title: (
                  <>
                    <CalendarClock /> Reschedule
                  </>
                ),
                clickCommand: (): void => {
                  if (!doctor) {
                    return;
                  }
                  setRescheduleAppointmentData({
                    appointmentId: id,
                    doctorId: doctor.id,
                    doctorName: `${doctor.firstName} ${doctor.lastName}`,
                    doctorProfilePicture: doctor.profilePicture,
                    specializations: doctor.specializations,
                    experience: doctor.experience,
                    noOfConsultations: doctor.noOfConsultations,
                    consultationCount: doctor.consultationCount,
                  });
                  setOpenRescheduleModal(true);
                  resetBookingForm();
                },
                visible: !isDone && !isCancelled && !isInProgress && Boolean(doctor?.id),
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
                visible: !isDone && !isCancelled && isVirtual,
              },
              {
                title: (
                  <>
                    <View /> View Consultation
                  </>
                ),
                clickCommand: (): void => {
                  if (user?.role === Role.Doctor) {
                    router.push(`/dashboard/patients/${patient?.id}?appointmentId=${id}`);
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
                visible: user?.role === Role.Admin || user?.role === Role.SuperAdmin || user?.role === Role.Hospital,
              },
            ]}
          />
        );
      },
      enableHiding: false,
    },
  ];

  const { searchTerm, handleSearch } = useSearch(handleSubmit);

  const displayAppointments = useMemo(() => {
    if (!dateSortDirection) {
      return tableData;
    }
    const sorted = [...tableData].sort((a, b) => {
      // Handle appointments without slots (hospital appointments)
      const dateA = a.slot?.date ? moment(a.slot.date).valueOf() : moment(a.createdAt).valueOf();
      const dateB = b.slot?.date ? moment(b.slot.date).valueOf() : moment(b.createdAt).valueOf();
      return dateSortDirection === OrderDirection.Ascending ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [tableData, dateSortDirection]);
  const displayPaginationData = paginationData;

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>, search?: string): void {
    event.preventDefault();
    setQueryParameters((prev) => ({
      ...prev,
      page: 1,
      search: search ?? searchTerm,
    }));
  }

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
            className="max-w-83.25 sm:w-83.25"
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
          <OptionsMenu
            options={dateSortOptions}
            Icon={ListFilter}
            menuTrigger="Sort Date"
            selected={dateSortDirection}
            setSelected={(value) => setDateSortDirection(value)}
            className="h-10 cursor-pointer bg-gray-50 sm:flex"
          />
          <div className="flex items-center gap-2">
            <Input
              error=""
              type="date"
              className="w-37.5"
              placeholder="Start Date"
              value={startDate ? moment(startDate).format('YYYY-MM-DD') : ''}
              leftIcon={<CalendarIcon size={16} />}
              onChange={(e) => handleDateChange('start', e.target.value)}
            />
            <Input
              error=""
              type="date"
              className="w-37.5"
              placeholder="End Date"
              value={endDate ? moment(endDate).format('YYYY-MM-DD') : ''}
              leftIcon={<CalendarIcon size={16} />}
              onChange={(e) => handleDateChange('end', e.target.value)}
            />
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
          data={displayAppointments}
          paginationData={displayPaginationData}
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
            isHospital={isHospital}
          />
        }
        showClose={true}
        setState={setOpenModal}
      />

      <PatientDetailsDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedAppointmentForDetails(null);
        }}
        appointment={selectedAppointmentForDetails}
        isHospital={isHospital}
        onActionComplete={() => {
          void refetch();
        }}
      />
      {rescheduleAppointmentData && (
        <SlotSelectionModal
          open={openRescheduleModal}
          onCloseAction={() => {
            setOpenRescheduleModal(false);
            setRescheduleAppointmentData(null);
            resetBookingForm();
          }}
          onConfirmAction={handleReschedule}
          isLoading={isRescheduling}
          doctorId={rescheduleAppointmentData.doctorId}
          doctorName={rescheduleAppointmentData.doctorName}
          doctorProfilePicture={rescheduleAppointmentData.doctorProfilePicture}
          specializations={rescheduleAppointmentData.specializations}
          experience={rescheduleAppointmentData.experience}
          noOfConsultations={rescheduleAppointmentData.noOfConsultations}
          consultationCount={rescheduleAppointmentData.consultationCount}
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
  isHospital?: boolean;
};
const AvailableDoctors = ({
  closeModal,
  appointment,
  isHospital = false,
}: AvailableDoctorsProps): JSX.Element => {
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
    const assignAction = isHospital
      ? assignDoctorToHospitalAppointment({ appointmentId, doctorId })
      : assignAppointment({ appointmentId, doctorId });
    const { payload } = await dispatch(assignAction);
    toast(payload as Toast);
    setIsAssignRequestLoading(false);
    closeModal();
  }

  return (
    <div>
      <p className="font-medium"> Available Doctors</p>
      {isLoading ? (
        <div className="mt-4">
          {Array.from({ length: 5 }).map((value, index) => (
            <div key={`${index}-${value}`} className="flex animate-pulse items-center space-x-4">
              <div className="flex flex-row gap-4 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-300" />
                <div className="h-4 w-48 rounded bg-gray-300" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 max-h-75 overflow-y-auto">
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

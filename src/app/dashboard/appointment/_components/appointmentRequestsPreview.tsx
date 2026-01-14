'use client';
import { AvatarWithName } from '@/components/ui/avatar';
import { TableData } from '@/components/ui/table';
import { selectUser, selectExtra, selectOrganizationId } from '@/lib/features/auth/authSelector';
import { useAppSelector } from '@/lib/hooks';
import { IAppointment } from '@/types/appointment.interface';
import { OrderDirection, Role } from '@/types/shared.enum';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import { JSX } from 'react';
import { StatusBadge } from '@/components/ui/statusBadge';
import { useFetchPaginatedData } from '@/hooks/useFetchPaginatedData';
import { getAppointments } from '@/lib/features/appointments/appointmentsThunk';
import {
  DUMMY_HOSPITAL_APPOINTMENTS,
  ENABLE_DUMMY_APPOINTMENTS,
} from '@/app/dashboard/appointment/_components/dummyHospitalAppointments';

const AppointmentRequestsPreview = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  const extra = useAppSelector(selectExtra);
  const orgId = useAppSelector(selectOrganizationId);

  // Get hospital ID from extra if user is a hospital
  const hospitalId =
    user?.role === Role.Hospital && extra && 'id' in extra ? (extra as { id: string }).id : undefined;

  const {
    isLoading,
    queryParameters,
    tableData,
  } = useFetchPaginatedData<IAppointment, AppointmentStatus | ''>(getAppointments, {
    orderBy: 'createdAt',
    orderDirection: OrderDirection.Descending,
    doctorId: user?.role === Role.Doctor ? user?.id : undefined,
    patientId: user?.role === Role.Patient ? user?.id : undefined,
    orgId: user?.role === Role.Hospital ? hospitalId : user?.role === Role.Admin ? orgId : undefined,
    page: 1,
    search: '',
    status: '',
    pageSize: 3, // Only fetch 3 items for preview
  });

  const shouldUseDummyAppointments =
    ENABLE_DUMMY_APPOINTMENTS &&
    user?.role === Role.Hospital &&
    !isLoading &&
    tableData.length === 0 &&
    !queryParameters.search &&
    !queryParameters.status &&
    !queryParameters.startDate &&
    !queryParameters.endDate;

  const displayAppointments = shouldUseDummyAppointments
    ? DUMMY_HOSPITAL_APPOINTMENTS.slice(0, 3)
    : tableData.slice(0, 3);

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
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row: { original } }): string => moment(original.slot.date).format('LL'),
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
  ];

  return (
    <div>
      <TableData
        columns={columns}
        data={displayAppointments}
        isLoading={isLoading}
        rowCount={3}
        manualPagination={false}
      />
    </div>
  );
};

export default AppointmentRequestsPreview;

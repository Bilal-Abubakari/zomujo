'use client';
import React, { JSX, useEffect, useState } from 'react';
import DateSelector from './dateSelector';
import AppointmentCalendar from './appointmentCalendar';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { OrderDirection, Role } from '@/types/shared.enum';
import { cn, showErrorToast } from '@/lib/utils';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectExtra, selectOrganizationId, selectUser } from '@/lib/features/auth/authSelector';
import { IAppointment } from '@/types/appointment.interface';
import { toast } from '@/hooks/use-toast';
import { getAppointments } from '@/lib/features/appointments/appointmentsThunk';
import { getHospitalAppointments } from '@/lib/features/hospital-appointments/hospitalAppointmentsThunk';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { AppointmentDate, useQueryParam } from '@/hooks/useQueryParam';
import { INotification, NotificationEvent } from '@/types/notification.interface';
import useWebSocket from '@/hooks/useWebSocket';

type AppointmentProps = {
  customClass?: string;
};

type StatusProps = {
  status: AppointmentStatus;
};

const AppointmentPanel = ({ customClass }: AppointmentProps): JSX.Element => {
  const { on } = useWebSocket();
  const [loading, setLoading] = useState(false);
  const user = useAppSelector(selectUser);
  const extra = useAppSelector(selectExtra);
  const organizationId = useAppSelector(selectOrganizationId);
  const hospitalId =
    user?.role === Role.Hospital && extra && 'id' in extra ? (extra as { id: string }).id : undefined;
  const dispatch = useAppDispatch();
  const { getQueryParam } = useQueryParam();
  const selectedDateParam = getQueryParam(AppointmentDate.selectedDate);

  const newToday = moment();
  const startOfWeek = newToday.clone().startOf('isoWeek');
  const endOfWeek = startOfWeek.clone().add(6, 'days');
  const [selectedDate, setSelectedDate] = useState(
    selectedDateParam ? new Date(selectedDateParam) : new Date(),
  );
  const [now, setNow] = useState(moment());
  const isHospital = user?.role === Role.Hospital;
  const [queryParams, setQueryParams] = useState<IQueryParams<AppointmentStatus | ''>>({
    orderDirection: OrderDirection.Ascending,
    doctorId: user?.role === Role.Doctor ? user?.id : undefined,
    patientId: user?.role === Role.Patient ? user?.id : undefined,
    orgId: user?.role === Role.Admin ? organizationId : undefined,
    startDate: startOfWeek.toDate(),
    endDate: endOfWeek.toDate(),
    pageSize: 100,
  });
  const [upcomingAppointment, setUpcomingAppointment] = useState<IAppointment[]>([]);

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      doctorId: user?.role === Role.Doctor ? user?.id : undefined,
      patientId: user?.role === Role.Patient ? user?.id : undefined,
      orgId: user?.role === Role.Admin ? organizationId : undefined,
    }));
  }, [user?.role, user?.id, organizationId]);

  on(NotificationEvent.NewRequest, (data: unknown) => {
    const notification = data as INotification;
    setUpcomingAppointment((prev) => [
      notification.payload.appointment,
      ...prev.filter((req) => req.id !== notification.payload.appointment.id),
    ]);
  });

  useEffect(() => {
    async function getUpcomingAppointments(): Promise<void> {
      setLoading(true);
      const fetchAction = isHospital ? getHospitalAppointments : getAppointments;
      const { payload } = await dispatch(fetchAction(queryParams));
      setLoading(false);

      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }

      const { rows } = payload as IPagination<IAppointment>;
      setUpcomingAppointment(rows);
    }

    void getUpcomingAppointments();
  }, [queryParams, isHospital]);

  const todayAppointmentsCount = upcomingAppointment.filter((appointment) => {
    // Handle appointments without slots (hospital appointments)
    if (appointment.slot?.date) {
      return moment(appointment.slot.date).isSame(selectedDate, 'day');
    }
    // Try to extract date from additionalInfo or use createdAt
    if (appointment.additionalInfo) {
      const dateMatch = appointment.additionalInfo.match(/Appointment Date: (.+)/);
      if (dateMatch) {
        return moment(dateMatch[1]).isSame(selectedDate, 'day');
      }
    }
    return moment(appointment.createdAt).isSame(selectedDate, 'day');
  }).length;

  useEffect(() => {
    const selectedMoment = moment(selectedDate);
    const currentWeekStart = now.clone().startOf('isoWeek');
    const currentWeekEnd = currentWeekStart.clone().add(6, 'days');

    const selectedWeekStart = selectedMoment.clone().startOf('isoWeek');
    const selectedWeekEnd = selectedWeekStart.clone().add(6, 'days');

    if (!selectedMoment.isBetween(currentWeekStart, currentWeekEnd, 'day', '[]')) {
      setNow(moment(selectedDate));
      setQueryParams((prev) => ({
        ...prev,
        startDate: selectedWeekStart.toDate(),
        endDate: selectedWeekEnd.toDate(),
      }));
    }
  }, [selectedDate]);

  return (
    <div
      className={cn(
        'w-[calc(100vw - 48px)] relative flex flex-col justify-baseline overflow-clip rounded-2xl border border-gray-200 bg-white md:w-[calc(100vw-286px-60px)] lg:w-[calc(100vw-316px-264px-48px-16px-16px)]',
        customClass,
      )}
    >
      {loading && <LoadingOverlay />}
      <div className="relative flex flex-col gap-8 border-b border-gray-200 p-6">
        <div className="flex flex-row items-center gap-2.5">
          <p className="truncate text-2xl font-bold">Today&apos;s Appointments</p>
          {(user?.role === Role.Doctor || user?.role === Role.Hospital) && (
            <Badge variant={'brown'}>
              {user?.role === Role.Doctor ? upcomingAppointment.length : todayAppointmentsCount}{' '}
              <span className="ml-1 hidden sm:block">
                {user?.role === Role.Doctor ? 'patients' : 'appointments'}
              </span>
            </Badge>
          )}
        </div>
        <div className="flex flex-row items-center justify-between">
          <DateSelector
            onDecrement={() => setSelectedDate(moment(selectedDate).subtract(1, 'day').toDate())}
            onIncrement={() => setSelectedDate(moment(selectedDate).add(1, 'day').toDate())}
            date={selectedDate}
          />
          <div className="flex h-8 items-center justify-center rounded-lg border bg-white px-3 text-center text-sm">
            Week
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-10">
        <StatusBadge status={AppointmentStatus.Pending} />
        <StatusBadge status={AppointmentStatus.Declined} />
        <StatusBadge status={AppointmentStatus.Accepted} />
      </div>
      <AppointmentCalendar
        className="h-[calc(100vh-356px)]"
        appointments={upcomingAppointment}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default AppointmentPanel;

const statusStyles: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Pending]: 'text-[#93C4F0]',
  [AppointmentStatus.Accepted]: 'text-green-300',
  [AppointmentStatus.Declined]: 'text-red-400',
  [AppointmentStatus.Incomplete]: 'text-red-500',
  [AppointmentStatus.Completed]: 'text-green-400',
  [AppointmentStatus.Progress]: 'text-yellow-400',
  [AppointmentStatus.Cancelled]: 'text-red-400',
};

const StatusBadge: React.FC<StatusProps> = ({ status }) => (
  <div className={`flex items-center gap-2 ${statusStyles[status]}`}>
    <span className="h-2 w-2 rounded-full bg-current" />
    <span className="text-sm font-medium">
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  </div>
);

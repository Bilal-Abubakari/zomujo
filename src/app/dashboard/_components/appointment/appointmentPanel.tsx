'use client';
import React, { JSX, useEffect, useState } from 'react';
import DateSelector from './dateSelector';
import AppointmentCalendar from './appointmentCalendar';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import { AppointmentStatus } from '@/types/shared.enum';
import { cn, showErrorToast } from '@/lib/utils';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';
import { IAppointmentRequest } from '@/types/appointment.interface';
import { toast } from '@/hooks/use-toast';
import { mergeDateAndTime } from '@/lib/date';
import { IAppointmentCardProps } from './appointmentCard';
import { getAppointment } from '@/lib/features/appointments/appointmentsThunk';

type AppointmentProps = {
  customClass?: string;
};

type StatusProps = {
  status: AppointmentStatus;
};

const AppointmentPanel = ({ customClass }: AppointmentProps): JSX.Element => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  const newToday = moment();
  const startOfWeek = newToday.clone().startOf('isoWeek');
  const endOfWeek = startOfWeek.clone().add(6, 'days');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [now, setNow] = useState(moment());
  const [queryParams, setQueryParams] = useState<IQueryParams<''>>({
    doctorId: user?.id,
    startDate: startOfWeek.toDate(),
    endDate: endOfWeek.toDate(),
  });
  const [upcomingAppointment, setUpcomingAppointment] = useState<IAppointmentCardProps[]>([]);

  useEffect(() => {
    async function getUpcomingAppointments(): Promise<void> {
      const { payload } = await dispatch(getAppointment(queryParams));

      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }

      const { rows } = payload as IPagination<IAppointmentRequest>;
      const upcomingAppointments = rows.map(
        ({ id, slot, status, patient: { firstName, lastName } }) => ({
          id: String(id),
          visitType: slot!.type,
          startDate: mergeDateAndTime(slot!.date, slot!.startTime),
          endDate: mergeDateAndTime(slot!.date, slot!.endTime),
          status,
          patient: {
            firstName,
            lastName,
          },
        }),
      );

      setUpcomingAppointment(upcomingAppointments);
    }

    void getUpcomingAppointments();
  }, [queryParams]);

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

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      startDate: selectedDate,
    }));
  }, [selectedDate]);

  return (
    <div
      className={cn(
        'w-[calc(100vw - 48px)] flex flex-col overflow-clip rounded-2xl border border-gray-200 bg-white md:w-[calc(100vw-286px-60px)] lg:w-[calc(100vw-316px-264px-48px-16px-16px)]',
        customClass,
      )}
    >
      <div className="relative flex flex-col gap-8 border-b border-gray-200 p-6">
        <div className="flex flex-row items-center gap-2.5">
          <p className="truncate text-2xl font-bold">Today&apos;s Appointments</p>
          <Badge variant={'brown'}>
            {upcomingAppointment.length} <span className="ml-1 hidden sm:block">patients</span>
          </Badge>
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
        slots={upcomingAppointment}
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
  [AppointmentStatus.Completed]: 'text-green-400',
};

const StatusBadge: React.FC<StatusProps> = ({ status }) => (
  <div className={`flex items-center gap-2 ${statusStyles[status]}`}>
    <span className="h-2 w-2 rounded-full bg-current" />
    <span className="text-sm font-medium">
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  </div>
);

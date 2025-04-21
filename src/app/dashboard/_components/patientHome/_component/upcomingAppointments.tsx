'use client';
import { getCurrentTimeInGMT } from '@/lib/date';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { cn, showErrorToast } from '@/lib/utils';
import { AppointmentStatus, OrderDirection, Role } from '@/types/shared.enum';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';
import { getAppointments } from '@/lib/features/appointments/appointmentsThunk';
import { IAppointment } from '@/types/appointment.interface';
import { toast } from '@/hooks/use-toast';
import { shortDaysOfTheWeek } from '@/constants/constants';

const UpcomingAppointmentCard = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  const [newToday, setNewToday] = useState(moment());
  const startOfWeek = newToday.clone().startOf('isoWeek');
  const endOfWeek = startOfWeek.clone().add(6, 'days');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [upcomingAppointment, setUpcomingAppointment] = useState<IAppointment[]>([]);
  const [visibleAppointment, setVisibleAppointment] = useState<IAppointment[]>([]);
  const [queryParams, setQueryParams] = useState<IQueryParams<AppointmentStatus | ''>>({
    orderDirection: OrderDirection.Ascending,
    doctorId: user?.role === Role.Doctor ? user?.id : undefined,
    patientId: user?.role === Role.Patient ? user?.id : undefined,
    startDate: startOfWeek.toDate(),
    endDate: endOfWeek.toDate(),
    pageSize: 100,
    status: AppointmentStatus.Accepted,
  });

  useEffect(() => {
    async function getUpcomingAppointments(): Promise<void> {
      setIsLoading(true);
      const { payload } = await dispatch(getAppointments(queryParams));
      setIsLoading(false);

      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }

      const { rows } = payload as IPagination<IAppointment>;

      setUpcomingAppointment(rows);
      const todaysAppointment = rows.filter(({ slot: { date } }) =>
        moment(date).isSame(newToday, 'day'),
      );
      setVisibleAppointment(todaysAppointment);
    }

    void getUpcomingAppointments();
  }, [queryParams]);

  function handleWeekChange(week: Date): void {
    setVisibleAppointment([]);
    setQueryParams((...prev) => ({
      ...prev,
      startDate: moment(week).toDate(),
      endDate: moment(week).add(6, 'days').toDate(),
    }));
    setNewToday(moment(week));
  }

  function handleDateChange(newDate: Date): void {
    setVisibleAppointment(
      upcomingAppointment.filter(({ slot: { date } }) =>
        moment(date).isSame(moment(newDate), 'day'),
      ),
    );
  }
  return (
    <div className="flex w-full max-w-sm flex-col gap-7 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-8">
        <p className="text-xl leading-5 font-bold">Upcoming Appointments</p>
        <WeekPicker weekChange={handleWeekChange} dateChange={handleDateChange} />
      </div>
      <hr />
      <div className="flex min-h-[144px] flex-col items-center justify-center gap-4">
        {isLoading && <Loader2 className="animate-spin" size={32} />}
        {visibleAppointment && visibleAppointment.length === 0 && !isLoading && (
          <p className="text-sm text-gray-500">No upcoming appointments</p>
        )}
        {visibleAppointment &&
          visibleAppointment.map(({ doctor, id, slot: { startTime, endTime } }) => (
            <div
              key={id}
              className="flex w-full flex-col gap-4 rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-row gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-400">
                  <Image
                    className="h-full w-full rounded-full"
                    src={doctor.profilePicture}
                    width={40}
                    height={40}
                    alt="profile"
                  />
                </div>
                <div className="flex w-full flex-col justify-center">
                  <p className="text-sm font-bold">
                    Dr {doctor?.firstName} {doctor?.lastName}{' '}
                  </p>
                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      {doctor?.specializations
                        ? doctor?.specializations[0]
                        : 'General Practitioner'}
                    </p>
                  </div>
                </div>
              </div>
              <hr />
              <div className="flex flex-row items-center justify-between">
                <div className="bg-success-50 text-primary flex w-fit flex-row items-center gap-1 rounded-full px-4 py-2">
                  <div className="bg-primary h-[5px] w-[5px] rounded-full"></div>
                  <p className="text-xs font-medium">Accepted</p>
                </div>
                <p className="text-xs font-medium text-gray-500">
                  {moment(startTime).format('hh:mm A')} - {moment(endTime).format('hh:mm A')}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UpcomingAppointmentCard;

const getWeekDays = (referenceDate: Date): { day: number; weekday: string; fullDate: Date }[] => {
  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() - referenceDate.getDay());

  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      day: date.getDate(),
      weekday: shortDaysOfTheWeek[date.getDay()],
      fullDate: date,
    };
  });
};

const getStartOfWeek = (date: Date): Date => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

const isSameDate = (a: Date, b: Date): boolean =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

type WeekPickerProps = {
  dateChange: (date: Date) => void;
  weekChange: (date: Date) => void;
};
const WeekPicker = ({ dateChange, weekChange }: WeekPickerProps): JSX.Element => {
  const [referenceDate, setReferenceDate] = useState(getStartOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekDays = useMemo(() => getWeekDays(referenceDate), [referenceDate]);

  const currentMonth = referenceDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const goToPrevWeek = (): void => {
    const prevWeek = new Date(referenceDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setReferenceDate(getStartOfWeek(prevWeek));
    weekChange(getStartOfWeek(prevWeek));
    handleDaySelect(getStartOfWeek(prevWeek));
  };

  const goToNextWeek = (): void => {
    const nextWeek = new Date(referenceDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setReferenceDate(getStartOfWeek(nextWeek));
    weekChange(getStartOfWeek(nextWeek));
    handleDaySelect(getStartOfWeek(nextWeek));
  };

  const handleDaySelect = (date: Date): void => {
    setSelectedDate(date);
    dateChange(date);
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400">{getCurrentTimeInGMT()}</p>
        <div className="flex flex-row items-center justify-between">
          <p className="text-xl leading-5 font-bold">{currentMonth}</p>
          <div className="flex flex-row items-center gap-4">
            <button onClick={goToPrevWeek} className="flex h-6 w-6 items-center justify-center">
              <ChevronLeft size={20} />
            </button>
            <button onClick={goToNextWeek} className="flex h-6 w-6 items-center justify-center">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center gap-4">
        {weekDays.map(({ day, weekday, fullDate }) => {
          const isToday = isSameDate(fullDate, new Date());
          const isSelected = selectedDate && isSameDate(fullDate, selectedDate);

          return (
            <div
              key={fullDate.toISOString()}
              className="flex cursor-pointer flex-col items-center gap-2.5"
              onClick={() => handleDaySelect(fullDate)}
            >
              <div
                className={cn(
                  'flex h-12 w-[38px] items-center justify-center rounded-full text-sm font-medium transition-all',
                  isSelected
                    ? 'bg-primary text-white'
                    : isToday
                      ? 'bg-gray-200 text-black'
                      : 'bg-gray-100 text-gray-400',
                )}
              >
                {day}
              </div>
              <p
                className={cn(
                  'text-sm leading-[14px] font-medium',
                  isSelected ? 'text-primary-dark' : isToday ? 'text-black' : 'text-gray-400',
                )}
              >
                {weekday}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { WeekPicker };

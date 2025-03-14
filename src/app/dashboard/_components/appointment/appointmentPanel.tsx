'use client';
import React, { JSX, useEffect, useState } from 'react';
import DateSelector from './dateSelector';
import AppointmentCalendar from './appointmentCalendar';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import { AppointmentStatus, VisitType } from '@/types/shared.enum';
import { cn } from '@/lib/utils';
import { IQueryParams } from '@/types/shared.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';
import { getAppointment } from '@/lib/features/appointments/appointmentsThunk';

type AppointmentProps = {
  customClass?: string;
};
const AppointmentPanel = ({ customClass = '' }: AppointmentProps): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const user = useAppSelector(selectUser);
  //Todo: Remove them, they were used for testing purposes
  const today = new Date();
  const today1 = new Date(2024, 11, 29);
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0);
  const startDate1 = new Date(today.getFullYear(), today.getMonth(), today1.getDate(), 2, 0, 0);
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0, 0);
  const endDate1 = new Date(today.getFullYear(), today.getMonth(), today1.getDate(), 5, 0, 0);

  const dispatch = useAppDispatch();
  const [queryParams, setQueryParams] = useState<IQueryParams<''>>({
    doctorId: user?.id,
    startDate: today,
    endDate: new Date(2025, 2, 17),
  });

  useEffect(() => {
    async function getAppointments(): Promise<void> {
      const payload = await dispatch(getAppointment(queryParams));
      //Todo: remove this when working on upcoming appointments
      console.log(payload);
    }

    void getAppointments();
  }, []);

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
            3 <span className="ml-1 hidden sm:block">patients</span>
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

      <AppointmentCalendar
        className="h-[calc(100vh-356px)]"
        slots={[
          {
            id: '1',
            startDate: startDate,
            endDate: endDate,
            visitType: VisitType.Virtual,
            status: AppointmentStatus.Pending,
          },
          {
            id: '2',
            startDate: startDate1,
            endDate: endDate1,
            visitType: VisitType.Visit,
            status: AppointmentStatus.Declined,
          },
        ]}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default AppointmentPanel;

'use client';
import { getCurrentTimeInGMT, getWeekdaysOfCurrentWeek } from '@/lib/date';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX } from 'react';
import { DummyDoctorProfile } from '@/assets/images';
import { cn } from '@/lib/utils';

const UpcomingAppointmentCard = (): JSX.Element => {
  const today = new Date();
  const currentDay = today.getDate();
  const days = getWeekdaysOfCurrentWeek();

  const isLoading = false;

  // TODO: Replace mock data with live requests or data
  const upcomingAppointments = [
    {
      id: 1,
      startTime: '09:00 AM',
      endTime: '09:30 AM',
      doctor: { specializations: ['General Practitioner'], firstName: 'Tyler', lastName: 'Morgan' },
    },
  ];

  return (
    <div className="flex w-full max-w-sm flex-col gap-7 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-8">
        <p className="text-xl font-bold leading-5">Upcoming Appointments</p>
        <WeekPicker days={days} currentDay={currentDay} />
      </div>
      <hr />
      <div className="flex min-h-[144px] flex-col items-center justify-center gap-4">
        {isLoading && <Loader2 className="animate-spin" size={32} />}
        {upcomingAppointments && upcomingAppointments.length === 0 && (
          <p className="text-sm text-gray-500">No upcoming appointments</p>
        )}
        {upcomingAppointments &&
          upcomingAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-row gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-400">
                  <Image
                    className="h-full w-full rounded-full"
                    src={DummyDoctorProfile}
                    width={40}
                    height={40}
                    alt="profile"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-bold">
                    Consultation - Dr {appointment.doctor?.firstName}{' '}
                    {appointment.doctor?.lastName}{' '}
                  </p>
                  <p className="text-xs font-medium text-gray-400">
                    {appointment.doctor?.specializations
                      ? appointment.doctor?.specializations[0]
                      : 'General Practitioner'}
                  </p>
                </div>
              </div>
              <hr />
              <div className="flex flex-row items-center justify-between">
                <div className="flex w-fit flex-row items-center gap-1 rounded-full bg-success-50 px-4 py-2 text-primary">
                  <div className="h-[5px] w-[5px] rounded-full bg-primary"></div>
                  <p className="text-xs font-medium">Accepted</p>
                </div>
                <p className="text-xs font-medium text-gray-500">
                  {appointment.startTime}- {appointment.endTime}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UpcomingAppointmentCard;

const WeekPicker = ({
  days,
  currentDay,
}: {
  days: { day: number; weekday: string }[];
  currentDay: number;
}): JSX.Element => (
  <div className="flex flex-col gap-7">
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-400">{getCurrentTimeInGMT()}</p>
      <div className="flex flex-row items-center justify-between">
        <p className="text-xl font-bold leading-5">December</p>
        <div className="flex flex-row items-center gap-4">
          <button className="flex h-6 w-6 items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <button className="flex h-6 w-6 items-center justify-center">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
    <div className="flex flex-row justify-center gap-4">
      {days.map(({ day, weekday }) => (
        <div key={day} className="flex flex-col items-center gap-2.5">
          <div
            className={cn(
              'flex h-12 w-[38px] items-center justify-center rounded-full text-sm font-medium',
              day === currentDay ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400',
            )}
          >
            {day}
          </div>
          <p
            className={cn(
              'text-sm font-medium leading-[14px]',
              day === currentDay ? 'text-primaryDark' : 'text-gray-400',
            )}
          >
            {weekday}
          </p>
        </div>
      ))}
    </div>
  </div>
);

import React, { JSX, useEffect, useRef, useState } from 'react';
import AppointmentCard from './appointmentCard';
import { cn } from '@/lib/utils';
import { DAYS_IN_WEEK, DAYS_OF_WEEK, TWELVE_HOUR_SYSTEM } from '@/constants/constants';
import TimeIndicator from './timeIndicator';
import { AnimatePresence } from 'framer-motion';
import { IAppointment } from '@/types/appointment.interface';

interface AppointmentCalendarProps {
  className?: string;
  appointments: IAppointment[];
  selectedDate: Date;
}

const AppointmentCalendar = ({
  className,
  appointments,
  selectedDate,
}: AppointmentCalendarProps): JSX.Element => {
  const selectedDay = (selectedDate.getDay() + 6) % DAYS_IN_WEEK;

  const calendarRef = useRef<HTMLDivElement>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState<boolean[]>(
    new Array(appointments.length).fill(false),
  );

  useEffect(() => {
    setTimeout(() => {
      if (calendarRef.current) {
        if (selectedDay >= DAYS_OF_WEEK.indexOf('Thursday')) {
          calendarRef.current.scrollTo({
            left: calendarRef.current.scrollWidth,
            behavior: 'smooth',
          });
        } else {
          calendarRef.current.scrollTo({
            left: 0,
            behavior: 'smooth',
          });
        }
      }
    }, 500);
  }, [selectedDay]);

  return (
    <div
      ref={calendarRef}
      className={cn(
        'scrollbar-none relative flex h-[calc(100vh-220px)] flex-row overflow-scroll border-t border-gray-200',
        className,
      )}
    >
      <AnimatePresence>
        {appointments.map((appointment, index) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            handleSelectedCard={(): void => {
              setShowAppointmentDetails((prevDetails) => {
                const newDetails = prevDetails.map(() => false);
                newDetails[index] = !prevDetails[index];
                return newDetails;
              });
            }}
            showDetails={showAppointmentDetails[index]}
          />
        ))}
      </AnimatePresence>

      <div className="sticky left-0 z-10 flex h-max w-[80px] shrink-0 flex-col border-r border-gray-200 bg-white text-sm">
        <TimeIndicator />
        <div className="sticky top-0 z-11 flex h-10 w-full shrink-0 items-center justify-center border-b border-gray-200 bg-white">
          GMT
        </div>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="relative h-[90px] shrink-0">
            {i !== 0 && (
              <p className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 truncate">
                {i > TWELVE_HOUR_SYSTEM ? i - TWELVE_HOUR_SYSTEM : i}{' '}
                {i >= TWELVE_HOUR_SYSTEM ? 'PM' : 'AM'}
              </p>
            )}
          </div>
        ))}
      </div>

      {DAYS_OF_WEEK.map((day, i) => (
        <div
          key={day}
          className="flex h-max w-[260px] shrink-0 flex-col border-r border-gray-200 text-sm"
        >
          <div
            className={cn(
              'sticky top-0 z-9 flex h-10 w-full shrink-0 items-center justify-center gap-1.5 border-b border-gray-200 bg-white',
              i === selectedDay && 'border-primary-dark text-primary-dark border-b-2 font-bold',
            )}
          >
            {i === selectedDay && <div className="bg-primary-dark h-2 w-2 rounded-full"></div>}
            <p>{day}</p>
          </div>
          {Array.from({ length: 24 }).map((_, j) => (
            <div
              key={j}
              className={cn(
                'relative z-5 h-[90px] shrink-0 border-b border-gray-200 bg-gray-50',
                i === selectedDay && 'bg-primary-light',
              )}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AppointmentCalendar;

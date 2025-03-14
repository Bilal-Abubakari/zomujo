'use client';
import AppointmentPanel from '@/app/dashboard/_components/appointment/appointmentPanel';
import React, { JSX } from 'react';

const UpcomingAppointments = () : JSX.Element => (
    <div>
      <AppointmentPanel customClass="lg:w-[calc(100vw-320px)]" />
    </div>
  );

export default UpcomingAppointments;

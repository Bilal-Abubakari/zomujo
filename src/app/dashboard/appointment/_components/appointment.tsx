'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpcomingAppointments from '@/app/dashboard/appointment/_components/upcomingAppointments';
import AppointmentRequests from '@/app/dashboard/appointment/_components/appointmentRequests';
import { JSX } from 'react';
import { AppointmentView, useQueryParam } from '@/hooks/useQueryParam';
import { selectUser } from '@/lib/features/auth/authSelector';
import { useAppSelector } from '@/lib/hooks';
import { selectUserRole } from '@/lib/features/auth/authSelector';
import { Role } from '@/types/shared.enum';

const Appointment = (): JSX.Element => {
  const { updateQuery, getQueryParam } = useQueryParam();
  const role = useAppSelector(selectUserRole);

  if (role === Role.SuperAdmin) {
    return (
      <div>
        <p className="text-xl font-bold">Appointment</p>
        <div className="mt-6">
          <AppointmentRequests />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <Tabs value={getQueryParam('appointmentView') || AppointmentView.Upcoming} className="mt-2">
          <div className="flex items-center">
            <p className="text-xl font-bold">Appointments</p>
            <div className="m-auto">
              <TabsList>
                <TabsTrigger
                  value={AppointmentView.Upcoming}
                  className="rounded-2xl"
                  onClick={() => updateQuery('appointmentView', AppointmentView.Upcoming)}
                >
                  My Calendar
                </TabsTrigger>
                <TabsTrigger
                  value={AppointmentView.Requests}
                  className="rounded-2xl"
                  onClick={() => updateQuery('appointmentView', AppointmentView.Requests)}
                >
                  Appointment Requests
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          {(getQueryParam('appointmentView') || AppointmentView.Upcoming) ===
            AppointmentView.Upcoming && (
            <TabsContent
              className="mt-6"
              value={AppointmentView.Upcoming}
              forceMount={true}
              hidden={
                (getQueryParam('appointmentView') || AppointmentView.Upcoming) !==
                AppointmentView.Upcoming
              }
            >
              <UpcomingAppointments />
            </TabsContent>
          )}
          {(getQueryParam('appointmentView') || AppointmentView.Upcoming) ===
            AppointmentView.Requests && (
            <TabsContent
              value={AppointmentView.Requests}
              forceMount={true}
              hidden={
                (getQueryParam('appointmentView') || AppointmentView.Upcoming) !==
                AppointmentView.Requests
              }
              className="mt-6"
            >
              <AppointmentRequests />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Appointment;

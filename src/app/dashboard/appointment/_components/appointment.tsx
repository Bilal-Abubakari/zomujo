'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpcomingAppointments from '@/app/dashboard/appointment/_components/upcomingAppointments';
import AppointmentRequests from '@/app/dashboard/appointment/_components/appointmentRequests';
import { JSX, useEffect } from 'react';
import { AppointmentView, useQueryParam } from '@/hooks/useQueryParam';
import { selectUser } from '@/lib/features/auth/authSelector';
import { useAppSelector } from '@/lib/hooks';
import { Role } from '@/types/shared.enum';

const Appointment = (): JSX.Element => {
  const { updateQuery, getQueryParam } = useQueryParam();
  const user = useAppSelector(selectUser);
  const isAdminOrHospital = user?.role === Role.Admin || user?.role === Role.Hospital || user?.role === Role.SuperAdmin;

  useEffect(() => {
    if (!isAdminOrHospital) {
      updateQuery(
        'appointmentView',
        getQueryParam('appointmentView') === AppointmentView.Requests
          ? AppointmentView.Requests
          : AppointmentView.Upcoming,
      );
    }
  }, [isAdminOrHospital]);

  // For Admin/Hospital: Column layout with Requests
  if (isAdminOrHospital) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xl font-bold">Appointments</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <AppointmentRequests />
          </div>
        </div>
      </div>
    );
  }

  // For other roles: Keep existing tab layout
  return (
    <div>
      <div>
        <Tabs value={getQueryParam('appointmentView')} className="mt-2">
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
          {getQueryParam('appointmentView') === AppointmentView.Upcoming && (
            <TabsContent
              className="mt-6"
              value={AppointmentView.Upcoming}
              forceMount={true}
              hidden={getQueryParam('appointmentView') !== AppointmentView.Upcoming}
            >
              <UpcomingAppointments />
            </TabsContent>
          )}
          {getQueryParam('appointmentView') === AppointmentView.Requests && (
            <TabsContent
              value={AppointmentView.Requests}
              forceMount={true}
              hidden={getQueryParam('appointmentView') !== AppointmentView.Requests}
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

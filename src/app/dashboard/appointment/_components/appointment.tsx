'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpcomingAppointments from '@/app/dashboard/appointment/_components/upcomingAppointments';
import AppointmentRequests from '@/app/dashboard/appointment/_components/appointmentRequests';
import { JSX, useEffect } from 'react';
import { AppointmentView, useQueryParam } from '@/hooks/useQueryParam';

const Appointment = (): JSX.Element => {
  const { updateQuery, getQueryParam } = useQueryParam();

  useEffect(() => {
    updateQuery(
      'appointmentView',
      getQueryParam('appointmentView') === AppointmentView.Requests
        ? AppointmentView.Requests
        : AppointmentView.Upcoming,
    );
  }, []);
  return (
    <div>
      <div>
        <Tabs value={getQueryParam('appointmentView')} className="mt-2">
          <div className="flex items-center">
            <p className="text-xl font-bold">Appointment</p>
            <div className="m-auto">
              <TabsList>
                <TabsTrigger
                  value={AppointmentView.Upcoming}
                  className="rounded-2xl"
                  onClick={() => updateQuery('appointmentView', AppointmentView.Upcoming)}
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value={AppointmentView.Requests}
                  className="rounded-2xl"
                  onClick={() => updateQuery('appointmentView', AppointmentView.Requests)}
                >
                  Request
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

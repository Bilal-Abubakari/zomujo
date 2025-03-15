import UpcomingAppointments from './_components/upcomingAppointments';
import AppointmentRequests from './_components/appointmentRequests';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JSX } from 'react';

const page = (): JSX.Element => (
  <div>
    <div>
      <Tabs defaultValue="upcomingAppointments" className="mt-2">
        <div className="flex items-center">
          <p className="text-xl font-bold">Appointment</p>
          <div className="m-auto">
            <TabsList>
              <TabsTrigger value="upcomingAppointments" className="rounded-2xl">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="requests" className="rounded-2xl">
                Request
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabsContent className="mt-6" value="upcomingAppointments">
          <UpcomingAppointments />
        </TabsContent>
        <TabsContent className="mt-6" value="requests">
          <AppointmentRequests />
        </TabsContent>
      </Tabs>
    </div>
  </div>
);

export default page;

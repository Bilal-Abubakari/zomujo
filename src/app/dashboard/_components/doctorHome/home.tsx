import React, { JSX } from 'react';
import dynamic from 'next/dynamic';
import { AvatarGreetings } from '../avatarGreetings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const AppointmentPanel = dynamic(() => import('../appointment/appointmentPanel'), {
  loading: () => <LoadingFallback />,
  ssr: false,
});
const AppointmentRequestPanel = dynamic(() => import('../appointment/appointmentRequestPanel'), {
  loading: () => <LoadingFallback />,
  ssr: false,
});
const ManagedClientsPanel = dynamic(() => import('../appointment/managedClientsPanel'), {
  loading: () => <LoadingFallback />,
  ssr: false,
});

const LoadingFallback = (): JSX.Element => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin" size={24} />
  </div>
);

const DoctorHome = (): JSX.Element => (
  <div>
    <AvatarGreetings />
    <div className="flex w-full items-center justify-center md:hidden">
      <Tabs defaultValue="appointment" className="w-full text-center text-sm md:hidden">
        <TabsList>
          <TabsTrigger value="appointment">Appointment</TabsTrigger>
          <TabsTrigger value="upcomingAppointments">Appointment Request</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-6" value="appointment">
          <AppointmentPanel />
        </TabsContent>
        <TabsContent className="mt-6" value="upcomingAppointments">
          <AppointmentRequestPanel />
        </TabsContent>
      </Tabs>
    </div>
    <div className="hidden w-full flex-row gap-4 md:flex">
      <AppointmentPanel />
      <AppointmentRequestPanel />
    </div>
    <ManagedClientsPanel />
  </div>
);

export default DoctorHome;

import React, { JSX, lazy, Suspense } from 'react';
import { AvatarGreetings } from '../avatarGreetings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const AppointmentPanel = lazy(() => import('../appointment/appointmentPanel'));
const AppointmentRequestPanel = lazy(() => import('../appointment/appointmentRequestPanel'));
const ManagedClientsPanel = lazy(() => import('../appointment/managedClientsPanel'));

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
          <Suspense fallback={<LoadingFallback />}>
            <AppointmentPanel />
          </Suspense>
        </TabsContent>
        <TabsContent className="mt-6" value="upcomingAppointments">
          <Suspense fallback={<LoadingFallback />}>
            <AppointmentRequestPanel />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
    <div className="hidden w-full flex-row gap-4 md:flex">
      <Suspense fallback={<LoadingFallback />}>
        <AppointmentPanel />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <AppointmentRequestPanel />
      </Suspense>
    </div>
    <Suspense fallback={<LoadingFallback />}>
      <ManagedClientsPanel />
    </Suspense>
  </div>
);

export default DoctorHome;

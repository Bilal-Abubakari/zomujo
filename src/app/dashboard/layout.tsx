'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { JSX, ReactNode, useState } from 'react';
import { PhoneNavbar, SidebarLayout } from './_components/sidebar/sidebarLayout';
import Toolbar from '@/app/dashboard/_components/toolbar';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectMustUpdatePassword } from '@/lib/features/auth/authSelector';
import { DashboardProvider } from '@/app/dashboard/_components/dashboardProvider';
import { Modal } from '@/components/ui/dialog';
import UpdatePassword from '@/app/dashboard/_components/updatePassword';
import useWebSocket from '@/hooks/useWebSocket';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { acceptAppointment } from '@/lib/features/appointments/appointmentsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { INotification, NotificationEvent } from '@/types/notification.interface';
import { IAppointment } from '@/types/appointment.interface';
import moment from 'moment';

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  const { on, updateNotificationsHandler } = useWebSocket();
  const mustUpdatePassword = useAppSelector(selectMustUpdatePassword);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [appointment, setAppointment] = useState<IAppointment>();

  const handleAccept = async (id: string): Promise<void> => {
    setIsLoading(true);
    const { payload } = await dispatch(acceptAppointment(id));
    toast(payload as Toast);
    setIsLoading(false);
    setShowNewRequest(false);
  };

  on(NotificationEvent.NewRequest, (data: unknown) => {
    const notification = data as INotification;
    setAppointment(notification.payload.appointment);
    updateNotificationsHandler(notification);
    setShowNewRequest(true);
  });

  return (
    <>
      <Modal className="max-w-xl" open={mustUpdatePassword} content={<UpdatePassword />} />
      <DashboardProvider>
        <SidebarProvider>
          <SidebarLayout />
          <PhoneNavbar />
          <main className="bg-grayscale-100 me:border w-full px-1 2xl:px-6">
            <Toolbar />
            {children}
          </main>
        </SidebarProvider>
      </DashboardProvider>
      <Drawer open={showNewRequest}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-4">
            <DrawerHeader>
              <DrawerTitle className="text-lg">New Appointment Request</DrawerTitle>
              <DrawerDescription>
                Review the details of the new appointment request below.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <div className="mb-4">
                <div className="text-muted-foreground text-sm">Patient Name:</div>
                <div>
                  {appointment?.patient.firstName} {appointment?.patient.lastName}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-muted-foreground text-sm">Appointment Date & Time:</div>
                <div>{moment(appointment?.slot.date).format('LL')}</div>
              </div>
              <div className="mb-4">
                <div className="text-muted-foreground text-sm">Appointment Time:</div>
                <div>{moment(appointment?.slot.startTime).format('hh:mm A')}</div>
              </div>
              <div className="mb-4">
                <div className="text-muted-foreground text-sm">Reason for Request:</div>
                <div>{appointment?.reason}</div>
              </div>
              <div className="mb-4">
                <div className="text-muted-foreground text-sm">Additional Information:</div>
                <div>{appointment?.additionalInfo}</div>
              </div>
            </div>
            <DrawerFooter className="flex justify-between">
              <Button
                onClick={() => handleAccept(String(appointment?.id))}
                child="Accept"
                disabled={isLoading}
                isLoading={isLoading}
              />
              <Button
                variant="outline"
                onClick={() => handleAccept(String(appointment?.id))} // TODO: Handle decline request
                child="Decline"
                disabled={isLoading}
                isLoading={isLoading}
              />
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

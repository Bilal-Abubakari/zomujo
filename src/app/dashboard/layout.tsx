'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { JSX, ReactNode } from 'react';
import { SidebarLayout } from './_components/sidebar/sidebarLayout';
import Toolbar from '@/app/dashboard/_components/toolbar';
import { useAppSelector } from '@/lib/hooks';
import {
  selectMustUpdatePassword,
  selectPatientMustUpdateMandatoryInfo,
} from '@/lib/features/auth/authSelector';
import { DashboardProvider } from '@/app/dashboard/_components/dashboardProvider';
import { Modal } from '@/components/ui/dialog';
import UpdatePassword from '@/app/dashboard/_components/updatePassword';
import NotificationActions from '@/app/dashboard/_components/notificationActions';
import UpdatePatientInfo from '@/app/dashboard/(patient)/_components/updatePatientInfo';

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  const mustUpdatePassword = useAppSelector(selectMustUpdatePassword);
  const patientMustUpdateMandatoryInfo = useAppSelector(selectPatientMustUpdateMandatoryInfo);

  return (
    <>
      <Modal open={patientMustUpdateMandatoryInfo} content={<UpdatePatientInfo />} />
      <Modal className="max-w-xl" open={mustUpdatePassword} content={<UpdatePassword />} />
      <DashboardProvider>
        <SidebarProvider>
          <SidebarLayout />
          <main className="bg-grayscale-100 me:border flex h-screen flex-1 flex-col overflow-hidden px-4 2xl:px-6">
            <Toolbar />
            <div className="flex-1 overflow-auto">{children}</div>
          </main>
        </SidebarProvider>
      </DashboardProvider>
      <NotificationActions />
    </>
  );
}

'use client';

import { useAppSelector } from '@/lib/hooks';
import { selectUserRole } from '@/lib/features/auth/authSelector';
import { Role } from '@/types/shared.enum';
import { JSX, lazy, Suspense } from 'react';

const PatientHome = lazy(() => import('@/app/dashboard/_components/patientHome/home'));
const DoctorHome = lazy(() => import('@/app/dashboard/_components/doctorHome/home'));
const AdminHome = lazy(() => import('@/app/dashboard/_components/adminHome/home'));

const Dashboard = (): JSX.Element => {
  const role = useAppSelector(selectUserRole);

  const home: Record<Role, JSX.Element> = {
    [Role.Doctor]: <DoctorHome />,
    [Role.Patient]: <PatientHome />,
    [Role.Admin]: <AdminHome />,
    [Role.SuperAdmin]: <AdminHome />,
  };

  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      {home[role!]}
    </Suspense>
  );
};

export default Dashboard;

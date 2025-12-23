'use client';

import { useAppSelector } from '@/lib/hooks';
import { selectUserRole } from '@/lib/features/auth/authSelector';
import { Role } from '@/types/shared.enum';
import { JSX } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const PatientHome = dynamic(() => import('@/app/dashboard/_components/patientHome/home'), {
  loading: () => <DashboardFallback />,
  ssr: false,
});
const DoctorHome = dynamic(() => import('@/app/dashboard/_components/doctorHome/home'), {
  loading: () => <DashboardFallback />,
  ssr: false,
});
const AdminHome = dynamic(() => import('@/app/dashboard/_components/adminHome/home'), {
  loading: () => <DashboardFallback />,
  ssr: false,
});
const HospitalHome = dynamic(() => import('@/app/dashboard/_components/hospitalHome/home'), {
  loading: () => <DashboardFallback />,
  ssr: false,
});

const DashboardFallback = (): JSX.Element => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="animate-spin" size={32} />
  </div>
);

const Dashboard = (): JSX.Element => {
  const role = useAppSelector(selectUserRole);

  const home: Record<Role, JSX.Element> = {
    [Role.Doctor]: <DoctorHome />,
    [Role.Patient]: <PatientHome />,
    [Role.Admin]: <AdminHome />,
    [Role.SuperAdmin]: <AdminHome />,
    [Role.Hospital]: <HospitalHome />,
  };

  return home[role!];
};

export default Dashboard;

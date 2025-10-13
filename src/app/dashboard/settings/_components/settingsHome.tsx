'use client';

import { useAppSelector } from '@/lib/hooks';
import { selectUserRole } from '@/lib/features/auth/authSelector';
import { Role } from '@/types/shared.enum';
import { JSX } from 'react';
import PersonalInfo from '@/app/dashboard/settings/_components/personalInfo';
import HospitalSettings from '@/app/dashboard/settings/_components/hospitalSettings';
import PatientInfo from './patientInfo';

const SettingsHome = (): JSX.Element => {
  const role = useAppSelector(selectUserRole);

  const home: Record<Role, JSX.Element> = {
    [Role.Doctor]: <PersonalInfo />,
    [Role.Patient]: <PatientInfo />,
    [Role.Admin]: <HospitalSettings />,
    [Role.SuperAdmin]: <>Yet to be implemented</>,
  };

  return <>{home[role!]}</>;
};

export default SettingsHome;

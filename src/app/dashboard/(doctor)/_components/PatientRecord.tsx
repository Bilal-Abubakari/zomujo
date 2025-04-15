'use client';
import { JSX } from 'react';
import { Button } from '@/components/ui/button';
import PatientCard from '@/app/dashboard/_components/patient/patientCard';
import PatientVitalsCard from '@/app/dashboard/_components/patient/patientVitalsCard';
import PatientConditionsCard from '@/app/dashboard/_components/patient/patientConditionsCard';
import PatientSurgeriesCard from '@/app/dashboard/_components/patient/patientSurgeriesCard';
import { useAppSelector } from '@/lib/hooks';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';
import PatientFamilyMembersCard from '@/app/dashboard/_components/patient/PatientFamilyMembersCard';

const PatientOverview = (): JSX.Element => {
  const recordId = useAppSelector(selectRecordId);
  return (
    <div>
      <div className="mb-6 flex justify-between">
        <span className="self-center text-xl font-bold">Patient Overview</span>
        <div className="space-x-3">
          <Button child="Refer to Specialist" variant="secondary" />
          <Button child="Start Consultation" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-4">
          <PatientCard />
          <PatientSurgeriesCard recordId={recordId} />
        </div>
        <div className="space-y-4">
          <PatientVitalsCard />
          <PatientFamilyMembersCard />
        </div>
        <div>
          <PatientConditionsCard recordId={recordId} />
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;

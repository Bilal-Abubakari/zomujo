'use client';
import { JSX } from 'react';
import { Button } from '@/components/ui/button';
import PatientCard from '@/app/dashboard/_components/patient/patientCard';
import PatientVitalsCard from '@/app/dashboard/_components/patient/patientVitalsCard';

const PatientOverview = (): JSX.Element => (
  <div>
    <div className="mb-6 flex justify-between">
      <span className="self-center text-xl font-bold">Patient Overview</span>
      <div className="space-x-3">
        <Button child="Refer to Specialist" variant="secondary" />
        <Button child="Start Consultation" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <PatientCard />
      </div>
      <div>
        <PatientVitalsCard />
      </div>
    </div>
  </div>
);

export default PatientOverview;

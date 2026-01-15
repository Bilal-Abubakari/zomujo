import React, { JSX } from 'react';
import { Separator } from '@/components/ui/separator';
import { ChiefComplaintsCard } from './ChiefComplaintsCard';
import { SymptomsCard } from './SymptomsCard';
import { MedicationsTakenCard } from './MedicationsTakenCard';
import { LabTestsCard } from './LabTestsCard';
import { RadiologyTestsCard } from './RadiologyTestsCard';
import { DiagnosisCard } from './DiagnosisCard';
import { IAppointment } from '@/types/appointment.interface';
import { ILab } from '@/types/labs.interface';
import { IRadiology } from '@/types/radiology.interface';
import { IDiagnosis } from '@/types/medical.interface';
import { SymptomsType } from '@/types/consultation.interface';

interface CardsViewProps {
  appointment: IAppointment | null | undefined;
  complaints: string[] | undefined;
  symptoms:
    | {
        [key in SymptomsType]?: Array<{ name: string; notes?: string }>;
      }
    | undefined;
  requestedLabs: ILab[] | undefined;
  conductedLabs: ILab[] | undefined;
  radiology: IRadiology | undefined;
  requestedRadiology: IRadiology | null;
  conductedRadiology: IRadiology | null;
  diagnoses: IDiagnosis[];
  doctorName: string;
}

export const CardsView = ({
  appointment,
  complaints,
  symptoms,
  requestedLabs,
  conductedLabs,
  radiology,
  requestedRadiology,
  conductedRadiology,
  diagnoses,
  doctorName,
}: CardsViewProps): JSX.Element => (
  <>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Column */}
      <div className="space-y-6">
        <ChiefComplaintsCard complaints={complaints} appointment={appointment} />
        <SymptomsCard symptoms={symptoms} />
        <MedicationsTakenCard medicinesTaken={appointment?.symptoms?.medicinesTaken} />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <LabTestsCard requestedLabs={requestedLabs} conductedLabs={conductedLabs} />
        <RadiologyTestsCard
          radiology={radiology}
          requestedRadiology={requestedRadiology}
          conductedRadiology={conductedRadiology}
        />
        <DiagnosisCard diagnoses={diagnoses} doctorName={doctorName} />
      </div>
    </div>

    <Separator className="my-6" />
  </>
);

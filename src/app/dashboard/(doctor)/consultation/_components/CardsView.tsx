import React, { JSX } from 'react';
import { Separator } from '@/components/ui/separator';
import { ChiefComplaintsCard } from './ChiefComplaintsCard';
import { SymptomsCard } from './SymptomsCard';
import { HistoryNotesCard } from './HistoryNotesCard';
import { MedicationsTakenCard } from './MedicationsTakenCard';
import { LabTestsCard } from './LabTestsCard';
import { RadiologyTestsCard } from './RadiologyTestsCard';
import { PrescriptionsCard } from './PrescriptionsCard';
import { ReferralsCard } from './ReferralsCard';
import { IAppointment } from '@/types/appointment.interface';
import { ILaboratoryRequest } from '@/types/labs.interface';
import { IRadiology } from '@/types/radiology.interface';
import { IPrescription } from '@/types/medical.interface';
import { IPatientSymptomMap, IReferral } from '@/types/consultation.interface';

interface CardsViewProps {
  appointment: IAppointment | null | undefined;
  complaints: string[] | undefined;
  symptoms?: IPatientSymptomMap;
  historyNotes?: string;
  requestedLabs: ILaboratoryRequest[] | undefined;
  conductedLabs: ILaboratoryRequest[] | undefined;
  radiology: IRadiology | undefined;
  prescriptions: IPrescription[];
  referrals: IReferral[];
  onRemoveReferral?: (index: number) => void;
  labInstructions?: string;
  labClinicalHistory?: string;
}

export const CardsView = ({
  appointment,
  complaints,
  symptoms,
  historyNotes,
  requestedLabs,
  conductedLabs,
  radiology,
  prescriptions,
  referrals,
  onRemoveReferral,
  labInstructions,
  labClinicalHistory,
}: CardsViewProps): JSX.Element => (
  <>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Column */}
      <div className="space-y-6">
        {historyNotes ? (
          <HistoryNotesCard historyNotes={historyNotes} />
        ) : (
          <>
            <ChiefComplaintsCard complaints={complaints} appointment={appointment} />
            <SymptomsCard symptoms={symptoms} />
          </>
        )}
        <MedicationsTakenCard medicinesTaken={appointment?.symptoms?.medicinesTaken} />
        <PrescriptionsCard prescriptions={prescriptions} />
        {/* DiagnosisCard hidden - Impression is now part of Assessment in History Notes */}
        {/* <DiagnosisCard diagnoses={diagnoses} doctorName={doctorName} /> */}
        <ReferralsCard referrals={referrals} onRemove={onRemoveReferral} />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <LabTestsCard
          requestedLabs={requestedLabs}
          conductedLabs={conductedLabs}
          clinicalHistory={labClinicalHistory}
          instruction={labInstructions}
        />
        <RadiologyTestsCard radiology={radiology} />
      </div>
    </div>

    <Separator className="my-6" />
  </>
);

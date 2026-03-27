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
import { PostInvestigationCard } from './PostInvestigationCard';
import { IAppointment, IPostInvestigationData } from '@/types/appointment.interface';
import { ILaboratoryRequest } from '@/types/labs.interface';
import { IRadiology } from '@/types/radiology.interface';
import { IPrescription } from '@/types/medical.interface';
import {
  IExternalReferralRequest,
  IInternalReferralResponse,
  IPatientSymptomMap,
  IReferral,
} from '@/types/consultation.interface';

interface CardsViewProps {
  appointment: IAppointment | null | undefined;
  complaints: string[] | undefined;
  symptoms?: IPatientSymptomMap;
  historyNotes?: string;
  requestedLabs: ILaboratoryRequest[] | undefined;
  radiology: IRadiology | undefined;
  prescriptions: IPrescription[];
  referrals: IReferral[];
  onRemoveReferral?: (index: number) => void;
  savedExternalReferral?: IExternalReferralRequest | null;
  savedInternalReferral?: IInternalReferralResponse | null;
  labInstructions?: string;
  labClinicalHistory?: string;
  labFileUrls?: string[];
  postInvestigationData?: IPostInvestigationData | null;
}

export const CardsView = ({
  appointment,
  complaints,
  symptoms,
  historyNotes,
  requestedLabs,
  radiology,
  prescriptions,
  referrals,
  onRemoveReferral,
  savedExternalReferral,
  savedInternalReferral,
  labInstructions,
  labClinicalHistory,
  labFileUrls,
  postInvestigationData,
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
        {postInvestigationData && (
          <PostInvestigationCard postInvestigationData={postInvestigationData} />
        )}
        <MedicationsTakenCard medicinesTaken={appointment?.symptoms?.medicinesTaken} />
        <PrescriptionsCard prescriptions={prescriptions} />
        <ReferralsCard
          referrals={referrals}
          onRemove={onRemoveReferral}
          savedExternalReferral={savedExternalReferral}
          savedInternalReferral={savedInternalReferral}
        />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <LabTestsCard
          requestedLabs={requestedLabs}
          clinicalHistory={labClinicalHistory}
          instruction={labInstructions}
          uploadedFiles={labFileUrls}
        />
        <RadiologyTestsCard radiology={radiology} />
      </div>
    </div>

    <Separator className="my-6" />
  </>
);
